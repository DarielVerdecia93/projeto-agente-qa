# Visão Geral do Agente de QA (LangGraph JS)

> Documento de definição técnica do projeto. Serve como base para o `README.md` e como
> referência de arquitetura para a implementação do agente em `src/`. Para o histórico de
> prompts que originou este documento, ver
> [`docs/prompts/`](../prompts/README.md). Para decisões técnicas derivadas dele, ver
> [`decisoes-tecnicas.md`](decisoes-tecnicas.md).

## 1. Problema

Equipes de QA raramente recebem demandas na forma idealizada de uma história de usuário bem
escrita, com critérios de aceite explícitos. Na prática, o insumo de trabalho do QA é
heterogêneo: chega como tarefa técnica, bug reportado em produção, solicitação de deploy,
alteração de contrato de API, migração ou alteração de schema de banco de dados, ajuste de
configuração de ambiente, ou simplesmente um texto informal escrito às pressas em um card ou
mensagem.

Essa heterogeneidade gera três problemas concretos e recorrentes:

1. **Custo cognitivo repetido de interpretação.** Antes de sequer pensar em testes, o QA
   precisa primeiro entender *o que está sendo pedido*, *que tipo de mudança é essa* e *que
   partes do sistema ela afeta* — trabalho que se repete a cada demanda, sem apoio sistemático.
2. **Completude inconsistente.** Demandas mal detalhadas obrigam o QA a inferir premissas não
   ditas ou a interromper o fluxo de trabalho para buscar esclarecimento, muitas vezes sem
   registrar essas lacunas de forma rastreável.
3. **Falta de padronização na saída da análise.** Sem um formato consistente, a qualidade da
   análise de QA (cenários de teste, riscos identificados, checklist de validação) varia de
   pessoa para pessoa e de demanda para demanda, dificultando revisão, comparação e auditoria
   posterior.

O problema, portanto, não é a ausência de testes — é a ausência de um processo **consistente e
auditável** de transformar uma demanda técnica arbitrária em um plano de teste estruturado,
antes mesmo de qualquer teste ser escrito.

## 2. Objetivo do agente

O agente tem como objetivo **apoiar — não substituir — a análise de QA**, atuando como uma
camada de interpretação e estruturação entre a demanda técnica recebida (em qualquer um dos
formatos aceitos, ver seção 3) e os artefatos que um profissional de QA precisa para planejar e
executar testes.

Concretamente, o agente deve:

* Interpretar a entrada e identificar de que tipo de demanda se trata.
* Extrair as informações tecnicamente relevantes contidas (ou ausentes) na entrada.
* Explicitar premissas assumidas e apontar lacunas de informação, em vez de preenchê-las
  silenciosamente.
* Avaliar riscos técnicos e de negócio associados à demanda.
* Gerar cenários de teste (funcionais, unitários quando aplicável, de integração quando
  aplicável, e não funcionais), um checklist de validação e recomendações de execução.

O valor do agente está em produzir, de forma consistente e em minutos, um ponto de partida
estruturado para a análise de QA — que o profissional humano então revisa, ajusta e
complementa com seu julgamento especializado.

## 3. Entradas aceitas

O agente deve aceitar demandas técnicas em formatos variados, sem exigir que o solicitante
preencha um template rígido antes de submetê-las. Tipos de entrada suportados na primeira
versão:

| Tipo de entrada | Exemplo de conteúdo típico |
|---|---|
| História de usuário | "Como usuário, quero recuperar minha senha por e-mail para..." |
| Tarefa técnica | "Refatorar o serviço de autenticação para usar tokens JWT" |
| Bug | "Ao cadastrar um CPF com zeros à esquerda, o sistema salva o valor truncado" |
| Deploy | "Deploy da versão 2.3.0 em produção, inclui migração de banco X" |
| Alteração de API | "Endpoint `POST /pedidos` passa a exigir o campo `canalVenda`" |
| Mudança em banco de dados | "Adicionar coluna `status_pagamento` na tabela `pedidos`" |
| Ajuste de configuração | "Alterar timeout de integração com gateway de pagamento de 5s para 15s" |
| Texto livre | Qualquer descrição informal, sem estrutura predefinida |
| Arquivo com descrição da demanda | Arquivo `.md`/`.txt` contendo a descrição da demanda |

