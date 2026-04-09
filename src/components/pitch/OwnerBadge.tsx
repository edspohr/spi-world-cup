import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Player } from '../../types';
import { PlayerImage } from './PlayerImage';
import { COLORS } from '../../utils/constants';

interface Props {
  owner: Player;
}

// Shimmer that travels around the border via background-position
function ShimmerBorder() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: -2,
        borderRadius: 16,
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.6) 40%, rgba(255,255,255,0.8) 50%, rgba(255,215,0,0.6) 60%, transparent 100%)',
        backgroundSize: '200% 100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
        maskImage:
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        maskComposite: 'exclude',
        WebkitMaskImage:
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        padding: 2,
      }}
      animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function OwnerBadge({ owner }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      whileHover={{ scale: 1.05 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      {/* Corona flotante */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Crown size={22} color={COLORS.gold} fill={COLORS.gold} />
      </motion.div>

      {/* Badge */}
      <div style={{ position: 'relative' }}>
        <ShimmerBorder />
        <div
          style={{
            background: 'linear-gradient(135deg, #1A2A4A 0%, #0A1628 100%)',
            border: `3px solid ${COLORS.gold}`,
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            position: 'relative',
            zIndex: 1,
            boxShadow: `0 0 24px rgba(255,215,0,0.25), 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Foto */}
          <div
            style={{
              borderRadius: '50%',
              border: `2px solid ${COLORS.gold}`,
              boxShadow: '0 0 12px rgba(255,215,0,0.4)',
              lineHeight: 0,
            }}
          >
            <PlayerImage urlFoto={owner.urlFoto} numero={owner.numero} nombre={owner.nombre} size={42} />
          </div>

          {/* Textos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                color: COLORS.gold,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Presidenta del Club
            </span>
            <p
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 1.2,
              }}
            >
              {owner.nombre}
            </p>
            <p
              style={{
                color: COLORS.gold,
                fontStyle: 'italic',
                fontSize: 10,
              }}
            >
              "{owner.apodo}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
