import { scaleMidis } from '../../engine/theory';
import { ChordDrillPayload, ConceptPayload, K, PC, QuizPayload, labels } from './types';

const DEGREES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const MAJOR_FORMULA_LABELS = ['-', 'T', 'T', 'ST', 'T', 'T', 'T', 'ST'];

const C_MAJOR = scaleMidis(K.C4, 'major');
const G_MAJOR = scaleMidis(K.G4, 'major');
const D_MAJOR = scaleMidis(K.D4, 'major');
const F_MAJOR = scaleMidis(K.F4, 'major');

export const MAJOR_SCALE_FORMULA: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 3A.1: Major Scales Formula (- T T ST T T T ST)',
  subtitle: 'PDF pp. 63–71 • Tone & Semitone formula + All 12 Major Scales',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 3A (pp. 63–71)',
  objectives: [
    'Understand Tone (T = skip 1 key) vs. Semitone (ST = very next key) (PDF p. 63)',
    'Apply Jash’s Major Scale Formula: - T T ST T T T ST from any starting note (PDF p. 63)',
    'Learn the special fingerings for F Major (RH 1-2-3-4-1-2-3-4) and black-key scales (PDF pp. 66–71)',
  ],
  cards: [
    {
      title: 'Semitone (ST) vs. Tone (T) (PDF p. 63)',
      body:
        'In Chapter 3A (page 63), Jash defines the two building blocks of every scale:\n\n• Semitone (ST / Half step): The immediate next key (white or black) with zero keys skipped. Example: C to C#, or E to F.\n• Tone (T / Whole step): Skipping 1 key in between. Example: C to D (skips C#), or E to F# (skips F).',
      highlight: { midis: [K.C4, K.Cs4, K.D4], labels: { [K.C4]: 'Root', [K.Cs4]: 'ST', [K.D4]: 'T' } },
    },
    {
      title: 'The Universal Major Scale Formula: - T T ST T T T ST (PDF p. 63)',
      body:
        'Write this formula in your notebook:\n-  T  T  ST  T  T  T  ST\n\n• "-" means your starting Root note (1st note).\n• From C: C (-) → D (T) → E (T) → F (ST) → G (T) → A (T) → B (T) → C (ST).\nStandard Right-Hand fingering: 1-2-3-1-2-3-4-5. Left-Hand fingering: 5-4-3-2-1-3-2-1.',
      highlight: { midis: C_MAJOR, labels: labels(C_MAJOR, MAJOR_FORMULA_LABELS) },
      tryIt: { prompt: 'Play C Major ascending using - T T ST T T T ST.', targetMidis: C_MAJOR },
    },
    {
      title: 'G Major & D Major (Adding F# and C#, PDF pp. 66–67)',
      body:
        'Start on G and apply - T T ST T T T ST:\nG – A – B – C – D – E – F# – G (1 sharp: F#).\n\nStart on D and apply - T T ST T T T ST:\nD – E – F# – G – A – B – C# – D (2 sharps: F#, C#).\nBoth use the exact same fingering as C Major!',
      highlight: { midis: G_MAJOR, labels: labels(G_MAJOR, DEGREES) },
      tryIt: { prompt: 'Play G Major ascending (remember F# on the 7th note!).', targetMidis: G_MAJOR },
    },
    {
      title: 'F Major Special Fingering: RH 1-2-3-4-1-2-3-4 (PDF p. 69)',
      body:
        'Start on F: F – G – A – A# (Bb) – C – D – E – F.\n\nBecause the 4th note is a black key (A#), tucking your thumb after E would force your thumb onto a black key! Instead, play F(1) – G(2) – A(3) – A#(4), then tuck Thumb (1) onto C: 1-2-3-4-1-2-3-4.',
      highlight: { midis: F_MAJOR, labels: labels(F_MAJOR, ['1', '2', '3', '4', '1', '2', '3', '4']) },
      tryIt: { prompt: 'Play F Major ascending (F G A A# C D E F).', targetMidis: F_MAJOR },
    },
    {
      title: 'Practice All 12 Major Scales with Metronome (80–110 BPM)',
      body:
        'On pages 66–71, Jash gives the exact LH and RH fingerings for all 12 Major scales (C, G, D, A, E, B, F#, F, A#, D#, G#, C#) and recommends practicing them in Eighth Notes (2 notes per beat) at 80–110 BPM.',
      highlight: { midis: D_MAJOR, labels: labels(D_MAJOR, DEGREES) },
      tryIt: { prompt: 'Play D Major ascending (D E F# G A B C# D).', targetMidis: D_MAJOR },
    },
  ],
};

