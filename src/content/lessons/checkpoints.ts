import { CheckpointPayload } from './types';

/**
 * Checkpoints gate the next level. Each names the lessons that must be passed
 * (by stable lesson id) and the score each needs.
 */

export const RHYTHM_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: 'Rhythm mastery test',
  subtitle: 'Both rhythm drills at 75 or better',
  track: 'play',
  durationMinutes: 8,
  source: 'course 2I',
  objectives: ['Tap note values and rests in time with a click, twice through, with no stray taps'],
  passAll: true,
  parts: [
    { lessonId: 'note-values', passScore: 75 },
    { lessonId: 'playing-in-rhythm', passScore: 75 },
  ],
};

export const RIGHT_HAND_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: 'Right-hand checkpoint',
  subtitle: 'Every right-hand song in Levels 1 and 2 at 75 or better. Unlocks Level 3.',
  track: 'play',
  durationMinutes: 10,
  source: 'course 2J',
  objectives: ['Play the five-finger home, the alankars, the scale and both songs with the right hand, in time'],
  passAll: true,
  parts: [
    { lessonId: 'stage1-five-finger-home', passScore: 75 },
    { lessonId: 'stage1-alankar-1-steps', passScore: 75 },
    { lessonId: 'stage1-alankar-2-skips', passScore: 75 },
    { lessonId: 'gen-alankars-3-6', passScore: 75 },
    { lessonId: 'stage1-jana-gana-5note', passScore: 75 },
    { lessonId: 'stage2-thumb-tuck-drill', passScore: 75 },
    { lessonId: 'stage1-sargam-scale', passScore: 75 },
    { lessonId: 'stage1-om-shanti-om', passScore: 75 },
    { lessonId: 'stage1-happy-birthday', passScore: 75 },
  ],
};

export const THEORY_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: 'Theory checkpoint',
  subtitle: 'Scales, triads, chord types and relative keys. Unlocks Level 4.',
  track: 'theory',
  durationMinutes: 8,
  source: 'plan',
  objectives: ['Build a major and a minor scale from the formula', 'Hold the six triads of C and the common chord types', 'Name relative keys without hesitation'],
  passAll: true,
  parts: [
    { lessonId: 'major-scale-formula', passScore: 75 },
    { lessonId: 'natural-minor-formula', passScore: 75 },
    { lessonId: 'building-triads', passScore: 75 },
    { lessonId: 'chord-types', passScore: 75 },
    { lessonId: 'relative-keys-quiz', passScore: 75 },
  ],
};
