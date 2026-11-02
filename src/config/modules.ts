import type { ComponentType } from "react";
import { TasksFooterNav, TasksNav } from "@/modules/tasks/components/tasks-nav";

// Registro de módulos de la app. Para agregar uno nuevo: crea
// src/modules/<modulo>, sus rutas en src/app/app/<modulo> y su entrada aquí.
export interface AppModule {
  id: string;
  /** Grupos del sidebar (`SidebarGroup`) que aporta el módulo. */
  Nav: ComponentType;
  /** Ítems (`SidebarMenuItem`) para la zona inferior del sidebar. */
  FooterNav?: ComponentType;
}

export const appModules: AppModule[] = [
  { id: "tasks", Nav: TasksNav, FooterNav: TasksFooterNav },
];
