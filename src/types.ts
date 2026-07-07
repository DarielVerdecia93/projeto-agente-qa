export const INPUT_TYPES = [
  "historia-usuario",
  "tarefa-tecnica",
  "bug",
  "deploy",
  "alteracao-api",
  "mudanca-banco-dados",
  "ajuste-configuracao",
  "texto-livre",
] as const;

export type InputType = (typeof INPUT_TYPES)[number];

export interface Classification {
  inputType: InputType;
  confidence: number;
  justification: string;
}

export interface ExtractedInfo {
  resumoTecnico: string;
  componentesAfetados: string[];
  entidadesNegocio: string[];
  criteriosMencionados: string[];
}

export const RISK_CATEGORIES = ["tecnico", "negocio"] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const RISK_SEVERITIES = ["baixa", "media", "alta", "critica"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export interface Risk {
  descricao: string;
  categoria: RiskCategory;
  severidade: RiskSeverity;
}

export const SCENARIO_TYPES = [
  "funcional",
  "unitario",
  "integracao",
  "nao-funcional",
] as const;
export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export interface TestScenario {
  titulo: string;
  tipo: ScenarioType;
  passos: string[];
  resultadoEsperado: string;
  evidenciaSugerida?: string;
}

export interface TestStrategy {
  categoriasAplicaveis: ScenarioType[];
  justificativa: string;
}

export interface ConsistencyReview {
  consistente: boolean;
  problemas: string[];
}
