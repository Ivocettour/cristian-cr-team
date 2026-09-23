"use client";

import { useState } from "react";
import { eliminarPareja } from "@/lib/actions/armado";

export function BorrarParejaButton({
  parejaId,
  torneoId,
  label,
}: {
  parejaId: string;
  torneoId: string;
  label: string;
}) {
  const [borrando, setBorrando] = useState(false);

  async function handleBorrar() {
    if (!confirm(`¿Borrar la pareja ${label}?`)) return;
    setBorrando(true);
    const res = await eliminarPareja(parejaId, torneoId);
    setBorrando(false);
    if (res.error) alert(res.error);
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-panel py-2 pl-3 pr-2 text-sm text-white">
      {label}
      <button
        onClick={handleBorrar}
        disabled={borrando}
        aria-label={`Borrar pareja ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground-muted hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        ×
      </button>
    </span>
  );
}
