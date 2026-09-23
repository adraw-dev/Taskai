import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Priority, Task } from "@/lib/types/database";
import { type TaskView, viewKey } from "@/lib/types/view";

function tasksKey(view: TaskView) {
  return ["tasks", viewKey(view)] as const;
}

async function fetchTasks(view: TaskView): Promise<Task[]> {
  const supabase = createClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .is("parent_task_id", null)
    .order("position", { ascending: true });

  if (view.type === "trash") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (view.type === "today") {
    const today = new Date().toISOString().slice(0, 10);
    query = query.eq("due_date", today);
  } else if (view.type === "important") {
    query = query.eq("is_important", true);
  } else if (view.type === "planned") {
    query = query.not("due_date", "is", null);
  } else if (view.type === "list") {
    query = query.eq("list_id", view.listId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function useTasks(view: TaskView) {
  return useQuery({
    queryKey: tasksKey(view),
    queryFn: () => fetchTasks(view),
  });
}

export function useSubtasks(parentTaskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["subtasks", parentTaskId],
    enabled: !!parentTaskId,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("parent_task_id", parentTaskId as string)
        .order("position", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTask(taskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["task", taskId],
    enabled: !!taskId,
    queryFn: async (): Promise<Task | null> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId as string)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["subtasks"] });
    queryClient.invalidateQueries({ queryKey: ["task"] });
  };
}

export function useCreateTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      listId?: string | null;
      parentTaskId?: string | null;
      dueDate?: string | null;
      isImportant?: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: input.title,
          user_id: user.id,
          list_id: input.listId ?? null,
          parent_task_id: input.parentTaskId ?? null,
          due_date: input.dueDate ?? null,
          is_important: input.isImportant ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<
        Pick<
          Task,
          | "title"
          | "notes"
          | "is_completed"
          | "is_important"
          | "due_date"
          | "priority"
          | "list_id"
          | "position"
        >
      >;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useReorderTasks() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      await Promise.all(
        updates.map(({ id, position }) =>
          supabase.from("tasks").update({ position }).eq("id", id),
        ),
      );
    },
    onSuccess: invalidate,
  });
}

export function useTrashTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRestoreTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: null })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTaskPermanently() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export type { Priority };
