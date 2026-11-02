import { CheckpointPayload } from './types';

/**
 * PIX Series Zero to Hero Piano Course Checkpoints
 * Each checkpoint verifies mastery of the key lessons in its module.
 */

export const RHYTHM_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: '2I · Metronome & Rhythm Mastery Checkpoint',
  subtitle: 'Pass Note Values (2F), Rhythm Tap (2G), and the 4 Rhythm Formats Piano Drill at 75%+.',
  track: 'play',
  durationMinutes: 8,
  source: 'course 2I',
  objectives: [
    'Play Whole, Half, Quarter, and Eighth notes accurately against the metronome click',
  ],
  passAll: true,
  parts: [
    { lessonId: 'note-values', passScore: 75 },
    { lessonId: 'playing-in-rhythm', passScore: 75 },
    { lessonId: 'zth-2g-rhythm-formats', passScore: 75 },
  ],
};

export const RIGHT_HAND_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: '2J · Module 2 Right-Hand Mastery Checkpoint',
  subtitle: 'Pass Alankars (2B), Happy Birthday (2C), Top #4 RH Drills (2E), and Advanced RH Octaves/Thirds (2J) at 75%+.',
  track: 'play',
  durationMinutes: 10,
  source: 'course 2J',
  objectives: [
    'Play Sargam Alankars in C# and C, the Top #4 Right-Hand Exercises, and the Final Stage RH Workout in time',
  ],
  passAll: true,
  parts: [
    { lessonId: 'zth-2b-alankars-kali-ek', passScore: 75 },
    { lessonId: 'zth-2b-alankars-safed-ek', passScore: 75 },
    { lessonId: 'zth-2c-happy-birthday', passScore: 75 },
    { lessonId: 'zth-2e-rh-ex1', passScore: 75 },
    { lessonId: 'zth-2e-rh-ex2', passScore: 75 },
    { lessonId: 'zth-2e-rh-ex3', passScore: 75 },
    { lessonId: 'zth-2e-rh-ex4', passScore: 75 },
    { lessonId: 'zth-2j-master-rh', passScore: 75 },
  ],
};

export const THEORY_CHECKPOINT: CheckpointPayload = {
  type: 'checkpoint',
  title: '3F · Module 3 Scales, Chords & Circle of Fifths Checkpoint',
  subtitle: 'Pass Major & Minor Scales (3A–3B), Chords (3C), Inversions (3D), Advanced Chords (3E) & Circle of Fifths (3F) at 75%+.',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 3F',
  objectives: [
    'Build any Major or Minor scale from the W-W-H-W-W-W-H and W-H-W-W-H-W-W formulas',
    'Play Major (4-3) and Minor (3-4) triads, inversions, and sus2/sus4/7th/add9 chords',
    'Answer the Circle of Fifths and Relative Minor quiz at 75%+',
  ],
  passAll: true,
  parts: [
    { lessonId: 'major-scale-formula', passScore: 75 },
    { lessonId: 'natural-minor-formula', passScore: 75 },
    { lessonId: 'building-triads', passScore: 75 },
    { lessonId: 'zth-3d-chord-inversions', passScore: 75 },
    { lessonId: 'chord-types', passScore: 75 },
    { lessonId: 'relative-keys-quiz', passScore: 75 },
  ],
};
