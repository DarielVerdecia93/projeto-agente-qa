/**
 * Valida a estrutura e o conteúdo mínimo de docs/prompts/.
 * Uso: npm run validate:prompts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PROMPTS_DIR = path.join(ROOT_DIR, "docs", "prompts");
const README_PATH = path.join(PROMPTS_DIR, "README.md");
const TEMPLATE_PATH = path.join(PROMPTS_DIR, "prompt-template.md");

const IGNORED_FILES = new Set(["README.md", "prompt-template.md"]);
const FILENAME_PATTERN = /^\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

const REQUIRED_SECTIONS = [
  "## Identificação",
  "## Objetivo",
  "## Contexto de uso",
  "## Prompt utilizado",
  "## Entrada esperada",
  "## Saída esperada",
  "## Critérios de qualidade",
  "## Decisões de engenharia de prompt",
  "## Observações",
  "## Histórico de alterações",
] as const;

interface ValidationError {
  file: string;
  message: string;
}

const errors: ValidationError[] = [];

function fail(file: string, message: string): void {
  errors.push({ file, message });
}

function checkBaseStructure(): boolean {
  if (!fs.existsSync(PROMPTS_DIR) || !fs.statSync(PROMPTS_DIR).isDirectory()) {
    fail("docs/prompts/", "Pasta obrigatória não encontrada.");
    return false;
  }
  if (!fs.existsSync(README_PATH)) {
    fail("docs/prompts/README.md", "Arquivo obrigatório não encontrado.");
  }
  if (!fs.existsSync(TEMPLATE_PATH)) {
    fail("docs/prompts/prompt-template.md", "Arquivo obrigatório não encontrado.");
  }
  return true;
}

/** Retorna o texto entre um heading "## X" e o próximo heading "## ", ou null se o heading não existir. */
function extractSectionContent(content: string, heading: string): string | null {
  const lines = content.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) return null;

  const collected: string[] = [];
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    collected.push(lines[i]);
  }
  return collected.join("\n").trim();
}

function checkPromptFile(fileName: string): void {
  const filePath = path.join(PROMPTS_DIR, fileName);
  const content = fs.readFileSync(filePath, "utf-8");

  if (!FILENAME_PATTERN.test(fileName)) {
    fail(fileName, "Nome de arquivo fora do padrão NNN-nome-do-prompt.md.");
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      fail(fileName, `Seção obrigatória ausente: "${section}".`);
    }
  }

  const identificacao = extractSectionContent(content, "## Identificação");
  if (identificacao !== null && !/-\s*Vers(ã|a)o:\s*\S+/i.test(identificacao)) {
    fail(fileName, "Campo 'Versão' não preenchido na seção Identificação.");
  }

  const nonEmptySections: Array<[heading: string, label: string]> = [
    ["## Objetivo", "Objetivo"],
    ["## Contexto de uso", "Contexto de uso"],
    ["## Entrada esperada", "Entrada esperada"],
    ["## Saída esperada", "Saída esperada"],
  ];

  for (const [heading, label] of nonEmptySections) {
    const sectionContent = extractSectionContent(content, heading);
    if (sectionContent === null || sectionContent.length === 0) {
      fail(fileName, `Seção "${label}" está vazia.`);
    }
  }
}

function checkPromptFiles(): void {
  if (!fs.existsSync(PROMPTS_DIR)) return;

  const promptFiles = fs
    .readdirSync(PROMPTS_DIR)
    .filter((entry) => {
      const fullPath = path.join(PROMPTS_DIR, entry);
      return (
        fs.statSync(fullPath).isFile() &&
        entry.toLowerCase().endsWith(".md") &&
        !IGNORED_FILES.has(entry)
      );
    })
    .sort();

  if (promptFiles.length === 0) {
    fail(
      "docs/prompts/",
      "Nenhum arquivo de prompt encontrado (padrão NNN-nome-do-prompt.md)."
    );
    return;
  }

  for (const fileName of promptFiles) {
    checkPromptFile(fileName);
  }
}

function main(): void {
  const hasBaseStructure = checkBaseStructure();
  if (hasBaseStructure) {
    checkPromptFiles();
  }

  if (errors.length > 0) {
    console.error("\nValidação de prompts falhou:\n");
    for (const error of errors) {
      console.error(`  [${error.file}] ${error.message}`);
    }
    console.error(`\nTotal de problemas encontrados: ${errors.length}\n`);
    process.exit(1);
  }

  console.log("Validação de prompts concluída com sucesso. Nenhum problema encontrado.");
}

main();
