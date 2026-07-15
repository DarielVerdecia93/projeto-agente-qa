import type { ReportData } from "../schemas.js";

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}\n`;
}

function list(items: string[], emptyLabel: string): string {
  if (items.length === 0) return `_${emptyLabel}_`;
  return items.map((item) => `- ${item}`).join("\n");
}

export function renderInsufficientInputMarkdown(reason: string): string {
  return [
    "# Análise de Demanda — Entrada Insuficiente",
    "",
    "Não foi possível prosseguir com a análise porque a entrada fornecida não contém",
    "informação suficiente.",
    "",
    section("Motivo", reason),
    section(
      "Recomendação",
      "Forneça uma descrição mais detalhada da demanda (contexto, componente afetado, " +
        "comportamento esperado) e submeta novamente."
    ),
  ].join("\n");
}

export function renderFinalOutputMarkdown(state: ReportData): string {
  const { classification, extractedInfo, testStrategy } = state;

  const scenariosByType = state.generatedScenarios.reduce<Record<string, string[]>>(
    (acc, scenario) => {
      const block = [
        `**${scenario.titulo}**`,
        ...scenario.passos.map((passo, index) => `  ${index + 1}. ${passo}`),
        `  - Resultado esperado: ${scenario.resultadoEsperado}`,
        scenario.evidenciaSugerida
          ? `  - Evidência sugerida: ${scenario.evidenciaSugerida}`
          : undefined,
      ]
        .filter(Boolean)
        .join("\n");

      acc[scenario.tipo] = [...(acc[scenario.tipo] ?? []), block];
      return acc;
    },
    {}
  );

  const risksByCategory = state.risks.reduce<Record<string, string[]>>((acc, risk) => {
    const label = `[${risk.severidade.toUpperCase()}] ${risk.descricao}`;
    acc[risk.categoria] = [...(acc[risk.categoria] ?? []), label];
    return acc;
  }, {});

  return [
    "# Análise de Demanda para QA",
    "",
    section(
      "Classificação",
      classification
        ? `Tipo: **${classification.inputType}** (confiança: ${classification.confidence.toFixed(2)})\n\n${classification.justification}`
        : "_Não classificado._"
    ),
    section("Resumo técnico", extractedInfo?.resumoTecnico ?? "_Não disponível._"),
    section(
      "Componentes afetados",
      list(extractedInfo?.componentesAfetados ?? [], "Nenhum componente identificado.")
    ),
    section(
      "Entidades de negócio",
      list(extractedInfo?.entidadesNegocio ?? [], "Nenhuma entidade identificada.")
    ),
    section("Premissas identificadas", list(state.assumptions, "Nenhuma premissa registrada.")),
    section("Informações faltantes", list(state.missingInfo, "Nenhuma lacuna identificada.")),
    section(
      "Estratégia de testes",
      testStrategy
        ? `Categorias aplicáveis: ${testStrategy.categoriasAplicaveis.join(", ")}\n\n${testStrategy.justificativa}`
        : "_Não definida._"
    ),
    section(
      "Cenários de teste funcionais",
      list(scenariosByType["funcional"] ?? [], "Nenhum cenário funcional gerado.")
    ),
    section(
      "Cenários de teste unitários",
      list(scenariosByType["unitario"] ?? [], "Não aplicável a esta demanda.")
    ),
    section(
      "Cenários de integração",
      list(scenariosByType["integracao"] ?? [], "Não aplicável a esta demanda.")
    ),
    section(
      "Cenários não funcionais",
      list(scenariosByType["nao-funcional"] ?? [], "Não aplicável a esta demanda.")
    ),
    section(
      "Checklist de validação",
      list(state.validationChecklist, "Nenhum item de checklist gerado.")
    ),
    section(
      "Riscos técnicos",
      list(risksByCategory["tecnico"] ?? [], "Nenhum risco técnico identificado.")
    ),
    section(
      "Riscos de negócio",
      list(risksByCategory["negocio"] ?? [], "Nenhum risco de negócio identificado.")
    ),
    section("Recomendações para o QA", list(state.recommendations, "Nenhuma recomendação adicional.")),
  ].join("\n");
}
