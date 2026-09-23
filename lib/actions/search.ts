"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mockJugadores, mockTorneos } from "@/lib/mock-data";

export interface ResultadoBusqueda {
  torneos: { id: string; nombre: string }[];
  jugadores: { id: string; nombre: string; apellido: string }[];
}

export async function buscarGlobal(query: string): Promise<ResultadoBusqueda> {
  const texto = query.trim();
  if (texto.length < 2) return { torneos: [], jugadores: [] };

  if (!isSupabaseConfigured()) {
    const q = texto.toLowerCase();
    return {
      torneos: mockTorneos
        .filter((t) => t.nombre.toLowerCase().includes(q))
        .slice(0, 5)
        .map((t) => ({ id: t.id, nombre: t.nombre })),
      jugadores: mockJugadores
        .filter((j) => `${j.nombre} ${j.apellido}`.toLowerCase().includes(q))
        .slice(0, 5)
        .map((j) => ({ id: j.id, nombre: j.nombre, apellido: j.apellido })),
    };
  }

  const supabase = await createClient();

  const [{ data: torneos }, { data: jugadores }] = await Promise.all([
    supabase.from("torneo").select("id, nombre").ilike("nombre", `%${texto}%`).limit(5),
    supabase
      .from("jugador")
      .select("id, nombre, apellido")
      .or(`nombre.ilike.%${texto}%,apellido.ilike.%${texto}%`)
      .limit(5),
  ]);

  return {
    torneos: torneos ?? [],
    jugadores: jugadores ?? [],
  };
}
