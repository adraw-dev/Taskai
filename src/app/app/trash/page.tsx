"use client";

import { Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteTaskPermanently,
  useRestoreTask,
  useTasks,
} from "@/lib/queries/tasks";

export default function TrashPage() {
  const { data: tasks, isLoading } = useTasks({ type: "trash" });
  const restoreTask = useRestoreTask();
  const deleteTaskPermanently = useDeleteTaskPermanently();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Papelera</h1>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && tasks?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
          <Trash2 className="size-10" />
          <p>La papelera está vacía.</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 rounded-md border border-transparent px-2 py-2 hover:border-border hover:bg-secondary/40"
          >
            <span className="flex-1 truncate text-sm text-muted-foreground">
              {task.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Restaurar"
              onClick={async () => {
                await restoreTask.mutateAsync(task.id);
                toast.success("Tarea restaurada");
              }}
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Eliminar permanentemente"
              onClick={async () => {
                await deleteTaskPermanently.mutateAsync(task.id);
                toast.success("Tarea eliminada permanentemente");
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
