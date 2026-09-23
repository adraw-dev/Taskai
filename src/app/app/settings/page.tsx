"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/lib/queries/user";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { data: user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{user?.email?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{user?.email ?? "Cargando..."}</CardTitle>
            <CardDescription>Cuenta de Taskia</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
