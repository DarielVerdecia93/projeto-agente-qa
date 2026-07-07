import { CLASSIFY_DEMAND_PROMPT } from "../prompts.js";
import { classificationSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function classifyDemand(state: AgentState): Promise<AgentStateUpdate> {
  const classification = await callStructured(
    CLASSIFY_DEMAND_PROMPT,
    { demanda: state.rawInput },
    classificationSchema
  );

  return { classification };
}
