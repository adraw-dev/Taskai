# Taskia

App de gestión de tareas y subtareas (estilo Microsoft To Do / Google Keep) con generación de prompts de IA a partir de tareas seleccionadas.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix)
- Zustand (estado de cliente) + TanStack Query (estado de servidor)
- dnd-kit (drag & drop) + react-hook-form + zod
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Vercel AI SDK (Gemini como proveedor principal, Claude Haiku 4.5 como fallback)

## Configuración

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia `.env.example` a `.env.local` y completa:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
3. Aplica el esquema de base de datos (tablas, RLS y bucket de adjuntos):
   ```bash
   npx supabase link --project-ref <tu-project-ref>
   npx supabase db push
   ```
4. Configura los secretos de la Edge Function (nunca se exponen al cliente):
   ```bash
   npx supabase secrets set GOOGLE_GENERATIVE_AI_API_KEY=... ANTHROPIC_API_KEY=...
   ```
5. Despliega la Edge Function:
   ```bash
   npx supabase functions deploy generate-ai-prompt
   ```

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura relevante

- `src/app/(login|signup)` — autenticación
- `src/app/app/layout.tsx` — shell común (sidebar + header), sin lógica de ningún módulo
- `src/app/app/(tasks)` — route group de Tareas (Hoy, Importante, Planeado, listas, papelera); su layout monta el sheet de detalle, la barra de selección y el diálogo de IA
- `src/modules/<modulo>` — código de cada módulo: `components/`, `queries/` (hooks de TanStack Query), `types.ts`, estado de cliente
- `src/config/modules.ts` — registro de módulos que alimenta el sidebar
- `src/components/ui` — primitivos de shadcn/ui (sin modificar)
- `src/components/shared` — composiciones reutilizables entre módulos (contenedor de página, estado vacío, etc.)
- `src/components/layout` — sidebar, providers y registro del service worker
- `src/lib` — utilidades transversales: clientes de Supabase, `auth.ts`, `dates.ts` (fechas locales), `query.ts`
- `src/lib/types/supabase.ts` — tipos del esquema; se regeneran con `npm run db:types` tras cada migración
- `supabase/migrations` — esquema SQL + RLS + bucket de Storage

### Agregar un módulo

1. Migración en `supabase/migrations` y `npm run db:types`.
2. Código en `src/modules/<modulo>` (los módulos no se importan entre sí; lo compartido va en `src/components/shared` o `src/lib`).
3. Rutas en `src/app/app/<modulo>`.
4. Entrada en `src/config/modules.ts`.
- `supabase/functions/generate-ai-prompt` — Edge Function que arma el prompt y llama a Gemini/Claude

## PWA

`public/manifest.json` + `public/sw.js` (cache de app shell y de las respuestas GET a la API de Supabase para lectura básica offline).
