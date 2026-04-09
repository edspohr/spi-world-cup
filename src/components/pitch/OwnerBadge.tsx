import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Player } from '../../types';

interface Props {
  owner: Player;
}

export function OwnerBadge({ owner }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(252,209,22,0.15) 0%, rgba(26,42,74,0.8) 100%)',
          border: '2px solid #FCD116',
          boxShadow: '0 0 20px rgba(252,209,22,0.25)',
        }}
      >
        {/* Corona animada */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <Crown size={20} color="#FCD116" fill="#FCD116" />
        </motion.div>

        <div>
          {/* Badge Dueña */}
          <div
            className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase tracking-widest"
            style={{ background: 'linear-gradient(90deg, #FCD116, #FFD700)', color: '#0A1628' }}
          >
            Dueña del Club
          </div>
          <p className="text-sm font-black leading-none" style={{ color: '#FFFFFF' }}>
            {owner.nombre}
          </p>
          <p className="text-xs font-semibold" style={{ color: '#FCD116' }}>
            "{owner.apodo}"
          </p>
        </div>

        {/* Avatar owner */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: owner.urlFoto
              ? `url(${owner.urlFoto}) center/cover`
              : 'linear-gradient(135deg, #FCD116, #FFD700)',
            border: '2px solid #FCD116',
            boxShadow: '0 0 12px rgba(252,209,22,0.4)',
          }}
        >
          {!owner.urlFoto && '👑'}
        </div>
      </div>
    </motion.div>
  );
}
