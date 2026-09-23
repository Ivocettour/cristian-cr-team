"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function revalidarVivo(torneoId: string) {
  revalidatePath(`/admin/torneos/${torneoId}/vivo`);
  revalidatePath(`/torneos/${torneoId}`);
}

export async function iniciarPartido(partidoId: string, torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from("partido").update({ estado: "en_curso" }).eq("id", partidoId);
  revalidarVivo(torneoId);
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
  await supabase
    .from("partido")
    .update({
      estado: "finalizado",
      ganador_pareja_id: ganadorParejaId,
      duracion_minutos: duracionMinutos,
    })
    .eq("id", partidoId);
  revalidarVivo(torneoId);
}
