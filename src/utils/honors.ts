import { MonthResult } from '../types';

export interface Honors {
  /** MVP del último mes cerrado (si existe). */
  mvpPlayerId: number | null;
  /** Jugador en llamas: MVP en ≥2 meses cerrados positivos consecutivos más recientes. */
  enLlamasPlayerId: number | null;
  /** Meses en racha del jugador 'en llamas' (2+). */
  racha: number;
  /** Nombre del último mes cerrado (para mostrar "MVP de Marzo"). */
  lastClosedMes: string | null;
}

export function computeHonors(resultados: MonthResult[]): Honors {
  const closed = resultados.filter(r => r.status === 'Cerrado');
  const last = closed[closed.length - 1];

  if (!last) {
    return { mvpPlayerId: null, enLlamasPlayerId: null, racha: 0, lastClosedMes: null };
  }

  const mvpPlayerId = last.mvpPlayerId ?? null;

  // En llamas: recorrer hacia atrás desde el último mes cerrado
  // mientras (gol a favor > en contra) Y mismo mvpPlayerId.
  let racha = 0;
  let enLlamasPlayerId: number | null = null;
  if (mvpPlayerId !== null && last.golesAFavor > last.golesEnContra) {
    racha = 1;
    for (let i = closed.length - 2; i >= 0; i--) {
      const r = closed[i];
      if (
        r.mvpPlayerId === mvpPlayerId &&
        r.golesAFavor > r.golesEnContra
      ) {
        racha++;
      } else {
        break;
      }
    }
    if (racha >= 2) enLlamasPlayerId = mvpPlayerId;
    else racha = 0;
  }

  return {
    mvpPlayerId,
    enLlamasPlayerId,
    racha,
    lastClosedMes: last.mes,
  };
}
