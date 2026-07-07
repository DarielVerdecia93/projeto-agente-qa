import { qaReportStyle } from "../styles/qa-report.style.js";

export interface QaReportTemplateParams {
  projectName: string;
  reportTitle: string;
  tipoDemanda?: string;
  generatedAt: string;
  version: string;
  sourceMarkdownPath: string;
  outputPdfPath: string;
  processedAt: string;
  contentHtml: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildQaReportHtml(params: QaReportTemplateParams): string {
  const tipoDemandaRow = params.tipoDemanda
    ? `<dt>Tipo de demanda</dt><dd>${escapeHtml(params.tipoDemanda)}</dd>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(params.reportTitle)}</title>
<style>${qaReportStyle}</style>
</head>
<body>
  <section class="cover">
    <div class="cover__eyebrow">${escapeHtml(params.projectName)} — Relatório Técnico de QA</div>
    <h1 class="cover__title">${escapeHtml(params.reportTitle)}</h1>
    <dl class="cover__meta">
      ${tipoDemandaRow}
      <dt>Data de geração</dt><dd>${escapeHtml(params.generatedAt)}</dd>
      <dt>Versão do relatório</dt><dd>${escapeHtml(params.version)}</dd>
    </dl>
  </section>

  <section class="section">
    <h2 class="section-title">Resumo do Relatório</h2>
    <div class="summary-box">
      <p>Este documento foi gerado automaticamente a partir da análise produzida pelo agente de
      IA de apoio a QA (LangGraph JS), convertendo o resultado em Markdown para um formato
      técnico de leitura e arquivamento.</p>
      <p><strong>Origem do arquivo Markdown:</strong> ${escapeHtml(params.sourceMarkdownPath)}<br/>
      <strong>Data/hora de geração deste PDF:</strong> ${escapeHtml(params.generatedAt)}</p>
    </div>
  </section>

  <section class="section content">
    <h2 class="section-title">Conteúdo da Análise</h2>
    ${params.contentHtml}
  </section>

  <section class="section appendix">
    <h2 class="section-title">Apêndice Técnico</h2>
    <dl>
      <dt>Arquivo Markdown original</dt><dd>${escapeHtml(params.sourceMarkdownPath)}</dd>
      <dt>Arquivo PDF gerado</dt><dd>${escapeHtml(params.outputPdfPath)}</dd>
      <dt>Data/hora de processamento</dt><dd>${escapeHtml(params.processedAt)}</dd>
    </dl>
    <p class="note">Este relatório foi gerado automaticamente a partir do resultado do agente
    de QA. Nenhuma edição manual foi aplicada ao conteúdo da análise.</p>
  </section>
</body>
</html>`;
}
