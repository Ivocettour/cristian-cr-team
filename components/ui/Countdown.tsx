"use client";

import { useEffect, useState } from "react";

function calcularRestante(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ target, label }: { target: string; label: string }) {
  const targetMs = new Date(target).getTime();
  const [restante, setRestante] = useState(() => calcularRestante(targetMs));

  useEffect(() => {
    const id = setInterval(() => setRestante(calcularRestante(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const unidades: [string, number][] = [
    ["D", restante.dias],
    ["H", restante.horas],
    ["M", restante.minutos],
    ["S", restante.segundos],
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1.5 text-center sm:justify-start">
      <span className="font-heading text-xs tracking-wide text-foreground-muted">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {unidades.map(([unidad, valor]) => (
          <span key={unidad} className="font-heading text-sm text-white">
            {String(valor).padStart(2, "0")}
            <span className="text-foreground-muted">{unidad}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
