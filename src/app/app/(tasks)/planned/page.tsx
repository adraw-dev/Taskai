"use client";

import { TaskBoard } from "@/modules/tasks/components/task-board";

export default function PlannedPage() {
  return <TaskBoard view={{ type: "planned" }} title="Planeado" />;
}
