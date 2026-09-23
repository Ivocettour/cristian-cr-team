"use client";

import { useTransition } from "react";
import { eliminarTorneo } from "@/lib/actions/torneos";

export function BorrarTorneoButton({ torneoId, nombre }: { torneoId: string; nombre: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (
          confirm(
            `¿Borrar "${nombre}"? Se borran también sus categorías, zonas, parejas y partidos. Esta acción no se puede deshacer.`
          )
        ) {
          startTransition(() => eliminarTorneo(torneoId));
        }
      }}
      className="min-h-11 w-fit rounded-full border border-accent/50 px-4 font-heading text-xs tracking-wide text-accent-light hover:border-accent hover:bg-accent-dark/20 disabled:opacity-50"
    >
      {isPending ? "Borrando…" : "Borrar torneo"}
    </button>
  );
}
