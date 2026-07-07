import assert from "node:assert/strict";
import { test } from "node:test";
import { createTestState } from "../test-helpers.js";
import { receiveInput } from "./receive-input.js";

test("receiveInput remove espaços em branco nas extremidades", async () => {
  const result = await receiveInput(createTestState({ rawInput: "  texto da demanda  \n" }));
  assert.equal(result.rawInput, "texto da demanda");
});
