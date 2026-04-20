import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MainScoreboard } from './components/scoreboard/MainScoreboard';
import { MonthTimeline } from './components/scoreboard/MonthTimeline';
import { MatchMinute } from './components/scoreboard/MatchMinute';
import { RecaudoChart } from './components/scoreboard/RecaudoChart';
import { CommentaryTicker } from './components/scoreboard/CommentaryTicker';
import { FootballPitch } from './components/pitch/FootballPitch';
import { GoalAnimation } from './components/effects/GoalAnimation';
import { Confetti } from './components/effects/Confetti';
import { useMatchData } from './hooks/useMatchData';
import { MonthResult } from './types';
import { TEAM_NAMES } from './utils/constants';
import { computeHonors } from './utils/honors';

// ── Web Audio goal sounds ─────────────────────────────────────────────────────
function playGoalSoundImpl(isAdversary: boolean) {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (!isAdversary) {
      // Ascending fanfare: C5 → E5 → G5
      [[523.25, 0], [659.25, 0.18], [783.99, 0.36]].forEach(([freq, when]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.22, ctx.currentTime + when);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + 0.35);
        osc.start(ctx.currentTime + when);
        osc.stop(ctx.currentTime + when + 0.38);
      });
    } else {
      // Descending tone: 420 → 280 Hz
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.78);
    }
  } catch { /* AudioContext blocked */ }
}

// ── Pantalla de carga ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#0A1628' }}
    >
      <motion.img
        src="/photos/logo.webp"
        alt="SPI Americas"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          height: 'clamp(40px, 6vw, 60px)',
          width: 'auto',
          filter: [
            'drop-shadow(1px 0 0 #fff)',
            'drop-shadow(-1px 0 0 #fff)',
            'drop-shadow(0 1px 0 #fff)',
            'drop-shadow(0 -1px 0 #fff)',
            'drop-shadow(2px 0 0 #fff)',
            'drop-shadow(-2px 0 0 #fff)',
            'drop-shadow(0 2px 0 #fff)',
            'drop-shadow(0 -2px 0 #fff)',
            'drop-shadow(0 0 16px rgba(252,209,22,0.35))',
          ].join(' '),
        }}
      />
      <div className="relative flex flex-col items-center" style={{ height: 100 }}>
        <motion.div
          animate={{ y: [0, -55, 0, -32, 0, -16, 0] }}
          transition={{
            duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6,
            times: [0, 0.22, 0.44, 0.6, 0.76, 0.88, 1],
          }}
          style={{ fontSize: 52, lineHeight: 1, willChange: 'transform' }}
        >
          ⚽
        </motion.div>
        <motion.div
          animate={{
            scaleX: [1, 0.55, 1, 0.65, 1, 0.75, 1],
            opacity: [0.45, 0.15, 0.45, 0.2, 0.45, 0.25, 0.45],
          }}
          transition={{
            duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6,
            times: [0, 0.22, 0.44, 0.6, 0.76, 0.88, 1],
          }}
          style={{
            width: 40, height: 8, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', marginTop: 4, willChange: 'transform, opacity',
          }}
        />
      </div>
      <motion.div
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="text-center"
      >
        <p className="text-lg font-bold" style={{ color: '#FCD116', fontFamily: 'Oswald, sans-serif' }}>
          Preparando el estadio...
        </p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          SPI Americas está calentando
        </p>
      </motion.div>
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #003893, #FCD116)' }}
        />
      </div>
    </motion.div>
  );
}

// ── Pantalla de error ─────────────────────────────────────────────────────────
function ErrorScreen({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#0A1628' }}
    >
      <p className="text-4xl">🚨</p>
      <p className="text-lg font-bold" style={{ color: '#CE1126' }}>Error al cargar los datos</p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{message}</p>
    </motion.div>
  );
}

// ── Separador tricolor ────────────────────────────────────────────────────────
function SectionSeparator() {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 my-1">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, #FCD116 20%, #003893 50%, #CE1126 80%, transparent)',
          opacity: 0.35,
          borderRadius: 1,
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}

// ── Floating section nav dots ─────────────────────────────────────────────────
const SECTIONS = [
  { id: 'section-scoreboard', label: 'Marcador' },
  { id: 'section-timeline',   label: 'Timeline'  },
  { id: 'section-pitch',      label: 'Cancha'    },
  { id: 'section-chart',      label: 'Recaudo'   },
];

function SectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 10, zIndex: 50,
      }}
    >
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            width: activeId === id ? 10 : 7,
            height: activeId === id ? 10 : 7,
            borderRadius: '50%',
            border: '2px solid rgba(252,209,22,0.5)',
            background: activeId === id ? '#FCD116' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s',
            padding: 0,
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── Milestone overlay ─────────────────────────────────────────────────────────
type MilestoneType = 'tie' | 'lead' | 'champion';

const MILESTONE_CONFIG: Record<MilestoneType, { icon: string; text: string; sub: string; confettiCount: number }> = {
  tie:      { icon: '🤝', text: '¡EMPATE!',          sub: 'El marcador está igualado',              confettiCount: 30 },
  lead:     { icon: '🔥', text: '¡VAMOS LIDERANDO!', sub: 'SPI Americas por encima del objetivo',   confettiCount: 80 },
  champion: { icon: '🏆', text: '¡CAMPEONES!',        sub: '¡SPI Americas superó el objetivo anual!', confettiCount: 80 },
};

interface MilestoneOverlayProps {
  milestone: MilestoneType | null;
  onDone: () => void;
}

function MilestoneOverlay({ milestone, onDone }: MilestoneOverlayProps) {
  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(onDone, milestone === 'champion' ? 5000 : 3200);
    return () => clearTimeout(t);
  }, [milestone, onDone]);

  return createPortal(
    <AnimatePresence>
      {milestone && (
        <motion.div
          key={milestone}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          style={{
            position: 'fixed', inset: 0, zIndex: 350,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}
        >
          <motion.div
            initial={{ scale: 0.55, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{ textAlign: 'center', padding: '40px 60px', pointerEvents: 'none' }}
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.7, repeat: 3 }}
              style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }}
            >
              {MILESTONE_CONFIG[milestone].icon}
            </motion.div>
            <p style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 700,
              color: '#FCD116',
              textShadow: '0 0 40px rgba(252,209,22,0.6)',
              letterSpacing: '0.04em',
            }}>
              {MILESTONE_CONFIG[milestone].text}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginTop: 8 }}>
              {MILESTONE_CONFIG[milestone].sub}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 16, letterSpacing: '0.1em' }}>
              TAP TO DISMISS
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── FAB buttons (sound + print) ───────────────────────────────────────────────
const fabStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  border: '1.5px solid rgba(252,209,22,0.4)',
  background: 'rgba(10,22,40,0.85)',
  backdropFilter: 'blur(4px)',
  fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
};

// ── App principal ─────────────────────────────────────────────────────────────
interface GoalEvent {
  teamName: string;
  monthName: string;
  isAdversary: boolean;
}

