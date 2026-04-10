export const COLORS = {
  colombiaYellow: '#FCD116',
  colombiaBlue: '#003893',
  colombiaRed: '#CE1126',
  pitchGreen: '#2D5A27',
  pitchGreenLight: '#3A7D32',
  pitchGreenDark: '#1A3A1A',
  pitchLines: '#FFFFFF',
  gold: '#FFD700',
  darkBg: '#0A1628',
  cardBg: '#1A2A4A',
  // Adversario
  adversaryRed: '#8B0000',
  adversaryRedDark: '#5C0000',
  // Estados de mes
  winGreenBg: 'rgba(20,83,45,0.55)',
  winGreenBorder: '#16a34a',
  lossRedBg: 'rgba(127,29,29,0.55)',
  lossRedBorder: '#dc2626',
  drawBlueBg: 'rgba(30,58,95,0.55)',
  drawBlueBorder: '#3b82f6',
};

export const TEAM_NAMES = {
  home: 'SPI Americas',
  away: 'Real Adversidad',
};

export const MONTHS_TO_MINUTES: Record<string, number> = {
  Enero: 8,
  Febrero: 15,
  Marzo: 23,
  Abril: 30,
  Mayo: 38,
  Junio: 45,
  Julio: 53,
  Agosto: 60,
  Septiembre: 68,
  Octubre: 75,
  Noviembre: 83,
  Diciembre: 90,
};

export const CURRENT_MONTH = 'Abril';
export const CURRENT_YEAR = 2026;

export const POSITION_MAP: Record<string, { x: string; y: string }> = {
  Portero:                    { x: '50%', y: '92%' },
  Defensa_Izq:                { x: '15%', y: '78%' },
  Defensa_CentroIzq:          { x: '38%', y: '78%' },
  Defensa_CentroDer:          { x: '62%', y: '78%' },
  Defensa_Der:                { x: '85%', y: '78%' },
  Mediocampo_Izq:             { x: '12%', y: '64%' },
  Mediocampo_CentroIzq:       { x: '37%', y: '64%' },
  Mediocampo_CentroDer:       { x: '63%', y: '64%' },
  Mediocampo_Der:             { x: '88%', y: '64%' },
  Mediocampo_OfensivoIzq:     { x: '25%', y: '52%' },
  Mediocampo_OfensivoCentro:  { x: '50%', y: '52%' },
  Mediocampo_OfensivoDer:     { x: '75%', y: '52%' },
  Enganche_Libre:             { x: '50%', y: '46%' },
  Enganche_Izq:               { x: '12%', y: '40%' },
  Enganche_CentroIzq:         { x: '37%', y: '40%' },
  Enganche_CentroDer:         { x: '63%', y: '40%' },
  Enganche_Der:               { x: '88%', y: '40%' },
  Extremo_Izq:                { x: '10%', y: '27%' },
  Delantero_InteriorIzq:      { x: '35%', y: '27%' },
  Delantero_InteriorDer:      { x: '65%', y: '27%' },
  Extremo_Der:                { x: '90%', y: '27%' },
  Delantero_Izq:              { x: '25%', y: '14%' },
  Delantero_Centro:           { x: '50%', y: '14%' },
  Delantero_Der:              { x: '75%', y: '14%' },
};
