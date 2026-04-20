import { useState, useEffect, useCallback } from 'react';
import { MatchData } from '../types';

// ---------------------------------------------------------------------------
// Datos de fallback — se usan si /api/match-data no responde
// ---------------------------------------------------------------------------
const FALLBACK_DATA: MatchData = {
  alineacion: [
    { id: 1,  nombre: "Jugador 1",  apodo: "El Guardián",  numero: 1,  urlFoto: "", posicionCancha: "Portero",                   rol: "Titular" },
    { id: 2,  nombre: "Jugador 2",  apodo: "El Muro",      numero: 2,  urlFoto: "", posicionCancha: "Defensa_Izq",               rol: "Titular" },
    { id: 3,  nombre: "Jugador 3",  apodo: "El Capitán",   numero: 3,  urlFoto: "", posicionCancha: "Defensa_CentroIzq",         rol: "Titular" },
    { id: 4,  nombre: "Jugador 4",  apodo: "La Roca",      numero: 4,  urlFoto: "", posicionCancha: "Defensa_CentroDer",         rol: "Titular" },
    { id: 5,  nombre: "Jugador 5",  apodo: "El Rayo",      numero: 5,  urlFoto: "", posicionCancha: "Defensa_Der",               rol: "Titular" },
    { id: 6,  nombre: "Jugador 6",  apodo: "El Motor",     numero: 6,  urlFoto: "", posicionCancha: "Mediocampo_Izq",            rol: "Titular" },
    { id: 7,  nombre: "Jugador 7",  apodo: "El Cerebro",   numero: 7,  urlFoto: "", posicionCancha: "Mediocampo_CentroIzq",      rol: "Titular" },
    { id: 8,  nombre: "Jugador 8",  apodo: "El Crack",     numero: 8,  urlFoto: "", posicionCancha: "Mediocampo_CentroDer",      rol: "Titular" },
    { id: 9,  nombre: "Jugador 9",  apodo: "La Muralla",   numero: 9,  urlFoto: "", posicionCancha: "Mediocampo_Der",            rol: "Titular" },
    { id: 10, nombre: "Jugador 10", apodo: "El Creador",   numero: 10, urlFoto: "", posicionCancha: "Mediocampo_OfensivoIzq",    rol: "Titular" },
    { id: 11, nombre: "Jugador 11", apodo: "El Mago",      numero: 11, urlFoto: "", posicionCancha: "Mediocampo_OfensivoCentro", rol: "Titular" },
    { id: 12, nombre: "Jugador 12", apodo: "El Fantasma",  numero: 12, urlFoto: "", posicionCancha: "Mediocampo_OfensivoDer",    rol: "Titular" },
    { id: 13, nombre: "Jugador 13", apodo: "La Sombra",    numero: 13, urlFoto: "", posicionCancha: "Enganche_Izq",              rol: "Titular" },
    { id: 14, nombre: "Jugador 14", apodo: "El Artista",   numero: 14, urlFoto: "", posicionCancha: "Enganche_CentroIzq",        rol: "Titular" },
    { id: 15, nombre: "Jugador 15", apodo: "El Maestro",   numero: 15, urlFoto: "", posicionCancha: "Enganche_CentroDer",        rol: "Titular" },
    { id: 16, nombre: "Jugador 16", apodo: "El Revulsivo", numero: 16, urlFoto: "", posicionCancha: "Enganche_Der",              rol: "Titular" },
    { id: 17, nombre: "Jugador 17", apodo: "El Extremo",   numero: 17, urlFoto: "", posicionCancha: "Extremo_Izq",               rol: "Titular" },
    { id: 18, nombre: "Jugador 18", apodo: "El Interior",  numero: 18, urlFoto: "", posicionCancha: "Delantero_InteriorIzq",     rol: "Titular" },
    { id: 19, nombre: "Jugador 19", apodo: "El Pistolero", numero: 19, urlFoto: "", posicionCancha: "Delantero_InteriorDer",     rol: "Titular" },
    { id: 20, nombre: "Jugador 20", apodo: "El Turbo",     numero: 20, urlFoto: "", posicionCancha: "Extremo_Der",               rol: "Titular" },
    { id: 21, nombre: "Jugador 21", apodo: "El Halcón",    numero: 21, urlFoto: "", posicionCancha: "Delantero_Izq",             rol: "Titular" },
    { id: 22, nombre: "Jugador 22", apodo: "El Killer",    numero: 22, urlFoto: "", posicionCancha: "Delantero_Centro",          rol: "Titular" },
    { id: 23, nombre: "Jugador 23", apodo: "El Águila",    numero: 23, urlFoto: "", posicionCancha: "Delantero_Der",             rol: "Titular" },
    { id: 24, nombre: "Kique",      apodo: "El Profe",     numero: 99, urlFoto: "", posicionCancha: "Director_Tecnico",          rol: "Profe" },
    { id: 25, nombre: "Jeannine",   apodo: "La Patrona",   numero: 0,  urlFoto: "", posicionCancha: "Palco_VIP",                 rol: "Dueña del Club" },
    { id: 26, nombre: "Patricia Rincón", apodo: "La As Bajo la Manga", numero: 26, urlFoto: "", posicionCancha: "Enganche_Libre", rol: "Titular" },
  ],
  resultados: [
    { mes: "Enero",      status: "Cerrado",   golesAFavor: 0, golesEnContra: 1, pctMeta: 88, highlight: "Inicio difícil, pero el equipo no baja los brazos" },
    { mes: "Febrero",    status: "Cerrado",   golesAFavor: 0, golesEnContra: 1, pctMeta: 82, highlight: "Mes retador, se siente la presión del mercado" },
    { mes: "Marzo",      status: "Cerrado",   golesAFavor: 1, golesEnContra: 0, pctMeta: 108, mvpPlayerId: 26, highlight: "¡Gol de descuento! El equipo reacciona 💪" },
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
  minutoActual: 23,
};

const REFETCH_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutos

interface UseMatchDataReturn {
  data: MatchData | null;
  loading: boolean;
  error: string | null;
}

export function useMatchData(): UseMatchDataReturn {
  const [data, setData]       = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async (isFirstLoad: boolean) => {
    try {
      const response = await fetch('/api/match-data');

      // En dev local sin vercel dev, la ruta no existe → fallback silencioso
      if (response.status === 404) {
        if (isFirstLoad) setData(FALLBACK_DATA);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = (await response.json()) as MatchData;
      setData(json);
      setError(null);
    } catch (err) {
      // Error de red u otro fallo: usar fallback en primera carga, silencio en refetch
      if (isFirstLoad) {
        setData(FALLBACK_DATA);
        // Solo mostramos error si no es un simple "no hay servidor local"
        const isNetworkAbsence =
          err instanceof TypeError && err.message.includes('fetch');
        if (!isNetworkAbsence) {
          setError('No se pudo conectar con el servidor. Mostrando datos de referencia.');
        }
      }
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, REFETCH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error };
}
