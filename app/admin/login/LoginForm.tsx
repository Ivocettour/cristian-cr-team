"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/lib/actions/auth";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-heading text-xs tracking-wide text-foreground-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="min-h-11 rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-heading text-xs tracking-wide text-foreground-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded-lg border border-white/20 bg-panel px-4 text-white outline-none focus:border-accent"
        />
      </div>
      <FormError message={state.error} />
      <SubmitButton className="w-full">Ingresar</SubmitButton>
    </form>
  );
}
