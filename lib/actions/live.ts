"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notificarSeguidoresDeJugadores } from "@/lib/notifications";

function revalidarResultados(torneoId: string) {
  revalidatePath(`/admin/torneos/${torneoId}/vivo`);
  revalidatePath(`/torneos/${torneoId}`);
}

interface ContextoPartido {
  jugadorIds: string[];
  nombreParejaA: string;
  nombreParejaB: string;
}

async function obtenerContextoPartido(
  supabase: Awaited<ReturnType<typeof createClient>>,
  partidoId: string
): Promise<ContextoPartido | null> {
  const { data } = await supabase
    .from("partido")
    .select(
      "pareja_a:pareja_a_id(jugador1:jugador1_id(id,apellido), jugador2:jugador2_id(id,apellido)), pareja_b:pareja_b_id(jugador1:jugador1_id(id,apellido), jugador2:jugador2_id(id,apellido))"
    )
    .eq("id", partidoId)
    .maybeSingle();

  if (!data) return null;

  const parejaA = data.pareja_a as unknown as {
    jugador1: { id: string; apellido: string };
    jugador2: { id: string; apellido: string };
  };
  const parejaB = data.pareja_b as unknown as {
    jugador1: { id: string; apellido: string };
    jugador2: { id: string; apellido: string };
  };

  return {
    jugadorIds: [parejaA.jugador1.id, parejaA.jugador2.id, parejaB.jugador1.id, parejaB.jugador2.id],
    nombreParejaA: `${parejaA.jugador1.apellido} / ${parejaA.jugador2.apellido}`,
    nombreParejaB: `${parejaB.jugador1.apellido} / ${parejaB.jugador2.apellido}`,
  };
}

/**
 * Marca el partido como "en curso" (solo para el badge EN VIVO del sitio
 * público) — no carga ningún resultado, eso se hace de una sola vez al
 * finalizar el partido con `finalizarPartido`.
 */
export async function iniciarPartido(partidoId: string, torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const contexto = await obtenerContextoPartido(supabase, partidoId);
  await supabase.from("partido").update({ estado: "en_curso" }).eq("id", partidoId);
  revalidarResultados(torneoId);

  if (contexto) {
    await notificarSeguidoresDeJugadores(contexto.jugadorIds, {
      titulo: "¡Arrancó tu partido!",
      cuerpo: `${contexto.nombreParejaA} vs ${contexto.nombreParejaB} ya está en juego.`,
      url: `/torneos/${torneoId}`,
    });
  }
}

export interface SetInput {
  numero_set: number;
  games_pareja_a: number;
  games_pareja_b: number;
}

/**
 * Carga el resultado final de un partido en una sola operación: los sets
 * jugados y la pareja ganadora. No hay carga incremental en vivo — el
 * planillero completa el resultado una vez terminado el partido.
 */
export async function finalizarPartido(
  partidoId: string,
  torneoId: string,
  sets: SetInput[],
  ganadorParejaId: string,
  duracionMinutos: number | null
) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const contexto = await obtenerContextoPartido(supabase, partidoId);

  const setsJugados = sets.filter((s) => s.games_pareja_a > 0 || s.games_pareja_b > 0);

  await supabase.from("set_resultado").delete().eq("partido_id", partidoId);
  if (setsJugados.length > 0) {
    await supabase.from("set_resultado").insert(
      setsJugados.map((s) => ({
        partido_id: partidoId,
        numero_set: s.numero_set,
        games_pareja_a: s.games_pareja_a,
        games_pareja_b: s.games_pareja_b,
      }))
    );
  }

  await supabase
    .from("partido")
    .update({
      estado: "finalizado",
      ganador_pareja_id: ganadorParejaId,
      duracion_minutos: duracionMinutos,
    })
    .eq("id", partidoId);

  revalidarResultados(torneoId);

  if (contexto) {
    await notificarSeguidoresDeJugadores(contexto.jugadorIds, {
      titulo: "Partido finalizado",
      cuerpo: `${contexto.nombreParejaA} vs ${contexto.nombreParejaB} ya tiene resultado.`,
      url: `/torneos/${torneoId}`,
    });
  }
}

/** Deshace un resultado cargado por error: vuelve el partido a pendiente. */
export async function reabrirPartido(partidoId: string, torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase
    .from("partido")
    .update({ estado: "pendiente", ganador_pareja_id: null, duracion_minutos: null })
    .eq("id", partidoId);
  await supabase.from("set_resultado").delete().eq("partido_id", partidoId);
  revalidarResultados(torneoId);
}
