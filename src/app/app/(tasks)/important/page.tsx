"use client";

import { TaskBoard } from "@/modules/tasks/components/task-board";

export default function ImportantPage() {
  return <TaskBoard view={{ type: "important" }} title="Importante" />;
}
