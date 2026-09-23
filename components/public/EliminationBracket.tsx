import { formatHora } from "@/lib/format";
import type { ParejaConJugadores, PartidoCompleto } from "@/lib/types";

const FASE_ORDEN = ["octavos", "cuartos", "semi", "final"] as const;

const FASE_LABEL: Record<string, string> = {
  octavos: "Octavos",
  cuartos: "Cuartos de final",
  semi: "Semifinal",
  final: "Final",
};

const COL_WIDTH = 232;
const COL_GAP = 48;
const ROW_UNIT = 100;
const BOX_HEIGHT = 72;
const HEADER_HEIGHT = 36;
const PADDING = 16;

interface Columna {
  fase: string;
  partidos: PartidoCompleto[];
}

function calcularLayout(partidos: PartidoCompleto[]) {
  const columnas: Columna[] = FASE_ORDEN.map((fase) => ({
    fase,
    partidos: partidos.filter((p) => p.fase === fase),
  })).filter((c) => c.partidos.length > 0);

  const fila = new Map<string, number>();
  let siguienteHoja = 0;

  for (const columna of columnas) {
    for (const p of columna.partidos) {
      const filaA = p.feeder_a_partido_id ? fila.get(p.feeder_a_partido_id) : undefined;
      const filaB = p.feeder_b_partido_id ? fila.get(p.feeder_b_partido_id) : undefined;

      if (filaA !== undefined && filaB !== undefined) {
        fila.set(p.id, (filaA + filaB) / 2);
      } else if (filaA !== undefined) {
        fila.set(p.id, filaA);
      } else if (filaB !== undefined) {
        fila.set(p.id, filaB);
      } else {
        fila.set(p.id, siguienteHoja);
        siguienteHoja += 1;
      }
    }
  }

  return { columnas, fila };
}

function nombrePareja(p: ParejaConJugadores | null): string {
  return p ? `${p.jugador1.apellido} / ${p.jugador2.apellido}` : "A definir";
}

function setsGanados(partido: PartidoCompleto, lado: "a" | "b"): string {
  if (partido.sets.length === 0) return "";
  const ganados = partido.sets.filter((s) =>
    lado === "a" ? s.games_pareja_a > s.games_pareja_b : s.games_pareja_b > s.games_pareja_a
  ).length;
  return String(ganados);
}

export function EliminationBracket({ partidos }: { partidos: PartidoCompleto[] }) {
  const { columnas, fila } = calcularLayout(partidos);

  if (columnas.length === 0) {
    return (
      <p className="px-4 text-foreground-muted sm:px-6">
        Todavía no hay cuadro eliminatorio cargado.
      </p>
    );
  }

  const colIndexPorFase = new Map(columnas.map((c, i) => [c.fase, i]));
  const maxFila = Math.max(0, ...Array.from(fila.values()));
  const totalWidth = columnas.length * COL_WIDTH + (columnas.length - 1) * COL_GAP + PADDING * 2;
  const totalHeight = maxFila * ROW_UNIT + BOX_HEIGHT + HEADER_HEIGHT + PADDING * 2;

  function x(faseIndex: number) {
    return PADDING + faseIndex * (COL_WIDTH + COL_GAP);
  }
  function centerY(partidoId: string) {
    return PADDING + HEADER_HEIGHT + (fila.get(partidoId) ?? 0) * ROW_UNIT + BOX_HEIGHT / 2;
  }

  // Conectores: un tramo en "codo" por cada feeder → partido dependiente.
  const conectores: { d: string; key: string }[] = [];
  for (const columna of columnas) {
    for (const p of columna.partidos) {
      const colChild = colIndexPorFase.get(p.fase)!;
      const childX = x(colChild);
      const childY = centerY(p.id);

      for (const feederId of [p.feeder_a_partido_id, p.feeder_b_partido_id]) {
        if (!feederId) continue;
        const feederPartido = partidos.find((f) => f.id === feederId);
        if (!feederPartido) continue;
        const colFeeder = colIndexPorFase.get(feederPartido.fase);
        if (colFeeder === undefined) continue;

        const feederX = x(colFeeder) + COL_WIDTH;
        const feederY = centerY(feederId);
        const midX = (feederX + childX) / 2;

        conectores.push({
          key: `${feederId}-${p.id}`,
          d: `M ${feederX} ${feederY} H ${midX} V ${childY} H ${childX}`,
        });
      }
    }
  }

  return (
    <div className="scroll-snap-x overflow-x-auto px-4 pb-4 sm:px-6">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        {columnas.map((columna, i) => (
          <div
            key={columna.fase}
            className="absolute font-heading text-xs tracking-wide text-accent-light"
            style={{ left: x(i), top: PADDING, width: COL_WIDTH }}
          >
            {FASE_LABEL[columna.fase] ?? columna.fase}
          </div>
        ))}

        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={totalWidth}
          height={totalHeight}
          aria-hidden
        >
          {conectores.map((c) => (
            <path key={c.key} d={c.d} fill="none" stroke="#2A2A2E" strokeWidth={2} />
          ))}
        </svg>

        {columnas.map((columna, i) =>
          columna.partidos.map((p) => {
            const esGanadorA = p.ganador_pareja_id !== null && p.ganador_pareja_id === p.pareja_a_id;
            const esGanadorB = p.ganador_pareja_id !== null && p.ganador_pareja_id === p.pareja_b_id;
            return (
              <div
                key={p.id}
                className="absolute overflow-hidden rounded-lg border border-border-subtle bg-panel"
                style={{
                  left: x(i),
                  top: PADDING + HEADER_HEIGHT + (fila.get(p.id) ?? 0) * ROW_UNIT,
                  width: COL_WIDTH,
                  height: BOX_HEIGHT,
                }}
              >
                <div
                  className={`flex h-1/2 items-center justify-between gap-2 border-b border-border-subtle/60 px-3 ${
                    esGanadorA ? "bg-white/5" : ""
                  }`}
                >
                  <span
                    className={`truncate text-xs ${esGanadorA ? "text-white" : "text-foreground-muted"}`}
                  >
                    {nombrePareja(p.pareja_a)}
                  </span>
                  <span
                    className={`shrink-0 font-heading text-xs ${esGanadorA ? "text-win" : "text-foreground-muted"}`}
                  >
                    {setsGanados(p, "a")}
                  </span>
                </div>
                <div
                  className={`flex h-1/2 items-center justify-between gap-2 px-3 ${
                    esGanadorB ? "bg-white/5" : ""
                  }`}
                >
                  <span
                    className={`truncate text-xs ${esGanadorB ? "text-white" : "text-foreground-muted"}`}
                  >
                    {nombrePareja(p.pareja_b)}
                  </span>
                  <span
                    className={`shrink-0 font-heading text-xs ${esGanadorB ? "text-win" : "text-foreground-muted"}`}
                  >
                    {setsGanados(p, "b")}
                  </span>
                </div>
                {p.estado !== "finalizado" && (
                  <div
                    className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${
                      p.estado === "en_curso" ? "bg-win" : "bg-accent"
                    }`}
                    title={p.estado === "en_curso" ? "En vivo" : `Pendiente · ${formatHora(p.hora_inicio)}`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
