export const qaReportStyle = `
  * { box-sizing: border-box; }

  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #1f2933;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
  }

  .cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 0 48px;
    page-break-after: always;
    border-bottom: 6px solid #2f6f4f;
  }

  .cover__eyebrow {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #2f6f4f;
    margin-bottom: 16px;
  }

  .cover__title {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 24px;
    color: #102a1f;
  }

  .cover__meta {
    font-size: 13px;
    color: #3e4c59;
  }

  .cover__meta dt {
    font-weight: 600;
    color: #1f2933;
  }

  .cover__meta dl {
    display: grid;
    grid-template-columns: 140px 1fr;
    row-gap: 6px;
    margin: 0;
  }

  .section {
    padding: 0 48px;
    margin-bottom: 28px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #102a1f;
    border-left: 4px solid #2f6f4f;
    padding-left: 10px;
    margin: 0 0 12px;
    page-break-after: avoid;
  }

  .summary-box {
    background: #f4f8f6;
    border: 1px solid #d8e6de;
    border-radius: 6px;
    padding: 16px 20px;
  }

  .content h1 { font-size: 20px; margin-top: 26px; }
  .content h2 {
    font-size: 15px;
    margin-top: 22px;
    color: #102a1f;
    border-bottom: 1px solid #e0e6e3;
    padding-bottom: 4px;
    page-break-after: avoid;
  }
  .content h3 { font-size: 13px; margin-top: 16px; }

  .content ul, .content ol {
    padding-left: 20px;
    margin: 8px 0;
  }

  .content li { margin-bottom: 4px; }

  .content p { margin: 8px 0; }

  .content table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 11px;
  }

  .content th, .content td {
    border: 1px solid #d8e0dc;
    padding: 6px 8px;
    text-align: left;
  }

  .content th {
    background: #eaf2ee;
    font-weight: 600;
  }

  .content pre {
    background: #1f2933;
    color: #e7f5ee;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 10.5px;
    line-height: 1.4;
  }

  .content code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }

  .content :not(pre) > code {
    background: #eef2f0;
    padding: 1px 4px;
    border-radius: 3px;
    color: #163829;
  }

  .content blockquote {
    border-left: 3px solid #2f6f4f;
    margin: 10px 0;
    padding: 4px 14px;
    color: #3e4c59;
    background: #f7faf8;
  }

  .appendix {
    font-size: 10.5px;
    color: #52606d;
  }

  .appendix dl {
    display: grid;
    grid-template-columns: 160px 1fr;
    row-gap: 6px;
  }

  .appendix dt { font-weight: 600; color: #1f2933; }

  .appendix .note {
    margin-top: 12px;
    font-style: italic;
  }
`;
