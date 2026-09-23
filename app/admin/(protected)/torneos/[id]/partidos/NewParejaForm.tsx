"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearPareja } from "@/lib/actions/armado";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Jugador } from "@/lib/types";

const initialState = { error: null };
const selectClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent";

export function NewParejaForm({
  torneoId,
  torneoCategoriaId,
  jugadores,
}: {
  torneoId: string;
  torneoCategoriaId: string;
  jugadores: Jugador[];
}) {
  const [state, formAction] = useActionState(crearPareja, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <input type="hidden" name="torneo_categoria_id" value={torneoCategoriaId} />
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="font-heading text-xs tracking-wide text-foreground-muted">Jugador 1</label>
        <select name="jugador1_id" required className={selectClass}>
          <option value="">Elegí un jugador</option>
          {jugadores.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nombre} {j.apellido}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="font-heading text-xs tracking-wide text-foreground-muted">Jugador 2</label>
        <select name="jugador2_id" required className={selectClass}>
          <option value="">Elegí un jugador</option>
          {jugadores.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nombre} {j.apellido}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton>Crear pareja</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
