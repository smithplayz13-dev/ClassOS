import "server-only";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export function fileKind(
  bytes: Uint8Array,
  filename: string,
): "text" | "document" | "image" {
  const signature = Buffer.from(bytes.subarray(0, 8));
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" && signature.subarray(0, 5).toString() === "%PDF-")
    return "document";
  if (
    ext === "png" &&
    signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image";
  if (
    ["jpg", "jpeg"].includes(ext ?? "") &&
    signature[0] === 255 &&
    signature[1] === 216 &&
    signature[2] === 255
  )
    return "image";
  if (["txt", "md"].includes(ext ?? "") && !bytes.includes(0)) return "text";
  throw new Error("Upload a valid PDF, PNG, JPEG, TXT, or Markdown file.");
}

let activeWorkers = 0;
export async function extractUpload(
  bytes: Uint8Array,
  kind: string,
): Promise<string> {
  if (kind === "text")
    return new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .slice(0, 20_000);
  if (activeWorkers >= 2)
    throw new Error(
      "Two files are already processing. Please try again shortly.",
    );
  activeWorkers++;
  try {
    return await new Promise<string>((resolveResult, reject) => {
      const worker = spawn(
        process.execPath,
        ["--max-old-space-size=256", resolve("scripts/extract-upload.mjs")],
        {
          serialization: "advanced",
          windowsHide: true,
          stdio: ["ignore", "ignore", "ignore", "ipc"],
        },
      );
      worker.send({ bytes, kind });
      const timer = setTimeout(() => {
        worker.kill();
        reject(
          new Error(
            "Reading this file took too long. Try fewer pages or paste the lesson text.",
          ),
        );
      }, 45_000);
      worker.once("message", (result: { text?: string; error?: string }) => {
        clearTimeout(timer);
        if (result.error) reject(new Error(result.error));
        else resolveResult(result.text ?? "");
      });
      worker.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      worker.once("exit", () => {
        clearTimeout(timer);
        reject(new Error("File processing stopped. Try a smaller file."));
      });
    });
  } finally {
    activeWorkers--;
  }
}
