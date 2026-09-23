import type { ZonaConTabla } from "./types";

export interface FilaPosiciones {
  parejaId: string;
  jugados: number;
  ganados: number;
  perdidos: number;
  setsFavor: number;
  setsContra: number;
}

export function calcularPosiciones(zona: ZonaConTabla): FilaPosiciones[] {
  const filas = new Map<string, FilaPosiciones>();

  for (const pareja of zona.parejas) {
    filas.set(pareja.id, {
      parejaId: pareja.id,
      jugados: 0,
      ganados: 0,
      perdidos: 0,
      setsFavor: 0,
      setsContra: 0,
    });
  }

  for (const partido of zona.partidos) {
    if (partido.estado !== "finalizado") continue;
    if (!partido.pareja_a_id || !partido.pareja_b_id) continue;

    const filaA = filas.get(partido.pareja_a_id);
    const filaB = filas.get(partido.pareja_b_id);
    if (!filaA || !filaB) continue;

    filaA.jugados += 1;
    filaB.jugados += 1;

    for (const set of partido.sets) {
      if (set.games_pareja_a > set.games_pareja_b) {
        filaA.setsFavor += 1;
        filaB.setsContra += 1;
      } else if (set.games_pareja_b > set.games_pareja_a) {
        filaB.setsFavor += 1;
        filaA.setsContra += 1;
      }
    }

    if (partido.ganador_pareja_id === partido.pareja_a_id) {
      filaA.ganados += 1;
      filaB.perdidos += 1;
    } else if (partido.ganador_pareja_id === partido.pareja_b_id) {
      filaB.ganados += 1;
      filaA.perdidos += 1;
    }
  }

  return Array.from(filas.values()).sort((a, b) => {
    if (b.ganados !== a.ganados) return b.ganados - a.ganados;
    const diffA = a.setsFavor - a.setsContra;
    const diffB = b.setsFavor - b.setsContra;
    return diffB - diffA;
  });
}
