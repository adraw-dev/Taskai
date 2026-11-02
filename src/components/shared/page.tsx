import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Piezas de página comunes a todos los módulos: contenedor, título con
// acciones, estado vacío y skeleton de lista.

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {actions}
    </div>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
      <Icon className="size-10" />
      <p>{message}</p>
    </div>
  );
}

export function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-md" />
      ))}
    </div>
  );
}