export const CIRCLE_OF_FIFTHS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 3A.2: The Circle of Fifths',
  subtitle: 'PDF pp. 64–65 • How all 12 scales connect in steps of 5 (C → G → D → A → E → B → F#)',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 3A (pp. 64–65)',
  objectives: [
    'Understand why the PDF orders scales as C → G → D → A → E → B → F# (PDF pp. 64–65)',
    'Count 5 scale notes up to find the next key in the Circle of Fifths',
    'Know how many black keys (sharps) each clockwise step adds',
  ],
  cards: [
    {
      title: 'Why Are the Scales in Chapter 3A Ordered C → G → D → A → E → B?',
      body:
        'Look at pages 64–65 of the PDF: Jash doesn’t teach scales in alphabetical order—he teaches them in the Circle of Fifths order!\n\nTake the 5th note of C Major (G): that gives your next scale, G Major (1 black key). Take the 5th note of G Major (D): that gives D Major (2 black keys)!',
      diagram: 'circle-of-fifths',
    },
    {
      title: 'Clockwise Adds 1 Sharp Each Step (PDF p. 65)',
      body:
        '• C Major = 0 black keys\n• G Major = 1 black key (F#)\n• D Major = 2 black keys (F#, C#)\n• A Major = 3 black keys (F#, C#, G#)\n• E Major = 4 black keys (F#, C#, G#, D#)\n• B Major = 5 black keys (F#, C#, G#, D#, A#)',
      diagram: 'circle-of-fifths',
      highlight: { midis: [K.C4, K.G4], labels: { [K.C4]: '1 (C)', [K.G4]: '5 (G)' } },
      tryIt: { prompt: 'Press C4, then its 5th note G4.', targetMidis: [K.C4, K.G4] },
    },
  ],
};

const A_MINOR = scaleMidis(K.A3, 'natural-minor');
const E_MINOR = scaleMidis(K.E4, 'natural-minor');
const D_MINOR = scaleMidis(K.D4, 'natural-minor');

export const NATURAL_MINOR_FORMULA: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 3B.1: Minor Scales Formula (- T ST T T ST T T)',
  subtitle: 'PDF pp. 72–77 • Building all 12 Natural Minor Scales & LH/RH Fingerings',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 3B (pp. 72–77)',
  objectives: [
    'Memorize Jash’s Minor Scale Formula: - T ST T T ST T T (PDF p. 72)',
    'Hear how the Semitone between the 2nd and 3rd notes creates the emotional minor mood',
    'Play A Minor, E Minor, and D Minor on the keyboard (PDF pp. 74–77)',
  ],
  cards: [
    {
      title: 'The Minor Scale Formula: - T ST T T ST T T (PDF p. 72)',
      body:
        'In Chapter 3B (page 72), Jash gives the universal formula for any Natural Minor scale:\n\n-  T  ST  T  T  ST  T  T\n\nStart on A and follow the steps: A (-) → B (T) → C (ST) → D (T) → E (T) → F (ST) → G (T) → A (T).\nAll white keys!',
      highlight: { midis: A_MINOR, labels: labels(A_MINOR, ['-', 'T', 'ST', 'T', 'T', 'ST', 'T', 'T']) },
      tryIt: { prompt: 'Play A Natural Minor ascending (A B C D E F G A).', targetMidis: A_MINOR },
    },
    {
      title: 'E Minor & D Minor (PDF pp. 74 & 76)',
      body:
        '• E Minor (- T ST T T ST T T): E – F# – G – A – B – C – D – E (1 black key: F#).\n• D Minor (- T ST T T ST T T): D – E – F – G – A – A# – C – D (1 black key: A#).\n\nBoth use standard 1-2-3-1-2-3-4-5 (RH) and 5-4-3-2-1-3-2-1 (LH) fingerings!',
      highlight: { midis: E_MINOR, labels: labels(E_MINOR, DEGREES) },
      tryIt: { prompt: 'Play E Minor ascending (E F# G A B C D E).', targetMidis: E_MINOR },
    },
    {
      title: 'D Minor Try-It (PDF p. 76)',
      body: 'Now try D Minor ascending: D – E – F – G – A – A# – C – D.',
      highlight: { midis: D_MINOR, labels: labels(D_MINOR, DEGREES) },
      tryIt: { prompt: 'Play D Minor ascending (watch for A# on the 6th note).', targetMidis: D_MINOR },
    },
  ],
};

