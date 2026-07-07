import { EXTRACT_INFORMATION_PROMPT } from "../prompts.js";
import { extractedInfoSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function extractInformation(state: AgentState): Promise<AgentStateUpdate> {
  const extractedInfo = await callStructured(
    EXTRACT_INFORMATION_PROMPT,
    { demanda: state.rawInput, classificacao: state.classification },
    extractedInfoSchema
  );

  return { extractedInfo };
}
