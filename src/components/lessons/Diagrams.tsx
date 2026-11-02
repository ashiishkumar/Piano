import React from 'react';
import { CIRCLE_OF_FIFTHS, pitchClassName, relativeMinorOf } from '../../engine/theory';

/** Sharps/flats per key going clockwise from C: 0 1 2 3 4 5 6 then flats 5 4 3 2 1 */
const ACCIDENTALS = ['', '1♯', '2♯', '3♯', '4♯', '5♯', '6♯/6♭', '5♭', '4♭', '3♭', '2♭', '1♭'];
const FLAT_SIDE = new Set([7, 8, 9, 10, 11]);

export const CircleOfFifths: React.FC<{ highlightPc?: number; className?: string }> = ({ highlightPc, className }) => {
  const size = 320;
  const c = size / 2;
  const rOuter = 128;
  const rInner = 82;
  const rText = 148;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className} role="img" aria-label="Circle of fifths">
      <circle cx={c} cy={c} r={rOuter + 8} fill="#0d1117" stroke="#252f42" />
      <circle cx={c} cy={c} r={rInner - 22} fill="#07090e" stroke="#252f42" />
      {CIRCLE_OF_FIFTHS.map((pc, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = c + Math.cos(angle) * rOuter;
        const y = c + Math.sin(angle) * rOuter;
        const xi = c + Math.cos(angle) * rInner;
        const yi = c + Math.sin(angle) * rInner;
        const xt = c + Math.cos(angle) * rText;
        const yt = c + Math.sin(angle) * rText;
        const flats = FLAT_SIDE.has(i);
        const lit = highlightPc === pc;
        const minor = relativeMinorOf(pc);
        return (
          <g key={pc}>
            <circle cx={x} cy={y} r={17} fill={lit ? '#065f46' : '#1a2130'} stroke={lit ? '#34d399' : '#35435e'} strokeWidth={lit ? 2 : 1} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill={lit ? '#d1fae5' : '#e2e8f0'} fontFamily="Inter, sans-serif">
              {pitchClassName(pc, flats)}
            </text>
            <circle cx={xi} cy={yi} r={13} fill="#0b1a1f" stroke="#1e3a3a" />
            <text x={xi} y={yi + 3.5} textAnchor="middle" fontSize={10} fill="#7dd3fc" fontFamily="Inter, sans-serif">
              {pitchClassName(minor, flats)}m
            </text>
            <text x={xt} y={yt + 3} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="JetBrains Mono, monospace">
              {ACCIDENTALS[i]}
            </text>
          </g>
        );
      })}
      <text x={c} y={c - 4} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="Inter, sans-serif">
        outer: major
      </text>
      <text x={c} y={c + 9} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="Inter, sans-serif">
        inner: relative minor
      </text>
    </svg>
  );
};

export const FingerNumbers: React.FC<{ className?: string }> = ({ className }) => {
  const fingers = [
    { n: 1, name: 'Thumb' },
    { n: 2, name: 'Index' },
    { n: 3, name: 'Middle' },
    { n: 4, name: 'Ring' },
    { n: 5, name: 'Little' },
  ];
  return (
    <div className={`flex items-end gap-3 ${className ?? ''}`}>
      {fingers.map((f) => (
        <div key={f.n} className="flex flex-col items-center gap-1.5">
          <div
            className="w-9 rounded-t-full rounded-b-lg bg-slate-200/90 border border-slate-400"
            style={{ height: [52, 72, 80, 74, 58][f.n - 1] }}
          />
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-sm flex items-center justify-center">{f.n}</div>
          <div className="text-[11px] text-slate-400">{f.name}</div>
        </div>
      ))}
      <p className="text-xs text-slate-400 max-w-[180px] pb-8 pl-2">Both hands count the same way: the thumb is always 1, the little finger always 5.</p>
    </div>
  );
};
