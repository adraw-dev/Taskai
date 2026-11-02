import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { unwrap } from "@/lib/query";
import type { List } from "@/modules/tasks/types";
import { listKeys, taskKeys } from "@/modules/tasks/queries/keys";

export function useLists() {
  const supabase = createClient();

  return useQuery({
    queryKey: listKeys.all,
    queryFn: async (): Promise<List[]> => {
      const result = await supabase
        .from("lists")
        .select("*")
        .order("created_at", { ascending: true });

      return unwrap(result) ?? [];
    },
  });
}

export function useCreateList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      return unwrap(
        await supabase.from("lists").insert({ name, user_id: user.id }).select().single(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

export function useDeleteList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      unwrap(await supabase.from("lists").delete().eq("id", listId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
