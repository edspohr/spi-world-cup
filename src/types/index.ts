export interface Player {
  id: number;
  nombre: string;
  apodo: string;
  numero: number;
  urlFoto: string;
  posicionCancha: string;
  rol: 'Titular' | 'Profe' | 'Dueña del Club';
}

export interface MonthResult {
  mes: string;
  status: 'Cerrado' | 'Pendiente';
  golesAFavor: number;
  golesEnContra: number;
  highlight: string;
}

export interface MatchData {
  alineacion: Player[];
  resultados: MonthResult[];
  marcadorGlobal: {
    spiGoles: number;
    realAdversidadGoles: number;
  };
  minutoActual: number;
}
