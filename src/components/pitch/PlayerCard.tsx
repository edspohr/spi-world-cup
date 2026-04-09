import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types';
import { PlayerImage } from './PlayerImage';
import { COLORS } from '../../utils/constants';

interface Props {
  player: Player;
  index: number;
  isActive: boolean;
  onActivate: (id: number) => void;
  onDeactivate: () => void;
}

export function PlayerCard({ player, index, isActive, onActivate, onDeactivate }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on click-outside
  useEffect(() => {
    if (!isActive) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onDeactivate();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDeactivate();
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [isActive, onDeactivate]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ scale: 0, y: 15, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.04 * index,
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        cursor: 'pointer',
        position: 'relative',
        zIndex: isActive ? 50 : 2,
      }}
      onClick={() => isActive ? onDeactivate() : onActivate(player.id)}
    >
      {/* Popover */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              background: '#1A2A4A',
              border: '1px solid #FFD700',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.2)',
              padding: '10px 12px',
              minWidth: 130,
              zIndex: 100,
              pointerEvents: 'none',
            }}
          >
            {/* Foto grande */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <div
                style={{
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.gold}`,
                  boxShadow: '0 0 12px rgba(255,215,0,0.4)',
                  overflow: 'hidden',
                }}
              >
                <PlayerImage urlFoto={player.urlFoto} numero={player.numero} nombre={player.nombre} size={72} />
              </div>
            </div>

            {/* Número badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <span
                style={{
                  background: COLORS.gold,
                  color: COLORS.darkBg,
                  borderRadius: 20,
                  padding: '1px 8px',
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                #{player.numero}
              </span>
            </div>

            {/* Nombre */}
            <p
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 11,
                textAlign: 'center',
                lineHeight: 1.2,
                marginBottom: 2,
              }}
            >
              {player.nombre}
            </p>

            {/* Apodo */}
            <p
              style={{
                color: COLORS.colombiaYellow,
                fontStyle: 'italic',
                fontSize: 10,
                textAlign: 'center',
                marginBottom: 3,
              }}
            >
              "{player.apodo}"
            </p>

            {/* Posición */}
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 9,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {player.posicionCancha.replace(/_/g, ' ')}
            </p>

            {/* Flecha hacia abajo */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #FFD700',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Círculo del jugador */}
      <motion.div
        animate={{ scale: isActive ? 1.35 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ position: 'relative' }}
      >
        {/* Anillo dorado */}
        <div
          style={{
            borderRadius: '50%',
            border: `2px solid ${COLORS.gold}`,
            boxShadow: isActive
              ? `0 0 18px rgba(255,215,0,0.7)`
              : `0 0 8px rgba(255,215,0,0.3)`,
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <PlayerImage
            urlFoto={player.urlFoto}
            numero={player.numero}
            nombre={player.nombre}
            size={44}
          />
        </div>

        {/* Badge número (arriba-derecha) */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: COLORS.colombiaRed,
            border: '1.5px solid #0A1628',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
          }}
        >
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: 8,
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            {player.numero}
          </span>
        </div>
      </motion.div>

      {/* Apodo debajo — solo en desktop, oculto en mobile */}
      <p
        className="hidden sm:block"
        style={{
          fontSize: 9,
          color: '#FFFFFF',
          textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)',
          textAlign: 'center',
          maxWidth: 52,
          lineHeight: 1.1,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {player.apodo}
      </p>
    </motion.div>
  );
}