export const CHORD_FORMATION_CONCEPT: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 3C.1: Learn Chords & Its Formation (2 Methods)',
  subtitle: 'PDF pp. 78–89 • Scale 1–3–5 Method & Semitone Formula (Major = Root+4+3, Minor = Root+3+4)',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 3C (pp. 78–89)',
  objectives: [
    'Build any chord using Method 1: 1st + 3rd + 5th notes of its scale (PDF p. 78)',
    'Build any chord instantly using Method 2: Major = Root + 4 + 3 semitones; Minor = Root + 3 + 4 semitones (PDF pp. 79–80)',
    'Use the correct chord fingers: Left Hand = 5-3-1, Right Hand = 1-3-5 (PDF p. 81)',
  ],
  cards: [
    {
      title: 'Method 1: 1st + 3rd + 5th Note of the Scale (PDF p. 78)',
      body:
        'A chord is 3 or more notes played together.\n\n• Take the 1st, 3rd, and 5th notes of any Major scale → Major Chord! Example in C Major: C (1) + E (3) + G (5) = C Major.\n• Take the 1st, 3rd, and 5th notes of any Minor scale → Minor Chord! Example in A Minor: A (1) + C (3) + E (5) = A Minor.',
      highlight: { midis: [K.C4, K.E4, K.G4], labels: { [K.C4]: '1 (C)', [K.E4]: '3 (E)', [K.G4]: '5 (G)' } },
      tryIt: { prompt: 'Hold C Major (C + E + G together).', targetMidis: [K.C4, K.E4, K.G4], together: true },
    },
    {
      title: 'Method 2: The Semitone Counting Formula (PDF pp. 79–80)',
      body:
        'What if you haven’t memorized a scale yet? Jash’s Semitone Formula works on every key in 2 seconds:\n\n• MAJOR CHORD = Root + 4 semitones + 3 semitones (e.g. C → count 4 up to E → count 3 up to G).\n• MINOR CHORD = Root + 3 semitones + 4 semitones (e.g. C → count 3 up to D# → count 4 up to G = C Minor!).\n\nNotice: moving the middle note down 1 key turns any Major chord into a Minor chord!',
      highlight: { midis: [K.C4, K.Ds4, K.G4], labels: { [K.C4]: 'Root', [K.Ds4]: '+3 (D#)', [K.G4]: '+4 (G)' } },
      tryIt: { prompt: 'Hold C Minor (C + D# + G together).', targetMidis: [K.C4, K.Ds4, K.G4], together: true },
    },
    {
      title: 'Chord Finger Positions: LH 5–3–1 & RH 1–3–5 (PDF p. 81)',
      body:
        'Always use the standard triad fingers shown on pages 81–89:\n• Left Hand: 5 (Pinky) + 3 (Middle) + 1 (Thumb)\n• Right Hand: 1 (Thumb) + 3 (Middle) + 5 (Pinky)',
      diagram: 'finger-numbers',
    },
  ],
};

export const BUILDING_TRIADS: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 3C.2: All 24 Major & Minor Chords Workout',
  subtitle: 'PDF pp. 81–89 • Practice the course’s Major & Minor Triads with LH 5-3-1 or RH 1-3-5',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 3C (pp. 81–89)',
  objectives: [
    'Play Major and Minor triads across both white-key and black-key roots (PDF pp. 81–89)',
    'Feel the 1-semitone difference in the middle finger (3rd) between Major (+4+3) and Minor (+3+4)',
  ],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.C, quality: 'minor' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.G, quality: 'minor' },
    { rootPc: PC.D, quality: 'major' },
    { rootPc: PC.D, quality: 'minor' },
    { rootPc: PC.A, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.E, quality: 'major' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.F, quality: 'minor' },
    { rootPc: PC.Fs, quality: 'major' },
    { rootPc: PC.Fs, quality: 'minor' },
    { rootPc: PC.Cs, quality: 'major' },
    { rootPc: PC.Cs, quality: 'minor' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 4000,
  repeats: 1,
};

