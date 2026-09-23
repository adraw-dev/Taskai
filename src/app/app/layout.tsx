import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { FloatingActionBar } from "@/components/floating-action-bar";
import { GenerateAiPromptDialog } from "@/components/generate-ai-prompt-dialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
      <TaskDetailSheet />
      <FloatingActionBar />
      <GenerateAiPromptDialog />
    </SidebarProvider>
  );
}
