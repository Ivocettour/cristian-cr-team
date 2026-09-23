import { Badge } from "@/components/ui/Badge";
import { paisToFlag, nombreCompleto, formatDuracion, formatHora } from "@/lib/format";
import type { ParejaConJugadores, PartidoCompleto } from "@/lib/types";

function FilaPareja({
  pareja,
  sets,
  esGanador,
}: {
  pareja: ParejaConJugadores | null;
  sets: { valor: number; ganado: boolean }[];
  esGanador: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {esGanador && pareja && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-win text-[10px] font-bold text-black">
            W
          </span>
        )}
        <div className="min-w-0">
          {pareja ? (
            <>
              <p className="truncate text-sm text-white">
                {paisToFlag(pareja.jugador1.pais)} {nombreCompleto(pareja.jugador1)}
              </p>
              <p className="truncate text-sm text-white">
                {paisToFlag(pareja.jugador2.pais)} {nombreCompleto(pareja.jugador2)}
              </p>
            </>
          ) : (
            <p className="truncate text-sm italic text-foreground-muted">A definir</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {sets.map((s, i) => (
          <span
            key={i}
            className={`w-4 text-center font-heading text-sm ${
              s.ganado ? "text-white" : "text-foreground-muted"
            }`}
          >
            {s.valor}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MatchCard({ partido }: { partido: PartidoCompleto }) {
  const setsOrdenados = [...partido.sets].sort((a, b) => a.numero_set - b.numero_set);
  const setsA = setsOrdenados.map((s) => ({
    valor: s.games_pareja_a,
    ganado: s.games_pareja_a > s.games_pareja_b,
  }));
  const setsB = setsOrdenados.map((s) => ({
    valor: s.games_pareja_b,
    ganado: s.games_pareja_b > s.games_pareja_a,
  }));

  return (
    <div className="border-b border-border-subtle px-4 last:border-b-0 sm:px-6">
      <div className="divide-y divide-border-subtle/60">
        <FilaPareja
          pareja={partido.pareja_a}
          sets={setsA}
          esGanador={partido.ganador_pareja_id === partido.pareja_a_id}
        />
        <FilaPareja
          pareja={partido.pareja_b}
          sets={setsB}
          esGanador={partido.ganador_pareja_id === partido.pareja_b_id}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-3 text-xs text-foreground-muted">
        <Badge estado={partido.estado} />
        <span>{partido.cancha}</span>
        {partido.estado === "pendiente" && <span>{formatHora(partido.hora_inicio)}</span>}
        {partido.duracion_minutos && <span>{formatDuracion(partido.duracion_minutos)}</span>}
      </div>
    </div>
  );
}
