import "dotenv/config";
import fs from "node:fs";
import { buildQaAgentGraph } from "./graph.js";

async function readInput(argv: string[]): Promise<string> {
  const arg = argv[2];
  if (!arg) {
    throw new Error(
      "Uso: npm run agent -- \"texto da demanda\"  (ou) npm run agent -- caminho/arquivo.txt"
    );
  }

  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
    return fs.readFileSync(arg, "utf-8");
  }

  return arg;
}

async function main(): Promise<void> {
  const rawInput = await readInput(process.argv);
  const agent = buildQaAgentGraph();

  const result = await agent.invoke({ rawInput });

  console.log(result.finalOutput ?? "Nenhuma saída gerada.");
}

main().catch((error) => {
  console.error("Erro ao executar o agente:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
