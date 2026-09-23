export type Priority = "low" | "medium" | "high";

export interface List {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  list_id: string | null;
  parent_task_id: string | null;
  title: string;
  notes: string | null;
  is_completed: boolean;
  is_important: boolean;
  due_date: string | null;
  priority: Priority | null;
  position: number;
  deleted_at: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  type: string | null;
  created_at: string;
}
