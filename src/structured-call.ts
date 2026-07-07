import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { z } from "zod";
import { createChatModel } from "./llm.js";

export async function callStructured<Schema extends z.ZodType>(
  systemPrompt: string,
  contextSections: Record<string, unknown>,
  schema: Schema
): Promise<z.infer<Schema>> {
  const model = createChatModel().withStructuredOutput(schema);
  const context = Object.entries(contextSections)
    .map(([label, value]) => `## ${label}\n${JSON.stringify(value, null, 2)}`)
    .join("\n\n");

  const result = await model.invoke([new SystemMessage(systemPrompt), new HumanMessage(context)]);
  return result as z.infer<Schema>;
}
