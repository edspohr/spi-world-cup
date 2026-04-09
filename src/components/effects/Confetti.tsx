import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

interface Props {
  show: boolean;
}

const COLORS = ['#FCD116', '#003893', '#CE1126', '#FFFFFF', '#FFD700'];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
  }));
}

export function Confetti({ show }: Props) {
  const piecesRef = useRef<ConfettiPiece[]>(generatePieces(40));

  useEffect(() => {
    if (show) {
      piecesRef.current = generatePieces(40);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {piecesRef.current.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: '-5vh',
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: 360 + Math.random() * 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              className="absolute"
              style={{
                width: piece.size,
                height: piece.size,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: piece.color,
                top: 0,
                left: 0,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
