# Prompt: Definição do Agente de QA em LangGraph JS

## Identificação

- Código: 003
- Versão: 1.0
- Data: 2026-07-07
- Autor: dverdecia
- Status: Em revisão

## Objetivo

Definir, com a IA como interlocutora de projeto de arquitetura, o desenho inicial do agente de
QA em LangGraph JS: papel do agente, nós do grafo, ferramentas (tools) disponíveis, formato de
entrada/saída de cada nó e critérios de parada — antes de escrever qualquer código de
implementação.

## Contexto de uso

Usado após a inicialização do projeto (ver [`001-inicializacao-projeto.md`](001-inicializacao-projeto.md))
e antes da implementação do grafo em `src/`. É o prompt que efetivamente introduz o domínio de
QA no projeto — até este ponto, apenas a estrutura técnica (Node.js/TypeScript) havia sido
definida. As decisões de arquitetura resultantes devem ser refletidas em
[`docs/arquitetura/decisoes-tecnicas.md`](../arquitetura/decisoes-tecnicas.md).

> **Nota de transparência**: assim como o registro `001`, este arquivo reconstrói de forma
> fiel o objetivo real do prompt de definição do agente. Ao integrar este documento ao
> histórico real do projeto, substitua o texto do prompt e os exemplos de saída pelo conteúdo
> efetivamente produzido na conversa original.

## Prompt utilizado

```text
Vamos definir a arquitetura do agente de QA antes de implementar qualquer código.

O agente deve ser construído com LangGraph JS e ter como responsabilidade apoiar
atividades de QA, especificamente:
- Gerar casos de teste a partir de uma descrição de funcionalidade ou critério de
  aceite.
- Analisar um relato de bug e sugerir passos de reprodução e severidade.
- Revisar casos de teste existentes apontando lacunas de cobertura.

Para cada uma dessas responsabilidades, defina:
1. Um nó (ou subgrafo) do LangGraph responsável por ela.
2. As ferramentas (tools) que esse nó pode invocar, se houver.
3. O formato de entrada esperado pelo nó (schema, mesmo que informal).
4. O formato de saída produzido pelo nó (schema, mesmo que informal).
5. Critérios que determinam quando o nó deve encaminhar para outro nó ou finalizar
   (condições de transição do grafo).

Não gere código de implementação ainda — o objetivo aqui é fechar o desenho antes de
implementar, para que a implementação possa ser revisada contra esta definição.
```

## Entrada esperada

- Lista de responsabilidades do agente (fornecida no próprio prompt).
- Conhecimento prévio de que o agente será implementado com LangGraph JS (decisão já tomada em
  [`001`](001-inicializacao-projeto.md)).

## Saída esperada

Para cada responsabilidade do agente, uma especificação textual/schema contendo: nome do nó,
ferramentas associadas, schema de entrada, schema de saída e condições de transição — sem
código-fonte de implementação (TypeScript). Exemplo de formato esperado por nó:

```text
Nó: gerar_casos_de_teste
Ferramentas: nenhuma (raciocínio direto do LLM)
Entrada: { descricaoFuncionalidade: string, criteriosAceite: string[] }
Saída: { casosDeTeste: Array<{ titulo: string; passos: string[]; resultadoEsperado: string }> }
Transição: encaminha para o nó de revisão se `casosDeTeste.length < 3`; finaliza caso
contrário.
```

## Critérios de qualidade

- Cada uma das três responsabilidades listadas deve ter um nó correspondente — nenhuma pode
  ficar sem definição.
- Os schemas de entrada/saída devem ser específicos o suficiente para orientar a implementação
  posterior (não apenas "recebe texto, devolve texto").
- As condições de transição devem ser critérios verificáveis (ex.: comprimento de lista,
  presença de campo), não descrições vagas como "quando fizer sentido".
- A resposta não deve conter código TypeScript de implementação (fora de escopo deste prompt).

## Decisões de engenharia de prompt

- **Separação explícita entre desenho e implementação** ("não gere código de implementação
  ainda"): aplica o princípio de revisar a arquitetura antes de comprometer código, reduzindo o
  risco de retrabalho e permitindo que o desenho seja registrado e avaliado isoladamente — algo
  particularmente valioso em um contexto acadêmico, onde o processo de decisão é parte do que
  é avaliado.
- **Estrutura fixa de 5 perguntas por responsabilidade**: impõe um formato consistente de
  resposta, o que facilita tanto a leitura comparativa entre nós quanto a conversão posterior
  de cada resposta em código (cada campo do schema mapeia diretamente para uma decisão de
  implementação).
- **Responsabilidades enumeradas explicitamente no prompt** em vez de perguntar "o que o agente
  deveria fazer": evita que a IA proponha um escopo de agente diferente do que já havia sido
  definido informalmente pelo autor, mantendo o prompt como uma etapa de *formalização* de uma
  decisão já tomada, não de *descoberta* de escopo.
- **Pedido de schemas "mesmo que informais"**: calibra a expectativa de rigor — não se exige
  JSON Schema formal nesta etapa (isso pertence à implementação), mas também não se aceita
  descrição em prosa livre, o que manteria a saída pouco reutilizável.

## Observações

Este prompt é o ponto de maior acoplamento entre engenharia de prompts e arquitetura de
software do projeto: seu resultado direto vira insumo de código. Qualquer mudança relevante no
desenho do agente resultante deste prompt deve gerar uma nova versão deste arquivo (campo
**Versão**) e, se a mudança for estrutural, uma entrada correspondente em
[`docs/arquitetura/decisoes-tecnicas.md`](../arquitetura/decisoes-tecnicas.md).

## Histórico de alterações

| Versão | Data | Alteração | Commit/Referência |
|---|---|---|---|
| 1.0 | 2026-07-07 | Criação do registro | |