export const CHORD_TYPES: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 3E: Types of Chords (Maj7, Dom7, Aug, Dim, Sus2, Sus4)',
  subtitle: 'PDF pp. 94–102 • All 6 Extended & Altered Chord Types on the Keyboard',
  track: 'theory',
  durationMinutes: 10,
  source: 'course 3E (pp. 94–102)',
  objectives: [
    'Play Major 7th (1-3-5-7 = Root+4+3+4, PDF p. 95) and Dominant 7th (Root+4+3+3, PDF p. 96)',
    'Play Augmented (Root+4+4, PDF p. 98) and Diminished (Root+3+3, PDF p. 99)',
    'Play Suspended chords: Sus2 (1-2-5 = Root+2+5, PDF p. 101) and Sus4 (1-4-5 = Root+5+2, PDF p. 102)',
  ],
  sequence: [
    { rootPc: PC.C, quality: 'major', label: 'C (1-3-5)' },
    { rootPc: PC.C, quality: 'maj7', label: 'Cmaj7 (+4+3+4)' },
    { rootPc: PC.C, quality: 'dom7', label: 'C7 (+4+3+3)' },
    { rootPc: PC.C, quality: 'aug', label: 'Caug (+4+4)' },
    { rootPc: PC.C, quality: 'dim', label: 'Cdim (+3+3)' },
    { rootPc: PC.C, quality: 'sus2', label: 'Csus2 (1-2-5)' },
    { rootPc: PC.C, quality: 'sus4', label: 'Csus4 (1-4-5)' },
    { rootPc: PC.F, quality: 'maj7', label: 'Fmaj7' },
    { rootPc: PC.G, quality: 'dom7', label: 'G7' },
    { rootPc: PC.A, quality: 'sus2', label: 'Asus2' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 5000,
  repeats: 1,
};

const A_HARMONIC = scaleMidis(K.A3, 'harmonic-minor');
const A_MELODIC = scaleMidis(K.A3, 'melodic-minor');
const C_PENTATONIC = scaleMidis(K.C4, 'major-pentatonic');

export const SCALE_TYPES: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 3F: Types of Scales (Harmonic Minor, Melodic Minor & Pentatonic)',
  subtitle: 'PDF pp. 103–107 • Raising the 7th, Raising 6th & 7th, and the 5-Note Pentatonic Scale',
  track: 'theory',
  durationMinutes: 7,
  source: 'course 3F (pp. 103–107)',
  objectives: [
    'Build a Harmonic Minor scale by raising the 7th note of a Natural Minor scale by 1 semitone (PDF p. 104)',
    'Build a Melodic Minor scale by raising both the 6th and 7th notes by 1 semitone (PDF p. 105)',
    'Build a Major Pentatonic scale by removing the 4th and 7th notes (1-2-3-5-6, PDF p. 106)',
  ],
  cards: [
    {
      title: '1. Harmonic Minor Scale: Raise the 7th Note (PDF p. 104)',
      body:
        'Start with A Natural Minor (A B C D E F G A).\n\nNow apply Jash’s rule on page 104: raise the 7th note (G) by 1 semitone to G#!\n• A Harmonic Minor = A – B – C – D – E – F – G# – A.\nThat exotic G# gives you the classic E Major chord (E–G#–B) used in "Gulabi Aankhein" and "O Mere Dil Ke Chain"!',
      highlight: { midis: A_HARMONIC, labels: labels(A_HARMONIC, ['1', '2', '3', '4', '5', '6', '7#', '8']) },
      tryIt: { prompt: 'Play A Harmonic Minor ascending (A B C D E F G# A).', targetMidis: A_HARMONIC },
    },
    {
      title: '2. Melodic Minor Scale: Raise the 6th & 7th Notes (PDF p. 105)',
      body:
        'In A Natural Minor (A B C D E F G A), raise BOTH the 6th note (F → F#) and the 7th note (G → G#):\n\n• A Melodic Minor = A – B – C – D – E – F# – G# – A.\nNotice it feels like A Minor at the bottom (A-B-C) and A Major at the top (E-F#-G#-A)!',
      highlight: { midis: A_MELODIC, labels: labels(A_MELODIC, ['1', '2', '3', '4', '5', '6#', '7#', '8']) },
      tryIt: { prompt: 'Play A Melodic Minor ascending (A B C D E F# G# A).', targetMidis: A_MELODIC },
    },
    {
      title: '3. Major Pentatonic Scale: Drop the 4th & 7th Notes (PDF pp. 106–107)',
      body:
        '"Penta" means 5. Take any Major scale (1-2-3-4-5-6-7) and remove the 4th and 7th notes:\n\n• Formula: 1st, 2nd, 3rd, 5th, 6th notes (plus 8th).\n• In C Major: C – D – E – G – A – C (Raag Bhupali!).\nEvery note in the Pentatonic scale sounds sweet for fillers and improvisation.',
      highlight: { midis: C_PENTATONIC, labels: labels(C_PENTATONIC, ['1 (C)', '2 (D)', '3 (E)', '5 (G)', '6 (A)', '8 (C)']) },
      tryIt: { prompt: 'Play C Major Pentatonic (C D E G A C).', targetMidis: C_PENTATONIC },
    },
  ],
};

