"use client";

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
import { PageContainer, PageHeader } from "@/components/shared/page";
import { useSignOut, useUser } from "@/lib/auth";

export default function SettingsPage() {
  const { data: user } = useUser();
  const signOut = useSignOut();

  return (
    <PageContainer>
      <PageHeader title="Configuración" />

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
          <Button variant="outline" className="gap-2" onClick={signOut}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
