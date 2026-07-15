import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel } from "../llm.js";
import { EXTRACT_INFORMATION_PROMPT, SELECT_ANALYSIS_TOOL_PROMPT } from "../prompts.js";
import { extractedInfoSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";
import { buildAnalysisTools, pickAnalysisTool } from "../tools/analysis-tools.js";

export const FALLBACK_ANALYSIS_LABEL = "extracao-generica (fallback deterministico)";

/** Extração genérica original — garante que o pipeline nunca fica sem extração. */
async function extractWithGenericPrompt(state: AgentState): Promise<AgentStateUpdate> {
  const extractedInfo = await callStructured(
    EXTRACT_INFORMATION_PROMPT,
    { demanda: state.rawInput, classificacao: state.classification },
    extractedInfoSchema
  );

  return { extractedInfo, analysisToolUsed: FALLBACK_ANALYSIS_LABEL };
}

/**
 * Nó híbrido: o fluxo continua determinístico (este nó sempre produz
 * extractedInfo), mas a especialização da análise é decidida pelo LLM via
 * tool calling — ele escolhe entre as tools de texto livre, alteração de API
 * e documento Markdown. Se o modelo não chamar nenhuma tool válida ou a tool
 * falhar, cai no fallback genérico determinístico.
 */
export async function extractInformation(state: AgentState): Promise<AgentStateUpdate> {
  const tools = buildAnalysisTools({
    rawInput: state.rawInput,
    classification: state.classification,
  });

  try {
    const model = createChatModel().bindTools(tools);
    const response = await model.invoke([
      new SystemMessage(SELECT_ANALYSIS_TOOL_PROMPT),
      new HumanMessage(
        `## demanda\n${state.rawInput}\n\n## classificacao\n${JSON.stringify(
          state.classification,
          null,
          2
        )}`
      ),
    ]);

    const picked = pickAnalysisTool(response.tool_calls, tools);
    if (!picked) {
      return extractWithGenericPrompt(state);
    }

    const result = await picked.tool.invoke(picked.args as { motivoEscolha?: string });
    const extractedInfo = extractedInfoSchema.parse(result);

    return { extractedInfo, analysisToolUsed: picked.tool.name };
  } catch {
    return extractWithGenericPrompt(state);
  }
}
