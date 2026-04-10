import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { Player } from '../../types';
import { PlayerImage } from './PlayerImage';
import { COLORS } from '../../utils/constants';

interface Props {
  coach: Player;
}

export function CoachBadge({ coach }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      whileHover={{ scale: 1.05 }}
      style={{ cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
    >
      {/* Etiqueta superior */}
      <p style={{
        color: 'rgba(252,209,22,0.55)',
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        Director Técnico
      </p>

      {/* Oscillating badge — like pacing the sideline */}
      <motion.div
        animate={{ x: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          style={{
            background: 'linear-gradient(160deg, #003893 0%, #001F5C 100%)',
            border: `2px solid ${COLORS.gold}`,
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            minWidth: 120,
            boxShadow: `0 0 20px rgba(0,56,147,0.55), 0 4px 16px rgba(0,0,0,0.4)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Tactical dashed line across badge top */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(252,209,22,0.4) 4px, rgba(252,209,22,0.4) 8px)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Clipboard icon */}
          <ClipboardList size={18} color={COLORS.gold} />

          {/* Foto DT */}
          <div
            style={{
              borderRadius: '50%',
              border: `2px solid ${COLORS.gold}`,
              boxShadow: '0 0 10px rgba(255,215,0,0.3)',
              lineHeight: 0,
            }}
          >
            <PlayerImage urlFoto={coach.urlFoto} numero={coach.numero} nombre={coach.nombre} size={44} />
          </div>

          {/* Etiqueta DT */}
          <div
            style={{
              background: COLORS.gold,
              color: COLORS.colombiaBlue,
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            DT
          </div>

          {/* Nombre */}
          <p style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 11,
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            {coach.nombre}
          </p>

          {/* Apodo */}
          <p style={{
            color: COLORS.colombiaYellow,
            fontStyle: 'italic',
            fontSize: 10,
            textAlign: 'center',
          }}>
            "{coach.apodo}"
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
