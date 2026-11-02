import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface GenerateAiPromptResult {
  prompt: string;
  response: string;
  provider: "gemini" | "claude-haiku";
}

export function useGenerateAiPrompt() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (taskIds: string[]): Promise<GenerateAiPromptResult> => {
      const { data, error } = await supabase.functions.invoke("generate-ai-prompt", {
        body: { taskIds },
      });

      if (error) throw error;
      return data as GenerateAiPromptResult;
    },
  });
}
