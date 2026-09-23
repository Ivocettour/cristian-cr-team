"use client";

import { useTransition } from "react";
import { eliminarPartido } from "@/lib/actions/armado";

export function BorrarPartidoButton({ partidoId, torneoId }: { partidoId: string; torneoId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("¿Borrar este partido?")) {
          startTransition(() => eliminarPartido(partidoId, torneoId));
        }
      }}
      className="min-h-11 rounded-full border border-white/20 px-3 font-heading text-xs tracking-wide text-foreground-muted hover:border-white hover:text-white disabled:opacity-50"
    >
      Borrar
    </button>
  );
}
