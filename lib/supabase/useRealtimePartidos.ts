"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ParejaConJugadores, Partido, PartidoCompleto, SetScore } from "@/lib/types";

/**
 * Junta todas las parejas ya resueltas (con nombres de jugadores) que
 * aparecen en la lista actual, para poder reconstruir `pareja_a`/`pareja_b`
 * cuando llega un evento de Realtime que solo trae `pareja_a_id`/`pareja_b_id`
 * en crudo (por ejemplo cuando el avance automático del cuadro completa un
 * cruce que estaba en "A definir").
 */
function construirMapaParejas(partidos: PartidoCompleto[]): Map<string, ParejaConJugadores> {
  const mapa = new Map<string, ParejaConJugadores>();
  for (const p of partidos) {
    if (p.pareja_a) mapa.set(p.pareja_a.id, p.pareja_a);
    if (p.pareja_b) mapa.set(p.pareja_b.id, p.pareja_b);
  }
  return mapa;
}

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
          if (payload.eventType === "DELETE") {
            const idBorrado = (payload.old as { id: string }).id;
            setPartidos((prev) => prev.filter((p) => p.id !== idBorrado));
            return;
          }

          const nuevo = payload.new as Partido;

          setPartidos((prev) => {
            const mapaParejas = construirMapaParejas(prev);
            const parejaA = nuevo.pareja_a_id ? mapaParejas.get(nuevo.pareja_a_id) ?? null : null;
            const parejaB = nuevo.pareja_b_id ? mapaParejas.get(nuevo.pareja_b_id) ?? null : null;

            const yaExiste = prev.some((p) => p.id === nuevo.id);
            if (!yaExiste) {
              // Partido nuevo (ej. se arma el siguiente cruce del cuadro
              // mientras alguien tiene la página abierta).
              return [...prev, { ...nuevo, pareja_a: parejaA, pareja_b: parejaB, sets: [] }];
            }

            return prev.map((p) =>
              p.id === nuevo.id ? { ...p, ...nuevo, pareja_a: parejaA, pareja_b: parejaB } : p
            );
          });
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
