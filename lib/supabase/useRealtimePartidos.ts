"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { PartidoCompleto, SetScore } from "@/lib/types";

/**
 * Mantiene la lista de partidos sincronizada vía Supabase Realtime
 * (tablas `partido` y `set_resultado`) sin polling.
 * Si Supabase no está configurado, simplemente devuelve los datos iniciales.
 */
export function useRealtimePartidos(
  torneoCategoriaId: string,
  inicial: PartidoCompleto[]
): PartidoCompleto[] {
  // `inicial` solo se usa como semilla: el componente que llama a este hook
  // debe montarse con key={torneoCategoriaId} para resetear el estado al
  // cambiar de categoría, en vez de resincronizar con un efecto.
  const [partidos, setPartidos] = useState(inicial);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`torneo_categoria_${torneoCategoriaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "partido",
          filter: `torneo_categoria_id=eq.${torneoCategoriaId}`,
        },
        (payload) => {
          const nuevo = payload.new as Partial<PartidoCompleto> & { id: string };
          setPartidos((prev) =>
            prev.map((p) => (p.id === nuevo.id ? { ...p, ...nuevo } : p))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "set_resultado" },
        (payload) => {
          const nuevo = payload.new as SetScore;
          setPartidos((prev) =>
            prev.map((p) => {
              if (p.id !== nuevo.partido_id) return p;
              const otros = p.sets.filter((s) => s.numero_set !== nuevo.numero_set);
              return {
                ...p,
                sets: [...otros, nuevo].sort((a, b) => a.numero_set - b.numero_set),
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [torneoCategoriaId]);

  return partidos;
}
