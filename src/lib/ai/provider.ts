import { z } from "zod";

export const extractedWorkSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000),
  estimatedMinutes: z.number().int().min(5).max(600),
  needsReview: z.literal(true),
});

export type ExtractedWork = z.infer<typeof extractedWorkSchema>;
export interface MissedWorkProvider {
  readonly name: string;
  extract(input: { text: string }): Promise<ExtractedWork[]>;
}

/** Local fallback only splits explicit lines. It does not infer deadlines or claim AI understanding. */
export class DeterministicWorkProvider implements MissedWorkProvider {
  readonly name = "Deterministic text parser";
  async extract({ text }: { text: string }): Promise<ExtractedWork[]> {
    if (text.length > 20_000)
      throw new Error("Text must contain at most 20,000 characters.");
    return text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-*\u2022]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 20)
      .map((line) =>
        extractedWorkSchema.parse({
          title: line.slice(0, 160),
          description: line.slice(0, 2000),
          estimatedMinutes: 30,
          needsReview: true,
        }),
      );
  }
}
