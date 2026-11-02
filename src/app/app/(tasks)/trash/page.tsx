"use client";

import { Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton, PageContainer, PageHeader } from "@/components/shared/page";
import {
  useDeleteTaskPermanently,
  useRestoreTask,
  useTasks,
} from "@/modules/tasks/queries/tasks";

export default function TrashPage() {
  const { data: tasks, isLoading } = useTasks({ type: "trash" });
  const restoreTask = useRestoreTask();
  const deleteTaskPermanently = useDeleteTaskPermanently();

  return (
    <PageContainer>
      <PageHeader title="Papelera" />

      {isLoading && <ListSkeleton rows={3} />}

      {!isLoading && tasks?.length === 0 && (
        <EmptyState icon={Trash2} message="La papelera está vacía." />
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
    </PageContainer>
  );
}
