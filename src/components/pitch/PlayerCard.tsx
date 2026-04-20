import { memo, useEffect, useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types';
import { PlayerImage } from './PlayerImage';
import { COLORS } from '../../utils/constants';

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function useResponsiveSize() {
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') return { circle: 44, badge: 18 };
    const w = window.innerWidth;
    if (w >= 1024) return { circle: 62, badge: 22 };
    if (w >= 768) return { circle: 48, badge: 18 };
    return { circle: 38, badge: 16 };
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      if (w >= 1024) setSize({ circle: 62, badge: 22 });
      else if (w >= 768) setSize({ circle: 48, badge: 18 });
      else setSize({ circle: 38, badge: 16 });
    };
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return size;
}

interface Props {
  player: Player;
  index: number;
  isActive: boolean;
  isBreathing?: boolean;
  onActivate: (id: number) => void;
  onDeactivate: () => void;
  isMvp?: boolean;
  isEnLlamas?: boolean;
  mvpMes?: string | null;
}

interface FixedPos {
  top: number;
  left: number;
  arrowLeft: number; // px offset from popover left edge for arrow
  arrowUp: boolean;
}

const POPOVER_W = 180;
const POPOVER_H = 250;

interface PopoverContentProps {
  player: Player;
  isMvp?: boolean;
  isEnLlamas?: boolean;
  mvpMes?: string | null;
}

function PopoverContent({ player, isMvp = false, isEnLlamas = false, mvpMes = null }: PopoverContentProps) {
  return (
    <>
      {(isMvp || isEnLlamas) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          {isMvp && (
            <span style={{
              background: 'rgba(255,215,0,0.18)',
              border: '1px solid rgba(255,215,0,0.55)',
              color: '#FFD700',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 10,
              letterSpacing: '0.08em',
            }}>
              👑 MVP{mvpMes ? ` · ${mvpMes.toUpperCase()}` : ''}
            </span>
          )}
          {isEnLlamas && (
            <span style={{
              background: 'rgba(251,146,60,0.18)',
              border: '1px solid rgba(251,146,60,0.6)',
              color: '#FB923C',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 10,
              letterSpacing: '0.08em',
            }}>
              🔥 EN LLAMAS
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{
          borderRadius: '50%',
          border: `2px solid ${COLORS.gold}`,
          boxShadow: '0 0 12px rgba(255,215,0,0.4)',
          overflow: 'hidden',
        }}>
          <PlayerImage urlFoto={player.urlFoto} numero={player.numero} nombre={player.nombre} size={72} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <span style={{
          background: COLORS.gold, color: COLORS.darkBg, borderRadius: 20,
          padding: '1px 8px', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13,
        }}>
          #{player.numero}
        </span>
      </div>
      <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 11, textAlign: 'center', lineHeight: 1.2, marginBottom: 2 }}>
        {player.nombre}
      </p>
      <p style={{ color: COLORS.colombiaYellow, fontStyle: 'italic', fontSize: 10, textAlign: 'center', marginBottom: 3 }}>
        "{player.apodo}"
      </p>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {player.posicionCancha.replace(/_/g, ' ')}
      </p>
    </>
  );
}

