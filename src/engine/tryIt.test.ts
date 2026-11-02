import { describe, expect, it } from 'vitest';
import { advanceTryIt, initialTryIt, scoreConcept, tryItHeld } from './tryIt';

describe('advanceTryIt (sequence)', () => {
  const t = { prompt: '', targetMidis: [60, 62, 64] };

  it('advances in order and completes', () => {
    let s = initialTryIt(t);
    s = advanceTryIt(t, s, 60);
    s = advanceTryIt(t, s, 62);
    expect(s.done).toBe(2);
    s = advanceTryIt(t, s, 64);
    expect(s.complete).toBe(true);
    expect(s.wrongPresses).toBe(0);
  });

  it('restarts on a wrong key, keeping the first target if that is what was pressed', () => {
    let s = initialTryIt(t);
    s = advanceTryIt(t, s, 60);
    s = advanceTryIt(t, s, 65);
    expect(s.done).toBe(0);
    expect(s.wrongPresses).toBe(1);
    s = advanceTryIt(t, s, 60);
    s = advanceTryIt(t, s, 60); // repeated first target counts as a slip back to 1
    expect(s.done).toBe(1);
    expect(s.wrongPresses).toBe(2);
  });

  it('ignores presses after completion', () => {
    let s = initialTryIt(t);
    for (const m of [60, 62, 64, 99]) s = advanceTryIt(t, s, m);
    expect(s.complete).toBe(true);
    expect(s.wrongPresses).toBe(0);
  });

  it('accepts any octave when asked', () => {
    const any = { ...t, anyOctave: true };
    let s = initialTryIt(any);
    s = advanceTryIt(any, s, 72);
    expect(s.done).toBe(1);
  });
});

describe('advanceTryIt (any order)', () => {
  const t = { prompt: '', targetMidis: [60, 64, 67], anyOrder: true };
  it('collects targets in any order and does not punish repeats', () => {
    let s = initialTryIt(t);
    s = advanceTryIt(t, s, 67);
    s = advanceTryIt(t, s, 67);
    s = advanceTryIt(t, s, 60);
    expect(s.done).toBe(2);
    expect(s.wrongPresses).toBe(0);
    s = advanceTryIt(t, s, 61);
    expect(s.wrongPresses).toBe(1);
    s = advanceTryIt(t, s, 64);
    expect(s.complete).toBe(true);
  });
});

describe('tryItHeld', () => {
  it('needs every target held, octave-tolerant when asked', () => {
    const t = { prompt: '', targetMidis: [60, 64, 67], together: true };
    expect(tryItHeld(t, [60, 64, 67])).toBe(true);
    expect(tryItHeld(t, [60, 64])).toBe(false);
    expect(tryItHeld({ ...t, anyOctave: true }, [48, 64, 79])).toBe(true);
  });
});

describe('scoreConcept', () => {
  it('is 100 with nothing skipped and floors at 70', () => {
    expect(scoreConcept(0, 0)).toBe(100);
    expect(scoreConcept(3, 0)).toBe(100);
    expect(scoreConcept(3, 1)).toBe(90);
    expect(scoreConcept(3, 3)).toBe(70);
    expect(scoreConcept(5, 5)).toBe(70);
  });
});
