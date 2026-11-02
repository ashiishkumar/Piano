import { chordMidis } from '../../engine/theory';
import { ChordDrillPayload, ConceptPayload, K, KeyboardTaskPayload, PC } from './types';

const C = chordMidis(K.C4, 'major');
const G = chordMidis(K.G3, 'major');
const AM = chordMidis(K.A3, 'minor');
const F = chordMidis(K.F3, 'major');

export const HOW_TO_SHIFT_CHORDS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 4A.1: Learn How to Shift Chords (4 Progressions & 2 Levels)',
  subtitle: 'PDF pp. 112–113 • Major & Minor Circle Progressions • Level 1 (4-Count Break) vs. Level 2 (Continuous)',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4A (pp. 112–113)',
  objectives: [
    'Learn Jash’s 4 Core Chord Progressions from PDF pp. 112–113 (Major 1 & 2, Minor 1 & 2)',
    'Understand Level 1 (4-count gap between chords to prepare your fingers) vs. Level 2 (continuous shifting at 80–120 BPM)',
    'Use common tones and minimal hand movement so your Left and Right hands shift together',
  ],
  cards: [
    {
      title: 'The 2 Major Progressions (PDF p. 112)',
      body:
        'In Chapter 4A (page 112), Jash groups all 12 Major chords into two 6-chord progressions:\n\n• Major Progression 1: C – G – D – A – E – B\n• Major Progression 2: F# – F – A# – D# – G# – C#\n\nPracticing these two loops teaches your hands to jump cleanly to every single Major chord on the piano!',
      highlight: { midis: C, labels: { [K.C4]: 'C (1)', [K.E4]: 'E (3)', [K.G4]: 'G (5)' } },
      tryIt: { prompt: 'Hold C Major (C + E + G) to start Major Progression 1.', targetMidis: C, together: true },
    },
    {
      title: 'The 2 Minor Progressions (PDF p. 112)',
      body:
        'Next, all 12 Minor chords are grouped into two 6-chord progressions:\n\n• Minor Progression 1: Am – Em – Bm – F#m – C#m – G#m\n• Minor Progression 2: D#m – Dm – Gm – Cm – Fm – A#m\n\nAnd Bonus Progressions 1 & 2 on page 113 combine all 12 Major and all 12 Minor chords in a single non-stop run!',
      highlight: { midis: AM, labels: { [K.A3]: 'A (1)', [K.C4]: 'C (3)', [K.E4]: 'E (5)' } },
      tryIt: { prompt: 'Hold A Minor (A + C + E) to start Minor Progression 1.', targetMidis: AM, together: true },
    },
    {
      title: 'Level 1 (4-Beat Gap) vs. Level 2 (Zero Gap, 80–120 BPM) (PDF p. 113)',
      body:
        'How should you practice shifting chords?\n\n• Level 1 (With Break): Play C Major for 4 counts (1-2-3-4), then take 4 counts of rest (1-2-3-4) to move your hand to G Major.\n• Level 2 (Continuous): Shift directly from C Major (1-2-3-4) to G Major on Beat 1 of the very next bar at 80–120 BPM!\n\nSecret tip: Release your chord slightly on the "and" of Beat 4 so your fingers are already hovering over the next chord before Beat 1 clicks!',
      highlight: { midis: G, labels: { [K.G3]: 'G', [K.B3]: 'B', [K.D4]: 'D' } },
      tryIt: { prompt: 'Now shift cleanly to G Major (G + B + D).', targetMidis: G, together: true },
    },
  ],
};