export const PlayerCard = memo(function PlayerCard({
  player,
  index,
  isActive,
  isBreathing = false,
  onActivate,
  onDeactivate,
  isMvp = false,
  isEnLlamas = false,
  mvpMes = null,
}: Props) {
  const isMobile = useIsMobile();
  const { circle: circleSize, badge: badgeSize } = useResponsiveSize();
  const isDesktop = circleSize >= 62;
  const cardRef   = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [fixedPos, setFixedPos] = useState<FixedPos | null>(null);

  // Compute viewport-clamped fixed position for desktop popover
  useLayoutEffect(() => {
    if (!isActive || isMobile) {
      setFixedPos(null);
      return;
    }
    if (!circleRef.current) return;
    const rect = circleRef.current.getBoundingClientRect();
    const PAD = 16;

    // Default: popover above circle
    let top = rect.top - POPOVER_H - 12;
    let arrowUp = false;

    // Flip below if not enough space above
    if (top < PAD) {
      top = rect.bottom + 12;
      arrowUp = true;
    }

    // Horizontal: center on circle
    let left = rect.left + rect.width / 2 - POPOVER_W / 2;
    if (left < PAD) left = PAD;
    else if (left + POPOVER_W > window.innerWidth - PAD) {
      left = window.innerWidth - PAD - POPOVER_W;
    }

    // Arrow points to circle center — recompute after clamping
    const circleCenterX = rect.left + rect.width / 2;
    let arrowLeft = circleCenterX - left;
    // Clamp arrow within popover bounds (12px from each edge)
    arrowLeft = Math.max(12, Math.min(POPOVER_W - 12, arrowLeft));

    setFixedPos({ top, left, arrowLeft, arrowUp });
  }, [isActive, isMobile]);

  // Click/touch outside (desktop only — mobile uses overlay)
  useEffect(() => {
    if (!isActive) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (isMobile) return;
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
  }, [isActive, isMobile, onDeactivate]);

  return (
    <>
      {/* ── Mobile: overlay + bottom sheet ───────────────────────────────────── */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div
                key="mob-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onDeactivate}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.58)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 200,
                }}
              />
              <motion.div
                key="mob-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                style={{
                  position: 'fixed', bottom: 0, left: 0, right: 0,
                  background: '#1A2A4A',
                  borderTop: `2px solid ${COLORS.gold}`,
                  borderRadius: '20px 20px 0 0',
                  padding: '16px 24px 36px',
                  zIndex: 201,
                  boxShadow: '0 -8px 40px rgba(0,0,0,0.65)',
                }}
              >
                {/* Grab handle */}
                <div style={{
                  width: 40, height: 4, borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                  margin: '0 auto 16px',
                }} />
                <PopoverContent player={player} isMvp={isMvp} isEnLlamas={isEnLlamas} mvpMes={mvpMes} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Desktop: fixed portal popover ────────────────────────────────────── */}
      {!isMobile && createPortal(
        <AnimatePresence>
          {isActive && fixedPos && (
            <motion.div
              key={`pop-${player.id}`}
              initial={{ scale: 0.85, opacity: 0, y: fixedPos.arrowUp ? -8 : 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: fixedPos.arrowUp ? -8 : 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{
                position: 'fixed',
                top: fixedPos.top,
                left: fixedPos.left,
                width: POPOVER_W,
                background: '#1A2A4A',
                border: '1px solid #FFD700',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.75), 0 0 24px rgba(255,215,0,0.2)',
                padding: '10px 12px',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <PopoverContent player={player} />
              {fixedPos.arrowUp ? (
                <div style={{
                  position: 'absolute', top: -6,
                  left: fixedPos.arrowLeft,
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                  borderBottom: '6px solid #FFD700',
                }} />
              ) : (
                <div style={{
                  position: 'absolute', bottom: -6,
                  left: fixedPos.arrowLeft,
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                  borderTop: '6px solid #FFD700',
                }} />
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Player token ─────────────────────────────────────────────────────── */}
      <motion.div
        animate={isBreathing && !isActive ? { scale: [1, 1.025, 1] } : { scale: 1 }}
        transition={
          isBreathing && !isActive
            ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
        style={{ willChange: 'transform' }}
      >
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
            willChange: 'transform, opacity',
          }}
          onClick={() => (isActive ? onDeactivate() : onActivate(player.id))}
          whileTap={{ scale: 0.92 }}
        >
          {/* Círculo */}
          <motion.div
            animate={{ scale: isActive ? 1.35 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ position: 'relative', willChange: 'transform' }}
          >
            {/* MVP halo pulsante */}
            {isMvp && !isActive && (
              <motion.div
                aria-hidden
                animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.15, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
                  pointerEvents: 'none',
                  willChange: 'transform, opacity',
                }}
              />
            )}

            {/* Corona MVP */}
            {isMvp && (
              <motion.div
                aria-hidden
                initial={{ y: 4, opacity: 0, rotate: -12 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4 + 0.04 * index, type: 'spring', stiffness: 240 }}
                style={{
                  position: 'absolute',
                  top: -Math.round(circleSize * 0.38),
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: Math.round(circleSize * 0.44),
                  lineHeight: 1,
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              >
                👑
              </motion.div>
            )}

            <div
              ref={circleRef}
              style={{
                borderRadius: '50%',
                border: `${isMvp ? 2.5 : 2}px solid ${isMvp ? '#FFD700' : isEnLlamas ? '#FB923C' : COLORS.gold}`,
                boxShadow: isActive
                  ? '0 0 18px rgba(255,215,0,0.7)'
                  : isMvp
                  ? '0 0 14px rgba(255,215,0,0.85), 0 0 4px rgba(255,215,0,0.5) inset'
                  : isEnLlamas
                  ? '0 0 14px rgba(251,146,60,0.8)'
                  : '0 0 8px rgba(255,215,0,0.3)',
                overflow: 'hidden',
                lineHeight: 0,
              }}
            >
              <PlayerImage urlFoto={player.urlFoto} numero={player.numero} nombre={player.nombre} size={circleSize} />
            </div>

            {/* Número badge */}
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: badgeSize, height: badgeSize, borderRadius: '50%',
              background: COLORS.colombiaRed, border: '1.5px solid #0A1628',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
            }}>
              <span style={{
                fontFamily: 'Oswald, sans-serif', fontWeight: 700,
                fontSize: badgeSize >= 22 ? 10 : badgeSize >= 18 ? 8 : 7,
                color: '#FFFFFF', lineHeight: 1,
              }}>
                {player.numero}
              </span>
            </div>

            {/* Fire badge "en llamas" */}
            {isEnLlamas && (
              <motion.div
                aria-hidden
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.12, 1], rotate: [-6, 6, -6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: -4,
                  width: badgeSize,
                  height: badgeSize,
                  borderRadius: '50%',
                  background: 'rgba(251,146,60,0.92)',
                  border: '1.5px solid #0A1628',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  boxShadow: '0 0 10px rgba(251,146,60,0.7)',
                  willChange: 'transform',
                }}
              >
                <span style={{ fontSize: badgeSize * 0.58, lineHeight: 1 }}>🔥</span>
              </motion.div>
            )}
          </motion.div>

          {/* Apodo — solo desktop (>= 1024px) */}
          {isDesktop && (
            <p style={{
              fontSize: 9,
              color: '#FFFFFF',
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)',
              textAlign: 'center',
              maxWidth: 64,
              lineHeight: 1.1,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {player.apodo}
            </p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
});
