# Prompt: Prompts Operacionais do Agente de QA (Runtime)

## Identificação

- Código: 005
- Versão: 1.4
- Data: 2026-07-14
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
| `SELECT_ANALYSIS_TOOL_PROMPT` | `extract-information.ts` (seleção de tool via tool calling) | tool call (uma das tools de `src/tools/analysis-tools.ts`) |
| `ANALYZE_FREE_TEXT_PROMPT` | tool `analisar_texto_livre` (`src/tools/analysis-tools.ts`) | `extractedInfoSchema` |
| `ANALYZE_API_CHANGE_PROMPT` | tool `analisar_alteracao_api` (`src/tools/analysis-tools.ts`) | `extractedInfoSchema` |
| `ANALYZE_MARKDOWN_DOC_PROMPT` | tool `analisar_documento_markdown` (`src/tools/analysis-tools.ts`) | `extractedInfoSchema` |
| `EXTRACT_INFORMATION_PROMPT` | `extract-information.ts` (fallback determinístico) | `extractedInfoSchema` |
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
- um resumo técnico completo (um ou dois parágrafos), explicando o comportamento esperado, o
  contexto de uso e o impacto da funcionalidade para o usuário ou para o sistema — não se
  limite a uma frase curta, detalhe o que já está no texto;
- os componentes/módulos do sistema afetados;
- as entidades de negócio envolvidas (ex.: pedido, cliente, pagamento);
- os critérios técnicos ou de aceite explicitamente mencionados no texto.

Extraia apenas o que está explícito ou razoavelmente implícito no texto. Não invente
componentes, entidades ou comportamentos que não tenham qualquer indício na demanda —
verbosidade é bem-vinda apenas para detalhar o que já está no texto, não para adicionar
informação nova.
```

### Selecionar tool de análise (`SELECT_ANALYSIS_TOOL_PROMPT`)

```text
Você é um roteador de análise de QA. Você recebe uma demanda técnica e a classificação já
feita. Sua única tarefa é escolher e chamar exatamente UMA das ferramentas (tools) de análise
disponíveis, a que for mais adequada ao formato e ao conteúdo da demanda:

- "analisar_alteracao_api": quando a demanda descreve criação/alteração de endpoints, contratos,
  payloads, integrações ou versionamento de API;
- "analisar_documento_markdown": quando a demanda é um documento estruturado em Markdown
  (títulos "#", listas, tabelas, seções de critérios de aceite);
- "analisar_texto_livre": para os demais casos — texto corrido, histórias de usuário, bugs,
  tarefas técnicas sem estrutura de documento.

Sempre chame uma ferramenta; nunca responda com texto. Preencha "motivoEscolha" com uma frase
objetiva explicando a escolha.
```

### Tools de análise especializadas (`ANALYZE_FREE_TEXT_PROMPT`, `ANALYZE_API_CHANGE_PROMPT`, `ANALYZE_MARKDOWN_DOC_PROMPT`)

Cada uma reutiliza integralmente o texto de `EXTRACT_INFORMATION_PROMPT` (acima) e acrescenta
um parágrafo de foco específico:

```text
Foco específico desta análise (texto livre): a demanda vem em texto corrido, sem estrutura
formal. Dê atenção a requisitos implícitos no meio da narrativa, fluxos de usuário descritos em
sequência e critérios de aceite mencionados de forma indireta (ex.: "deve", "não pode",
"apenas quando").
```

```text
Foco específico desta análise (alteração de API): identifique endpoints e verbos HTTP afetados,
mudanças de contrato (campos novos/removidos/renomeados, tipos, obrigatoriedade), códigos de
resposta e erros esperados, consumidores impactados e necessidade de compatibilidade retroativa
ou versionamento. Liste esses elementos em "componentesAfetados" e "criteriosMencionados"
quando presentes no texto.
```

```text
Foco específico desta análise (documento Markdown): a demanda é um documento estruturado.
Respeite a estrutura de seções (títulos, listas, tabelas): critérios de aceite listados devem
ser transcritos em "criteriosMencionados" preservando o sentido de cada item, e seções que
nomeiam módulos/serviços devem alimentar "componentesAfetados". Não perca informação que esteja
em tabelas ou listas aninhadas.
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

Preencha, para cada risco, dois campos separados: "descricao" — um texto completo (2 a 4 frases)
explicando o que pode falhar, por que isso é um risco neste contexto específico e qual seria o
impacto caso o risco se concretizasse, sem mencionar a severidade dentro desse texto — e
"severidade" — exatamente um dos valores "baixa", "media", "alta" ou "critica", coerente com o
impacto descrito em "descricao". Não gere riscos genéricos desconectados do conteúdo da demanda.
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
Você é um engenheiro de QA experiente escrevendo casos de teste técnicos para execução real por
outro QA — não uma descrição de funcionalidade para um cliente ou stakeholder de negócio. Evite
frases genéricas que apenas reformulam o critério de aceite (ex.: "o usuário faz login e acessa
a área restrita"); em vez disso, torne explícita a condição técnica isolada por cada cenário,
como faria ao aplicar particionamento de equivalência, análise de valor limite ou tabela de
decisão.

Gere cenários de teste cobrindo TODAS as categorias definidas na estratégia de testes fornecida
— nunca deixe uma categoria aplicável sem nenhum cenário, mesmo que a demanda não cite
explicitamente um exemplo daquele tipo. Para cada categoria aplicável, gere pelo menos 4
cenários (mais, se a demanda tiver complexidade suficiente) — NÃO se limite a um cenário por
critério de aceite explicitamente citado no texto. No mínimo, cada categoria aplicável deve
conter: 1) um cenário de caminho feliz; 2) um cenário de caso de borda (valor limite, quantidade
mínima ou máxima, ex.: exatamente a última tentativa antes do bloqueio); 3) um cenário de caso
negativo (dado inválido, ausente ou malformado); 4) um cenário adicional que você julgue
relevante para o domínio da demanda (ex.: repetição, concorrência, estado inesperado do
sistema).

