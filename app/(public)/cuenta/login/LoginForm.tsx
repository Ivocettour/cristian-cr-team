"use client";

import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesionPublico, type CuentaState } from "@/lib/actions/cuenta";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState: CuentaState = { error: null };
const inputClass =
  "min-h-11 rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent";
const labelClass = "font-heading text-xs tracking-wide text-foreground-muted";

export function LoginForm() {
  const [state, formAction] = useActionState(iniciarSesionPublico, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <FormError message={state.error} />
      <SubmitButton className="w-full">Ingresar</SubmitButton>
      <p className="text-center text-sm text-foreground-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="text-white underline">
          Registrate
        </Link>
      </p>
    </form>
  );
}
