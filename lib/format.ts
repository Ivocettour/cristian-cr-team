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

/**
 * Parsea una fecha "YYYY-MM-DD" (sin hora) como medianoche LOCAL, no UTC.
 * `new Date("2026-09-21")` se interpreta como UTC y, según la zona horaria
 * de quien la formatea, puede mostrar el día anterior — este helper evita
 * ese corrimiento para fechas de calendario puras (fecha_inicio/fecha_fin).
 */
export function parseFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function formatFechaCorta(fecha: string): string {
  return parseFechaLocal(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatFechaLarga(fecha: string): string {
  return parseFechaLocal(fecha).toLocaleDateString("es-AR", {
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
