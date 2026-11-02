import {
  HandPracticeFilter,
  PracticeMode,
  ScoreNote,
  TimingClassification,
} from '../types/music';
import {
  CHORD_CLUSTER_SEC,
  FAT_FINGER_MAX_SEMITONES,
  MATCH_WINDOW_RHYTHM_SEC,
  MATCH_WINDOW_WAIT_SEC,
  RHYTHM_MISS_SEC,
  WAIT_DUE_AHEAD_SEC,
  WAIT_DUE_BEHIND_SEC,
  WAIT_LOOKAHEAD_SEC,
} from './constants';

export type MatchedMap = Record<string, TimingClassification>;

export function isUserNote(note: ScoreNote, handFilter: HandPracticeFilter): boolean {
  return handFilter === 'both' || note.hand === handFilter;
}

export function pitchClassesEqual(a: number, b: number): boolean {
  return (((a - b) % 12) + 12) % 12 === 0;
}

/** Notes whose onset is within CHORD_CLUSTER_SEC of the earliest onset in the list. */
export function clusterAtEarliestOnset(notes: ScoreNote[]): ScoreNote[] {
  if (notes.length === 0) return [];
  const earliest = Math.min(...notes.map((n) => n.startTime));
  return notes.filter((n) => Math.abs(n.startTime - earliest) < CHORD_CLUSTER_SEC);
}

export interface CandidateQuery {
  notes: ScoreNote[];
  currentTime: number;
  matched: MatchedMap;
  handFilter: HandPracticeFilter;
  mode: PracticeMode;
}

/**
 * Unmatched user notes that a key press right now could be aimed at.
 * In wait mode, if nothing is in the window, the next upcoming cluster is offered
 * so the learner is never blocked waiting for the timeline to scroll.
 */
export function findCandidates(q: CandidateQuery): ScoreNote[] {
  const windowSec = q.mode === 'wait' ? MATCH_WINDOW_WAIT_SEC : MATCH_WINDOW_RHYTHM_SEC;
  const inWindow = q.notes.filter(
    (n) =>
      isUserNote(n, q.handFilter) &&
      !q.matched[n.id] &&
      Math.abs(n.startTime - q.currentTime) <= windowSec
  );
  if (inWindow.length > 0 || q.mode !== 'wait') return inWindow;

  const upcoming = q.notes.filter(
    (n) =>
      isUserNote(n, q.handFilter) &&
      !q.matched[n.id] &&
      n.startTime >= q.currentTime - WAIT_DUE_BEHIND_SEC &&
      n.startTime <= q.currentTime + WAIT_LOOKAHEAD_SEC
  );
  return clusterAtEarliestOnset(upcoming);
}

export type PressResolution =
  | { kind: 'match'; note: ScoreNote; octaveShifted: boolean }
  | { kind: 'wrong'; nearest: ScoreNote; semitoneDistance: number; isFatFinger: boolean }
  | { kind: 'none' };

/**
 * Decide what a key press means against the candidate notes.
 * Exact pitch wins. In wait mode the right pitch class in another octave also
 * counts (with a flag so the UI can coach). Otherwise it is a wrong note, and
 * we report the nearest intended note plus whether it was an adjacent-key slip.
 */
export function resolvePress(
  candidates: ScoreNote[],
  midi: number,
  mode: PracticeMode
): PressResolution {
  if (candidates.length === 0) return { kind: 'none' };

  const exact = candidates.find((n) => n.midi === midi);
  if (exact) return { kind: 'match', note: exact, octaveShifted: false };

  if (mode === 'wait') {
    const byClass = candidates.find((n) => pitchClassesEqual(n.midi, midi));
    if (byClass) return { kind: 'match', note: byClass, octaveShifted: true };
  }

  const nearest = candidates.reduce((best, cur) =>
    Math.abs(cur.midi - midi) < Math.abs(best.midi - midi) ? cur : best
  );
  const semitoneDistance = Math.abs(nearest.midi - midi);
  return {
    kind: 'wrong',
    nearest,
    semitoneDistance,
    isFatFinger: semitoneDistance > 0 && semitoneDistance <= FAT_FINGER_MAX_SEMITONES,
  };
}

/**
 * Other candidates in the same cluster that are already satisfied by keys the
 * learner is currently holding (chords pressed together).
 */
export function heldCandidates(candidates: ScoreNote[], heldMidis: Set<number>): ScoreNote[] {
  return candidates.filter((c) => heldMidis.has(c.midi));
}

/**
 * Wait mode: user notes that have reached their onset and are still unmatched.
 */
export function findDueWaitNotes(
  notes: ScoreNote[],
  currentTime: number,
  matched: MatchedMap,
  handFilter: HandPracticeFilter
): ScoreNote[] {
  return notes.filter(
    (n) =>
      isUserNote(n, handFilter) &&
      !matched[n.id] &&
      n.startTime <= currentTime + WAIT_DUE_AHEAD_SEC &&
      n.startTime >= currentTime - WAIT_DUE_BEHIND_SEC
  );
}

/**
 * Rhythm mode: unmatched user notes the timeline has passed by more than the miss threshold.
 */
export function findMissedNotes(
  notes: ScoreNote[],
  nextTime: number,
  matched: MatchedMap,
  handFilter: HandPracticeFilter,
  tempoMultiplier: number
): ScoreNote[] {
  const threshold = RHYTHM_MISS_SEC * tempoMultiplier;
  return notes.filter(
    (n) => isUserNote(n, handFilter) && !matched[n.id] && nextTime - n.startTime > threshold
  );
}

/** Percentage of user notes inside the loop that were hit (not missed, not unmatched). */
export function loopAccuracy(
  notes: ScoreNote[],
  matched: MatchedMap,
  handFilter: HandPracticeFilter,
  loopStartMeasure: number,
  loopEndMeasure: number
): { loopNotes: ScoreNote[]; accuracy: number } {
  const loopNotes = notes.filter(
    (n) =>
      isUserNote(n, handFilter) &&
      n.measure >= loopStartMeasure &&
      n.measure <= loopEndMeasure
  );
  const hit = loopNotes.filter((n) => matched[n.id] && matched[n.id] !== 'missed').length;
  return {
    loopNotes,
    accuracy: loopNotes.length > 0 ? (hit / loopNotes.length) * 100 : 100,
  };
}

/** The ids of the notes a lesson starts waiting on: the cluster at t = 0. */
export function initialWaitIds(
  notes: ScoreNote[],
  handFilter: HandPracticeFilter
): string[] {
  return notes
    .filter((n) => isUserNote(n, handFilter) && n.startTime <= CHORD_CLUSTER_SEC)
    .map((n) => n.id);
}
