"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./torneos";

const DEMO_ERROR =
  "Supabase no está configurado todavía: este cambio no se puede guardar en modo demo. Ver README para conectar tu proyecto.";

function revalidarArmado(torneoId: string) {
  revalidatePath(`/admin/torneos/${torneoId}/armado`);
  revalidatePath(`/torneos/${torneoId}`);
}

export async function crearPareja(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const torneo_categoria_id = String(formData.get("torneo_categoria_id") ?? "");
  const torneo_id = String(formData.get("torneo_id") ?? "");
  const jugador1_id = String(formData.get("jugador1_id") ?? "");
  const jugador2_id = String(formData.get("jugador2_id") ?? "");

  if (!jugador1_id || !jugador2_id) return { error: "Elegí los dos jugadores." };
  if (jugador1_id === jugador2_id) return { error: "Los dos jugadores tienen que ser distintos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pareja")
    .insert({ torneo_categoria_id, jugador1_id, jugador2_id });

  if (error) return { error: error.message };

  revalidarArmado(torneo_id);
  return { error: null };
}

export async function crearZona(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const torneo_categoria_id = String(formData.get("torneo_categoria_id") ?? "");
  const torneo_id = String(formData.get("torneo_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!nombre) return { error: "Ingresá un nombre de zona." };

  const supabase = await createClient();
  const { error } = await supabase.from("zona").insert({ torneo_categoria_id, nombre });

  if (error) return { error: error.message };

  revalidarArmado(torneo_id);
  return { error: null };
}

export async function alternarParejaEnZona(
  zonaId: string,
  parejaId: string,
  torneoId: string,
  asignar: boolean
) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  if (asignar) {
    await supabase.from("zona_pareja").insert({ zona_id: zonaId, pareja_id: parejaId });
  } else {
    await supabase
      .from("zona_pareja")
      .delete()
      .eq("zona_id", zonaId)
      .eq("pareja_id", parejaId);
  }

  revalidarArmado(torneoId);
}

export async function crearPartidoEliminatoria(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const torneo_categoria_id = String(formData.get("torneo_categoria_id") ?? "");
  const torneo_id = String(formData.get("torneo_id") ?? "");
  const fase = String(formData.get("fase") ?? "");
  const cancha = String(formData.get("cancha") ?? "").trim();
  const pareja_a_id = String(formData.get("pareja_a_id") ?? "");
  const pareja_b_id = String(formData.get("pareja_b_id") ?? "");
  const hora_inicio = String(formData.get("hora_inicio") ?? "");

  if (!fase || !cancha || !pareja_a_id || !pareja_b_id || !hora_inicio) {
    return { error: "Completá fase, cancha, parejas y horario." };
  }
  if (pareja_a_id === pareja_b_id) return { error: "Las dos parejas tienen que ser distintas." };

  const supabase = await createClient();
  const { error } = await supabase.from("partido").insert({
    torneo_categoria_id,
    fase,
    cancha,
    pareja_a_id,
    pareja_b_id,
    hora_inicio: new Date(hora_inicio).toISOString(),
    estado: "pendiente",
  });

  if (error) return { error: error.message };

  revalidarArmado(torneo_id);
  return { error: null };
}
