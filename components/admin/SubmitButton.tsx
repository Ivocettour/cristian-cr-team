"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-11 rounded-full bg-accent px-5 font-heading text-sm tracking-wide text-white transition-colors hover:bg-accent-light disabled:opacity-50 ${className}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}
