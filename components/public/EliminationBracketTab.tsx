"use client";

import { EliminationBracket } from "@/components/public/EliminationBracket";
import { useRealtimePartidos } from "@/lib/supabase/useRealtimePartidos";
import type { PartidoCompleto } from "@/lib/types";

/**
 * Se debe montar con key={torneoCategoriaId} desde el padre (mismo patrón
 * que LiveResultsTab), para que el estado se reinicie al cambiar de
 * categoría en vez de resincronizarlo manualmente con un efecto.
 */
export function EliminationBracketTab({
  torneoCategoriaId,
  partidosIniciales,
}: {
  torneoCategoriaId: string;
  partidosIniciales: PartidoCompleto[];
}) {
  const partidos = useRealtimePartidos(torneoCategoriaId, partidosIniciales);
  return <EliminationBracket partidos={partidos} />;
}