Independentemente do formato de origem, a entrada é normalizada internamente para texto antes
de entrar no fluxo do grafo (ver seção 5, nó "Receber entrada").

## 4. Saídas esperadas

A saída do agente é um artefato estruturado com as seguintes partes:

* **Classificação da demanda** — tipo identificado (dos listados na seção 3) e nível de
  confiança da classificação.
* **Resumo técnico** — síntese objetiva do que a demanda representa, em linguagem técnica.
* **Premissas identificadas** — inferências que o agente precisou fazer para preencher lacunas
  da entrada, explicitadas para validação humana.
* **Pontos ambíguos** — trechos ou aspectos da demanda que admitem mais de uma interpretação.
* **Informações faltantes** — dados que seriam necessários para uma análise completa e não
  estavam presentes na entrada.
* **Cenários de teste funcionais** — casos de teste cobrindo o comportamento esperado da
  funcionalidade.
* **Cenários de teste unitários** (quando aplicável) — sugestões de unidades de código que
  merecem cobertura isolada.
* **Cenários de integração** (quando aplicável) — casos envolvendo comunicação entre
  componentes, serviços ou sistemas externos.
* **Cenários não funcionais** — desempenho, segurança, usabilidade, compatibilidade, conforme
  pertinente ao tipo de demanda.
* **Checklist de validação** — lista objetiva e verificável de pontos a confirmar antes de
  considerar a demanda testada.
* **Riscos técnicos** — riscos ligados à implementação (regressões, complexidade,
  dependências).
* **Riscos de negócio** — riscos ligados a impacto no usuário final ou na operação.
* **Recomendações para o QA** — orientações práticas sobre prioridade, ordem de execução ou
  cuidados específicos.
* **Sugestões de evidência para execução dos testes** — que tipo de evidência (prints,
  payloads de request/response, logs, registros de banco) deve ser coletada ao executar cada
  cenário.

O formato de serialização da saída (Markdown estruturado ou JSON) é definido no escopo do MVP
(seção 10); a lista de conteúdo acima é estável independentemente do formato escolhido.

## 5. Fluxo geral do agente

O fluxo é modelado como um grafo de estados no LangGraph JS, em que cada nó tem uma
responsabilidade única e recebe/produz um recorte do estado compartilhado (ver seção 6):

```
[Receber entrada]
       |
       v
[Validar entrada] --(insuficiente)--> [Solicitar complementação] --> (fim antecipado)
       |
   (suficiente)
       v
[Classificar demanda]
       |
       v
[Extrair informações relevantes]
       |
       v
[Identificar ambiguidades]
       |
       v
[Avaliar riscos]
       |
       v
[Definir estratégia de testes]
       |
       v
[Gerar cenários de teste]
       |
       v
[Revisar consistência] --(inconsistente)--> [Gerar cenários de teste]  (retrabalho controlado)
       |
   (consistente)
       v
[Retornar saída final]
```

Responsabilidade de cada nó:

* **Receber entrada** — normaliza o formato de origem (texto, arquivo) para uma representação
  textual única em `rawInput`.
* **Validar entrada** — decide se há informação mínima para prosseguir (ver seção 7); se não
  houver, o fluxo é interrompido antes de produzir uma análise de baixa confiança.
* **Classificar demanda** — determina `inputType`/`classification` a partir da lista da seção 3.
* **Extrair informações relevantes** — preenche `extractedInfo` com dados técnicos objetivos
  encontrados na entrada (componentes afetados, entidades de negócio, critérios citados).
* **Identificar ambiguidades** — popula `assumptions` e `missingInfo`, distinguindo o que foi
  inferido do que simplesmente não está disponível.
