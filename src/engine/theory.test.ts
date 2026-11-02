import { describe, expect, it } from 'vitest';
import { makeTestSong } from './__fixtures__/songs';
import {
  CIRCLE_OF_FIFTHS,
  chordMidis,
  chordPitchClasses,
  chordSymbol,
  detectKey,
  diatonicTriads,
  foldIntoRange,
  matchesChordTarget,
  parsePitchClass,
  pitchClassName,
  recognizeChord,
  relativeMajorOf,
  relativeMinorOf,
  scaleMidis,
  scalePitchClasses,
  transposeNotes,
  transposeSong,
} from './theory';

describe('pitch classes', () => {
  it('names and parses sharps and flats', () => {
    expect(pitchClassName(61)).toBe('C#');
    expect(pitchClassName(61, true)).toBe('Db');
    expect(parsePitchClass('Bb')).toBe(10);
    expect(parsePitchClass('f#')).toBe(6);
    expect(parsePitchClass('H')).toBeNull();
  });
});

describe('scales', () => {
  it('builds the major scale formula W W H W W W H', () => {
    expect(scalePitchClasses(0, 'major')).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(scalePitchClasses(7, 'major')).toEqual([7, 9, 11, 0, 2, 4, 6]);
  });
  it('Kalyan thaat has tivra Ma (F# on C)', () => {
    expect(scalePitchClasses(0, 'kalyan')).toContain(6);
    expect(scalePitchClasses(0, 'kalyan')).not.toContain(5);
  });
  it('generates ascending midis across octaves including the top note', () => {
    expect(scaleMidis(60, 'major', 1)).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
    expect(scaleMidis(60, 'major-pentatonic', 2)).toHaveLength(11);
  });
  it('circle of fifths starts C G D A', () => {
    expect(CIRCLE_OF_FIFTHS.slice(0, 4)).toEqual([0, 7, 2, 9]);
    expect(new Set(CIRCLE_OF_FIFTHS).size).toBe(12);
  });
  it('relative keys', () => {
    expect(relativeMinorOf(0)).toBe(9); // C major -> A minor
    expect(relativeMajorOf(9)).toBe(0);
    expect(relativeMinorOf(7)).toBe(4); // G major -> E minor
  });
});

describe('chords', () => {
  it('builds chord tones and symbols', () => {
    expect(chordPitchClasses(0, 'major')).toEqual([0, 4, 7]);
    expect(chordPitchClasses(9, 'minor')).toEqual([9, 0, 4]);
    expect(chordSymbol(7, 'dom7')).toBe('G7');
    expect(chordSymbol(10, 'minor', true)).toBe('Bbm');
  });

  it('voices inversions by lifting the bottom notes an octave', () => {
    expect(chordMidis(60, 'major', 0)).toEqual([60, 64, 67]);
    expect(chordMidis(60, 'major', 1)).toEqual([64, 67, 72]);
    expect(chordMidis(60, 'major', 2)).toEqual([67, 72, 76]);
    expect(chordMidis(60, 'dom7', 3)).toEqual([70, 72, 76, 79]);
  });

  it('recognises triads in any octave and names inversions with a slash', () => {
    expect(recognizeChord([60, 64, 67])?.symbol).toBe('C');
    expect(recognizeChord([64, 67, 72])?.symbol).toBe('C/E');
    expect(recognizeChord([64, 67, 72])?.inversion).toBe(1);
    expect(recognizeChord([55, 64, 72])?.symbol).toBe('C/G');
    expect(recognizeChord([57, 60, 64])?.symbol).toBe('Am');
    expect(recognizeChord([48, 60, 64, 67, 72])?.symbol).toBe('C'); // doubled root
  });

  it('recognises sevenths, suspended and dim/aug', () => {
    expect(recognizeChord([55, 59, 62, 65])?.symbol).toBe('G7');
    expect(recognizeChord([60, 64, 67, 71])?.symbol).toBe('Cmaj7');
    expect(recognizeChord([62, 65, 69, 72])?.symbol).toBe('Dm7');
    expect(recognizeChord([60, 65, 67])?.symbol).toBe('Csus4');
    expect(recognizeChord([59, 62, 65])?.symbol).toBe('Bdim');
    expect(recognizeChord([60, 64, 68])?.symbol).toBe('Caug');
  });

  it('prefers the name whose root is in the bass and lists alternatives', () => {
    // C E G A: C6 with C in bass, Am7 with A in bass
    const c6 = recognizeChord([60, 64, 67, 69])!;
    expect(c6.symbol).toBe('C6');
    expect(c6.alternatives.map((a) => a.symbol)).toContain('Am7/C');
    const am7 = recognizeChord([57, 60, 64, 67])!;
    expect(am7.symbol).toBe('Am7');
  });

  it('returns null for single notes and non-chords', () => {
    expect(recognizeChord([60])).toBeNull();
    expect(recognizeChord([60, 61, 62])).toBeNull();
  });

  it('open fifth is recognised for Sa–Pa drones', () => {
    expect(recognizeChord([48, 55])?.symbol).toBe('C5');
  });
});

