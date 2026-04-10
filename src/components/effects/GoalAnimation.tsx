import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  teamName?: string;
  monthName?: string;
  isAdversary?: boolean;
}

export const GoalAnimation = memo(function GoalAnimation({
  show,
  teamName = 'SPI Americas',
  monthName = '',
  isAdversary = false,
}: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="goal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: isAdversary ? 'rgba(80,0,0,0.68)' : 'rgba(0,0,0,0.75)',
            willChange: 'opacity',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center px-4 relative" style={{ maxWidth: '90vw' }}>
            {/* Halo glow — SPI goal only */}
            {!isAdversary && (
              <motion.div
                className="absolute pointer-events-none"
                animate={{ scale: [1, 1.8, 1], opacity: [0.25, 0.05, 0.25] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  inset: '-60%',
                  background:
                    'radial-gradient(circle at 50% 45%, rgba(252,209,22,0.45) 0%, transparent 60%)',
                  willChange: 'transform, opacity',
                }}
              />
            )}

            {/* Main text: ¡GOOOOL! or adversary */}
            <motion.p
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.45, 0.9, 1.08, 0.96, 1.0],
                opacity: [0, 1, 1, 1, 1, 1],
              }}
              transition={{
                duration: 0.65,
                ease: 'easeOut',
                times: [0, 0.35, 0.55, 0.7, 0.85, 1.0],
              }}
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: isAdversary
                  ? 'clamp(1.8rem, 7vw, 3.5rem)'
                  : 'clamp(3.5rem, 13vw, 8rem)',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: isAdversary ? '#CE1126' : '#FCD116',
                textShadow: isAdversary
                  ? '0 0 24px rgba(206,17,38,0.5), 0 2px 8px rgba(0,0,0,0.6)'
                  : '3px 3px 0 #CE1126, 6px 6px 0 #003893, 0 0 40px rgba(252,209,22,0.5)',
                WebkitTextStroke: isAdversary ? 'none' : '1.5px rgba(255,255,255,0.2)',
                willChange: 'transform, opacity',
              }}
            >
              {isAdversary ? `😤 Gol de ${teamName}` : '¡GOOOOL!'}
            </motion.p>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
              style={{
                color: isAdversary ? 'rgba(255,120,120,0.85)' : '#FFFFFF',
                fontSize: 'clamp(0.85rem, 2.5vw, 1.25rem)',
                fontWeight: 600,
                marginTop: 14,
                textShadow: '0 2px 10px rgba(0,0,0,0.7)',
                willChange: 'transform, opacity',
              }}
            >
              {isAdversary
                ? `En ${monthName}`
                : `⚽ ${teamName} anota en ${monthName}`}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
