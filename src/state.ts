import { Annotation } from "@langchain/langgraph";
import type {
  Classification,
  ConsistencyReview,
  ExtractedInfo,
  Risk,
  TestScenario,
  TestStrategy,
} from "./types.js";

/**
 * Limite de novas tentativas de geração de cenários após uma revisão de
 * consistência reprovada — evita loop infinito entre "gerar cenários" e
 * "revisar consistência" descrito em docs/arquitetura/visao-geral-agente.md.
 */
export const MAX_CONSISTENCY_RETRIES = 1;

export const AgentStateAnnotation = Annotation.Root({
  rawInput: Annotation<string>,
  insufficientReason: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  classification: Annotation<Classification | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  extractedInfo: Annotation<ExtractedInfo | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  missingInfo: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  assumptions: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  risks: Annotation<Risk[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  testStrategy: Annotation<TestStrategy | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  generatedScenarios: Annotation<TestScenario[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  validationChecklist: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  recommendations: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  consistencyReview: Annotation<ConsistencyReview | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  consistencyRetries: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  finalOutput: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;
export type AgentStateUpdate = typeof AgentStateAnnotation.Update;
