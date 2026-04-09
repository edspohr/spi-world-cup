import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'framer-motion';
import { MonthResult } from '../../types';
import { COLORS, TEAM_NAMES } from '../../utils/constants';

// ---------------------------------------------------------------------------
// SVG: Escudo SPI Americas
// ---------------------------------------------------------------------------
function ShieldSPI() {
  return (
    <svg viewBox="0 0 64 80" fill="none" className="w-full h-full" aria-label="Escudo SPI Americas">
      <defs>
        <clipPath id="clip-spi">
          <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" />
        </clipPath>
      </defs>
      {/* Fondo azul */}
      <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" fill={COLORS.colombiaBlue} />
      {/* Franjas tricolor en la parte superior — clipeadas al escudo */}
      <g clipPath="url(#clip-spi)">
        <rect x="0" y="6" width="64" height="11" fill="#FCD116" />
        <rect x="0" y="17" width="64" height="9" fill="#003893" />
        <rect x="0" y="26" width="64" height="9" fill="#CE1126" />
        <rect x="0" y="35" width="64" height="50" fill="#003893" />
      </g>
      {/* Borde exterior dorado */}
      <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" fill="none" stroke="#FFD700" strokeWidth="3" />
      {/* Borde interior sutil */}
      <path d="M12 12 L52 12 L54 48 Q52 64 32 73 Q12 64 10 48 Z" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1.5" />
      {/* Texto SPI */}
      <text
        x="32" y="60"
        textAnchor="middle"
        fill="#FFD700"
        fontFamily="'Oswald', 'Arial Narrow', sans-serif"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2"
      >
        SPI
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SVG: Escudo Real Adversidad
// ---------------------------------------------------------------------------
function ShieldRA() {
  return (
    <svg viewBox="0 0 64 80" fill="none" className="w-full h-full" aria-label="Escudo Real Adversidad">
      <defs>
        <clipPath id="clip-ra">
          <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" />
        </clipPath>
        <linearGradient id="ra-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B0000" />
          <stop offset="100%" stopColor="#3D0000" />
        </linearGradient>
      </defs>
      {/* Fondo rojo oscuro */}
      <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" fill="url(#ra-bg)" />
      {/* Rayado diagonal sutil — adversidad */}
      <g clipPath="url(#clip-ra)" opacity="0.18">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((offset) => (
          <line
            key={offset}
            x1={-10 + offset} y1="6"
            x2={offset - 30} y2="86"
            stroke="#CE1126"
            strokeWidth="6"
          />
        ))}
      </g>
      {/* Rayo principal — símbolo de adversidad */}
      <path
        d="M36 14 L23 39 L31 36 L25 58 L43 30 L35 33 L49 14 Z"
        fill="#CE1126"
        opacity="0.95"
      />
      <path
        d="M36 14 L23 39 L31 36 L25 58 L43 30 L35 33 L49 14 Z"
        fill="none"
        stroke="rgba(255,150,150,0.5)"
        strokeWidth="0.8"
      />
      {/* Texto RA */}
      <text
        x="32" y="73"
        textAnchor="middle"
        fill="rgba(255,120,120,0.9)"
        fontFamily="'Oswald', 'Arial Narrow', sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
      >
        RA
      </text>
      {/* Borde rojo */}
      <path d="M6 6 L58 6 L60 50 Q58 68 32 78 Q6 68 4 50 Z" fill="none" stroke="#CE1126" strokeWidth="3" />
      <path d="M12 12 L52 12 L54 48 Q52 64 32 73 Q12 64 10 48 Z" fill="none" stroke="rgba(206,17,38,0.3)" strokeWidth="1.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Hook: animación de conteo ascendente
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 1.6) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);

  return count;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  marcadorGlobal: { spiGoles: number; realAdversidadGoles: number };
  minutoActual: number;
  resultados: MonthResult[];
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function MainScoreboard({ marcadorGlobal, resultados }: Props) {
  const { spiGoles, realAdversidadGoles } = marcadorGlobal;

  const spiDisplayed = useCountUp(spiGoles);
  const raDisplayed  = useCountUp(realAdversidadGoles);

  const isWinning  = spiGoles > realAdversidadGoles;
  const isLosing   = spiGoles < realAdversidadGoles;
  const isTied     = spiGoles === realAdversidadGoles;
  const allClosed  = resultados.every(r => r.status === 'Cerrado');
  const mesesCerrados = resultados.filter(r => r.status === 'Cerrado').length;

  // Glow del contenedor según estado del partido
  const glowColor = isWinning
    ? 'rgba(252,209,22,0.35)'
    : isLosing
    ? 'rgba(206,17,38,0.25)'
    : 'rgba(0,56,147,0.3)';

  return (
    <motion.section
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <motion.div
        className="rounded-2xl overflow-hidden relative"
        animate={{
          boxShadow: [
            `0 0 24px ${glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
            `0 0 48px ${glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
            `0 0 24px ${glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(160deg, #0F1E3A 0%, #0A1628 50%, #111827 100%)',
          border: `2px solid rgba(255,215,0,0.35)`,
        }}
      >
        {/* ── Barra superior ── */}
        <div
          className="px-5 py-2 flex items-center justify-between"
          style={{ background: 'rgba(255,215,0,0.07)', borderBottom: '1px solid rgba(255,215,0,0.15)' }}
        >
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: COLORS.gold, fontFamily: "'Oswald', sans-serif" }}
          >
            Copa SPI 2025 · Marcador Global
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {mesesCerrados} / 12 meses cerrados
          </span>
        </div>

        {/* ── Cuerpo del marcador ── */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-8 py-6 sm:py-8">

          {/* ── Equipo local: SPI Americas ── */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Escudo */}
            <div className="w-12 h-[60px] sm:w-16 sm:h-20 flex-shrink-0">
              <ShieldSPI />
            </div>
            {/* Nombre */}
            <div className="min-w-0">
              <p
                className="font-bold uppercase leading-tight text-xs sm:text-sm truncate"
                style={{
                  color: COLORS.colombiaYellow,
                  fontFamily: "'Oswald', sans-serif",
                  letterSpacing: '0.08em',
                }}
              >
                {TEAM_NAMES.home}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Local
              </p>
            </div>
          </div>

          {/* ── Marcador central ── */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Goles SPI */}
              <motion.span
                animate={isWinning ? { textShadow: ['0 0 20px rgba(252,209,22,0.6)', '0 0 40px rgba(252,209,22,0.2)', '0 0 20px rgba(252,209,22,0.6)'] } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="tabular-nums font-black leading-none"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  color: isWinning ? COLORS.colombiaYellow : '#FFFFFF',
                }}
              >
                {spiDisplayed}
              </motion.span>

              {/* Separador VS */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid rgba(255,215,0,0.4)`,
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: COLORS.gold, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}
                  >
                    vs
                  </span>
                </div>
              </div>

              {/* Goles Real Adversidad */}
              <span
                className="tabular-nums font-black leading-none"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  color: isLosing ? 'rgba(206,17,38,0.9)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {raDisplayed}
              </span>
            </div>

            {/* Badge de estado del partido */}
            <div className="flex items-center gap-2">
              {isWinning && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(252,209,22,0.15)', color: COLORS.colombiaYellow, border: '1px solid rgba(252,209,22,0.3)' }}
                >
                  ¡VAMOS GANANDO! 🏆
                </span>
              )}
              {isLosing && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(206,17,38,0.15)', color: '#FF6B6B', border: '1px solid rgba(206,17,38,0.3)' }}
                >
                  A REMONTAR 💪
                </span>
              )}
              {isTied && spiGoles > 0 && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  EMPATE
                </span>
              )}
            </div>
          </div>

          {/* ── Equipo visitante: Real Adversidad ── */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 justify-end">
            {/* Nombre */}
            <div className="min-w-0 text-right">
              <p
                className="font-bold uppercase leading-tight text-xs sm:text-sm truncate"
                style={{
                  color: COLORS.colombiaRed,
                  fontFamily: "'Oswald', sans-serif",
                  letterSpacing: '0.08em',
                }}
              >
                {TEAM_NAMES.away}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Visitante
              </p>
            </div>
            {/* Escudo */}
            <div className="w-12 h-[60px] sm:w-16 sm:h-20 flex-shrink-0">
              <ShieldRA />
            </div>
          </div>
        </div>

        {/* ── Franja inferior: EN VIVO / FINAL ── */}
        <div
          className="px-5 py-2 flex items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {allClosed ? (
            <span
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: COLORS.gold, fontFamily: "'Oswald', sans-serif" }}
            >
              ⚡ PARTIDO FINALIZADO ⚡
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#ef4444' }}
              />
              <span
                className="text-xs font-bold tracking-[0.25em] uppercase"
                style={{ color: '#ef4444', fontFamily: "'Oswald', sans-serif" }}
              >
                EN VIVO
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                · Temporada 2025
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}
