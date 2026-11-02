import { PATTERNS_34, PATTERNS_44, PATTERNS_EXCEPTIONAL, PATTERN_BY_ID } from '../patterns';
import { ConceptPayload, K, PC, PatternPayload } from './types';

// Exact Chapter 6B progression from PDF pp. 195–197: C - G - D - A - E - B
const PROG_6B_CIRCLE = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
  { rootPc: PC.D, quality: 'major' as const },
  { rootPc: PC.A, quality: 'major' as const },
  { rootPc: PC.E, quality: 'major' as const },
  { rootPc: PC.B, quality: 'major' as const },
];

const I_V_vi_IV = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
];

const I_vi_IV_V = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
];

export const INTRO_TO_ARPEGGIOS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 6A: Introduction to Arpeggios',
  subtitle: 'PDF p. 194 • Breaking a Chord into Flowing Notes (1–3–5–3 & 1–5–8–5)',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6A (p. 194)',
  objectives: [
    'Understand what an Arpeggio is: playing the notes of a chord one after another in a rhythmic pattern (PDF p. 194)',
    'Play C Major as 1–3–5–3 (C–E–G–E) and 1–5–8–5 (C–G–C\'–G) in your Left Hand',
    'Read scale/chord tone numbers (1, 3, 5, 8, 10) so you can apply one pattern to all 24 chords',
  ],
  cards: [
    {
      title: 'Block Chords vs. Arpeggios (PDF p. 194)',
      body:
        'In Module 4, your Left Hand played Block Chords—pressing all 3 notes at the same time on Beat 1.\n\nIn Module 6 (page 194), Jash introduces Arpeggios: breaking those chord notes apart and playing them one by one in a flowing pattern! Arpeggios fill the empty space between beats and make a solo piano sound like a studio ballad.',
      highlight: { midis: [K.C3, K.E3, K.G3, K.C4], labels: { [K.C3]: '1 (C)', [K.E3]: '3 (E)', [K.G3]: '5 (G)', [K.C4]: '8 (C\')' } },
      tryIt: { prompt: 'Left Hand: Play C3 – E3 – G3 – C4 one note at a time.', targetMidis: [K.C3, K.E3, K.G3, K.C4] },
    },
    {
      title: 'Universal Scale/Chord Numbers: 1, 3, 5, 8, 10',
      body:
        'Every arpeggio pattern in Chapters 6B–6G is built from chord/scale degrees:\n• 1 = Root (e.g. C3)\n• 3 = Third (e.g. E3)\n• 5 = Fifth (e.g. G3)\n• 8 = Octave Root (e.g. C4)\n• 10 = Octave Third (e.g. E4 — the 3rd note in the higher octave!)\n\nOnce your Left Hand learns a number pattern like 1–5–8–5, you can move it to ANY chord!',
      highlight: { midis: [K.F3, K.A3, K.C4, K.F4], labels: { [K.F3]: '1', [K.A3]: '3', [K.C4]: '5', [K.F4]: '8' } },
      tryIt: { prompt: 'Now play 1–3–5–8 on F Major: F3 – A3 – C4 – F4.', targetMidis: [K.F3, K.A3, K.C4, K.F4] },
    },
  ],
};

export const ARPEGGIO_COORDINATION_44: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6B: Arpeggio Coordination Exercises (4x4 Part 1)',
  subtitle: 'PDF pp. 195–197 • 4 Exercises over C – G – D – A – E – B • 80–120 BPM',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6B (pp. 195–197)',
  objectives: [
    'Play Left-Hand C–E–G–E (1-3-5-3) and C–G–C\'–G (1-5-8-5) across the 6-chord progression C–G–D–A–E–B (PDF pp. 195–197)',
    'Coordinate Left-Hand arpeggios with Right-Hand notes on top',
  ],
  templates: [
    PATTERN_BY_ID['zth-44-p1-1353'],
    PATTERN_BY_ID['zth-44-p2-1585-q'],
    PATTERN_BY_ID.rising,
    PATTERN_BY_ID['ballad-1585'],
  ],
  progression: PROG_6B_CIRCLE,
  bpm: 84,
  repeats: 2,
  allowTranspose: true,
};

