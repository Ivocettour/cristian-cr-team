"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notificarSeguidoresDeJugadores } from "@/lib/notifications";

function revalidarVivo(torneoId: string) {
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

export async function iniciarPartido(partidoId: string, torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const contexto = await obtenerContextoPartido(supabase, partidoId);
  await supabase.from("partido").update({ estado: "en_curso" }).eq("id", partidoId);
  revalidarVivo(torneoId);

  if (contexto) {
    await notificarSeguidoresDeJugadores(contexto.jugadorIds, {
      titulo: "¡Arrancó tu partido!",
      cuerpo: `${contexto.nombreParejaA} vs ${contexto.nombreParejaB} ya está en juego.`,
      url: `/torneos/${torneoId}`,
    });
  }
}

export async function ajustarSet(
  partidoId: string,
  torneoId: string,
  numeroSet: number,
  lado: "a" | "b",
  delta: number
) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("set_resultado")
    .select("*")
    .eq("partido_id", partidoId)
    .eq("numero_set", numeroSet)
    .maybeSingle();

  const campo = lado === "a" ? "games_pareja_a" : "games_pareja_b";

  if (!existente) {
    await supabase.from("set_resultado").insert({
      partido_id: partidoId,
      numero_set: numeroSet,
      games_pareja_a: lado === "a" ? Math.max(0, delta) : 0,
      games_pareja_b: lado === "b" ? Math.max(0, delta) : 0,
    });
  } else {
    const valorActual = existente[campo] as number;
    const nuevoValor = Math.max(0, Math.min(7, valorActual + delta));
    await supabase
      .from("set_resultado")
      .update({ [campo]: nuevoValor })
      .eq("id", existente.id);
  }

  revalidarVivo(torneoId);
}

export async function finalizarPartido(
  partidoId: string,
  torneoId: string,
  ganadorParejaId: string,
  duracionMinutos: number | null
) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const contexto = await obtenerContextoPartido(supabase, partidoId);
  await supabase
    .from("partido")
    .update({
      estado: "finalizado",
      ganador_pareja_id: ganadorParejaId,
      duracion_minutos: duracionMinutos,
    })
    .eq("id", partidoId);
  revalidarVivo(torneoId);

  if (contexto) {
    await notificarSeguidoresDeJugadores(contexto.jugadorIds, {
      titulo: "Partido finalizado",
      cuerpo: `${contexto.nombreParejaA} vs ${contexto.nombreParejaB} ya tiene resultado.`,
      url: `/torneos/${torneoId}`,
    });
  }
}
