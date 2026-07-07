# Prompt: Prompts Operacionais do Agente de QA (Runtime)

## Identificação

- Código: 005
- Versão: 1.0
- Data: 2026-07-07
- Autor: dverdecia
- Status: Ativo

## Objetivo

Documentar, como um conjunto coeso, os prompts que o agente **envia ao LLM em tempo de
execução** — um por nó do grafo LangGraph JS que exige raciocínio — implementados em
[`src/prompts.ts`](../../src/prompts.ts) e usados pelos nós em
[`src/nodes/`](../../src/nodes/). Diferente de [`001`](001-inicializacao-projeto.md)–
[`004`](004-visao-geral-agente.md), este registro não documenta um prompt dado à IA que
construiu o projeto — documenta o comportamento do próprio agente em produção.

## Contexto de uso

Implementa o fluxo definido em
[`docs/arquitetura/visao-geral-agente.md`](../arquitetura/visao-geral-agente.md) (seção 5,
"Fluxo geral do agente") e o modelo de estado da seção 6. Cada prompt abaixo corresponde a um
nó do `StateGraph` construído em [`src/graph.ts`](../../src/graph.ts):

| Prompt (constante em `src/prompts.ts`) | Nó (`src/nodes/`) | Schema de saída (`src/schemas.ts`) |
|---|---|---|
| `CLASSIFY_DEMAND_PROMPT` | `classify-demand.ts` | `classificationSchema` |
| `EXTRACT_INFORMATION_PROMPT` | `extract-information.ts` | `extractedInfoSchema` |
| `IDENTIFY_AMBIGUITIES_PROMPT` | `identify-ambiguities.ts` | `ambiguitiesSchema` |
| `ASSESS_RISKS_PROMPT` | `assess-risks.ts` | `risksSchema` |
| `DEFINE_TEST_STRATEGY_PROMPT` | `define-test-strategy.ts` | `testStrategySchema` |
| `GENERATE_SCENARIOS_PROMPT` | `generate-scenarios.ts` | `scenariosSchema` |
| `REVIEW_CONSISTENCY_PROMPT` | `review-consistency.ts` | `consistencyReviewSchema` |

Os nós `receiveInput`, `validateInput` e `buildFinalOutput`/`requestMoreInfo` são
deterministas (sem chamada ao LLM) e por isso não têm prompt associado — ver justificativa na
seção "Decisões de engenharia de prompt".

Cada prompt é enviado como mensagem de sistema (`SystemMessage`) via
[`src/structured-call.ts`](../../src/structured-call.ts), acompanhado de uma mensagem humana
(`HumanMessage`) contendo o recorte relevante do estado do agente em JSON, e o modelo é
vinculado (`withStructuredOutput`) ao schema Zod correspondente — a saída do LLM é sempre um
objeto validado, nunca texto livre não estruturado.

## Prompt utilizado

### Classificar demanda (`CLASSIFY_DEMAND_PROMPT`)

```text
Você é um especialista em QA de software. Classifique a demanda técnica recebida em
exatamente um dos tipos abaixo:

- historia-usuario
- tarefa-tecnica
- bug
- deploy
- alteracao-api
- mudanca-banco-dados
- ajuste-configuracao
- texto-livre

Use "texto-livre" apenas quando a demanda não se encaixar claramente em nenhum outro tipo.
Informe um nível de confiança entre 0 e 1 e justifique a classificação em uma frase objetiva.
```

### Extrair informações relevantes (`EXTRACT_INFORMATION_PROMPT`)

```text
Você é um analista técnico de QA. A partir da demanda e da classificação já feita, extraia:
- um resumo técnico objetivo (1 a 3 frases);
- os componentes/módulos do sistema afetados;
- as entidades de negócio envolvidas (ex.: pedido, cliente, pagamento);
- os critérios técnicos ou de aceite explicitamente mencionados no texto.

Extraia apenas o que está explícito ou razoavelmente implícito no texto. Não invente
componentes ou entidades que não tenham qualquer indício na demanda.
```

### Identificar ambiguidades (`IDENTIFY_AMBIGUITIES_PROMPT`)

```text
Você é um revisor crítico de QA. A partir da demanda, da classificação e das informações já
extraídas, identifique separadamente:
- "assumptions": premissas que você precisou assumir para interpretar a demanda, por não
  estarem explícitas, mas que são inferências razoáveis;
- "missingInfo": informações que estão genuinamente ausentes e que impedem uma análise de QA
  mais completa (ex.: critérios de aceite, ambiente afetado, volume esperado).

Não repita na lista de "missingInfo" algo que já foi coberto em "assumptions".
```

### Avaliar riscos (`ASSESS_RISKS_PROMPT`)

```text
Você é um especialista em avaliação de risco para QA. Com base na demanda, na classificação,
nas informações extraídas e nas ambiguidades identificadas, liste riscos técnicos (categoria
"tecnico": relacionados a implementação, regressão, dependências) e riscos de negócio
(categoria "negocio": relacionados a impacto no usuário final ou na operação).

Para cada risco, atribua uma severidade ("baixa", "media", "alta" ou "critica") coerente com o
impacto descrito. Não gere riscos genéricos desconectados do conteúdo da demanda.
```

### Definir estratégia de testes (`DEFINE_TEST_STRATEGY_PROMPT`)

```text
Você é um estrategista de testes de QA. Com base no tipo da demanda e nas informações
extraídas, decida quais categorias de teste fazem sentido entre: "funcional", "unitario",
"integracao" e "nao-funcional". Justifique a escolha, explicando por que alguma categoria foi
incluída ou deliberadamente descartada para este tipo de demanda.
```

### Gerar cenários de teste (`GENERATE_SCENARIOS_PROMPT`)

