"use client";

import { useMemo } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ListChecks, MousePointerClick, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickAddTask } from "@/components/quick-add-task";
import { TaskItem } from "@/components/task-item";
import { useReorderTasks, useTasks } from "@/lib/queries/tasks";
import { useSelectionStore } from "@/lib/store/selection-store";
import type { TaskView } from "@/lib/types/view";

export function TaskBoard({ view, title }: { view: TaskView; title: string }) {
  const { data: tasks, isLoading } = useTasks(view);
  const reorderTasks = useReorderTasks();

  const selectionMode = useSelectionStore((s) => s.selectionMode);
  const enterSelectionMode = useSelectionStore((s) => s.enterSelectionMode);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const pending = useMemo(() => tasks?.filter((t) => !t.is_completed) ?? [], [tasks]);
  const completed = useMemo(() => tasks?.filter((t) => t.is_completed) ?? [], [tasks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !tasks) return;

    const oldIndex = pending.findIndex((t) => t.id === active.id);
    const newIndex = pending.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pending, oldIndex, newIndex);
    reorderTasks.mutate(reordered.map((t, index) => ({ id: t.id, position: index })));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button
          variant={selectionMode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => (selectionMode ? exitSelectionMode() : enterSelectionMode())}
          className="gap-2"
        >
          {selectionMode ? <X className="size-4" /> : <MousePointerClick className="size-4" />}
          {selectionMode ? "Cancelar selección" : "Seleccionar"}
        </Button>
      </div>

      <QuickAddTask view={view} />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && tasks?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
          <ListChecks className="size-10" />
          <p>No hay tareas por aquí todavía.</p>
        </div>
      )}

      {!isLoading && tasks && tasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={[...pending, ...completed].map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {pending.length > 0 && (
              <div className="flex flex-col gap-1">
                {pending.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                  Completadas ({completed.length})
                </p>
                <div className="flex flex-col gap-1">
                  {completed.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
