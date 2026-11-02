"use client";

import { TaskBoard } from "@/modules/tasks/components/task-board";

export default function TodayPage() {
  return <TaskBoard view={{ type: "today" }} title="Hoy" />;
}
