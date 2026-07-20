import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestScenario, TestStrategy } from "../types.js";
import {
  MIN_SCENARIOS_PER_CATEGORY,
  validateScenarioConsistency,
} from "./scenario-consistency.js";

const strategy: TestStrategy = {
  categoriasAplicaveis: ["funcional", "integracao"],
  justificativa: "O fluxo combina comportamento de negócio e comunicação entre serviços.",
};

function buildScenario(tipo: TestScenario["tipo"], index: number): TestScenario {
  return {
    titulo: `${tipo} ${index}`,
    tipo,
    passos: ["Preparar dados", "Executar ação", "Verificar resultado"],
    resultadoEsperado: "Resultado confirmado.",
  };
}

test("detecta categoria aplicável sem cenários gerados", () => {
  const scenarios = Array.from({ length: MIN_SCENARIOS_PER_CATEGORY }, (_, index) =>
    buildScenario("funcional", index + 1)
  );

  const problems = validateScenarioConsistency(strategy, scenarios);

  assert.ok(problems.some((problem) => problem.includes('"integracao"') && problem.includes("0")));
});

test("detecta cenário com menos de três passos", () => {
  const scenarios = [
    ...Array.from({ length: MIN_SCENARIOS_PER_CATEGORY }, (_, index) =>
      buildScenario("funcional", index + 1)
    ),
    ...Array.from({ length: MIN_SCENARIOS_PER_CATEGORY }, (_, index) =>
      buildScenario("integracao", index + 1)
    ),
  ];
  scenarios[0] = { ...scenarios[0], passos: ["Executar ação"] };

  const problems = validateScenarioConsistency(strategy, scenarios);

  assert.ok(problems.some((problem) => problem.includes("pelo menos 3 passos")));
});

test("aceita cobertura completa e cenários estruturados", () => {
  const scenarios = [
    ...Array.from({ length: MIN_SCENARIOS_PER_CATEGORY }, (_, index) =>
      buildScenario("funcional", index + 1)
    ),
    ...Array.from({ length: MIN_SCENARIOS_PER_CATEGORY }, (_, index) =>
      buildScenario("integracao", index + 1)
    ),
  ];

  assert.deepEqual(validateScenarioConsistency(strategy, scenarios), []);
});
