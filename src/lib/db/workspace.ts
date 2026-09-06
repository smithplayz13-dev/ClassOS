import "server-only";
import { cookies } from "next/headers";

export const PERSONAL_STUDENT_ID = "student-personal";
export const DEMO_STUDENT_ID = "student-demo";

// Local workspace selection, not authentication. Keep this app bound to localhost.
export async function getStudentId() {
  return (await cookies()).get("classos-workspace")?.value === "personal"
    ? PERSONAL_STUDENT_ID
    : DEMO_STUDENT_ID;
}

export async function selectWorkspace(mode: "personal" | "demo") {
  (await cookies()).set("classos-workspace", mode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
