import { ASSESS_RISKS_PROMPT } from "../prompts.js";
import { risksSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function assessRisks(state: AgentState): Promise<AgentStateUpdate> {
  const result = await callStructured(
    ASSESS_RISKS_PROMPT,
    {
      demanda: state.rawInput,
      classificacao: state.classification,
      informacoesExtraidas: state.extractedInfo,
      premissas: state.assumptions,
      informacoesFaltantes: state.missingInfo,
    },
    risksSchema
  );

  return { risks: result.risks };
}
