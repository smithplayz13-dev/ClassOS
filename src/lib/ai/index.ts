import "server-only";
import { DeterministicWorkProvider, type MissedWorkProvider } from "./provider";
import { OpenAIWorkProvider } from "./openai-provider";

export function getMissedWorkProvider(): MissedWorkProvider {
  const name = process.env.AI_PROVIDER ?? "deterministic";
  if (name === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key)
      throw new Error(
        "OPENAI_API_KEY is missing. Use AI_PROVIDER=deterministic for local extraction.",
      );
    return new OpenAIWorkProvider(
      key,
      process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    );
  }
  if (name !== "deterministic")
    throw new Error(`AI provider '${name}' is not configured.`);
  return new DeterministicWorkProvider();
}
