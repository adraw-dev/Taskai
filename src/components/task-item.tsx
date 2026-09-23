"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUpdateTask } from "@/lib/queries/tasks";
import { useSelectionStore } from "@/lib/store/selection-store";
import type { Task } from "@/lib/types/database";

const priorityLabel: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const priorityVariant: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent text-accent-foreground",
  high: "bg-destructive/20 text-destructive",
};

export function TaskItem({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const selectionMode = useSelectionStore((s) => s.selectionMode);
  const isSelected = useSelectionStore((s) => s.selectedTaskIds.has(task.id));
  const toggleTaskSelection = useSelectionStore((s) => s.toggleTaskSelection);
  const enterSelectionMode = useSelectionStore((s) => s.enterSelectionMode);
  const openTaskDetail = useSelectionStore((s) => s.openTaskDetail);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleRowClick() {
    if (selectionMode) {
      toggleTaskSelection(task.id);
    } else {
      openTaskDetail(task.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border border-transparent px-2 py-2 hover:border-border hover:bg-secondary/40",
        isDragging && "opacity-50",
        isSelected && "border-primary/50 bg-accent/40",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100"
        aria-label="Reordenar"
      >
        <GripVertical className="size-4" />
      </button>

      {selectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleTaskSelection(task.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {!selectionMode && (
        <Checkbox
          variant="circle"
          checked={task.is_completed}
          onCheckedChange={(checked) =>
            updateTask.mutate({ taskId: task.id, updates: { is_completed: !!checked } })
          }
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            enterSelectionMode(task.id);
          }}
        />
      )}

      <div
        className="flex min-w-0 flex-1 cursor-pointer flex-col"
        onClick={handleRowClick}
      >
        <span
          className={cn(
            "truncate text-sm",
            task.is_completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {task.due_date && (
          <Badge variant="outline" className="text-[10px] font-normal">
            {format(new Date(task.due_date), "d MMM", { locale: es })}
          </Badge>
        )}
        {task.priority && (
          <Badge className={cn("text-[10px] font-normal", priorityVariant[task.priority])}>
            {priorityLabel[task.priority]}
          </Badge>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            updateTask.mutate({
              taskId: task.id,
              updates: { is_important: !task.is_important },
            });
          }}
          className={cn(
            "text-muted-foreground opacity-0 group-hover:opacity-100",
            task.is_important && "text-primary opacity-100",
          )}
          aria-label="Marcar como importante"
        >
          <Star className={cn("size-4", task.is_important && "fill-primary")} />
        </button>
      </div>
    </div>
  );
}
