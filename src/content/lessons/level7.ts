import { EarItem } from '../../types/lesson';
import { ConceptPayload, EarPayload, K } from './types';

const SA = K.C4;
const note = (midi: number, prompt?: string): EarItem => ({ kind: 'note', referenceMidi: SA, targetMidis: [midi], anyOctave: false, prompt });
const interval = (a: number, b: number, prompt?: string): EarItem => ({ kind: 'interval', referenceMidi: SA, targetMidis: [a, b], anyOctave: false, prompt });
const melody = (midis: number[], prompt?: string): EarItem => ({ kind: 'melody', referenceMidi: SA, targetMidis: midis, anyOctave: false, noteSeconds: 0.5, prompt });
const chord = (midis: number[], prompt?: string): EarItem => ({ kind: 'chord', targetMidis: midis, anyOctave: true, prompt });

export const PLAY_BY_EAR_METHOD: ConceptPayload = {
  type: 'concept',
  title: '7A · How to Play Any Song by Ear on the Piano',
  track: 'ear',
  durationMinutes: 6,
  source: 'course 7A',
  objectives: [
    'Follow the 2-stage Ear Training blueprint: Stage 1 (Blind Note Identification: 1, 2, 4 notes on Strings & Piano) and Stage 2 (Humming -> Words -> Lines -> Song)',
    'Know the 10 Bollywood target songs from Page 224 to decode by ear',
  ],
  cards: [
    {
      title: 'Stage 1: Blind Note Identification (1, 2, and 4 Notes)',
      body:
        'Start in the C Major scale (all white keys from C to B). Ask a partner or use the ear trainer below to play 1 note, then 2 notes, and finally 4 notes while your eyes are closed.\n\nPractice first with a sustained Strings tone, then switch to the Grand Piano tone. Hear whether each note is higher or lower than your reference note (C).',
    },
    {
      title: 'Stage 2: Humming -> Single Words -> Two Words -> Full Line',
      body:
        'Never jump straight to an entire song. Instead:\n1. Hum the melody aloud so your voice locks onto the pitch.\n2. Find the notes for just ONE word.\n3. Connect TWO words together.\n4. Complete one full vocal line before moving to the next section.',
    },
    {
      title: '10 Target Songs to Decode by Ear (Page 224)',
      body:
        'Once you complete the interactive ear drills in this module, test yourself on the 10 course target songs in C Major / A Minor:\n1. Tujhe Dekha To Yeh Jaana Sanam\n2. Kal Ho Naa Ho\n3.Pehla Nasha\n4. Chura Liya Hai Tumne Jo Dil Ko\n5. गुलाबी आँखें (Gulabi Aankhein)\n6. Tum Hi Ho\n7. Janam Janam\n8. Tera Ban Jaunga\n9. Kesariya\n10. Raatan Lambiyan',
    },
  ],
};

export const EAR_SINGLE_NOTES: EarPayload = {
  type: 'ear',
  title: '7A · Step 1: Identify 1 Note by Ear (C Major)',
  subtitle: 'Hear the reference note C, then find the mystery white key by ear.',
  track: 'ear',
  durationMinutes: 8,
  source: 'course 7A',
  objectives: ['Hear a single note\'s distance from C (Sa) and find it on the keys without guessing', 'Distinguish high vs. low pitches across the C Major scale'],
  freeReplays: 1,
  items: [
    note(K.G4, 'Reference C, then 1 note. G (Pa) sits bright and stable in the middle.'),
    note(K.E4, 'A warm step up to the 3rd note of the scale (E).'),
    note(K.D4, 'Just one whole step above C (D).'),
    note(K.A4, 'Six notes up from C (A).'),
    note(K.F4, 'Four notes up from C (F).'),
    note(K.B4, 'The leading note right below high C (B).'),
    note(K.C5, 'High C — one full octave above the reference.'),
    note(K.E4),
    note(K.G4),
    note(K.D4),
    note(K.A4),
    note(K.F4),
  ],
};

