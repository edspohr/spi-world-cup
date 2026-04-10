import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-6 px-4"
      style={{ background: 'linear-gradient(180deg, #003893 0%, #0A1628 100%)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
        {/* Franja tricolor Colombia */}
        <div className="flex w-full max-w-xs h-2 rounded-full overflow-hidden mb-1">
          <div className="flex-1" style={{ background: '#FCD116' }} />
          <div className="flex-1" style={{ background: '#003893' }} />
          <div className="flex-1" style={{ background: '#CE1126' }} />
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 1.2, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
          >
            <Trophy size={36} color="#FCD116" strokeWidth={2} />
          </motion.div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none"
                style={{ color: '#FCD116', textShadow: '0 2px 12px rgba(252,209,22,0.4)' }}>
              SPI World Cup
            </h1>
            <p className="text-sm font-bold tracking-[0.3em] uppercase mt-0.5"
               style={{ color: '#FFFFFF', opacity: 0.85 }}>
              2026 — SPI Americas
            </p>
          </div>

          <motion.div
            animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
            transition={{ duration: 1.2, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
          >
            <Trophy size={36} color="#FCD116" strokeWidth={2} />
          </motion.div>
        </div>

        <p className="text-xs font-medium tracking-widest uppercase"
           style={{ color: 'rgba(255,255,255,0.5)' }}>
          ⚽ La temporada más importante del año ⚽
        </p>
      </div>
    </motion.header>
  );
}
