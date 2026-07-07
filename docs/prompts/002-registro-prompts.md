# Prompt: Registro e Rastreabilidade de Prompts

## Identificação

- Código: 002
- Versão: 1.0
- Data: 2026-07-07
- Autor: dverdecia
- Status: Ativo

## Objetivo

Fazer a IA projetar e implementar, dentro do próprio projeto, um sistema de documentação e
rastreabilidade dos prompts usados no desenvolvimento e execução do agente — incluindo
convenções de nomenclatura e versionamento, um template reutilizável, exemplos reais e um
mecanismo automatizado (script + hook Git) que impeça a documentação incompleta de ser
commitada.

## Contexto de uso

Este é um prompt **meta**: seu assunto é a própria prática de engenharia de prompts do
projeto, não uma funcionalidade do agente de QA. Ele é usado uma única vez, na etapa em que se
decide formalizar (em vez de manter informalmente) o processo de documentação, e serve de base
para todos os registros de prompt subsequentes, incluindo [`001`](001-inicializacao-projeto.md)
e [`003`](003-definicao-agente-qa.md), que foram retroativamente estruturados segundo o padrão
aqui definido. Depende implicitamente de o projeto já ter sido inicializado (ver `001`).

Este registro é diferente dos demais por um motivo importante: **é o único, junto de sua
própria execução, em que o prompt documentado é reproduzido de forma literal e completa**, sem
reconstrução — porque a geração deste próprio arquivo é resultado direto da execução do
prompt abaixo. Isso o torna o exemplo mais forte de rastreabilidade do conjunto.

## Prompt utilizado

```text
Quero adicionar ao meu projeto Node.js com TypeScript um sistema de documentação e
rastreabilidade dos prompts utilizados durante o desenvolvimento e execução do agente de
IA.

Atue como especialista em engenharia de prompts, engenharia de contexto, documentação
técnica, Node.js, TypeScript e boas práticas de versionamento com Git.

Contexto: agente de IA com LangGraph JS para apoiar QA, projeto com apresentação
acadêmica — é preciso demonstrar processo consciente de engenharia de prompts/contexto,
não uso informal da IA.

Objetivo: criar estrutura em docs/ para registrar prompts relevantes, e um script de
validação em Node.js/TypeScript que garanta que os prompts sejam documentados
corretamente.

[Estrutura de pastas detalhada: docs/prompts/{README.md, prompt-template.md,
001-*.md, 002-*.md, 003-*.md}, docs/arquitetura/decisoes-tecnicas.md,
scripts/validate-prompts.ts]

[10 requisitos obrigatórios: README explicando o "porquê" e as convenções;
template com 11 seções fixas; 3 exemplos reais documentados; script de validação
cobrindo existência de pastas/arquivos, padrão de nome NNN-nome-do-prompt.md, seções
obrigatórias, campo de versão, objetivo/contexto/entrada/saída declarados; script
"validate:prompts" no package.json; hook pre-commit chamando o script; instruções de
instalação manual do hook e alternativa com Husky/framework pre-commit; checklist para
o desenvolvedor antes de registrar um novo prompt.]

Formato de resposta: seções numeradas 1 a 11, com conteúdo pronto para copiar para os
arquivos do projeto, em português do Brasil, técnico, priorizando rastreabilidade e
explicitamente evitando registro genérico de prompts.
```

> O prompt real enviado nesta sessão era mais extenso e detalhado que o resumo acima (incluía
> a árvore de diretórios completa e a lista literal dos 10 requisitos). Ele foi condensado aqui
> para legibilidade, preservando literalmente as instruções que determinaram decisões de
> engenharia (papel atribuído à IA, contexto do projeto, objetivo, estrutura, formato de
> resposta). O texto integral pode ser recuperado no histórico da conversa/sessão que originou
> este commit.

## Entrada esperada

- Estado atual do repositório (neste caso: projeto vazio, sem `package.json` nem `.git`
  inicializados).
- Especificação explícita da estrutura de pastas e arquivos desejada.
- Lista explícita de requisitos obrigatórios e do formato de resposta esperado.

## Saída esperada

- Todos os arquivos da estrutura solicitada, criados no repositório (não apenas descritos em
  texto).
- Uma resposta em chat organizada nas 11 seções pedidas, com conteúdo copiável.
- Script `scripts/validate-prompts.ts` executável via `npm run validate:prompts`, sem
  dependências externas além de `typescript`/`tsx`.

## Critérios de qualidade

- Nenhum prompt documentado deve ser genérico: cada exemplo precisa conter o texto do prompt e
  a justificativa de engenharia (o "porquê"), não apenas o "o quê".
- O script de validação deve falhar (`exit 1`) quando qualquer requisito estrutural estiver
  ausente, e ter mensagens de erro específicas por arquivo/seção.
- A documentação deve ser compreensível por um avaliador acadêmico que não participou da
  conversa original.
- Convenções (nomenclatura, versionamento) devem ser enunciadas uma única vez no `README.md` e
  reutilizadas consistentemente nos demais arquivos.

## Decisões de engenharia de prompt

- **Atribuição de papel ("Atue como especialista em...")**: concentra a resposta da IA nas
  dimensões relevantes (engenharia de prompt, engenharia de contexto, TS/Node, Git), reduzindo
  a chance de uma resposta genérica sobre "documentação de projeto".
- **Fornecimento de estrutura de pastas explícita em bloco de código**: elimina ambiguidade
  sobre nomes de arquivo e hierarquia, o que é crítico porque o script de validação depende
  exatamente desses nomes (`docs/prompts/README.md`, `prompt-template.md`, padrão
  `NNN-nome-do-prompt.md`).
- **Lista numerada de 10 requisitos obrigatórios**: transforma critérios de aceite implícitos
  em critérios explícitos e verificáveis — cada requisito pôde ser conferido item a item ao
  final da execução, em vez de depender de interpretação.
- **Especificação do formato de resposta (11 seções numeradas)**: separa claramente "o que deve
  existir no repositório" de "o que deve ser mostrado na conversa", evitando que a IA omita a
  exibição do conteúdo por já tê-lo escrito em arquivo.
- **Instrução negativa explícita ("não registre prompts de forma genérica")**: antecipa o erro
  mais provável ao gerar exemplos de documentação — a IA preencher o template com texto vago
  ("prompt para criar o projeto") em vez de conteúdo específico e justificado. Restrições
  negativas explícitas reduzem esse tipo de regressão à média.
- **Pedido de decisão sobre Husky vs. hook manual, sem impor uma das duas**: reconhece que a
  escolha de ferramenta depende de preferência da equipe/avaliador, então o prompt pede as
  duas alternativas documentadas em vez de uma decisão unilateral da IA.

## Observações

Este arquivo é reflexivo: ele documenta o prompt que fez a IA criar o próprio sistema de
documentação em que este arquivo vive. Isso é intencional e serve como prova de conceito do
sistema — se o `validate:prompts` aceitar este arquivo, ele valida sua própria origem.

## Histórico de alterações

| Versão | Data | Alteração | Commit/Referência |
|---|---|---|---|
| 1.0 | 2026-07-07 | Criação do registro | |
