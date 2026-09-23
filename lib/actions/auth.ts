"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error: string | null;
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase no está configurado todavía. Completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local (ver README) para poder loguearte.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function logout() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
