# Como contribuir

Este documento descreve o fluxo de branches, a convenção de commits e o checklist a seguir
antes de abrir um pull request neste projeto.

## Fluxo de branches (Gitflow)

O repositório segue um Gitflow simplificado, com duas branches permanentes:

- **`main`** — estado estável do projeto. Recebe merges apenas de `develop` (ou de uma branch
  de hotfix, se necessário).
- **`develop`** — branch de integração. Todo trabalho novo nasce a partir dela e volta para ela
  via pull request.

Branches de trabalho, sempre criadas a partir de `develop`:

| Prefixo | Uso |
|---|---|
| `feat/<nome-curto>` | Nova funcionalidade ou melhoria (ex.: `feat/prompts-qa-tecnicos`). |
| `fix/<nome-curto>` | Correção de bug. |
| `docs/<nome-curto>` | Alterações apenas de documentação. |
| `chore/<nome-curto>` | Manutenção sem impacto em funcionalidade (dependências, configuração). |

Nunca commitar diretamente em `main` ou `develop` — todo trabalho passa por um pull request de
uma branch de trabalho para `develop`.

```bash
git checkout develop
git pull
git checkout -b feat/nome-curto-da-mudanca
# ... commits ...
git push -u origin feat/nome-curto-da-mudanca
gh pr create --base develop
```

## Convenção de commits

O projeto segue [Conventional Commits](https://www.conventionalcommits.org/), com mensagens em
português:

```
tipo: descrição objetiva no imperativo

Corpo opcional explicando o *porquê* da mudança, não apenas o *o quê*
(o diff já mostra o que mudou).
```

Tipos usados no projeto:

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade ou comportamento novo/alterado do agente. |
| `fix` | Correção de bug. |
| `docs` | Mudança apenas em documentação (`README.md`, `docs/`). |
| `refactor` | Reorganização de código sem mudar comportamento observável. |
| `test` | Adição ou ajuste de testes, sem mudar código de produção. |
| `chore` | Manutenção (dependências, configuração, scripts de apoio). |

Exemplos reais do histórico do projeto:

```
feat: implementa o agente de QA em LangGraph JS
feat: adiciona geracao de relatorio PDF a partir do Markdown
feat: torna os prompts do agente de QA mais verbosos e tecnicos
```

## Convenções de código

O projeto usa TypeScript em modo `strict` (ver [`tsconfig.json`](tsconfig.json)) e ESLint
([`eslint.config.js`](eslint.config.js), com `typescript-eslint` recomendado) como fonte única
de verdade sobre as regras de estilo/qualidade aplicadas — evite duplicar essa lista aqui; rode
`npm run lint` para ver o que está sendo verificado. Diretrizes gerais que não são cobertas por
uma regra de lint automática:

- Evite comentários que só repetem o que o código já diz; comente apenas quando o *porquê* não
  for óbvio (uma decisão não trivial, uma limitação conhecida).
- Prefira nomes descritivos de função/variável a abreviações.
- Erros relançados em blocos `catch` devem preservar o erro original via `{ cause: error }`,
  para não perder o stack trace (fiscalizado pela regra `preserve-caught-error` do ESLint).

## Antes de abrir um pull request

Rode localmente e confirme que tudo passa:

```bash
npm run typecheck
npm run lint
npm test
npm run validate:prompts
```

Esses mesmos quatro passos rodam automaticamente no CI
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) a cada push ou pull request para
`main`/`develop` — um PR com qualquer um deles falhando não deve ser mergeado. Se o lint apontar
problemas simples de estilo, `npm run lint:fix` corrige a maioria automaticamente.

Se a mudança alterou qualquer prompt em [`src/prompts.ts`](src/prompts.ts), atualize o registro
correspondente em [`docs/prompts/005-prompts-operacionais-agente-qa.md`](docs/prompts/005-prompts-operacionais-agente-qa.md)
**na mesma mudança** (versão + histórico de alterações) — ver a convenção completa em
[`docs/prompts/README.md`](docs/prompts/README.md). Isso é validado automaticamente pelo hook
de pre-commit (ver abaixo) e por `npm run validate:prompts`.

### Hook de pre-commit (recomendado)

O projeto já inclui um hook de `pre-commit` versionado em
[`scripts/git-hooks/pre-commit`](scripts/git-hooks/pre-commit), que roda
`npm run validate:prompts` automaticamente antes de cada commit. Ele não é instalado por
padrão pelo Git — configure uma vez por clone:

```bash
git config core.hooksPath scripts/git-hooks
```

Em sistemas Unix/macOS (ou Git Bash no Windows), garanta que o arquivo é executável:

```bash
chmod +x scripts/git-hooks/pre-commit
```

## Abrindo o pull request

- Base sempre `develop`, nunca `main`.
- Título seguindo a mesma convenção dos commits (ex.: `feat: adiciona validação de e-mail no
  formulário de recuperação de senha`).
- Descrição com um resumo objetivo da mudança e, quando fizer sentido, um "test plan" (passos
  ou comandos usados para validar a mudança manualmente).
