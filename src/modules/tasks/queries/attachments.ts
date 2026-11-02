import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { unwrap } from "@/lib/query";
import type { Attachment } from "@/modules/tasks/types";
import { attachmentKeys } from "@/modules/tasks/queries/keys";

export interface AttachmentWithUrl extends Attachment {
  name: string;
}

export function useAttachments(taskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: attachmentKeys.byTask(taskId),
    enabled: !!taskId,
    queryFn: async (): Promise<AttachmentWithUrl[]> => {
      const data = unwrap(
        await supabase
          .from("attachments")
          .select("*")
          .eq("task_id", taskId as string)
          .order("created_at", { ascending: true }),
      );

      if (!data || data.length === 0) return [];

      // El bucket es privado (RLS por usuario), así que el file_url almacenado
      // es la ruta del objeto y se firma al momento de mostrarlo.
      const signed = await Promise.all(
        data.map(async (attachment) => {
          const { data: signedUrl } = await supabase.storage
            .from("attachments")
            .createSignedUrl(attachment.file_url, 60 * 60);
          return {
            ...attachment,
            name: attachment.file_url.split("/").pop() ?? attachment.file_url,
            file_url: signedUrl?.signedUrl ?? attachment.file_url,
          };
        }),
      );

      return signed;
    },
  });
}

export function useUploadAttachment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const path = `${user.id}/${taskId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(path, file);
      if (uploadError) throw uploadError;

      return unwrap(
        await supabase
          .from("attachments")
          .insert({ task_id: taskId, file_url: path, type: file.type })
          .select()
          .single(),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.byTask(variables.taskId) });
    },
  });
}
