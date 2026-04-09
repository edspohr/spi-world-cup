import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { MonthResult } from '../../types';
import { COLORS, MONTHS_TO_MINUTES } from '../../utils/constants';

interface Props {
  resultados: MonthResult[];
}

// ---------------------------------------------------------------------------
// Variantes de animación para stagger
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Derivar estilo de tarjeta según resultado
// ---------------------------------------------------------------------------
function getCardStyle(result: MonthResult, isCurrentMonth: boolean) {
  if (result.status === 'Pendiente') {
    if (isCurrentMonth) {
      return {
        bg: 'rgba(10,22,40,0.85)',
        border: COLORS.colombiaYellow,
        borderStyle: 'solid' as const,
        labelColor: COLORS.colombiaYellow,
        numberColor: COLORS.colombiaYellow,
      };
    }
    return {
      bg: 'rgba(10,22,40,0.5)',
      border: 'rgba(255,255,255,0.12)',
      borderStyle: 'dashed' as const,
      labelColor: 'rgba(255,255,255,0.25)',
      numberColor: 'rgba(255,255,255,0.25)',
    };
  }

  // Cerrado
  const won  = result.golesAFavor > result.golesEnContra;
  const lost = result.golesAFavor < result.golesEnContra;

  if (won) {
    return {
      bg: COLORS.winGreenBg,
      border: COLORS.winGreenBorder,
      borderStyle: 'solid' as const,
      labelColor: '#86efac',
      numberColor: '#4ade80',
    };
  }
  if (lost) {
    return {
      bg: COLORS.lossRedBg,
      border: COLORS.lossRedBorder,
      borderStyle: 'solid' as const,
      labelColor: '#fca5a5',
      numberColor: '#f87171',
    };
  }
  // Empate
  return {
    bg: COLORS.drawBlueBg,
    border: COLORS.drawBlueBorder,
    borderStyle: 'solid' as const,
    labelColor: '#93c5fd',
    numberColor: '#60a5fa',
  };
}

