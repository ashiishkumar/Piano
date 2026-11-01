import React, { useMemo } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { formatNoteByMode, isBlackKey } from '../utils/notation';
import { ScoreNote } from '../types/music';

// Converts a MIDI note number to diatonic staff step relative to C4 (Middle C = step 0)
// C4=0, D4=1, E4=2, F4=3, G4=4, A4=5, B4=6, C5=7 ...
const PC_TO_DIATONIC_OFFSET = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

function midiToDiatonicStepFromC4(midi: number): number {
  const octave = Math.floor(midi / 12) - 1;
  const pc = ((midi % 12) + 12) % 12;
  return (octave - 4) * 7 + PC_TO_DIATONIC_OFFSET[pc];
}

export const GrandStaffView: React.FC = () => {
  const {
    currentSong,
    currentTier,
    currentTime,
    notationMode,
    rootSaPitchClass,
    matchedNoteIds,
    waitingForNoteIds,
    loopEnabled,
    loopStartMeasure,
    loopEndMeasure,
    seekToMeasure,
  } = useStudioStore();

  const notes = currentSong.arrangements[currentTier].notes;
  const spb = 60 / currentSong.bpm;
  const spm = spb * currentSong.timeSignature[0];

  const MEASURE_WIDTH = 240;
  const LEFT_HEADER_WIDTH = 100;
  const STEP_Y = 5; // 5px per diatonic step (10px between staff lines)

  // Treble staff lines (bottom to top): E4(step 2), G4(4), B4(6), D5(8), F5(10)
  // Let's place C4 (Middle C, step 0) at y = 92 for Treble reference, and y = 128 for Bass reference
  const TREBLE_C4_Y = 90;
  const BASS_C4_Y = 120;

  const totalWidth = LEFT_HEADER_WIDTH + currentSong.totalMeasures * MEASURE_WIDTH + 60;
  const playheadX =
    LEFT_HEADER_WIDTH + (currentTime / Math.max(0.1, spm)) * MEASURE_WIDTH;

  // Auto-scroll horizontal offset so active playhead stays comfortably in view
  const scrollOffset = Math.max(0, playheadX - 280);

  const measuresArray = useMemo(
    () => Array.from({ length: currentSong.totalMeasures }, (_, i) => i + 1),
    [currentSong.totalMeasures]
  );

  const getNoteY = (note: ScoreNote): number => {
    const step = midiToDiatonicStepFromC4(note.midi);
    if (note.hand === 'right') {
      return TREBLE_C4_Y - step * STEP_Y;
    } else {
      return BASS_C4_Y - step * STEP_Y;
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-studio-900 to-studio-950 border-b border-white/10 overflow-hidden select-none flex flex-col justify-center">
      {/* Top Info Ribbon */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-studio-950/85 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
          <span className="text-xs font-semibold text-white">{currentSong.title}</span>
          <span className="text-[11px] text-slate-400">•</span>
          <span className="text-[11px] font-mono text-emerald-400">
            {currentSong.timeSignature[0]}/{currentSong.timeSignature[1]} • Key of {currentSong.keySignature}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-studio-950/85 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Treble (Right Hand)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Bass (Left Hand)
          </span>
          <span className="text-slate-500">Click any measure to jump</span>
        </div>
      </div>

      {/* Synchronized Scrolling Grand Staff SVG */}
      <div className="w-full overflow-hidden">
        <svg
          width={totalWidth}
          height={215}
          style={{
            transform: `translateX(-${scrollOffset}px)`,
            transition: 'transform 60ms linear',
          }}
          className="block"
        >
          {/* Grand Staff Brace & Clef Header */}
          <g>
            {/* Vertical Grand Staff Connector Line */}
            <line
              x1={24}
              y1={TREBLE_C4_Y - 10 * STEP_Y}
              x2={24}
              y2={BASS_C4_Y + 10 * STEP_Y}
              stroke="#94a3b8"
              strokeWidth={2.5}
            />
            {/* Treble Clef Symbol */}
            <text
              x={32}
              y={TREBLE_C4_Y - 3 * STEP_Y}
              fill="#10b981"
              fontSize="38"
              fontFamily="serif"
            >
              𝄞
            </text>
            {/* Bass Clef Symbol */}
            <text
              x={32}
              y={BASS_C4_Y + 7 * STEP_Y}
              fill="#38bdf8"
              fontSize="30"
              fontFamily="serif"
            >
              𝄢
            </text>
            {/* Time Signature Numerator & Denominator */}
            <text
              x={68}
              y={TREBLE_C4_Y - 6 * STEP_Y}
              fill="#e2e8f0"
              fontSize="16"
              fontWeight="bold"
              fontFamily="serif"
            >
              {currentSong.timeSignature[0]}
            </text>
            <text
              x={68}
              y={TREBLE_C4_Y - 2 * STEP_Y}
              fill="#e2e8f0"
              fontSize="16"
              fontWeight="bold"
              fontFamily="serif"
            >
              {currentSong.timeSignature[1]}
            </text>
            <text
              x={68}
              y={BASS_C4_Y + 6 * STEP_Y}
              fill="#e2e8f0"
              fontSize="16"
              fontWeight="bold"
              fontFamily="serif"
            >
              {currentSong.timeSignature[0]}
            </text>
            <text
              x={68}
              y={BASS_C4_Y + 10 * STEP_Y}
              fill="#e2e8f0"
              fontSize="16"
              fontWeight="bold"
              fontFamily="serif"
            >
              {currentSong.timeSignature[1]}
            </text>
          </g>

          {/* 5 Horizontal Lines of Treble Clef (Steps 2, 4, 6, 8, 10 -> E4, G4, B4, D5, F5) */}
          {[2, 4, 6, 8, 10].map((step) => {
            const y = TREBLE_C4_Y - step * STEP_Y;
            return (
              <line
                key={`treble-line-${step}`}
                x1={24}
                y1={y}
                x2={totalWidth - 20}
                y2={y}
                stroke="rgba(226, 232, 240, 0.25)"
                strokeWidth={1}
              />
            );
          })}

          {/* 5 Horizontal Lines of Bass Clef (Steps -2, -4, -6, -8, -10 -> A3, F3, D3, B2, G2) */}
          {[-2, -4, -6, -8, -10].map((step) => {
            const y = BASS_C4_Y - step * STEP_Y;
            return (
              <line
                key={`bass-line-${step}`}
                x1={24}
                y1={y}
                x2={totalWidth - 20}
                y2={y}
                stroke="rgba(226, 232, 240, 0.25)"
                strokeWidth={1}
              />
            );
          })}

          {/* Measure Boxes, Barlines & Loop Highlights */}
          {measuresArray.map((mNum) => {
            const mX = LEFT_HEADER_WIDTH + (mNum - 1) * MEASURE_WIDTH;
            const isInLoop =
              loopEnabled && mNum >= loopStartMeasure && mNum <= loopEndMeasure;

            return (
              <g
                key={`measure-box-${mNum}`}
                onClick={() => seekToMeasure(mNum)}
                className="cursor-pointer group"
              >
                <rect
                  x={mX}
                  y={25}
                  width={MEASURE_WIDTH}
                  height={165}
                  fill={
                    isInLoop
                      ? 'rgba(251, 191, 36, 0.06)'
                      : 'transparent'
                  }
                  className="hover:fill-white/[0.03] transition-colors"
                />
                {/* Measure Number & Loop Tag */}
                <text
                  x={mX + 8}
                  y={34}
                  fill={isInLoop ? '#fbbf24' : '#64748b'}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  M{mNum} {isInLoop ? '⟳' : ''}
                </text>
                {/* Measure End Barline */}
                <line
                  x1={mX + MEASURE_WIDTH}
                  y1={TREBLE_C4_Y - 10 * STEP_Y}
                  x2={mX + MEASURE_WIDTH}
                  y2={BASS_C4_Y + 10 * STEP_Y}
                  stroke={isInLoop ? 'rgba(251, 191, 36, 0.5)' : 'rgba(148, 163, 184, 0.35)'}
                  strokeWidth={mNum === currentSong.totalMeasures ? 2.5 : 1.2}
                />
              </g>
            );
          })}

          {/* Render Score Notes on Grand Staff */}
          {notes.map((note) => {
            const x =
              LEFT_HEADER_WIDTH +
              (note.startTime / Math.max(0.1, spm)) * MEASURE_WIDTH +
              18;
            const y = getNoteY(note);
            const step = midiToDiatonicStepFromC4(note.midi);
            const sharp = isBlackKey(note.midi);

            const matched = matchedNoteIds[note.id];
            const isWaiting = waitingForNoteIds.includes(note.id);
            const isHollow = note.duration >= spb * 1.75; // Half or whole note has hollow head

            let fillColor = note.hand === 'right' ? '#10b981' : '#38bdf8';
            if (matched === 'missed') fillColor = '#f43f5e';
            else if (matched) fillColor = note.hand === 'right' ? '#6ee7b7' : '#7dd3fc';
            if (isWaiting) fillColor = '#fbbf24';

            const label =
              notationMode !== 'blind'
                ? formatNoteByMode(note.midi, notationMode, rootSaPitchClass, note.finger)
                : '';

            return (
              <g key={note.id}>
                {/* Chord Symbol Above Staff */}
                {note.chordSymbol && note.hand === 'left' && (
                  <text
                    x={x - 6}
                    y={24}
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                  >
                    {note.chordSymbol}
                  </text>
                )}

                {/* Middle C (step 0) or High C5 (step 12) Ledger Line */}
                {(step === 0 || step >= 12 || step <= -12) && (
                  <line
                    x1={x - 10}
                    y1={y}
                    x2={x + 10}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth={1.4}
                  />
                )}

                {/* Sharp (#) Accidental */}
                {sharp && (
                  <text
                    x={x - 16}
                    y={y + 4}
                    fill={fillColor}
                    fontSize="13"
                    fontWeight="bold"
                  >
                    ♯
                  </text>
                )}

                {/* Notehead */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx={5.8}
                  ry={4.2}
                  transform={`rotate(-18 ${x} ${y})`}
                  fill={isHollow ? '#0d1117' : fillColor}
                  stroke={fillColor}
                  strokeWidth={2}
                />

                {/* Note Stem */}
                {note.duration < spb * 3.5 && (
                  <line
                    x1={note.hand === 'right' ? x + 5 : x - 5}
                    y1={y}
                    x2={note.hand === 'right' ? x + 5 : x - 5}
                    y2={note.hand === 'right' ? y - 26 : y + 26}
                    stroke={fillColor}
                    strokeWidth={1.6}
                  />
                )}

                {/* Finger Number Badge */}
                {note.finger && notationMode !== 'blind' && (
                  <text
                    x={x}
                    y={note.hand === 'right' ? y - 30 : y + 36}
                    fill="#cbd5e1"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {note.finger}
                  </text>
                )}

                {/* Sargam / Western / Lyric Annotation */}
                {(label || note.lyric) && notationMode !== 'blind' && (
                  <text
                    x={x}
                    y={note.hand === 'right' ? y + 15 : y - 10}
                    fill={note.hand === 'right' ? '#a7f3d0' : '#bae6fd'}
                    fontSize="9.5"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {notationMode === 'sargam' ? label : note.lyric || label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Playhead Cursor */}
          <g>
            <line
              x1={playheadX + 18}
              y1={16}
              x2={playheadX + 18}
              y2={198}
              stroke="#fbbf24"
              strokeWidth={2.2}
            />
            <polygon
              points={`${playheadX + 12},16 ${playheadX + 24},16 ${playheadX + 18},24`}
              fill="#fbbf24"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
