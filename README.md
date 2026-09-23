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
- `src/app/app` — layout con sidebar + vistas (Hoy, Importante, Planeado, listas, papelera, ajustes)
- `src/components` — UI de la app (task board, sheet de detalle, diálogo de IA, etc.)
- `src/lib/supabase` — clientes de Supabase (browser, server, middleware)
- `src/lib/queries` — hooks de TanStack Query sobre Supabase
- `supabase/migrations` — esquema SQL + RLS + bucket de Storage
- `supabase/functions/generate-ai-prompt` — Edge Function que arma el prompt y llama a Gemini/Claude

## PWA

`public/manifest.json` + `public/sw.js` (cache de app shell y de las respuestas GET a la API de Supabase para lectura básica offline).