// ---------------------------------------------------------------------------
// Iconos de goles (máx 5 por línea para no desbordar)
// ---------------------------------------------------------------------------
function GoalIcons({ favor, contra }: { favor: number; contra: number }) {
  const maxIcons = 5;
  const favorIcons  = favor  > 0 ? Math.min(favor, maxIcons)  : 0;
  const contraIcons = contra > 0 ? Math.min(contra, maxIcons) : 0;

  return (
    <div className="flex flex-wrap items-center gap-0.5 mt-1.5">
      {favorIcons > 0 && (
        <span className="text-sm leading-none" title={`${favor} gol(es) a favor`}>
          {'⚽'.repeat(favorIcons)}
          {favor > maxIcons && <span className="text-[9px] text-white/50 ml-0.5">+{favor - maxIcons}</span>}
        </span>
      )}
      {contraIcons > 0 && (
        <span className="text-sm leading-none" title={`${contra} gol(es) en contra`}>
          {'🔴'.repeat(contraIcons)}
          {contra > maxIcons && <span className="text-[9px] text-white/50 ml-0.5">+{contra - maxIcons}</span>}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta individual de mes
// ---------------------------------------------------------------------------
function MonthCard({
  result,
  isCurrentMonth,
}: {
  result: MonthResult;
  isCurrentMonth: boolean;
}) {
  const minuto = MONTHS_TO_MINUTES[result.mes] ?? 0;
  const style  = getCardStyle(result, isCurrentMonth);
  const isClosed  = result.status === 'Cerrado';
  const won   = isClosed && result.golesAFavor > result.golesEnContra;
  const drew  = isClosed && result.golesAFavor === result.golesEnContra;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={isClosed ? { scale: 1.03, transition: { duration: 0.18 } } : {}}
      animate={
        isCurrentMonth
          ? {
              boxShadow: [
                `0 0 8px rgba(252,209,22,0.7)`,
                `0 0 20px rgba(252,209,22,0.15)`,
                `0 0 8px rgba(252,209,22,0.7)`,
              ],
            }
          : { boxShadow: 'none' }
      }
      transition={isCurrentMonth ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
      className="rounded-xl p-3 flex flex-col gap-1 relative overflow-hidden cursor-default"
      style={{
        background: style.bg,
        border: `1.5px ${style.borderStyle} ${style.border}`,
        minHeight: '110px',
      }}
    >
      {/* Destello sutil de victoria en la esquina */}
      {won && (
        <div
          className="absolute top-0 right-0 w-12 h-12 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, #4ade80, transparent)',
          }}
        />
      )}

      {/* ── Header de la tarjeta ── */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <p
            className="font-bold text-xs leading-tight"
            style={{
              color: isClosed ? '#FFFFFF' : style.labelColor,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.05em',
            }}
          >
            {result.mes}
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Min {minuto}'
          </p>
        </div>

        {/* Indicador de estado */}
        {isCurrentMonth && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: COLORS.colombiaYellow }}
          />
        )}
        {won && <span className="text-sm flex-shrink-0">🏆</span>}
        {drew && isClosed && <span className="text-sm flex-shrink-0">🤝</span>}
        {isClosed && !won && !drew && <span className="text-sm flex-shrink-0">💪</span>}
      </div>

      {/* ── Resultado o "Por jugar" ── */}
      {isClosed ? (
        <>
          {/* Marcador del mes */}
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="font-black tabular-nums leading-none"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.6rem',
                color: style.numberColor,
              }}
            >
              {result.golesAFavor}
            </span>
            <span className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
            <span
              className="font-black tabular-nums leading-none"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.6rem',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {result.golesEnContra}
            </span>
          </div>
          <p className="text-[8px] font-medium" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
            SPI · RA
          </p>

          {/* Iconos de goles */}
          <GoalIcons favor={result.golesAFavor} contra={result.golesEnContra} />

          {/* Highlight */}
          {result.highlight && (
            <p
              className="text-[9px] italic leading-snug mt-auto pt-1"
              style={{
                color: 'rgba(255,255,255,0.45)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              "{result.highlight}"
            </p>
          )}
        </>
      ) : (
        /* Pendiente */
        <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2">
          {isCurrentMonth ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="text-xl"
              >
                ⚽
              </motion.div>
              <p
                className="text-[9px] font-bold text-center uppercase tracking-widest mt-1"
                style={{ color: COLORS.colombiaYellow, fontFamily: "'Oswald', sans-serif" }}
              >
                En juego
              </p>
            </>
          ) : (
            <>
              <Clock size={14} color="rgba(255,255,255,0.2)" />
              <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Por jugar
              </p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function MonthTimeline({ resultados }: Props) {
  // Mes actual = primer Pendiente después del último Cerrado
  let lastClosedIdx = -1;
  resultados.forEach((r, i) => { if (r.status === 'Cerrado') lastClosedIdx = i; });
  const currentMonthIdx = lastClosedIdx >= 0 && lastClosedIdx < 11 ? lastClosedIdx + 1 : -1;

  const totalFavor  = resultados.reduce((s, r) => s + r.golesAFavor,  0);
  const totalContra = resultados.reduce((s, r) => s + r.golesEnContra, 0);
  const lastHighlight = [...resultados].reverse().find(r => r.status === 'Cerrado' && r.highlight);

  const mesesGanados = resultados.filter(r => r.status === 'Cerrado' && r.golesAFavor > r.golesEnContra).length;
  const mesesPerdidos = resultados.filter(r => r.status === 'Cerrado' && r.golesAFavor < r.golesEnContra).length;
  const mesesEmpate = resultados.filter(r => r.status === 'Cerrado' && r.golesAFavor === r.golesEnContra).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          background: 'rgba(10,22,40,0.6)',
          border: '1.5px solid rgba(255,215,0,0.15)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* ── Encabezado ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2
            className="font-bold uppercase tracking-[0.15em] text-sm"
            style={{ color: COLORS.gold, fontFamily: "'Oswald', sans-serif" }}
          >
            Resultados Mes a Mes
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-[10px] px-2 py-1 rounded-full font-bold"
                  style={{ background: COLORS.winGreenBg, color: '#4ade80', border: `1px solid ${COLORS.winGreenBorder}` }}>
              {mesesGanados}G
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold"
                  style={{ background: COLORS.drawBlueBg, color: '#60a5fa', border: `1px solid ${COLORS.drawBlueBorder}` }}>
              {mesesEmpate}E
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold"
                  style={{ background: COLORS.lossRedBg, color: '#f87171', border: `1px solid ${COLORS.lossRedBorder}` }}>
              {mesesPerdidos}P
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {totalFavor} GF · {totalContra} GC
            </span>
          </div>
        </div>

        {/* ── Grid de tarjetas ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-2.5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
        >
          {resultados.map((r, i) => (
            <MonthCard
              key={r.mes}
              result={r}
              isCurrentMonth={i === currentMonthIdx}
            />
          ))}
        </motion.div>

        {/* ── Leyenda ── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 justify-center">
          {[
            { color: COLORS.winGreenBorder, label: 'Victoria' },
            { color: COLORS.lossRedBorder,  label: 'Derrota' },
            { color: COLORS.drawBlueBorder, label: 'Empate' },
            { color: COLORS.colombiaYellow, label: 'Mes en curso', dashed: false },
            { color: 'rgba(255,255,255,0.2)', label: 'Por jugar', dashed: true },
          ].map(({ color, label, dashed }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  border: `1.5px ${dashed ? 'dashed' : 'solid'} ${color}`,
                  background: 'transparent',
                }}
              />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Último highlight ── */}
        {lastHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="rounded-lg px-4 py-3 text-center mt-4"
            style={{
              background: 'rgba(252,209,22,0.06)',
              border: '1px solid rgba(252,209,22,0.12)',
            }}
          >
            <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              "{lastHighlight.highlight}"
            </p>
            <p
              className="text-[10px] mt-1 font-bold"
              style={{ color: COLORS.colombiaYellow, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}
            >
              — {lastHighlight.mes.toUpperCase()}
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
