"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { finalizarPartido, iniciarPartido, reabrirPartido, type SetInput } from "@/lib/actions/live";
import { eliminarPartido } from "@/lib/actions/armado";
import { formatHora } from "@/lib/format";
import type { PartidoCompleto } from "@/lib/types";

function nombrePareja(p: PartidoCompleto["pareja_a"]) {
  return `${p.jugador1.apellido} / ${p.jugador2.apellido}`;
}

const inputClass =
  "h-11 w-14 rounded-lg border border-white/20 bg-background text-center text-white outline-none focus:border-accent";

export function MatchRow({ partido, torneoId }: { partido: PartidoCompleto; torneoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [cargandoResultado, setCargandoResultado] = useState(false);
  const [ganador, setGanador] = useState<string | null>(partido.ganador_pareja_id);
  const [duracion, setDuracion] = useState(
    partido.duracion_minutos ? String(partido.duracion_minutos) : ""
  );
  const [sets, setSets] = useState<[SetInput, SetInput, SetInput]>(() => {
    const existentes = [1, 2, 3].map(
      (n) =>
        partido.sets.find((s) => s.numero_set === n) ?? {
          numero_set: n,
          games_pareja_a: 0,
          games_pareja_b: 0,
        }
    );
    return existentes as [SetInput, SetInput, SetInput];
  });

  const finalizado = partido.estado === "finalizado";

  function actualizarSet(index: number, lado: "games_pareja_a" | "games_pareja_b", valor: string) {
    const numero = Math.max(0, Math.min(7, Number(valor) || 0));
    setSets((prev) => {
      const copia = [...prev] as [SetInput, SetInput, SetInput];
      copia[index] = { ...copia[index], [lado]: numero };
      return copia;
    });
  }

  function guardar() {
    if (!ganador) return;
    startTransition(() => {
      finalizarPartido(partido.id, torneoId, sets, ganador, duracion ? Number(duracion) : null);
    });
    setCargandoResultado(false);
  }

  return (
    <div className="border-b border-border-subtle px-4 py-3 last:border-b-0 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{nombrePareja(partido.pareja_a)}</p>
          <p className="truncate text-sm text-white">{nombrePareja(partido.pareja_b)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {finalizado &&
            partido.sets.map((s) => (
              <span key={s.numero_set} className="font-heading text-sm text-white">
                {s.games_pareja_a}-{s.games_pareja_b}
              </span>
            ))}
          <Badge estado={partido.estado} />
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
        <span>{partido.cancha}</span>
        {!finalizado && <span>{formatHora(partido.hora_inicio)}</span>}
        {partido.duracion_minutos && <span>{partido.duracion_minutos}m</span>}
        {partido.estado === "pendiente" && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => iniciarPartido(partido.id, torneoId))}
            className="underline decoration-dotted hover:text-white disabled:opacity-50"
          >
            marcar en vivo
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {!finalizado && (
          <button
            onClick={() => setCargandoResultado((v) => !v)}
            className="min-h-11 rounded-full bg-accent px-4 font-heading text-xs tracking-wide text-white hover:bg-accent-light"
          >
            {cargandoResultado ? "Cerrar" : "Cargar resultado"}
          </button>
        )}
        {finalizado && (
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm("¿Reabrir este partido? Se borra el resultado cargado.")) {
                startTransition(() => reabrirPartido(partido.id, torneoId));
              }
            }}
            className="font-heading text-xs tracking-wide text-foreground-muted underline hover:text-white disabled:opacity-50"
          >
            Reabrir
          </button>
        )}
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("¿Borrar este partido?")) {
              startTransition(() => eliminarPartido(partido.id, torneoId));
            }
          }}
          className="font-heading text-xs tracking-wide text-foreground-muted underline hover:text-white disabled:opacity-50"
        >
          Borrar
        </button>
      </div>

      {cargandoResultado && (
        <div className="mt-3 rounded-xl border border-border-subtle bg-background/60 p-3">
          <div className="flex flex-col gap-2">
            {sets.map((set, index) => (
              <div key={set.numero_set} className="flex items-center gap-3">
                <span className="w-12 font-heading text-xs tracking-wide text-foreground-muted">
                  Set {set.numero_set}
                </span>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={set.games_pareja_a}
                  onChange={(e) => actualizarSet(index, "games_pareja_a", e.target.value)}
                  className={inputClass}
                />
                <span className="text-foreground-muted">–</span>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={set.games_pareja_b}
                  onChange={(e) => actualizarSet(index, "games_pareja_b", e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
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
                onClick={guardar}
                className="min-h-11 flex-1 rounded-full bg-accent font-heading text-xs tracking-wide text-white disabled:opacity-40"
              >
                Guardar resultado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
