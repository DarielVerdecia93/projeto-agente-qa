import { GENERATE_SCENARIOS_PROMPT } from "../prompts.js";
import { scenariosSchema } from "../schemas.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function generateScenarios(state: AgentState): Promise<AgentStateUpdate> {
  const result = await callStructured(
    GENERATE_SCENARIOS_PROMPT,
    {
      demanda: state.rawInput,
      classificacao: state.classification,
      informacoesExtraidas: state.extractedInfo,
      premissas: state.assumptions,
      informacoesFaltantes: state.missingInfo,
      riscos: state.risks,
      estrategiaDeTestes: state.testStrategy,
      problemasApontadosNaRevisaoAnterior: state.consistencyReview?.problemas ?? [],
    },
    scenariosSchema
  );

  return {
    generatedScenarios: result.scenarios,
    validationChecklist: result.validationChecklist,
    recommendations: result.recommendations,
  };
}
