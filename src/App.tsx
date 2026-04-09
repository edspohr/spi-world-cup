import { useState } from 'react';
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

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#0A1628' }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="text-5xl"
      >
        ⚽
      </motion.div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: '#FCD116' }}>
          Cargando partido...
        </p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          SPI Americas está calentando
        </p>
      </div>
      {/* Barra de carga */}
      <div
        className="w-48 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #003893, #FCD116)' }}
        />
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#0A1628' }}
    >
      <p className="text-4xl">🚨</p>
      <p className="text-lg font-bold" style={{ color: '#CE1126' }}>
        Error al cargar los datos
      </p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {message}
      </p>
    </div>
  );
}

export default function App() {
  const { data, loading, error } = useMatchData();
  const [showGoal, setShowGoal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!data) return null;

  const handleGoalDemo = () => {
    setShowGoal(true);
    setShowConfetti(true);
    setTimeout(() => setShowGoal(false), 3000);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A1628' }}
    >
      {/* Efectos de fondo */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(0,56,147,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(252,209,22,0.06) 0%, transparent 50%)',
          zIndex: 0,
        }}
      />

      {/* Efectos visuales */}
      <GoalAnimation show={showGoal} />
      <Confetti show={showConfetti} />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col gap-6 pb-8">
        <Header />

        <AnimatePresence>
          <div className="flex flex-col gap-5">
            <MainScoreboard
              marcadorGlobal={data.marcadorGlobal}
              minutoActual={data.minutoActual}
              resultados={data.resultados}
            />
            <MatchMinute
              minutoActual={data.minutoActual}
              resultados={data.resultados}
            />
            <MonthTimeline resultados={data.resultados} />
            <FootballPitch alineacion={data.alineacion} />
          </div>
        </AnimatePresence>

        {/* Botón demo de gol (solo en desarrollo) */}
        <div className="flex justify-center mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoalDemo}
            className="px-5 py-2.5 rounded-full text-sm font-bold"
            style={{
              background: 'rgba(252,209,22,0.1)',
              border: '1.5px solid rgba(252,209,22,0.3)',
              color: '#FCD116',
            }}
          >
            ⚽ Demo: ¡Celebrar gol!
          </motion.button>
        </div>

        <Footer />
      </div>
    </div>
  );
}
