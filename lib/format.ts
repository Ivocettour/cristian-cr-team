import type { Jugador } from "./types";

export function paisToFlag(pais: string | null): string {
  if (!pais || pais.length !== 2) return "🏳️";
  const codePoints = [...pais.toUpperCase()].map(
    (c) => 127397 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

export function nombreCompleto(j: Jugador): string {
  return `${j.nombre} ${j.apellido}`;
}

export function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatFechaLarga(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatHora(fechaIso: string): string {
  return new Date(fechaIso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuracion(minutos: number | null): string {
  if (!minutos) return "";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
