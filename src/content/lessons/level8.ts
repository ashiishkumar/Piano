import { chordMidis, diatonicTriads } from '../../engine/theory';
import { PATTERN_BY_ID } from '../patterns';
import { ChordDrillPayload, EarPayload, K, PC, PatternPayload, QuizPayload } from './types';

export const FIND_THE_SCALE: QuizPayload = {
  type: 'quiz',
  title: '8A · How to Find the Scale of a Song',
  subtitle: '3-Step Method: 1. Play 8–10 melody notes by ear, 2. Count the black keys, 3. Match the scale',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 8A',
  objectives: [
    'Decode a song\'s scale in 3 steps: play 8–10 melody notes, list the white & black keys used, and match to the scale table',
    'Hear which note the melody treats as its home root note',
  ],
  questions: [
    {
      prompt: 'Step 1–3: Listen to these melody notes. They use 0 black keys (all white keys) and resolve home to C. Which scale is the song in?',
      kind: 'choice',
      playMidis: [K.C4, K.E4, K.G4, K.A4, K.G4, K.E4, K.C4],
      choices: ['C Major', 'G Major', 'D Major', 'E Minor'],
      answerIndex: 0,
      explanation: 'Zero black keys and resolving on C gives C Major (C D E F G A B).',
    },
    {
      prompt: 'Listen to this phrase. It uses only ONE black key (F#) and resolves on G. Which scale is it?',
      kind: 'choice',
      playMidis: [K.G4, K.A4, K.B4, K.D5, K.C5, K.B4, K.Fs4, K.G4],
      choices: ['C Major', 'G Major', 'F Major', 'D Major'],
      answerIndex: 1,
      explanation: 'G Major is the scale with 1 sharp (F#) and home note G.',
    },
    {
      prompt: 'Listen to this phrase. It uses all white keys (0 black keys), but the first and last lines land on A with a sad/emotional mood. What scale is it?',
      kind: 'choice',
      playMidis: [K.A3, K.C4, K.E4, K.D4, K.C4, K.B3, K.A3],
      choices: ['C Major', 'A Minor', 'F Major', 'D Minor'],
      answerIndex: 1,
      explanation: 'C Major and A Minor share the exact same 7 white keys, but landing on A makes it A Minor.',
    },
    {
      prompt: 'Press the home root note (Scale Note 1) where this phrase starts and finishes.',
      kind: 'press-key',
      playMidis: [K.F4, K.G4, K.A4, K.C5, K.A4, K.G4, K.F4],
      answerMidis: [K.F4],
      anyOctave: true,
      explanation: 'It starts and ends on F and uses A# (Bb) instead of B — F Major.',
    },
    {
      prompt: 'Listen to this phrase. It uses TWO black keys (F# and C#) and lands on D. Which scale is it?',
      kind: 'choice',
      playMidis: [K.D4, K.E4, K.Fs4, K.A4, K.G4, K.Fs4, K.E4, K.D4],
      choices: ['D Major', 'D Minor', 'G Major', 'A Major'],
      answerIndex: 0,
      explanation: 'Two sharps (F# and C#) landing on D is the D Major scale.',
    },
    {
      prompt: 'In Chapter 8A, how many melody notes do you need to figure out on the keyboard before matching the scale?',
      kind: 'choice',
      choices: ['Just 1 note', 'Around 8 to 10 different phrase notes (1–2 lines)', 'Every single note of the entire 5-minute song', 'None'],
      answerIndex: 1,
      explanation: 'Playing 1–2 lines (8 to 10 melody notes) exposes the white and black keys of the scale immediately.',
    },
  ],
};

export const MAJOR_OR_MINOR: QuizPayload = {
  type: 'quiz',
  title: '8B · How to Know if a Song is in a Major or Minor Scale',
  subtitle: 'Check the first/last line root note and whether the mood is Happy/Romantic (Major) or Sad/Deep (Minor)',
  track: 'ear',
  durationMinutes: 6,
  source: 'course 8B',
  objectives: [
    'Distinguish between relative Major and Minor scales that share the same keys (e.g. C Major vs. A Minor)',
    'Check the home note of the first and last lines of the chorus',
  ],
  questions: [
    {
      prompt: 'Hear this phrase. Does it sound Major (bright/happy) or Minor (dark/emotional)?',
      kind: 'choice',
      playMidis: [K.C4, K.D4, K.E4, K.G4, K.E4, K.C4],
      choices: ['Major', 'Minor'],
      answerIndex: 0,
      explanation: 'The 3rd note is E (4 semitones above C), giving the bright Major sound.',
    },
    {
      prompt: 'Hear this phrase. Major or Minor?',
      kind: 'choice',
      playMidis: [K.A3, K.B3, K.C4, K.E4, K.C4, K.A3],
      choices: ['Major', 'Minor'],
      answerIndex: 1,
      explanation: 'Landing on A with C as the 3rd (3 semitones above A) gives the Minor sound.',
    },
    {
      prompt: 'Hear this chord. Major or Minor?',
      kind: 'choice',
      playMidis: chordMidis(K.D4, 'minor'),
      playAsChord: true,
      choices: ['Major', 'Minor'],
      answerIndex: 1,
      explanation: 'D–F–A follows the 3-4 Minor formula.',
    },
    {
      prompt: 'Hear this chord. Major or Minor?',
      kind: 'choice',
      playMidis: chordMidis(K.F4, 'major'),
      playAsChord: true,
      choices: ['Major', 'Minor'],
      answerIndex: 0,
      explanation: 'F–A–C follows the 4-3 Major formula.',
    },
    {
      prompt: 'If a song uses the notes of G Major (1 black key: F#), how do you tell whether the scale is G Major or its relative minor, E Minor?',
      kind: 'choice',
      choices: [
        'Check whether the song\'s opening/ending home note resolves on G (Major) or E (Minor)',
        'Count the black keys again',
        'Check the tempo only',
        'Play random black keys',
      ],
      answerIndex: 0,
      explanation: 'In Chapter 8B (p. 228), the home note where the first and last lines resolve tells you whether G or E is the true root.',
    },
    {
      prompt: 'Which note inside a chord or scale decides whether the mood is Major or Minor?',
      kind: 'choice',
      choices: ['The 1st note (Root)', 'The 3rd note', 'The 5th note', 'The 8th note (Octave)'],
      answerIndex: 1,
      explanation: 'The 3rd note sits 4 semitones up in Major and 3 semitones up in Minor.',
    },
  ],
};

