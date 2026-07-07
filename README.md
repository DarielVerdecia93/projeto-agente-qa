# Agente de QA (LangGraph JS)

Agente de IA construído com **LangGraph JS**, Node.js e TypeScript para apoiar profissionais de
QA na análise de demandas técnicas (histórias de usuário, bugs, deploys, alterações de API,
mudanças em banco de dados, ajustes de configuração e texto livre), gerando cenários de teste,
checklist de validação, riscos e recomendações.

- Visão geral e arquitetura: [`docs/arquitetura/visao-geral-agente.md`](docs/arquitetura/visao-geral-agente.md)
- Rastreabilidade de prompts: [`docs/prompts/`](docs/prompts/README.md)

## Como executar o agente

```bash
npm install
cp .env.example .env   # preencha GROQ_API_KEY
npm run agent -- "texto da demanda"
```

O resultado é exibido no console em Markdown e também salvo automaticamente em
`docs/outputs/`.

## Como gerar um relatório em PDF

O projeto inclui um gerador de relatório PDF profissional a partir de um resultado em Markdown
já existente (gerado pelo agente ou fornecido manualmente).

```bash
npm run generate:pdf -- docs/outputs/resultado-exemplo.md
```

O comando:

1. Valida se o caminho do arquivo foi informado, existe e tem extensão `.md`.
2. Converte o Markdown em HTML e aplica um template técnico de QA (capa, resumo do relatório,
   conteúdo formatado e apêndice técnico com metadados de processamento).
3. Renderiza o HTML em PDF com cabeçalho, rodapé e numeração de páginas.
4. Salva o PDF em `docs/pdfs/`, com nome padronizado e sem sobrescrever arquivos anteriores
   (ex.: `relatorio-qa-resultado-exemplo-2026-07-07-1430.pdf`).
5. Exibe no console o caminho final do arquivo gerado.

**Exemplo de saída no console:**

```text
PDF gerado com sucesso: G:\...\docs\pdfs\relatorio-qa-resultado-exemplo-2026-07-07-1430.pdf
```

**Bibliotecas usadas:** `puppeteer` (renderização do PDF a partir de HTML), `markdown-it`
(conversão Markdown → HTML, com suporte nativo a tabelas), `dayjs` (formatação de datas). Ver
detalhes de implementação em [`src/generate-pdf.ts`](src/generate-pdf.ts),
[`src/services/`](src/services/) e [`src/templates/qa-report.template.ts`](src/templates/qa-report.template.ts).
