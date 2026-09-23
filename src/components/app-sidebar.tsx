"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  ListTodo,
  LogOut,
  Settings,
  Star,
  Sun,
  Trash2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewListDialog } from "@/components/new-list-dialog";
import { useLists } from "@/lib/queries/lists";
import { useUser } from "@/lib/queries/user";
import { createClient } from "@/lib/supabase/client";

const primaryLinks = [
  { href: "/app", label: "Hoy", icon: Sun },
  { href: "/app/important", label: "Importante", icon: Star },
  { href: "/app/planned", label: "Planeado", icon: CalendarClock },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: lists } = useLists();
  const { data: user } = useUser();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={pathname === link.href}>
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Mis listas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lists?.map((list) => (
                <SidebarMenuItem key={list.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/app/list/${list.id}`}
                  >
                    <Link href={`/app/list/${list.id}`}>
                      <span className="truncate">{list.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <NewListDialog />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/app/trash"}>
                  <Link href="/app/trash">
                    <Trash2 />
                    <span>Papelera</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