export const EAR_INTERVALS: EarPayload = {
  type: 'ear',
  title: '7A · Step 2: Identify 2 Notes by Ear (Direction & Distance)',
  subtitle: 'Two notes in a row. Hear whether the second note moves UP or DOWN, then play both back.',
  track: 'ear',
  durationMinutes: 8,
  source: 'course 7A',
  objectives: ['Identify 2-note pairs from the C Major scale by ear', 'Hear melodic direction (ascending vs. descending) and leap size'],
  freeReplays: 1,
  items: [
    interval(K.C4, K.G4, 'C up to G: a fifth.'),
    interval(K.C4, K.E4, 'C up to E: a major third.'),
    interval(K.C4, K.D4, 'C up to D: a step.'),
    interval(K.C4, K.C5, 'C up to high C: an octave.'),
    interval(K.C4, K.F4, 'C up to F: a fourth.'),
    interval(K.C4, K.A4, 'C up to A: a sixth.'),
    interval(K.G4, K.E4, 'Going down now: G down to E.'),
    interval(K.E4, K.G4),
    interval(K.D4, K.A4),
    interval(K.C5, K.G4),
  ],
};

export const EAR_MELODIES: EarPayload = {
  type: 'ear',
  title: '7A · Step 3: Identify 4-Note Phrases & Word Shapes by Ear',
  subtitle: 'Three to five notes — the exact length of one or two Bollywood lyrics words.',
  track: 'ear',
  durationMinutes: 10,
  source: 'course 7A',
  objectives: ['Hold a 4-note phrase in your head, hum it, and find it on the keys', 'Hear the contour first (up, down, turn), then lock in the exact notes'],
  freeReplays: 2,
  items: [
    melody([K.C4, K.D4, K.E4], 'Stepwise climb: C D E.'),
    melody([K.E4, K.D4, K.C4], 'Stepwise descent: E D C.'),
    melody([K.C4, K.E4, K.G4], 'Triad outline: C E G.'),
    melody([K.G4, K.F4, K.E4, K.D4, K.C4], 'Five-note walk home to C.'),
    melody([K.C4, K.D4, K.E4, K.D4, K.C4], 'Up and back turn.'),
    melody([K.E4, K.G4, K.A4, K.G4], 'Four-note Bollywood hook shape.'),
    melody([K.G4, K.A4, K.G4, K.E4, K.D4]),
    melody([K.C4, K.G4, K.A4, K.G4]),
    melody([K.D4, K.E4, K.F4, K.E4, K.D4]),
    melody([K.C5, K.B4, K.A4, K.G4]),
  ],
};

export const EAR_MAJOR_MINOR: EarPayload = {
  type: 'ear',
  title: '8B · Major vs. Minor Mood by Ear',
  subtitle: 'Hear a chord, feel whether it is Happy/Bright (Major) or Sad/Dark (Minor), and play it back.',
  track: 'ear',
  durationMinutes: 6,
  source: 'course 8B',
  objectives: ['Hear the emotional difference between a Major (4-3) and Minor (3-4) chord', 'Play back the chord you heard in any octave'],
  freeReplays: 1,
  items: [
    chord([K.C4, K.E4, K.G4], 'C Major (C-E-G). Bright and happy.'),
    chord([K.A3, K.C4, K.E4], 'A Minor (A-C-E). Deep and emotional.'),
    chord([K.F4, K.A4, K.C5], 'F Major (F-A-C).'),
    chord([K.D4, K.F4, K.A4], 'D Minor (D-F-A).'),
    chord([K.G4, K.B4, K.D5], 'G Major (G-B-D).'),
    chord([K.E4, K.G4, K.B4], 'E Minor (E-G-B).'),
    chord([K.C4, K.Ds4, K.G4], 'C Minor (C-D#-G). Only the middle note moved down 1 semitone!'),
    chord([K.A3, K.Cs4, K.E4], 'A Major (A-C#-E).'),
  ],
};
