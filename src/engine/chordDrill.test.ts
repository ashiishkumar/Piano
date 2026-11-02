import { describe, expect, it } from 'vitest';
import { ChordDrillLesson } from '../types/lesson';
import { chordDueTimes, evaluateHeld, scoreChordDrill, specSymbol, specVoicing } from './chordDrill';

const base: ChordDrillLesson = {
  id: 'cd',
  code: 'cd',
  levelId: 4,
  title: 'drill',
  track: 'chords',
  type: 'chord-drill',
  status: 'ready',
  durationMinutes: 5,
  objectives: [],
  sequence: [
    { rootPc: 0, quality: 'major' },
    { rootPc: 5, quality: 'major' },
    { rootPc: 7, quality: 'major' },
  ],
  mode: 'free',
  match: {},
  repeats: 1,
};

describe('evaluateHeld', () => {
  const c = base.sequence[0];
  it('matches any voicing of the target', () => {
    expect(evaluateHeld(c, [60, 64, 67], {})).toBe('match');
    expect(evaluateHeld(c, [52, 67, 72], {})).toBe('match');
  });
  it('is partial while the chord is incomplete', () => {
    expect(evaluateHeld(c, [60], {})).toBe('partial');
    expect(evaluateHeld(c, [60, 64], {})).toBe('partial');
    expect(evaluateHeld(c, [], {})).toBe('partial');
  });
  it('is wrong only for a complete, different chord', () => {
    expect(evaluateHeld(c, [57, 60, 64], {})).toBe('wrong'); // Am
    expect(evaluateHeld(c, [60, 61, 62], {})).toBe('partial'); // three notes, not a chord
  });
});

describe('spec helpers', () => {
  it('names and voices chords', () => {
    expect(specSymbol({ rootPc: 9, quality: 'minor' })).toBe('Am');
    expect(specSymbol({ rootPc: 9, quality: 'minor', label: 'Dha minor' })).toBe('Dha minor');
    expect(specVoicing({ rootPc: 0, quality: 'major' })).toEqual([48, 52, 55]);
    expect(specVoicing({ rootPc: 0, quality: 'major', inversion: 1 }, 'right')).toEqual([64, 67, 72]);
  });
});

describe('scoreChordDrill', () => {
  const r = (i: number, transitionMs: number, wrongAttempts = 0) => ({ index: i, symbol: 'C', transitionMs, wrongAttempts });

  it('free mode: full marks for completing, minus 8 per wrong chord', () => {
    expect(scoreChordDrill(base, [r(0, 900), r(1, 1200), r(2, 800)]).score).toBe(100);
    const s = scoreChordDrill(base, [r(0, 900), r(1, 1200, 2), r(2, 800)]);
    expect(s.score).toBe(84);
    expect(s.wrongAttempts).toBe(2);
    expect(s.cleanChanges).toBe(2);
    expect(s.meanTransitionMs).toBe(967);
  });

  it('timed mode: rewards transitions under the target', () => {
    const timed: ChordDrillLesson = { ...base, mode: 'timed', targetTransitionMs: 1000 };
    expect(scoreChordDrill(timed, [r(0, 500), r(1, 900), r(2, 1000)]).score).toBe(100);
    expect(scoreChordDrill(timed, [r(0, 500), r(1, 1500), r(2, 2500)]).score).toBe(80); // (100+80+60)/3
  });

  it('metronome mode: scores drift from the due beat, missed = 45', () => {
    const metro: ChordDrillLesson = { ...base, mode: 'metronome', bpm: 60, beatsPerChord: 4 };
    const s = scoreChordDrill(metro, [
      { index: 0, symbol: 'C', transitionMs: 0, wrongAttempts: 0, deltaMs: 10 },
      { index: 1, symbol: 'F', transitionMs: 0, wrongAttempts: 0, deltaMs: 80 },
      { index: 2, symbol: 'G', transitionMs: 0, wrongAttempts: 0, missed: true },
    ]);
    expect(s.score).toBe(Math.round((100 + 68 + 45) / 3));
  });

  it('counts total across repeats and clamps', () => {
    const twice = { ...base, repeats: 2 };
    const s = scoreChordDrill(twice, [r(0, 500)]);
    expect(s.total).toBe(6);
    expect(s.score).toBe(17); // 100 * 1/6
  });
});

describe('chordDueTimes', () => {
  it('spaces chords by beatsPerChord after a one-bar count-in', () => {
    const metro: ChordDrillLesson = { ...base, mode: 'metronome', bpm: 120, beatsPerChord: 4 };
    const d = chordDueTimes(metro);
    expect(d.secondsPerBeat).toBe(0.5);
    expect(d.dueSec).toEqual([2, 4, 6]);
    expect(d.totalSec).toBe(8);
  });
});
