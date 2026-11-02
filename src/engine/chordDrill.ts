import { ChordDrillLesson, ChordSpec } from '../types/lesson';
import { chordMidis, chordPitchClasses, chordSymbol, matchesChordTarget, recognizeChord, ChordTargetOptions } from './theory';
import { classifyRhythmTiming, timingScoreForDelta } from './timing';

export type HeldEvaluation = 'match' | 'wrong' | 'partial';

/**
 * What the held keys mean against the target chord.
 * 'wrong' only when the learner has committed to a complete, different chord,
 * so a half-pressed chord is never punished.
 */
export function evaluateHeld(spec: ChordSpec, heldMidis: number[], options: ChordTargetOptions): HeldEvaluation {
  if (matchesChordTarget(heldMidis, spec.rootPc, spec.quality, options)) return 'match';
  const targetSize = chordPitchClasses(spec.rootPc, spec.quality).length;
  const distinct = new Set(heldMidis.map((m) => ((m % 12) + 12) % 12)).size;
  if (distinct >= targetSize && recognizeChord(heldMidis) !== null) return 'wrong';
  return 'partial';
}

export function specSymbol(spec: ChordSpec): string {
  return spec.label ?? chordSymbol(spec.rootPc, spec.quality);
}

/** Suggested voicing for the glyph: root position (or the requested inversion) around C4. */
export function specVoicing(spec: ChordSpec, hand: 'left' | 'right' = 'left'): number[] {
  const base = hand === 'left' ? 48 : 60;
  const rootMidi = base + spec.rootPc;
  return chordMidis(rootMidi, spec.quality, spec.inversion ?? 0);
}

export interface ChordResult {
  index: number;
  symbol: string;
  /** Milliseconds from the chord being shown (or the previous match) to this match */
  transitionMs: number;
  wrongAttempts: number;
  /** Metronome mode: drift from the due beat, ms */
  deltaMs?: number;
  missed?: boolean;
}

export interface ChordDrillScore {
  score: number;
  cleanChanges: number;
  wrongAttempts: number;
  meanTransitionMs: number;
  total: number;
}

export function scoreChordDrill(lesson: ChordDrillLesson, results: ChordResult[]): ChordDrillScore {
  const total = lesson.sequence.length * lesson.repeats;
  const wrong = results.reduce((a, r) => a + r.wrongAttempts, 0);
  const played = results.filter((r) => !r.missed);
  const meanTransitionMs = played.length ? Math.round(played.reduce((a, r) => a + r.transitionMs, 0) / played.length) : 0;
  const target = lesson.targetTransitionMs ?? 1500;

  let raw: number;
  if (lesson.mode === 'metronome') {
    const perChord = results.map((r) => (r.missed ? 45 : timingScoreForDelta(r.deltaMs ?? 0)));
    raw = perChord.length ? perChord.reduce((a, b) => a + b, 0) / perChord.length : 0;
  } else if (lesson.mode === 'timed') {
    const perChord = played.map((r) => (r.transitionMs <= target ? 100 : r.transitionMs <= target * 2 ? 80 : 60));
    raw = perChord.length ? perChord.reduce((a, b) => a + b, 0) / perChord.length : 0;
    raw *= played.length / Math.max(1, total);
  } else {
    raw = 100 * (played.length / Math.max(1, total));
  }
  raw -= wrong * 8;

  const cleanChanges = results.filter((r) => !r.missed && r.wrongAttempts === 0 && r.transitionMs <= target).length;
  return {
    score: Math.max(0, Math.min(100, Math.round(raw))),
    cleanChanges,
    wrongAttempts: wrong,
    meanTransitionMs,
    total,
  };
}

/** Metronome mode: when each chord in the sequence is due, seconds from the start (after count-in). */
export function chordDueTimes(lesson: ChordDrillLesson, countInBars = 1): { dueSec: number[]; secondsPerBeat: number; totalSec: number } {
  const bpm = lesson.bpm ?? 60;
  const beats = lesson.beatsPerChord ?? 4;
  const secondsPerBeat = 60 / bpm;
  const countIn = countInBars * beats * secondsPerBeat;
  const dueSec: number[] = [];
  const n = lesson.sequence.length * lesson.repeats;
  for (let i = 0; i < n; i++) dueSec.push(countIn + i * beats * secondsPerBeat);
  return { dueSec, secondsPerBeat, totalSec: countIn + n * beats * secondsPerBeat };
}

export function classifyChordTiming(deltaMs: number) {
  return classifyRhythmTiming(deltaMs);
}
