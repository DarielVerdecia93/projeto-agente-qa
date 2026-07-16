import assert from "node:assert/strict";
import { test } from "node:test";
import { RunnableLambda } from "@langchain/core/runnables";
import {
  GroqModelsExhaustedError,
  parseGroqRetryAfterMs,
  withNamedModelFallbacks,
} from "./llm.js";

test("parseGroqRetryAfterMs diferencia espera curta de limite diário", () => {
  assert.equal(parseGroqRetryAfterMs(new Error("Please try again in 28.9875s")), 28_988);
  assert.equal(parseGroqRetryAfterMs(new Error("Please try again in 54m46.656s")), 3_286_656);
  assert.equal(parseGroqRetryAfterMs(new Error("Please try again in 97.499ms")), 98);
  assert.equal(parseGroqRetryAfterMs(new Error("erro sem tempo")), undefined);
});

test("withNamedModelFallbacks usa o próximo modelo após falha do principal", async () => {
  const chain = withNamedModelFallbacks([
    {
      name: "principal",
      runnable: RunnableLambda.from(async () => {
        throw new Error("429 TPD esgotado");
      }),
    },
    {
      name: "fallback",
      runnable: RunnableLambda.from(async (input: string) => `fallback:${input}`),
    },
  ]);

  assert.equal(await chain.invoke("demanda"), "fallback:demanda");
});

test("withNamedModelFallbacks informa a falha de todos os modelos", async () => {
  const chain = withNamedModelFallbacks([
    {
      name: "principal",
      runnable: RunnableLambda.from(async () => {
        throw new Error("429 no principal");
      }),
    },
    {
      name: "fallback",
      runnable: RunnableLambda.from(async () => {
        throw new Error("429 no fallback");
      }),
    },
  ]);

  await assert.rejects(chain.invoke("demanda"), (error: unknown) => {
    assert.ok(error instanceof GroqModelsExhaustedError);
    assert.match(error.message, /principal: 429 no principal/);
    assert.match(error.message, /fallback: 429 no fallback/);
    assert.equal(error.attempts.length, 2);
    return true;
  });
});

test("withNamedModelFallbacks respeita esperas curtas sucessivas indicadas pela Groq", async () => {
  let calls = 0;
  const chain = withNamedModelFallbacks(
    [
      {
        name: "principal",
        runnable: RunnableLambda.from(async () => {
          calls += 1;
          if (calls <= 2) throw new Error("429 Please try again in 0.001s");
          return "recuperado";
        }),
      },
    ],
    { maxRateLimitWaitMs: 2_000 }
  );

  assert.equal(await chain.invoke("demanda"), "recuperado");
  assert.equal(calls, 3);
});
