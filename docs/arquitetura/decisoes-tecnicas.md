# Decisões Técnicas

Este documento registra decisões de arquitetura e de configuração do projeto que **não** são,
em si, prompts, mas que frequentemente são consequência direta de um prompt documentado em
[`docs/prompts/`](../prompts/README.md). Cada entrada aponta para o prompt que a originou,
quando existir.

O objetivo é separar duas camadas de rastreabilidade:

* **`docs/prompts/`** registra *como a IA foi instruída* (o prompt, seu contexto e sua
  justificativa de engenharia).
* **`docs/arquitetura/decisoes-tecnicas.md`** registra *a decisão técnica resultante* (o que
  foi efetivamente adotado no projeto), de forma que decisões possam ser consultadas sem
  precisar reler o prompt inteiro que as gerou.

## Formato de cada entrada

```md
### [AAAA-MM-DD] Título da decisão

- Prompt relacionado: docs/prompts/NNN-nome-do-prompt.md
- Decisão:
- Alternativas consideradas:
- Motivo da escolha:
```

## Registro de decisões

### [2026-07-16] Fallback explícito entre modelos Groq vigentes

- Prompt relacionado: não aplicável (decisão de resiliência da infraestrutura do agente).
- Decisão: usar `openai/gpt-oss-120b` como modelo principal e, como fallbacks complementares,
  `llama-3.1-8b-instant` e `qwen/qwen3.6-27b`,
  com tentativas controladas pela aplicação e diagnóstico agregado quando ambos falham. Os
  retries internos do cliente ficam desativados para não repetir chamadas contra uma cota diária
  já esgotada. Erros com espera curta informada pela Groq podem ser repetidos uma vez após o
  intervalo indicado, inclusive com novas esperas curtas quando a janela ainda não tiver sido
  totalmente liberada; esperas longas, típicas de TPD, seguem imediatamente para o fallback.
- Alternativas consideradas: aguardar diariamente a renovação da cota do
  `llama-3.3-70b-versatile`; manter `meta-llama/llama-4-scout-17b-16e-instruct` como fallback;
  usar o `withFallbacks` padrão do LangChain.
- Motivo da escolha: o limite diário do modelo principal era atingido após poucas execuções do
  grafo e ambos os modelos Llama configurados entraram em processo de descontinuação. Além disso,
  `withFallbacks` relança o primeiro erro quando todas as tentativas falham, ocultando o erro real
  do modelo alternativo. A cadeia explícita preserva a causa de cada falha e facilita distinguir
  limite diário, limite por minuto, modelo indisponível e erro de saída estruturada.
  `openai/gpt-oss-20b` também foi avaliado, mas falhou na geração de JSON estruturado. Qwen e o
  modelo Llama alternativo passaram nos testes básicos, porém cada um apresentou uma falha
  estruturada pontual em etapas diferentes do grafo; por isso são usados em sequência, antes de
  aguardar e repetir o principal. O Llama possui cota diária maior e atende à demonstração do
  projeto, mas seu desligamento está anunciado para 16/08/2026; a escolha deve ser revista após a
  entrega acadêmica.

### [2026-07-07] Adoção de um sistema formal de documentação de prompts

- Prompt relacionado: [`docs/prompts/002-registro-prompts.md`](../prompts/002-registro-prompts.md)
- Decisão: criar `docs/prompts/` com convenção de nomenclatura `NNN-nome-do-prompt.md`,
  template fixo de 11 seções e validação automatizada via script Node.js/TypeScript
  (`scripts/validate-prompts.ts`) executado como hook `pre-commit`.
- Alternativas consideradas: manter prompts documentados informalmente em um único arquivo de
  notas; usar uma ferramenta externa de gestão de prompts (ex.: plataforma de prompt
  management).
- Motivo da escolha: o projeto tem apresentação acadêmica e precisa demonstrar processo, não
  apenas resultado. Um único arquivo de notas não escala nem é validável automaticamente; uma
  ferramenta externa introduziria dependência e custo desproporcionais ao escopo do trabalho.
  Uma estrutura de arquivos Markdown versionada no próprio repositório, validada por um script
  simples, é auditável, não tem custo de infraestrutura e é compatível com o fluxo de Git já
  em uso.

### [2026-07-07] Uso de `tsx` para execução de scripts TypeScript utilitários

- Prompt relacionado: [`docs/prompts/002-registro-prompts.md`](../prompts/002-registro-prompts.md)
- Decisão: executar `scripts/validate-prompts.ts` diretamente com `tsx`, sem etapa de build
  (`tsc`) prévia, via `npm run validate:prompts`.
- Alternativas consideradas: compilar o script com `tsc` para `dist/` antes de executá-lo com
  `node`; reescrever o script em JavaScript puro.
- Motivo da escolha: o script é uma ferramenta de desenvolvimento (roda em pre-commit e em CI),
  não parte do runtime do agente — não há benefício em gerar artefato compilado versionado.
  `tsx` elimina a etapa de build para scripts utilitários, mantendo type-safety em TypeScript
  sem custo adicional de configuração.
