import { renderFinalOutputMarkdown, renderInsufficientInputMarkdown } from "../format/markdown.js";
import type { AgentState, AgentStateUpdate } from "../state.js";

export async function requestMoreInfo(state: AgentState): Promise<AgentStateUpdate> {
  return {
    finalOutput: renderInsufficientInputMarkdown(
      state.insufficientReason ?? "Entrada insuficiente."
    ),
  };
}

export async function buildFinalOutput(state: AgentState): Promise<AgentStateUpdate> {
  return { finalOutput: renderFinalOutputMarkdown(state) };
}
