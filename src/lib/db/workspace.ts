import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasCurrentAgreement, recordAgreement } from "../legal-server";

export const PERSONAL_STUDENT_ID = "student-personal";
export const DEMO_STUDENT_ID = "student-demo";

// Local workspace selection, not authentication. Keep this app bound to localhost.
export async function getStudentId() {
  const studentId = await getAcceptedStudentId();
  if (!studentId) redirect("/?agreement=required#setup");
  return studentId;
}

export async function getAcceptedStudentId() {
  const studentId =
    (await cookies()).get("classos-workspace")?.value === "personal"
      ? PERSONAL_STUDENT_ID
      : DEMO_STUDENT_ID;
  if (studentId === DEMO_STUDENT_ID) return studentId;
  return (await hasCurrentAgreement(studentId)) ? studentId : null;
}

export async function selectWorkspace(mode: "personal" | "demo") {
  if (mode === "personal") await recordAgreement(PERSONAL_STUDENT_ID);
  (await cookies()).set("classos-workspace", mode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
