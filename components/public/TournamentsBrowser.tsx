"use client";

import { useMemo, useState } from "react";
import { TournamentCard } from "@/components/public/TournamentCard";
import type { Torneo } from "@/lib/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function TournamentsBrowser({ torneos }: { torneos: Torneo[] }) {
  const años = useMemo(() => {
    const set = new Set(torneos.map((t) => new Date(t.fecha_inicio).getFullYear()));
    return Array.from(set).sort();
  }, [torneos]);

  const [año, setAño] = useState<string>("todos");
  const [mes, setMes] = useState<string>("todos");

  const filtrados = torneos.filter((t) => {
    const fecha = new Date(t.fecha_inicio);
    if (año !== "todos" && fecha.getFullYear() !== Number(año)) return false;
    if (mes !== "todos" && fecha.getMonth() !== Number(mes)) return false;
    return true;
  });

  const selectClass =
    "min-h-11 w-full rounded-full border border-white/20 bg-panel px-4 font-heading text-sm tracking-wide text-white sm:w-48";

  return (
    <div>
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:px-6">
        <select
          value={año}
          onChange={(e) => setAño(e.target.value)}
          className={selectClass}
        >
          <option value="todos">Todos los años</option>
          {años.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className={selectClass}
        >
          <option value="todos">Todos los meses</option>
          {MESES.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-4 px-4 sm:px-6">
        {filtrados.length === 0 && (
          <p className="text-foreground-muted">No hay torneos para ese filtro.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((torneo) => (
            <TournamentCard key={torneo.id} torneo={torneo} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