export const FOUR_LOOPS_ON_THE_BEAT: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 4A.2: Course Chord Progressions on the Metronome',
  subtitle: 'PDF pp. 112–113 • Major Progression 1 (C–G–D–A–E–B) & Minor Progression 1 (Am–Em–Bm–F#m–C#m–G#m)',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4A (pp. 112–113)',
  objectives: [
    'Play Major Progression 1 (C – G – D – A – E – B) on the beat',
    'Play Minor Progression 1 (Am – Em – Bm – F#m – C#m – G#m) on the beat',
  ],
  sequence: [
    // Major Progression 1 (PDF p. 112)
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.D, quality: 'major' },
    { rootPc: PC.A, quality: 'major' },
    { rootPc: PC.E, quality: 'major' },
    { rootPc: PC.B, quality: 'major' },
    // Minor Progression 1 (PDF p. 112)
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.B, quality: 'minor' },
    { rootPc: PC.Fs, quality: 'minor' },
    { rootPc: PC.Cs, quality: 'minor' },
    { rootPc: PC.Gs, quality: 'minor' },
  ],
  mode: 'metronome',
  bpm: 72,
  beatsPerChord: 4,
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  repeats: 1,
};

export const CHORD_SHIFT_TEST_1: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 4B: Challenge Yourself — Chords Shifting Test 1',
  subtitle: 'PDF pp. 114–115 • Rapid Recall Across Major & Minor Progressions (Target: < 2.0s per shift)',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4B (pp. 114–115)',
  objectives: [
    'Pass Jash’s Chords Shifting Test 1 (PDF pp. 114–115): Level 1 = 3s, Level 2 = 2s, Level 3 = 1s per chord',
    'Jump accurately between white-key and black-key Major & Minor chords',
  ],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.D, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.Fs, quality: 'major' },
    { rootPc: PC.B, quality: 'minor' },
    { rootPc: PC.Cs, quality: 'minor' },
    { rootPc: PC.D, quality: 'minor' },
    { rootPc: PC.G, quality: 'minor' },
    { rootPc: PC.C, quality: 'major' },
  ],
  mode: 'timed',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 2000,
  repeats: 1,
  passScore: 70,
};

export const CHORD_SHIFT_TEST_2: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 4C: More Challenging — Chords Shifting Test 2 (All 24 Chords)',
  subtitle: 'PDF p. 116 • Random Jump Test Across Sharp, Flat, Major & Minor Chords (< 1.5s)',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4C (p. 116)',
  objectives: [
    'Conquer Chapter 4C’s 24-Chord Random Recall Test (PDF p. 116)',
    'Find F#, A#, D#, G#, C# Major and Minor chords without counting semitones',
  ],
  sequence: [
    { rootPc: PC.E, quality: 'major' },
    { rootPc: PC.Fs, quality: 'minor' },
    { rootPc: PC.As, quality: 'major' },
    { rootPc: PC.G, quality: 'minor' },
    { rootPc: PC.Cs, quality: 'major' },
    { rootPc: PC.F, quality: 'minor' },
    { rootPc: PC.B, quality: 'major' },
    { rootPc: PC.Ds, quality: 'major' },
    { rootPc: PC.C, quality: 'minor' },
    { rootPc: PC.Gs, quality: 'major' },
    { rootPc: PC.A, quality: 'major' },
    { rootPc: PC.D, quality: 'minor' },
  ],
  mode: 'timed',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 1500,
  repeats: 1,
  passScore: 70,
};

