import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import { buildQaAgentGraph } from "./graph.js";
import { slugify } from "./utils/slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(path.resolve(__dirname, ".."), "docs", "outputs");

function saveOutputMarkdown(rawInput: string, markdown: string): string {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const slug = slugify(rawInput.slice(0, 40)) || "demanda";
  const fileName = `${slug}-${dayjs().format("YYYY-MM-DD-HHmmss")}.md`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(outputPath, markdown, "utf-8");
  return outputPath;
}

interface CliOptions {
  rawInput: string;
  generatePdf: boolean;
}

async function readCliOptions(argv: string[]): Promise<CliOptions> {
  const args = argv.slice(2);
  const generatePdf = args.includes("--pdf");
  const arg = args.find((item) => item !== "--pdf");

  if (!arg) {
    throw new Error(
      "Uso: npm run agent -- \"texto da demanda\" [--pdf]  (ou) npm run agent -- caminho/arquivo.txt [--pdf]"
    );
  }

  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
    return { rawInput: fs.readFileSync(arg, "utf-8"), generatePdf };
  }

  return { rawInput: arg, generatePdf };
}

async function main(): Promise<void> {
  const { rawInput, generatePdf } = await readCliOptions(process.argv);
  const agent = buildQaAgentGraph();

  const result = await agent.invoke({ rawInput, generatePdf });
  const markdown = result.finalOutput ?? "Nenhuma saída gerada.";

  console.log(markdown);

  if (result.analysisToolUsed) {
    console.log(`\nTool de análise utilizada: ${result.analysisToolUsed}`);
  }

  if (result.finalOutput) {
    const savedPath = saveOutputMarkdown(rawInput, markdown);
    console.log(`Resultado salvo em: ${savedPath}`);
  }

  if (result.pdfPath) {
    console.log(`PDF gerado em: ${result.pdfPath}`);
  }
}

main().catch((error) => {
  console.error("Erro ao executar o agente:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
