import { ChatGroq } from "@langchain/groq";
import type { Runnable } from "@langchain/core/runnables";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
// Modelo com TPM (tokens/minuto) bem maior na Groq — 30K vs. 12K do modelo
// padrão — usado como fallback automático quando o principal leva 429.
const DEFAULT_FALLBACK_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

function buildChatModel(model: string): ChatGroq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY não definida. Configure o arquivo .env a partir de .env.example."
    );
  }

  return new ChatGroq({ apiKey, model, temperature: 0 });
}

export function createChatModel(): ChatGroq {
  return buildChatModel(process.env.GROQ_MODEL ?? DEFAULT_MODEL);
}

export function createFallbackChatModel(): ChatGroq {
  return buildChatModel(process.env.GROQ_FALLBACK_MODEL ?? DEFAULT_FALLBACK_MODEL);
}

/**
 * Aplica a mesma configuração (tools, structured output, etc.) ao modelo
 * principal e ao fallback, e encadeia os dois via withFallbacks: se o
 * principal falhar (ex.: 429 por limite de tokens/minuto), a mesma chamada é
 * repetida automaticamente no fallback em vez de derrubar o nó.
 */
export function withGroqFallback<RunInput, RunOutput>(
  configure: (model: ChatGroq) => Runnable<RunInput, RunOutput>
): Runnable<RunInput, RunOutput> {
  const primary = configure(createChatModel());
  const fallback = configure(createFallbackChatModel());
  return primary.withFallbacks([fallback]);
}
