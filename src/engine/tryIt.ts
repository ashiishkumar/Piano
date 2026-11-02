import { TryIt } from '../types/lesson';
import { pitchClass } from './theory';

export interface TryItState {
  /** How many targets have been satisfied, in order (sequence mode) or in total (any-order mode) */
  done: number;
  /** Targets satisfied so far, by index (any-order mode) */
  hit: boolean[];
  wrongPresses: number;
  complete: boolean;
}

export function initialTryIt(tryIt: TryIt): TryItState {
  return { done: 0, hit: tryIt.targetMidis.map(() => false), wrongPresses: 0, complete: false };
}

function same(a: number, b: number, anyOctave: boolean | undefined): boolean {
  return anyOctave ? pitchClass(a) === pitchClass(b) : a === b;
}

/**
 * Advance a sequence or any-order try-it with one key press.
 * Sequence mode: a wrong key restarts from the first target (and counts as a wrong press);
 * pressing the first target again after a slip is not punished twice.
 * Together mode is evaluated from held keys with `tryItHeld`, not here.
 */
export function advanceTryIt(tryIt: TryIt, state: TryItState, midi: number): TryItState {
  if (state.complete || tryIt.together) return state;

  if (tryIt.anyOrder) {
    const idx = tryIt.targetMidis.findIndex((t, i) => !state.hit[i] && same(t, midi, tryIt.anyOctave));
    if (idx < 0) {
      const alreadyHit = tryIt.targetMidis.some((t, i) => state.hit[i] && same(t, midi, tryIt.anyOctave));
      return alreadyHit ? state : { ...state, wrongPresses: state.wrongPresses + 1 };
    }
    const hit = [...state.hit];
    hit[idx] = true;
    const done = hit.filter(Boolean).length;
    return { ...state, hit, done, complete: done === tryIt.targetMidis.length };
  }

  const expected = tryIt.targetMidis[state.done];
  if (same(expected, midi, tryIt.anyOctave)) {
    const done = state.done + 1;
    return { ...state, done, complete: done === tryIt.targetMidis.length };
  }
  // Wrong key: start over. If they hit the first target, keep that progress.
  const restart = same(tryIt.targetMidis[0], midi, tryIt.anyOctave) ? 1 : 0;
  return { ...state, done: restart, wrongPresses: state.wrongPresses + 1 };
}

/** Together mode: are all targets currently held? */
export function tryItHeld(tryIt: TryIt, heldMidis: number[]): boolean {
  return tryIt.targetMidis.every((t) => heldMidis.some((h) => same(t, h, tryIt.anyOctave)));
}

/** Concept lesson score: completing is the point; skipped try-its cost a little. */
export function scoreConcept(tryItCount: number, skipped: number): number {
  if (tryItCount === 0) return 100;
  return Math.max(70, 100 - skipped * 10);
}
