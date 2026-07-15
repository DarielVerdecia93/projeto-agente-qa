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
- um resumo técnico completo (um ou dois parágrafos), explicando o comportamento esperado, o
  contexto de uso e o impacto da funcionalidade para o usuário ou para o sistema — não se
  limite a uma frase curta, detalhe o que já está no texto;
- os componentes/módulos do sistema afetados;
- as entidades de negócio envolvidas (ex.: pedido, cliente, pagamento);
- os critérios técnicos ou de aceite explicitamente mencionados no texto.

Extraia apenas o que está explícito ou razoavelmente implícito no texto. Não invente
componentes, entidades ou comportamentos que não tenham qualquer indício na demanda —
verbosidade é bem-vinda apenas para detalhar o que já está no texto, não para adicionar
informação nova.`;

export const SELECT_ANALYSIS_TOOL_PROMPT = `Você é um roteador de análise de QA. Você recebe uma demanda técnica e a classificação já
feita. Sua única tarefa é escolher e chamar exatamente UMA das ferramentas (tools) de análise
disponíveis, a que for mais adequada ao formato e ao conteúdo da demanda:

- "analisar_alteracao_api": quando a demanda descreve criação/alteração de endpoints, contratos,
  payloads, integrações ou versionamento de API;
- "analisar_documento_markdown": quando a demanda é um documento estruturado em Markdown
  (títulos "#", listas, tabelas, seções de critérios de aceite);
- "analisar_texto_livre": para os demais casos — texto corrido, histórias de usuário, bugs,
  tarefas técnicas sem estrutura de documento.

Sempre chame uma ferramenta; nunca responda com texto. Preencha "motivoEscolha" com uma frase
objetiva explicando a escolha.`;

export const ANALYZE_FREE_TEXT_PROMPT = `${EXTRACT_INFORMATION_PROMPT}

Foco específico desta análise (texto livre): a demanda vem em texto corrido, sem estrutura
formal. Dê atenção a requisitos implícitos no meio da narrativa, fluxos de usuário descritos em
sequência e critérios de aceite mencionados de forma indireta (ex.: "deve", "não pode",
"apenas quando").`;

export const ANALYZE_API_CHANGE_PROMPT = `${EXTRACT_INFORMATION_PROMPT}

Foco específico desta análise (alteração de API): identifique endpoints e verbos HTTP afetados,
mudanças de contrato (campos novos/removidos/renomeados, tipos, obrigatoriedade), códigos de
resposta e erros esperados, consumidores impactados e necessidade de compatibilidade retroativa
ou versionamento. Liste esses elementos em "componentesAfetados" e "criteriosMencionados"
quando presentes no texto.`;

export const ANALYZE_MARKDOWN_DOC_PROMPT = `${EXTRACT_INFORMATION_PROMPT}

Foco específico desta análise (documento Markdown): a demanda é um documento estruturado.
Respeite a estrutura de seções (títulos, listas, tabelas): critérios de aceite listados devem
ser transcritos em "criteriosMencionados" preservando o sentido de cada item, e seções que
nomeiam módulos/serviços devem alimentar "componentesAfetados". Não perca informação que esteja
em tabelas ou listas aninhadas.`;

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

Preencha, para cada risco, dois campos separados: "descricao" — um texto completo (2 a 4 frases)
explicando o que pode falhar, por que isso é um risco neste contexto específico e qual seria o
impacto caso o risco se concretizasse, sem mencionar a severidade dentro desse texto — e
"severidade" — exatamente um dos valores "baixa", "media", "alta" ou "critica", coerente com o
impacto descrito em "descricao". Não gere riscos genéricos desconectados do conteúdo da demanda.`;

export const DEFINE_TEST_STRATEGY_PROMPT = `Você é um estrategista de testes de QA. Com base no tipo da demanda e nas informações
extraídas, decida quais categorias de teste fazem sentido entre: "funcional", "unitario",
"integracao" e "nao-funcional". Justifique a escolha, explicando por que alguma categoria foi
incluída ou deliberadamente descartada para este tipo de demanda.`;

export const GENERATE_SCENARIOS_PROMPT = `Você é um engenheiro de QA experiente escrevendo casos de teste técnicos para execução real por
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
for executar os testes. Leve em conta os riscos e as ambiguidades já identificados.`;

export const REVIEW_CONSISTENCY_PROMPT = `Você é um revisor de qualidade da própria análise de QA. Avalie se os cenários de teste, o
checklist e as recomendações gerados são consistentes com a classificação, as informações
extraídas, as premissas assumidas e os riscos identificados. Aponte problemas apenas se houver
contradição real ou lacuna grave (ex.: risco crítico sem nenhum cenário relacionado). Não
reprove por preferências estilísticas.`;
