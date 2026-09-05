import { expect, it, vi } from "vitest";
import { OpenAIWorkProvider } from "../../src/lib/ai/openai-provider";

it("requests structured, non-stored suggestions and validates them", async () => {
  const tasks = [
    {
      title: "Read chapter four",
      description: "Read chapter four",
      estimatedMinutes: 30,
      needsReview: true,
    },
  ];
  const request = vi.fn<typeof fetch>().mockResolvedValue(
    Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify({ tasks }) }],
        },
      ],
    }),
  );
  expect(
    await new OpenAIWorkProvider("test-only", "test-model", request).extract({
      text: "Read chapter four",
    }),
  ).toEqual(tasks);
  const body = JSON.parse(request.mock.calls[0][1]!.body as string);
  expect(body.store).toBe(false);
  expect(body.text.format.strict).toBe(true);
});

it("rejects incomplete and unavailable provider responses", async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ status: "incomplete", output: [] }))
    .mockResolvedValueOnce(new Response(null, { status: 429 }));
  const provider = new OpenAIWorkProvider("test-only", "test-model", request);
  await expect(provider.extract({ text: "Read chapter four" })).rejects.toThrow(
    "incomplete",
  );
  await expect(provider.extract({ text: "Read chapter four" })).rejects.toThrow(
    "unavailable",
  );
});
