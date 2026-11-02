import { describe, expect, it } from 'vitest';
import { EarItem } from '../types/lesson';
import { advanceEar, earChordHeld, earPlayback, initialEarState, playbackLength, scoreEarItem, scoreEarLesson } from './ear';

const melody: EarItem = { kind: 'melody', referenceMidi: 60, targetMidis: [60, 62, 64], anyOctave: true };
const chord: EarItem = { kind: 'chord', targetMidis: [57, 60, 64] };

describe('advanceEar', () => {
  it('accepts the sequence in order, any octave when allowed', () => {
    let s = initialEarState();
    s = advanceEar(melody, s, 72);
    s = advanceEar(melody, s, 62);
    expect(s.played).toEqual([72, 62]);
    s = advanceEar(melody, s, 76);
    expect(s.complete).toBe(true);
    expect(s.wrongAttempts).toBe(0);
  });
  it('resets on a wrong note and counts it', () => {
    let s = initialEarState();
    s = advanceEar(melody, s, 60);
    s = advanceEar(melody, s, 65);
    expect(s.played).toEqual([]);
    expect(s.wrongAttempts).toBe(1);
    s = advanceEar(melody, s, 60);
    expect(s.played).toEqual([60]);
  });
  it('ignores notes for chord items', () => {
    const s = advanceEar(chord, initialEarState(), 57);
    expect(s.played).toEqual([]);
  });
});

describe('earChordHeld', () => {
  it('matches pitch-class sets, flags complete wrong chords, waits on partials', () => {
    expect(earChordHeld(chord, [57, 60, 64])).toBe('match');
    expect(earChordHeld(chord, [69, 72, 76])).toBe('match');
    expect(earChordHeld(chord, [60, 64, 67])).toBe('wrong');
    expect(earChordHeld(chord, [57, 60])).toBe('partial');
    expect(earChordHeld(chord, [])).toBe('partial');
  });
});

describe('scoring', () => {
  it('penalises wrong attempts and paid replays', () => {
    expect(scoreEarItem({ played: [], wrongAttempts: 0, replaysUsed: 1, complete: true }, 1)).toBe(100);
    expect(scoreEarItem({ played: [], wrongAttempts: 1, replaysUsed: 3, complete: true }, 1)).toBe(60);
    expect(scoreEarItem({ played: [], wrongAttempts: 6, replaysUsed: 0, complete: true }, 1)).toBe(0);
    expect(scoreEarLesson([initialEarState(), { ...initialEarState(), wrongAttempts: 1 }], 1)).toBe(90);
    expect(scoreEarLesson([], 1)).toBe(0);
  });
});

describe('earPlayback', () => {
  it('plays the reference, then the target in sequence', () => {
    const ev = earPlayback(melody);
    expect(ev[0]).toMatchObject({ midi: 60, at: 0 });
    expect(ev.slice(1).map((e) => e.at)).toEqual([1.2, 1.75, 2.3]);
    expect(playbackLength(ev)).toBeCloseTo(2.3 + 0.55 * 0.9, 5);
  });
  it('plays a chord together', () => {
    const ev = earPlayback(chord);
    expect(ev.map((e) => e.at)).toEqual([0, 0, 0]);
    expect(playbackLength(ev)).toBe(1.6);
  });
});
