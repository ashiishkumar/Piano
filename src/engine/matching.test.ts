import { describe, expect, it } from 'vitest';
import { makeTestSong } from './__fixtures__/songs';
import {
  clusterAtEarliestOnset,
  findCandidates,
  findDueWaitNotes,
  findMissedNotes,
  heldCandidates,
  initialWaitIds,
  isUserNote,
  loopAccuracy,
  pitchClassesEqual,
  resolvePress,
} from './matching';

const song = makeTestSong();
const notes = song.arrangements.beginner.notes;

describe('isUserNote', () => {
  it('filters by hand', () => {
    const rh = notes.find((n) => n.id === 'r1')!;
    const lh = notes.find((n) => n.id === 'l1')!;
    expect(isUserNote(rh, 'right')).toBe(true);
    expect(isUserNote(rh, 'left')).toBe(false);
    expect(isUserNote(lh, 'both')).toBe(true);
  });
});

describe('pitchClassesEqual', () => {
  it('treats octaves as equal and other intervals as different', () => {
    expect(pitchClassesEqual(60, 72)).toBe(true);
    expect(pitchClassesEqual(60, 48)).toBe(true);
    expect(pitchClassesEqual(60, 61)).toBe(false);
  });
});

describe('clusterAtEarliestOnset', () => {
  it('returns the chord at the earliest onset only', () => {
    const cluster = clusterAtEarliestOnset(notes.filter((n) => n.startTime >= 3));
    expect(cluster.map((n) => n.id)).toEqual(['r4']);
    const chord = clusterAtEarliestOnset(notes.filter((n) => n.startTime >= 4));
    expect(chord.map((n) => n.id).sort()).toEqual(['l2', 'r5a', 'r5b']);
  });
  it('handles empty input', () => {
    expect(clusterAtEarliestOnset([])).toEqual([]);
  });
});

describe('initialWaitIds', () => {
  it('collects the t=0 cluster for the chosen hand', () => {
    expect(initialWaitIds(notes, 'right')).toEqual(['r1']);
    expect(initialWaitIds(notes, 'both').sort()).toEqual(['l1', 'r1']);
  });
});

describe('findCandidates', () => {
  it('uses a ±0.24 s window in rhythm mode', () => {
    expect(
      findCandidates({ notes, currentTime: 1.2, matched: {}, handFilter: 'right', mode: 'rhythm' }).map((n) => n.id)
    ).toEqual(['r2']);
    expect(
      findCandidates({ notes, currentTime: 1.5, matched: {}, handFilter: 'right', mode: 'rhythm' })
    ).toEqual([]);
  });

  it('uses a ±0.35 s window in wait mode', () => {
    expect(
      findCandidates({ notes, currentTime: 1.3, matched: {}, handFilter: 'right', mode: 'wait' }).map((n) => n.id)
    ).toEqual(['r2']);
  });

  it('in wait mode offers the next upcoming cluster when nothing is in the window', () => {
    const c = findCandidates({ notes, currentTime: 1.5, matched: {}, handFilter: 'right', mode: 'wait' });
    expect(c.map((n) => n.id)).toEqual(['r3']);
  });

  it('skips already matched notes', () => {
    const c = findCandidates({
      notes,
      currentTime: 1.5,
      matched: { r3: 'perfect' },
      handFilter: 'right',
      mode: 'wait',
    });
    expect(c.map((n) => n.id)).toEqual(['r4']);
  });

  it('does not look ahead in rhythm mode', () => {
    expect(
      findCandidates({ notes, currentTime: 1.5, matched: {}, handFilter: 'right', mode: 'rhythm' })
    ).toEqual([]);
  });
});

