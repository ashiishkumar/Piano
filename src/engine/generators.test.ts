import { describe, expect, it } from 'vitest';
import {
  degreeMidi,
  generateAccompaniment,
  generateAlankar,
  generateChordToneMelody,
  generateScaleRun,
  scaleFinger,
} from './generators';

const midis = (ns: { midi: number }[]) => ns.map((n) => n.midi);

describe('degreeMidi and scaleFinger', () => {
  it('maps degrees across octaves', () => {
    expect(degreeMidi(60, 'major', 0)).toBe(60);
    expect(degreeMidi(60, 'major', 6)).toBe(71);
    expect(degreeMidi(60, 'major', 7)).toBe(72);
    expect(degreeMidi(60, 'major', 9)).toBe(76);
    expect(degreeMidi(60, 'major-pentatonic', 5)).toBe(72);
  });
  it('uses five-finger position inside Pa and the thumb tuck beyond it', () => {
    expect([0, 1, 2, 3, 4].map((d) => scaleFinger(d, 5))).toEqual([1, 2, 3, 4, 5]);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((d) => scaleFinger(d, 8))).toEqual([1, 2, 3, 1, 2, 3, 4, 5]);
    expect([0, 1, 2, 3, 4].map((d) => scaleFinger(d, 5, 'left'))).toEqual([5, 4, 3, 2, 1]);
  });
});

describe('generateAlankar', () => {
  it('builds the four-note palta inside the five-finger home, then mirrors it', () => {
    const notes = generateAlankar({ bpm: 60, pattern: [0, 1, 2, 3], topDegree: 4 });
    // starts at S and R: SRGM RGMP, then mirrored: PMGR MGRS
    expect(midis(notes)).toEqual([60, 62, 64, 65, 62, 64, 65, 67, 67, 65, 64, 62, 65, 64, 62, 60]);
    expect(notes.map((n) => n.finger)).toEqual([1, 2, 3, 4, 2, 3, 4, 5, 5, 4, 3, 2, 4, 3, 2, 1]);
    expect(notes[15].startTime).toBe(15);
  });

  it('can go to the octave and skip the descent', () => {
    const notes = generateAlankar({ bpm: 120, pattern: [0, 2], topDegree: 7, descend: false });
    // thirds from each degree up to Ni-Sa': S G, R M, G P, M D, P N, D S'
    expect(midis(notes)).toEqual([60, 64, 62, 65, 64, 67, 65, 69, 67, 71, 69, 72]);
    expect(notes[1].startTime).toBe(0.5);
  });

  it('works on another scale and root', () => {
    const notes = generateAlankar({ bpm: 60, pattern: [0, 1], topDegree: 2, scale: 'kalyan', rootMidi: 67, descend: false });
    expect(midis(notes)).toEqual([67, 69, 69, 71]);
  });
});

describe('generateScaleRun', () => {
  it('runs one octave up and down with tucked fingering', () => {
    const notes = generateScaleRun({ bpm: 60 });
    expect(midis(notes)).toEqual([60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60]);
    expect(notes.slice(0, 8).map((n) => n.finger)).toEqual([1, 2, 3, 1, 2, 3, 4, 5]);
  });
  it('handles two octaves of a pentatonic', () => {
    const notes = generateScaleRun({ bpm: 60, scale: 'major-pentatonic', octaves: 2, descend: false });
    expect(notes).toHaveLength(11);
    expect(notes.at(-1)?.midi).toBe(84);
  });
});

describe('generateAccompaniment', () => {
  const prog = [
    { rootPc: 0, quality: 'major' as const },
    { rootPc: 7, quality: 'major' as const },
  ];
  it('block style holds the whole chord for its beats', () => {
    const notes = generateAccompaniment({ bpm: 60, progression: prog, beatsPerChord: 4 });
    expect(notes).toHaveLength(6);
    expect(notes.slice(0, 3).map((n) => [n.midi, n.startTime, n.duration, n.finger])).toEqual([
      [48, 0, 4, 5],
      [52, 0, 4, 3],
      [55, 0, 4, 1],
    ]);
    expect(notes[3].startTime).toBe(4);
    expect(notes.every((n) => n.hand === 'left')).toBe(true);
  });
  it('root-fifth and broken styles subdivide the chord', () => {
    const rf = generateAccompaniment({ bpm: 60, progression: prog.slice(0, 1), style: 'root-fifth' });
    expect(rf.map((n) => [n.midi, n.startTime, n.duration])).toEqual([
      [48, 0, 2],
      [55, 2, 2],
    ]);
    const br = generateAccompaniment({ bpm: 60, progression: prog.slice(0, 1), style: 'broken' });
    expect(br.map((n) => n.midi)).toEqual([48, 52, 55, 52]);
    expect(br.map((n) => n.startTime)).toEqual([0, 1, 2, 3]);
  });
  it('repeats the progression', () => {
    const notes = generateAccompaniment({ bpm: 60, progression: prog, style: 'root', repeats: 2 });
    expect(midis(notes)).toEqual([48, 55, 48, 55]);
    expect(notes[3].startTime).toBe(12);
  });
});

describe('generateChordToneMelody', () => {
  it('plays 1-3-5-3 over each chord in the right hand', () => {
    const notes = generateChordToneMelody({ bpm: 60, progression: [{ rootPc: 0, quality: 'major' }], beatsPerChord: 4 });
    expect(midis(notes)).toEqual([60, 64, 67, 64]);
    expect(notes.map((n) => n.finger)).toEqual([1, 3, 5, 3]);
    expect(notes.every((n) => n.hand === 'right')).toBe(true);
  });
});
