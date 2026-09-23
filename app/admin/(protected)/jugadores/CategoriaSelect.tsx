"use client";

import { useTransition } from "react";
import { actualizarCategoriaJugador } from "@/lib/actions/jugadores";
import type { Categoria } from "@/lib/types";

export function CategoriaSelect({
  jugadorId,
  categoriaActualId,
  categorias,
}: {
  jugadorId: string;
  categoriaActualId: string | null;
  categorias: Categoria[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={categoriaActualId ?? ""}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          actualizarCategoriaJugador(jugadorId, e.target.value);
        })
      }
      className="min-h-11 rounded-lg border border-white/20 bg-panel px-3 text-sm text-white outline-none focus:border-accent disabled:opacity-50"
    >
      <option value="">Sin categoría</option>
      {categorias.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}
