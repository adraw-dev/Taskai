import { type TaskView, viewKey } from "@/modules/tasks/types";

// Todas las claves de tareas cuelgan de `taskKeys.all`, así una mutación
// invalida vistas, detalle y subtareas de una sola vez.
export const taskKeys = {
  all: ["tasks"] as const,
  view: (view: TaskView) => [...taskKeys.all, "view", viewKey(view)] as const,
  detail: (taskId: string | null) => [...taskKeys.all, "detail", taskId] as const,
  subtasks: (parentTaskId: string | null) =>
    [...taskKeys.all, "subtasks", parentTaskId] as const,
};

export const listKeys = {
  all: ["lists"] as const,
};

// Fuera de `taskKeys` a propósito: refrescarlos vuelve a firmar las URLs.
export const attachmentKeys = {
  byTask: (taskId: string | null) => ["attachments", taskId] as const,
};
