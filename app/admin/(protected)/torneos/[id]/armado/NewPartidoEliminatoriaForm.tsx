"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearPartidoEliminatoria } from "@/lib/actions/armado";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ParejaConJugadores } from "@/lib/types";

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

export function NewPartidoEliminatoriaForm({
  torneoId,
  torneoCategoriaId,
  parejas,
}: {
  torneoId: string;
  torneoCategoriaId: string;
  parejas: ParejaConJugadores[];
}) {
  const [state, formAction] = useActionState(crearPartidoEliminatoria, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <input type="hidden" name="torneo_categoria_id" value={torneoCategoriaId} />
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
