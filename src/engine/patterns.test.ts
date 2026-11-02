import { describe, expect, it } from 'vitest';
import { PatternTemplate } from '../types/lesson';
import { buildPatternSong, generatePatternScore, patternBeats, toneMidi, transposeProgression, validateTemplate } from './patterns';

const alberti: PatternTemplate = {
  id: 'alberti',
  label: 'Alberti',
  timeSignature: [4, 4],
  steps: [1, 5, 3, 5, 1, 5, 3, 5].map((tone, i) => ({ tone, beat: i * 0.5, durationBeats: 0.5 })),
};

const prog = [
  { rootPc: 0, quality: 'major' as const },
  { rootPc: 7, quality: 'major' as const },
];

describe('toneMidi', () => {
  it('maps tone numbers onto the chord voicing', () => {
    const c = { rootPc: 0, quality: 'major' as const };
    expect([1, 3, 5, 8, 10, 12].map((t) => toneMidi(c, 48, t))).toEqual([48, 52, 55, 60, 64, 67]);
    // seventh falls back to the fifth on a triad, and is the real seventh on a 7th chord
    expect(toneMidi(c, 48, 7)).toBe(55);
    expect(toneMidi({ rootPc: 7, quality: 'dom7' }, 48, 7)).toBe(65);
  });
});

describe('generatePatternScore', () => {
  it('lays the template over each chord, one bar per chord', () => {
    const notes = generatePatternScore(alberti, prog, { bpm: 60 });
    expect(notes).toHaveLength(16);
    expect(notes.slice(0, 4).map((n) => n.midi)).toEqual([48, 55, 52, 55]);
    expect(notes[8].midi).toBe(55); // G root starts bar 2
    expect(notes[8].startTime).toBe(4);
    expect(notes[8].measure).toBe(2);
    expect(notes[0].chordSymbol).toBe('C');
    expect(notes[1].chordSymbol).toBeUndefined();
    expect(notes.every((n) => n.hand === 'left')).toBe(true);
    expect(notes[0].finger).toBe(5);
  });

  it('repeats and respects 3/4 templates', () => {
    const waltz: PatternTemplate = {
      id: 'w',
      label: 'Waltz',
      timeSignature: [3, 4],
      steps: [
        { tone: 1, beat: 0, durationBeats: 1 },
        { tone: 3, beat: 1, durationBeats: 1 },
        { tone: 5, beat: 1, durationBeats: 1 },
        { tone: 3, beat: 2, durationBeats: 1 },
        { tone: 5, beat: 2, durationBeats: 1 },
      ],
    };
    expect(patternBeats(waltz)).toBe(3);
    const notes = generatePatternScore(waltz, prog, { bpm: 120, repeats: 2 });
    expect(notes).toHaveLength(20);
    expect(notes.at(-1)?.startTime).toBe((3 * 4 - 1) * 0.5);
  });
});

describe('buildPatternSong', () => {
  it('produces a song with the left hand in every tier and chords on top in pro', () => {
    const song = buildPatternSong({ lessonId: 'x', title: 'T', template: alberti, progression: prog, bpm: 60 });
    expect(song.arrangements.beginner.notes).toHaveLength(16);
    expect(song.arrangements.pro.notes).toHaveLength(16 + 6);
    expect(song.arrangements.pro.notes.filter((n) => n.hand === 'right').map((n) => n.midi).slice(0, 3)).toEqual([60, 64, 67]);
    expect(song.totalMeasures).toBe(2);
    expect(song.keySignature).toBe('C');
    expect(song.teacherGuide?.steps[0].handFilter).toBe('left');
    expect(song.id).toContain('pattern:x:alberti');
  });
});

describe('transposeProgression and validateTemplate', () => {
  it('transposes pitch classes', () => {
    expect(transposeProgression(prog, 5).map((c) => c.rootPc)).toEqual([5, 0]);
    expect(transposeProgression(prog, -1).map((c) => c.rootPc)).toEqual([11, 6]);
  });
  it('rejects empty and overrunning templates', () => {
    expect(validateTemplate({ ...alberti, steps: [] })).toMatch(/at least one/);
    expect(validateTemplate({ ...alberti, steps: [{ tone: 1, beat: 7.5, durationBeats: 1 }] })).toMatch(/past the end/);
    expect(validateTemplate({ ...alberti, steps: [{ tone: 4, beat: 0, durationBeats: 1 }] })).toMatch(/Unknown tone/);
    expect(validateTemplate(alberti)).toBeNull();
  });
});
