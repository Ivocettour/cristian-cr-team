"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearJugador } from "@/lib/actions/jugadores";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Categoria } from "@/lib/types";

const initialState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent";
const labelClass = "font-heading text-xs tracking-wide text-foreground-muted";

export function NewJugadorForm({ categorias }: { categorias: Categoria[] }) {
  const [state, formAction] = useActionState(crearJugador, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className={labelClass}>Nombre</label>
          <input id="nombre" name="nombre" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellido" className={labelClass}>Apellido</label>
          <input id="apellido" name="apellido" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pais" className={labelClass}>País (código, ej. AR)</label>
          <input id="pais" name="pais" maxLength={2} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria_actual_id" className={labelClass}>Categoría</label>
          <select id="categoria_actual_id" name="categoria_actual_id" className={inputClass}>
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormError message={state.error} />
      <SubmitButton>Agregar jugador</SubmitButton>
    </form>
  );
}
