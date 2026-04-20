// Test local:      npx vercel dev → curl http://localhost:3000/api/match-data
// Test producción: curl https://spi-world-cup.vercel.app/api/match-data

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// Constantes privadas — NUNCA se exponen al frontend
// ---------------------------------------------------------------------------
const SHEET_ID = '1r7xQBfB4nr0LI3UjmZiJt1SoqZJIBzMxhutIDaDZ71c';
// Meta mensual en COP (535 millones). Confidencial — NUNCA se expone al frontend;
// el cliente sólo recibe pctMeta (entero %).
const META_MENSUAL = 535_000_000;

const MONTHS_TO_MINUTES: Record<string, number> = {
  Enero: 8, Febrero: 15, Marzo: 23, Abril: 30,
  Mayo: 38, Junio: 45, Julio: 53, Agosto: 60,
  Septiembre: 68, Octubre: 75, Noviembre: 83, Diciembre: 90,
};

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------
interface Player {
  id: number;
  nombre: string;
  apodo: string;
  numero: number;
  urlFoto: string;
  posicionCancha: string;
  rol: 'Titular' | 'Profe' | 'Dueña del Club';
}

interface MonthResult {
  mes: string;
  status: 'Cerrado' | 'Pendiente';
  golesAFavor: number;
  golesEnContra: number;
  highlight: string;
  pctMeta?: number;      // % cumplimiento meta (sin exponer USD)
  mvpPlayerId?: number;  // ID del MVP del mes (columna G opcional del Sheet)
}

interface MatchData {
  alineacion: Player[];
  resultados: MonthResult[];
  marcadorGlobal: { spiGoles: number; realAdversidadGoles: number };
  minutoActual: number;
}

