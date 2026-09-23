"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { crearPartidoEliminatoria } from "@/lib/actions/armado";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ParejaConJugadores, PartidoCompleto } from "@/lib/types";

const initialState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent";
const labelClass = "font-heading text-xs tracking-wide text-foreground-muted";

const FASES = [
  { value: "octavos", label: "Octavos de final" },
  { value: "cuartos", label: "Cuartos de final" },
  { value: "semi", label: "Semifinal" },
  { value: "final", label: "Final" },
];

const FASE_LABEL: Record<string, string> = {
  octavos: "Octavos",
  cuartos: "Cuartos",
  semi: "Semifinal",
  final: "Final",
};

function etiquetaPartido(p: PartidoCompleto): string {
  const parejas = p.pareja_a && p.pareja_b
    ? `${p.pareja_a.jugador1.apellido}/${p.pareja_a.jugador2.apellido} vs ${p.pareja_b.jugador1.apellido}/${p.pareja_b.jugador2.apellido}`
    : "A definir";
  return `${FASE_LABEL[p.fase] ?? p.fase} (${p.cancha}) — ${parejas}`;
}

export function NewPartidoEliminatoriaForm({
  torneoId,
  torneoCategoriaId,
  parejas,
  partidosDisponibles,
}: {
  torneoId: string;
  torneoCategoriaId: string;
  parejas: ParejaConJugadores[];
  partidosDisponibles: PartidoCompleto[];
}) {
  const [state, formAction] = useActionState(crearPartidoEliminatoria, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [modo, setModo] = useState<"parejas" | "feeders">("parejas");

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <input type="hidden" name="torneo_categoria_id" value={torneoCategoriaId} />
      <input type="hidden" name="modo" value={modo} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setModo("parejas")}
          className={`min-h-11 rounded-full border px-4 font-heading text-xs tracking-wide ${
            modo === "parejas" ? "border-accent bg-accent text-white" : "border-white/20 text-foreground-muted"
          }`}
        >
          Parejas conocidas
        </button>
        <button
          type="button"
          onClick={() => setModo("feeders")}
          disabled={partidosDisponibles.length < 2}
          className={`min-h-11 rounded-full border px-4 font-heading text-xs tracking-wide disabled:opacity-40 ${
            modo === "feeders" ? "border-accent bg-accent text-white" : "border-white/20 text-foreground-muted"
          }`}
        >
          Ganadoras de partidos anteriores
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Fase</label>
          <select name="fase" required className={inputClass}>
            {FASES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Cancha</label>
          <input name="cancha" required placeholder="Cancha 1" className={inputClass} />
        </div>

        {modo === "parejas" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Pareja A</label>
              <select name="pareja_a_id" required className={inputClass}>
                <option value="">Elegí</option>
                {parejas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.jugador1.apellido} / {p.jugador2.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Pareja B</label>
              <select name="pareja_b_id" required className={inputClass}>
                <option value="">Elegí</option>
                {parejas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.jugador1.apellido} / {p.jugador2.apellido}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Sale del ganador de</label>
              <select name="feeder_a_partido_id" required className={inputClass}>
                <option value="">Elegí</option>
                {partidosDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {etiquetaPartido(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Y del ganador de</label>
              <select name="feeder_b_partido_id" required className={inputClass}>
                <option value="">Elegí</option>
                {partidosDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {etiquetaPartido(p)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Fecha y hora</label>
          <input name="hora_inicio" type="datetime-local" required className={inputClass} />
        </div>
      </div>
      <FormError message={state.error} />
      <SubmitButton>Crear partido</SubmitButton>
    </form>
  );
}
