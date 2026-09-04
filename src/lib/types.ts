export type Priority = "high" | "medium" | "low";
export type TaskType = "assignment" | "test";

export type Subject = {
  id: string;
  name: string;
  short: string;
  color: string; // tailwind accent
  dot: string;
};

export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export type ClassPeriod = {
  id: string;
  subjectId: string;
  subject: string;
  room: string;
  start: string; // "09:00"
  end: string;
  teacher: string;
  day?: WeekDay;
  color?: string; // hex or tailwind key override
  recurring?: boolean;
};

export type Task = {
  id: string;
  title: string;
  subjectId: string;
  subject: string;
  type: TaskType;
  dueDate: string; // ISO date
  priority: Priority;
  estMinutes: number;
  completed?: boolean;
};

export type CatchUpState = {
  missedDays: number;
  missedDateLabel: string; // "Sep 2-3"
  totalTasks: number;
  recovered: number;
  tasks: Task[];
};

export type WorkloadDay = {
  day: string; // "Mon"
  dateLabel: string;
  hours: number;
  count: number;
};