describe('resolvePress', () => {
  const r2 = notes.find((n) => n.id === 'r2')!;
  const r3 = notes.find((n) => n.id === 'r3')!;

  it('matches the exact pitch', () => {
    const r = resolvePress([r2], 62, 'rhythm');
    expect(r).toEqual({ kind: 'match', note: r2, octaveShifted: false });
  });

  it('accepts an octave-shifted pitch class only in wait mode', () => {
    expect(resolvePress([r2], 74, 'wait')).toEqual({ kind: 'match', note: r2, octaveShifted: true });
    const rhythm = resolvePress([r2], 74, 'rhythm');
    expect(rhythm.kind).toBe('wrong');
  });

  it('reports fat-finger slips within two semitones of the nearest target', () => {
    const r = resolvePress([r2, r3], 63, 'rhythm');
    expect(r.kind).toBe('wrong');
    if (r.kind === 'wrong') {
      expect(r.nearest.id).toBe('r2'); // 63 is 1 from 62 and 1 from 64; first wins the tie
      expect(r.semitoneDistance).toBe(1);
      expect(r.isFatFinger).toBe(true);
    }
    const far = resolvePress([r2], 70, 'rhythm');
    expect(far.kind === 'wrong' && far.isFatFinger).toBe(false);
  });

  it('returns none when there are no candidates', () => {
    expect(resolvePress([], 60, 'wait')).toEqual({ kind: 'none' });
  });
});

describe('heldCandidates', () => {
  it('finds chord members already held', () => {
    const chord = notes.filter((n) => n.startTime === 4 && n.hand === 'right');
    expect(heldCandidates(chord, new Set([64])).map((n) => n.id)).toEqual(['r5b']);
  });
});

describe('findDueWaitNotes', () => {
  it('returns unmatched user notes whose onset has arrived', () => {
    expect(findDueWaitNotes(notes, 0.2, {}, 'right').map((n) => n.id)).toEqual(['r1']);
    expect(findDueWaitNotes(notes, 1.0, { r1: 'perfect' }, 'right').map((n) => n.id)).toEqual(['r2']);
  });
  it('drops notes more than 0.35 s behind the timeline', () => {
    // r1 (t=0) is 1 s behind: no longer due even though unmatched
    expect(findDueWaitNotes(notes, 1.0, {}, 'right').map((n) => n.id)).toEqual(['r2']);
    expect(findDueWaitNotes(notes, 1.3, {}, 'right').map((n) => n.id)).toEqual(['r2']);
    expect(findDueWaitNotes(notes, 1.4, {}, 'right')).toEqual([]);
  });
  it('allows 25 ms of lookahead', () => {
    expect(findDueWaitNotes(notes, 0.98, { r1: 'perfect' }, 'right').map((n) => n.id)).toEqual(['r2']);
    expect(findDueWaitNotes(notes, 0.97, { r1: 'perfect' }, 'right')).toEqual([]);
  });
});

describe('findMissedNotes', () => {
  it('misses notes more than 0.16 s (tempo-scaled) behind the timeline', () => {
    expect(findMissedNotes(notes, 1.15, {}, 'right', 1).map((n) => n.id)).toEqual(['r1']);
    expect(findMissedNotes(notes, 1.17, {}, 'right', 1).map((n) => n.id)).toEqual(['r1', 'r2']);
    // at half tempo the threshold is 0.08 s of score time
    expect(findMissedNotes(notes, 1.09, {}, 'right', 0.5).map((n) => n.id)).toEqual(['r1', 'r2']);
  });
});

describe('loopAccuracy', () => {
  it('counts hits inside the loop measures', () => {
    const { loopNotes, accuracy } = loopAccuracy(
      notes,
      { r1: 'perfect', r2: 'good', r3: 'missed' },
      'right',
      1,
      1
    );
    expect(loopNotes.map((n) => n.id)).toEqual(['r1', 'r2', 'r3', 'r4']);
    expect(accuracy).toBe(50);
  });
  it('is 100 when the loop has no user notes', () => {
    expect(loopAccuracy(notes, {}, 'right', 3, 4).accuracy).toBe(100);
  });
});
