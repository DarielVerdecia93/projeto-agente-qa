import type { AgentState, AgentStateUpdate } from "../state.js";

export async function receiveInput(state: AgentState): Promise<AgentStateUpdate> {
  return { rawInput: state.rawInput.trim() };
}
