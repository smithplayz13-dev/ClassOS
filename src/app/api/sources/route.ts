import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { DEMO_STUDENT_ID } from "@/lib/db/repository";
import { extractUpload, fileKind, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { getMissedWorkProvider } from "@/lib/ai";
import { refreshWorkspace } from "@/lib/mutations";
import { Prisma } from "@/generated/prisma/client";
import {
  DeterministicWorkProvider,
  type ExtractedWork,
} from "@/lib/ai/provider";

export const runtime = "nodejs";
const inFlight = new Map<
  string,
  Promise<{ text: string; suggestions: ExtractedWork[] }>
>();
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next may internally normalize request.url to localhost; Host retains the browser authority.
  const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get("host")}`;
  if (!origin || origin !== expectedOrigin)
    return Response.json(
      { error: "This upload must come from your workspace." },
      { status: 403 },
    );
  try {
    // Enforce the multipart limit even when the caller omits Content-Length.
    if (!request.body) throw new Error("No upload received.");
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_UPLOAD_BYTES + 100_000) {
        await reader.cancel();
        return Response.json(
          { error: "Files must be 5 MB or smaller." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    const absenceId = String(form.get("absenceId") ?? "");
    if (
      !(await db.absence.count({
        where: { id: absenceId, studentId: DEMO_STUDENT_ID },
      }))
    )
      return Response.json({ error: "Absence not found." }, { status: 404 });
    const file = form.get("file");
    let text = String(form.get("text") ?? "").trim();
    let title =
      String(form.get("title") ?? "Lesson notes")
        .trim()
        .slice(0, 160) || "Lesson notes";
    let kind: "text" | "document" | "image" = "text";
    let bytes = new TextEncoder().encode(text);
    if (file instanceof File && file.size) {
      if (file.size > MAX_UPLOAD_BYTES)
        throw new Error("Files must be 5 MB or smaller.");
      bytes = new Uint8Array(await file.arrayBuffer());
      kind = fileKind(bytes, file.name);
      title = file.name.slice(0, 160);
    } else if (!text || text.length > 20_000)
      throw new Error("Add between 1 and 20,000 characters of lesson notes.");
    const provider =
      form.get("provider") === "local"
        ? new DeterministicWorkProvider()
        : getMissedWorkProvider();
    const contentHash = createHash("sha256")
      .update(bytes)
      .update(provider.name)
      .digest("hex");
    const cached = await db.missedWorkSource.findUnique({
      where: { absenceId_contentHash: { absenceId, contentHash } },
    });
    if (cached)
      return Response.json({
        id: cached.id,
        cached: true,
        message: cached.reviewedAt
          ? "These notes were already accepted."
          : "These notes are ready for review.",
      });
    let pending = inFlight.get(contentHash);
    if (!pending) {
      if (inFlight.size >= 10)
        throw new Error(
          "Notes are already processing. Please try again shortly.",
        );
      pending = (async () => {
        const extracted =
          file instanceof File && file.size
            ? (await extractUpload(bytes, kind)).trim()
            : text;
        if (!extracted)
          throw new Error(
            "No readable text was found. For scanned PDFs, upload a page as an image or paste its text.",
          );
        return {
          text: extracted,
          suggestions: await provider.extract({ text: extracted }),
        };
      })();
      inFlight.set(contentHash, pending);
      void pending.finally(() => inFlight.delete(contentHash)).catch(() => {});
    }
    const extracted = await pending;
    text = extracted.text;
    const suggestions = extracted.suggestions;
    const source = await db.missedWorkSource.create({
      data: {
        absenceId,
        sourceType: kind,
        title,
        originalText: text,
        processingStatus: "processed",
        contentHash,
        suggestions: JSON.stringify(suggestions),
        providerName: provider.name,
      },
    });
    refreshWorkspace(["/catch-up"]);
    return Response.json({
      id: source.id,
      message: "Notes extracted. Review each task before adding it.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return Response.json({
        message: "These notes are already available for review.",
      });
    return Response.json(
      {
        error:
          error instanceof Error &&
          !(error instanceof Prisma.PrismaClientKnownRequestError) &&
          !(error instanceof Prisma.PrismaClientValidationError)
            ? error.message
            : "Could not process this upload.",
      },
      { status: 400 },
    );
  }
}
