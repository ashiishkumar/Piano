import React, { useMemo } from 'react';
import { isBlackKey } from '../utils/notation';

export interface GlyphKey {
  midi: number;
  hand?: 'left' | 'right';
  /** Text under the key: finger number, Sargam syllable, note name */
  label?: string;
  /** Already pressed in a chord cluster: drawn filled but calmer */
  matched?: boolean;
}

interface KeyGlyphProps {
  keys: GlyphKey[];
  /** Force the drawn range (MIDI). Defaults to whole octaves around the keys. */
  from?: number;
  to?: number;
  /** Height of a white key in px. Width follows. */
  keyHeight?: number;
  /** Mark Middle C with a small dot so a beginner can orient */
  markMiddleC?: boolean;
  className?: string;
  /** Called when a key is clicked (for demos) */
  onKeyClick?: (midi: number) => void;
}

const WHITE_INDEX: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
/** Black key centre as a fraction of white-key width from the octave start */
const BLACK_CENTRE: Record<number, number> = { 1: 1.0, 3: 2.0, 6: 4.0, 8: 5.0, 10: 6.0 };

function octaveStart(midi: number): number {
  return midi - (((midi % 12) + 12) % 12);
}

/**
 * A one- or two-octave keyboard drawn as a glyph. The point is orientation:
 * a beginner finds a key by its place among the black-key groups, so the groups
 * are drawn true to a real keyboard and the target is the only colour.
 */
export const KeyGlyph: React.FC<KeyGlyphProps> = ({
  keys,
  from,
  to,
  keyHeight = 56,
  markMiddleC = true,
  className,
  onKeyClick,
}) => {
  const range = useMemo(() => {
    if (from !== undefined && to !== undefined) return { lo: from, hi: to };
    if (keys.length === 0) return { lo: 60, hi: 71 };
    const min = Math.min(...keys.map((k) => k.midi));
    const max = Math.max(...keys.map((k) => k.midi));
    const lo = octaveStart(min);
    // At least one full octave; extend to the B that closes the octave holding max
    const hi = Math.max(lo + 11, octaveStart(max) + 11);
    return { lo, hi };
  }, [keys, from, to]);

  const whiteW = keyHeight * 0.26;
  const blackW = whiteW * 0.62;
  const blackH = keyHeight * 0.62;
  const labelH = 16;

  const byMidi = useMemo(() => {
    const m = new Map<number, GlyphKey>();
    for (const k of keys) m.set(k.midi, k);
    return m;
  }, [keys]);

  // x position in white-key units from range.lo's octave start
  const base = octaveStart(range.lo);
  const xOf = (midi: number): number => {
    const oct = Math.floor((midi - base) / 12);
    const pc = ((midi % 12) + 12) % 12;
    if (isBlackKey(midi)) return oct * 7 + BLACK_CENTRE[pc];
    return oct * 7 + WHITE_INDEX[pc];
  };
  const x0 = xOf(range.lo);

  const whites: number[] = [];
  const blacks: number[] = [];
  for (let m = range.lo; m <= range.hi; m++) (isBlackKey(m) ? blacks : whites).push(m);

  const width = (xOf(range.hi) - x0 + 1) * whiteW;
  const height = keyHeight + labelH;

  const fill = (k: GlyphKey | undefined, black: boolean): string => {
    if (!k) return black ? '#1a2130' : '#e8ecf2';
    if (k.matched) return k.hand === 'left' ? '#0c4a6e' : '#065f46';
    return k.hand === 'left' ? '#38bdf8' : '#34d399';
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={keys.length ? `Keys: ${keys.map((k) => k.label ?? k.midi).join(', ')}` : 'keyboard'}
    >
      {whites.map((m) => {
        const k = byMidi.get(m);
        const x = (xOf(m) - x0) * whiteW;
        return (
          <g key={m} onClick={onKeyClick ? () => onKeyClick(m) : undefined} style={onKeyClick ? { cursor: 'pointer' } : undefined}>
            <rect
              x={x + 0.5}
              y={0.5}
              width={whiteW - 1}
              height={keyHeight - 1}
              rx={2}
              fill={fill(k, false)}
              stroke={k ? 'transparent' : '#9aa3b2'}
              strokeWidth={0.75}
            />
            {markMiddleC && m === 60 && !k && (
              <circle cx={x + whiteW / 2} cy={keyHeight - 7} r={2} fill="#64748b" />
            )}
            {k?.label && (
              <text
                x={x + whiteW / 2}
                y={keyHeight + 12}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
                fill={k.hand === 'left' ? '#7dd3fc' : '#6ee7b7'}
              >
                {k.label}
              </text>
            )}
          </g>
        );
      })}
      {blacks.map((m) => {
        const k = byMidi.get(m);
        const cx = (xOf(m) - x0) * whiteW;
        return (
          <g key={m} onClick={onKeyClick ? () => onKeyClick(m) : undefined} style={onKeyClick ? { cursor: 'pointer' } : undefined}>
            <rect
              x={cx - blackW / 2}
              y={0}
              width={blackW}
              height={blackH}
              rx={1.5}
              fill={fill(k, true)}
              stroke={k ? 'transparent' : '#0d1117'}
              strokeWidth={0.75}
            />
            {k?.label && (
              <text
                x={cx}
                y={blackH - 5}
                textAnchor="middle"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#07090e"
              >
                {k.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