* **Avaliar riscos** — popula `risks` (técnicos e de negócio), com base na classificação e nas
  informações extraídas.
* **Definir estratégia de testes** — decide quais categorias de teste (funcional, unitário,
  integração, não funcional) fazem sentido para este tipo de demanda, populando `testStrategy`.
* **Gerar cenários de teste** — produz `generatedScenarios` e `validationChecklist` de acordo
  com a estratégia definida.
* **Revisar consistência** — verifica se a saída é internamente coerente (ex.: cenário não
  contradiz uma premissa registrada) antes de finalizar; pode retornar ao nó anterior.
* **Retornar saída final** — consolida tudo em `finalOutput`, no formato de serialização
  definido.

## 6. Possíveis estados do agente

Modelo inicial do estado compartilhado do grafo, em TypeScript. Este é um esboço de tipos —
não uma implementação — para orientar a construção do grafo:

```typescript
type InputType =
  | "historia-usuario"
  | "tarefa-tecnica"
  | "bug"
  | "deploy"
  | "alteracao-api"
  | "mudanca-banco-dados"
  | "ajuste-configuracao"
  | "texto-livre";

interface Classification {
  inputType: InputType;
  confidence: number; // 0 a 1
  justification: string;
}

interface Risk {
  descricao: string;
  categoria: "tecnico" | "negocio";
  severidade: "baixa" | "media" | "alta" | "critica";
}

interface TestScenario {
  titulo: string;
  tipo: "funcional" | "unitario" | "integracao" | "nao-funcional";
  passos: string[];
  resultadoEsperado: string;
  evidenciaSugerida?: string;
}

interface TestStrategy {
  categoriasAplicaveis: TestScenario["tipo"][];
  justificativa: string;
}

interface AgentState {
  rawInput: string;
  inputType?: InputType;
  classification?: Classification;
  extractedInfo?: Record<string, unknown>;
  missingInfo: string[];
  assumptions: string[];
  risks: Risk[];
  testStrategy?: TestStrategy;
  generatedScenarios: TestScenario[];
  validationChecklist: string[];
  recommendations: string[];
  finalOutput?: string; // Markdown ou JSON serializado, conforme configuração
}
```

Campos como `missingInfo`, `assumptions`, `risks`, `generatedScenarios` e
`validationChecklist` são inicializados como arrays vazios e populados incrementalmente pelos
nós do grafo — refletindo o caráter cumulativo do fluxo descrito na seção 5.

## 7. Tipos de decisão do agente

O que diferencia este fluxo de um pipeline de transformação de dados é que cada nó não apenas
transforma o estado — ele toma decisões que alteram o caminho seguido no grafo ou o conteúdo
gerado. As decisões centrais são:

* **A entrada é suficiente?** Decisão binária tomada no nó "Validar entrada"; determina se o
  fluxo prossegue ou é interrompido com um pedido de complementação.
