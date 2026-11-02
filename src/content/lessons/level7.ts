import { EarItem } from '../../types/lesson';
import { ConceptPayload, EarPayload, K } from './types';

const SA = K.C4;
const note = (midi: number, prompt?: string): EarItem => ({ kind: 'note', referenceMidi: SA, targetMidis: [midi], anyOctave: false, prompt });
const interval = (a: number, b: number, prompt?: string): EarItem => ({ kind: 'interval', referenceMidi: SA, targetMidis: [a, b], anyOctave: false, prompt });
const melody = (midis: number[], prompt?: string): EarItem => ({ kind: 'melody', referenceMidi: SA, targetMidis: midis, anyOctave: false, noteSeconds: 0.5, prompt });
const chord = (midis: number[], prompt?: string): EarItem => ({ kind: 'chord', targetMidis: midis, anyOctave: true, prompt });

export const EAR_SINGLE_NOTES: EarPayload = {
  type: 'ear',
  title: 'Hear it, play it: single notes against Sa',
  subtitle: 'You hear Sa, then one note. Find it.',
  track: 'ear',
  durationMinutes: 8,
  source: 'course 7A',
  objectives: ['Hear a note\'s distance from Sa and find it on the keys', 'Tell Re from Ga, Pa from Dha, without looking'],
  freeReplays: 1,
  items: [
    note(K.G4, 'Sa, then a note. Pa is the easiest to hear: it sits in the middle.'),
    note(K.E4),
    note(K.D4),
    note(K.A4),
    note(K.F4),
    note(K.B4),
    note(K.C5),
    note(K.E4),
    note(K.G4),
    note(K.D4),
    note(K.A4),
    note(K.F4),
  ],
};

export const EAR_INTERVALS: EarPayload = {
  type: 'ear',
  title: 'Intervals',
  subtitle: 'Two notes. Play both back, in order.',
  track: 'ear',
  durationMinutes: 8,
  source: 'plan',
  objectives: ['Recognise the common intervals from Sa: second, third, fourth, fifth, sixth, octave', 'Hear direction: up or down'],
  freeReplays: 1,
  items: [
    interval(K.C4, K.G4, 'Sa to Pa: a fifth.'),
    interval(K.C4, K.E4, 'Sa to Ga: a major third.'),
    interval(K.C4, K.D4, 'Sa to Re: a second.'),
    interval(K.C4, K.C5, 'Sa to Sa: an octave.'),
    interval(K.C4, K.F4, 'Sa to Ma: a fourth.'),
    interval(K.C4, K.A4, 'Sa to Dha: a sixth.'),
    interval(K.G4, K.E4, 'Going down now.'),
    interval(K.E4, K.G4),
    interval(K.D4, K.A4),
    interval(K.C5, K.G4),
  ],
};

export const EAR_MELODIES: EarPayload = {
  type: 'ear',
  title: 'Short melodies by ear',
  subtitle: 'Three to five notes. Phrases built the way film hooks are built.',
  track: 'ear',
  durationMinutes: 10,
  source: 'plan',
  objectives: ['Hold a short phrase in your head and find it on the keys', 'Hear the shape first (up, down, turn), then the exact notes'],
  freeReplays: 2,
  items: [
    melody([K.C4, K.D4, K.E4], 'Sa Re Ga.'),
    melody([K.E4, K.D4, K.C4]),
    melody([K.C4, K.E4, K.G4]),
    melody([K.G4, K.F4, K.E4, K.D4, K.C4]),
    melody([K.C4, K.D4, K.E4, K.D4, K.C4]),
    melody([K.E4, K.G4, K.A4, K.G4]),
    melody([K.G4, K.A4, K.G4, K.E4, K.D4]),
    melody([K.C4, K.G4, K.A4, K.G4]),
    melody([K.D4, K.E4, K.F4, K.E4, K.D4]),
    melody([K.C5, K.B4, K.A4, K.G4]),
  ],
};

export const EAR_MAJOR_MINOR: EarPayload = {
  type: 'ear',
  title: 'Major or minor chord by ear',
  subtitle: 'Hear a chord, play it back. Bright or dark?',
  track: 'ear',
  durationMinutes: 6,
  source: 'course 8B',
  objectives: ['Hear the difference between a major and a minor third inside a chord', 'Play back the chord you heard, any octave'],
  freeReplays: 1,
  items: [
    chord([K.C4, K.E4, K.G4], 'C major. Bright.'),
    chord([K.A3, K.C4, K.E4], 'A minor. Dark. Same notes as C major but a different root.'),
    chord([K.F4, K.A4, K.C5]),
    chord([K.D4, K.F4, K.A4]),
    chord([K.G4, K.B4, K.D5]),
    chord([K.E4, K.G4, K.B4]),
    chord([K.C4, K.Ds4, K.G4], 'C minor. Same root as the first chord; only the middle note moved.'),
    chord([K.A3, K.Cs4, K.E4], 'A major.'),
  ],
};

export const PLAY_BY_EAR_METHOD: ConceptPayload = {
  type: 'concept',
  title: 'Play any song by ear: the method',
  track: 'ear',
  durationMinutes: 6,
  source: 'course 7A',
  objectives: ['Find Sa for any song you can hum', 'Work out a melody in Sargam, one phrase at a time', 'Know when to stop guessing and move the hand'],
  cards: [
    {
      title: 'Find Sa first',
      body:
        'Hum the song. Find the note it keeps coming home to, usually where the first line ends or where the chorus lands. Sing that note and hunt for it on the keyboard. That is the song\'s Sa.\n\nEverything else is measured from there, which is why you practised notes against Sa in the first lesson of this level.',
    },
    {
      title: 'One phrase, in Sargam',
      body:
        'Take the first phrase, four or five notes. Sing it slowly and name each note by its distance from Sa: Sa Re Ga, or Pa Dha Pa Ma. If a note sounds between two names, it is a black key: komal or tivra.\n\nPlay what you named. Compare with what you sing. Fix one note at a time.',
    },
    {
      title: 'Shape before detail',
      body:
        'When a phrase will not come, stop naming and ask only: does it go up, down, or turn? How many notes? Play any notes with that shape, then correct the ones that clash. Shape is what the ear remembers best.',
    },
    {
      title: 'Write it down',
      body:
        'The Lab tab (Pro mode) shows every note you play. Once a phrase is right, write it as Sargam text; this app reads that notation directly, so your transcription becomes a lesson.\n\nLevel 8 adds the other half: finding the chords underneath.',
    },
  ],
};
