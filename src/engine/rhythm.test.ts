import { describe, expect, it } from 'vitest';
import { RhythmLesson } from '../types/lesson';
import { buildRhythmSchedule, findMissedOnsets, matchTap, scoreRhythm } from './rhythm';

const lesson: RhythmLesson = {
  id: 'r',
  code: 'r',
  levelId: 2,
  title: 'Quarter notes',
  track: 'theory',
  type: 'rhythm',
  status: 'ready',
  durationMinutes: 3,
  objectives: [],
  bpm: 60,
  timeSignature: [4, 4],
  pattern: [
    { beat: 0, durationBeats: 1 },
    { beat: 1, durationBeats: 1 },
    { beat: 2, durationBeats: 2 },
  ],
  repeats: 2,
  countInBars: 1,
};

describe('buildRhythmSchedule', () => {
  it('lays out onsets after the count-in, once per repeat', () => {
    const s = buildRhythmSchedule(lesson);
    expect(s.secondsPerBeat).toBe(1);
    expect(s.countInSec).toBe(4);
    expect(s.patternBeats).toBe(4);
    expect(s.onsets.map((o) => o.time)).toEqual([4, 5, 6, 8, 9, 10]);
    expect(s.onsets[2].durationSec).toBe(2);
    expect(s.totalSec).toBe(12);
  });

  it('rounds a pattern that overflows the bar up to whole bars', () => {
    const s = buildRhythmSchedule({ ...lesson, pattern: [{ beat: 0, durationBeats: 1 }, { beat: 4.5, durationBeats: 1 }] });
    expect(s.patternBeats).toBe(8);
  });
});

describe('matchTap', () => {
  const s = buildRhythmSchedule(lesson);

  it('matches the nearest unmatched onset and classifies drift', () => {
    const t = matchTap(s, new Set(), 5.03);
    expect(t.onsetId).toBe('r0-1');
    expect(t.deltaMs).toBe(30);
    expect(t.classification).toBe('good');
  });

  it('skips onsets already matched', () => {
    // r0-1 (5.0) is taken; the nearest free onset, r0-2 at 6.0, is outside the window
    const t = matchTap(s, new Set(['r0-1']), 5.03);
    expect(t.onsetId).toBeNull();
    expect(t.classification).toBe('extra');
    // close enough to the free onset: matched, early
    expect(matchTap(s, new Set(['r0-1']), 5.85)).toMatchObject({ onsetId: 'r0-2', deltaMs: -150, classification: 'early' });
  });

  it('calls a tap far from any onset extra', () => {
    const t = matchTap(s, new Set(), 7.0); // halfway between 6.0 and 8.0
    expect(t.onsetId).toBeNull();
    expect(t.classification).toBe('extra');
  });
});

describe('findMissedOnsets', () => {
  it('reports onsets more than 0.25 s in the past', () => {
    const s = buildRhythmSchedule(lesson);
    expect(findMissedOnsets(s, new Set(), 5.2).map((o) => o.id)).toEqual(['r0-0']);
    expect(findMissedOnsets(s, new Set(['r0-0']), 5.2)).toEqual([]);
    expect(findMissedOnsets(s, new Set(), 5.3).map((o) => o.id)).toEqual(['r0-0', 'r0-1']);
  });
});

describe('scoreRhythm', () => {
  const s = buildRhythmSchedule(lesson);
  it('is 100 for perfect coverage and timing', () => {
    const taps = s.onsets.map((o) => matchTap(s, new Set(), o.time));
    // matchTap with an empty set each time would re-match the same onset, so build properly:
    const matched = new Set<string>();
    const proper = s.onsets.map((o) => {
      const t = matchTap(s, matched, o.time + 0.01);
      if (t.onsetId) matched.add(t.onsetId);
      return t;
    });
    expect(taps.length).toBe(6);
    const sc = scoreRhythm(s, proper, 0);
    expect(sc.score).toBe(100);
    expect(sc.hits).toBe(6);
    expect(sc.perfect).toBe(6);
  });

  it('scales by coverage and penalises stray taps', () => {
    const matched = new Set<string>();
    const taps = s.onsets.slice(0, 3).map((o) => {
      const t = matchTap(s, matched, o.time);
      if (t.onsetId) matched.add(t.onsetId);
      return t;
    });
    taps.push(matchTap(s, matched, 7.0)); // extra
    const sc = scoreRhythm(s, taps, 3);
    // 100 * (3/6) - 5 = 45
    expect(sc.score).toBe(45);
    expect(sc.extra).toBe(1);
    expect(sc.missed).toBe(3);
  });
});
