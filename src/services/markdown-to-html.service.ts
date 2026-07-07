import MarkdownIt from "markdown-it";

const renderer = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
});

export function convertMarkdownToHtml(markdown: string): string {
  return renderer.render(markdown);
}

export interface ReportMetadata {
  title: string;
  tipoDemanda?: string;
}

/** Extrai o primeiro heading "# " e o tipo de demanda (linha "Tipo: **x**") já presentes no Markdown gerado pelo agente. */
export function extractReportMetadata(markdown: string, fallbackTitle: string): ReportMetadata {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const tipoMatch = markdown.match(/Tipo:\s*\*\*([^*]+)\*\*/);

  return {
    title: titleMatch?.[1]?.trim() ?? fallbackTitle,
    tipoDemanda: tipoMatch?.[1]?.trim(),
  };
}
