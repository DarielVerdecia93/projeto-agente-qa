# Documentação e Rastreabilidade de Prompts

Esta pasta reúne o registro estruturado de todos os prompts relevantes utilizados no
desenvolvimento e na execução do agente de IA deste projeto (construído com **LangGraph JS**
para apoiar processos de QA). O objetivo é demonstrar, de forma auditável, que houve um
processo consciente de **engenharia de prompts** e **engenharia de contexto** — e não apenas
uso informal e não documentado de ferramentas de IA.

## Por que os prompts são documentados

* **Rastreabilidade acadêmica**: em um trabalho avaliativo, é preciso comprovar *como* e *por
  que* cada decisão foi tomada, não apenas apresentar o resultado final. Documentar prompts
  transforma decisões que aconteceriam "na conversa" em artefatos revisáveis.
* **Reprodutibilidade**: qualquer pessoa (professor, colega, o próprio autor no futuro) deve
  conseguir reexecutar um prompt e obter um resultado equivalente, entendendo o contexto que
  o originou.
* **Engenharia de contexto**: um prompt isolado, sem o contexto que o antecede (arquitetura já
  definida, decisões anteriores, restrições do domínio de QA), perde a maior parte do seu
  valor explicativo. Registrar contexto é tão importante quanto registrar o texto do prompt.
* **Evolução controlada**: prompts usados em agentes de IA tendem a ser refinados
  iterativamente. Sem versionamento, perde-se o histórico de *por que* um prompt mudou e o que
  motivou a mudança (bug, ambiguidade, resultado insatisfatório, novo requisito).
* **Diferenciação entre "pedir algo à IA" e "projetar um comportamento"**: o registro deixa
  explícito o raciocínio de engenharia — restrições, formato de saída esperado, critérios de
  qualidade — e não somente a pergunta feita.

## Como nomear novos prompts

Todo arquivo de prompt segue o padrão:

```
NNN-nome-do-prompt.md
```

* `NNN`: número sequencial de 3 dígitos, com zero à esquerda (`001`, `002`, `003`, ...). O
  número reflete a ordem cronológica de criação do registro, não a ordem de execução do
  prompt no fluxo do agente.
* `nome-do-prompt`: descrição curta em `kebab-case`, em português, usando apenas letras
  minúsculas, números e hífen (sem acentos, sem espaços, sem caracteres especiais).
* Extensão sempre `.md`.

Exemplos válidos:

* `001-inicializacao-projeto.md`
* `002-registro-prompts.md`
* `003-definicao-agente-qa.md`
* `004-refinamento-prompt-classificacao-bugs.md`

Exemplos **inválidos**: `Prompt_02.md` (fora do padrão), `2-teste.md` (número sem 3 dígitos),
`003-Definição Agente QA.md` (acentos e espaços).

`README.md` e `prompt-template.md` são exceções ao padrão — são arquivos de apoio, não
registros de prompt, e por isso não seguem a nomenclatura `NNN-nome-do-prompt.md`.

## Como versionar prompts

Cada prompt tem seu próprio ciclo de vida. Regras de versionamento:

1. **Um arquivo por prompt "canônico"**. Se um prompt é refinado de forma incremental (mesmo
   objetivo, ajustes de redação), atualize a seção **Versão** e registre a mudança em
   **Histórico de alterações**, dentro do mesmo arquivo — não crie um novo arquivo `NNN`.
2. **Um novo arquivo `NNN`** é criado apenas quando o **objetivo** do prompt muda de forma
   substancial (ou seja, deixa de ser uma revisão e passa a ser outra decisão de engenharia).
3. O campo **Versão** segue o formato `MAJOR.MINOR`:
   * `MINOR` (`1.0` → `1.1`): ajuste de redação, correção de ambiguidade, pequeno refinamento
     que não muda o objetivo nem o formato de saída esperado.
   * `MAJOR` (`1.x` → `2.0`): mudança de objetivo, de formato de saída esperado, ou reescrita
     estrutural do prompt.
