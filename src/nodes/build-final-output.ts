import { renderInsufficientInputMarkdown } from "../format/markdown.js";
import type { AgentState, AgentStateUpdate } from "../state.js";
import { gerarRelatorioMarkdownTool, gerarRelatorioPdfTool } from "../tools/output-tools.js";

export async function requestMoreInfo(state: AgentState): Promise<AgentStateUpdate> {
  return {
    finalOutput: renderInsufficientInputMarkdown(
      state.insufficientReason ?? "Entrada insuficiente."
    ),
  };
}

/**
 * Nó de saída: invoca as tools de geração de relatório. O Markdown é sempre
 * gerado (saída garantida do pipeline); o PDF só quando solicitado via
 * generatePdf, e uma falha na geração do PDF não derruba a análise.
 */
export async function buildFinalOutput(state: AgentState): Promise<AgentStateUpdate> {
  const finalOutput: string = await gerarRelatorioMarkdownTool.invoke(state);

  if (!state.generatePdf) {
    return { finalOutput };
  }

  try {
    const pdfPath: string = await gerarRelatorioPdfTool.invoke({ markdown: finalOutput });
    return { finalOutput, pdfPath };
  } catch (error) {
    console.warn(
      `Aviso: relatório Markdown gerado, mas a geração do PDF falhou: ${
        error instanceof Error ? error.message : error
      }`
    );
    return { finalOutput };
  }
}
