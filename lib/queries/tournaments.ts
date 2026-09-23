import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mockTorneos } from "@/lib/mock-data";
import { calcularEstadoTorneo } from "@/lib/torneo-estado";
import type {
  ParejaConJugadores,
  PartidoCompleto,
  Torneo,
  TorneoCompleto,
  TorneoCategoriaCompleto,
  ZonaConTabla,
} from "@/lib/types";

function conEstadoCalculado<T extends { fecha_inicio: string; fecha_fin: string }>(torneo: T): T {
  return { ...torneo, estado: calcularEstadoTorneo(torneo.fecha_inicio, torneo.fecha_fin) };
}

export async function getTorneos(): Promise<Torneo[]> {
  if (!isSupabaseConfigured()) {
    return mockTorneos.map(({ torneo_categorias, ...t }) => {
      void torneo_categorias;
      return conEstadoCalculado(t);
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("torneo")
    .select("*")
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;
  return (data as Torneo[]).map(conEstadoCalculado);
}

export async function getTorneoCompleto(id: string): Promise<TorneoCompleto | null> {
  if (!isSupabaseConfigured()) {
    const encontrado = mockTorneos.find((t) => t.id === id);
    return encontrado ? conEstadoCalculado(encontrado) : null;
  }

  const supabase = await createClient();

  const { data: torneo, error: torneoError } = await supabase
    .from("torneo")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (torneoError) throw torneoError;
  if (!torneo) return null;

  const { data: torneoCategorias, error: tcError } = await supabase
    .from("torneo_categoria")
    .select("*, categoria:categoria_id(*)")
    .eq("torneo_id", id);
  if (tcError) throw tcError;

  const torneo_categorias: TorneoCategoriaCompleto[] = [];

  for (const tc of torneoCategorias ?? []) {
    const { data: parejasData, error: parejasError } = await supabase
      .from("pareja")
      .select("*, jugador1:jugador1_id(*), jugador2:jugador2_id(*)")
      .eq("torneo_categoria_id", tc.id);
    if (parejasError) throw parejasError;
    const parejas = (parejasData ?? []) as unknown as ParejaConJugadores[];

    const { data: zonasData, error: zonasError } = await supabase
      .from("zona")
      .select("*, zona_pareja(pareja_id)")
      .eq("torneo_categoria_id", tc.id);
    if (zonasError) throw zonasError;

    const { data: partidosData, error: partidosError } = await supabase
      .from("partido")
      .select("*, sets:set_resultado(*), pareja_a:pareja_a_id(*, jugador1:jugador1_id(*), jugador2:jugador2_id(*)), pareja_b:pareja_b_id(*, jugador1:jugador1_id(*), jugador2:jugador2_id(*))")
      .eq("torneo_categoria_id", tc.id)
      .order("hora_inicio", { ascending: true });
    if (partidosError) throw partidosError;
    const partidos = (partidosData ?? []) as unknown as PartidoCompleto[];

    const zonas: ZonaConTabla[] = (zonasData ?? []).map((z) => {
      const zonaParejaIds = new Set(
        (z as { zona_pareja: { pareja_id: string }[] }).zona_pareja.map((zp) => zp.pareja_id)
      );
      return {
        id: z.id,
        torneo_categoria_id: z.torneo_categoria_id,
        nombre: z.nombre,
        parejas: parejas.filter((p) => zonaParejaIds.has(p.id)),
        partidos: partidos.filter((p) => p.zona_id === z.id),
      };
    });

    torneo_categorias.push({
      ...tc,
      categoria: tc.categoria,
      parejas,
      zonas,
      partidos_eliminatoria: partidos.filter((p) => p.fase !== "zona"),
    });
  }

  return conEstadoCalculado({ ...torneo, torneo_categorias });
}