Se "integracao" estiver entre as categorias aplicáveis, gere cenários que exercitem a comunicação
entre os componentes/módulos afetados (ex.: módulo chamando outro módulo ou serviço externo,
persistência no banco de dados, resposta de erro de uma dependência). Se "nao-funcional" estiver
entre as categorias aplicáveis, gere cenários sobre atributos como desempenho sob carga, tempo de
resposta, segurança (ex.: tentativa de força bruta, injeção de dados maliciosos no campo) ou
disponibilidade, com base no que a demanda ou os riscos identificados sugerem. Não gere cenários
redundantes — cada cenário deve testar uma condição distinta das demais.

Título: nomeie cada cenário pela condição técnica isolada (ex.: "Bloqueio na 5ª tentativa
consecutiva com senha inválida"), nunca apenas pela funcionalidade de negócio já citada no texto
da demanda (ex.: NÃO use títulos genéricos como "Login com credenciais válidas" sem qualificar
a condição/dado testado).

Para cada cenário, informe título, tipo e um array de passos com no mínimo 3 itens objetivos e
técnicos (nunca resuma a ação inteira em um único passo genérico, e nunca escreva apenas
"credenciais válidas"/"credenciais inválidas"/"dados válidos" sem um valor literal ao lado):
1) a pré-condição/estado inicial, com pelo menos um dado de teste literal entre aspas (ex.:
   e-mail: "usuario.teste@dominio.com", senha inválida: "Senha#000", "5ª tentativa consecutiva"
   quando o cenário depender de uma contagem específica);
2) a ação técnica executada, repetindo o dado literal exato enviado/preenchido/disparado (não
   apenas "o usuário faz login");
3) a verificação técnica do resultado — o que exatamente deve ser inspecionado (ex.: código de
   resposta esperado, texto da mensagem de erro quando mencionado na demanda, estado persistido,
   entrada de log gerada), adaptando o nível técnico ao tipo de sistema descrito na demanda e sem
   inventar detalhes de implementação (ex.: código HTTP) que a demanda não sugira.
Informe também o resultado esperado como uma afirmação verificável e específica (não repita a
ação em outras palavras) e, na evidência sugerida, prefira evidência técnica (payload de
requisição/resposta, entrada de log com os campos esperados, registro no banco de dados) e use
"print de tela" apenas quando não houver evidência técnica mais direta disponível.

Gere também um checklist de validação (itens objetivos e verificáveis, cobrindo tanto o
comportamento esperado quanto os riscos identificados) e recomendações práticas para o QA que
for executar os testes. Leve em conta os riscos e as ambiguidades já identificados.
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
- **Arquitetura híbrida: fluxo determinístico de nós + tools onde há decisão real** (v1.4): o
  grafo continua garantindo por código que toda análise passa por todas as etapas, mas dois
  pontos passaram a usar tools (`src/tools/`): a extração de informações, em que o LLM escolhe
  via tool calling a análise especializada mais adequada ao formato da demanda (texto livre,
  alteração de API ou documento Markdown), com fallback determinístico para
  `EXTRACT_INFORMATION_PROMPT` se nenhuma tool válida for chamada; e a saída final, em que a
  geração do relatório Markdown e do PDF são tools reutilizáveis invocadas pelo nó
  (`buildFinalOutput`) de forma determinística — a escolha do formato de saída vem da flag
  `--pdf` do CLI, não do LLM, porque não há sinal na demanda que justifique delegar essa
  decisão ao modelo.
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
| 1.1 | 2026-07-13 | Relatório final considerado pouco detalhado (resumo técnico curto, riscos como rótulo, cenários limitados ao caminho feliz). Ajuste de redação (sem mudança de objetivo ou de schema) em `EXTRACT_INFORMATION_PROMPT`, `ASSESS_RISKS_PROMPT` e `GENERATE_SCENARIOS_PROMPT` para pedir explicitamente resumo técnico em parágrafo(s), descrição de risco justificada e cobertura de casos de borda/negativos além do caminho feliz | |
| 1.2 | 2026-07-13 | Cenários gerados liam como descrição de funcionalidade para cliente/negócio, não como caso de teste técnico para QA. Ajuste de redação em `GENERATE_SCENARIOS_PROMPT` para exigir dados de teste concretos nos passos, verificação técnica do resultado (código de resposta, log, estado persistido) e evidência técnica preferencial sobre print de tela | |
| 1.3 | 2026-07-13 | Após teste real, o LLM ainda escrevia passos com "credenciais válidas/inválidas" sem valor literal e títulos genéricos repetindo a funcionalidade de negócio. Reforço de redação em `GENERATE_SCENARIOS_PROMPT`: exigência explícita de valor literal entre aspas no passo de pré-condição/ação, e título nomeado pela condição técnica isolada, não pela funcionalidade | |
| 1.4 | 2026-07-14 | Introdução de tools (arquitetura híbrida): novos prompts `SELECT_ANALYSIS_TOOL_PROMPT` (seleção de tool de análise via tool calling) e `ANALYZE_FREE_TEXT_PROMPT`/`ANALYZE_API_CHANGE_PROMPT`/`ANALYZE_MARKDOWN_DOC_PROMPT` (especializações de `EXTRACT_INFORMATION_PROMPT`); `EXTRACT_INFORMATION_PROMPT` passa a ser o fallback determinístico. Saída (Markdown/PDF) encapsulada nas tools `gerar_relatorio_markdown` e `gerar_relatorio_pdf` | |
