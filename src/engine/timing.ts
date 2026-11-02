import { PracticeMode, TimingClassification } from '../types/music';
import {
  RHYTHM_GOOD_MS,
  RHYTHM_PERFECT_MS,
  WAIT_GOOD_MS,
  WAIT_PERFECT_MS,
} from './constants';

/**
 * Wait-for-Me mode measures reaction time: how long the learner took to press
 * the key once the engine started waiting. Never negative, never "early".
 */
export function classifyWaitTiming(reactionMs: number): TimingClassification {
  if (reactionMs <= WAIT_PERFECT_MS) return 'perfect';
  if (reactionMs <= WAIT_GOOD_MS) return 'good';
  return 'late';
}

/**
 * Rhythm mode measures drift from the written onset.
 * Negative = early (rushing), positive = late (dragging).
 */
export function classifyRhythmTiming(deltaMs: number): TimingClassification {
  const abs = Math.abs(deltaMs);
  if (abs <= RHYTHM_PERFECT_MS) return 'perfect';
  if (abs <= RHYTHM_GOOD_MS) return 'good';
  return deltaMs < 0 ? 'early' : 'late';
}

export function classifyTiming(mode: PracticeMode, deltaMs: number): TimingClassification {
  return mode === 'wait' ? classifyWaitTiming(deltaMs) : classifyRhythmTiming(deltaMs);
}

export interface DeltaInput {
  mode: PracticeMode;
  /** performance.now() at the key press */
  nowPerfMs: number;
  /** performance.now() when the engine began waiting, or null if not waiting */
  waitStartedAtMs: number | null;
  /** score timeline position at the key press, seconds */
  currentTime: number;
  /** written onset of the matched note, seconds */
  noteStartTime: number;
  tempoMultiplier: number;
}

/**
 * Drift in milliseconds for a matched note.
 * Wait mode: reaction time since waiting began (falls back to timeline drift if not waiting).
 * Rhythm mode: timeline drift converted to real milliseconds at the current tempo.
 */
export function computeDeltaMs(input: DeltaInput): number {
  const drift = Math.round(((input.currentTime - input.noteStartTime) / input.tempoMultiplier) * 1000);
  if (input.mode !== 'wait') return drift;
  if (input.waitStartedAtMs !== null) return Math.round(input.nowPerfMs - input.waitStartedAtMs);
  // Not waiting yet: the learner played the next note before the timeline reached it.
  // That is zero hesitation, not an early error, so it must never go negative.
  return Math.max(0, drift);
}

/** Per-note timing score used in the session summary. */
export function timingScoreForDelta(deltaMs: number): number {
  const abs = Math.abs(deltaMs);
  if (abs <= 25) return 100;
  if (abs <= 60) return 86;
  if (abs <= 110) return 68;
  return 45;
}

export type ArticulationIssue = 'cut-short' | 'over-held' | 'ok';

export interface ArticulationResult {
  heldSec: number;
  ratio: number;
  issue: ArticulationIssue;
}

/**
 * Compare how long a key was held with the written duration.
 * heldRealSec is wall-clock; it is scaled by tempoMultiplier into score seconds.
 */
export function evaluateArticulation(
  heldRealSec: number,
  expectedDurSec: number,
  tempoMultiplier: number,
  articulation?: string
): ArticulationResult {
  const heldSec = heldRealSec * tempoMultiplier;
  const ratio = heldSec / Math.max(0.1, expectedDurSec);
  let issue: ArticulationIssue = 'ok';
  if (articulation === 'legato' && ratio < 0.5) issue = 'cut-short';
  else if (articulation === 'staccato' && ratio > 1.5) issue = 'over-held';
  return {
    heldSec: Number(heldSec.toFixed(3)),
    ratio: Number(ratio.toFixed(2)),
    issue,
  };
}
