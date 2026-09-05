export function completion(tasks: { status: string }[]) {
  const done = tasks.filter((task) => task.status === "completed").length;
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}
export function studyMinutes(
  sessions: { duration: number; status: string }[],
  status?: string,
) {
  return sessions
    .filter((session) =>
      status ? session.status === status : session.status !== "skipped",
    )
    .reduce((sum, session) => sum + session.duration, 0);
}