4. O **Status** (`Ativo`, `Descontinuado`, `Em revisão`) indica se o prompt documentado ainda
   é o que está em uso pelo agente/processo atual.
5. O código Git do commit que introduziu ou alterou o prompt deve ser referenciado no
   **Histórico de alterações** sempre que possível (`git log --oneline -- docs/prompts/NNN-*.md`).

## Como registrar contexto

A seção **Contexto de uso** deve responder: *em que situação este prompt é utilizado?*
Inclua, quando aplicável:

* Em que etapa do fluxo do agente LangGraph o prompt é usado (nó do grafo, ferramenta,
  etapa de raciocínio).
* Que informações precisam estar disponíveis antes do prompt ser enviado (histórico de
  conversa, resultado de uma ferramenta anterior, dados de entrada do usuário).
* Restrições de domínio relevantes (ex.: o agente atua sobre casos de teste de QA, não sobre
  código de produção).
* Dependências de outros prompts ou decisões documentadas (linkar pelo código, ex.: "depende
  do prompt `003`").

## Como registrar objetivo

A seção **Objetivo** deve ser uma frase objetiva descrevendo *o que este prompt deve alcançar*,
não apenas *o que foi pedido*. Prefira objetivos verificáveis (“gerar 5 casos de teste
cobrindo os cenários X, Y e Z” em vez de “ajudar com testes”).

## Como registrar entrada esperada

Descreva o formato e o conteúdo mínimo que o prompt espera receber como entrada (variáveis de
contexto, dados do usuário, saída de uma etapa anterior do grafo). Se possível, inclua um
exemplo concreto de entrada.

## Como registrar saída esperada

Descreva o formato esperado da resposta (texto livre, JSON estruturado, lista, código) e os
critérios que tornam a saída válida. Sempre que a saída for estruturada, inclua um exemplo.

## Como registrar decisões importantes

A seção **Decisões de engenharia de prompt** deve justificar escolhas não óbvias: por que o
prompt foi escrito daquela forma, por que determinada restrição foi imposta, por que um
formato de saída foi escolhido em vez de outro, que alternativas foram descartadas e por quê.
Esta é a seção mais importante para fins acadêmicos: é aqui que se demonstra raciocínio de
engenharia, não apenas resultado.

## Boas práticas para manutenção da documentação

* **Nunca documente prompts de forma genérica.** Um prompt registrado deve conter o texto real
  utilizado (ou uma versão fiel e reprodutível dele), não um resumo vago.
* **Sempre explique o "porquê", não só o "o quê".** Um prompt sem justificativa de engenharia
  tem baixo valor acadêmico.
* **Mantenha o índice mental atualizado**: ao criar um novo prompt, verifique se ele não
  duplica ou substitui um prompt existente — nesse caso, atualize o arquivo existente.
* **Rode a validação antes de commitar**: use `npm run validate:prompts` (ver
  [`scripts/validate-prompts.ts`](../../scripts/validate-prompts.ts)) para garantir que a
  estrutura e as seções obrigatórias estão presentes.
* **Um prompt, um arquivo, uma responsabilidade.** Evite arquivos que misturam vários prompts
  não relacionados.
* **Escreva para quem não estava na conversa.** O arquivo deve ser compreensível para um
  avaliador que não participou do desenvolvimento.
* **Referencie decisões de arquitetura** quando pertinente, apontando para
  [`docs/arquitetura/decisoes-tecnicas.md`](../arquitetura/decisoes-tecnicas.md).

## Arquivos desta pasta

| Arquivo | Papel |
|---|---|
| `README.md` | Este documento — guia de uso e convenções. |
| `prompt-template.md` | Modelo reutilizável para novos registros de prompt. |
| `NNN-nome-do-prompt.md` | Registros individuais de prompts, em ordem cronológica de criação. |
