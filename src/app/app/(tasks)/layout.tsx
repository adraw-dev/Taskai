import { TaskDetailSheet } from "@/modules/tasks/components/task-detail-sheet";
import { FloatingActionBar } from "@/modules/tasks/components/floating-action-bar";
import { GenerateAiPromptDialog } from "@/modules/tasks/components/generate-ai-prompt-dialog";

// Route group: no cambia las URLs (/app, /app/important, /app/list/…), solo
// limita estos componentes globales de tareas a las vistas de tareas.
export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TaskDetailSheet />
      <FloatingActionBar />
      <GenerateAiPromptDialog />
    </>
  );
}