export const ARPEGGIO_COORDINATION_34: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6C: Arpeggio Coordination Exercises (3x4 Part 2)',
  subtitle: 'PDF pp. 198–199 • 3 Exercises in 3/4 Waltz Time: C – (EG) – (EG) • 80–120 BPM',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6C (pp. 198–199)',
  objectives: [
    'Master the 3/4 waltz accompaniment C – (EG) – (EG) from PDF pp. 198–199',
    'Practice all 3 waltz coordination templates across chord shifts',
  ],
  templates: [PATTERN_BY_ID.waltz, PATTERN_BY_ID['rising-3'], PATTERN_BY_ID['open-158']],
  progression: I_vi_IV_V,
  bpm: 88,
  repeats: 2,
  allowTranspose: true,
};

export const FOUR_STEP_PROCESS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 6D.1: The 4-Step Process to Play Songs with Arpeggios',
  subtitle: 'PDF pp. 200–202 • Jash’s Secret Step 3: Base-Chord Arpeggio + Melody Before Shifting Chords!',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6D (pp. 200–202)',
  objectives: [
    'Memorize all 4 steps of Chapter 6D (PDF pp. 200–201)',
    'Understand why Step 3 (playing RH melody while LH stays on ONE fixed base-chord arpeggio) solves hand-independence overnight',
  ],
  cards: [
    {
      title: 'Step 1 & Step 2: Block Chords → Arpeggio Alone (PDF p. 200)',
      body:
        'On pages 200–201, Jash breaks down the exact 4-step bridge from block chords to arpeggio songs:\n\n• Step 1: Play the song with simple Block Chords (using RCCR from Module 4) so you know every chord change.\n• Step 2: Practice the Left-Hand arpeggio pattern ALONE across the song’s chord progression (e.g. C → G → Am → F) until your Left Hand can jump without looking.',
    },
    {
      title: 'Step 3: The Secret Bridge — Melody + Single Base-Chord Arpeggio! (PDF p. 201)',
      body:
        'Here is the step 99% of learners skip, and why they get stuck:\n\n• Step 3 (PDF p. 201): Play the Right-Hand song melody while your Left Hand repeats the arpeggio on ONLY ONE FIXED BASE CHORD (e.g. C–G–C\'–G continuously) without changing chords!\n\nWhy? Because when your Left Hand doesn’t have to jump to new chords, your brain can focus 100% on synchronizing the moving Left Hand with the Right-Hand melody!',
      highlight: { midis: [K.C3, K.G3, K.C4], labels: { [K.C3]: '1 (C)', [K.G3]: '5 (G)', [K.C4]: '8 (C\')' } },
      tryIt: { prompt: 'Play the base-chord arpeggio C3 – G3 – C4 – G3.', targetMidis: [K.C3, K.G3, K.C4, K.G3] },
    },
    {
      title: 'Step 4: Full Chord-Changing Arpeggios Slowly (PDF p. 201)',
      body:
        'Once Step 3 feels automatic, move to Step 4: shift the Left-Hand arpeggio to each chord of the song at a slow tempo!\n\nIn the very next lesson (Chapter 6D.2), we have built this exact 4-Step Toggle into a playable song so you can experience Step 3 and Step 4 hands-on!',
    },
  ],
};

