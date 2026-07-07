import puppeteer from "puppeteer";

export interface RenderPdfOptions {
  projectName: string;
  footerDate: string;
}

function buildHeaderTemplate(projectName: string): string {
  return `
    <div style="width:100%; font-size:8px; color:#8a97a1; padding:0 40px; font-family:Helvetica,Arial,sans-serif;">
      ${projectName} — Relatório de QA
    </div>
  `;
}

function buildFooterTemplate(projectName: string, footerDate: string): string {
  return `
    <div style="width:100%; font-size:8px; color:#8a97a1; padding:0 40px; display:flex; justify-content:space-between; font-family:Helvetica,Arial,sans-serif;">
      <span>${projectName}</span>
      <span>${footerDate}</span>
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  `;
}

export async function renderHtmlToPdf(
  html: string,
  outputPath: string,
  options: RenderPdfOptions
): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "60px", bottom: "60px", left: "0px", right: "0px" },
      displayHeaderFooter: true,
      headerTemplate: buildHeaderTemplate(options.projectName),
      footerTemplate: buildFooterTemplate(options.projectName, options.footerDate),
    });
  } finally {
    await browser.close();
  }
}
