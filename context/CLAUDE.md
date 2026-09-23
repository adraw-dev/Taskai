Prompt de construcción — App de Tareas con IA
Copia este documento completo como primer mensaje a Claude Code, GitHub Copilot Chat, o guárdalo como CLAUDE.md / .github/copilot-instructions.md en la raíz del repo.

Contexto del proyecto
Construye una aplicación web (con soporte PWA para mobile) de gestión de tareas y subtareas, inspirada en Microsoft To Do y Google Keep. Además de la gestión clásica de tareas, la app permite seleccionar una o varias tareas y generar, a partir de su contenido, un prompt de IA que se envía a un modelo de lenguaje y devuelve una respuesta útil (resumen, plan, checklist, etc.).

Es un proyecto personal: prioriza velocidad de desarrollo y costo operativo cercano a cero sobre arquitectura de nivel enterprise.

Stack tecnológico
Frontend web
Next.js 16 (App Router) + React 19 + TypeScript
Tailwind CSS v4
shadcn/ui — usa ÚNICAMENTE los componentes tal cual los entrega la librería (instalados con npx shadcn add <componente>). No crees componentes visuales desde cero; compón la UI a partir de los primitivos oficiales.
Zustand — estado de cliente (selección de tareas, estado de UI)
TanStack Query — estado de servidor y sincronización con Supabase
dnd-kit — reordenar tareas y subtareas por drag & drop
react-hook-form + zod — formularios y validación
Mobile
PWA sobre el mismo código de Next.js (manifest.json + service worker). Instalable, con cache básico de tareas para uso offline. No se construye una app nativa separada.
Backend / Datos
Supabase: Postgres (base de datos), Auth (autenticación), Storage (adjuntos), Edge Functions (lógica de IA)
Row Level Security (RLS) activo en todas las tablas — cada usuario solo accede a sus propios datos
IA
Vercel AI SDK (ai, @ai-sdk/react, @ai-sdk/google, @ai-sdk/anthropic)
Proveedor principal: Gemini (tier gratuito de Google AI Studio), usando la propia API key del usuario
Fallback: Claude Haiku 4.5, si Gemini falla o se agota la cuota
La llamada al modelo se ejecuta siempre en una Supabase Edge Function, nunca desde el cliente (las API keys nunca se exponen en el frontend)
No uses LangChain ni el AI Gateway de Vercel — no aportan nada al caso de uso y agregan complejidad innecesaria
Deploy
Vercel para el frontend/PWA
Supabase para base de datos, auth y Edge Functions
Tema visual: Dark + Morado (obligatorio, no opcional)
La app usa un tema oscuro como único tema principal, con morado como color de acento primario. Define las variables CSS de shadcn/ui así (el agente puede ajustar tonos exactos, pero debe respetar la paleta):

:root {
  --background: oklch(0.14 0.01 285);
  --foreground: oklch(0.96 0.01 285);
  --card: oklch(0.18 0.015 285);
  --card-foreground: oklch(0.96 0.01 285);
  --popover: oklch(0.18 0.015 285);
  --popover-foreground: oklch(0.96 0.01 285);
  --primary: oklch(0.62 0.22 295);
  --primary-foreground: oklch(0.98 0.01 295);
  --secondary: oklch(0.24 0.03 290);
  --secondary-foreground: oklch(0.96 0.01 285);
  --muted: oklch(0.22 0.02 285);
  --muted-foreground: oklch(0.65 0.02 285);
  --accent: oklch(0.30 0.08 292);
  --accent-foreground: oklch(0.96 0.01 285);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.26 0.02 285);
  --input: oklch(0.26 0.02 285);
  --ring: oklch(0.62 0.22 295);
  --radius: 0.625rem;
}
No se requiere toggle claro/oscuro salvo que se pida explícitamente — el oscuro con morado es el default y único tema.

Páginas / rutas necesarias
/login — Inicio de sesión (email/password vía Supabase Auth)
/signup — Registro de nuevo usuario
/app (home) — Vista principal:
Sidebar (componente Sidebar de shadcn): Hoy, Importante, Planeado, Mis listas (custom, creadas por el usuario), botón "+ Nueva lista"
Vista principal: input rápido de captura arriba ("Agregar una tarea..."), lista de tareas con Checkbox, barra de acciones flotante cuando hay tareas seleccionadas (incluye el botón "Generar prompt con IA")
/app/list/[listId] — Vista de una lista específica (mismo layout que home, filtrado por esa lista)
Panel de detalle de tarea (no es ruta aparte — es un Sheet lateral abierto desde cualquier tarea): subtareas (checkboxes anidados), notas, fecha (Calendar en Popover), adjuntos
Dialog "Generar prompt con IA": muestra el prompt generado y la respuesta del modelo, con botón de copiar
/app/settings — Perfil, cerrar sesión
/app/trash — Papelera de tareas eliminadas (opcional, común en este tipo de apps)
/404 — Página de error genérica
Modelo de datos (Supabase / Postgres)
lists: id, user_id, name, created_at
tasks: id, user_id, list_id, parent_task_id (nullable, para subtareas), title, notes, is_completed, due_date, priority, position (orden drag & drop), created_at
attachments: id, task_id, file_url, type, created_at
Todas las tablas con política RLS: user_id = auth.uid().

Comportamiento de la función de IA
El usuario entra en "modo selección" y marca una o varias tareas.
Al presionar "Generar prompt con IA", el cliente envía los IDs seleccionados a una Supabase Edge Function.
La función recorre cada tarea (título, subtareas, notas, adjuntos) y arma el contexto en una plantilla de prompt.
La función llama al modelo vía Vercel AI SDK: Gemini primero, Claude Haiku 4.5 como fallback si Gemini falla o se agota la cuota.
Devuelve el prompt generado (y, si aplica, la respuesta del modelo) al cliente, que la muestra en el Dialog con opción de copiar.
Reglas para el agente
Usa solo componentes oficiales de shadcn/ui (Button, Input, Checkbox, Sidebar, Sheet, Dialog, DropdownMenu, Calendar, Popover, Badge, Tabs, ScrollArea, Command, etc.), instalados vía la CLI de shadcn — no construyas primitivos visuales desde cero.
El layout de sidebar debe usar el sistema Sidebar / SidebarProvider / SidebarTrigger de shadcn, no un sidebar custom.
Respeta el tema dark + morado definido arriba en todas las pantallas.
Prioriza simplicidad y velocidad de entrega sobre arquitectura enterprise — es un proyecto personal.