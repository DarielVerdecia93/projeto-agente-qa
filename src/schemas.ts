import { z } from "zod";
import { INPUT_TYPES, RISK_CATEGORIES, RISK_SEVERITIES, SCENARIO_TYPES } from "./types.js";

export const classificationSchema = z.object({
  inputType: z.enum(INPUT_TYPES),
  confidence: z.number().min(0).max(1),
  justification: z.string(),
});

export const extractedInfoSchema = z.object({
  resumoTecnico: z.string(),
  componentesAfetados: z.array(z.string()),
  entidadesNegocio: z.array(z.string()),
  criteriosMencionados: z.array(z.string()),
});

export const ambiguitiesSchema = z.object({
  assumptions: z.array(z.string()),
  missingInfo: z.array(z.string()),
});

export const risksSchema = z.object({
  risks: z.array(
    z.object({
      descricao: z.string(),
      categoria: z.enum(RISK_CATEGORIES),
      severidade: z.enum(RISK_SEVERITIES),
    })
  ),
});

export const testStrategySchema = z.object({
  categoriasAplicaveis: z.array(z.enum(SCENARIO_TYPES)).min(1),
  justificativa: z.string(),
});

export const scenariosSchema = z.object({
  scenarios: z.array(
    z.object({
      titulo: z.string(),
      tipo: z.enum(SCENARIO_TYPES),
      passos: z.array(z.string()).min(1),
      resultadoEsperado: z.string(),
      evidenciaSugerida: z.string().optional(),
    })
  ),
  validationChecklist: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const consistencyReviewSchema = z.object({
  consistente: z.boolean(),
  problemas: z.array(z.string()),
});

/**
 * Payload aceito pela tool de geração do relatório Markdown — o subconjunto do
 * estado do agente que o relatório final consome.
 */
export const reportDataSchema = z.object({
  classification: classificationSchema.optional(),
  extractedInfo: extractedInfoSchema.optional(),
  assumptions: z.array(z.string()),
  missingInfo: z.array(z.string()),
  risks: risksSchema.shape.risks,
  testStrategy: testStrategySchema.optional(),
  generatedScenarios: scenariosSchema.shape.scenarios,
  validationChecklist: z.array(z.string()),
  recommendations: z.array(z.string()),
  consistencyReview: consistencyReviewSchema.optional(),
});

export type ReportData = z.infer<typeof reportDataSchema>;