* **Qual é o tipo da demanda?** Decisão de classificação em uma das categorias da seção 3, que
  direciona quais informações serão extraídas e quais riscos são relevantes (ex.: uma "mudança
  em banco de dados" tem vetores de risco diferentes de um "ajuste de configuração").
* **Quais testes fazem sentido?** Decisão tomada no nó "Definir estratégia de testes": nem toda
  demanda justifica os quatro tipos de cenário (ex.: um ajuste de configuração raramente exige
  cenário unitário).
* **Existem riscos críticos?** Avaliação que pode alterar a prioridade das recomendações
  geradas para o QA, mesmo sem alterar o caminho do grafo.
* **Há informações faltantes?** Decisão que separa o que deve ser reportado como
  `missingInfo` (bloqueante ou não) do que pode ser tratado como `assumptions` (inferência
  razoável, mas explícita).
* **A saída final está consistente?** Decisão tomada no nó "Revisar consistência", que pode
  desviar o fluxo de volta para "Gerar cenários de teste" em vez de seguir linearmente para a
  saída final.

## 8. Por que é um agente e não um script

Um script tradicional executa uma sequência fixa de transformações determinísticas sobre uma
entrada estruturada e conhecida. Este projeto não se encaixa nesse modelo pelos seguintes
motivos:

* **Interpretação de linguagem natural.** A entrada não tem estrutura garantida — pode ser uma
  frase solta, um parágrafo técnico ou um trecho de conversa. Um script exigiria um formato de
  entrada fixo; o agente interpreta significado.
* **Tomada de decisão condicionada ao tipo da demanda.** O caminho de processamento (quais
  informações extrair, quais riscos avaliar, quais categorias de teste gerar) depende do
  resultado da própria classificação feita pelo agente — não é definido a priori por quem
  escreve o código, mas inferido a cada execução.
* **Adaptação da saída conforme o contexto.** Um bug e um deploy geram saídas com ênfases
  diferentes (o primeiro prioriza reprodução e causa raiz; o segundo, risco operacional e
  rollback), sem que isso exija branches de código escritos manualmente para cada combinação
  possível.
* **Avaliação de risco e identificação de ambiguidade.** São julgamentos qualitativos, não
  cálculos determinísticos — exigem raciocínio sobre linguagem e contexto de domínio.
* **Fluxo condicional nativo do LangGraph JS.** O grafo tem arestas condicionais reais (ver
  seção 5): validação insuficiente interrompe o fluxo; revisão de consistência pode retroceder
  a um nó anterior. Isso é modelagem de comportamento de agente, não execução linear de script.
* **Capacidade de evoluir.** Novos tipos de demanda, novas categorias de risco ou novas
  ferramentas (ex.: consulta a uma base de casos de teste existente) podem ser incorporados
  como novos nós ou arestas do grafo, sem reescrever o fluxo inteiro — uma propriedade
  característica de arquiteturas de agente, não de scripts monolíticos.

## 9. Limitações iniciais

Para manter expectativas realistas e delimitar claramente o escopo da primeira versão:

* O agente **não substitui a análise humana de QA** — sua saída é um ponto de partida
  estruturado, sujeito a revisão e ajuste por um profissional.
* O agente **não garante cobertura completa de testes**; cenários gerados refletem o que foi
  possível inferir da entrada fornecida, não uma análise exaustiva do sistema real.
* A qualidade da saída **depende diretamente da qualidade da entrada** — entradas muito vagas
  resultarão em mais itens em `missingInfo` e `assumptions`, e em cenários de teste menos
  específicos.
* O agente **não acessa sistemas externos** nesta fase inicial (sem integração com
  repositórios de código, rastreadores de tarefas, bancos de dados reais ou pipelines de CI/CD).
* O agente **não executa testes automaticamente** — ele gera cenários e checklists para
  execução humana (ou automação futura), não executa suítes de teste.

## 10. Escopo da primeira versão (MVP)

A primeira versão do agente deve entregar, de forma completa e testável, o seguinte escopo
mínimo:

* Receber entrada em texto (os formatos de arquivo e outras origens da seção 3 podem ser
  suportados incrementalmente, mas a interface interna do agente trabalha sobre texto).
* Classificar a demanda em um dos tipos definidos na seção 3.
* Extrair as informações técnicas principais contidas na entrada.
* Identificar premissas assumidas e informações faltantes.
* Avaliar riscos técnicos e de negócio, mesmo que de forma qualitativa.
* Gerar cenários de teste (ao menos funcionais; unitários/integração/não funcionais quando
  aplicável ao tipo de demanda).
* Gerar um checklist de validação.
* Retornar a saída final estruturada em **Markdown ou JSON estruturado** (a escolha de formato
  padrão é uma decisão técnica a ser registrada em
  [`decisoes-tecnicas.md`](decisoes-tecnicas.md) quando a implementação começar).

Fora do escopo do MVP: entrada por arquivo binário, integrações externas, execução automática
de testes e persistência de histórico de análises — candidatos naturais para versões
subsequentes, uma vez que o fluxo central esteja validado.
