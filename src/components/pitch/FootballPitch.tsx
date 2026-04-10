import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { CoachBadge } from './CoachBadge';
import { OwnerBadge } from './OwnerBadge';
import { POSITION_MAP } from '../../utils/constants';

interface Props {
  alineacion: Player[];
}

// Posiciones de desbordamiento para jugadores cuya Posicion_Cancha no esté en POSITION_MAP
const OVERFLOW_POSITIONS: { x: string; y: string }[] = [
  { x: '30%', y: '46%' },
  { x: '70%', y: '46%' },
  { x: '20%', y: '33%' },
  { x: '80%', y: '33%' },
  { x: '40%', y: '20%' },
  { x: '60%', y: '20%' },
  { x: '30%', y: '70%' },
  { x: '70%', y: '70%' },
  { x: '50%', y: '46%' },
];

// ── SVG Cancha (top-down, landscape 3:2) ──────────────────────────────────────
const PitchSVG = memo(function PitchSVG() {
  const PX = 25, PY = 20, PW = 850, PH = 560;
  const cx = PX + PW / 2;
  const midY = PY + PH / 2;
  const stripeH = PH / 10;

  const paW = 340, paH = 105;
  const saW = 150, saH = 55;
  const goalW = 100, goalH = 14;

  return (
    <svg
      viewBox="0 0 900 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ borderRadius: 8 }}
    >
      <rect width="900" height="600" fill="#1A3A1A" />

      {/* Grass stripes */}
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={PX} y={PY + i * stripeH} width={PW} height={stripeH + 0.5}
          fill={i % 2 === 0 ? '#2D5A27' : '#3A7D32'} />
      ))}

      {/* Field lines */}
      <g stroke="#FFFFFF" strokeWidth="1.8" fill="none" opacity="0.85">
        <rect x={PX} y={PY} width={PW} height={PH} />
        <line x1={PX} y1={midY} x2={PX + PW} y2={midY} />
        <circle cx={cx} cy={midY} r={52} />
        <circle cx={cx} cy={midY} r={3} fill="#FFFFFF" stroke="none" />

        {/* Bottom (portero) */}
        <rect x={cx - paW / 2} y={PY + PH - paH} width={paW} height={paH} />
        <rect x={cx - saW / 2} y={PY + PH - saH} width={saW} height={saH} />
        <circle cx={cx} cy={PY + PH - 88} r={3} fill="#FFFFFF" stroke="none" />
        <path d={`M ${cx - paW / 2} ${PY + PH - paH} A 55 55 0 0 0 ${cx + paW / 2} ${PY + PH - paH}`} />

        {/* Top (ataque) */}
        <rect x={cx - paW / 2} y={PY} width={paW} height={paH} />
        <rect x={cx - saW / 2} y={PY} width={saW} height={saH} />
        <circle cx={cx} cy={PY + 88} r={3} fill="#FFFFFF" stroke="none" />

        {/* Corner arcs */}
        <path d={`M ${PX} ${PY + 12} A 12 12 0 0 1 ${PX + 12} ${PY}`} />
        <path d={`M ${PX + PW - 12} ${PY} A 12 12 0 0 1 ${PX + PW} ${PY + 12}`} />
        <path d={`M ${PX} ${PY + PH - 12} A 12 12 0 0 0 ${PX + 12} ${PY + PH}`} />
        <path d={`M ${PX + PW - 12} ${PY + PH} A 12 12 0 0 0 ${PX + PW} ${PY + PH - 12}`} />
      </g>

      {/* Goals */}
      <g fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8">
        <rect x={cx - goalW / 2} y={PY + PH} width={goalW} height={goalH} rx="2" />
        <rect x={cx - goalW / 2} y={PY - goalH} width={goalW} height={goalH} rx="2" />
      </g>
    </svg>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

export function FootballPitch({ alineacion }: Props) {
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [breathingIds, setBreathingIds] = useState<Set<number>>(new Set());

  const coach =
    alineacion.find(p => p.rol === 'Profe') ??
    alineacion.find(p => p.posicionCancha === 'Director_Tecnico');
  const owner =
    alineacion.find(p => p.rol === 'Dueña del Club') ??
    alineacion.find(p => p.posicionCancha === 'Palco_VIP');

  const coachOrOwnerIds = new Set([coach?.id, owner?.id].filter(Boolean) as number[]);
  const titulares = alineacion.filter(
    p => p.rol === 'Titular' && !coachOrOwnerIds.has(p.id)
  );

  let overflowIndex = 0;
  const playersOnPitch = titulares.map(player => {
    const pos = POSITION_MAP[player.posicionCancha];
    if (!pos) {
      const slot = OVERFLOW_POSITIONS[overflowIndex % OVERFLOW_POSITIONS.length];
      console.warn(
        `[FootballPitch] Player "${player.nombre}" has unrecognized position '${player.posicionCancha}', assigned to overflow slot ${overflowIndex + 1}`
      );
      overflowIndex++;
      return { player, pos: slot };
    }
    return { player, pos };
  });

  // Idle breathing — cycles 2–3 random players every 4s
  useEffect(() => {
    if (playersOnPitch.length === 0) return;
    const cycle = () => {
      const count = Math.min(3, playersOnPitch.length);
      const ids = playersOnPitch.map(p => p.player.id);
      const chosen = new Set<number>();
      while (chosen.size < count) {
        chosen.add(ids[Math.floor(Math.random() * ids.length)]);
      }
      setBreathingIds(chosen);
    };
    cycle();
    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, [playersOnPitch.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActivate   = (id: number) => setActivePlayerId(id);
  const handleDeactivate = () => setActivePlayerId(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto px-3 sm:px-6"
    >
      {/* Título */}
      <h2
        className="text-center mb-4"
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          color: '#FCD116',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(252,209,22,0.3)',
        }}
      >
        ⚽ La Selección SPI
      </h2>

      {/* OwnerBadge — centrada arriba */}
      {owner && (
        <div className="flex justify-center mb-4">
          <OwnerBadge owner={owner} />
        </div>
      )}

      {/* Fila: CoachBadge | Cancha */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {coach && (
          <div className="flex-shrink-0 md:self-center">
            <CoachBadge coach={coach} />
          </div>
        )}

        {/* Cancha */}
        <div
          className="flex-1 w-full"
          style={{
            borderRadius: 12,
            border: '3px solid #1A3A1A',
            boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,56,147,0.08)',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '66.67%',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <PitchSVG />

            {/* Grass shimmer overlay */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.025) 50%, transparent 75%)',
                backgroundSize: '250% 100%',
                pointerEvents: 'none',
                zIndex: 1,
                borderRadius: 8,
                willChange: 'background-position',
              }}
              animate={{ backgroundPosition: ['250% 0%', '-250% 0%'] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            />

            {/* Jugadores */}
            {playersOnPitch.map(({ player, pos }, i) => (
              <div
                key={player.id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: activePlayerId === player.id ? 50 : 2,
                }}
              >
                <PlayerCard
                  player={player}
                  index={i}
                  isActive={activePlayerId === player.id}
                  isBreathing={breathingIds.has(player.id) && activePlayerId !== player.id}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensaje de refuerzo */}
      <p className="text-center mt-3 text-xs uppercase tracking-widest font-bold"
        style={{ color: 'rgba(252,209,22,0.4)' }}>
        Todos en cancha · Todos titulares · 23/23
      </p>
    </motion.section>
  );
}
