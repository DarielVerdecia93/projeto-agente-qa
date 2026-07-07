import type { AgentState, AgentStateUpdate } from "../state.js";

/** Limite mínimo de caracteres para considerar a entrada analisável. */
export const MIN_INPUT_LENGTH = 15;

export async function validateInput(state: AgentState): Promise<AgentStateUpdate> {
  const text = state.rawInput;

  if (!text || text.length < MIN_INPUT_LENGTH) {
    return {
      insufficientReason: `Entrada muito curta ou vazia (${text.length} caractere(s)). Forneça uma descrição com pelo menos ${MIN_INPUT_LENGTH} caracteres.`,
    };
  }

  return { insufficientReason: undefined };
}

export function routeAfterValidation(state: AgentState): "sufficient" | "insufficient" {
  return state.insufficientReason ? "insufficient" : "sufficient";
}
