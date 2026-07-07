import { DEFINE_TEST_STRATEGY_PROMPT } from "../prompts.js";
import { testStrategySchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function defineTestStrategy(state: AgentState): Promise<AgentStateUpdate> {
  const testStrategy = await callStructured(
    DEFINE_TEST_STRATEGY_PROMPT,
    { classificacao: state.classification, informacoesExtraidas: state.extractedInfo },
    testStrategySchema
  );

  return { testStrategy };
}
