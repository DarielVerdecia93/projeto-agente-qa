import assert from "node:assert/strict";
import { test } from "node:test";
import { createTestState } from "../test-helpers.js";
import { routeAfterValidation, validateInput } from "./validate-input.js";

test("validateInput rejeita entrada vazia", async () => {
  const result = await validateInput(createTestState({ rawInput: "" }));
  assert.ok(result.insufficientReason);
});

test("validateInput rejeita entrada muito curta", async () => {
  const result = await validateInput(createTestState({ rawInput: "bug no login" }));
  assert.ok(result.insufficientReason);
});

test("validateInput aceita entrada com detalhe mínimo", async () => {
  const result = await validateInput(
    createTestState({
      rawInput: "O botão de login não responde ao clique no navegador Firefox.",
    })
  );
  assert.equal(result.insufficientReason, undefined);
});

test("routeAfterValidation direciona para o caminho correto", () => {
  assert.equal(
    routeAfterValidation(createTestState({ insufficientReason: "motivo qualquer" })),
    "insufficient"
  );
  assert.equal(routeAfterValidation(createTestState({ insufficientReason: undefined })), "sufficient");
});
