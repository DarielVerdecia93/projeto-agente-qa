# Prompt: Definição Técnica do Objetivo e Comportamento do Agente de QA

## Identificação

- Código: 004
- Versão: 1.0
- Data: 2026-07-07
- Autor: dverdecia
- Status: Ativo

## Objetivo

Produzir a definição técnica completa do objetivo do projeto e do comportamento esperado do
agente de QA em LangGraph JS — problema, objetivo, entradas/saídas, fluxo de nós, modelo de
estado, decisões do agente, justificativa de por que é um agente (e não um script), limitações
e escopo do MVP — em um formato reutilizável tanto como `README.md` quanto como documento de
arquitetura.

## Contexto de uso

Usado após a formalização do sistema de documentação de prompts (ver
[`002-registro-prompts.md`](002-registro-prompts.md)) e antes de qualquer implementação do
grafo em `src/`. É o prompt que efetivamente define o domínio e o comportamento do agente,
complementando [`003-definicao-agente-qa.md`](003-definicao-agente-qa.md) com um nível de
detalhe adequado para publicação (README/documentação de arquitetura), não apenas para
alinhamento interno de arquitetura. O resultado direto deste prompt é o arquivo
[`docs/arquitetura/visao-geral-agente.md`](../arquitetura/visao-geral-agente.md).

## Prompt utilizado

```text
Quero definir tecnicamente o objetivo do projeto e o comportamento esperado de um agente
de IA com LangGraph JS para apoiar QA na geração de cenários de teste.

Atue como arquiteto de software, especialista em QA, especialista em Node.js/TypeScript e
especialista em agentes de IA com LangGraph JS.

Contexto: agente de IA para apoiar profissionais de QA na análise de demandas técnicas
variadas, que nem sempre chegam como histórias de usuário bem estruturadas (tarefas
técnicas, bugs, deploys, alterações de API, mudanças em banco de dados, ajustes de
configuração, texto livre). O agente deve interpretar a entrada, validar se há informação
suficiente, classificar o tipo de demanda, extrair informações relevantes, avaliar riscos
e gerar saída estruturada para apoiar planejamento e execução de testes.

Objetivo desta etapa: criar uma definição clara e profissional do projeto, utilizável no
README.md e como base para a arquitetura inicial do agente em LangGraph JS.

A definição deve conter, obrigatoriamente, as seções: (1) Problema; (2) Objetivo do
agente; (3) Entradas aceitas (história de usuário, tarefa técnica, bug, deploy, alteração
de API, mudança em banco de dados, ajuste de configuração, texto livre, arquivo); (4)
Saídas esperadas (classificação, resumo técnico, premissas, pontos ambíguos, informações
faltantes, cenários funcionais/unitários/integração/não funcionais, checklist de
validação, riscos técnicos e de negócio, recomendações, sugestões de evidência); (5) Fluxo
geral do agente em nós compatíveis com LangGraph JS (receber entrada, validar entrada,
classificar demanda, extrair informações, identificar ambiguidades, avaliar riscos,
definir estratégia de testes, gerar cenários, revisar consistência, retornar saída final);
(6) Modelo inicial de estado em TypeScript (rawInput, inputType, classification,
extractedInfo, missingInfo, assumptions, risks, testStrategy, generatedScenarios,
validationChecklist, recommendations, finalOutput); (7) Tipos de decisão do agente; (8)
Por que é um agente e não um script; (9) Limitações iniciais; (10) Escopo da primeira
versão (MVP).

Formato de resposta: documentação técnica pronta para uso em README.md ou em
docs/arquitetura/visao-geral-agente.md.

Critérios de qualidade: português do Brasil, linguagem técnica mas clara, coerência com
Node.js/TypeScript/LangGraph JS, sem inventar integrações externas, sem código complexo
nesta etapa, demonstrando engenharia de contexto e raciocínio de arquitetura, adequado
para apresentação acadêmica.
```

## Entrada esperada

- Conhecimento prévio de que o domínio do agente é QA e a tecnologia é LangGraph JS (decisões
  já registradas em [`001`](001-inicializacao-projeto.md) e [`003`](003-definicao-agente-qa.md)).
