"use client";

import { TaskBoard } from "@/components/task-board";

export default function PlannedPage() {
  return <TaskBoard view={{ type: "planned" }} title="Planeado" />;
}
