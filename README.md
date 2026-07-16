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
  em `src/llm.ts`). A conta possui limites por minuto e por dia, aplicados por modelo e no nível
  da organização. Se o modelo principal (`GROQ_MODEL`) falhar, o agente tenta imediatamente os
  modelos listados em `GROQ_FALLBACK_MODELS`. Se todos falharem, a mensagem final identifica o erro de cada um e o
  tempo de espera informado pela Groq. Esperas curtas (até 60 segundos por padrão), típicas de
  limite por minuto, são respeitadas automaticamente e podem exigir mais de uma tentativa;
  limites diários não bloqueiam a execução durante horas. Os padrões atuais são
  `openai/gpt-oss-120b`, com `llama-3.1-8b-instant` e `qwen/qwen3.6-27b` como fallbacks
  complementares. O primeiro fallback foi mantido temporariamente por apresentar boa
  compatibilidade com este agente, mas tem desligamento anunciado para 16/08/2026 e deve ser
  reavaliado antes dessa data. Consulte os
  [limites da conta](https://console.groq.com/settings/limits) e a
  [política de descontinuação de modelos](https://console.groq.com/docs/deprecations).

## Fluxo completo (ponta a ponta)

### 1. Instalar e configurar

```bash
git clone <url-do-repositorio>
cd projeto-agente_qa
npm install
cp .env.example .env
```

Abra o `.env` e preencha `GROQ_API_KEY` com sua chave da Groq. `GROQ_MODEL` define o principal e
`GROQ_FALLBACK_MODELS` aceita uma lista de alternativas separadas por vírgula. Os padrões foram
testados nas chamadas estruturadas e de tools do agente; ainda assim, modelos diferentes podem
apresentar comportamentos distintos em tarefas específicas. `GROQ_MAX_RATE_LIMIT_WAIT_SECONDS` controla por quanto
tempo o agente pode aguardar e repetir uma chamada limitada por minuto; valores maiores não são
recomendados para limites diários.

### 2. Executar o agente

O agente aceita a demanda técnica de duas formas: como **texto direto** no argumento, ou como
**caminho de um arquivo `.txt`/`.md`** contendo o texto.

```bash
# Opção A: texto direto
npm run agent -- "Como usuário quero recuperar minha senha por e-mail"

# Opção B: a partir de um arquivo
npm run agent -- examples-testes/demanda-login.txt

# Opção C: qualquer uma das anteriores + geração do PDF ao final
npm run agent -- examples-testes/demanda-login.txt --pdf
```

Internamente (`src/index.ts`), o agente verifica se o argumento é um caminho de arquivo
existente; se for, lê o conteúdo do arquivo. Caso contrário, trata o argumento como o próprio
texto da demanda. A pasta [`examples-testes/`](examples-testes/) tem exemplos prontos para testar.

O processamento passa por um grafo de nós (classificação, extração de informação, identificação
de ambiguidades, avaliação de riscos, definição de estratégia de testes, geração de cenários e
revisão de consistência — ver [`docs/arquitetura/visao-geral-agente.md`](docs/arquitetura/visao-geral-agente.md)).
A revisão aplica primeiro regras determinísticas de cobertura (ao menos um cenário para cada
categoria escolhida na estratégia e três passos por cenário) e só então usa o LLM para avaliar a
coerência semântica. Uma falha objetiva orienta uma nova geração; se as tentativas se esgotarem,
o relatório explicita a pendência para revisão manual em vez de marcar a categoria como não
aplicável.
O fluxo realiza várias chamadas sequenciais ao LLM. Uma execução completa normalmente leva alguns segundos a
pouco mais de um minuto, dependendo da complexidade da demanda e da velocidade do modelo.

A arquitetura é **híbrida: nós + tools**. O fluxo entre as etapas é determinístico (garantido
pelo grafo), mas na etapa de extração de informações o LLM escolhe, via *tool calling*, qual
tool de análise especializada aplicar — `analisar_texto_livre`, `analisar_alteracao_api` ou
`analisar_documento_markdown` (ver [`src/tools/analysis-tools.ts`](src/tools/analysis-tools.ts)).
Se o modelo não chamar nenhuma tool válida, o agente usa um fallback determinístico com o prompt
genérico de extração. A saída também é encapsulada em tools (`gerar_relatorio_markdown` e
`gerar_relatorio_pdf`, em [`src/tools/output-tools.ts`](src/tools/output-tools.ts)), invocadas
pelo nó final — o PDF só é gerado quando a flag `--pdf` é passada. O console informa qual tool
de análise foi utilizada em cada execução.

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

Há duas formas de obter o PDF. A mais direta é rodar o agente com a flag `--pdf` (passo 2), que
gera o relatório Markdown e o PDF na mesma execução. Alternativamente, com um arquivo Markdown
em mãos (gerado pelo agente em `docs/outputs/` ou escrito manualmente no mesmo formato), gere um
PDF técnico pronto para compartilhar:

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
| Executar o agente | `npm run agent -- <texto ou caminho> [--pdf]` | Roda o agente sobre uma demanda e salva o resultado em `docs/outputs/`; com `--pdf`, também gera o PDF em `docs/pdfs/`. |
| Gerar PDF | `npm run generate:pdf -- <caminho.md>` | Converte um relatório Markdown em PDF em `docs/pdfs/`. |
| Checar tipos | `npm run typecheck` | Roda `tsc --noEmit` sobre `src/` e `scripts/`. |
| Lint | `npm run lint` (ou `npm run lint:fix`) | Roda o ESLint sobre o projeto (ver [`eslint.config.js`](eslint.config.js)). |
| Rodar testes | `npm test` | Roda os testes unitários (`node:test` via `tsx`). |
| Validar prompts | `npm run validate:prompts` | Garante que `docs/prompts/` está estruturalmente correto (ver [`CONTRIBUTING.md`](CONTRIBUTING.md)). |

## Estrutura do projeto

```
src/
  nodes/        nós do grafo LangGraph (um por etapa do fluxo do agente)
  tools/        tools LangChain: análises especializadas (tool calling) e geração de relatórios
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
