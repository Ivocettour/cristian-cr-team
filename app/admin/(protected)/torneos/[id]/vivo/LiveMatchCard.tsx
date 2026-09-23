"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { ajustarSet, finalizarPartido, iniciarPartido } from "@/lib/actions/live";
import type { PartidoCompleto } from "@/lib/types";

function nombrePareja(p: PartidoCompleto["pareja_a"]) {
  return `${p.jugador1.apellido} / ${p.jugador2.apellido}`;
}

export function LiveMatchCard({
  partido,
  torneoId,
}: {
  partido: PartidoCompleto;
  torneoId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [ganador, setGanador] = useState<string | null>(partido.ganador_pareja_id);
  const [duracion, setDuracion] = useState("");

  const sets = [1, 2, 3].map(
    (n) =>
      partido.sets.find((s) => s.numero_set === n) ?? {
        numero_set: n,
        games_pareja_a: 0,
        games_pareja_b: 0,
      }
  );

  const finalizado = partido.estado === "finalizado";

  return (
    <div className="rounded-2xl border border-border-subtle bg-panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-xs tracking-wide text-foreground-muted">{partido.cancha}</p>
          <Badge estado={partido.estado} className="mt-1" />
        </div>
        {partido.estado === "pendiente" && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => iniciarPartido(partido.id, torneoId))}
            className="min-h-11 rounded-full bg-accent px-4 font-heading text-xs tracking-wide text-white disabled:opacity-50"
          >
            Iniciar partido
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {[partido.pareja_a, partido.pareja_b].map((pareja, ladoIdx) => {
          const lado = ladoIdx === 0 ? "a" : "b";
          return (
            <div key={pareja.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-sm text-white">
                {nombrePareja(pareja)}
              </span>
              <div className="flex shrink-0 gap-2">
                {sets.map((set) => {
                  const valor = lado === "a" ? set.games_pareja_a : set.games_pareja_b;
                  return (
                    <div key={set.numero_set} className="flex flex-col items-center gap-1">
                      <button
                        disabled={isPending || finalizado}
                        onClick={() =>
                          startTransition(() =>
                            ajustarSet(partido.id, torneoId, set.numero_set, lado, 1)
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white disabled:opacity-30"
                      >
                        +
                      </button>
                      <span className="font-heading text-lg text-white">{valor}</span>
                      <button
                        disabled={isPending || finalizado}
                        onClick={() =>
                          startTransition(() =>
                            ajustarSet(partido.id, torneoId, set.numero_set, lado, -1)
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white disabled:opacity-30"
                      >
                        −
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!finalizado && partido.estado === "en_curso" && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-3">
          <div className="flex gap-2">
            <button
              onClick={() => setGanador(partido.pareja_a_id)}
              className={`min-h-11 flex-1 rounded-full border px-3 font-heading text-xs tracking-wide ${
                ganador === partido.pareja_a_id
                  ? "border-win bg-win/20 text-white"
                  : "border-white/20 text-foreground-muted"
              }`}
            >
              Ganó {nombrePareja(partido.pareja_a)}
            </button>
            <button
              onClick={() => setGanador(partido.pareja_b_id)}
              className={`min-h-11 flex-1 rounded-full border px-3 font-heading text-xs tracking-wide ${
                ganador === partido.pareja_b_id
                  ? "border-win bg-win/20 text-white"
                  : "border-white/20 text-foreground-muted"
              }`}
            >
              Ganó {nombrePareja(partido.pareja_b)}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Duración (min)"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="min-h-11 w-36 rounded-lg border border-white/20 bg-background px-3 text-sm text-white outline-none focus:border-accent"
            />
            <button
              disabled={!ganador || isPending}
              onClick={() =>
                startTransition(() =>
                  finalizarPartido(
                    partido.id,
                    torneoId,
                    ganador!,
                    duracion ? Number(duracion) : null
                  )
                )
              }
              className="min-h-11 flex-1 rounded-full bg-accent font-heading text-xs tracking-wide text-white disabled:opacity-40"
            >
              Finalizar partido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