```text
Você é um engenheiro de QA experiente. Gere cenários de teste cobrindo apenas as categorias
definidas na estratégia de testes fornecida. Para cada cenário, informe título, tipo, passos
objetivos, resultado esperado e, quando fizer sentido, uma sugestão de evidência a coletar na
execução (ex.: print de tela, payload de resposta, registro de log).

Gere também um checklist de validação (itens objetivos e verificáveis) e recomendações
práticas para o QA que for executar os testes. Leve em conta os riscos e as ambiguidades já
identificados.
```

### Revisar consistência (`REVIEW_CONSISTENCY_PROMPT`)

```text
Você é um revisor de qualidade da própria análise de QA. Avalie se os cenários de teste, o
checklist e as recomendações gerados são consistentes com a classificação, as informações
extraídas, as premissas assumidas e os riscos identificados. Aponte problemas apenas se houver
contradição real ou lacuna grave (ex.: risco crítico sem nenhum cenário relacionado). Não
reprove por preferências estilísticas.
```

## Entrada esperada

Cada prompt recebe, via `HumanMessage`, um objeto JSON com o recorte do `AgentState`
relevante para aquele nó (ver tabela de mapeamento acima e as chamadas em
`src/nodes/*.ts`). Nenhum prompt recebe o estado inteiro — apenas os campos de que
depende, para reduzir ruído e custo de tokens.

## Saída esperada

Cada prompt produz um objeto JSON validado contra o schema Zod correspondente (coluna
"Schema de saída" da tabela acima), nunca texto livre. Em caso de falha de validação, a
chamada (`model.withStructuredOutput`) rejeita a resposta antes que ela alcance o estado do
agente — falhas de formatação do LLM não corrompem o estado.

## Critérios de qualidade

- Nenhum prompt deve induzir invenção de dados não presentes na entrada (ver restrições
  explícitas em `EXTRACT_INFORMATION_PROMPT` e `ASSESS_RISKS_PROMPT`).
- A saída de cada nó deve ser estruturalmente válida segundo o schema Zod (garantido em tempo
  de execução por `withStructuredOutput`, não apenas por instrução textual no prompt).
- `REVIEW_CONSISTENCY_PROMPT` deve reprovar apenas contradições reais, para evitar loops de
  reprocessamento desnecessários (ver `MAX_CONSISTENCY_RETRIES` em `src/state.ts`).
- Mudança em qualquer prompt desta lista exige atualização deste arquivo (versão +
  histórico) na mesma alteração de código.

## Decisões de engenharia de prompt

- **Saída estruturada (function calling) em vez de texto livre + parsing manual**: cada
  prompt é acoplado a um schema Zod via `withStructuredOutput`. Isso elimina uma classe inteira
  de falhas (JSON malformado, campos ausentes, tipos incorretos) que ocorreriam com parsing de
  texto livre, e torna o estado do agente confiável para os nós seguintes do grafo.
- **Um prompt por responsabilidade, não um prompt monolítico**: seguir a granularidade dos nós
  definida em [`003`](003-definicao-agente-qa.md)/[`004`](004-visao-geral-agente.md), em vez de
  pedir tudo (classificação + extração + riscos + cenários) em uma única chamada, permite que
  cada nó receba apenas o contexto de que precisa, facilita depuração (é possível inspecionar o
  resultado de cada etapa isoladamente) e possibilita o loop de revisão de consistência sem
  refazer todo o trabalho anterior.
- **Restrição anti-invenção explícita** em `EXTRACT_INFORMATION_PROMPT` e
  `ASSESS_RISKS_PROMPT` ("não invente...", "não gere riscos genéricos..."): mitiga o risco de
  alucinação em um domínio (QA) onde uma informação inventada e não sinalizada pode levar a um
  teste irrelevante ou a uma falsa sensação de cobertura.
- **`REVIEW_CONSISTENCY_PROMPT` calibrado para não ser excessivamente rigoroso** ("não reprove
  por preferências estilísticas"): sem essa calibração, um revisor de LLM tende a encontrar
  sempre algum problema, disparando o loop de nova geração de cenários indefinidamente (mitigado
  também estruturalmente por `MAX_CONSISTENCY_RETRIES = 1` em `src/state.ts`).
- **Ausência deliberada de prompt para `receiveInput`, `validateInput` e
  `buildFinalOutput`/`requestMoreInfo`**: normalização de texto, checagem de tamanho mínimo e
  serialização em Markdown são operações determinísticas — usar um LLM para elas adicionaria
  custo, latência e uma fonte de não determinismo sem benefício, contrariando o princípio de
  usar IA apenas onde há de fato julgamento a ser feito (ver seção 8,
  "Por que é um agente e não um script", em
  [`visao-geral-agente.md`](../arquitetura/visao-geral-agente.md)).
- **Contexto enviado como JSON estruturado (`HumanMessage` com `JSON.stringify` do recorte do
  estado), não como prosa**: reduz ambiguidade de interpretação pelo LLM sobre qual informação é
  "a demanda original" versus "informação já derivada por um nó anterior" — importante porque
  vários nós recebem tanto o texto original quanto resultados de nós anteriores.

## Observações

Como estes prompts fazem parte do comportamento observável do agente (não apenas do processo
de construção dele), qualquer alteração aqui tem efeito direto na saída entregue ao QA — por
isso a recomendação, no README desta pasta, de que mudanças em `src/prompts.ts` sejam
acompanhadas de atualização deste arquivo na mesma alteração de código, e idealmente do mesmo
commit.

## Histórico de alterações

| Versão | Data | Alteração | Commit/Referência |
|---|---|---|---|
| 1.0 | 2026-07-07 | Criação do registro, cobrindo os 7 prompts operacionais implementados na primeira versão do agente | |
