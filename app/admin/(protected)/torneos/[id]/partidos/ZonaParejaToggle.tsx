"use client";

import { useTransition } from "react";
import { alternarParejaEnZona } from "@/lib/actions/armado";

export function ZonaParejaToggle({
  zonaId,
  parejaId,
  torneoId,
  asignada,
  label,
}: {
  zonaId: string;
  parejaId: string;
  torneoId: string;
  asignada: boolean;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-white">
      <input
        type="checkbox"
        defaultChecked={asignada}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() => {
            alternarParejaEnZona(zonaId, parejaId, torneoId, e.target.checked);
          })
        }
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  );
}
