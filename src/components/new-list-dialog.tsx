"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateList } from "@/lib/queries/lists";

export function NewListDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createList = useCreateList();
  const router = useRouter();

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const list = await createList.mutateAsync(trimmed);
      setOpen(false);
      setName("");
      router.push(`/app/list/${list.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la lista");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Plus className="size-4" />
          Nueva lista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva lista</DialogTitle>
          <DialogDescription>Crea una lista para organizar tus tareas.</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Nombre de la lista"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createList.isPending}
          >
            Crear lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
