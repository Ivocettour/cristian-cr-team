"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearPartidoZona } from "@/lib/actions/armado";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ParejaConJugadores } from "@/lib/types";

const initialState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-background px-4 text-sm text-white outline-none focus:border-accent";
const labelClass = "font-heading text-xs tracking-wide text-foreground-muted";

export function NewPartidoZonaForm({
  torneoId,
  torneoCategoriaId,
  zonaId,
  parejas,
}: {
  torneoId: string;
  torneoCategoriaId: string;
  zonaId: string;
  parejas: ParejaConJugadores[];
}) {
  const [state, formAction] = useActionState(crearPartidoZona, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  if (parejas.length < 2) {
    return (
      <p className="text-xs text-foreground-muted">
        Asigná al menos dos parejas a esta zona para poder crear partidos.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <input type="hidden" name="torneo_categoria_id" value={torneoCategoriaId} />
      <input type="hidden" name="zona_id" value={zonaId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <label className={labelClass}>Cancha</label>
          <input name="cancha" required placeholder="Cancha 1" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Fecha y hora</label>
          <input name="hora_inicio" type="datetime-local" required className={inputClass} />
        </div>
      </div>
      <FormError message={state.error} />
      <SubmitButton className="w-fit">Crear partido de zona</SubmitButton>
    </form>
  );
}
