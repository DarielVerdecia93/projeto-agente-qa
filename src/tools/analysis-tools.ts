import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  ANALYZE_API_CHANGE_PROMPT,
  ANALYZE_FREE_TEXT_PROMPT,
  ANALYZE_MARKDOWN_DOC_PROMPT,
} from "../prompts.js";
import { extractedInfoSchema } from "../schemas.js";
import { callStructured } from "../structured-call.js";
import type { Classification } from "../types.js";

/**
 * As tools de análise recebem a demanda por closure (contexto injetado), e não
 * como argumento da tool — evita que o LLM precise re-copiar o texto inteiro
 * na chamada, o que poderia truncar ou alterar a demanda original.
 */
export interface AnalysisContext {
  rawInput: string;
  classification?: Classification;
}

const analysisArgsSchema = z.object({
  motivoEscolha: z
    .string()
    .optional()
    .describe("Frase objetiva explicando por que esta ferramenta é a adequada para a demanda."),
});

export type AnalysisTool = ReturnType<typeof buildAnalysisTools>[number];

export function buildAnalysisTools(context: AnalysisContext) {
  const runAnalysis = (prompt: string) => async () =>
    callStructured(
      prompt,
      { demanda: context.rawInput, classificacao: context.classification },
      extractedInfoSchema
    );

  return [
    tool(runAnalysis(ANALYZE_FREE_TEXT_PROMPT), {
      name: "analisar_texto_livre",
      description:
        "Analisa demandas descritas em texto corrido, sem estrutura formal: histórias de " +
        "usuário, bugs, tarefas técnicas e descrições narrativas.",
      schema: analysisArgsSchema,
    }),
    tool(runAnalysis(ANALYZE_API_CHANGE_PROMPT), {
      name: "analisar_alteracao_api",
      description:
        "Analisa demandas de criação ou alteração de API: endpoints, contratos, payloads, " +
        "códigos de resposta, integrações e compatibilidade retroativa.",
      schema: analysisArgsSchema,
    }),
    tool(runAnalysis(ANALYZE_MARKDOWN_DOC_PROMPT), {
      name: "analisar_documento_markdown",
      description:
        "Analisa demandas fornecidas como documento estruturado em Markdown: títulos, listas, " +
        "tabelas e seções de critérios de aceite.",
      schema: analysisArgsSchema,
    }),
  ];
}

export interface PickedAnalysisTool<T extends { name: string }> {
  tool: T;
  args: Record<string, unknown>;
}

/**
 * Resolve a primeira tool call do LLM que corresponda a uma tool conhecida.
 * Retorna undefined quando o modelo não chamou nenhuma tool válida — o nó
 * chamador decide o fallback determinístico.
 */
export function pickAnalysisTool<T extends { name: string }>(
  toolCalls: Array<{ name: string; args?: Record<string, unknown> }> | undefined,
  tools: T[]
): PickedAnalysisTool<T> | undefined {
  for (const call of toolCalls ?? []) {
    const match = tools.find((candidate) => candidate.name === call.name);
    if (match) {
      return { tool: match, args: call.args ?? {} };
    }
  }
  return undefined;
}
