import type { TestScenario, TestStrategy } from "../types.js";

export const MIN_SCENARIOS_PER_CATEGORY = 1;
export const MIN_STEPS_PER_SCENARIO = 3;

/**
 * Valida invariantes objetivas que não devem depender do julgamento do LLM.
 * As mensagens são reenviadas ao nó gerador para orientar uma nova tentativa.
 */
export function validateScenarioConsistency(
  strategy: TestStrategy | undefined,
  scenarios: TestScenario[]
): string[] {
  if (!strategy) {
    return ["A estratégia de testes não foi definida antes da geração dos cenários."];
  }

  const problems: string[] = [];
  const applicableCategories = new Set(strategy.categoriasAplicaveis);

  for (const category of applicableCategories) {
    const count = scenarios.filter((scenario) => scenario.tipo === category).length;
    if (count < MIN_SCENARIOS_PER_CATEGORY) {
      problems.push(
        `A categoria aplicável "${category}" exige pelo menos ${MIN_SCENARIOS_PER_CATEGORY} ` +
          `cenários, mas recebeu ${count}.`
      );
    }
  }

  scenarios.forEach((scenario, index) => {
    const label = scenario.titulo.trim() || `cenário ${index + 1}`;

    if (!applicableCategories.has(scenario.tipo)) {
      problems.push(
        `O cenário "${label}" pertence à categoria não selecionada "${scenario.tipo}".`
      );
    }

    if (!scenario.titulo.trim()) {
      problems.push(`O cenário ${index + 1} não possui título.`);
    }

    if (scenario.passos.length < MIN_STEPS_PER_SCENARIO) {
      problems.push(
        `O cenário "${label}" exige pelo menos ${MIN_STEPS_PER_SCENARIO} passos, ` +
          `mas recebeu ${scenario.passos.length}.`
      );
    }

    if (!scenario.resultadoEsperado.trim()) {
      problems.push(`O cenário "${label}" não possui resultado esperado verificável.`);
    }
  });

  return problems;
}
