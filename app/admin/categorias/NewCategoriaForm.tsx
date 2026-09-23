"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearCategoria } from "@/lib/actions/categorias";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState = { error: null };

export function NewCategoriaForm() {
  const [state, formAction] = useActionState(crearCategoria, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="nombre" className="font-heading text-xs tracking-wide text-foreground-muted">
          Nombre de categoría
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          placeholder="ej. 3ra, Damas A"
          className="min-h-11 w-full rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent"
        />
      </div>
      <SubmitButton>Agregar</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