export const SEVEN_PATTERNS_44: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6E: My 7 Universal Arpeggio Patterns (4x4)',
  subtitle: 'PDF pp. 203–205 • All 7 Patterns from the Course Book Over C – G – Am – F',
  track: 'chords',
  durationMinutes: 15,
  source: 'course 6E (pp. 203–205)',
  objectives: [
    'Practice all 7 Universal 4/4 Arpeggio Patterns from PDF pp. 203–205',
    'Master 4-count patterns (1-3-5-3, 1-5-8-5, 1-3-5-8, 1-5-8 hold) and 8-count patterns (1-5-8-5-8-5-8-5, 1-3-5-8-5-3-1-3, 1-5-8-10-8-5-8-5)',
    'Transpose the patterns into any key',
  ],
  templates: PATTERNS_44,
  progression: I_V_vi_IV,
  bpm: 76,
  repeats: 2,
  allowTranspose: true,
};

export const EXCEPTIONAL_PATTERNS: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6F: 3 Exceptional Arpeggio Patterns',
  subtitle: 'PDF pp. 206–208 • Pattern 1: 6-Beat (Kaise Hua/Janam Janam) • Pattern 2: Reggae • Pattern 3: Boogie-Woogie',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6F (pp. 206–208)',
  objectives: [
    'Play Pattern 1 (p. 206): 6-beat ballad pattern used in Kaise Hua & Janam Janam',
    'Play Pattern 2 (p. 207): Reggae off-beat chord groove',
    'Play Pattern 3 (p. 208): Boogie-Woogie / Pop-Rock 8th-note pulse',
  ],
  templates: PATTERNS_EXCEPTIONAL,
  progression: I_vi_IV_V,
  bpm: 72,
  repeats: 2,
  allowTranspose: true,
};

export const FOUR_PATTERNS_34: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6G: My 4 Universal Arpeggio Patterns (3x4)',
  subtitle: 'PDF pp. 209–210 • All 4 Waltz Patterns (C–EG–EG, 1-3-5, 1-5-8, 1-5-8-10-8-5)',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6G (pp. 209–210)',
  objectives: [
    'Play all 4 Universal 3/4 Patterns from PDF pp. 209–210',
    'Use Pattern 4 (1-5-8-10-8-5 in 6 eighth-note counts) for lush 3/4 Bollywood ballads like Lag Jaa Gale',
  ],
  templates: PATTERNS_34,
  progression: I_vi_IV_V,
  bpm: 86,
  repeats: 2,
  allowTranspose: true,
};

export const IDENTIFY_THE_PATTERN: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 6H: How to Identify Patterns for Your Favourite Songs?',
  subtitle: 'PDF pp. 211–212 • The 3 Clues: Rhythm/Beat, Feel of the Song & Time Signature',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6H (pp. 211–212)',
  objectives: [
    'Check Clue #1: Time Signature (4/4 vs. 3/4 immediately narrows your pattern choices, PDF p. 211)',
    'Check Clue #2: Feel & Tempo of the song (Slow emotional ballad vs. upbeat rhythmic groove, PDF p. 212)',
    'Check Clue #3: Drum/Rhythm density (4-count quarter-note patterns vs. 8-count eighth-note patterns)',
  ],
  cards: [
    {
      title: 'Clue 1: Time Signature (4/4 vs. 3/4) (PDF p. 211)',
      body:
        'When you want to pick an arpeggio pattern for any song, Jash’s first rule on page 211 is to count the beats per bar:\n\n• If the song counts 1 – 2 – 3 – 4 → Pick from the 7 Universal 4/4 Patterns (Chapter 6E).\n• If the song counts 1 – 2 – 3 | 1 – 2 – 3 → Pick from the 4 Universal 3/4 Patterns (Chapter 6G).',
    },
    {
      title: 'Clue 2 & 3: Song Feel & Rhythm Density (PDF p. 212)',
      body:
        '• Slow, romantic ballads (Tum Hi Ho, Ae Dil Hai Mushkil, Pehla Nasha): Use 8-count flowing patterns like Pattern 3 (1-5-8-5-8-5-8-5) or Pattern 6 (1-5-8-10-8-5-8-5).\n• Medium-fast or nostalgic songs (Gulabi Aankhein, Chura Liya, O Mere Dil Ke Chain): Use 4-count patterns like Pattern 1 (1-3-5-3), Pattern 2 (1-5-8-5), or Exceptional Reggae/Chord grooves.',
    },
  ],
};

