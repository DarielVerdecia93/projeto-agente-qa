import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import { convertMarkdownToHtml, extractReportMetadata } from "./services/markdown-to-html.service.js";
import { renderHtmlToPdf } from "./services/pdf-report.service.js";
import { buildQaReportHtml } from "./templates/qa-report.template.js";
import { slugify } from "./utils/slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "docs", "pdfs");
const PROJECT_NAME = "Agente de QA (LangGraph JS)";
const REPORT_VERSION = "1.0";

/** Garante nome de arquivo único, sem sobrescrever PDFs gerados anteriormente. */
function resolveOutputPath(sourcePath: string, timestamp: string): string {
  const slug = slugify(path.basename(sourcePath, path.extname(sourcePath)));
  const baseName = `relatorio-qa-${slug}-${timestamp}`;

  let candidate = path.join(OUTPUT_DIR, `${baseName}.pdf`);
  let suffix = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(OUTPUT_DIR, `${baseName}-${suffix}.pdf`);
    suffix += 1;
  }
  return candidate;
}

async function main(): Promise<void> {
  const inputArg = process.argv[2];
  if (!inputArg) {
    throw new Error("Uso: npm run generate:pdf -- caminho/para/arquivo.md");
  }

  if (path.extname(inputArg).toLowerCase() !== ".md") {
    throw new Error(`Extensão inválida: "${inputArg}". Apenas arquivos .md são aceitos.`);
  }

  if (!fs.existsSync(inputArg) || !fs.statSync(inputArg).isFile()) {
    throw new Error(`Arquivo não encontrado: "${inputArg}".`);
  }

  let markdown: string;
  try {
    markdown = fs.readFileSync(inputArg, "utf-8");
  } catch (error) {
    throw new Error(`Erro ao ler o arquivo "${inputArg}": ${(error as Error).message}`);
  }

  const sourceMarkdownPath = path.resolve(inputArg);
  const metadata = extractReportMetadata(markdown, path.basename(inputArg, ".md"));

  let contentHtml: string;
  try {
    contentHtml = convertMarkdownToHtml(markdown);
  } catch (error) {
    throw new Error(`Erro ao converter o Markdown para HTML: ${(error as Error).message}`);
  }

  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    throw new Error(
      `Sem permissão para criar/gravar na pasta de destino "${OUTPUT_DIR}": ${(error as Error).message}`
    );
  }

  const now = dayjs();
  const outputPdfPath = resolveOutputPath(inputArg, now.format("YYYY-MM-DD-HHmm"));

  const html = buildQaReportHtml({
    projectName: PROJECT_NAME,
    reportTitle: metadata.title,
    tipoDemanda: metadata.tipoDemanda,
    generatedAt: now.format("DD/MM/YYYY HH:mm"),
    version: REPORT_VERSION,
    sourceMarkdownPath,
    outputPdfPath,
    processedAt: now.format("DD/MM/YYYY HH:mm:ss"),
    contentHtml,
  });

  try {
    await renderHtmlToPdf(html, outputPdfPath, {
      projectName: PROJECT_NAME,
      footerDate: now.format("DD/MM/YYYY"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/EACCES|EPERM/i.test(message)) {
      throw new Error(`Sem permissão para gravar o PDF em "${outputPdfPath}": ${message}`);
    }
    throw new Error(`Erro ao gerar o PDF: ${message}`);
  }

  console.log(`PDF gerado com sucesso: ${outputPdfPath}`);
}

main().catch((error) => {
  console.error(`Falha ao gerar o relatório PDF: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
