"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { todayDateString } from "@/lib/dates";
import { useCreateTask } from "@/modules/tasks/queries/tasks";
import type { TaskView } from "@/modules/tasks/types";

export function QuickAddTask({ view }: { view: TaskView }) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const today = todayDateString();

    try {
      await createTask.mutateAsync({
        title: trimmed,
        listId: view.type === "list" ? view.listId : undefined,
        dueDate: view.type === "today" || view.type === "planned" ? today : undefined,
        isImportant: view.type === "important",
      });
      setTitle("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la tarea");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Plus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Agregar una tarea..."
        className="h-11 pl-9"
      />
    </form>
  );
}
