export type TaskView =
  | { type: "today" }
  | { type: "important" }
  | { type: "planned" }
  | { type: "list"; listId: string }
  | { type: "trash" };

export function viewKey(view: TaskView): string {
  return view.type === "list" ? `list:${view.listId}` : view.type;
}
