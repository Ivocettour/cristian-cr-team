"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error: string | null;
}

const DEMO_ERROR =
  "Supabase no está configurado todavía: este cambio no se puede guardar en modo demo. Ver README para conectar tu proyecto.";

export async function crearTorneo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const sede = String(formData.get("sede") ?? "").trim();
  const fecha_inicio = String(formData.get("fecha_inicio") ?? "");
  const fecha_fin = String(formData.get("fecha_fin") ?? "");

  if (!nombre || !sede || !fecha_inicio || !fecha_fin) {
    return { error: "Completá nombre, sede y fechas." };
  }

  const supabase = await createClient();
  const { data: usuario } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("usuario")
    .select("organizacion_id")
    .eq("id", usuario.user?.id ?? "")
    .maybeSingle();

  if (!perfil) return { error: "Tu usuario no está vinculado a ninguna organización." };

  const { error } = await supabase.from("torneo").insert({
    organizacion_id: perfil.organizacion_id,
    nombre,
    sede,
    fecha_inicio,
    fecha_fin,
    estado: "proximo",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/torneos");
  revalidatePath("/torneos");
  redirect("/admin/torneos");
}

export async function cambiarEstadoTorneo(torneoId: string, estado: "proximo" | "en_curso" | "finalizado") {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from("torneo").update({ estado }).eq("id", torneoId);
  revalidatePath("/admin/torneos");
  revalidatePath(`/admin/torneos/${torneoId}`);
  revalidatePath("/torneos");
  revalidatePath(`/torneos/${torneoId}`);
}

export async function crearTorneoCategoria(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const torneo_id = String(formData.get("torneo_id") ?? "");
  const categoria_id = String(formData.get("categoria_id") ?? "");
  if (!torneo_id || !categoria_id) return { error: "Elegí una categoría." };

  const supabase = await createClient();
  const { error } = await supabase.from("torneo_categoria").insert({
    torneo_id,
    categoria_id,
    formato: "zonas_y_eliminacion",
    estado: "proximo",
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/torneos/${torneo_id}`);
  redirect(`/admin/torneos/${torneo_id}`);
}
