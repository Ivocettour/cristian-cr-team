import type { EstadoTorneo } from "./types";

/**
 * El estado del torneo se deriva de sus fechas, no se toca a mano: evita el
 * botón "Próximo/En vivo/Completado" que había que recordar cambiar y que
 * podía quedar desincronizado con las fechas reales.
 */
export function calcularEstadoTorneo(
  fechaInicio: string,
  fechaFin: string,
  hoyIso: string = new Date().toISOString().slice(0, 10)
): EstadoTorneo {
  if (hoyIso < fechaInicio) return "proximo";
  if (hoyIso > fechaFin) return "finalizado";
  return "en_curso";
}
