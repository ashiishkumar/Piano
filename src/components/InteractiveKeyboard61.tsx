import React, { useMemo } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import {
  computeKeyboardGeometry,
  FULL_88_MAX_MIDI,
  FULL_88_MIN_MIDI,
  getSargamLabel,
  getSolfegeName,
  getVelocityHeatColor,
  getWesternName,
  PSR_E373_MAX_MIDI,
  PSR_E373_MIN_MIDI,
} from '../utils/notation';
import { midiManager } from '../services/MIDIManager';

export const InteractiveKeyboard61: React.FC = () => {
  const {
    keyCountMode,
    notationMode,
    rootSaPitchClass,
    activeNotes,
    currentSong,
    currentTier,
    currentTime,
    waitingForNoteIds,
    handFilter,
    showHeatmapOverlay,
    keyErrorCounts,
    userProfile,
  } = useStudioStore();

  const minMidi = keyCountMode === 61 ? PSR_E373_MIN_MIDI : FULL_88_MIN_MIDI;
  const maxMidi = keyCountMode === 61 ? PSR_E373_MAX_MIDI : FULL_88_MAX_MIDI;

  const geometryMap = useMemo(
    () => computeKeyboardGeometry(minMidi, maxMidi),
    [minMidi, maxMidi]
  );

  // Determine which notes are currently due/expected on the score (for target highlighting & finger badges)
  const expectedMap = useMemo(() => {
    const map = new Map<number, { hand: 'left' | 'right'; finger?: number; isWaiting: boolean }>();
    const notes = currentSong.arrangements[currentTier].notes;
    for (const n of notes) {
      if (handFilter !== 'both' && n.hand !== handFilter) continue;
      const isWaiting = waitingForNoteIds.includes(n.id);
      const isActiveWindow =
        isWaiting || (n.startTime <= currentTime + 0.12 && n.startTime + n.duration >= currentTime);
      if (isActiveWindow) {
        map.set(n.midi, {
          hand: n.hand,
          finger: n.finger,
          isWaiting,
        });
      }
    }
    return map;
  }, [currentSong, currentTier, currentTime, waitingForNoteIds, handFilter]);

  const allKeys = useMemo(() => Array.from(geometryMap.values()), [geometryMap]);
  const whiteKeys = useMemo(() => allKeys.filter((k) => !k.isBlack), [allKeys]);
  const blackKeys = useMemo(() => allKeys.filter((k) => k.isBlack), [allKeys]);

  // Combined error counts (session + historical profile) for 61-Key Error Heatmap
  const maxErrorCount = useMemo(() => {
    let max = 1;
    for (let m = minMidi; m <= maxMidi; m++) {
      const totalErr =
        (keyErrorCounts[m] || 0) + (userProfile.cumulativeKeyErrors?.[m] || 0);
      if (totalErr > max) max = totalErr;
    }
    return max;
  }, [keyErrorCounts, userProfile.cumulativeKeyErrors, minMidi, maxMidi]);

  const renderKeyLabel = (midi: number, isBlack: boolean, targetFinger?: number) => {
    if (notationMode === 'blind') return null;

    if (notationMode === 'fingers') {
      if (targetFinger) {
        return (
          <span className="w-5 h-5 rounded-full bg-slate-950/90 text-white font-mono text-[11px] font-bold flex items-center justify-center border border-white/30 shadow">
            {targetFinger}
          </span>
        );
      }
      if (midi === 60) {
        return <span className="text-[9px] font-mono font-bold text-amber-500">C4</span>;
      }
      return null;
    }

    if (notationMode === 'sargam') {
      const sargam = getSargamLabel(midi, rootSaPitchClass);
      const isSa = sargam.short.startsWith('Sa');
      return (
        <div className="flex flex-col items-center leading-none gap-0.5">
          {targetFinger && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center mb-0.5">
              {targetFinger}
            </span>
          )}
          <span
            className={`font-semibold tracking-tight ${
              isBlack ? 'text-[9px]' : 'text-[10px]'
            } ${
              isSa
                ? 'text-amber-500 font-bold'
                : sargam.variant === 'komal' || sargam.variant === 'tivra'
                ? 'text-cyan-400'
                : isBlack
                ? 'text-slate-300'
                : 'text-slate-700'
            }`}
          >
            {sargam.short}
          </span>
          {!isBlack && midi % 12 === 0 && (
            <span className="text-[8px] font-mono text-slate-400">
              {getWesternName(midi, true)}
            </span>
          )}
        </div>
      );
    }

    if (notationMode === 'solfege') {
      return (
        <div className="flex flex-col items-center leading-none">
          {targetFinger && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center mb-0.5">
              {targetFinger}
            </span>
          )}
          <span className={`${isBlack ? 'text-[9px] text-slate-300' : 'text-[10px] text-slate-700 font-medium'}`}>
            {getSolfegeName(midi)}
          </span>
        </div>
      );
    }

    // Western mode
    const isC = midi % 12 === 0;
    return (
      <div className="flex flex-col items-center leading-none">
        {targetFinger && (
          <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center mb-0.5">
            {targetFinger}
          </span>
        )}
        <span
          className={`font-mono ${
            isBlack
              ? 'text-[8px] text-slate-300'
              : isC
              ? 'text-[10px] font-bold text-slate-900'
              : 'text-[9px] text-slate-500'
          }`}
        >
          {isBlack ? getWesternName(midi, false) : isC ? getWesternName(midi, true) : getWesternName(midi, false)}
        </span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-36 sm:h-40 bg-studio-950 border-t-2 border-studio-700 select-none overflow-hidden shrink-0 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
      {/* Top red felt strip like a real acoustic & Yamaha console piano */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-900 via-red-700 to-rose-900 opacity-90" />

      <div className="relative w-full h-[calc(100%-6px)]">
        {/* Render White Keys */}
        {whiteKeys.map((key) => {
          const active = activeNotes[key.midi];
          const expected = expectedMap.get(key.midi);
          const velHeat = active ? getVelocityHeatColor(active.velocity) : null;
          const isMiddleC = key.midi === 60;

          const errCount =
            (keyErrorCounts[key.midi] || 0) +
            (userProfile.cumulativeKeyErrors?.[key.midi] || 0);
          const errIntensity = showHeatmapOverlay && errCount > 0 ? Math.min(1, errCount / maxErrorCount) : 0;

          let bgClass = 'bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-800';
          if (active && velHeat) {
            bgClass = `bg-gradient-to-b ${velHeat.bg} text-slate-950 translate-y-[2px]`;
          } else if (expected) {
            bgClass =
              expected.hand === 'right'
                ? 'bg-gradient-to-b from-emerald-100 via-emerald-200 to-emerald-400 text-slate-950'
                : 'bg-gradient-to-b from-sky-100 via-sky-200 to-sky-400 text-slate-950';
          }

          return (
            <div
              key={key.midi}
              onMouseDown={() => midiManager.triggerVirtualNoteOn(key.midi, 85, 'mouse')}
              onMouseUp={() => midiManager.triggerVirtualNoteOff(key.midi, 'mouse')}
              onMouseLeave={() => {
                if (activeNotes[key.midi]?.source === 'mouse') {
                  midiManager.triggerVirtualNoteOff(key.midi, 'mouse');
                }
              }}
              style={{
                left: `${key.xNormalized * 100}%`,
                width: `${key.widthNormalized * 100}%`,
                boxShadow: active && velHeat ? velHeat.glow : undefined,
              }}
              className={`absolute top-0 bottom-0 border-r border-b border-slate-400/80 rounded-b-md flex flex-col justify-end items-center pb-2 cursor-pointer transition-transform duration-75 ${bgClass}`}
            >
              {/* Heatmap Overlay */}
              {errIntensity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-b-md"
                  style={{
                    backgroundColor: `rgba(244, 63, 94, ${0.2 + errIntensity * 0.55})`,
                  }}
                />
              )}

              {/* Middle C (C4 / MIDI 60) Landmark Badge */}
              {isMiddleC && !active && (
                <div className="absolute top-1.5 px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-[8px] font-mono font-bold text-amber-700">
                  MID C4
                </div>
              )}

              {/* Waiting-for-Me Pulse Ring */}
              {expected?.isWaiting && !active && (
                <div
                  className={`w-2.5 h-2.5 rounded-full mb-1 animate-ping ${
                    expected.hand === 'right' ? 'bg-emerald-600' : 'bg-sky-600'
                  }`}
                />
              )}

              {renderKeyLabel(key.midi, false, expected?.finger)}
            </div>
          );
        })}

        {/* Render Black Keys */}
        {blackKeys.map((key) => {
          const active = activeNotes[key.midi];
          const expected = expectedMap.get(key.midi);
          const velHeat = active ? getVelocityHeatColor(active.velocity) : null;

          const errCount =
            (keyErrorCounts[key.midi] || 0) +
            (userProfile.cumulativeKeyErrors?.[key.midi] || 0);
          const errIntensity = showHeatmapOverlay && errCount > 0 ? Math.min(1, errCount / maxErrorCount) : 0;

          let bgClass =
            'bg-gradient-to-b from-slate-800 via-slate-900 to-black border-slate-700 text-slate-200';
          if (active && velHeat) {
            bgClass = `bg-gradient-to-b ${velHeat.bg} border-white text-slate-950 translate-y-[2px]`;
          } else if (expected) {
            bgClass =
              expected.hand === 'right'
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-200 text-slate-950'
                : 'bg-gradient-to-b from-sky-400 to-sky-600 border-sky-200 text-slate-950';
          }

          return (
            <div
              key={key.midi}
              onMouseDown={(e) => {
                e.stopPropagation();
                midiManager.triggerVirtualNoteOn(key.midi, 85, 'mouse');
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                midiManager.triggerVirtualNoteOff(key.midi, 'mouse');
              }}
              onMouseLeave={() => {
                if (activeNotes[key.midi]?.source === 'mouse') {
                  midiManager.triggerVirtualNoteOff(key.midi, 'mouse');
                }
              }}
              style={{
                left: `${key.xNormalized * 100}%`,
                width: `${key.widthNormalized * 100}%`,
                height: '62%',
                boxShadow: active && velHeat ? velHeat.glow : '0 4px 8px rgba(0,0,0,0.65)',
              }}
              className={`absolute top-0 z-10 border rounded-b-md flex flex-col justify-end items-center pb-1.5 cursor-pointer transition-transform duration-75 ${bgClass}`}
            >
              {errIntensity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-b-md"
                  style={{
                    backgroundColor: `rgba(244, 63, 94, ${0.25 + errIntensity * 0.6})`,
                  }}
                />
              )}

              {renderKeyLabel(key.midi, true, expected?.finger)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
