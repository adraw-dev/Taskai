import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async function signOut() {
    await createClient().auth.signOut();
    // El QueryClient vive en el layout raíz y sobrevive a la navegación: sin
    // limpiarlo, otro usuario que inicie sesión vería datos en caché del anterior.
    queryClient.clear();
    router.push("/login");
    router.refresh();
  };
}
