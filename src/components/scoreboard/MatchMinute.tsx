import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MonthResult } from '../../types';
import { COLORS, MONTHS_TO_MINUTES } from '../../utils/constants';

interface Props {
  minutoActual: number;
  resultados: MonthResult[];
}

// ---------------------------------------------------------------------------
// Marcas de mes sobre la barra
// ---------------------------------------------------------------------------
function MonthTick({ mes, minuto, isCurrent }: { mes: string; minuto: number; isCurrent: boolean }) {
  const pct = (minuto / 90) * 100;
  const isHalfTime = minuto === 45;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${pct}%`, top: 0, transform: 'translateX(-50%)' }}
    >
      {/* Línea de tick */}
      <div
        className="w-px"
        style={{
          height: isHalfTime ? '22px' : '14px',
          marginTop: isHalfTime ? '-4px' : '2px',
          background: isHalfTime
            ? COLORS.colombiaYellow
            : isCurrent
            ? 'rgba(252,209,22,0.6)'
            : 'rgba(255,255,255,0.2)',
        }}
      />
      {/* Label: sólo el mes actual y el medio tiempo */}
      {(isCurrent || isHalfTime) && (
        <span
          className="text-[8px] font-bold mt-0.5 whitespace-nowrap"
          style={{
            color: isHalfTime ? COLORS.colombiaYellow : 'rgba(255,255,255,0.5)',
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          {isHalfTime ? 'MT' : mes.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function MatchMinute({ minutoActual, resultados }: Props) {
  // Mes actual: primer Pendiente con recaudo parcial (en curso), o último cerrado si no hay.
  const inProgress = resultados.find(r => r.status === 'Pendiente' && r.pctMeta !== undefined);
  const lastClosed = [...resultados].reverse().find(r => r.status === 'Cerrado');
  const mesActual = inProgress?.mes ?? lastClosed?.mes ?? resultados[0]?.mes ?? 'Enero';

  const pct = minutoActual > 0 ? (minutoActual / 90) * 100 : 0;
  const isMedioTiempo = minutoActual === 45;

  // ── Spring physics para la pelota ──
  const rawPct  = useMotionValue(0);
  const spring  = useSpring(rawPct, { stiffness: 65, damping: 13 });
  const ballLeft = useTransform(spring, (v) => `${v}%`);

  useEffect(() => {
    // Pequeño delay inicial para que la animación sea visible al montar
    const timer = setTimeout(() => rawPct.set(pct), 400);
    return () => clearTimeout(timer);
  }, [pct, rawPct]);

  const allClosed = resultados.every(r => r.status === 'Cerrado');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div
        className="rounded-xl px-5 pt-4 pb-5"
        style={{
          background: 'rgba(15,30,58,0.7)',
          border: '1px solid rgba(255,215,0,0.18)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: COLORS.gold, fontFamily: "'Oswald', sans-serif" }}
          >
            Progreso del partido
          </span>

          {isMedioTiempo ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: COLORS.colombiaYellow, fontFamily: "'Oswald', sans-serif" }}
            >
              ¡MEDIO TIEMPO!
            </motion.span>
          ) : allClosed ? (
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Temporada completa
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#ef4444' }}
              />
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                EN CURSO
              </span>
            </div>
          )}
        </div>

        {/* ── Barra de progreso + pelota ── */}
        <div className="relative" style={{ height: '52px' }}>
          {/* Track background */}
          <div
            className="absolute inset-x-0 rounded-full"
            style={{
              height: '10px',
              top: '14px',
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            {/* Fill con gradiente */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS.colombiaBlue} 0%, #2563eb 40%, #16a34a 70%, ${COLORS.colombiaYellow} 100%)`,
                boxShadow: '0 0 8px rgba(252,209,22,0.3)',
              }}
            />
          </div>

          {/* Ticks de los 12 meses */}
          {Object.entries(MONTHS_TO_MINUTES).map(([mes, minuto]) => (
            <MonthTick
              key={mes}
              mes={mes}
              minuto={minuto}
              isCurrent={mes === mesActual}
            />
          ))}

          {/* Pelota animada — spring + bounce */}
          <motion.div
            style={{
              position: 'absolute',
              left: ballLeft,
              top: '4px',
              translateX: '-50%',
              zIndex: 10,
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'loop',
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-base"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #FFFFFF, #E0E0E0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(252,209,22,0.4)',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              ⚽
            </div>
          </motion.div>
        </div>

        {/* ── Etiquetas inferior: 0' — minuto actual — 90' ── */}
        <div className="flex items-end justify-between mt-1">
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
            0'
          </span>

          <motion.div
            className="flex flex-col items-center"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span
              className="font-black leading-none tabular-nums"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                color: COLORS.colombiaYellow,
              }}
            >
              {minutoActual}'
            </span>
            <span
              className="text-[11px] font-semibold mt-0.5"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}
            >
              {mesActual.toUpperCase()}
            </span>
          </motion.div>

          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
            90'
          </span>
        </div>
      </div>
    </motion.section>
  );
}
