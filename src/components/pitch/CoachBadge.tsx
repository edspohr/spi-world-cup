import { motion } from 'framer-motion';
import { Player } from '../../types';

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
      className="flex items-center gap-3 cursor-pointer"
    >
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(0,56,147,0.6) 0%, rgba(26,42,74,0.8) 100%)',
          border: '2px solid #003893',
          boxShadow: '0 0 16px rgba(0,56,147,0.4)',
        }}
      >
        {/* Avatar DT */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
          style={{
            background: coach.urlFoto
              ? `url(${coach.urlFoto}) center/cover`
              : 'linear-gradient(135deg, #003893, #001850)',
            border: '2px solid #FCD116',
          }}
        >
          {!coach.urlFoto && '🎯'}
        </div>

        <div>
          {/* Badge DT */}
          <div
            className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase tracking-widest"
            style={{ background: '#FCD116', color: '#003893' }}
          >
            Director Técnico
          </div>
          <p className="text-sm font-black leading-none" style={{ color: '#FFFFFF' }}>
            {coach.nombre}
          </p>
          <p className="text-xs font-semibold" style={{ color: '#FCD116' }}>
            "{coach.apodo}"
          </p>
        </div>

        {/* Número */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: '#003893', border: '1.5px solid #FCD116', color: '#FCD116' }}
        >
          {coach.numero}
        </div>
      </div>
    </motion.div>
  );
}
