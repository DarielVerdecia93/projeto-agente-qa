# Agente de QA (LangGraph JS)

Agente de IA construído com **LangGraph JS**, Node.js e TypeScript para apoiar profissionais de
QA na análise de demandas técnicas (histórias de usuário, bugs, deploys, alterações de API,
mudanças em banco de dados, ajustes de configuração e texto livre), gerando cenários de teste,
checklist de validação, riscos e recomendações.

- Visão geral e arquitetura: [`docs/arquitetura/visao-geral-agente.md`](docs/arquitetura/visao-geral-agente.md)
- Rastreabilidade de prompts: [`docs/prompts/`](docs/prompts/README.md)
- Como contribuir: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Fluxo completo (ponta a ponta)](#fluxo-completo-ponta-a-ponta)
  1. [Instalar e configurar](#1-instalar-e-configurar)
  2. [Executar o agente](#2-executar-o-agente)
  3. [Entender a saída](#3-entender-a-saída)
  4. [Gerar o relatório em PDF](#4-gerar-o-relatório-em-pdf)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação adicional](#documentação-adicional)

## Pré-requisitos

- **Node.js 18 ou superior** e **npm** (o projeto usa ESM nativo e sintaxe ES2022 — ver
  [`tsconfig.json`](tsconfig.json)).
- Uma **chave de API da [Groq](https://console.groq.com/keys)** (usada para as chamadas ao LLM
  em `src/llm.ts`). A conta gratuita da Groq é suficiente para rodar o agente, mas tem um limite
  de tokens por minuto (TPM) que varia por modelo — se você receber erro `429` ao executar,
  espere alguns segundos e tente novamente, ou troque `GROQ_MODEL` no `.env` por um modelo com
  mais cota disponível na sua conta.

## Fluxo completo (ponta a ponta)

### 1. Instalar e configurar

```bash
git clone <url-do-repositorio>
cd projeto-agente_qa
npm install
cp .env.example .env
```

Abra o `.env` e preencha `GROQ_API_KEY` com sua chave da Groq. O campo `GROQ_MODEL` já vem
preenchido com um modelo padrão (`llama-3.3-70b-versatile`); só altere se souber o que está
fazendo — modelos diferentes têm limites de tokens/minuto e comportamentos de saída estruturada
distintos.

### 2. Executar o agente

O agente aceita a demanda técnica de duas formas: como **texto direto** no argumento, ou como
**caminho de um arquivo `.txt`/`.md`** contendo o texto.

```bash
# Opção A: texto direto
npm run agent -- "Como usuário quero recuperar minha senha por e-mail"

# Opção B: a partir de um arquivo
npm run agent -- examples-testes/demanda-login.txt
```

Internamente (`src/index.ts`), o agente verifica se o argumento é um caminho de arquivo
existente; se for, lê o conteúdo do arquivo. Caso contrário, trata o argumento como o próprio
texto da demanda. A pasta [`examples-testes/`](examples-testes/) tem exemplos prontos para testar.

O processamento passa por um grafo de nós (classificação, extração de informação, identificação
de ambiguidades, avaliação de riscos, definição de estratégia de testes, geração de cenários e
revisão de consistência — ver [`docs/arquitetura/visao-geral-agente.md`](docs/arquitetura/visao-geral-agente.md)),
com várias chamadas sequenciais ao LLM. Uma execução completa normalmente leva alguns segundos a
pouco mais de um minuto, dependendo da complexidade da demanda e da velocidade do modelo.

### 3. Entender a saída

O resultado é exibido no console em Markdown **e também salvo automaticamente** em
`docs/outputs/<slug-da-demanda>-<data-hora>.md`. O relatório final inclui, entre outras seções:
classificação da demanda, resumo técnico, componentes afetados, premissas e informações
faltantes, estratégia de testes, cenários de teste por categoria (funcional, unitário,
integração, não funcional), checklist de validação, riscos técnicos/de negócio e recomendações
para o QA.

Se a demanda fornecida não tiver informação suficiente para uma análise útil, o agente não
gera cenários — em vez disso, retorna um relatório curto explicando o motivo e recomendando que
a demanda seja detalhada e reenviada.

### 4. Gerar o relatório em PDF

Com um arquivo Markdown em mãos (gerado pelo agente em `docs/outputs/` ou escrito manualmente
no mesmo formato), gere um PDF técnico pronto para compartilhar:

```bash
npm run generate:pdf -- docs/outputs/<nome-do-arquivo-gerado-pelo-agente>.md
```

O comando:

1. Valida se o caminho do arquivo foi informado, existe e tem extensão `.md`.
2. Converte o Markdown em HTML e aplica um template técnico de QA (capa, resumo do relatório,
   conteúdo formatado e apêndice técnico com metadados de processamento).
3. Renderiza o HTML em PDF com cabeçalho, rodapé e numeração de páginas.
4. Salva o PDF em `docs/pdfs/`, com nome padronizado e sem sobrescrever arquivos anteriores
   (ex.: `relatorio-qa-<nome-do-arquivo>-2026-07-07-1430.pdf`).
5. Exibe no console o caminho final do arquivo gerado.

**Exemplo de saída no console:**

```text
PDF gerado com sucesso: G:\...\docs\pdfs\relatorio-qa-demanda-login-2026-07-07-1430.pdf
```

**Bibliotecas usadas:** `puppeteer` (renderização do PDF a partir de HTML), `markdown-it`
(conversão Markdown → HTML, com suporte nativo a tabelas), `dayjs` (formatação de datas). Ver
detalhes de implementação em [`src/generate-pdf.ts`](src/generate-pdf.ts),
[`src/services/`](src/services/) e [`src/templates/qa-report.template.ts`](src/templates/qa-report.template.ts).

Nesse ponto o fluxo está completo: de uma demanda em texto livre a um PDF de relatório de QA
pronto para anexar em um card, e-mail ou documentação de teste.

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Executar o agente | `npm run agent -- <texto ou caminho>` | Roda o agente sobre uma demanda e salva o resultado em `docs/outputs/`. |
| Gerar PDF | `npm run generate:pdf -- <caminho.md>` | Converte um relatório Markdown em PDF em `docs/pdfs/`. |
| Checar tipos | `npm run typecheck` | Roda `tsc --noEmit` sobre `src/` e `scripts/`. |
| Lint | `npm run lint` (ou `npm run lint:fix`) | Roda o ESLint sobre o projeto (ver [`eslint.config.js`](eslint.config.js)). |
| Rodar testes | `npm test` | Roda os testes unitários (`node:test` via `tsx`). |
| Validar prompts | `npm run validate:prompts` | Garante que `docs/prompts/` está estruturalmente correto (ver [`CONTRIBUTING.md`](CONTRIBUTING.md)). |

## Estrutura do projeto

```
src/
  nodes/        nós do grafo LangGraph (um por etapa do fluxo do agente)
  format/       serialização do estado final em Markdown
  services/     conversão Markdown → HTML e geração do PDF
  templates/     template HTML do relatório em PDF
  styles/       CSS do relatório em PDF
  prompts.ts     prompts operacionais enviados ao LLM em tempo de execução
  schemas.ts     schemas Zod de validação da saída estruturada do LLM
  state.ts       estado do grafo (AgentState) e suas transições
  graph.ts       montagem do StateGraph (nós e arestas)
  index.ts       CLI de entrada (npm run agent)
docs/
  arquitetura/   visão geral do agente e decisões técnicas
  prompts/       registro versionado de todos os prompts (engenharia e operacionais)
  outputs/       relatórios Markdown gerados (ignorados no git, exceto o próprio índice)
  pdfs/          PDFs gerados (ignorados no git)
examples-testes/ demandas de exemplo para testar o agente manualmente
scripts/         scripts de suporte (validação de prompts, git hooks)
```

## Documentação adicional

- [`docs/arquitetura/visao-geral-agente.md`](docs/arquitetura/visao-geral-agente.md) — problema,
  objetivo, entradas aceitas e fluxo geral do agente.
- [`docs/arquitetura/decisoes-tecnicas.md`](docs/arquitetura/decisoes-tecnicas.md) — decisões de
  arquitetura e configuração derivadas dos prompts de engenharia.
- [`docs/prompts/README.md`](docs/prompts/README.md) — convenção de nomenclatura, versionamento
  e estrutura dos registros de prompt.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — fluxo de branches, convenção de commits e checklist
  antes de abrir um PR.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — pipeline de CI (typecheck, lint,
  testes e validação de prompts) executado a cada push/PR para `main` e `develop`.
