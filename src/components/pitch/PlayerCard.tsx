import { motion } from 'framer-motion';
import { Player } from '../../types';

interface Props {
  player: Player;
  index: number;
}

export function PlayerCard({ player, index }: Props) {
  const isBanca = player.posicionCancha.startsWith('Banca');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
      whileHover={{ scale: 1.12, zIndex: 10 }}
      className="flex flex-col items-center gap-1 cursor-pointer relative"
    >
      {/* Número de camiseta */}
      <div className="relative">
        <div
          className="rounded-full flex items-center justify-center font-black text-sm shadow-lg"
          style={{
            width: isBanca ? '36px' : '44px',
            height: isBanca ? '36px' : '44px',
            background: player.urlFoto
              ? `url(${player.urlFoto}) center/cover`
              : 'linear-gradient(135deg, #003893 0%, #FCD116 100%)',
            border: `2px solid ${isBanca ? 'rgba(252,209,22,0.4)' : '#FCD116'}`,
            boxShadow: isBanca ? 'none' : '0 0 12px rgba(252,209,22,0.35)',
            color: '#FFFFFF',
          }}
        >
          {!player.urlFoto && (
            <span style={{ fontSize: isBanca ? '12px' : '14px' }}>
              {player.numero}
            </span>
          )}
        </div>

        {/* Badge de posición */}
        <div
          className="absolute -bottom-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold"
          style={{ background: '#CE1126', border: '1px solid #0A1628', color: '#FFFFFF' }}
        >
          {player.numero}
        </div>
      </div>

      {/* Apodo */}
      <div className="text-center max-w-[56px]">
        <p
          className="font-bold leading-none truncate"
          style={{
            fontSize: isBanca ? '8px' : '9px',
            color: '#FCD116',
          }}
        >
          {player.apodo}
        </p>
        <p
          className="leading-none truncate mt-0.5"
          style={{
            fontSize: '7px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {player.nombre.split(' ')[0]}
        </p>
      </div>
    </motion.div>
  );
}
