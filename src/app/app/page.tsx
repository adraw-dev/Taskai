"use client";

import { TaskBoard } from "@/components/task-board";

export default function TodayPage() {
  return <TaskBoard view={{ type: "today" }} title="Hoy" />;
}
