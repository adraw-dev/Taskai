"use client";

import { useEffect } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateAiPrompt } from "@/modules/tasks/queries/ai";
import { useSelectionStore } from "@/modules/tasks/selection-store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function GenerateAiPromptDialog() {
  const aiDialogOpen = useSelectionStore((s) => s.aiDialogOpen);
  const setAiDialogOpen = useSelectionStore((s) => s.setAiDialogOpen);
  const selectedTaskIds = useSelectionStore((s) => s.selectedTaskIds);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);

  const generate = useGenerateAiPrompt();
  const [copiedPrompt, copyPrompt] = useCopyToClipboard();
  const [copiedResponse, copyResponse] = useCopyToClipboard();

  useEffect(() => {
    if (aiDialogOpen && selectedTaskIds.size > 0) {
      generate.mutate([...selectedTaskIds], {
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "No se pudo generar el prompt",
          );
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiDialogOpen]);

  function handleOpenChange(open: boolean) {
    setAiDialogOpen(open);
    if (!open) {
      generate.reset();
      exitSelectionMode();
    }
  }

  return (
    <Dialog open={aiDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Generar prompt con IA
          </DialogTitle>
          <DialogDescription>
            Prompt generado a partir de las tareas seleccionadas y la respuesta del
            modelo.
          </DialogDescription>
        </DialogHeader>

        {generate.isPending && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Generando...
          </div>
        )}

        {generate.data && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prompt</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => copyPrompt(generate.data!.prompt)}
                >
                  {copiedPrompt ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Copiar
                </Button>
              </div>
              <Textarea readOnly value={generate.data.prompt} className="h-28 resize-none" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Respuesta ({generate.data.provider === "gemini" ? "Gemini" : "Claude Haiku 4.5"})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => copyResponse(generate.data!.response)}
                >
                  {copiedResponse ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Copiar
                </Button>
              </div>
              <Textarea
                readOnly
                value={generate.data.response}
                className="h-40 resize-none"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
