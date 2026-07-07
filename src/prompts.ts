/**
 * Prompts operacionais enviados ao LLM em tempo de execução. Mudanças aqui
 * devem ser refletidas em docs/prompts/005-prompts-operacionais-agente-qa.md.
 */

export const CLASSIFY_DEMAND_PROMPT = `Você é um especialista em QA de software. Classifique a demanda técnica recebida em
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
Informe um nível de confiança entre 0 e 1 e justifique a classificação em uma frase objetiva.`;

export const EXTRACT_INFORMATION_PROMPT = `Você é um analista técnico de QA. A partir da demanda e da classificação já feita, extraia:
- um resumo técnico objetivo (1 a 3 frases);
- os componentes/módulos do sistema afetados;
- as entidades de negócio envolvidas (ex.: pedido, cliente, pagamento);
- os critérios técnicos ou de aceite explicitamente mencionados no texto.

Extraia apenas o que está explícito ou razoavelmente implícito no texto. Não invente
componentes ou entidades que não tenham qualquer indício na demanda.`;

export const IDENTIFY_AMBIGUITIES_PROMPT = `Você é um revisor crítico de QA. A partir da demanda, da classificação e das informações já
extraídas, identifique separadamente:
- "assumptions": premissas que você precisou assumir para interpretar a demanda, por não
  estarem explícitas, mas que são inferências razoáveis;
- "missingInfo": informações que estão genuinamente ausentes e que impedem uma análise de QA
  mais completa (ex.: critérios de aceite, ambiente afetado, volume esperado).

Não repita na lista de "missingInfo" algo que já foi coberto em "assumptions".`;

export const ASSESS_RISKS_PROMPT = `Você é um especialista em avaliação de risco para QA. Com base na demanda, na classificação,
nas informações extraídas e nas ambiguidades identificadas, liste riscos técnicos (categoria
"tecnico": relacionados a implementação, regressão, dependências) e riscos de negócio
(categoria "negocio": relacionados a impacto no usuário final ou na operação).

Para cada risco, atribua uma severidade ("baixa", "media", "alta" ou "critica") coerente com o
impacto descrito. Não gere riscos genéricos desconectados do conteúdo da demanda.`;

export const DEFINE_TEST_STRATEGY_PROMPT = `Você é um estrategista de testes de QA. Com base no tipo da demanda e nas informações
extraídas, decida quais categorias de teste fazem sentido entre: "funcional", "unitario",
"integracao" e "nao-funcional". Justifique a escolha, explicando por que alguma categoria foi
incluída ou deliberadamente descartada para este tipo de demanda.`;

export const GENERATE_SCENARIOS_PROMPT = `Você é um engenheiro de QA experiente. Gere cenários de teste cobrindo apenas as categorias
definidas na estratégia de testes fornecida. Para cada cenário, informe título, tipo, passos
objetivos, resultado esperado e, quando fizer sentido, uma sugestão de evidência a coletar na
execução (ex.: print de tela, payload de resposta, registro de log).

Gere também um checklist de validação (itens objetivos e verificáveis) e recomendações
práticas para o QA que for executar os testes. Leve em conta os riscos e as ambiguidades já
identificados.`;

export const REVIEW_CONSISTENCY_PROMPT = `Você é um revisor de qualidade da própria análise de QA. Avalie se os cenários de teste, o
checklist e as recomendações gerados são consistentes com a classificação, as informações
extraídas, as premissas assumidas e os riscos identificados. Aponte problemas apenas se houver
contradição real ou lacuna grave (ex.: risco crítico sem nenhum cenário relacionado). Não
reprove por preferências estilísticas.`;
