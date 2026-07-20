import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tool } from "@langchain/core/tools";
import dayjs from "dayjs";
import { z } from "zod";
import { renderFinalOutputMarkdown } from "../format/markdown.js";
import { reportDataSchema } from "../schemas.js";
import {
  convertMarkdownToHtml,
  extractReportMetadata,
} from "../services/markdown-to-html.service.js";
import { renderHtmlToPdf } from "../services/pdf-report.service.js";
import { buildQaReportHtml } from "../templates/qa-report.template.js";
import { slugify } from "../utils/slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const PDF_OUTPUT_DIR = path.join(ROOT_DIR, "docs", "pdfs");

export const PROJECT_NAME = "Agente de QA (LangGraph JS)";
export const REPORT_VERSION = "1.0";

/** Garante nome de arquivo único, sem sobrescrever PDFs gerados anteriormente. */
function resolveUniquePdfPath(baseName: string, timestamp: string): string {
  const slug = slugify(baseName) || "relatorio";
  const base = `relatorio-qa-${slug}-${timestamp}`;

  let candidate = path.join(PDF_OUTPUT_DIR, `${base}.pdf`);
  let suffix = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(PDF_OUTPUT_DIR, `${base}-${suffix}.pdf`);
    suffix += 1;
  }
  return candidate;
}

export const gerarRelatorioMarkdownTool = tool(
  async (payload) => renderFinalOutputMarkdown(payload),
  {
    name: "gerar_relatorio_markdown",
    description:
      "Gera o relatório final de análise de QA em Markdown a partir dos dados consolidados " +
      "pelo agente (classificação, informações extraídas, riscos, estratégia e cenários).",
    schema: reportDataSchema,
  }
);

const pdfArgsSchema = z.object({
  markdown: z.string().min(1).describe("Conteúdo Markdown completo do relatório de QA."),
  origem: z
    .string()
    .optional()
    .describe("Identificação da origem do Markdown (caminho do arquivo ou descrição)."),
});

export const gerarRelatorioPdfTool = tool(
  async ({ markdown, origem }) => {
    const metadata = extractReportMetadata(markdown, "Relatório de QA");
    const contentHtml = convertMarkdownToHtml(markdown);

    fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });

    const now = dayjs();
    const outputPdfPath = resolveUniquePdfPath(
      metadata.tipoDemanda ?? metadata.title,
      now.format("YYYY-MM-DD-HHmm")
    );

    const html = buildQaReportHtml({
      projectName: PROJECT_NAME,
      reportTitle: metadata.title,
      tipoDemanda: metadata.tipoDemanda,
      generatedAt: now.format("DD/MM/YYYY HH:mm"),
      version: REPORT_VERSION,
      sourceMarkdownPath: origem ?? "gerado em memória pelo agente",
      outputPdfPath,
      processedAt: now.format("DD/MM/YYYY HH:mm:ss"),
      contentHtml,
    });

    await renderHtmlToPdf(html, outputPdfPath, {
      projectName: PROJECT_NAME,
      footerDate: now.format("DD/MM/YYYY"),
    });

    return outputPdfPath;
  },
  {
    name: "gerar_relatorio_pdf",
    description:
      "Converte o relatório Markdown de QA em um PDF técnico com capa, cabeçalho e rodapé, " +
      "salvo em docs/pdfs. Retorna o caminho do arquivo gerado.",
    schema: pdfArgsSchema,
  }
);
