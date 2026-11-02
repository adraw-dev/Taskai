import type { PostgrestSingleResponse } from "@supabase/supabase-js";

// Desenvuelve la respuesta de Supabase: lanza el error para que TanStack Query
// lo exponga, o devuelve los datos con el tipo de la respuesta exitosa.
export function unwrap<T>(result: PostgrestSingleResponse<T>): T {
  if (result.error) throw result.error;
  return result.data;
}
