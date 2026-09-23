import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mockCategorias, mockJugadores, todosLosPartidos } from "@/lib/mock-data";
import type { Categoria, Jugador, PartidoCompleto } from "@/lib/types";

export async function getJugadores(): Promise<Jugador[]> {
  if (!isSupabaseConfigured()) {
    return mockJugadores;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugador")
    .select("*")
    .order("apellido", { ascending: true });
  if (error) throw error;
  return data as Jugador[];
}

export async function getCategorias(): Promise<Categoria[]> {
  if (!isSupabaseConfigured()) {
    return mockCategorias;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("categoria").select("*").order("nombre");
  if (error) throw error;
  return data as Categoria[];
}

export interface PerfilJugador {
  jugador: Jugador;
  categoria: Categoria | null;
  partidos: PartidoCompleto[];
}

export async function getPerfilJugador(id: string): Promise<PerfilJugador | null> {
  if (!isSupabaseConfigured()) {
    const jugador = mockJugadores.find((j) => j.id === id);
    if (!jugador) return null;
    const categoria = mockCategorias.find((c) => c.id === jugador.categoria_actual_id) ?? null;
    const partidos = todosLosPartidos().filter(
      (p) =>
        p.pareja_a.jugador1_id === id ||
        p.pareja_a.jugador2_id === id ||
        p.pareja_b.jugador1_id === id ||
        p.pareja_b.jugador2_id === id
    );
    return { jugador, categoria, partidos };
  }

  const supabase = await createClient();
  const { data: jugador, error: jugadorError } = await supabase
    .from("jugador")
    .select("*, categoria:categoria_actual_id(*)")
    .eq("id", id)
    .maybeSingle();
  if (jugadorError) throw jugadorError;
  if (!jugador) return null;

  const { data: partidosData, error: partidosError } = await supabase
    .from("partido")
    .select(
      "*, sets:set_resultado(*), pareja_a:pareja_a_id(*, jugador1:jugador1_id(*), jugador2:jugador2_id(*)), pareja_b:pareja_b_id(*, jugador1:jugador1_id(*), jugador2:jugador2_id(*))"
    )
    .or(
      `pareja_a_id.in.(${await parejaIdsDe(id)}),pareja_b_id.in.(${await parejaIdsDe(id)})`
    );
  if (partidosError) throw partidosError;

  const { categoria, ...jugadorFields } = jugador as Jugador & { categoria: Categoria | null };

  return {
    jugador: jugadorFields as Jugador,
    categoria,
    partidos: (partidosData ?? []) as unknown as PartidoCompleto[],
  };
}

async function parejaIdsDe(jugadorId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pareja")
    .select("id")
    .or(`jugador1_id.eq.${jugadorId},jugador2_id.eq.${jugadorId}`);
  if (error) throw error;
  return (data ?? []).map((p) => p.id).join(",") || "00000000-0000-0000-0000-000000000000";
}
