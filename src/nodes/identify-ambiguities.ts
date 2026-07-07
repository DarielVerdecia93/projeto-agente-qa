import { IDENTIFY_AMBIGUITIES_PROMPT } from "../prompts.js";
import { ambiguitiesSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function identifyAmbiguities(state: AgentState): Promise<AgentStateUpdate> {
  const result = await callStructured(
    IDENTIFY_AMBIGUITIES_PROMPT,
    {
      demanda: state.rawInput,
      classificacao: state.classification,
      informacoesExtraidas: state.extractedInfo,
    },
    ambiguitiesSchema
  );

  return { assumptions: result.assumptions, missingInfo: result.missingInfo };
}
