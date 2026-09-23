"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { seguirTorneo, dejarDeSeguirTorneo } from "@/lib/actions/cuenta";

export function FollowTournamentButton({
  torneoId,
  siguiendoInicial,
  usuarioId,
}: {
  torneoId: string;
  siguiendoInicial: boolean;
  usuarioId: string | null;
}) {
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial);
  const [isPending, startTransition] = useTransition();

  if (!usuarioId) {
    return (
      <Link
        href="/cuenta/login"
        className="min-h-11 rounded-full border border-white/30 px-4 py-2 font-heading text-xs tracking-wide text-white hover:border-white"
      >
        Seguir torneo
      </Link>
    );
  }

  function toggle() {
    const nuevoValor = !siguiendo;
    setSiguiendo(nuevoValor);
    startTransition(() => {
      if (nuevoValor) {
        seguirTorneo(torneoId);
      } else {
        dejarDeSeguirTorneo(torneoId);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`min-h-11 rounded-full border px-4 py-2 font-heading text-xs tracking-wide disabled:opacity-50 ${
        siguiendo
          ? "border-accent bg-accent text-white"
          : "border-white/30 text-white hover:border-white"
      }`}
    >
      {siguiendo ? "Siguiendo torneo" : "Seguir torneo"}
    </button>
  );
}