describe('matchesChordTarget', () => {
  it('accepts inversions, octave spreads and doubling by default', () => {
    expect(matchesChordTarget([60, 64, 67], 0, 'major')).toBe(true);
    expect(matchesChordTarget([64, 67, 72], 0, 'major')).toBe(true);
    expect(matchesChordTarget([48, 64, 79], 0, 'major')).toBe(true);
    expect(matchesChordTarget([48, 60, 64, 67], 0, 'major')).toBe(true);
  });
  it('rejects wrong or missing tones', () => {
    expect(matchesChordTarget([60, 64], 0, 'major')).toBe(false);
    expect(matchesChordTarget([60, 63, 67], 0, 'major')).toBe(false);
    expect(matchesChordTarget([60, 64, 67, 70], 0, 'major')).toBe(false);
    expect(matchesChordTarget([], 0, 'major')).toBe(false);
  });
  it('can insist on root position, close voicing and no doubling', () => {
    expect(matchesChordTarget([64, 67, 72], 0, 'major', { allowInversion: false })).toBe(false);
    expect(matchesChordTarget([48, 64, 79], 0, 'major', { allowOctaveShift: false })).toBe(false);
    expect(matchesChordTarget([60, 64, 67], 0, 'major', { allowOctaveShift: false })).toBe(true);
    expect(matchesChordTarget([48, 60, 64, 67], 0, 'major', { allowDoubling: false })).toBe(false);
  });
});

describe('diatonicTriads', () => {
  it('gives the chord family of C major', () => {
    expect(diatonicTriads(0, 'major').map((c) => c.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
  });
  it('gives the chord family of A minor', () => {
    expect(diatonicTriads(9, 'minor').map((c) => c.symbol)).toEqual(['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G']);
    expect(diatonicTriads(9, 'minor')[4].numeral).toBe('v');
  });
});

describe('transposition', () => {
  const song = makeTestSong();
  const notes = song.arrangements.beginner.notes;

  it('shifts every note and folds into a range', () => {
    const up = transposeNotes(notes, 5);
    expect(up.find((n) => n.id === 'r1')?.midi).toBe(65);
    expect(foldIntoRange(100, 36, 96)).toBe(88);
    expect(foldIntoRange(30, 36, 96)).toBe(42);
    const folded = transposeNotes([{ ...notes[0], midi: 95 }], 5, { minMidi: 36, maxMidi: 96 });
    expect(folded[0].midi).toBe(88);
  });

  it('returns the same array for zero semitones', () => {
    expect(transposeNotes(notes, 0)).toBe(notes);
  });

  it('transposes a whole song and relabels the key', () => {
    const g = transposeSong(song, 7);
    expect(g.id).toBe('test-song@+7');
    expect(g.keySignature).toBe('G');
    expect(g.rootSaMidi).toBe(7);
    expect(g.arrangements.pro.notes.find((n) => n.id === 'l1')?.midi).toBe(55);
    const am = transposeSong({ ...song, keySignature: 'Am' }, -2);
    expect(am.keySignature).toBe('Gm');
  });
});

describe('detectKey', () => {
  it('hears a C major scale as C major and A minor material as A minor', () => {
    const cMajor = [60, 62, 64, 65, 67, 69, 71, 72, 67, 64, 60].map((m) => ({ midi: m, duration: 1 }));
    const k = detectKey(cMajor)!;
    expect(k.mode).toBe('major');
    expect(k.rootPc).toBe(0);
    expect(k.confidence).toBeGreaterThan(0.7);

    const aMinor = [57, 60, 64, 57, 59, 60, 62, 64, 68, 69, 57, 64, 57].map((m) => ({ midi: m, duration: 1 }));
    const a = detectKey(aMinor)!;
    expect(a.label).toBe('A minor');
  });
  it('returns null for no notes', () => {
    expect(detectKey([])).toBeNull();
  });
});
