import { NoteEvaluationEvent, ScoreNote, SongScore } from '../../types/music';

/** Build a note with sensible defaults; 1 beat = 1 second (60 BPM) unless overridden. */
export function note(partial: Partial<ScoreNote> & { id: string; midi: number; startTime: number }): ScoreNote {
  return {
    duration: 1,
    measure: Math.floor(partial.startTime / 4) + 1,
    beat: (partial.startTime % 4) + 1,
    hand: 'right',
    velocity: 80,
    ...partial,
  };
}

/**
 * Four-bar test song at 60 BPM in 4/4 (1 beat = 1 s, 1 measure = 4 s).
 * RH: C4 D4 E4 F4 on beats 1-4 of bar 1, then a C4+E4 chord on bar 2 beat 1.
 * LH: C3 on bar 1 beat 1, G2 on bar 2 beat 1.
 */
export function makeTestSong(): SongScore {
  const notes: ScoreNote[] = [
    note({ id: 'r1', midi: 60, startTime: 0, finger: 1 }),
    note({ id: 'r2', midi: 62, startTime: 1, finger: 2 }),
    note({ id: 'r3', midi: 64, startTime: 2, finger: 3 }),
    note({ id: 'r4', midi: 65, startTime: 3, finger: 4 }),
    note({ id: 'r5a', midi: 60, startTime: 4, duration: 2, articulation: 'legato' }),
    note({ id: 'r5b', midi: 64, startTime: 4, duration: 2, articulation: 'legato' }),
    note({ id: 'l1', midi: 48, startTime: 0, duration: 4, hand: 'left', velocity: 60 }),
    note({ id: 'l2', midi: 43, startTime: 4, duration: 4, hand: 'left', velocity: 60 }),
  ];
  const arrangement = { tier: 'beginner' as const, label: 'Test', description: '', notes };
  return {
    id: 'test-song',
    title: 'Test Song',
    subtitle: '',
    composer: 'Fixture',
    stageId: 1,
    category: 'drill',
    bpm: 60,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    totalMeasures: 4,
    durationSeconds: 16,
    pedagogyFocus: ['test'],
    coachTip: '',
    arrangements: {
      beginner: arrangement,
      intermediate: { ...arrangement, tier: 'intermediate' },
      pro: { ...arrangement, tier: 'pro' },
    },
  };
}

export function hit(partial: Partial<NoteEvaluationEvent> & { noteId: string }): NoteEvaluationEvent {
  return {
    expectedMidi: 60,
    actualMidi: 60,
    hand: 'right',
    measure: 1,
    expectedTime: 0,
    actualTime: 0,
    deltaMs: 0,
    timingClass: 'perfect',
    expectedVelocity: 80,
    actualVelocity: 80,
    expectedDuration: 1,
    isWrongPitch: false,
    isFatFinger: false,
    ...partial,
  };
}
