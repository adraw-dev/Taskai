"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Paperclip,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/lib/store/selection-store";
import {
  useCreateTask,
  useSubtasks,
  useTask,
  useTrashTask,
  useUpdateTask,
} from "@/lib/queries/tasks";
import { useAttachments, useUploadAttachment } from "@/lib/queries/attachments";
import type { Task } from "@/lib/types/database";

export function TaskDetailSheet() {
  const activeTaskId = useSelectionStore((s) => s.activeTaskId);
  const closeTaskDetail = useSelectionStore((s) => s.closeTaskDetail);
  const { data: task } = useTask(activeTaskId);

  return (
    <Sheet open={!!activeTaskId} onOpenChange={(open) => !open && closeTaskDetail()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="sr-only">Detalle de tarea</SheetTitle>
        </SheetHeader>

        {task && <TaskDetailForm key={task.id} task={task} onDeleted={closeTaskDetail} />}
      </SheetContent>
    </Sheet>
  );
}

function TaskDetailForm({ task, onDeleted }: { task: Task; onDeleted: () => void }) {
  const { data: subtasks } = useSubtasks(task.id);
  const { data: attachments } = useAttachments(task.id);

  const updateTask = useUpdateTask();
  const trashTask = useTrashTask();
  const createSubtask = useCreateTask();
  const uploadAttachment = useUploadAttachment();

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [subtaskTitle, setSubtaskTitle] = useState("");

  async function handleAddSubtask() {
    const trimmed = subtaskTitle.trim();
    if (!trimmed) return;
    await createSubtask.mutateAsync({ title: trimmed, parentTaskId: task.id });
    setSubtaskTitle("");
  }

  async function handleDelete() {
    await trashTask.mutateAsync(task.id);
    toast.success("Tarea movida a la papelera");
    onDeleted();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment.mutateAsync({ taskId: task.id, file });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el archivo");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-6">
      <div className="flex items-start gap-2">
        <Checkbox
          variant="circle"
          className="mt-2.5"
          checked={task.is_completed}
          onCheckedChange={(checked) =>
            updateTask.mutate({ taskId: task.id, updates: { is_completed: !!checked } })
          }
        />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title !== task.title) {
              updateTask.mutate({ taskId: task.id, updates: { title } });
            }
          }}
          className="border-none px-0 text-base font-medium shadow-none focus-visible:ring-0"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            updateTask.mutate({
              taskId: task.id,
              updates: { is_important: !task.is_important },
            })
          }
        >
          <Star className={cn("size-4", task.is_important && "fill-primary text-primary")} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="size-3.5" />
              {task.due_date
                ? format(new Date(task.due_date), "d 'de' MMMM", { locale: es })
                : "Fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={task.due_date ? new Date(task.due_date) : undefined}
              onSelect={(date) =>
                updateTask.mutate({
                  taskId: task.id,
                  updates: { due_date: date ? date.toISOString().slice(0, 10) : null },
                })
              }
            />
          </PopoverContent>
        </Popover>

        <Select
          value={task.priority ?? "none"}
          onValueChange={(value) =>
            updateTask.mutate({
              taskId: task.id,
              updates: { priority: value === "none" ? null : (value as never) },
            })
          }
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin prioridad</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="Notas..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== (task.notes ?? "")) {
            updateTask.mutate({ taskId: task.id, updates: { notes } });
          }
        }}
        className="min-h-20 resize-none"
      />

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">Subtareas</p>
        <div className="flex flex-col gap-1">
          {subtasks?.map((subtask) => (
            <label
              key={subtask.id}
              className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-secondary/40"
            >
              <Checkbox
                variant="circle"
                checked={subtask.is_completed}
                onCheckedChange={(checked) =>
                  updateTask.mutate({
                    taskId: subtask.id,
                    updates: { is_completed: !!checked },
                  })
                }
              />
              <span
                className={cn(
                  "text-sm",
                  subtask.is_completed && "text-muted-foreground line-through",
                )}
              >
                {subtask.title}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
            placeholder="Agregar subtarea..."
            className="h-8"
          />
          <Button size="icon" className="size-8 shrink-0" onClick={handleAddSubtask}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">Adjuntos</p>
        <div className="flex flex-col gap-1">
          {attachments?.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-secondary/40"
            >
              <Paperclip className="size-3.5 text-muted-foreground" />
              <span className="truncate">{attachment.name}</span>
            </a>
          ))}
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
          <Upload className="size-3.5" />
          {uploadAttachment.isPending ? "Subiendo..." : "Subir archivo"}
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <Separator />

      <Button
        variant="ghost"
        className="w-fit gap-2 text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
        Eliminar tarea
      </Button>
    </div>
  );
}
