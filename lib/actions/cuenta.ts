"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface CuentaState {
  error: string | null;
}

const DEMO_ERROR = "Supabase no está configurado todavía. Ver README para conectar tu proyecto.";

export async function registrarse(_prev: CuentaState, formData: FormData): Promise<CuentaState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Completá email y contraseña." };
  if (password.length < 6) return { error: "La contraseña tiene que tener al menos 6 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  redirect("/cuenta");
}

export async function iniciarSesionPublico(_prev: CuentaState, formData: FormData): Promise<CuentaState> {
  if (!isSupabaseConfigured()) return { error: DEMO_ERROR };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/cuenta");
}

export async function cerrarSesionPublico() {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function seguirTorneo(torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("seguimiento_torneo")
    .upsert({ usuario_id: user.id, torneo_id: torneoId }, { onConflict: "usuario_id,torneo_id" });

  revalidatePath(`/torneos/${torneoId}`);
  revalidatePath("/cuenta");
}

export async function dejarDeSeguirTorneo(torneoId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("seguimiento_torneo")
    .delete()
    .eq("usuario_id", user.id)
    .eq("torneo_id", torneoId);

  revalidatePath(`/torneos/${torneoId}`);
  revalidatePath("/cuenta");
}

export async function seguirJugador(jugadorId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("seguimiento_jugador")
    .upsert({ usuario_id: user.id, jugador_id: jugadorId }, { onConflict: "usuario_id,jugador_id" });

  revalidatePath(`/jugadores/${jugadorId}`);
  revalidatePath("/cuenta");
}

export async function dejarDeSeguirJugador(jugadorId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("seguimiento_jugador")
    .delete()
    .eq("usuario_id", user.id)
    .eq("jugador_id", jugadorId);

  revalidatePath(`/jugadores/${jugadorId}`);
  revalidatePath("/cuenta");
}

export async function guardarPushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("suscripcion_push").upsert(
    {
      usuario_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );
}

export async function marcarNotificacionesLeidas() {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notificacion")
    .update({ leida: true })
    .eq("usuario_id", user.id)
    .eq("leida", false);
}
