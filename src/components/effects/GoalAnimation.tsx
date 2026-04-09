import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  onComplete?: () => void;
}

export function GoalAnimation({ show, onComplete }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative">
            {/* Resplandor de fondo */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 0.8, repeat: 2 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(252,209,22,0.6) 0%, transparent 70%)',
                width: '300px',
                height: '300px',
                transform: 'translate(-50%, -50%) translate(50%, 50%)',
              }}
            />

            {/* Texto GOL */}
            <motion.div
              animate={{
                rotate: [-3, 3, -3, 3, 0],
                scale: [1, 1.1, 0.95, 1.05, 1],
              }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="relative text-center"
            >
              <p
                className="text-7xl md:text-9xl font-black tracking-tight"
                style={{
                  color: '#FCD116',
                  textShadow: '0 0 30px rgba(252,209,22,0.8), 0 4px 0 #CE1126, 4px 0 0 #003893',
                  WebkitTextStroke: '2px rgba(255,255,255,0.3)',
                }}
              >
                ¡GOL!
              </p>
              <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                ⚽ SPI Americas anota ⚽
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
