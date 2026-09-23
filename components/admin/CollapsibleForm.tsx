"use client";

import { useState, type ReactNode } from "react";

export function CollapsibleForm({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="min-h-11 w-fit rounded-full border border-white/20 px-4 font-heading text-xs tracking-wide text-foreground-muted hover:border-white hover:text-white"
      >
        + {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {children}
      <button
        onClick={() => setAbierto(false)}
        className="w-fit font-heading text-xs tracking-wide text-foreground-muted underline hover:text-white"
      >
        Cancelar
      </button>
    </div>
  );
}
