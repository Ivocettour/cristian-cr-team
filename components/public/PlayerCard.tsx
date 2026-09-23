import Link from "next/link";
import { paisToFlag, nombreCompleto } from "@/lib/format";
import type { Jugador } from "@/lib/types";

export function PlayerCard({ jugador, categoriaNombre }: { jugador: Jugador; categoriaNombre?: string }) {
  const iniciales = `${jugador.nombre[0] ?? ""}${jugador.apellido[0] ?? ""}`;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-panel p-5 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-dark to-accent font-heading text-xl text-white">
        {iniciales}
      </div>
      <p className="mt-3 text-sm text-foreground-muted">
        {paisToFlag(jugador.pais)} {jugador.pais ?? ""}
      </p>
      <h3 className="font-heading text-lg text-white">{nombreCompleto(jugador)}</h3>
      {categoriaNombre && (
        <p className="text-xs text-foreground-muted">Categoría {categoriaNombre}</p>
      )}
      <Link
        href={`/jugadores/${jugador.id}`}
        className="mt-3 min-h-11 rounded-full border border-white/30 px-4 py-2 font-heading text-xs tracking-wide text-white hover:border-white"
      >
        VER PERFIL
      </Link>
    </div>
  );
}
