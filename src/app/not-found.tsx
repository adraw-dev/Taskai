import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <Compass className="size-12 text-primary" />
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        No encontramos la página que buscas.
      </p>
      <Link href="/app">
        <Button>Volver al inicio</Button>
      </Link>
    </main>
  );
}