// ---------------------------------------------------------------------------
// Datos de fallback (idénticos al mock del frontend)
// ---------------------------------------------------------------------------
const FALLBACK_DATA: MatchData = {
  alineacion: [
    { id: 1,  nombre: "Jugador 1",  apodo: "El Guardián", numero: 1,  urlFoto: "", posicionCancha: "Portero",                    rol: "Titular" },
    { id: 2,  nombre: "Jugador 2",  apodo: "El Muro",      numero: 2,  urlFoto: "", posicionCancha: "Defensa_Izq",               rol: "Titular" },
    { id: 3,  nombre: "Jugador 3",  apodo: "El Capitán",   numero: 3,  urlFoto: "", posicionCancha: "Defensa_CentroIzq",         rol: "Titular" },
    { id: 4,  nombre: "Jugador 4",  apodo: "La Roca",      numero: 4,  urlFoto: "", posicionCancha: "Defensa_CentroDer",         rol: "Titular" },
    { id: 5,  nombre: "Jugador 5",  apodo: "El Rayo",      numero: 5,  urlFoto: "", posicionCancha: "Defensa_Der",               rol: "Titular" },
    { id: 6,  nombre: "Jugador 6",  apodo: "El Motor",     numero: 6,  urlFoto: "", posicionCancha: "Mediocampo_Izq",            rol: "Titular" },
    { id: 7,  nombre: "Jugador 7",  apodo: "El Cerebro",   numero: 7,  urlFoto: "", posicionCancha: "Mediocampo_Centro",         rol: "Titular" },
    { id: 8,  nombre: "Jugador 8",  apodo: "El Crack",     numero: 8,  urlFoto: "", posicionCancha: "Mediocampo_Der",            rol: "Titular" },
    { id: 9,  nombre: "Jugador 9",  apodo: "El Creador",   numero: 9,  urlFoto: "", posicionCancha: "Mediocampo_OfensivoIzq",    rol: "Titular" },
    { id: 10, nombre: "Jugador 10", apodo: "El Mago",      numero: 10, urlFoto: "", posicionCancha: "Mediocampo_OfensivoCentro", rol: "Titular" },
    { id: 11, nombre: "Jugador 11", apodo: "El Fantasma",  numero: 11, urlFoto: "", posicionCancha: "Mediocampo_OfensivoDer",    rol: "Titular" },
    { id: 12, nombre: "Jugador 12", apodo: "El Goleador",  numero: 12, urlFoto: "", posicionCancha: "Delantero_Izq",             rol: "Titular" },
    { id: 13, nombre: "Jugador 13", apodo: "El Killer",    numero: 13, urlFoto: "", posicionCancha: "Delantero_Centro",          rol: "Titular" },
    { id: 14, nombre: "Jugador 14", apodo: "El Águila",    numero: 14, urlFoto: "", posicionCancha: "Delantero_Der",             rol: "Titular" },
    { id: 15, nombre: "Jugador 15", apodo: "El Recambio",  numero: 15, urlFoto: "", posicionCancha: "Banca_1",                  rol: "Titular" },
    { id: 16, nombre: "Jugador 16", apodo: "El Revulsivo", numero: 16, urlFoto: "", posicionCancha: "Banca_2",                  rol: "Titular" },
    { id: 17, nombre: "Jugador 17", apodo: "El Comodín",   numero: 17, urlFoto: "", posicionCancha: "Banca_3",                  rol: "Titular" },
    { id: 18, nombre: "Jugador 18", apodo: "El Escudo",    numero: 18, urlFoto: "", posicionCancha: "Banca_4",                  rol: "Titular" },
    { id: 19, nombre: "Jugador 19", apodo: "El Turbo",     numero: 19, urlFoto: "", posicionCancha: "Banca_5",                  rol: "Titular" },
    { id: 20, nombre: "Jugador 20", apodo: "El Estratega", numero: 20, urlFoto: "", posicionCancha: "Banca_6",                  rol: "Titular" },
    { id: 21, nombre: "Jugador 21", apodo: "El Imparable", numero: 21, urlFoto: "", posicionCancha: "Banca_7",                  rol: "Titular" },
    { id: 22, nombre: "Jugador 22", apodo: "El Guerrero",  numero: 22, urlFoto: "", posicionCancha: "Banca_8",                  rol: "Titular" },
    { id: 23, nombre: "Jugador 23", apodo: "El Halcón",    numero: 23, urlFoto: "", posicionCancha: "Banca_9",                  rol: "Titular" },
    { id: 24, nombre: "Kique",      apodo: "El Profe",     numero: 99, urlFoto: "", posicionCancha: "Director_Tecnico",          rol: "Profe" },
    { id: 25, nombre: "Jeannine",   apodo: "La Patrona",   numero: 0,  urlFoto: "", posicionCancha: "Palco_VIP",                 rol: "Dueña del Club" },
    { id: 26, nombre: "Patricia Rincón", apodo: "La As Bajo la Manga", numero: 26, urlFoto: "", posicionCancha: "Enganche_Libre", rol: "Titular" },
  ],
  resultados: [
    { mes: "Enero",      status: "Cerrado",   golesAFavor: 0, golesEnContra: 1, pctMeta: 88, highlight: "Inicio difícil, pero el equipo no baja los brazos" },
    { mes: "Febrero",    status: "Cerrado",   golesAFavor: 0, golesEnContra: 1, pctMeta: 82, highlight: "Mes retador, se siente la presión del mercado" },
    { mes: "Marzo",      status: "Cerrado",   golesAFavor: 1, golesEnContra: 0, pctMeta: 108, highlight: "¡Gol de descuento! El equipo reacciona 💪" },
    { mes: "Abril",      status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Mayo",       status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Junio",      status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Julio",      status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Agosto",     status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Septiembre", status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Octubre",    status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Noviembre",  status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
    { mes: "Diciembre",  status: "Pendiente", golesAFavor: 0, golesEnContra: 0, highlight: "" },
  ],
  marcadorGlobal: { spiGoles: 1, realAdversidadGoles: 2 },
  minutoActual: 23, // Último mes cerrado = Marzo
};

// ---------------------------------------------------------------------------
// fetchSheetTab — lee un rango de un tab del Sheet vía API pública
// ---------------------------------------------------------------------------
async function fetchSheetTab(tabName: string, range: string): Promise<string[][]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY no configurada');

  const encodedRange = encodeURIComponent(`${tabName}!${range}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedRange}?key=${apiKey}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000), // 8 s timeout
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google Sheets API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const json = (await response.json()) as { values?: string[][] };
  return json.values ?? [];
}

// ---------------------------------------------------------------------------
// calcularGoles — lógica de negocio (META_MENSUAL es privada aquí)
// ---------------------------------------------------------------------------
// Thresholds en COP: cada gol adicional cuesta 100M a favor / 50M en contra.
const THRESHOLD_GOL_A_FAVOR = 100_000_000;
const THRESHOLD_GOL_EN_CONTRA = 50_000_000;

function calcularGoles(recaudo: number): { aFavor: number; enContra: number } {
  if (recaudo >= META_MENSUAL) {
    return {
      aFavor: 1 + Math.floor((recaudo - META_MENSUAL) / THRESHOLD_GOL_A_FAVOR),
      enContra: 0,
    };
  }
  return {
    aFavor: 0,
    enContra: 1 + Math.floor((META_MENSUAL - recaudo) / THRESHOLD_GOL_EN_CONTRA),
  };
}

// Estimación de pctMeta cuando el Sheet trae goles hardcodeados sin USD.
// Mantiene la narrativa visual del chart aunque el dato exacto no esté disponible.
function estimarPctMetaDesdeGoles(aFavor: number, enContra: number): number {
  if (aFavor > 0) return 100 + aFavor * 12;   // 1 gol=112%, 2=124%, 3=136%
  if (enContra > 0) return 100 - enContra * 10; // 1 gol=90%, 2=80%, 3=70%
  return 100;
}

// ---------------------------------------------------------------------------
// parseAlineacion
// Columnas: ID | Nombre | Apodo | Numero | URL_Foto | Posicion_Cancha | Rol
// ---------------------------------------------------------------------------
function parseAlineacion(rows: string[][]): Player[] {
  const players: Player[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row.length < 7) {
      console.warn(`[Alineacion] Fila ${i + 2} tiene solo ${row.length} columnas, se omite.`);
      continue;
    }

    const [rawId, nombre, apodo, rawNumero, urlFoto, posicionCancha, rawRol] = row;

    const id = parseInt(rawId, 10);
    const numero = parseInt(rawNumero, 10);

    if (isNaN(id) || isNaN(numero)) {
      console.warn(`[Alineacion] Fila ${i + 2}: ID o Numero no numérico ("${rawId}", "${rawNumero}"), se omite.`);
      continue;
    }

    const rol = rawRol?.trim() as Player['rol'];
    if (!['Titular', 'Profe', 'Dueña del Club'].includes(rol)) {
      console.warn(`[Alineacion] Fila ${i + 2}: Rol desconocido "${rawRol}", se omite.`);
      continue;
    }

    players.push({
      id,
      nombre: nombre?.trim() ?? '',
      apodo: apodo?.trim() ?? '',
      numero,
      urlFoto: urlFoto?.trim() ?? '',
      posicionCancha: posicionCancha?.trim() ?? '',
      rol,
    });
  }

  return players;
}

// ---------------------------------------------------------------------------
// parseResultados
// Columnas: Mes | Status | Recaudo_Real_COP | Goles_Favor | Goles_Contra | Highlight | MVP_ID
// Garantiza los 12 meses en orden — si el Sheet omite una fila o tiene Status
// vacío, se emite Pendiente vacío (para que el timeline nunca tenga huecos).
// ---------------------------------------------------------------------------
const MESES_ORDEN = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseResultadoRow(row: string[], fila: number): MonthResult | null {
  if (row.length < 1) return null;
  const mes = row[0]?.trim() ?? '';
  if (!mes) return null;

  const rawStatus = row[1]?.trim() ?? '';
  // Tolerante: status vacío o desconocido → Pendiente. Sólo 'Cerrado' cierra el mes.
  const status: 'Cerrado' | 'Pendiente' = rawStatus === 'Cerrado' ? 'Cerrado' : 'Pendiente';

  const highlight = row[5]?.trim() ?? '';
  const rawMvp = row[6]?.trim();
  const mvpPlayerId = rawMvp && !isNaN(parseInt(rawMvp, 10)) ? parseInt(rawMvp, 10) : undefined;

  // Tolera separadores colombianos ("535.000.000"), anglo ("535,000,000") o limpio ("535000000").
  // Asume que el número nunca tiene decimales (montos en pesos enteros).
  const rawRecaudo = row[2]?.trim() ?? '';
  const recaudo = parseFloat(rawRecaudo.replace(/[.,]/g, ''));
  const tieneRecaudo = !isNaN(recaudo) && recaudo > 0;

  const rawGolesFavor  = row[3]?.trim();
  const rawGolesContra = row[4]?.trim();
  const golesFavorSheet  = rawGolesFavor  !== undefined && rawGolesFavor  !== '' ? parseFloat(rawGolesFavor)  : NaN;
  const golesContraSheet = rawGolesContra !== undefined && rawGolesContra !== '' ? parseFloat(rawGolesContra) : NaN;
  const tieneGolesHardcoded =
    !isNaN(golesFavorSheet) && golesFavorSheet >= 0 &&
    !isNaN(golesContraSheet) && golesContraSheet >= 0;

  // Mes Pendiente — si tiene recaudo parcial, reportar pctMeta provisional (mes en curso)
  if (status === 'Pendiente') {
    if (tieneRecaudo) {
      const pctMeta = Math.round((recaudo / META_MENSUAL) * 100);
      return { mes, status, golesAFavor: 0, golesEnContra: 0, highlight, pctMeta, mvpPlayerId };
    }
    return { mes, status, golesAFavor: 0, golesEnContra: 0, highlight, mvpPlayerId };
  }

  // Mes Cerrado
  if (tieneGolesHardcoded) {
    const af = Math.floor(golesFavorSheet);
    const ec = Math.floor(golesContraSheet);
    const pctMeta = tieneRecaudo
      ? Math.round((recaudo / META_MENSUAL) * 100)
      : estimarPctMetaDesdeGoles(af, ec);
    return { mes, status, golesAFavor: af, golesEnContra: ec, highlight, pctMeta, mvpPlayerId };
  }

  if (!tieneRecaudo) {
    console.warn(`[Resultados] Fila ${fila} (${mes}): sin recaudo ni goles hardcodeados. 0-0.`);
    return { mes, status, golesAFavor: 0, golesEnContra: 0, highlight, mvpPlayerId };
  }

  const { aFavor, enContra } = calcularGoles(recaudo);
  const pctMeta = Math.round((recaudo / META_MENSUAL) * 100);
  return { mes, status, golesAFavor: aFavor, golesEnContra: enContra, highlight, pctMeta, mvpPlayerId };
}

function parseResultados(rows: string[][]): MonthResult[] {
  const byMes = new Map<string, MonthResult>();

  for (let i = 0; i < rows.length; i++) {
    const parsed = parseResultadoRow(rows[i], i + 2);
    if (parsed) byMes.set(parsed.mes, parsed);
  }

  // Garantizar los 12 meses en orden. Faltantes → Pendiente vacío.
  return MESES_ORDEN.map(mes =>
    byMes.get(mes) ?? {
      mes,
      status: 'Pendiente' as const,
      golesAFavor: 0,
      golesEnContra: 0,
      highlight: '',
    }
  );
}

// ---------------------------------------------------------------------------
// buildMatchData — ensambla la respuesta final
// ---------------------------------------------------------------------------
function buildMatchData(alineacion: Player[], resultados: MonthResult[]): MatchData {
  let spiGoles = 0;
  let realAdversidadGoles = 0;
  let minutoActual = 0;

  for (const r of resultados) {
    if (r.status === 'Cerrado') {
      spiGoles += r.golesAFavor;
      realAdversidadGoles += r.golesEnContra;
      minutoActual = MONTHS_TO_MINUTES[r.mes] ?? minutoActual;
    }
  }

  // Si hay un mes en curso (Pendiente con recaudo parcial), avanzar la pelota
  // hasta su minuto para que la UI muestre "jugando <mes>".
  const enCurso = resultados.find(r => r.status === 'Pendiente' && r.pctMeta !== undefined);
  if (enCurso) {
    minutoActual = MONTHS_TO_MINUTES[enCurso.mes] ?? minutoActual;
  }

  return {
    alineacion,
    resultados,
    marcadorGlobal: { spiGoles, realAdversidadGoles },
    minutoActual,
  };
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    // Fetch en paralelo de las dos tabs (excluye la fila de headers con A2:G)
    const [alineacionRows, resultadosRows] = await Promise.all([
      fetchSheetTab('Alineacion', 'A2:G27'),
      fetchSheetTab('Resultados_Mensuales', 'A2:G13'),
    ]);

    const alineacion = parseAlineacion(alineacionRows);
    const resultados = parseResultados(resultadosRows);

    if (alineacion.length === 0 || resultados.length === 0) {
      throw new Error(
        `Datos insuficientes del Sheet: ${alineacion.length} jugadores, ${resultados.length} meses`
      );
    }

    const data = buildMatchData(alineacion, resultados);

    // Cache corto para que fixes propaguen rápido al Town Hall.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.setHeader('X-Api-Version', 'meta-cop-v2');
    res.status(200).json(data);
  } catch (err) {
    console.error('[match-data] Error al leer Google Sheets, usando fallback:', err);

    // Fallback transparente — el cliente no sabe que hubo error
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(FALLBACK_DATA);
  }
}