export const RCCR_FRAMEWORK_CONCEPT: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 4G.1: The RCCR Framework to Play Songs with Chords',
  subtitle: 'PDF pp. 125–128 • Right Hand Mastery → Chords Placement → Coordination → Rhythm',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4G (pp. 125–128)',
  objectives: [
    'Memorize Jash Gotawala’s 4-pillar RCCR Framework from PDF pp. 125–128',
    'Know why you must release the Left-Hand chord slightly early before Beat 1 to shift smoothly (PDF p. 127)',
    'Apply RCCR to "Gulabi Aankhein" (Am – G – F – E) and all 10 songs in Chapter 4H',
  ],
  cards: [
    {
      title: 'What Does RCCR Stand For? (PDF p. 125)',
      body:
        'In Chapter 4G (pages 125–128), Jash unveils the signature framework of the Zero to Hero course — RCCR:\n\n1. R = Right Hand Mastery\n2. C = Chords Placement\n3. C = Coordination\n4. R = Rhythm\n\nFollow these 4 steps in order and you can play ANY song with both hands!',
    },
    {
      title: 'Step 1 (R): Right Hand Mastery (PDF p. 125)',
      body:
        'Before touching a single chord with your Left Hand, your Right Hand must pass two checks:\n\n1. Master the song’s melody notes with your Right Hand (which you did in Chapter 2H!).\n2. Be able to play that Right-Hand melody on rhythm without stopping to hunt for keys.',
      highlight: { midis: [K.A3, K.B3, K.C4, K.E4], labels: { [K.A3]: 'A', [K.B3]: 'B', [K.C4]: 'C', [K.E4]: 'E' } },
      tryIt: {
        prompt: 'Play the opening Right-Hand notes of Gulabi Aankhein: A3 – B3 – C4 – E4.',
        targetMidis: [K.A3, K.B3, K.C4, K.E4],
      },
    },
    {
      title: 'Step 2 (C): Chords Placement (PDF p. 126)',
      body:
        'Next, look at the song sheet and see WHICH word or melody note triggers each chord on Beat 1.\n\nIn "Gulabi Aankhein" (pp. 129–132), the 4 chords are Am – G – F – E:\n• On "Dekhi" → Am\n• On "Sharaabi" → G\n• On "Dil" → F\n• On "Gaya" → E\n\nPractice shifting just those Left-Hand chords in rhythm first!',
      highlight: { midis: AM, labels: { [K.A3]: 'A', [K.C4]: 'C', [K.E4]: 'E' } },
      tryIt: { prompt: 'Hold the home chord of Gulabi Aankhein: A Minor (A + C + E).', targetMidis: AM, together: true },
    },
    {
      title: 'Step 3 (C — Coordination) & Step 4 (R — Rhythm) (PDF pp. 127–128)',
      body:
        '• Step 3 (Coordination): Combine both hands SLOWLY without a clock (Wait-for-Me mode in this app!). Crucial trick from p. 127: Release your Left-Hand chord a fraction of a second early so your Left Hand can travel to the next chord while your Right Hand keeps singing!\n\n• Step 4 (Rhythm): Turn on the Metronome ("Reality Checker", p. 128) and play the full song in time!\n\nEvery song in Chapters 4G & 4H has Step 1, Step 2, and Step 3 buttons at the top of the screen mapped directly to RCCR!',
      highlight: { midis: F, labels: { [K.F3]: 'F', [K.A3]: 'A', [K.C4]: 'C' } },
    },
  ],
};

export const SMART_CHORD_AND_ACMP: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Chapter 9D.2: Rhythm Tracks, ACMP & Sync Start on Your Keyboard',
  subtitle: 'PDF pp. 245–246 • Playing with Rhythm Styles & Backing Accompaniment',
  track: 'keyboard',
  durationMinutes: 8,
  source: 'course 9D (pp. 245–246)',
  objectives: [
    'Select a Rhythm Style (4/4 Pop/Ballad or 3/4 Waltz) on your keyboard',
    'Understand Rhythm Track only (ACMP Off) vs. Full Band Accompaniment (ACMP On + Sync Start)',
    'Use MAIN/AUTO FILL and INTRO/ENDING for live performance',
  ],
  steps: [
    {
      instruction: 'Press STYLE on your keyboard and choose a 4/4 Pop or Ballad style (e.g. 001 or 002).',
      panelButton: 'STYLE',
      explanation: 'In Chapter 9D (p. 246), Jash shows how using a drum Rhythm Track makes your home practice sound like a full studio production.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press ACMP ON/OFF and SYNC START, then play a C Major chord in your Left Hand.',
      panelButton: 'SYNC_START',
      explanation: 'Your keyboard starts the rhythm section automatically the instant your Left Hand lands on Beat 1!',
      verify: { kind: 'style-running' },
    },
    {
      instruction: 'Press INTRO/ENDING/rit. or START/STOP to bring the rhythm style to a clean stop.',
      panelButton: 'INTRO_ENDING',
      verify: { kind: 'style-stopped' },
    },
  ],
};

