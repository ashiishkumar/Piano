import { EarItem } from '../types/lesson';
import { pitchClass, uniquePitchClasses } from './theory';

/**
 * Ear training: the app plays a target, the learner plays it back.
 * Pure scoring and matching; playback and UI live in the player.
 */

export interface EarAttemptState {
  /** Notes played back so far for a sequential item */
  played: number[];
  wrongAttempts: number;
  replaysUsed: number;
  complete: boolean;
}

export function initialEarState(): EarAttemptState {
  return { played: [], wrongAttempts: 0, replaysUsed: 0, complete: false };
}

function same(a: number, b: number, anyOctave?: boolean): boolean {
  return anyOctave ? pitchClass(a) === pitchClass(b) : a === b;
}

/**
 * Feed one played note to a sequential item (note, interval, melody).
 * A wrong note resets the sequence and counts one wrong attempt.
 */
export function advanceEar(item: EarItem, state: EarAttemptState, midi: number): EarAttemptState {
  if (state.complete || item.kind === 'chord') return state;
  const expected = item.targetMidis[state.played.length];
  if (same(expected, midi, item.anyOctave)) {
    const played = [...state.played, midi];
    return { ...state, played, complete: played.length === item.targetMidis.length };
  }
  const restart = same(item.targetMidis[0], midi, item.anyOctave) ? [midi] : [];
  return { ...state, played: restart, wrongAttempts: state.wrongAttempts + 1 };
}

/** Chord items: is the held set the target's pitch-class set? */
export function earChordHeld(item: EarItem, heldMidis: number[]): 'match' | 'wrong' | 'partial' {
  if (heldMidis.length === 0) return 'partial';
  const want = uniquePitchClasses(item.targetMidis);
  const have = uniquePitchClasses(heldMidis);
  if (have.length < want.length) return 'partial';
  const match = want.length === have.length && want.every((pc, i) => pc === have[i]);
  return match ? 'match' : 'wrong';
}

/** 100 for a clean first answer; −20 per wrong attempt, −10 per replay beyond the free ones; floor 0. */
export function scoreEarItem(state: EarAttemptState, freeReplays: number): number {
  const extraReplays = Math.max(0, state.replaysUsed - freeReplays);
  return Math.max(0, 100 - state.wrongAttempts * 20 - extraReplays * 10);
}

export function scoreEarLesson(states: EarAttemptState[], freeReplays: number): number {
  if (states.length === 0) return 0;
  return Math.round(states.reduce((a, s) => a + scoreEarItem(s, freeReplays), 0) / states.length);
}

/** Playback plan: reference first (if any), then the target, as absolute offsets in seconds. */
export interface PlaybackEvent {
  midi: number;
  at: number;
  duration: number;
}

export function earPlayback(item: EarItem): PlaybackEvent[] {
  const events: PlaybackEvent[] = [];
  let t = 0;
  if (item.referenceMidi !== undefined) {
    events.push({ midi: item.referenceMidi, at: 0, duration: 0.9 });
    t = 1.2;
  }
  if (item.kind === 'chord') {
    for (const m of item.targetMidis) events.push({ midi: m, at: t, duration: 1.6 });
    return events;
  }
  const step = item.noteSeconds ?? (item.kind === 'melody' ? 0.55 : 0.8);
  for (const m of item.targetMidis) {
    events.push({ midi: m, at: t, duration: step * 0.9 });
    t += step;
  }
  return events;
}

export function playbackLength(events: PlaybackEvent[]): number {
  return events.reduce((m, e) => Math.max(m, e.at + e.duration), 0);
}