export const BUILD_YOUR_OWN_PATTERN: PatternPayload = {
  type: 'pattern',
  title: 'Chapter 6I: Building Your Own Arpeggio Pattern',
  subtitle: 'PDF pp. 213–215 • Rule 1: Use Chord Notes (1, 3, 5, 8, 10) • Rule 2: Match Beats (4 or 8 counts)',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6I (pp. 213–215)',
  objectives: [
    'Apply Jash’s 2 Rules for creating your own arpeggio pattern (PDF pp. 213–214): only use chord tones, and total counts must equal the bar beats (4) or 2× beats (8)',
    'Design your own pattern on the interactive grid and play it over C – G – Am – F',
  ],
  templates: [PATTERN_BY_ID['zth-44-p2-1585-q'], PATTERN_BY_ID['ballad-1585']],
  progression: I_V_vi_IV,
  bpm: 76,
  repeats: 2,
  editor: true,
  allowTranspose: true,
};

export const IMPROVISE_WITH_ARPEGGIOS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 6J: How to Improvise with Arpeggios (The 5-Stage Song Arc)',
  subtitle: 'PDF pp. 216–218 • Building a Pro Performance from Soft Intro to Climax to Outro',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 6J (pp. 216–218)',
  objectives: [
    'Learn why pros never use just 1 single arpeggio pattern for an entire 4-minute song (PDF p. 216)',
    'Master Jash’s 5-Stage Song Arrangement Structure (PDF pp. 217–218)',
  ],
  cards: [
    {
      title: 'Never Play One Pattern From Start to Finish (PDF p. 216)',
      body:
        'In Chapter 6J (pages 216–218), Jash reveals how professional pianists make a cover song sound dynamic: they evolve the Left Hand across 5 stages as the song builds!',
    },
    {
      title: 'Stages 1, 2 & 3: Soft Opening → Simple Flow → The Punch (PDF p. 217)',
      body:
        '• Stage 1 (Opening Verse): Start very softly with Held Block Chords or 2-Note Chords (1+5) or Pattern 7 (1-5-8 held).\n• Stage 2 (Pre-Chorus / Second Line): Move into a Simple 4-Count Arpeggio Pattern (like Pattern 1: 1-3-5-3 or Pattern 2: 1-5-8-5).\n• Stage 3 (Creating a Punch before Chorus): Right before the chorus hits, play rhythmic chord stabs or a dramatic pause ("Punch") to build anticipation!',
      highlight: { midis: [K.C3, K.G3, K.C4], labels: { [K.C3]: '1', [K.G3]: '5', [K.C4]: '8 (Hold)' } },
    },
    {
      title: 'Stages 4 & 5: Main Advanced Pattern → Gentle Outro (PDF p. 218)',
      body:
        '• Stage 4 (Main Chorus / Antara): Unleash an 8-Count Flowing Arpeggio Pattern (like Pattern 3: 1-5-8-5-8-5-8-5 or Pattern 6: 1-5-8-10-8-5-8-5) at full emotion!\n• Stage 5 (Ending / Outro): Bring the energy back down to a simple 4-count pattern or sustained block chord on the final line.',
      highlight: {
        midis: [K.C3, K.G3, K.C4, K.E4],
        labels: { [K.C3]: '1', [K.G3]: '5', [K.C4]: '8', [K.E4]: '10' },
      },
      tryIt: {
        prompt: 'Play the wide Pattern 6 climb: C3 (1) – G3 (5) – C4 (8) – E4 (10).',
        targetMidis: [K.C3, K.G3, K.C4, K.E4],
      },
    },
  ],
};
