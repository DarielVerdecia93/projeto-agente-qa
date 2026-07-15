import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAnalysisTools, pickAnalysisTool } from "./analysis-tools.js";

const context = { rawInput: "Demanda de exemplo para testes." };

test("buildAnalysisTools expõe as três tools de análise esperadas", () => {
  const tools = buildAnalysisTools(context);
  const names = tools.map((item) => item.name);

  assert.deepEqual(names, [
    "analisar_texto_livre",
    "analisar_alteracao_api",
    "analisar_documento_markdown",
  ]);
});

test("pickAnalysisTool retorna undefined quando o modelo não chamou nenhuma tool", () => {
  const tools = buildAnalysisTools(context);

  assert.equal(pickAnalysisTool(undefined, tools), undefined);
  assert.equal(pickAnalysisTool([], tools), undefined);
});

test("pickAnalysisTool ignora tool calls com nomes desconhecidos", () => {
  const tools = buildAnalysisTools(context);
  const picked = pickAnalysisTool([{ name: "tool_inexistente", args: {} }], tools);

  assert.equal(picked, undefined);
});

test("pickAnalysisTool resolve a primeira tool call válida e preserva os args", () => {
  const tools = buildAnalysisTools(context);
  const picked = pickAnalysisTool(
    [
      { name: "tool_inexistente", args: {} },
      { name: "analisar_alteracao_api", args: { motivoEscolha: "demanda cita endpoints" } },
      { name: "analisar_texto_livre", args: {} },
    ],
    tools
  );

  assert.ok(picked);
  assert.equal(picked.tool.name, "analisar_alteracao_api");
  assert.deepEqual(picked.args, { motivoEscolha: "demanda cita endpoints" });
});

test("pickAnalysisTool usa args vazios quando a tool call não traz argumentos", () => {
  const tools = buildAnalysisTools(context);
  const picked = pickAnalysisTool([{ name: "analisar_texto_livre" }], tools);

  assert.ok(picked);
  assert.deepEqual(picked.args, {});
});
