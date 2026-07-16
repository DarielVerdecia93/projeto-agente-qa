import assert from "node:assert/strict";
import { test } from "node:test";
import { consistencyReviewSchema } from "../schemas.js";
import { createTestState } from "../test-helpers.js";
import { reviewConsistency, routeAfterConsistencyReview } from "./review-consistency.js";

test("reviewConsistency reprova deterministicamente categoria aplicável sem cenários", async () => {
  const state = createTestState({
    testStrategy: {
      categoriasAplicaveis: ["funcional", "integracao"],
      justificativa: "Fluxo com regra de negócio e integração.",
    },
    generatedScenarios: Array.from({ length: 4 }, (_, index) => ({
      titulo: `Cenário funcional ${index + 1}`,
      tipo: "funcional" as const,
      passos: ["Preparar", "Executar", "Verificar"],
      resultadoEsperado: "Resultado confirmado.",
    })),
  });

  const result = await reviewConsistency(state);
  const review = consistencyReviewSchema.parse(result.consistencyReview);

  assert.equal(review.consistente, false);
  assert.equal(result.consistencyRetries, 1);
  assert.ok(review.problemas.some((problem) => problem.includes('"integracao"')));
});

test("routeAfterConsistencyReview segue para saída final quando consistente", () => {
  const state = createTestState({
    consistencyReview: { consistente: true, problemas: [] },
    consistencyRetries: 0,
  });
  assert.equal(routeAfterConsistencyReview(state), "final");
});

test("routeAfterConsistencyReview tenta novamente quando inconsistente e dentro do limite", () => {
  const state = createTestState({
    consistencyReview: { consistente: false, problemas: ["risco crítico sem cenário"] },
    consistencyRetries: 1,
  });
  assert.equal(routeAfterConsistencyReview(state), "retry");
});

test("routeAfterConsistencyReview segue para saída final após esgotar as tentativas", () => {
  const state = createTestState({
    consistencyReview: { consistente: false, problemas: ["ainda inconsistente"] },
    consistencyRetries: 2,
  });
  assert.equal(routeAfterConsistencyReview(state), "final");
});
