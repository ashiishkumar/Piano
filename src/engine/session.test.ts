import { describe, expect, it } from 'vitest';
import { hit, makeTestSong } from './__fixtures__/songs';
import { buildTimingHistogram, findProblemSpots, summarizeSession } from './session';

const song = makeTestSong();

function summarize(evaluations: ReturnType<typeof hit>[], tempoMultiplier = 1) {
  return summarizeSession({
    song,
    tier: 'beginner',
    practiceMode: 'rhythm',
    tempoMultiplier,
    evaluations,
    keyErrorCounts: { 62: 1 },
    keyHitCounts: { 60: 2, 62: 1 },
    timestamp: 1_700_000_000_000,
  });
}

describe('summarizeSession', () => {
  it('returns null when nothing was played', () => {
    expect(summarize([])).toBeNull();
  });

  it('scores a clean right-hand run as 100 / 100 / high dynamics', () => {
    const evals = ['r1', 'r2', 'r3', 'r4'].map((id, i) =>
      hit({ noteId: id, expectedMidi: 60 + i, actualMidi: 60 + i, deltaMs: 10 })
    );
    const s = summarize(evals)!;
    expect(s.pitchAccuracy).toBe(100);
    expect(s.timingPrecision).toBe(100);
    expect(s.dynamicControlScore).toBe(100); // velocity 80 vs 80, no balance bonus without LH
    expect(s.overallScore).toBe(100);
    expect(s.meanDeltaMs).toBe(10);
    expect(s.problemSpots).toEqual([]);
    expect(s.prescriptions[0].title).toMatch(/Mastery Speed Challenge/);
  });

  it('weights pitch 45 / timing 35 / dynamics 20', () => {
    const evals = [
      hit({ noteId: 'r1', deltaMs: 0 }),
      hit({ noteId: 'wrong-1', isWrongPitch: true, actualMidi: 61, timingClass: 'missed' }),
    ];
    const s = summarize(evals)!;
    expect(s.pitchAccuracy).toBe(50);
    expect(s.timingPrecision).toBe(100);
    expect(s.dynamicControlScore).toBe(100);
    expect(s.overallScore).toBe(Math.round(50 * 0.45 + 100 * 0.35 + 100 * 0.2));
  });

  it('gives the hand-balance bonus only when RH is louder than LH', () => {
    const balanced = summarize([
      hit({ noteId: 'r1', actualVelocity: 90, expectedVelocity: 90 }),
      hit({ noteId: 'l1', hand: 'left', actualVelocity: 60, expectedVelocity: 60 }),
    ])!;
    expect(balanced.dynamicControlScore).toBe(100); // 100 + 6 capped
    expect(balanced.avgRhVelocity).toBe(90);
    expect(balanced.avgLhVelocity).toBe(60);

    const heavyLeft = summarize([
      hit({ noteId: 'r1', actualVelocity: 70, expectedVelocity: 90 }),
      hit({ noteId: 'l1', hand: 'left', actualVelocity: 90, expectedVelocity: 60 }),
    ])!;
    // |70-90|*1.4 = 28 -> 72 ; |90-60|*1.4 = 42 -> 58 ; mean 65, no bonus
    expect(heavyLeft.dynamicControlScore).toBe(65);
    expect(heavyLeft.prescriptions[1].title).toMatch(/Hand Balance/);
  });

  it('reports drag and rush prescriptions from mean drift', () => {
    const late = summarize([hit({ noteId: 'r1', deltaMs: 40 }), hit({ noteId: 'r2', deltaMs: 50 })])!;
    expect(late.meanDeltaMs).toBe(45);
    expect(late.prescriptions[2].title).toMatch(/Late Drag/);

    const early = summarize([hit({ noteId: 'r1', deltaMs: -40 })])!;
    expect(early.prescriptions[2].title).toMatch(/Early Rush/);
  });

  it('scales session duration by tempo and copies the key maps', () => {
    const s = summarize([hit({ noteId: 'r1' })], 0.5)!;
    expect(s.durationSeconds).toBe(32);
    expect(s.keyErrorCounts).toEqual({ 62: 1 });
    expect(s.keyHitCounts).toEqual({ 60: 2, 62: 1 });
    expect(s.songId).toBe('test-song');
    expect(s.timestamp).toBe(1_700_000_000_000);
  });
});

describe('buildTimingHistogram', () => {
  it('buckets drift into five bands', () => {
    const b = buildTimingHistogram([
      hit({ noteId: 'a', deltaMs: -100 }),
      hit({ noteId: 'b', deltaMs: -30 }),
      hit({ noteId: 'c', deltaMs: 0 }),
      hit({ noteId: 'd', deltaMs: 25 }),
      hit({ noteId: 'e', deltaMs: 40 }),
      hit({ noteId: 'f', deltaMs: 90 }),
    ]);
    expect(b.map((x) => x.count)).toEqual([1, 1, 2, 1, 1]);
  });
});

describe('findProblemSpots', () => {
  it('flags measures with errors first, then slow transitions', () => {
    const spots = findProblemSpots(
      [
        hit({ noteId: 'r1', measure: 1, deltaMs: 10 }),
        hit({ noteId: 'wrong', measure: 2, isWrongPitch: true, timingClass: 'missed' }),
        hit({ noteId: 'r3', measure: 3, transitionDelayMs: 300 }),
        hit({ noteId: 'r4', measure: 4, deltaMs: 20 }),
      ],
      song
    );
    // Ranking key is errors*100 + avgDelayMs, so a 300 ms hesitation (300)
    // outranks one wrong note with no delay (100).
    expect(spots.map((s) => s.measureStart)).toEqual([3, 2]);
    expect(spots[0].avgDelayMs).toBe(300);
    expect(spots[0].errorCount).toBe(0);
    expect(spots[1].errorCount).toBe(1);
    expect(spots[1].recommendedBpm).toBe(50); // max(50, 60*0.75)
    expect(spots[0].measureEnd).toBe(4); // clamped to totalMeasures
  });
});
