"use client";

import { useMemo, useState } from "react";
import { CourtSection } from "@/components/public/CourtSection";
import { useRealtimePartidos } from "@/lib/supabase/useRealtimePartidos";
import { formatFechaLarga } from "@/lib/format";
import type { PartidoCompleto } from "@/lib/types";

/**
 * Se debe montar con key={torneoCategoriaId} desde el padre, para que el
 * estado (partidos + día seleccionado) se reinicie al cambiar de categoría
 * en vez de resincronizarlo manualmente con un efecto.
 */
export function LiveResultsTab({
  torneoCategoriaId,
  partidosIniciales,
}: {
  torneoCategoriaId: string;
  partidosIniciales: PartidoCompleto[];
}) {
  const partidos = useRealtimePartidos(torneoCategoriaId, partidosIniciales);
  const [dia, setDia] = useState<string>("todos");

  const dias = useMemo(() => {
    const set = new Set(partidos.map((p) => p.hora_inicio.slice(0, 10)));
    return Array.from(set).sort();
  }, [partidos]);

  const partidosDelDia =
    dia === "todos" ? partidos : partidos.filter((p) => p.hora_inicio.slice(0, 10) === dia);

  return (
    <>
      {dias.length > 1 && (
        <div className="scroll-snap-x mb-4 flex gap-2 overflow-x-auto px-4 sm:px-6">
          <button
            onClick={() => setDia("todos")}
            className={`scroll-snap-item min-h-11 shrink-0 rounded-full border px-4 font-heading text-xs tracking-wide ${
              dia === "todos"
                ? "border-accent bg-accent text-white"
                : "border-white/20 text-foreground-muted"
            }`}
          >
            Todos
          </button>
          {dias.map((d) => (
            <button
              key={d}
              onClick={() => setDia(d)}
              className={`scroll-snap-item min-h-11 shrink-0 rounded-full border px-4 font-heading text-xs tracking-wide ${
                dia === d
                  ? "border-accent bg-accent text-white"
                  : "border-white/20 text-foreground-muted"
              }`}
            >
              {formatFechaLarga(d)}
            </button>
          ))}
        </div>
      )}
      <CourtSection partidos={partidosDelDia} />
    </>
  );
}
