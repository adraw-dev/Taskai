// Supabase Edge Function (Deno). Arma el prompt a partir de las tareas
// seleccionadas y llama al modelo: Gemini primero, Claude Haiku 4.5 como
// fallback si Gemini falla o se agota la cuota. Las API keys viven solo aquí,
// nunca se exponen al cliente.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText } from "npm:ai@7";
import { createGoogleGenerativeAI } from "npm:@ai-sdk/google@4";
import { createAnthropic } from "npm:@ai-sdk/anthropic@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskWithChildren {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: string | null;
  subtasks: { title: string; is_completed: boolean }[];
  attachments: { file_url: string; type: string | null }[];
}

function buildPrompt(tasks: TaskWithChildren[]): string {
  const sections = tasks.map((task) => {
    const lines = [`Tarea: ${task.title}`];
    if (task.due_date) lines.push(`Fecha límite: ${task.due_date}`);
    if (task.priority) lines.push(`Prioridad: ${task.priority}`);
    if (task.notes) lines.push(`Notas: ${task.notes}`);
    if (task.subtasks.length > 0) {
      lines.push("Subtareas:");
      for (const subtask of task.subtasks) {
        lines.push(`  - [${subtask.is_completed ? "x" : " "}] ${subtask.title}`);
      }
    }
    if (task.attachments.length > 0) {
      lines.push(`Adjuntos: ${task.attachments.length}`);
    }
    return lines.join("\n");
  });

  return [
    "Eres un asistente de productividad. A partir de las siguientes tareas,",
    "genera un resumen claro, un plan de acción y un checklist accionable.",
    "",
    sections.join("\n\n"),
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { taskIds } = (await req.json()) as { taskIds?: string[] };
    if (!taskIds || taskIds.length === 0) {
      return new Response(JSON.stringify({ error: "taskIds es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente con el JWT del usuario: la RLS garantiza que solo vea sus propias tareas.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: rootTasks, error: rootError } = await supabase
      .from("tasks")
      .select("id, title, notes, due_date, priority")
      .in("id", taskIds);

    if (rootError) throw rootError;
    if (!rootTasks || rootTasks.length === 0) {
      return new Response(JSON.stringify({ error: "No se encontraron tareas" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: subtasks }, { data: attachments }] = await Promise.all([
      supabase
        .from("tasks")
        .select("parent_task_id, title, is_completed")
        .in("parent_task_id", taskIds),
      supabase
        .from("attachments")
        .select("task_id, file_url, type")
        .in("task_id", taskIds),
    ]);

    const tasksWithChildren: TaskWithChildren[] = rootTasks.map((task) => ({
      ...task,
      subtasks: (subtasks ?? []).filter((s) => s.parent_task_id === task.id),
      attachments: (attachments ?? []).filter((a) => a.task_id === task.id),
    }));

    const prompt = buildPrompt(tasksWithChildren);

    const googleApiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY");
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    let response: string | null = null;
    let provider: "gemini" | "claude-haiku" = "gemini";
    let geminiError: string | null = null;
    let anthropicError: string | null = null;

    if (googleApiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
        const result = await generateText({
          model: google("gemini-3.6-flash"),
          prompt,
        });
        response = result.text;
      } catch (error) {
        geminiError = error instanceof Error ? error.message : String(error);
      }
    } else {
      geminiError = "GOOGLE_GENERATIVE_AI_API_KEY no está configurada.";
    }

    if (!response) {
      if (anthropicApiKey) {
        try {
          const anthropic = createAnthropic({ apiKey: anthropicApiKey });
          const result = await generateText({
            model: anthropic("claude-haiku-4-5-20251001"),
            prompt,
          });
          response = result.text;
          provider = "claude-haiku";
        } catch (error) {
          anthropicError = error instanceof Error ? error.message : String(error);
        }
      } else {
        anthropicError = "ANTHROPIC_API_KEY no está configurada.";
      }
    }

    if (!response) {
      throw new Error(
        `Gemini falló: ${geminiError}. Claude Haiku falló: ${anthropicError}.`,
      );
    }

    return new Response(JSON.stringify({ prompt, response, provider }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
