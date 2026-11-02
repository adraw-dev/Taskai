import type { Tables } from "@/lib/types/supabase";

export type List = Tables<"lists">;
export type Task = Tables<"tasks">;
export type Attachment = Tables<"attachments">;

export type Priority = "low" | "medium" | "high";

export type TaskView =
  | { type: "today" }
  | { type: "important" }
  | { type: "planned" }
  | { type: "list"; listId: string }
  | { type: "trash" };

export function viewKey(view: TaskView): string {
  return view.type === "list" ? `list:${view.listId}` : view.type;
}
