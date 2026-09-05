import { describe, expect, it } from "vitest";
import { DeterministicWorkProvider } from "../../src/lib/ai/provider";

describe("deterministic development provider", () => {
  const provider = new DeterministicWorkProvider();
  it("returns reviewable line items without inferring a deadline", async () => {
    const result = await provider.extract({
      text: "- Read chapter 4\n\n* Complete exercise 2",
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: "Read chapter 4",
      description: "Read chapter 4",
      estimatedMinutes: 30,
      needsReview: true,
    });
    expect(result).toEqual(
      await provider.extract({
        text: "- Read chapter 4\n\n* Complete exercise 2",
      }),
    );
  });
  it("handles empty text", async () => {
    expect(await provider.extract({ text: " \n " })).toEqual([]);
  });
  it("limits untrusted input", async () => {
    await expect(
      provider.extract({ text: "a".repeat(20_001) }),
    ).rejects.toThrow();
  });
});
