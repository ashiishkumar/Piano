import React from 'react';
import { PANEL_BY_ID, PANEL_HEIGHT, PANEL_REGIONS, PANEL_WIDTH, PanelRegion } from '../content/psrE373Panel';

interface PanelDiagramProps {
  /** Region ids to light up */
  highlight?: string[];
  className?: string;
  onRegionClick?: (id: string) => void;
}

const groupFill: Record<PanelRegion['group'], string> = {
  power: '#1f2937',
  piano: '#1a2130',
  song: '#1a2130',
  style: '#1e2a3a',
  display: '#0b1a1f',
  select: '#1a2130',
  voice: '#1e2a3a',
  lesson: '#1a2130',
  wheel: '#1f2937',
  rear: '#111827',
};

/**
 * Schematic of the PSR-E373 top panel. Highlighted regions glow; everything
 * else stays quiet so the eye lands on the one button the step is about.
 */
export const PanelDiagram: React.FC<PanelDiagramProps> = ({ highlight = [], className, onRegionClick }) => {
  const lit = new Set(highlight);
  return (
    <svg
      viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
      className={className}
      role="img"
      aria-label={highlight.length ? `Keyboard panel, showing ${highlight.map((h) => PANEL_BY_ID[h]?.label ?? h).join(', ')}` : 'Keyboard panel'}
    >
      {/* chassis */}
      <rect x={0} y={0} width={PANEL_WIDTH} height={176} rx={10} fill="#0d1117" stroke="#252f42" />
      <rect x={0} y={182} width={PANEL_WIDTH} height={44} rx={6} fill="#0a0e14" stroke="#1f2937" />
      <text x={12} y={206} fontSize={10} fill="#64748b" fontFamily="JetBrains Mono, monospace">
        REAR
      </text>
      {/* key strip hint */}
      <rect x={72} y={166} width={PANEL_WIDTH - 84} height={6} fill="#e8ecf2" opacity={0.25} />

      {PANEL_REGIONS.map((r) => {
        const on = lit.has(r.id);
        const stroke = on ? '#34d399' : '#35435e';
        const fill = on ? '#064e3b' : groupFill[r.group];
        const text = on ? '#d1fae5' : '#94a3b8';
        const common = {
          onClick: onRegionClick ? () => onRegionClick(r.id) : undefined,
          style: onRegionClick ? { cursor: 'pointer' } : undefined,
        };
        if (r.shape === 'knob') {
          const cx = r.x + r.w / 2;
          const cy = r.y + r.h / 2;
          return (
            <g key={r.id} {...common}>
              <circle cx={cx} cy={cy} r={r.w / 2} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1} />
              <line x1={cx} y1={cy} x2={cx} y2={cy - r.w / 2 + 4} stroke={text} strokeWidth={2} />
              <text x={cx} y={r.y + r.h + 11} textAnchor="middle" fontSize={7.5} fill={text} fontFamily="Inter, sans-serif">
                {r.label}
              </text>
            </g>
          );
        }
        if (r.shape === 'wheel') {
          return (
            <g key={r.id} {...common}>
              <rect x={r.x + 12} y={r.y} width={r.w - 24} height={r.h} rx={6} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1} />
              <line x1={r.x + 12} y1={r.y + r.h / 2} x2={r.x + r.w - 12} y2={r.y + r.h / 2} stroke={text} />
              <text x={r.x + r.w / 2} y={r.y + r.h + 11} textAnchor="middle" fontSize={7.5} fill={text} fontFamily="Inter, sans-serif">
                {r.label}
              </text>
            </g>
          );
        }
        if (r.shape === 'jack') {
          return (
            <g key={r.id} {...common}>
              <circle cx={r.x + 10} cy={r.y + r.h / 2} r={6} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1} />
              <text x={r.x + 22} y={r.y + r.h / 2 + 3} fontSize={8} fill={text} fontFamily="Inter, sans-serif">
                {r.label}
              </text>
            </g>
          );
        }
        const isDisplay = r.group === 'display';
        return (
          <g key={r.id} {...common}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={isDisplay ? 6 : 4} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1} />
            {on && <rect x={r.x - 3} y={r.y - 3} width={r.w + 6} height={r.h + 6} rx={6} fill="none" stroke="#34d399" strokeOpacity={0.35} strokeWidth={4} />}
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2 + 3}
              textAnchor="middle"
              fontSize={isDisplay ? 11 : r.w >= 70 ? 7.5 : 7}
              fill={text}
              fontFamily="Inter, sans-serif"
              fontWeight={on ? 600 : 400}
            >
              {isDisplay ? 'LCD' : r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
