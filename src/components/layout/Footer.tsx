import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="w-full py-5 px-4 mt-8"
      style={{
        borderTop: '1px solid rgba(252,209,22,0.2)',
        background: 'rgba(0,56,147,0.15)',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/photos/logo.webp"
            alt="SPI Americas"
            style={{
              height: 28,
              width: 'auto',
              opacity: 0.95,
              filter: 'drop-shadow(1px 0 0 #fff) drop-shadow(-1px 0 0 #fff) drop-shadow(0 1px 0 #fff) drop-shadow(0 -1px 0 #fff) drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff)',
            }}
          />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Powered by{' '}
            <span style={{ color: '#FCD116' }} className="font-bold">
              Growth Buddies
            </span>{' '}
            🚀
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-1 w-12 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: '#FCD116' }} />
            <div className="flex-1" style={{ background: '#003893' }} />
            <div className="flex-1" style={{ background: '#CE1126' }} />
          </div>
          <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            v1.1.0 — Temporada 2026
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
