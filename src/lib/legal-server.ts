import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { LEGAL_VERSION } from "./legal";

const COOKIE = "classos-legal";
const MAX_AGE = 60 * 60 * 24 * 365;
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function hasCurrentAgreement(studentId: string) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const record = await db.legalAcceptance.findUnique({
    where: { tokenHash: digest(token) },
  });
  return (
    !!record &&
    record.studentId === studentId &&
    record.version === LEGAL_VERSION &&
    record.acceptedAt.getTime() > Date.now() - MAX_AGE * 1000
  );
}

export async function recordAgreement(studentId: string) {
  const token = randomBytes(32).toString("hex");
  await db.legalAcceptance.create({
    data: { studentId, version: LEGAL_VERSION, tokenHash: digest(token) },
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}
