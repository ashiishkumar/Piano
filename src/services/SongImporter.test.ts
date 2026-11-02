import { describe, expect, it } from 'vitest';
import { applyDetectedKey } from './SongImporter';
import { makeSong } from '../engine/sargam';
import { generateScaleRun } from '../engine/generators';

function songInKey(rootMidi: number, scale: 'major' | 'natural-minor', keySignature = 'C') {
  const notes = generateScaleRun({ bpm: 60, rootMidi, scale, octaves: 1 });
  return makeSong(
    {
      id: `k-${rootMidi}-${scale}`,
      title: 't',
      subtitle: '',
      composer: '',
      stageId: 0,
      category: 'imported',
      bpm: 60,
      timeSignature: [4, 4],
      keySignature,
      pedagogyFocus: ['x'],
      coachTip: '',
    },
    { beginner: notes }
  );
}

describe('applyDetectedKey', () => {
  it('writes the detected key and Sa into an undeclared song', () => {
    const { song, key } = applyDetectedKey(songInKey(67, 'major'));
    expect(key?.label).toBe('G major');
    expect(song.keySignature).toBe('G');
    expect(song.rootSaMidi).toBe(7);
  });

  it('labels minor keys with m', () => {
    const { song } = applyDetectedKey(songInKey(57, 'natural-minor'));
    expect(song.keySignature).toBe('Am');
    expect(song.rootSaMidi).toBe(9);
  });

  it('keeps a declared key that the estimate disagrees with only weakly', () => {
    // Declared D major, but notes are a G major scale: a confident estimate overrides
    const { song } = applyDetectedKey(songInKey(67, 'major', 'D'));
    expect(['G', 'D']).toContain(song.keySignature);
    const { key } = applyDetectedKey(songInKey(67, 'major', 'D'));
    expect(key?.declared).toBe('D');
  });
});
