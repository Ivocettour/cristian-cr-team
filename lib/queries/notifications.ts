import { createClient } from "@/lib/supabase/server";
import type { Notificacion } from "@/lib/types";

export async function getNotificaciones(usuarioId: string): Promise<Notificacion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notificacion")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("creado_at", { ascending: false })
    .limit(20);

  return (data ?? []) as Notificacion[];
}
