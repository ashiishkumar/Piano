import { describe, expect, it } from 'vitest';
import { makeSong, parseSargam, songFromSargam } from './sargam';

const opts = { bpm: 60, timeSignature: [4, 4] as [number, number] };

describe('parseSargam', () => {
  it('reads shuddha notes one matra each from Middle C', () => {
    const p = parseSargam('S R G M | P D N S\'', opts);
    expect(p.notes.map((n) => n.midi)).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
    expect(p.notes.map((n) => n.startTime)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(p.notes.every((n) => n.duration === 1)).toBe(true);
    expect(p.totalBeats).toBe(8);
    expect(p.totalMeasures).toBe(2);
    expect(p.durationSeconds).toBe(8);
    expect(p.notes[4]).toMatchObject({ measure: 2, beat: 1, hand: 'right' });
  });

  it('reads komal and tivra notes', () => {
    const p = parseSargam('S r R g G M m P d D n N', opts);
    expect(p.notes.map((n) => n.midi)).toEqual([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]);
  });

  it('reads octave marks and finger numbers', () => {
    const p = parseSargam("S, S S' S''3 P,2", opts);
    expect(p.notes.map((n) => n.midi)).toEqual([48, 60, 72, 84, 55]);
    expect(p.notes[3].finger).toBe(3);
    expect(p.notes[4].finger).toBe(2);
  });

  it('holds with dashes and rests with zeros', () => {
    const p = parseSargam('S - - R 0 G', opts);
    expect(p.notes.map((n) => [n.midi, n.startTime, n.duration])).toEqual([
      [60, 0, 3],
      [62, 3, 1],
      [64, 5, 1],
    ]);
    expect(p.totalBeats).toBe(6);
  });

  it('splits a bracketed group across one matra', () => {
    const p = parseSargam('(S R) G (M P D)', opts);
    expect(p.notes.map((n) => [n.midi, n.startTime, n.duration])).toEqual([
      [60, 0, 0.5],
      [62, 0.5, 0.5],
      [64, 1, 1],
      [65, 2, 0.3333],
      [67, 2.3333, 0.3333],
      [69, 2.6667, 0.3333],
    ]);
  });

  it('places the left hand an octave down and keeps hands on independent clocks', () => {
    const p = parseSargam('RH: S R G M\nLH: S, - - -', opts);
    const lh = p.notes.filter((n) => n.hand === 'left');
    expect(lh).toHaveLength(1);
    expect(lh[0]).toMatchObject({ midi: 36, startTime: 0, duration: 4, velocity: 62 });
    expect(p.notes.filter((n) => n.hand === 'right')).toHaveLength(4);
  });

  it('ignores comments and bar lines, and keeps the hand across lines', () => {
    const p = parseSargam('# intro\nRH: S R | G M |\nP D N S\' # second line still RH', opts);
    expect(p.notes).toHaveLength(8);
    expect(p.notes.every((n) => n.hand === 'right')).toBe(true);
  });

  it('honours a different Sa and tempo', () => {
    const p = parseSargam('S P', { bpm: 120, timeSignature: [4, 4], saMidi: 67 });
    expect(p.notes.map((n) => n.midi)).toEqual([67, 74]);
    expect(p.notes[1].startTime).toBe(0.5);
  });

  it('rejects things it cannot read', () => {
    expect(() => parseSargam('S X', opts)).toThrow(/cannot read token "X"/);
    expect(() => parseSargam('(S R', opts)).toThrow(/unclosed/);
  });
});

describe('song assembly', () => {
  const spec = {
    id: 'test-sargam',
    title: 'Test',
    subtitle: '',
    composer: 'Traditional',
    stageId: 1,
    category: 'drill' as const,
    bpm: 60,
    timeSignature: [4, 4] as [number, number],
    keySignature: 'C',
    pedagogyFocus: ['test'],
    coachTip: 'tip',
  };

  it('builds a song with measures and duration from the notes', () => {
    const song = songFromSargam(spec, { beginner: 'S R G M | P - - -' });
    expect(song.totalMeasures).toBe(2);
    expect(song.durationSeconds).toBe(8);
    expect(song.arrangements.beginner.notes).toHaveLength(5);
    // missing tiers reuse beginner
    expect(song.arrangements.pro.notes).toBe(song.arrangements.beginner.notes);
    expect(song.rootSaMidi).toBe(0);
  });

  it('keeps distinct tiers and ids', () => {
    const song = songFromSargam(spec, { beginner: 'S R', pro: 'RH: S R\nLH: S, -' });
    expect(song.arrangements.beginner.notes.map((n) => n.id)).toEqual(['test-sargam-b-r0', 'test-sargam-b-r1']);
    expect(song.arrangements.pro.notes).toHaveLength(3);
    expect(song.arrangements.intermediate.notes).toBe(song.arrangements.beginner.notes);
  });

  it('makeSong computes measures from the longest tier', () => {
    const song = makeSong(spec, {
      beginner: [{ id: 'a', midi: 60, startTime: 0, duration: 1, measure: 1, beat: 1, hand: 'right', velocity: 80 }],
      pro: [{ id: 'b', midi: 60, startTime: 7, duration: 1, measure: 2, beat: 4, hand: 'right', velocity: 80 }],
    });
    expect(song.totalMeasures).toBe(2);
  });
});
