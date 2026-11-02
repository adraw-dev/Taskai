"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Star, Sun, Trash2 } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NewListDialog } from "@/modules/tasks/components/new-list-dialog";
import { useLists } from "@/modules/tasks/queries/lists";

const primaryLinks = [
  { href: "/app", label: "Hoy", icon: Sun },
  { href: "/app/important", label: "Importante", icon: Star },
  { href: "/app/planned", label: "Planeado", icon: CalendarClock },
];

export function TasksNav() {
  const pathname = usePathname();
  const { data: lists } = useLists();

  return (
    <>
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
    </>
  );
}

export function TasksFooterNav() {
  const pathname = usePathname();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pathname === "/app/trash"}>
        <Link href="/app/trash">
          <Trash2 />
          <span>Papelera</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
