import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthResult } from '../../types';

interface Props {
  spiGoles: number;
  realAdversidadGoles: number;
  resultados: MonthResult[];
}

type Tone = 'hype' | 'warn' | 'neutral';

interface Phrase {
  text: string;
  tone: Tone;
}

function buildPhrases(
  spi: number,
  rival: number,
  resultados: MonthResult[]
): Phrase[] {
  const closed = resultados.filter(r => r.status === 'Cerrado');
  const lastClosed = closed[closed.length - 1];
  const pendientes = resultados.filter(r => r.status === 'Pendiente').length;

  const out: Phrase[] = [];

  // 1) Estado global del marcador
  if (spi === 0 && rival === 0) {
    out.push({ text: '🎙️ ¡Comienza el partido! Las defensas se miden, balón dividido en el mediocampo…', tone: 'neutral' });
    out.push({ text: '📢 Cero a cero, pero se siente la electricidad en las tribunas', tone: 'neutral' });
  } else if (spi > rival) {
    const diff = spi - rival;
    if (diff === 1) {
      out.push({ text: '🔥 ¡SPI Americas arriba en el marcador! El estadio no cabe de emoción', tone: 'hype' });
      out.push({ text: '⚡ ¡Mínima ventaja pero ventaja al fin! Real Adversidad busca igualar', tone: 'hype' });
    } else if (diff >= 3) {
      out.push({ text: `🏆 ¡GOLEADA EN CURSO! ${spi}-${rival}, Real Adversidad no encuentra cómo frenar a SPI`, tone: 'hype' });
      out.push({ text: '🎆 ¡Qué exhibición! La hinchada pide un gol más', tone: 'hype' });
    } else {
      out.push({ text: `🎯 SPI Americas manda ${spi}-${rival} y el reloj corre a su favor`, tone: 'hype' });
      out.push({ text: '💪 El equipo controla el ritmo, Real Adversidad corre detrás de la pelota', tone: 'hype' });
    }
  } else if (spi === rival) {
    out.push({ text: `🤝 ¡Partido al rojo vivo! ${spi}-${rival}, el empate enciende las tribunas`, tone: 'neutral' });
    out.push({ text: '⚖️ Marcador igualado, cualquier cosa puede pasar en esta recta', tone: 'neutral' });
  } else {
    const diff = rival - spi;
    if (diff >= 2) {
      out.push({ text: `😤 Real Adversidad ${rival}-${spi}. Hora de despertar, SPI necesita mover el banco`, tone: 'warn' });
      out.push({ text: '🧠 El cuerpo técnico dibuja en la pizarra — viene remontada o viene ajuste', tone: 'warn' });
    } else {
      out.push({ text: `📉 Real Adversidad se adelantó ${rival}-${spi}, pero la temporada es larga`, tone: 'warn' });
      out.push({ text: '🎯 A buscar el descuento cuanto antes, el equipo tiene argumentos', tone: 'warn' });
    }
  }

  // 2) Último mes cerrado
  if (lastClosed) {
    if (lastClosed.golesAFavor > lastClosed.golesEnContra) {
      out.push({ text: `⚽ ¡${lastClosed.mes} fue un mesazo! ${lastClosed.golesAFavor}-${lastClosed.golesEnContra} a favor y moral por las nubes`, tone: 'hype' });
    } else if (lastClosed.golesAFavor < lastClosed.golesEnContra) {
      out.push({ text: `🧭 ${lastClosed.mes} cerró ${lastClosed.golesAFavor}-${lastClosed.golesEnContra}. El equipo analiza el video`, tone: 'warn' });
    } else {
      out.push({ text: `🔄 ${lastClosed.mes} terminó igualado. Queda todo por jugar`, tone: 'neutral' });
    }
    if (lastClosed.highlight) {
      out.push({ text: `📝 Crónica de ${lastClosed.mes}: "${lastClosed.highlight}"`, tone: 'neutral' });
    }
  }

  // 3) Racha positiva (últimos 2+ meses con goles a favor dominando)
  const lastTwo = closed.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every(r => r.golesAFavor > r.golesEnContra)) {
    out.push({ text: '🔥 ¡DOS MESES EN LLAMAS! El equipo enlaza victorias — Real Adversidad tiembla', tone: 'hype' });
  }
  const lastThree = closed.slice(-3);
  if (lastThree.length === 3 && lastThree.every(r => r.golesAFavor > r.golesEnContra)) {
    out.push({ text: '🚀 ¡RACHA HISTÓRICA! Tres mesazos seguidos, esto ya es leyenda', tone: 'hype' });
  }

  // 4) Tiempo restante
  if (pendientes > 0 && pendientes < 12) {
    out.push({ text: `⏳ Quedan ${pendientes} mes${pendientes === 1 ? '' : 'es'} por cerrar — todo puede cambiar`, tone: 'neutral' });
  }

  // 5) Referencias a rivalidad
  out.push({ text: '🗣️ Real Adversidad presenta: crisis global, tasas, inflación… SPI responde con estrategia', tone: 'warn' });
  out.push({ text: '🧤 El portero de SPI avisa: "si marcan, nosotros marcamos dos"', tone: 'hype' });

  return out;
}

export function CommentaryTicker({ spiGoles, realAdversidadGoles, resultados }: Props) {
  const phrases = useMemo(
    () => buildPhrases(spiGoles, realAdversidadGoles, resultados),
    [spiGoles, realAdversidadGoles, resultados]
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % phrases.length), 6200);
    return () => clearInterval(t);
  }, [phrases.length]);

  // Reset idx si la lista cambia drásticamente
  useEffect(() => { setIdx(0); }, [phrases.length]);

  if (phrases.length === 0) return null;
  const current = phrases[idx];

  const toneColor = current.tone === 'hype'
    ? '#16a34a'
    : current.tone === 'warn'
    ? '#dc2626'
    : 'rgba(252,209,22,0.85)';

  return (
    <div
      className="w-full max-w-5xl mx-auto px-3 sm:px-6"
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: 'linear-gradient(90deg, rgba(26,42,74,0.85), rgba(10,22,40,0.85))',
          border: '1px solid rgba(252,209,22,0.22)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
        }}
      >
        {/* Badge EN VIVO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px',
            background: '#CE1126',
            flexShrink: 0,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'inline-block',
              willChange: 'opacity',
            }}
          />
          <span style={{
            color: '#FFFFFF',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.12em',
          }}>
            EN VIVO
          </span>
        </div>

        {/* Frase del comentarista */}
        <div
          style={{
            flex: 1,
            minHeight: 38,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={`${idx}-${current.text}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: toneColor,
                fontFamily: 'Inter, sans-serif',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Contador de posición */}
        <div
          className="hidden sm:flex"
          style={{
            alignItems: 'center',
            padding: '0 12px',
            borderLeft: '1px solid rgba(252,209,22,0.12)',
            flexShrink: 0,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Oswald, sans-serif',
            fontSize: 10,
            letterSpacing: '0.08em',
          }}
        >
          {idx + 1}/{phrases.length}
        </div>
      </div>
    </div>
  );
}
