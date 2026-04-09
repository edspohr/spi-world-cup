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
      style={{ cursor: 'pointer' }}
    >
      {/* Oscillating wrapper — like pacing the sideline */}
      <motion.div
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          style={{
            background: COLORS.colombiaBlue,
            border: `2px solid ${COLORS.gold}`,
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            minWidth: 90,
            boxShadow: `0 0 20px rgba(0,56,147,0.5)`,
          }}
        >
          {/* Icono pizarra */}
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
            <PlayerImage urlFoto={coach.urlFoto} numero={coach.numero} nombre={coach.nombre} size={40} />
          </div>

          {/* Etiqueta DT */}
          <div
            style={{
              background: COLORS.gold,
              color: COLORS.colombiaBlue,
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            DT
          </div>

          {/* Nombre */}
          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 11,
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {coach.nombre}
          </p>

          {/* Apodo */}
          <p
            style={{
              color: COLORS.colombiaYellow,
              fontStyle: 'italic',
              fontSize: 10,
              textAlign: 'center',
            }}
          >
            "{coach.apodo}"
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
