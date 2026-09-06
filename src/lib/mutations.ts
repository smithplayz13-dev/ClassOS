import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { getStudentId } from "./db/workspace";

export async function markScheduleChanged() {
  const studentId = await getStudentId();
  await db.student.update({
    where: { id: studentId },
    data: { scheduleRevision: { increment: 1 } },
  });
}
export function refreshWorkspace(
  paths = ["/", "/assignments", "/planner", "/catch-up", "/progress"],
) {
  for (const path of paths) revalidatePath(path);
}
