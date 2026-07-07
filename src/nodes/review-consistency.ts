import { REVIEW_CONSISTENCY_PROMPT } from "../prompts.js";
import { consistencyReviewSchema } from "../schemas.js";
import { MAX_CONSISTENCY_RETRIES, type AgentState, type AgentStateUpdate } from "../state.js";
import { callStructured } from "../structured-call.js";

export async function reviewConsistency(state: AgentState): Promise<AgentStateUpdate> {
  const consistencyReview = await callStructured(
    REVIEW_CONSISTENCY_PROMPT,
    {
      classificacao: state.classification,
      informacoesExtraidas: state.extractedInfo,
      premissas: state.assumptions,
      informacoesFaltantes: state.missingInfo,
      riscos: state.risks,
      estrategiaDeTestes: state.testStrategy,
      cenariosGerados: state.generatedScenarios,
      checklistDeValidacao: state.validationChecklist,
      recomendacoes: state.recommendations,
    },
    consistencyReviewSchema
  );

  const retryNeeded = !consistencyReview.consistente;
  return {
    consistencyReview,
    consistencyRetries: retryNeeded ? state.consistencyRetries + 1 : state.consistencyRetries,
  };
}

export function routeAfterConsistencyReview(state: AgentState): "final" | "retry" {
  const isConsistent = state.consistencyReview?.consistente ?? true;
  if (isConsistent) return "final";
  return state.consistencyRetries <= MAX_CONSISTENCY_RETRIES ? "retry" : "final";
}
