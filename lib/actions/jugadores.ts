"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./torneos";

const DEMO_ERROR =
  "Supabase no está configurado todavía: este cambio no se puede guardar en modo demo. Ver README para conectar tu proyecto.";

export async function crearJugador(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const pais = String(formData.get("pais") ?? "").trim().toUpperCase() || null;
  const categoria_actual_id = String(formData.get("categoria_actual_id") ?? "") || null;

  if (!nombre || !apellido) return { error: "Completá nombre y apellido." };

  const supabase = await createClient();
  const { data: usuario } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("usuario")
    .select("organizacion_id")
    .eq("id", usuario.user?.id ?? "")
    .maybeSingle();

  if (!perfil) return { error: "Tu usuario no está vinculado a ninguna organización." };

  const { error } = await supabase.from("jugador").insert({
    nombre,
    apellido,
    pais,
    categoria_actual_id,
    organizacion_id: perfil.organizacion_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  return { error: null };
}

export async function actualizarCategoriaJugador(jugadorId: string, categoriaId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase
    .from("jugador")
    .update({ categoria_actual_id: categoriaId || null })
    .eq("id", jugadorId);
  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
}

export async function editarJugador(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const jugador_id = String(formData.get("jugador_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const pais = String(formData.get("pais") ?? "").trim().toUpperCase() || null;

  if (!nombre || !apellido) return { error: "Completá nombre y apellido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("jugador")
    .update({ nombre, apellido, pais })
    .eq("id", jugador_id);

  if (error) return { error: error.message };

  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  revalidatePath(`/jugadores/${jugador_id}`);
  return { error: null };
}

export async function eliminarJugador(jugadorId: string): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };
  const supabase = await createClient();
  const { error } = await supabase.from("jugador").delete().eq("id", jugadorId);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "No se puede borrar: este jugador ya forma parte de una pareja en algún torneo.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  return { error: null };
}
