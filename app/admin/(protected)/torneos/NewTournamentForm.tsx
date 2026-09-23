"use client";

import { useActionState } from "react";
import { crearTorneo } from "@/lib/actions/torneos";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent";
const labelClass = "font-heading text-xs tracking-wide text-foreground-muted";

export function NewTournamentForm() {
  const [state, formAction] = useActionState(crearTorneo, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className={labelClass}>Nombre del torneo</label>
          <input id="nombre" name="nombre" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sede" className={labelClass}>Sede</label>
          <input id="sede" name="sede" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha_inicio" className={labelClass}>Fecha de inicio</label>
          <input id="fecha_inicio" name="fecha_inicio" type="date" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha_fin" className={labelClass}>Fecha de fin</label>
          <input id="fecha_fin" name="fecha_fin" type="date" required className={inputClass} />
        </div>
      </div>
      <FormError message={state.error} />
      <SubmitButton>Crear torneo</SubmitButton>
    </form>
  );
}
