import { ChatGroq } from "@langchain/groq";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function createChatModel(): ChatGroq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY não definida. Configure o arquivo .env a partir de .env.example."
    );
  }

  return new ChatGroq({
    apiKey,
    model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
    temperature: 0,
  });
}
