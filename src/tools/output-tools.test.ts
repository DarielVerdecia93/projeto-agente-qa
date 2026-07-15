import assert from "node:assert/strict";
import { test } from "node:test";
import { createTestState } from "../test-helpers.js";
import { gerarRelatorioMarkdownTool } from "./output-tools.js";

test("gerarRelatorioMarkdownTool gera o relatório a partir do estado do agente", async () => {
  const state = createTestState({
    classification: {
      inputType: "alteracao-api",
      confidence: 0.95,
      justification: "A demanda descreve mudança de contrato em um endpoint.",
    },
    extractedInfo: {
      resumoTecnico: "Novo campo obrigatório no payload de criação de pedido.",
      componentesAfetados: ["api-pedidos"],
      entidadesNegocio: ["pedido"],
      criteriosMencionados: [],
    },
    risks: [
      { descricao: "Quebra de consumidores existentes", categoria: "tecnico", severidade: "alta" },
    ],
    testStrategy: { categoriasAplicaveis: ["integracao"], justificativa: "Mudança de contrato." },
    generatedScenarios: [
      {
        titulo: "Requisição sem o novo campo obrigatório",
        tipo: "integracao",
        passos: ["Preparar payload sem o campo", "Enviar POST /pedidos", "Verificar resposta 400"],
        resultadoEsperado: "A API rejeita a requisição com erro de validação",
      },
    ],
    validationChecklist: ["Validar contrato com consumidores"],
    recommendations: ["Comunicar a mudança aos times consumidores"],
  });

  const markdown = await gerarRelatorioMarkdownTool.invoke(state);

  assert.match(markdown, /# Análise de Demanda para QA/);
  assert.match(markdown, /alteracao-api/);
  assert.match(markdown, /Requisição sem o novo campo obrigatório/);
  assert.match(markdown, /\[ALTA\] Quebra de consumidores existentes/);
});

test("gerarRelatorioMarkdownTool rejeita payload com dados inválidos", async () => {
  const state = createTestState({
    risks: [
      {
        descricao: "Risco com severidade inválida",
        categoria: "tecnico",
        // @ts-expect-error valida que o schema da tool barra severidade desconhecida
        severidade: "gravissima",
      },
    ],
  });

  await assert.rejects(gerarRelatorioMarkdownTool.invoke(state));
});