export default function App() {
  const { data, loading, error } = useMatchData();
  const honors = data ? computeHonors(data.resultados) : { mvpPlayerId: null, enLlamasPlayerId: null, racha: 0, lastClosedMes: null };

  const [showGoalOverlay, setShowGoalOverlay] = useState(false);
  const [goalData, setGoalData]  = useState<GoalEvent>({ teamName: '', monthName: '', isAdversary: false });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiCount, setConfettiCount] = useState(60);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const [milestone, setMilestone] = useState<MilestoneType | null>(null);
  const milestoneShownRef = useRef<Set<string>>(new Set());

  const [refreshToast, setRefreshToast] = useState(false);
  const prevScoreRef = useRef<{ spiGoles: number; realAdversidadGoles: number } | null>(null);

  const playingRef = useRef(false);
  const queueRef   = useRef<GoalEvent[]>([]);

  // ── Goal replay queue ──────────────────────────────────────────────────────
  const playNextGoal = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) { playingRef.current = false; return; }
    setGoalData(next);
    setShowGoalOverlay(true);
    if (soundEnabledRef.current) playGoalSoundImpl(next.isAdversary);
    const dur = next.isAdversary ? 2200 : 3600;
    if (!next.isAdversary) {
      setConfettiCount(60);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), dur + 900);
    }
    setTimeout(() => {
      setShowGoalOverlay(false);
      setTimeout(playNextGoal, 500);
    }, dur);
  }, []);

  const triggerReplay = useCallback(
    (result: MonthResult) => {
      if (playingRef.current) return;
      const events: GoalEvent[] = [];
      for (let i = 0; i < result.golesAFavor; i++)
        events.push({ teamName: TEAM_NAMES.home, monthName: result.mes, isAdversary: false });
      for (let i = 0; i < result.golesEnContra; i++)
        events.push({ teamName: TEAM_NAMES.away, monthName: result.mes, isAdversary: true });
      if (events.length === 0) return;
      playingRef.current = true;
      queueRef.current = [...events];
      playNextGoal();
    },
    [playNextGoal]
  );

  // ── Milestone detection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const { spiGoles, realAdversidadGoles } = data.marcadorGlobal;
    const allClosed = data.resultados.every(r => r.status === 'Cerrado');

    if (
      allClosed && spiGoles > realAdversidadGoles &&
      !milestoneShownRef.current.has('champion')
    ) {
      milestoneShownRef.current.add('champion');
      setConfettiCount(80);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
      setMilestone('champion');
    } else if (
      spiGoles > realAdversidadGoles &&
      !milestoneShownRef.current.has('lead')
    ) {
      milestoneShownRef.current.add('lead');
      setConfettiCount(80);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4500);
      setMilestone('lead');
    } else if (
      spiGoles === realAdversidadGoles && spiGoles > 0 &&
      !milestoneShownRef.current.has('tie')
    ) {
      milestoneShownRef.current.add('tie');
      setConfettiCount(30);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      setMilestone('tie');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.marcadorGlobal.spiGoles, data?.marcadorGlobal.realAdversidadGoles]);

  // ── Auto-refresh toast ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const score = data.marcadorGlobal;
    if (
      prevScoreRef.current !== null &&
      (score.spiGoles !== prevScoreRef.current.spiGoles ||
       score.realAdversidadGoles !== prevScoreRef.current.realAdversidadGoles)
    ) {
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3000);
    }
    prevScoreRef.current = score;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.marcadorGlobal.spiGoles, data?.marcadorGlobal.realAdversidadGoles]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingScreen key="loading" />
      ) : error ? (
        <ErrorScreen key="error" message={error} />
      ) : data ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          {/* Global effects */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 10%, rgba(0,56,147,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(252,209,22,0.06) 0%, transparent 50%)',
              zIndex: 0,
            }}
          />
          <GoalAnimation
            show={showGoalOverlay}
            teamName={goalData.teamName}
            monthName={goalData.monthName}
            isAdversary={goalData.isAdversary}
          />
          <Confetti show={showConfetti} count={confettiCount} />
          <MilestoneOverlay milestone={milestone} onDone={() => setMilestone(null)} />

          {/* Floating nav + FABs */}
          <SectionNav />

          <div className="no-print" style={{
            position: 'fixed', bottom: 20, right: 20,
            display: 'flex', flexDirection: 'column', gap: 8, zIndex: 50,
          }}>
            <motion.button
              whileHover={{ scale: 1.12, borderColor: 'rgba(252,209,22,0.9)' }}
              whileTap={{ scale: 0.92 }}
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
              onClick={() => setSoundEnabled(s => !s)}
              style={fabStyle}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.12, borderColor: 'rgba(252,209,22,0.9)' }}
              whileTap={{ scale: 0.92 }}
              title="Captura de pantalla"
              onClick={() => window.print()}
              style={fabStyle}
            >
              📸
            </motion.button>
          </div>

          {/* Auto-refresh toast */}
          <AnimatePresence>
            {refreshToast && (
              <motion.div
                key="refresh-toast"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  background: '#1A2A4A',
                  border: '1px solid #FCD116',
                  borderRadius: 30,
                  padding: '8px 20px',
                  color: '#FCD116',
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  zIndex: 100,
                  letterSpacing: '0.06em',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                🔄 ¡Marcador actualizado!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div
            className="min-h-screen flex flex-col relative"
            style={{ background: '#0A1628', zIndex: 1 }}
          >
            <div className="relative z-10 flex flex-col gap-5 pb-10">
              <Header />

              <div id="section-scoreboard" className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
                <MainScoreboard
                  marcadorGlobal={data.marcadorGlobal}
                  minutoActual={data.minutoActual}
                  resultados={data.resultados}
                />
                <MatchMinute
                  minutoActual={data.minutoActual}
                  resultados={data.resultados}
                />
              </div>

              <CommentaryTicker
                spiGoles={data.marcadorGlobal.spiGoles}
                realAdversidadGoles={data.marcadorGlobal.realAdversidadGoles}
                resultados={data.resultados}
              />

              <div id="section-timeline" className="w-full max-w-5xl mx-auto">
                <MonthTimeline
                  resultados={data.resultados}
                  onReplay={triggerReplay}
                />
              </div>

              <SectionSeparator />

              <div id="section-pitch">
                <FootballPitch
                  alineacion={data.alineacion}
                  mvpPlayerId={honors.mvpPlayerId}
                  enLlamasPlayerId={honors.enLlamasPlayerId}
                  mvpMes={honors.lastClosedMes}
                />
              </div>

              <SectionSeparator />

              <div id="section-chart">
                <RecaudoChart resultados={data.resultados} />
              </div>

              <Footer />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
