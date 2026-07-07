import assert from "node:assert/strict";
import { test } from "node:test";
import { createTestState } from "../test-helpers.js";
import { renderFinalOutputMarkdown, renderInsufficientInputMarkdown } from "./markdown.js";

test("renderInsufficientInputMarkdown inclui o motivo informado", () => {
  const markdown = renderInsufficientInputMarkdown("entrada com 5 caracteres");
  assert.match(markdown, /Entrada Insuficiente/);
  assert.match(markdown, /entrada com 5 caracteres/);
});

test("renderFinalOutputMarkdown agrupa cenários por tipo e riscos por categoria", () => {
  const state = createTestState({
    classification: {
      inputType: "bug",
      confidence: 0.9,
      justification: "Relato de comportamento incorreto no sistema.",
    },
    extractedInfo: {
      resumoTecnico: "Botão de login não responde.",
      componentesAfetados: ["tela-login"],
      entidadesNegocio: ["usuario"],
      criteriosMencionados: [],
    },
    risks: [{ descricao: "Impede acesso de usuários", categoria: "negocio", severidade: "alta" }],
    testStrategy: { categoriasAplicaveis: ["funcional"], justificativa: "Bug de UI." },
    generatedScenarios: [
      {
        titulo: "Clicar no botão de login",
        tipo: "funcional",
        passos: ["Abrir a tela de login", "Clicar no botão"],
        resultadoEsperado: "O sistema autentica o usuário",
      },
    ],
    validationChecklist: ["Confirmar em Firefox e Chrome"],
    recommendations: ["Testar também em dispositivos móveis"],
  });

  const markdown = renderFinalOutputMarkdown(state);

  assert.match(markdown, /Clicar no botão de login/);
  assert.match(markdown, /Cenários de teste funcionais/);
  assert.match(markdown, /\[ALTA\] Impede acesso de usuários/);
  assert.match(markdown, /Não aplicável a esta demanda\./);
});
