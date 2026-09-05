import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { DEMO_STUDENT_ID } from "./db/repository";

export async function markScheduleChanged() {
  await db.student.update({
    where: { id: DEMO_STUDENT_ID },
    data: { scheduleRevision: { increment: 1 } },
  });
}
export function refreshWorkspace(
  paths = ["/", "/assignments", "/planner", "/catch-up", "/progress"],
) {
  for (const path of paths) revalidatePath(path);
}
