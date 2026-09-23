import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface UsuarioActual {
  id: string;
  email: string;
}

export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

export async function estaSiguiendoTorneo(usuarioId: string, torneoId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seguimiento_torneo")
    .select("torneo_id")
    .eq("usuario_id", usuarioId)
    .eq("torneo_id", torneoId)
    .maybeSingle();
  return Boolean(data);
}

export async function estaSiguiendoJugador(usuarioId: string, jugadorId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seguimiento_jugador")
    .select("jugador_id")
    .eq("usuario_id", usuarioId)
    .eq("jugador_id", jugadorId)
    .maybeSingle();
  return Boolean(data);
}

export interface TorneoSeguido {
  torneo_id: string;
  nombre: string;
  estado: string;
}

export interface JugadorSeguido {
  jugador_id: string;
  nombre: string;
  apellido: string;
}

export async function getTorneosSeguidos(usuarioId: string): Promise<TorneoSeguido[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seguimiento_torneo")
    .select("torneo_id, torneo:torneo_id(nombre, estado)")
    .eq("usuario_id", usuarioId);

  return (data ?? []).map((row) => {
    const torneo = row.torneo as unknown as { nombre: string; estado: string };
    return { torneo_id: row.torneo_id, nombre: torneo.nombre, estado: torneo.estado };
  });
}

export async function getJugadoresSeguidos(usuarioId: string): Promise<JugadorSeguido[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seguimiento_jugador")
    .select("jugador_id, jugador:jugador_id(nombre, apellido)")
    .eq("usuario_id", usuarioId);

  return (data ?? []).map((row) => {
    const jugador = row.jugador as unknown as { nombre: string; apellido: string };
    return { jugador_id: row.jugador_id, nombre: jugador.nombre, apellido: jugador.apellido };
  });
}
