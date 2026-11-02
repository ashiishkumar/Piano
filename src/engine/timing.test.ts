import { describe, expect, it } from 'vitest';
import {
  classifyRhythmTiming,
  classifyWaitTiming,
  computeDeltaMs,
  evaluateArticulation,
  timingScoreForDelta,
} from './timing';

describe('classifyWaitTiming', () => {
  it('rewards quick reactions and never reports early', () => {
    expect(classifyWaitTiming(0)).toBe('perfect');
    expect(classifyWaitTiming(180)).toBe('perfect');
    expect(classifyWaitTiming(181)).toBe('good');
    expect(classifyWaitTiming(450)).toBe('good');
    expect(classifyWaitTiming(451)).toBe('late');
    expect(classifyWaitTiming(5000)).toBe('late');
  });
});

describe('classifyRhythmTiming', () => {
  it('uses ±25 ms perfect, ±60 ms good, then early/late by sign', () => {
    expect(classifyRhythmTiming(0)).toBe('perfect');
    expect(classifyRhythmTiming(25)).toBe('perfect');
    expect(classifyRhythmTiming(-25)).toBe('perfect');
    expect(classifyRhythmTiming(26)).toBe('good');
    expect(classifyRhythmTiming(-60)).toBe('good');
    expect(classifyRhythmTiming(-61)).toBe('early');
    expect(classifyRhythmTiming(61)).toBe('late');
  });
});

describe('computeDeltaMs', () => {
  it('measures reaction time in wait mode when waiting', () => {
    expect(
      computeDeltaMs({
        mode: 'wait',
        nowPerfMs: 10_300,
        waitStartedAtMs: 10_000,
        currentTime: 2,
        noteStartTime: 2,
        tempoMultiplier: 0.75,
      })
    ).toBe(300);
  });

  it('falls back to timeline drift in wait mode when not waiting', () => {
    expect(
      computeDeltaMs({
        mode: 'wait',
        nowPerfMs: 0,
        waitStartedAtMs: null,
        currentTime: 2.1,
        noteStartTime: 2,
        tempoMultiplier: 1,
      })
    ).toBe(100);
  });

  it('never reports a negative reaction time in wait mode for an early press', () => {
    // Learner plays the next note before the timeline reaches it: zero hesitation.
    expect(
      computeDeltaMs({
        mode: 'wait',
        nowPerfMs: 0,
        waitStartedAtMs: null,
        currentTime: 1.3,
        noteStartTime: 2,
        tempoMultiplier: 0.75,
      })
    ).toBe(0);
  });

  it('scales rhythm-mode drift by tempo so the result is real milliseconds', () => {
    // 0.05 s of score time at half speed took 0.1 s of wall-clock
    expect(
      computeDeltaMs({
        mode: 'rhythm',
        nowPerfMs: 0,
        waitStartedAtMs: null,
        currentTime: 2.05,
        noteStartTime: 2,
        tempoMultiplier: 0.5,
      })
    ).toBe(100);
    // early press is negative
    expect(
      computeDeltaMs({
        mode: 'rhythm',
        nowPerfMs: 0,
        waitStartedAtMs: null,
        currentTime: 1.97,
        noteStartTime: 2,
        tempoMultiplier: 1,
      })
    ).toBe(-30);
  });
});

describe('timingScoreForDelta', () => {
  it('steps down at 25, 60 and 110 ms', () => {
    expect(timingScoreForDelta(0)).toBe(100);
    expect(timingScoreForDelta(-25)).toBe(100);
    expect(timingScoreForDelta(26)).toBe(86);
    expect(timingScoreForDelta(60)).toBe(86);
    expect(timingScoreForDelta(61)).toBe(68);
    expect(timingScoreForDelta(110)).toBe(68);
    expect(timingScoreForDelta(111)).toBe(45);
  });
});

describe('evaluateArticulation', () => {
  it('scales held time by tempo and flags legato cut short', () => {
    // held 0.4 s wall-clock at 0.5x tempo = 0.2 s score time against a 1 s legato note
    const r = evaluateArticulation(0.4, 1, 0.5, 'legato');
    expect(r.heldSec).toBe(0.2);
    expect(r.ratio).toBe(0.2);
    expect(r.issue).toBe('cut-short');
  });

  it('flags staccato over-held', () => {
    expect(evaluateArticulation(2, 1, 1, 'staccato').issue).toBe('over-held');
  });

  it('is ok for normal articulation regardless of ratio', () => {
    expect(evaluateArticulation(0.05, 1, 1, 'normal').issue).toBe('ok');
    expect(evaluateArticulation(5, 1, 1, undefined).issue).toBe('ok');
  });

  it('guards against zero expected duration', () => {
    expect(evaluateArticulation(0.5, 0, 1).ratio).toBe(5);
  });
});
