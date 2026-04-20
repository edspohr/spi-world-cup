import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MonthResult } from '../../types';
import { COLORS } from '../../utils/constants';

interface Props {
  resultados: MonthResult[];
}

const VB_W = 720;
const VB_H = 300;
const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 26;
const PAD_B = 56;
const CHART_W = VB_W - PAD_L - PAD_R;
const CHART_H = VB_H - PAD_T - PAD_B;
const Y_MIN = 40;
const Y_MAX = 160;

// Meses abreviados para labels
const ABREV: Record<string, string> = {
  Enero: 'Ene', Febrero: 'Feb', Marzo: 'Mar', Abril: 'Abr',
  Mayo: 'May', Junio: 'Jun', Julio: 'Jul', Agosto: 'Ago',
  Septiembre: 'Sep', Octubre: 'Oct', Noviembre: 'Nov', Diciembre: 'Dic',
};

function scaleY(pct: number): number {
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, pct));
  return PAD_T + ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * CHART_H;
}

function scaleX(idx: number, n: number): number {
  return PAD_L + (CHART_W / (n - 1)) * idx;
}

export const RecaudoChart = memo(function RecaudoChart({ resultados }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(
    () =>
      resultados.map((r, idx) => ({
        ...r,
        idx,
        x: scaleX(idx, resultados.length),
        isClosed: r.status === 'Cerrado',
        isInProgress: r.status === 'Pendiente' && r.pctMeta !== undefined,
      })),
    [resultados]
  );

  // La línea conecta todos los meses con pctMeta (cerrados + mes en curso)
  const linePoints = data.filter(d => d.pctMeta !== undefined);
  const linePath = linePoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${scaleY(d.pctMeta!)}`)
    .join(' ');
  // Segmento entre último cerrado y mes en curso se pinta punteado (provisional)
  const lastClosedPoint = linePoints.filter(d => d.isClosed).pop();
  const inProgressPoint = linePoints.find(d => d.isInProgress);
  const provisionalPath =
    lastClosedPoint && inProgressPoint && lastClosedPoint.idx < inProgressPoint.idx
      ? `M ${lastClosedPoint.x} ${scaleY(lastClosedPoint.pctMeta!)} L ${inProgressPoint.x} ${scaleY(inProgressPoint.pctMeta!)}`
      : '';
  const solidLinePoints = linePoints.filter(d => d.isClosed);
  const solidLinePath = solidLinePoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${scaleY(d.pctMeta!)}`)
    .join(' ');

  // Bars: golesAFavor sube, golesEnContra baja desde la línea de 100%
  const barWidth = 14;
  const y100 = scaleY(100);

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto px-3 sm:px-6"
    >
      <h2
        className="text-center mb-2"
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          color: '#FCD116',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(252,209,22,0.3)',
        }}
      >
        📊 Recaudo vs. Goles
      </h2>
      <p
        className="text-center mb-4 text-xs uppercase tracking-widest font-semibold"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        Cómo el cumplimiento de la meta condiciona el marcador
      </p>

      {/* Leyenda */}
      <div className="flex justify-center flex-wrap gap-4 mb-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <LegendItem color={COLORS.colombiaYellow} label="% Meta" shape="line" />
        <LegendItem color="#16a34a" label="Goles a favor" shape="bar" />
        <LegendItem color="#dc2626" label="Goles en contra" shape="bar" />
        <LegendItem color={COLORS.colombiaYellow} label="Mes en curso" shape="pulse" />
      </div>

      <div
        style={{
          background: 'rgba(26,42,74,0.5)',
          border: '1px solid rgba(252,209,22,0.18)',
          borderRadius: 12,
          padding: '12px 8px 8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Gráfico mes a mes de cumplimiento de meta y goles"
        >
          {/* Zonas de color: verde (>=100%) y roja (<100%) */}
          <defs>
            <linearGradient id="greenZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#16a34a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="redZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#dc2626" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.22" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <rect x={PAD_L} y={PAD_T} width={CHART_W} height={y100 - PAD_T} fill="url(#greenZone)" />
          <rect x={PAD_L} y={y100} width={CHART_W} height={PAD_T + CHART_H - y100} fill="url(#redZone)" />

          {/* Gridlines horizontales + labels Y */}
          {[60, 80, 100, 120, 140].map(tick => {
            const y = scaleY(tick);
            const isMeta = tick === 100;
            return (
              <g key={tick}>
                <line
                  x1={PAD_L}
                  x2={PAD_L + CHART_W}
                  y1={y}
                  y2={y}
                  stroke={isMeta ? '#FCD116' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isMeta ? 1.6 : 1}
                  strokeDasharray={isMeta ? '0' : '3 4'}
                />
                <text
                  x={PAD_L - 8}
                  y={y + 4}
                  fill={isMeta ? '#FCD116' : 'rgba(255,255,255,0.5)'}
                  fontSize={isMeta ? 11 : 10}
                  fontWeight={isMeta ? 700 : 500}
                  fontFamily="Oswald, sans-serif"
                  textAnchor="end"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Label "META" junto al 100% */}
          <text
            x={PAD_L + CHART_W - 4}
            y={y100 - 6}
            fill="#FCD116"
            fontSize={10}
            fontWeight={700}
            fontFamily="Oswald, sans-serif"
            textAnchor="end"
            opacity={0.85}
          >
            META 100%
          </text>

          {/* Bars mes a mes */}
          {data.map(d => {
            const x = d.x;
            if (!d.isClosed) {
              // Mes en curso: placeholder se maneja con el dot pulsante (abajo)
              if (d.isInProgress) return null;
              // Mes pendiente sin datos: mini dot sobre la línea de meta
              return (
                <circle
                  key={d.mes}
                  cx={x}
                  cy={y100}
                  r={2}
                  fill="rgba(255,255,255,0.18)"
                />
              );
            }
            const favorH = d.golesAFavor * 14;
            const contraH = d.golesEnContra * 14;
            return (
              <g key={d.mes}>
                {d.golesAFavor > 0 && (
                  <rect
                    x={x - barWidth / 2}
                    y={y100 - favorH}
                    width={barWidth}
                    height={favorH}
                    fill="#16a34a"
                    opacity={hoverIdx !== null && hoverIdx !== d.idx ? 0.35 : 0.92}
                    rx={2}
                  />
                )}
                {d.golesEnContra > 0 && (
                  <rect
                    x={x - barWidth / 2}
                    y={y100}
                    width={barWidth}
                    height={contraH}
                    fill="#dc2626"
                    opacity={hoverIdx !== null && hoverIdx !== d.idx ? 0.35 : 0.92}
                    rx={2}
                  />
                )}
              </g>
            );
          })}

          {/* Línea %Meta + dots */}
          {/* Línea sólida: meses cerrados */}
          {solidLinePoints.length > 1 && (
            <path
              d={solidLinePath}
              fill="none"
              stroke="#FCD116"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}
          {/* Segmento punteado: último cerrado → mes en curso (provisional) */}
          {provisionalPath && (
            <path
              d={provisionalPath}
              fill="none"
              stroke="rgba(252,209,22,0.6)"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}
          {/* Dots: cerrados sólidos, mes en curso pulsante */}
          {linePoints.map(d => {
            const cy = scaleY(d.pctMeta!);
            if (d.isInProgress) {
              return (
                <g key={d.mes}>
                  <circle cx={d.x} cy={cy} r={9} fill="rgba(252,209,22,0.2)">
                    <animate attributeName="r" values="7;11;7" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={d.x}
                    cy={cy}
                    r={hoverIdx === d.idx ? 6 : 5}
                    fill="#FCD116"
                    stroke="#0A1628"
                    strokeWidth={2}
                    style={{ transition: 'r 0.18s' }}
                  />
                </g>
              );
            }
            return (
              <circle
                key={d.mes}
                cx={d.x}
                cy={cy}
                r={hoverIdx === d.idx ? 6 : 4}
                fill="#FCD116"
                stroke="#0A1628"
                strokeWidth={2}
                style={{ transition: 'r 0.18s' }}
              />
            );
          })}

          {/* Hotzones invisibles para hover/touch */}
          {data.map(d => (
            <rect
              key={d.mes}
              x={d.x - CHART_W / data.length / 2}
              y={PAD_T}
              width={CHART_W / data.length}
              height={CHART_H}
              fill="transparent"
              style={{ cursor: d.isClosed ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoverIdx(d.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onTouchStart={() => setHoverIdx(d.idx)}
            />
          ))}

          {/* Highlight vertical line del mes hovered */}
          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_T}
              y2={PAD_T + CHART_H}
              stroke="rgba(252,209,22,0.35)"
              strokeWidth={1}
              strokeDasharray="2 3"
              pointerEvents="none"
            />
          )}

          {/* X axis labels */}
          {data.map(d => {
            const isActive = hoverIdx === d.idx;
            const hasData = d.isClosed || d.isInProgress;
            return (
              <text
                key={d.mes}
                x={d.x}
                y={PAD_T + CHART_H + 18}
                fill={isActive ? '#FCD116' : hasData ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'}
                fontSize={11}
                fontFamily="Oswald, sans-serif"
                fontWeight={isActive ? 700 : 500}
                textAnchor="middle"
                letterSpacing="0.02em"
              >
                {ABREV[d.mes] ?? d.mes.slice(0, 3)}
              </text>
            );
          })}

          {/* Marcador mes cerrado/pendiente debajo de label */}
          {data.map(d => (
            <circle
              key={`dot-${d.mes}`}
              cx={d.x}
              cy={PAD_T + CHART_H + 32}
              r={2.5}
              fill={d.isClosed ? '#FCD116' : d.isInProgress ? 'rgba(252,209,22,0.55)' : 'rgba(255,255,255,0.25)'}
            />
          ))}
        </svg>

        {/* Tooltip flotante */}
        {hovered && (hovered.isClosed || hovered.isInProgress) && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(10,22,40,0.92)',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: 8,
              padding: '8px 12px',
              pointerEvents: 'none',
              maxWidth: 220,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              color: '#FCD116',
              fontSize: 14,
              letterSpacing: '0.04em',
              marginBottom: 2,
            }}>
              {hovered.mes.toUpperCase()}
              {hovered.isInProgress && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 9,
                  padding: '1px 5px',
                  borderRadius: 8,
                  background: 'rgba(252,209,22,0.2)',
                  color: '#FCD116',
                  letterSpacing: '0.08em',
                }}>
                  EN CURSO
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 18,
                fontWeight: 700,
                color: hovered.pctMeta! >= 100 ? '#16a34a' : '#dc2626',
              }}>
                {hovered.pctMeta}%
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                de la meta {hovered.isInProgress ? '(provisional)' : ''}
              </span>
            </div>
            {hovered.isClosed && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{hovered.golesAFavor}</span>
                {' · '}
                <span style={{ color: '#dc2626', fontWeight: 700 }}>{hovered.golesEnContra}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}> ({hovered.golesAFavor > hovered.golesEnContra ? 'victoria' : hovered.golesAFavor < hovered.golesEnContra ? 'derrota' : 'empate'})</span>
              </p>
            )}
            {hovered.highlight && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.3 }}>
                "{hovered.highlight}"
              </p>
            )}
          </div>
        )}
      </div>

      <p className="text-center mt-3 text-[11px] tracking-widest uppercase font-semibold"
        style={{ color: 'rgba(252,209,22,0.42)' }}>
        ≥100% = goles a favor · &lt;100% = goles en contra
      </p>
    </motion.section>
  );
});

function LegendItem({ color, label, shape }: { color: string; label: string; shape: 'line' | 'bar' | 'zone' | 'pulse' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {shape === 'line' && (
        <span style={{ width: 16, height: 2, background: color, borderRadius: 1, boxShadow: `0 0 6px ${color}` }} />
      )}
      {shape === 'bar' && (
        <span style={{ width: 9, height: 14, background: color, borderRadius: 2 }} />
      )}
      {shape === 'zone' && (
        <span style={{
          width: 14, height: 14,
          background: color, border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: 2,
        }} />
      )}
      {shape === 'pulse' && (
        <span style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 3px rgba(252,209,22,0.25)`,
        }} />
      )}
      <span>{label}</span>
    </div>
  );
}
