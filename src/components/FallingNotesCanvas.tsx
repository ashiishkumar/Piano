import React, { useEffect, useMemo, useRef } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import {
  computeKeyboardGeometry,
  formatNoteByMode,
  FULL_88_MAX_MIDI,
  FULL_88_MIN_MIDI,
  getWesternName,
  PSR_E373_MAX_MIDI,
  PSR_E373_MIN_MIDI,
} from '../utils/notation';

const LOOKAHEAD_SECONDS = 3.2; // How many seconds of upcoming music are visible on the vertical highway

export const FallingNotesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const keyCountMode = useStudioStore((s) => s.keyCountMode);
  const minMidi = keyCountMode === 61 ? PSR_E373_MIN_MIDI : FULL_88_MIN_MIDI;
  const maxMidi = keyCountMode === 61 ? PSR_E373_MAX_MIDI : FULL_88_MAX_MIDI;

  const geometryMap = useMemo(
    () => computeKeyboardGeometry(minMidi, maxMidi),
    [minMidi, maxMidi]
  );

  useEffect(() => {
    let animationFrameId: number;
    let lastPerfTime = performance.now();

    const renderLoop = (now: number) => {
      const dt = Math.min(0.08, Math.max(0, (now - lastPerfTime) / 1000));
      lastPerfTime = now;

      const state = useStudioStore.getState();
      if (state.isPlaying) {
        state.tickTimeline(dt);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (
          canvas.width !== Math.floor(rect.width * dpr) ||
          canvas.height !== Math.floor(rect.height * dpr)
        ) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          drawHighway(ctx, rect.width, rect.height, geometryMap, now);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [geometryMap]);

  return (
    <div className="relative w-full h-full bg-studio-950 overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

function drawHighway(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  geometryMap: ReturnType<typeof computeKeyboardGeometry>,
  nowPerf: number
) {
  const state = useStudioStore.getState();
  const song = state.currentSong;
  const notes = song.arrangements[state.currentTier].notes;
  const currentTime = state.currentTime;
  const pixelsPerSecond = height / LOOKAHEAD_SECONDS;

  // 1. Background Studio Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#07090e');
  bgGrad.addColorStop(0.85, '#0d1117');
  bgGrad.addColorStop(1, '#151c28');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Vertical Octave Guide Lanes (at every C key)
  for (const [midi, geom] of geometryMap.entries()) {
    const x = geom.xNormalized * width;
    const w = geom.widthNormalized * width;

    if (midi % 12 === 0) {
      ctx.strokeStyle = midi === 60 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = midi === 60 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    } else if (geom.isBlack) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(x, 0, w, height);
    }
  }

  // 3. Horizontal Measure & Beat Grid Lines
  const spb = 60 / song.bpm;
  const spm = spb * song.timeSignature[0];
  const firstVisibleBeat = Math.max(0, Math.floor(currentTime / spb));
  const lastVisibleBeat = Math.ceil((currentTime + LOOKAHEAD_SECONDS) / spb);

  for (let b = firstVisibleBeat; b <= lastVisibleBeat; b++) {
    const beatTime = b * spb;
    const y = height - (beatTime - currentTime) * pixelsPerSecond;
    if (y < -10 || y > height + 10) continue;

    const isMeasureLine = b % song.timeSignature[0] === 0;
    const measureNum = Math.floor(b / song.timeSignature[0]) + 1;

    // Highlight A-B Loop Region
    if (
      state.loopEnabled &&
      isMeasureLine &&
      (measureNum === state.loopStartMeasure || measureNum === state.loopEndMeasure + 1)
    ) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(
        measureNum === state.loopStartMeasure
          ? `LOOP START (M${state.loopStartMeasure})`
          : `LOOP END (M${state.loopEndMeasure})`,
        14,
        y - 5
      );
    } else {
      ctx.strokeStyle = isMeasureLine
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = isMeasureLine ? 1.2 : 0.75;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      if (isMeasureLine && measureNum <= song.totalMeasures) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(`M${measureNum}`, 10, y - 4);
      }
    }
  }

  // 4. Render Falling Note Bars & Duration Tails
  for (const note of notes) {
    const noteEnd = note.startTime + note.duration;
    if (noteEnd < currentTime - 0.1 || note.startTime > currentTime + LOOKAHEAD_SECONDS) {
      continue;
    }

    const geom = geometryMap.get(note.midi);
    if (!geom) continue;

    const x = geom.xNormalized * width + 1.5;
    const w = Math.max(8, geom.widthNormalized * width - 3);

    const yBottom = height - (note.startTime - currentTime) * pixelsPerSecond;
    const yTop = height - (noteEnd - currentTime) * pixelsPerSecond;
    const barHeight = Math.max(16, yBottom - yTop);

    const isMutedHand =
      state.handFilter !== 'both' && note.hand !== state.handFilter;
    const matchedStatus = state.matchedNoteIds[note.id];
    const isWaiting = state.waitingForNoteIds.includes(note.id);

    ctx.save();
    if (isMutedHand) {
      ctx.globalAlpha = 0.35;
    }

    // Determine Hand Color Palette (Right Hand = Emerald, Left Hand = Sky Blue)
    const isRight = note.hand === 'right';
    const grad = ctx.createLinearGradient(x, yTop, x + w, yBottom);

    if (matchedStatus === 'missed') {
      grad.addColorStop(0, 'rgba(244, 63, 94, 0.5)');
      grad.addColorStop(1, 'rgba(190, 18, 60, 0.7)');
    } else if (matchedStatus) {
      grad.addColorStop(0, isRight ? '#34d399' : '#38bdf8');
      grad.addColorStop(1, isRight ? '#059669' : '#0284c7');
    } else if (isRight) {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#047857');
    } else {
      grad.addColorStop(0, '#0ea5e9');
      grad.addColorStop(1, '#0369a1');
    }

    // Draw rounded note bar
    const radius = Math.min(6, w / 2, barHeight / 2);
    ctx.beginPath();
    ctx.roundRect(x, yTop, w, barHeight, radius);
    ctx.fillStyle = grad;
    ctx.fill();

    // Border & Wait-for-Me Pulse Glow
    if (isWaiting) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
    } else {
      ctx.strokeStyle = isRight
        ? 'rgba(167, 243, 208, 0.7)'
        : 'rgba(186, 230, 253, 0.7)';
      ctx.lineWidth = 1.2;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Chord symbol banner on Left-Hand root notes
    if (note.chordSymbol && note.hand === 'left') {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.fillText(`⚑ ${note.chordSymbol}`, x, Math.max(12, yTop - 4));
    }

    // Draw Note Label (Sargam / Western / Solfege / Finger) inside the note bar
    if (state.notationMode !== 'blind' && barHeight >= 18 && w >= 12) {
      const label = formatNoteByMode(
        note.midi,
        state.notationMode,
        state.rootSaPitchClass,
        note.finger
      );
      if (label) {
        ctx.fillStyle = '#07090e';
        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + w / 2, yBottom - 5, w - 2);
      }

      // If not in 'fingers' mode, still show small finger badge at top of bar if available
      if (state.notationMode !== 'fingers' && note.finger && barHeight >= 34) {
        ctx.fillStyle = 'rgba(7, 9, 14, 0.78)';
        ctx.beginPath();
        ctx.arc(x + w / 2, yTop + 10, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${note.finger}`, x + w / 2, yTop + 13);
      }
    }

    ctx.restore();
  }

  // 5. Bottom Hit-Line Laser & Active Key Columns
  const hitGrad = ctx.createLinearGradient(0, height - 6, 0, height);
  hitGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
  hitGrad.addColorStop(1, 'rgba(16, 185, 129, 0.45)');
  ctx.fillStyle = hitGrad;
  ctx.fillRect(0, height - 6, width, 6);

  // 6. Hit-Burst Particle Feedback (Perfect / Good / Early / Late)
  for (const burst of state.hitBursts) {
    const ageMs = nowPerf - burst.timestamp;
    if (ageMs > 750) continue;

    const geom = geometryMap.get(burst.midi);
    if (!geom) continue;

    const progress = ageMs / 750;
    const alpha = Math.max(0, 1 - progress);
    const centerX = (geom.xNormalized + geom.widthNormalized / 2) * width;
    const floatY = height - 18 - progress * 44;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Expanding ring at key impact point
    const ringRadius = 8 + progress * 26;
    ctx.strokeStyle =
      burst.classification === 'perfect'
        ? '#34d399'
        : burst.classification === 'good'
        ? '#38bdf8'
        : '#fbbf24';
    ctx.lineWidth = 2 * (1 - progress);
    ctx.beginPath();
    ctx.arc(centerX, height - 6, ringRadius, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Floating micro-timing badge
    const badgeText =
      burst.classification === 'perfect'
        ? `PERFECT ${burst.deltaMs >= 0 ? '+' : ''}${burst.deltaMs}ms`
        : burst.classification === 'good'
        ? `GOOD ${burst.deltaMs >= 0 ? '+' : ''}${burst.deltaMs}ms`
        : burst.classification === 'early'
        ? `EARLY ${burst.deltaMs}ms`
        : `LATE +${burst.deltaMs}ms`;

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle =
      burst.classification === 'perfect'
        ? '#6ee7b7'
        : burst.classification === 'good'
        ? '#7dd3fc'
        : '#fcd34d';
    ctx.fillText(badgeText, centerX, floatY);
    ctx.restore();
  }

  // 7. Wait-for-Me Banner when Paused on a Beat
  if (state.practiceMode === 'wait' && state.waitingForNoteIds.length > 0) {
    const waitingNotes = notes.filter((n) => state.waitingForNoteIds.includes(n.id));
    const names = waitingNotes
      .map((n) => {
        const modeLbl = formatNoteByMode(
          n.midi,
          state.notationMode === 'blind' ? 'western' : state.notationMode,
          state.rootSaPitchClass,
          n.finger
        );
        const west = getWesternName(n.midi, true);
        const handTag = n.hand === 'left' ? 'LH' : 'RH';
        return modeLbl !== west ? `${handTag}: ${modeLbl} (${west})` : `${handTag}: ${west}`;
      })
      .join('  +  ');

    ctx.save();
    ctx.fillStyle = 'rgba(13, 17, 23, 0.92)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 1.5;
    const boxW = Math.min(460, width - 32);
    const boxX = width / 2 - boxW / 2;
    ctx.beginPath();
    ctx.roundRect(boxX, 12, boxW, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏸ Wait-for-Me: Play [ ${names} ] to advance`, width / 2, 34);
    ctx.restore();
  }
}
