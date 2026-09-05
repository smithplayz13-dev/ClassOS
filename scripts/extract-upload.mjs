import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
async function extract({ bytes, kind }) {
  if (kind === "document") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(bytes) });
    try {
      const info = await parser.getInfo();
      if (info.total > 20)
        throw new Error("Please upload at most 20 pages at a time.");
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    langPath: join(
      dirname(require.resolve("@tesseract.js-data/eng")),
      "4.0.0_best_int",
    ),
    cacheMethod: "none",
    logger: () => {},
  });
  try {
    return (await worker.recognize(Buffer.from(bytes))).data.text;
  } finally {
    await worker.terminate();
  }
}

process.once("message", async (input) => {
  let result;
  try {
    result = { text: (await extract(input)).slice(0, 20_000) };
  } catch (error) {
    result = { error: error.message || "Could not read this file." };
  }
  process.send(result, () => process.exit(0));
});
