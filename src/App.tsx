import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MainScoreboard } from './components/scoreboard/MainScoreboard';
import { MonthTimeline } from './components/scoreboard/MonthTimeline';
import { MatchMinute } from './components/scoreboard/MatchMinute';
import { FootballPitch } from './components/pitch/FootballPitch';
import { GoalAnimation } from './components/effects/GoalAnimation';
import { Confetti } from './components/effects/Confetti';
import { useMatchData } from './hooks/useMatchData';
import { MonthResult } from './types';
import { TEAM_NAMES } from './utils/constants';

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
      {/* Pelota rebotando */}
      <div className="relative flex flex-col items-center" style={{ height: 100 }}>
        <motion.div
          animate={{ y: [0, -55, 0, -32, 0, -16, 0] }}
          transition={{
            duration: 1.8,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 0.6,
            times: [0, 0.22, 0.44, 0.6, 0.76, 0.88, 1],
          }}
          style={{ fontSize: 52, lineHeight: 1, willChange: 'transform' }}
        >
          ⚽
        </motion.div>

        {/* Sombra del rebote */}
        <motion.div
          animate={{
            scaleX: [1, 0.55, 1, 0.65, 1, 0.75, 1],
            opacity: [0.45, 0.15, 0.45, 0.2, 0.45, 0.25, 0.45],
          }}
          transition={{
            duration: 1.8,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 0.6,
            times: [0, 0.22, 0.44, 0.6, 0.76, 0.88, 1],
          }}
          style={{
            width: 40,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            marginTop: 4,
            willChange: 'transform, opacity',
          }}
        />
      </div>

      {/* Texto pulsante */}
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

      {/* Barra de carga */}
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

// ── Separador de sección ──────────────────────────────────────────────────────
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
          background:
            'linear-gradient(90deg, transparent, #FCD116 20%, #003893 50%, #CE1126 80%, transparent)',
          opacity: 0.35,
          borderRadius: 1,
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────
interface GoalEvent {
  teamName: string;
  monthName: string;
  isAdversary: boolean;
}

export default function App() {
  const { data, loading, error } = useMatchData();

  const [showGoalOverlay, setShowGoalOverlay] = useState(false);
  const [goalData, setGoalData] = useState<GoalEvent>({ teamName: '', monthName: '', isAdversary: false });
  const [showConfetti, setShowConfetti] = useState(false);

  const playingRef = useRef(false);
  const queueRef   = useRef<GoalEvent[]>([]);

  const playNextGoal = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      playingRef.current = false;
      return;
    }
    setGoalData(next);
    setShowGoalOverlay(true);
    const dur = next.isAdversary ? 2200 : 3600;
    if (!next.isAdversary) {
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
          {/* Efectos globales */}
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
          <Confetti show={showConfetti} />

          {/* Contenido */}
          <div
            className="min-h-screen flex flex-col relative"
            style={{ background: '#0A1628', zIndex: 1 }}
          >
            <div className="relative z-10 flex flex-col gap-5 pb-10">
              <Header />

              <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
                <MainScoreboard
                  marcadorGlobal={data.marcadorGlobal}
                  minutoActual={data.minutoActual}
                  resultados={data.resultados}
                />
                <MatchMinute
                  minutoActual={data.minutoActual}
                  resultados={data.resultados}
                />
                <MonthTimeline
                  resultados={data.resultados}
                  onReplay={triggerReplay}
                />
              </div>

              <SectionSeparator />

              <FootballPitch alineacion={data.alineacion} />

              <Footer />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
