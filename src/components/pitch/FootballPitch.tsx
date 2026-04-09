import { motion } from 'framer-motion';
import { Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { CoachBadge } from './CoachBadge';
import { OwnerBadge } from './OwnerBadge';

interface Props {
  alineacion: Player[];
}

// Posiciones relativas en la cancha [x%, y%]
const POSITION_MAP: Record<string, [number, number]> = {
  Portero: [50, 88],
  Defensa_Izq: [12, 70],
  Defensa_CentroIzq: [33, 70],
  Defensa_CentroDer: [57, 70],
  Defensa_Der: [84, 70],
  Mediocampo_Izq: [12, 52],
  Mediocampo_Centro: [50, 52],
  Mediocampo_Der: [84, 52],
  Mediocampo_OfensivoIzq: [22, 34],
  Mediocampo_OfensivoCentro: [50, 34],
  Mediocampo_OfensivoDer: [76, 34],
  Delantero_Izq: [20, 14],
  Delantero_Centro: [50, 14],
  Delantero_Der: [80, 14],
};

function PitchSVG() {
  return (
    <svg
      viewBox="0 0 400 550"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Fondo de la cancha */}
      <defs>
        <pattern id="grass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#2D5A27" />
          <rect width="40" height="20" fill="#3A7D32" />
        </pattern>
      </defs>
      <rect width="400" height="550" fill="url(#grass)" rx="4" />

      {/* Líneas del campo */}
      <g stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.7">
        {/* Borde */}
        <rect x="20" y="20" width="360" height="510" rx="2" />
        {/* Línea de medio campo */}
        <line x1="20" y1="275" x2="380" y2="275" />
        {/* Círculo central */}
        <circle cx="200" cy="275" r="50" />
        <circle cx="200" cy="275" r="3" fill="#FFFFFF" />

        {/* Área grande local (abajo) */}
        <rect x="90" y="430" width="220" height="100" />
        {/* Área pequeña local */}
        <rect x="145" y="470" width="110" height="60" />
        {/* Punto penal local */}
        <circle cx="200" cy="460" r="3" fill="#FFFFFF" />

        {/* Área grande visitante (arriba) */}
        <rect x="90" y="20" width="220" height="100" />
        {/* Área pequeña visitante */}
        <rect x="145" y="20" width="110" height="60" />
        {/* Punto penal visitante */}
        <circle cx="200" cy="90" r="3" fill="#FFFFFF" />

        {/* Portería local */}
        <rect x="165" y="528" width="70" height="14" />
        {/* Portería visitante */}
        <rect x="165" y="8" width="70" height="14" />
      </g>
    </svg>
  );
}

export function FootballPitch({ alineacion }: Props) {
  const titulares = alineacion.filter(p => p.rol === 'Titular' && !p.posicionCancha.startsWith('Banca'));
  const banca = alineacion.filter(p => p.posicionCancha.startsWith('Banca'));
  const coach = alineacion.find(p => p.rol === 'Profe');
  const owner = alineacion.find(p => p.rol === 'Dueña del Club');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '2px solid #003893',
          boxShadow: '0 0 40px rgba(0,56,147,0.3), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header de la sección */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ background: 'rgba(0,56,147,0.8)', borderBottom: '1px solid rgba(0,56,147,0.4)' }}
        >
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#FCD116' }}>
            ⚽ Alineación — SPI Americas
          </span>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Formación 4-3-3
          </span>
        </div>

        {/* Cancha */}
        <div className="relative" style={{ paddingBottom: '138%' }}>
          <PitchSVG />

          {/* Jugadores titulares sobre la cancha */}
          {titulares.map((player, i) => {
            const pos = POSITION_MAP[player.posicionCancha];
            if (!pos) return null;
            const [x, y] = pos;
            return (
              <div
                key={player.id}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                }}
              >
                <PlayerCard player={player} index={i} />
              </div>
            );
          })}
        </div>

        {/* Banca de suplentes */}
        <div
          className="px-4 py-4"
          style={{
            background: 'rgba(10,22,40,0.95)',
            borderTop: '1px solid rgba(0,56,147,0.4)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Banca de Suplentes
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {banca.map((player, i) => (
              <PlayerCard key={player.id} player={player} index={titulares.length + i} />
            ))}
          </div>
        </div>

        {/* Zona técnica y palco VIP */}
        <div
          className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            background: 'rgba(0,56,147,0.15)',
            borderTop: '1px solid rgba(252,209,22,0.15)',
          }}
        >
          {coach && <CoachBadge coach={coach} />}
          {owner && <OwnerBadge owner={owner} />}
        </div>
      </div>
    </motion.section>
  );
}
