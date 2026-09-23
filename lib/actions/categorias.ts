"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./torneos";

const DEMO_ERROR =
  "Supabase no está configurado todavía: este cambio no se puede guardar en modo demo. Ver README para conectar tu proyecto.";

export async function crearCategoria(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Ingresá un nombre de categoría." };

  const supabase = await createClient();
  const { data: usuario } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("usuario")
    .select("organizacion_id")
    .eq("id", usuario.user?.id ?? "")
    .maybeSingle();

  if (!perfil) return { error: "Tu usuario no está vinculado a ninguna organización." };

  const { error } = await supabase
    .from("categoria")
    .insert({ nombre, organizacion_id: perfil.organizacion_id });

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function eliminarCategoria(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.from("categoria").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}
