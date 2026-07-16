import { ChatGroq } from "@langchain/groq";
import { RunnableLambda, type Runnable } from "@langchain/core/runnables";

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_FALLBACK_MODELS = ["llama-3.1-8b-instant", "qwen/qwen3.6-27b"];
const DEFAULT_MAX_RATE_LIMIT_WAIT_SECONDS = 60;

interface ModelAttemptError {
  model: string;
  error: unknown;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function parseGroqRetryAfterMs(error: unknown): number | undefined {
  const message = errorMessage(error);
  const millisecondsMatch = message.match(/Please try again in (\d+(?:\.\d+)?)ms/i);
  if (millisecondsMatch) return Math.ceil(Number(millisecondsMatch[1]));

  const match = message.match(
    /Please try again in (?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?(?:(\d+(?:\.\d+)?)s)/i
  );
  if (!match) return undefined;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return Math.ceil((hours * 3600 + minutes * 60 + seconds) * 1000);
}

function configuredFallbackModelNames(): string[] {
  const configured = process.env.GROQ_FALLBACK_MODELS;
  if (configured) {
    const names = configured
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    if (names.length > 0) return names;
  }

  // Compatibilidade com a variável singular usada nas versões anteriores.
  if (process.env.GROQ_FALLBACK_MODEL) return [process.env.GROQ_FALLBACK_MODEL];
  return DEFAULT_FALLBACK_MODELS;
}

function configuredMaxRateLimitWaitMs(): number {
  const configured = Number(process.env.GROQ_MAX_RATE_LIMIT_WAIT_SECONDS);
  const seconds = Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_MAX_RATE_LIMIT_WAIT_SECONDS;
  return seconds * 1000;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class GroqModelsExhaustedError extends Error {
  readonly attempts: ModelAttemptError[];

  constructor(attempts: ModelAttemptError[]) {
    const details = attempts
      .map(({ model, error }) => `- ${model}: ${errorMessage(error)}`)
      .join("\n");
    super(
      "Nenhum modelo Groq configurado conseguiu concluir a chamada. " +
        "Se os erros forem 429/TPD, aguarde o horário indicado ou use outro modelo com cota " +
        `disponível.\n${details}`
    );
    this.name = "GroqModelsExhaustedError";
    this.attempts = attempts;
  }
}

export function withNamedModelFallbacks<RunInput, RunOutput>(
  models: Array<{ name: string; runnable: Runnable<RunInput, RunOutput> }>,
  options: { maxRateLimitWaitMs?: number } = {}
): Runnable<RunInput, RunOutput> {
  return RunnableLambda.from(async (input: RunInput, config) => {
    const attempts: ModelAttemptError[] = [];
    const retryable: Array<{
      name: string;
      runnable: Runnable<RunInput, RunOutput>;
      waitMs: number;
      readyAt: number;
    }> = [];
    const maxRateLimitWaitMs =
      options.maxRateLimitWaitMs ?? DEFAULT_MAX_RATE_LIMIT_WAIT_SECONDS * 1000;

    for (const { name, runnable } of models) {
      try {
        return await runnable.invoke(input, config);
      } catch (error) {
        attempts.push({ model: name, error });
        const waitMs = parseGroqRetryAfterMs(error);
        if (waitMs !== undefined && waitMs <= maxRateLimitWaitMs) {
          retryable.push({ name, runnable, waitMs, readyAt: Date.now() + waitMs });
        }
      }
    }

    const retryDeadline = Date.now() + maxRateLimitWaitMs;
    for (const candidate of retryable.sort((a, b) => a.waitMs - b.waitMs)) {
      let readyAt: number | undefined = candidate.readyAt;

      while (readyAt !== undefined && readyAt + 500 <= retryDeadline) {
        const remainingWaitMs = readyAt + 500 - Date.now();
        if (remainingWaitMs > 0) await wait(remainingWaitMs);

        try {
          return await candidate.runnable.invoke(input, config);
        } catch (error) {
          attempts.push({ model: `${candidate.name} (após espera)`, error });
          const nextWaitMs = parseGroqRetryAfterMs(error);
          readyAt = nextWaitMs === undefined ? undefined : Date.now() + nextWaitMs;
        }
      }
    }

    throw new GroqModelsExhaustedError(attempts);
  });
}

function buildChatModel(model: string): ChatGroq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY não definida. Configure o arquivo .env a partir de .env.example."
    );
  }

  return new ChatGroq({
    apiKey,
    model,
    temperature: 0,
    // A cadeia abaixo já troca de modelo. Repetir a mesma chamada sobre um
    // modelo com TPD esgotado só aumenta a latência e nunca recupera a cota.
    maxRetries: 0,
  });
}

export function createChatModel(): ChatGroq {
  return buildChatModel(process.env.GROQ_MODEL ?? DEFAULT_MODEL);
}

export function createFallbackChatModel(): ChatGroq {
  return buildChatModel(configuredFallbackModelNames()[0]);
}

/**
 * Aplica a mesma configuração (tools, structured output, etc.) ao modelo
 * principal e ao fallback. A cadeia registra a falha de cada modelo e evita o
 * comportamento padrão de relançar apenas o primeiro erro, que escondia o
 * motivo de uma eventual falha do fallback.
 */
export function withGroqFallback<RunInput, RunOutput>(
  configure: (model: ChatGroq) => Runnable<RunInput, RunOutput>
): Runnable<RunInput, RunOutput> {
  const primaryName = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  const modelNames = [primaryName, ...configuredFallbackModelNames()].filter(
    (name, index, names) => names.indexOf(name) === index
  );
  const configuredModels = modelNames.map((name) => ({
    name,
    runnable: configure(buildChatModel(name)),
  }));

  return withNamedModelFallbacks(configuredModels, {
    maxRateLimitWaitMs: configuredMaxRateLimitWaitMs(),
  });
}