export const ADVANCED_CHORDS_IN_CONTEXT: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chapter 4I.2: Replacing Normal Chords with Sus2, Sus4 & Add9',
  subtitle: 'PDF pp. 171–174 • Upgrade C–Am–F–G with Csus2, Asus4, Fmaj7 & Gadd9',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4I (pp. 171–174)',
  objectives: [
    'Replace standard Major/Minor triads with Sus2, Sus4, and Maj7 voicings (PDF pp. 171–174)',
    'Hear how lifting or shifting the middle finger (3rd -> 2nd or 4th) adds studio shimmer to your chords',
  ],
  sequence: [
    { rootPc: PC.C, quality: 'major', label: 'C (1-3-5)' },
    { rootPc: PC.C, quality: 'sus2', label: 'Csus2 (1-2-5)' },
    { rootPc: PC.C, quality: 'sus4', label: 'Csus4 (1-4-5)' },
    { rootPc: PC.A, quality: 'minor', label: 'Am (1-3-5)' },
    { rootPc: PC.A, quality: 'sus2', label: 'Asus2 (1-2-5)' },
    { rootPc: PC.F, quality: 'major', label: 'F (1-3-5)' },
    { rootPc: PC.F, quality: 'maj7', label: 'Fmaj7 (1-3-5-7)' },
    { rootPc: PC.G, quality: 'major', label: 'G (1-3-5)' },
    { rootPc: PC.G, quality: 'sus4', label: 'Gsus4 (1-4-5)' },
    { rootPc: PC.C, quality: 'major', label: 'C (Home)' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 4000,
  repeats: 1,
};

export const CHORD_LOOPS_BEHIND_SONGS: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 4K: Chord Progressions Behind Famous Songs',
  subtitle: 'PDF pp. 176–178 • The 4-Chord Loops That Power Hundreds of Bollywood Hits',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4K (pp. 176–178)',
  objectives: [
    'Recognize the 4 most famous Bollywood chord progressions from Chapter 4K (pp. 176–178)',
    'Play Am – G – F – G and C – Am – F – G to accompany dozens of mashups effortlessly',
  ],
  cards: [
    {
      title: '1. The Romantic Minor Loop: Am – G – F – G / E (PDF p. 176)',
      body:
        'Look at how many songs in Chapter 4G & 4H share this exact progression family:\n\n• Gulabi Aankhein: Am – G – F – E\n• Tum Hi Ho (transposed to Am): Am – F – G – Em\n• Ae Dil Hai Mushkil: Am – F – C – G\n• Chura Liya: Am – G – F – E\n\nMaster these 4 chords and you can play a 10-song mashup non-stop!',
      highlight: { midis: AM, labels: { [K.A3]: 'A', [K.C4]: 'C', [K.E4]: 'E' } },
      tryIt: { prompt: 'Hold A Minor (A + C + E) to start the Minor Mashup loop.', targetMidis: AM, together: true },
    },
    {
      title: '2. The Classic Major Loop: C – Am – F – G (1 – 6 – 4 – 5) (PDF p. 177)',
      body:
        'For bright, nostalgic, and romantic Major-scale songs:\n\n• Jab Koi Baat Bigad Jaaye: C – Am – F – G\n• Pehla Nasha: C – Am – F – G\n• Raatan Lambiyan: C – G – Am – F\n\nNotice how the exact same 4 chords (C, Am, F, G) appear in almost every Major-key song!',
      highlight: { midis: C, labels: { [K.C4]: 'C', [K.E4]: 'E', [K.G4]: 'G' } },
      tryIt: { prompt: 'Hold C Major (C + E + G) to start the Major Mashup loop.', targetMidis: C, together: true },
    },
  ],
};
