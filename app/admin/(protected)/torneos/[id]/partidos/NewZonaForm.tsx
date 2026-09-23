"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearZona } from "@/lib/actions/armado";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState = { error: null };

export function NewZonaForm({
  torneoId,
  torneoCategoriaId,
}: {
  torneoId: string;
  torneoCategoriaId: string;
}) {
  const [state, formAction] = useActionState(crearZona, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="torneo_id" value={torneoId} />
      <input type="hidden" name="torneo_categoria_id" value={torneoCategoriaId} />
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="font-heading text-xs tracking-wide text-foreground-muted">Nombre de zona</label>
        <input
          name="nombre"
          required
          placeholder="ej. Zona A"
          className="min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent"
        />
      </div>
      <SubmitButton>Crear zona</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
