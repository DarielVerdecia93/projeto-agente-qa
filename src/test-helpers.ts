import type { AgentState } from "./state.js";

export function createTestState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    rawInput: "",
    insufficientReason: undefined,
    classification: undefined,
    extractedInfo: undefined,
    analysisToolUsed: undefined,
    missingInfo: [],
    assumptions: [],
    risks: [],
    testStrategy: undefined,
    generatedScenarios: [],
    validationChecklist: [],
    recommendations: [],
    consistencyReview: undefined,
    consistencyRetries: 0,
    finalOutput: undefined,
    generatePdf: false,
    pdfPath: undefined,
    ...overrides,
  };
}
