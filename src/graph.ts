import { END, START, StateGraph } from "@langchain/langgraph";
import { assessRisks } from "./nodes/assess-risks.js";
import { buildFinalOutput, requestMoreInfo } from "./nodes/build-final-output.js";
import { classifyDemand } from "./nodes/classify-demand.js";
import { defineTestStrategy } from "./nodes/define-test-strategy.js";
import { extractInformation } from "./nodes/extract-information.js";
import { generateScenarios } from "./nodes/generate-scenarios.js";
import { identifyAmbiguities } from "./nodes/identify-ambiguities.js";
import { receiveInput } from "./nodes/receive-input.js";
import { routeAfterConsistencyReview, reviewConsistency } from "./nodes/review-consistency.js";
import { routeAfterValidation, validateInput } from "./nodes/validate-input.js";
import { AgentStateAnnotation } from "./state.js";

export function buildQaAgentGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode("receiveInput", receiveInput)
    .addNode("validateInput", validateInput)
    .addNode("requestMoreInfo", requestMoreInfo)
    .addNode("classifyDemand", classifyDemand)
    .addNode("extractInformation", extractInformation)
    .addNode("identifyAmbiguities", identifyAmbiguities)
    .addNode("assessRisks", assessRisks)
    .addNode("defineTestStrategy", defineTestStrategy)
    .addNode("generateScenarios", generateScenarios)
    .addNode("reviewConsistency", reviewConsistency)
    .addNode("buildFinalOutput", buildFinalOutput)
    .addEdge(START, "receiveInput")
    .addEdge("receiveInput", "validateInput")
    .addConditionalEdges("validateInput", routeAfterValidation, {
      sufficient: "classifyDemand",
      insufficient: "requestMoreInfo",
    })
    .addEdge("requestMoreInfo", END)
    .addEdge("classifyDemand", "extractInformation")
    .addEdge("extractInformation", "identifyAmbiguities")
    .addEdge("identifyAmbiguities", "assessRisks")
    .addEdge("assessRisks", "defineTestStrategy")
    .addEdge("defineTestStrategy", "generateScenarios")
    .addEdge("generateScenarios", "reviewConsistency")
    .addConditionalEdges("reviewConsistency", routeAfterConsistencyReview, {
      final: "buildFinalOutput",
      retry: "generateScenarios",
    })
    .addEdge("buildFinalOutput", END);

  return graph.compile();
}

export type QaAgentGraph = ReturnType<typeof buildQaAgentGraph>;
