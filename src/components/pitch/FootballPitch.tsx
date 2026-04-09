import { useState } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { CoachBadge } from './CoachBadge';
import { OwnerBadge } from './OwnerBadge';
import { POSITION_MAP } from '../../utils/constants';

interface Props {
  alineacion: Player[];
}

// ── SVG Cancha (top-down, landscape 3:2, ataque de abajo→arriba) ──────────────
function PitchSVG() {
  // viewBox: 900 × 600  (3:2)
  // Pitch inset: x=25, y=20, w=850, h=560
  const PX = 25, PY = 20, PW = 850, PH = 560;
  const cx = PX + PW / 2;
  const midY = PY + PH / 2;

  // Grass stripes (horizontal, 10 stripes)
  const stripeH = PH / 10;
  const stripes = Array.from({ length: 10 }, (_, i) => ({
    y: PY + i * stripeH,
    fill: i % 2 === 0 ? '#2D5A27' : '#3A7D32',
  }));

  // Penalty areas (top = ataque / bottom = defensa)
  const paW = 340, paH = 105;
  const saW = 150, saH = 55;
  const goalW = 100, goalH = 14;

  // Bottom (portero/defensa)
  const paBottomX = cx - paW / 2;
  const paBottomY = PY + PH - paH;
  const saBottomX = cx - saW / 2;
  const saBottomY = PY + PH - saH;
  const penBottomY = PY + PH - 88;

  // Top (ataque/delanteros)
  const paTopX = cx - paW / 2;
  const paTopY = PY;
  const saTopX = cx - saW / 2;
  const saTopY = PY;
  const penTopY = PY + 88;

  return (
    <svg
      viewBox="0 0 900 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ borderRadius: 8 }}
    >
      {/* Background */}
      <rect width="900" height="600" fill="#1A3A1A" />

      {/* Grass stripes */}
      {stripes.map((s, i) => (
        <rect key={i} x={PX} y={s.y} width={PW} height={stripeH + 0.5} fill={s.fill} />
      ))}

      {/* Lines */}
      <g stroke="#FFFFFF" strokeWidth="1.8" fill="none" opacity="0.85">
        {/* Outer boundary */}
        <rect x={PX} y={PY} width={PW} height={PH} />

        {/* Halfway line */}
        <line x1={PX} y1={midY} x2={PX + PW} y2={midY} />

        {/* Center circle + dot */}
        <circle cx={cx} cy={midY} r={52} />
        <circle cx={cx} cy={midY} r={3} fill="#FFFFFF" stroke="none" />

        {/* ── Bottom (portero) area ── */}
        <rect x={paBottomX} y={paBottomY} width={paW} height={paH} />
        <rect x={saBottomX} y={saBottomY} width={saW} height={saH} />
        <circle cx={cx} cy={penBottomY} r={3} fill="#FFFFFF" stroke="none" />
        {/* Penalty arc */}
        <path
          d={`M ${paBottomX} ${paBottomY} A 55 55 0 0 0 ${paBottomX + paW} ${paBottomY}`}
          strokeDasharray="0"
          fill="none"
        />

        {/* ── Top (ataque) area ── */}
        <rect x={paTopX} y={paTopY} width={paW} height={paH} />
        <rect x={saTopX} y={saTopY} width={saW} height={saH} />
        <circle cx={cx} cy={penTopY} r={3} fill="#FFFFFF" stroke="none" />

        {/* Corner arcs */}
        <path d={`M ${PX} ${PY + 12} A 12 12 0 0 1 ${PX + 12} ${PY}`} />
        <path d={`M ${PX + PW - 12} ${PY} A 12 12 0 0 1 ${PX + PW} ${PY + 12}`} />
        <path d={`M ${PX} ${PY + PH - 12} A 12 12 0 0 0 ${PX + 12} ${PY + PH}`} />
        <path d={`M ${PX + PW - 12} ${PY + PH} A 12 12 0 0 0 ${PX + PW} ${PY + PH - 12}`} />
      </g>

      {/* Goals (porterías) — rendered outside pitch lines as reference */}
      <g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
        {/* Bottom goal */}
        <rect x={cx - goalW / 2} y={PY + PH} width={goalW} height={goalH} rx="2" />
        {/* Top goal */}
        <rect x={cx - goalW / 2} y={PY - goalH} width={goalW} height={goalH} rx="2" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function FootballPitch({ alineacion }: Props) {
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);

  const titulares = alineacion.filter(p => p.rol === 'Titular');
  const coach = alineacion.find(p => p.rol === 'Profe');
  const owner = alineacion.find(p => p.rol === 'Dueña del Club');

  // Validate positions and warn on mismatches
  const playersOnPitch = titulares.map(player => {
    const pos = POSITION_MAP[player.posicionCancha];
    if (!pos) {
      console.warn(
        `[FootballPitch] posicionCancha desconocida: "${player.posicionCancha}" para ${player.nombre}. ` +
          `Usando fallback Portero.`
      );
    }
    return { player, pos: pos ?? POSITION_MAP['Portero'] };
  });

  const handleActivate = (id: number) => setActivePlayerId(id);
  const handleDeactivate = () => setActivePlayerId(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      className="w-full max-w-5xl mx-auto px-3 sm:px-6"
    >
      {/* ── Título ── */}
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

      {/* ── Owner: centrado encima de todo ── */}
      {owner && (
        <div className="flex justify-center mb-4">
          <OwnerBadge owner={owner} />
        </div>
      )}

      {/* ── Fila principal: Coach | Cancha ── */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {/* CoachBadge — a la izquierda en desktop, centrado arriba en mobile */}
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
            boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,56,147,0.1)',
            overflow: 'visible',
          }}
        >
          {/* aspect-ratio 3:2 */}
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
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensaje de refuerzo */}
      <p
        className="text-center mt-3 text-xs uppercase tracking-widest font-bold"
        style={{ color: 'rgba(252,209,22,0.45)' }}
      >
        Todos en cancha · Todos titulares · 23/23
      </p>
    </motion.section>
  );
}
