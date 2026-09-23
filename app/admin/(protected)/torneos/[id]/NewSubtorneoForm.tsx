"use client";

import { useActionState } from "react";
import { crearTorneoCategoria } from "@/lib/actions/torneos";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Categoria } from "@/lib/types";

const initialState = { error: null };

export function NewSubtorneoForm({
  torneoId,
  categorias,
}: {
  torneoId: string;
  categorias: Categoria[];
}) {
  const [state, formAction] = useActionState(crearTorneoCategoria, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="font-heading text-xs tracking-wide text-foreground-muted">
          Agregar categoría (subtorneo)
        </label>
        <select
          name="categoria_id"
          required
          className="min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent"
        >
          <option value="">Elegí una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton>Agregar</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