const C_FAMILY = diatonicTriads(PC.C, 'major').slice(0, 6);
const G_FAMILY = diatonicTriads(PC.G, 'major').slice(0, 6);

export const CHORD_FAMILIES: ChordDrillPayload = {
  type: 'chord-drill',
  title: '8C · Finding the Chords of a Song: The Chord Family Rule',
  subtitle: 'Major Scale Family (1, 4, 5 = Major; 2, 3, 6 = Minor; 7 = Dim) & Minor Scale Family (1, 4, 5 = Minor; 3, 6, 7 = Major; 2 = Dim)',
  track: 'theory',
  durationMinutes: 10,
  source: 'course 8C',
  objectives: [
    'Memorize the Major Chord Family Formula: 1-4-5 Major, 2-3-6 Minor, 7 Diminished',
    'Memorize the Minor Chord Family Formula: 1-4-5 Minor, 3-6-7 Major, 2 Diminished',
    'Play the 6 main family chords of C Major and G Major cleanly',
  ],
  sequence: [...C_FAMILY, ...G_FAMILY].map((c) => ({ rootPc: c.rootPc, quality: c.quality, label: `${c.symbol} (${c.numeral})` })),
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 3000,
  repeats: 1,
};

export const CHORDS_BY_EAR: EarPayload = {
  type: 'ear',
  title: '8D · How to Find Chords of Any Song by Ear (3-Option Rule)',
  subtitle: 'Find the RH melody note on Beat 1, then test the 3 family chords that contain that note!',
  track: 'ear',
  durationMinutes: 8,
  source: 'course 8D',
  objectives: [
    'Apply the Chapter 8D rule: any melody note on Beat 1 belongs to exactly 3 chords in the scale\'s Chord Family',
    'Listen and pick which of the family chords fits the emotional color of the phrase',
  ],
  freeReplays: 1,
  items: [
    { kind: 'chord', targetMidis: chordMidis(K.C4, 'major'), anyOctave: true, prompt: '1-Chord (C Major: C-E-G). Matches melody notes C, E, or G.' },
    { kind: 'chord', targetMidis: chordMidis(K.G3, 'major'), anyOctave: true, prompt: '5-Chord (G Major: G-B-D). Matches melody notes G, B, or D.' },
    { kind: 'chord', targetMidis: chordMidis(K.F3, 'major'), anyOctave: true, prompt: '4-Chord (F Major: F-A-C). Matches melody notes F, A, or C.' },
    { kind: 'chord', targetMidis: chordMidis(K.A3, 'minor'), anyOctave: true, prompt: '6-Chord (A Minor: A-C-E). Matches melody notes A, C, or E.' },
    { kind: 'chord', targetMidis: chordMidis(K.D4, 'minor'), anyOctave: true, prompt: '2-Chord (D Minor: D-F-A).' },
    { kind: 'chord', targetMidis: chordMidis(K.G3, 'major'), anyOctave: true },
    { kind: 'chord', targetMidis: chordMidis(K.E4, 'minor'), anyOctave: true, prompt: '3-Chord (E Minor: E-G-B).' },
    { kind: 'chord', targetMidis: chordMidis(K.F3, 'major'), anyOctave: true },
    { kind: 'chord', targetMidis: chordMidis(K.C4, 'major'), anyOctave: true },
    { kind: 'chord', targetMidis: chordMidis(K.A3, 'minor'), anyOctave: true },
  ],
};

export const PRIORITY_PROGRESSIONS: PatternPayload = {
  type: 'pattern',
  title: '8E · Concept of Priority Chords (Major 1-6-4-5 & Minor 1-7-6-5)',
  subtitle: '80% of songs use the 4 Priority Chords! Practice Major Priority (C–Am–F–G) and Minor Priority (Am–G–F–Em)',
  track: 'chords',
  durationMinutes: 12,
  source: 'course 8E',
  objectives: [
    'Master the Major Scale Priority Chords: 1, 6, 4, 5 (in C Major: C, Am, F, G)',
    'Master the Minor Scale Priority Chords: 1, 7, 6, 5 (in A Minor: Am, G, F, Em)',
    'Test Priority Chords first whenever decoding a song by ear',
  ],
  templates: [PATTERN_BY_ID['ballad-1585'], PATTERN_BY_ID.rising, PATTERN_BY_ID.alberti, PATTERN_BY_ID.block],
  progression: [
    // Major Priority 1 - 6 - 4 - 5 (C - Am - F - G)
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    // Major 1 - 5 - 6 - 4 (C - G - Am - F)
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    // Minor Priority 1 - 7 - 6 - 5 in A Minor (Am - G - F - Em)
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.E, quality: 'minor' },
  ],
  bpm: 76,
  repeats: 1,
  allowTranspose: true,
};
