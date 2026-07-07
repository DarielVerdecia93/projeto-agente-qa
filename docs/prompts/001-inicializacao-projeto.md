# Prompt: Inicialização do Projeto

## Identificação

- Código: 001
- Versão: 1.0
- Data: 2026-07-07
- Autor: dverdecia
- Status: Ativo

## Objetivo

Obter da IA uma estrutura inicial de projeto Node.js com TypeScript preparada para receber um
agente de IA construído com LangGraph JS voltado a apoio de QA, incluindo organização de
pastas, configuração de TypeScript e scripts básicos de `package.json` — sem ainda implementar
lógica de agente.

## Contexto de uso

Este prompt é usado uma única vez, no início do projeto, antes de qualquer código de agente
existir. Ele estabelece a base sobre a qual as decisões documentadas em
[`docs/arquitetura/decisoes-tecnicas.md`](../arquitetura/decisoes-tecnicas.md) e os prompts de
definição do agente (ver [`003-definicao-agente-qa.md`](003-definicao-agente-qa.md)) se apoiam.
Não depende de nenhum outro prompt.

> **Nota de transparência**: este registro reconstrói, de forma fiel ao objetivo real do
> pedido, o prompt de inicialização do projeto. Ao integrar este arquivo ao histórico real do
> projeto, substitua o texto abaixo pelo prompt efetivamente utilizado na conversa original,
> mantendo a mesma estrutura de documentação.

## Prompt utilizado

```text
Quero iniciar um projeto Node.js com TypeScript para construir um agente de IA com
LangGraph JS, cujo propósito é apoiar atividades de QA (geração e revisão de casos de
teste, análise de bugs, apoio a critérios de aceite).

Preciso que você:
1. Sugira uma estrutura de pastas inicial (src, docs, scripts, tests) coerente com um
   projeto de agente LangGraph JS.
2. Configure o TypeScript (tsconfig.json) com strict mode habilitado.
3. Configure o package.json com os scripts mínimos de build, lint e execução.
4. Não implemente ainda a lógica do agente — apenas o esqueleto do projeto.
5. Justifique cada decisão de configuração tomada.
```

## Entrada esperada

Nenhuma entrada de dados além do próprio texto do prompt — é um prompt de bootstrap, executado
em um diretório de projeto vazio.

## Saída esperada

- Estrutura de pastas proposta (texto ou árvore de diretórios).
- Conteúdo de `tsconfig.json` e `package.json`.
- Breve justificativa textual para cada escolha de configuração (não apenas os arquivos).

## Critérios de qualidade

- A estrutura de pastas não deve incluir lógica de negócio do agente (escopo limitado a
  bootstrap).
- `tsconfig.json` deve habilitar `strict: true`.
- As justificativas devem ser específicas ao contexto (agente LangGraph JS para QA), não
  genéricas de "boas práticas de TypeScript".

## Decisões de engenharia de prompt

- **Escopo explicitamente limitado** ("não implemente ainda a lógica do agente"): evita que a
  IA antecipe decisões de arquitetura do agente antes que elas sejam deliberadamente
  discutidas e documentadas (ver [`003-definicao-agente-qa.md`](003-definicao-agente-qa.md)).
  Sem essa restrição, é comum que a IA já gere um grafo LangGraph completo, misturando
  decisões de bootstrap com decisões de domínio.
- **Pedido explícito de justificativa** ("justifique cada decisão"): transforma a resposta da
  IA em um artefato revisável, alinhado ao objetivo de rastreabilidade acadêmica do projeto —
  em vez de apenas gerar arquivos, a IA precisa explicitar seu raciocínio.
- **Enumeração numerada de subtarefas**: reduz ambiguidade sobre o que constitui "concluído"
  para este prompt, facilitando a verificação dos critérios de qualidade acima.

## Observações

Prompts de bootstrap tendem a ficar desatualizados rapidamente à medida que o projeto evolui
(novas dependências, novos scripts). Este registro documenta a *intenção original*; alterações
subsequentes de configuração devem ser registradas em
[`docs/arquitetura/decisoes-tecnicas.md`](../arquitetura/decisoes-tecnicas.md), não neste
arquivo.

## Histórico de alterações

| Versão | Data | Alteração | Commit/Referência |
|---|---|---|---|
| 1.0 | 2026-07-07 | Criação do registro | |
