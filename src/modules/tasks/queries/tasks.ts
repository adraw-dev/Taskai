import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/dates";
import { unwrap } from "@/lib/query";
import type { Task, TaskView } from "@/modules/tasks/types";
import { taskKeys } from "@/modules/tasks/queries/keys";

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
    query = query.eq("due_date", todayDateString());
  } else if (view.type === "important") {
    query = query.eq("is_important", true);
  } else if (view.type === "planned") {
    query = query.not("due_date", "is", null);
  } else if (view.type === "list") {
    query = query.eq("list_id", view.listId);
  }

  return unwrap(await query) ?? [];
}

export function useTasks(view: TaskView) {
  return useQuery({
    queryKey: taskKeys.view(view),
    queryFn: () => fetchTasks(view),
  });
}

export function useSubtasks(parentTaskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: taskKeys.subtasks(parentTaskId),
    enabled: !!parentTaskId,
    queryFn: async (): Promise<Task[]> => {
      const result = await supabase
        .from("tasks")
        .select("*")
        .eq("parent_task_id", parentTaskId as string)
        .order("position", { ascending: true });

      return unwrap(result) ?? [];
    },
  });
}

export function useTask(taskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: taskKeys.detail(taskId),
    enabled: !!taskId,
    queryFn: async (): Promise<Task | null> =>
      unwrap(
        await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId as string)
          .single(),
      ),
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: taskKeys.all });
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

      return unwrap(
        await supabase
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
          .single(),
      );
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
    }) =>
      unwrap(
        await supabase
          .from("tasks")
          .update(updates)
          .eq("id", taskId)
          .select()
          .single(),
      ),
    onSuccess: invalidate,
  });
}

export function useReorderTasks() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      const results = await Promise.all(
        updates.map(({ id, position }) =>
          supabase.from("tasks").update({ position }).eq("id", id),
        ),
      );
      results.forEach(unwrap);
    },
    onSuccess: invalidate,
  });
}

export function useTrashTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      unwrap(
        await supabase
          .from("tasks")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", taskId),
      );
    },
    onSuccess: invalidate,
  });
}

export function useRestoreTask() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      unwrap(await supabase.from("tasks").update({ deleted_at: null }).eq("id", taskId));
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTaskPermanently() {
  const supabase = createClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: async (taskId: string) => {
      unwrap(await supabase.from("tasks").delete().eq("id", taskId));
    },
    onSuccess: invalidate,
  });
}
