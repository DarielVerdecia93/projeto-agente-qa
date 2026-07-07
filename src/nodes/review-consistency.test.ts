import assert from "node:assert/strict";
import { test } from "node:test";
import { createTestState } from "../test-helpers.js";
import { routeAfterConsistencyReview } from "./review-consistency.js";

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
