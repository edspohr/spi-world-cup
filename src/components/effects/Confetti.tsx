import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Shape = 'circle' | 'square' | 'tape';

interface ConfettiPiece {
  id: number;
  startX: number;   // initial left% (near center, 35–65%)
  driftX: number;   // horizontal drift in vw (-50 to +50)
  color: string;
  delay: number;
  duration: number;
  width: number;
  height: number;
  shape: Shape;
  rotation: number;
}

const COLOMBIA_COLORS = ['#FCD116', '#003893', '#CE1126'];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const shape: Shape = (['circle', 'square', 'tape'] as Shape[])[i % 3];
    const baseSize = 5 + Math.random() * 9;
    return {
      id: i,
      startX: 35 + Math.random() * 30,
      driftX: (Math.random() - 0.5) * 120,
      color: COLOMBIA_COLORS[i % 3],
      delay: Math.random() * 0.9,
      duration: 2.4 + Math.random() * 1.6,
      width: shape === 'tape' ? Math.max(3, baseSize * 0.4) : baseSize,
      height: shape === 'tape' ? baseSize * 2.2 : baseSize,
      shape,
      rotation: (Math.random() - 0.5) * 900,
    };
  });
}

function borderRadius(shape: Shape) {
  if (shape === 'circle') return '50%';
  if (shape === 'tape') return '1px';
  return '2px';
}

interface Props {
  show: boolean;
}

export const Confetti = memo(function Confetti({ show }: Props) {
  const piecesRef = useRef<ConfettiPiece[]>(generatePieces(60));

  useEffect(() => {
    if (show) piecesRef.current = generatePieces(60);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {piecesRef.current.map((piece) => (
            <motion.div
              key={piece.id}
              style={{
                position: 'absolute',
                left: `${piece.startX}%`,
                top: 0,
                width: piece.width,
                height: piece.height,
                borderRadius: borderRadius(piece.shape),
                background: piece.color,
                willChange: 'transform, opacity',
              }}
              initial={{ y: '-8vh', x: '0vw', rotate: 0, opacity: 1 }}
              animate={{
                y: '115vh',
                x: `${piece.driftX}vw`,
                rotate: piece.rotation,
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.08, 0.3, 0.8, 1],
                opacity: {
                  duration: piece.duration,
                  times: [0, 0.5, 0.78, 1],
                  ease: 'linear',
                  delay: piece.delay,
                },
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
});
