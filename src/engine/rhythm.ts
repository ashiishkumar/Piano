import { RhythmLesson } from '../types/lesson';
import { TimingClassification } from '../types/music';
import { classifyRhythmTiming, timingScoreForDelta } from './timing';

/** One expected tap, in seconds from the start of the exercise (count-in included). */
export interface RhythmOnset {
  id: string;
  time: number;
  durationSec: number;
  repeat: number;
  /** Beat within the pattern, 0-based, for drawing */
  beat: number;
  label?: string;
}

export interface RhythmSchedule {
  onsets: RhythmOnset[];
  secondsPerBeat: number;
  beatsPerBar: number;
  /** Length of one pass of the pattern, in beats */
  patternBeats: number;
  countInSec: number;
  totalSec: number;
}

export function buildRhythmSchedule(lesson: RhythmLesson): RhythmSchedule {
  const secondsPerBeat = 60 / lesson.bpm;
  const beatsPerBar = lesson.timeSignature[0];
  const patternEnd = Math.max(...lesson.pattern.map((p) => p.beat + p.durationBeats), beatsPerBar);
  const patternBeats = Math.ceil(patternEnd / beatsPerBar) * beatsPerBar;
  const countInSec = lesson.countInBars * beatsPerBar * secondsPerBeat;

  const onsets: RhythmOnset[] = [];
  for (let r = 0; r < lesson.repeats; r++) {
    lesson.pattern.forEach((p, i) => {
      onsets.push({
        id: `r${r}-${i}`,
        time: countInSec + (r * patternBeats + p.beat) * secondsPerBeat,
        durationSec: p.durationBeats * secondsPerBeat,
        repeat: r,
        beat: p.beat,
        label: p.label,
      });
    });
  }
  onsets.sort((a, b) => a.time - b.time);
  return {
    onsets,
    secondsPerBeat,
    beatsPerBar,
    patternBeats,
    countInSec,
    totalSec: countInSec + lesson.repeats * patternBeats * secondsPerBeat,
  };
}

export interface TapResult {
  onsetId: string | null;
  tapTime: number;
  deltaMs: number;
  classification: TimingClassification | 'extra';
}

/** Taps further than this from any onset are "extra" (not counted as hits). */
export const TAP_WINDOW_SEC = 0.2;
/** An onset is missed once the clock is this far past it with no tap. */
export const MISS_AFTER_SEC = 0.25;

/**
 * Assign a tap to the nearest unmatched onset inside the window.
 */
export function matchTap(schedule: RhythmSchedule, matched: Set<string>, tapTime: number): TapResult {
  let best: RhythmOnset | null = null;
  let bestDist = Infinity;
  for (const o of schedule.onsets) {
    if (matched.has(o.id)) continue;
    const d = Math.abs(o.time - tapTime);
    if (d < bestDist) {
      bestDist = d;
      best = o;
    }
  }
  if (!best || bestDist > TAP_WINDOW_SEC) {
    return { onsetId: null, tapTime, deltaMs: 0, classification: 'extra' };
  }
  const deltaMs = Math.round((tapTime - best.time) * 1000);
  return { onsetId: best.id, tapTime, deltaMs, classification: classifyRhythmTiming(deltaMs) };
}

/** Onsets the clock has passed without a tap. */
export function findMissedOnsets(schedule: RhythmSchedule, matched: Set<string>, now: number): RhythmOnset[] {
  return schedule.onsets.filter((o) => !matched.has(o.id) && now - o.time > MISS_AFTER_SEC);
}

export interface RhythmScore {
  score: number;
  hits: number;
  missed: number;
  extra: number;
  total: number;
  meanDeltaMs: number;
  perfect: number;
}

/**
 * Score: average per-hit timing score, scaled by the fraction of onsets hit,
 * minus 5 per stray tap. Floor 0.
 */
export function scoreRhythm(schedule: RhythmSchedule, taps: TapResult[], missedCount: number): RhythmScore {
  const hits = taps.filter((t) => t.onsetId !== null);
  const extra = taps.length - hits.length;
  const total = schedule.onsets.length;
  const timing = hits.length ? hits.reduce((a, t) => a + timingScoreForDelta(t.deltaMs), 0) / hits.length : 0;
  const coverage = total ? hits.length / total : 0;
  const raw = timing * coverage - extra * 5;
  const meanDeltaMs = hits.length ? Math.round(hits.reduce((a, t) => a + t.deltaMs, 0) / hits.length) : 0;
  return {
    score: Math.max(0, Math.round(raw)),
    hits: hits.length,
    missed: missedCount,
    extra,
    total,
    meanDeltaMs,
    perfect: hits.filter((t) => t.classification === 'perfect').length,
  };
}