export const RELATIVE_KEYS_QUIZ: QuizPayload = {
  type: 'quiz',
  title: 'Chapter 3G: Relative Major & Minors (Scale & Chord Substitution)',
  subtitle: 'PDF pp. 108–110 • 6th Note of Major = Relative Minor • 3rd Note of Minor = Relative Major',
  track: 'theory',
  durationMinutes: 5,
  source: 'course 3G (pp. 108–110)',
  objectives: [
    'Find the Relative Minor of any Major scale (count to the 6th scale note or 3 semitones down, PDF p. 108)',
    'Find the Relative Major of any Minor scale (count to the 3rd scale note or 3 semitones up, PDF p. 109)',
    'Use Relative Chords as instant emotional substitutes in songs (PDF p. 110)',
  ],
  questions: [
    {
      prompt: 'What is the Relative Minor of C Major (shares the exact same 7 white keys)?',
      kind: 'choice',
      choices: ['A Minor', 'E Minor', 'D Minor', 'G Minor'],
      answerIndex: 0,
      explanation: 'The 6th note of C Major (or 3 semitones below C) is A. C Major and A Minor share the exact same 7 notes!',
    },
    {
      prompt: 'How do you find the Relative Major of any Minor scale?',
      kind: 'choice',
      choices: ['Take the 3rd note of the Minor scale (3 semitones up)', 'Take the 5th note', 'Take the 2nd note', 'Take the 7th note'],
      answerIndex: 0,
      explanation: 'In A Minor (A-B-C-D-E-F-G), the 3rd note is C → C Major is the Relative Major!',
    },
    {
      prompt: 'Press the root note of the Relative Minor of G Major.',
      kind: 'press-key',
      answerMidis: [K.E4],
      anyOctave: true,
      explanation: 'Count 3 semitones down from G (F# → F → E), or take the 6th note of G Major: E Minor!',
    },
    {
      prompt: 'What is the Relative Minor of F Major?',
      kind: 'choice',
      choices: ['A Minor', 'D Minor', 'C Minor', 'Bb Minor'],
      answerIndex: 1,
      explanation: 'In F Major (F-G-A-Bb-C-D-E), the 6th note (or 3 semitones below F) is D → D Minor!',
    },
    {
      prompt: 'Hold the Relative Minor chord of C Major on your keyboard.',
      kind: 'press-chord',
      answerMidis: [K.A3, K.C4, K.E4],
      anyOctave: true,
      explanation: 'A Minor (A + C + E). As Jash teaches on p. 110, you can often substitute a Major chord with its Relative Minor!',
    },
    {
      prompt: 'What is the Relative Major of F# Minor?',
      kind: 'choice',
      choices: ['D Major', 'A Major', 'E Major', 'B Major'],
      answerIndex: 1,
      explanation: 'Count 3 semitones up from F# (G → G# → A): A Major and F# Minor are relatives (both have 3 sharps: F#, C#, G#).',
    },
  ],
};
