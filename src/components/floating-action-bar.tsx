"use client";

import { Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSelectionStore } from "@/lib/store/selection-store";
import { useTrashTask } from "@/lib/queries/tasks";

export function FloatingActionBar() {
  const selectedTaskIds = useSelectionStore((s) => s.selectedTaskIds);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);
  const setAiDialogOpen = useSelectionStore((s) => s.setAiDialogOpen);
  const trashTask = useTrashTask();

  const count = selectedTaskIds.size;
  if (count === 0) return null;

  async function handleDelete() {
    try {
      await Promise.all([...selectedTaskIds].map((id) => trashTask.mutateAsync(id)));
      toast.success("Tareas movidas a la papelera");
      exitSelectionMode();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-lg">
        <span className="px-2 text-sm text-muted-foreground">
          {count} seleccionada{count > 1 ? "s" : ""}
        </span>
        <Button size="sm" className="gap-2" onClick={() => setAiDialogOpen(true)}>
          <Sparkles className="size-4" />
          Generar prompt con IA
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDelete} aria-label="Eliminar">
          <Trash2 className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={exitSelectionMode}
          aria-label="Cancelar selección"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
