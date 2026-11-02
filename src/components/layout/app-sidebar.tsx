"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, LogOut, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { appModules } from "@/config/modules";
import { useSignOut, useUser } from "@/lib/auth";

const footerModules = appModules.filter((appModule) => appModule.FooterNav);

export function AppSidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const signOut = useSignOut();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ListTodo className="size-4" />
          </div>
          <span className="font-semibold">Taskia</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {appModules.map(({ id, Nav }) => (
          <Nav key={id} />
        ))}
        {footerModules.length > 0 && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {footerModules.map(({ id, FooterNav }) => FooterNav && <FooterNav key={id} />)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/app/settings"}>
              <Link href="/app/settings">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[10px]">
                    {user?.email?.slice(0, 2).toUpperCase() ?? "??"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user?.email ?? "Perfil"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/app/settings">
                <Settings />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