- Lista explícita das 10 seções obrigatórias, com o conteúdo mínimo esperado de cada uma
  (fornecida no próprio prompt).
- Nenhum dado de entrada externo (não é um prompt operacional do agente; é um prompt de
  definição de projeto).

## Saída esperada

- Um documento Markdown único, com as 10 seções na ordem especificada, adequado para ser usado
  tanto em `README.md` quanto em `docs/arquitetura/visao-geral-agente.md`.
- Um esboço de tipo TypeScript para o estado do agente (seção 6), sem lógica de implementação.
- Uma representação textual do fluxo do grafo (seção 5) compatível com nós e arestas
  condicionais do LangGraph JS.

## Critérios de qualidade

- As 10 seções pedidas devem estar todas presentes e na ordem solicitada.
- Nenhuma integração externa (repositórios, rastreadores, CI/CD) deve ser mencionada como já
  suportada — apenas como fora de escopo do MVP.
- O tipo `AgentState` deve conter todos os campos listados no prompt, sem campos supérfluos que
  não tenham justificativa no fluxo descrito.
- A seção "Por que é um agente e não um script" deve argumentar com base em características
  concretas do fluxo (decisões condicionais, adaptação de saída), não em afirmações genéricas
  sobre IA.
- O documento deve ser compreensível por um avaliador acadêmico sem contexto prévio da
  conversa.

## Decisões de engenharia de prompt

- **Atribuição de múltiplos papéis simultâneos** ("arquiteto de software, especialista em QA,
  especialista em Node.js/TypeScript, especialista em agentes de IA com LangGraph JS"): o
  documento resultante precisa ser correto em quatro dimensões ao mesmo tempo (arquitetura,
  domínio de QA, stack tecnológica, paradigma de agente); atribuir um único papel arriscaria uma
  resposta tecnicamente correta em uma dimensão e superficial nas demais.
- **Especificação de seções com conteúdo mínimo por seção, não apenas títulos**: cada uma das
  10 seções do prompt já lista os subtópicos esperados (ex.: a lista de campos do
  `AgentState`, a lista de nós do fluxo). Isso reduz a variância da resposta e torna o
  documento resultante diretamente comparável ao prompt que o gerou — decisão consistente com a
  prática de rastreabilidade já estabelecida em [`002`](002-registro-prompts.md).
- **Restrição explícita "não invente integrações externas ainda" e "não implemente código
  complexo"**: antecipa dois desvios prováveis de um LLM ao descrever um agente de IA —
  adicionar integrações (bancos de dados, APIs de terceiros, ferramentas de CI) que dariam a
  falsa impressão de que já fazem parte do escopo, e produzir código de implementação prematuro
  em uma etapa que deveria ser apenas de definição.
- **Pedido explícito de uma seção "por que é um agente e não um script"**: força a resposta a
  justificar a escolha arquitetural (LangGraph JS / paradigma de agente) em vez de apenas
  descrevê-la, o que é o tipo de raciocínio que se espera demonstrar em uma apresentação
  acadêmica — e evita que o restante do documento simplesmente assuma essa premissa sem
  sustentá-la.
- **Indicação do destino do artefato** ("README.md" e/ou
  "docs/arquitetura/visao-geral-agente.md"): orienta o nível de formalidade e completude da
  redação — um documento de arquitetura/README precisa ser autoexplicativo para um leitor
  externo, diferente de uma nota de alinhamento interno entre autor e IA.

## Observações

Este documento (`visao-geral-agente.md`) é hoje a referência de escopo do projeto. Qualquer
mudança de peso no comportamento do agente (novo tipo de entrada, novo tipo de saída, mudança
no fluxo de nós) deveria, por consistência, resultar em uma nova versão deste prompt (ou de um
prompt subsequente que o revise) e em uma atualização correspondente do documento gerado, não
apenas em uma edição direta e não rastreada do Markdown.

## Histórico de alterações

| Versão | Data | Alteração | Commit/Referência |
|---|---|---|---|
| 1.0 | 2026-07-07 | Criação do registro | |
