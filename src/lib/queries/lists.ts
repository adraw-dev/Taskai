import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { List } from "@/lib/types/database";

const listsKey = ["lists"] as const;

export function useLists() {
  const supabase = createClient();

  return useQuery({
    queryKey: listsKey,
    queryFn: async (): Promise<List[]> => {
      const { data, error } = await supabase
        .from("lists")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
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

      const { data, error } = await supabase
        .from("lists")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listsKey });
    },
  });
}

export function useDeleteList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase.from("lists").delete().eq("id", listId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listsKey });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
