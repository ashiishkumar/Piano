import { SongScore, TeacherLessonGuide } from '../types/music';
import { makeSong } from '../engine/sargam';
import { withIdPrefix } from '../engine/generators';
import { parseWestern, buildLeftHandChords } from './westernNotation';
import { PC } from './lessons/types';

/**
 * All Playable Exercises & Technique Drills from the PIX Series Zero to Hero Piano Course e-book
 * (Modules 2, 3, 4, 5, 6, and 9).
 */

// ============================================================================
// MODULE 2: Chapter 2B — Alankars 1–5 in C# ("Kali Ek", pp. 9–10) & C ("Safed Ek")
// ============================================================================

const KALI_EK_GUIDE: TeacherLessonGuide = {
  whyLearnThis:
    'In Chapter 2B (pp. 9–10), Jash introduces the 5 foundational Alankars starting on C# ("Kali Ek" — the first black key), which is the standard harmonium & Indian vocal reference pitch. Notice the special thumb-under fingering: Sa=2, Re=3, Ga=1 (thumb on F), Ma=2, Pa=3, Dha=4, Ni=1 (thumb on C), Sa\'=2!',
  handPlacement: {
    rightHand:
      'Place Index (Finger 2) on C#4 (Sa) and Middle (Finger 3) on D#4 (Re). Your Thumb (Finger 1) tucks onto the white key F4 (Ga), then 2-3-4 play the 3 black keys F#4-G#4-A#4 (Ma-Pa-Dha), Thumb (1) plays C5 (Ni), and Index (2) lands on C#5 (Taar Sa)!',
    leftHand: 'Rest your Left Hand in your lap during Module 2.',
  },
  whatTeacherExpects: [
    'Step 1: Play Alankars 1–5 in Wait-for-Me mode using the exact 2-3-1-2-3-4-1-2 Kali Ek fingering.',
    'Step 2: Play with the metronome at 80 BPM (Beginner target on p. 10).',
    'Step 3: Build up toward 120–150 BPM with zero hesitation on the thumb tucks (Ga=F4 and Ni=C5).',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Step 1: Learn Kali Ek Fingering (Wait-for-Me)',
      subtitle: 'Sa=2, Re=3, Ga=1, Ma=2, Pa=3, Dha=4, Ni=1, Sa\'=2',
      whatToExpect: 'The lesson pauses at each note so your fingers learn the black-to-white-key transitions.',
      handFilter: 'right',
      tier: 'beginner',
      practiceMode: 'wait',
      tempoMultiplier: 0.7,
    },
    {
      stepNumber: 2,
      title: 'Step 2: Alankars 1–3 in Rhythm (80 BPM)',
      subtitle: 'Steady metronome pulse',
      whatToExpect: 'Play Alankars 1, 2, and 3 smoothly on the beat.',
      handFilter: 'right',
      tier: 'intermediate',
      practiceMode: 'rhythm',
      tempoMultiplier: 0.85,
    },
    {
      stepNumber: 3,
      title: 'Step 3: All 5 Alankars in Rhythm',
      subtitle: 'Full paltas with 8th-note groups',
      whatToExpect: 'Master all 5 Alankars from page 10 of the course book.',
      handFilter: 'right',
      tier: 'pro',
      practiceMode: 'rhythm',
      tempoMultiplier: 1.0,
    },
  ],
};

// C# Major scale notes: Sa=C#, Re=D#, Ga=F, Ma=F#, Pa=G#, Dha=A#, Ni=C', Sa'=C#'
const ALANKARS_KALI_EK_BEGINNER = `
// Alankar 1 (p. 10): SA RE GA MA PA DHA NI SA' | SA' NI DHA PA MA GA RE SA
RH: C#/2 D#/3 F/1 F#/2 | G#/3 A#/4 C'/1 C#'/2 | C#'/2 C'/1 A#/4 G#/3 | F#/2 F/1 D#/3 C#/2 |
// Alankar 5 (p. 10): SA RE GA MA PA MA GA RE SA
RH: C#/2 D#/3 F/1 F#/2 | G#/3 F#/2 F/1 D#/3 | C#/2 - - 0 |
`;

const ALANKARS_KALI_EK_PRO = `
// Alankar 1: Straight Aroha & Avaroha
RH: C#/2 D#/3 F/1 F#/2 | G#/3 A#/4 C'/1 C#'/2 | C#'/2 C'/1 A#/4 G#/3 | F#/2 F/1 D#/3 C#/2 |
// Alankar 2 (4 beats, pairs): (SA RE) (RE GA) (GA MA) (MA PA) (PA DHA) (DHA NI) (NI SA')
RH: (C#/2 D#/3) (D#/3 F/1) (F/1 F#/2) (F#/2 G#/3) | (G#/3 A#/4) (A#/4 C'/1) (C'/1 C#'/2) C#'/2 |
RH: (C#'/2 C'/1) (C'/1 A#/4) (A#/4 G#/3) (G#/3 F#/2) | (F#/2 F/1) (F/1 D#/3) (D#/3 C#/2) C#/2 |
// Alankar 3 (3-note groups): (SA RE GA) (RE GA MA) ...
RH: (C#/2 D#/3 F/1) (D#/3 F/1 F#/2) (F/1 F#/2 G#/3) (F#/2 G#/3 A#/4) | (G#/3 A#/4 C'/1) (A#/4 C'/1 C#'/2) C#'/2 - |
// Alankar 4 (4-note turn): (SA RE GA MA) RE | (RE GA MA PA) GA ...
RH: (C#/2 D#/3 F/1 F#/2) D#/3 (D#/3 F/1 F#/2 G#/3) F/1 | (F/1 F#/2 G#/3 A#/4) F#/2 (F#/2 G#/3 A#/4 C'/1) G#/3 |
// Alankar 5: SA RE GA MA PA MA GA RE SA
RH: C#/2 D#/3 F/1 F#/2 | G#/3 F#/2 F/1 D#/3 | C#/2 - - 0 |
`;

export const ZTH_2B_ALANKARS_KALI_EK: SongScore = makeSong(
  {
    id: 'zth-2b-alankars-kali-ek',
    title: 'Chapter 2B: All 5 Alankars in C# (Kali Ek)',
    subtitle: 'PDF pp. 9–10 • Finger position 2-3-1-2-3-4-1-2 • Metronome 80–150 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 2B)',
    stageId: 1,
    category: 'drill',
    bpm: 90,
    timeSignature: [4, 4],
    keySignature: 'C#',
    rootSaPitchClass: PC.Cs,
    pedagogyFocus: [
      'Kali Ek (C#) Indian Sargam fingering: 2-3-1-2-3-4-1-2',
      'All 5 Alankars from page 10 at 80–150 BPM',
    ],
    coachTip:
      'On Kali Ek (C#), your thumb (Finger 1) never plays a black key—it tucks cleanly onto white keys F (Ga) and C (Ni)!',
    teacherGuide: KALI_EK_GUIDE,
  },
  {
    beginner: parseWestern(ALANKARS_KALI_EK_BEGINNER, { bpm: 90, idPrefix: 'k1b' }),
    intermediate: parseWestern(ALANKARS_KALI_EK_PRO, { bpm: 90, idPrefix: 'k1i' }),
    pro: parseWestern(ALANKARS_KALI_EK_PRO, { bpm: 90, idPrefix: 'k1p' }),
  },
  {
    beginner: 'Alankars 1 & 5 (Wait)',
    intermediate: 'All 5 Alankars (80 BPM)',
    pro: 'All 5 Alankars (Target BPM)',
  }
);

// Same 5 Alankars on C Major (Safed Ek) for white-key practice
const ALANKARS_SAFED_EK_PRO = `
// Alankar 1: SA RE GA MA PA DHA NI SA'
RH: C/1 D/2 E/3 F/1 | G/2 A/3 B/4 C'/5 | C'/5 B/4 A/3 G/2 | F/1 E/3 D/2 C/1 |
// Alankar 2: (SA RE) (RE GA) ...
RH: (C/1 D/2) (D/2 E/3) (E/3 F/1) (F/1 G/2) | (G/2 A/3) (A/3 B/4) (B/4 C'/5) C'/5 |
RH: (C'/5 B/4) (B/4 A/3) (A/3 G/2) (G/2 F/1) | (F/1 E/3) (E/3 D/2) (D/2 C/1) C/1 |
// Alankar 3: 3-note groups
RH: (C/1 D/2 E/3) (D/2 E/3 F/1) (E/3 F/1 G/2) (F/1 G/2 A/3) | (G/2 A/3 B/4) (A/3 B/4 C'/5) C'/5 - |
// Alankar 4: (SA RE GA MA) RE ...
RH: (C/1 D/2 E/3 F/1) D/2 (D/2 E/3 F/1 G/2) E/3 | (E/3 F/1 G/2 A/3) F/1 (F/1 G/2 A/3 B/4) G/2 |
// Alankar 5: SA RE GA MA PA MA GA RE SA
RH: C/1 D/2 E/3 F/4 | G/5 F/4 E/3 D/2 | C/1 - - 0 |
`;

export const ZTH_2B_ALANKARS_SAFED_EK: SongScore = makeSong(
  {
    id: 'zth-2b-alankars-safed-ek',
    title: 'Chapter 2B: All 5 Alankars in C (Safed Ek)',
    subtitle: 'PDF p. 10 • White-Key Sargam (1-2-3-1-2-3-4-5) • Metronome 80–150 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 2B)',
    stageId: 1,
    category: 'drill',
    bpm: 96,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaPitchClass: PC.C,
    pedagogyFocus: [
      'Mastering all 5 Alankars on white keys (Sa = Middle C)',
      'Smooth 1-2-3-1 thumb tuck from Ga (E4) to Ma (F4)',
    ],
    coachTip: 'Sing each Sargam note aloud as you play—Jash teaches that your voice locks in the swaras twice as fast!',
  },
  {
    beginner: parseWestern(ALANKARS_SAFED_EK_PRO, { bpm: 96, idPrefix: 's1b' }),
    intermediate: parseWestern(ALANKARS_SAFED_EK_PRO, { bpm: 96, idPrefix: 's1i' }),
    pro: parseWestern(ALANKARS_SAFED_EK_PRO, { bpm: 96, idPrefix: 's1p' }),
  }
);

// ============================================================================
// MODULE 2: Chapter 2C — First Song on Piano: Happy Birthday in Sargam (p. 11)
// ============================================================================

// Exact notation from PDF p. 11:
// SA SA RE SA MA GA | SA SA RE SA PA MA | SA SA DHA PA MA GA RE | MA MA GA SA RE SA
const HAPPY_BIRTHDAY_2C = `
RH: (C/1 C/1) D/2 C/1 F/4 | E/3 - - 0 |
RH: (C/1 C/1) D/2 C/1 G/5 | F/4 - - 0 |
RH: (C/1 C/1) A/5 G/4 F/3 | E/2 D/1 - 0 |
RH: (F/4 F/4) E/3 C/1 D/2 | C/1 - - 0 |
`;

export const ZTH_2C_HAPPY_BIRTHDAY: SongScore = makeSong(
  {
    id: 'zth-2c-happy-birthday',
    title: 'Chapter 2C: First Song — Happy Birthday (Sargam)',
    subtitle: 'PDF p. 11 • SA SA RE SA MA GA • Metronome 70–120 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 2C)',
    stageId: 1,
    category: 'repertoire',
    bpm: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaPitchClass: PC.C,
    pedagogyFocus: [
      'Playing your very first song from Sargam notes (PDF p. 11)',
      'Controlling the leap from Sa to Dha on the 3rd line',
    ],
    coachTip:
      'Follow the exact 4 lines on page 11: Line 1 lands on GA (E), Line 2 lands on MA (F), Line 3 jumps to DHA (A) and steps down to RE (D), and Line 4 finishes home on SA (C)!',
  },
  {
    beginner: parseWestern(HAPPY_BIRTHDAY_2C, { bpm: 88, idPrefix: 'hb2c-b' }),
    intermediate: parseWestern(HAPPY_BIRTHDAY_2C, { bpm: 88, idPrefix: 'hb2c-i' }),
    pro: parseWestern(HAPPY_BIRTHDAY_2C, { bpm: 88, idPrefix: 'hb2c-p' }),
  }
);

// ============================================================================
// MODULE 2: Chapter 2E — Top #4 Right-Hand Exercises (pp. 14–15)
// ============================================================================

// Exercise 1 (p. 14): C E G E C E F G (1 3 5 3 1 3 4 5) stepping up C -> D -> E -> F -> G -> A -> B -> C'
const RH_EX1_WESTERN = `
RH: C/1 E/3 G/5 E/3 | C/1 E/3 F/4 G/5 |
RH: D/1 F/3 A/5 F/3 | D/1 F/3 G/4 A/5 |
RH: E/1 G/3 B/5 G/3 | E/1 G/3 A/4 B/5 |
RH: F/1 A/3 C'/5 A/3 | F/1 A/3 B/4 C'/5 |
RH: G/1 B/3 D'/5 B/3 | G/1 B/3 C'/4 D'/5 |
RH: A/1 C'/3 E'/5 C'/3 | A/1 C'/3 D'/4 E'/5 |
RH: C'/5 A/3 F/1 A/3 | G/5 E/3 D/2 C/1 |
`;

export const ZTH_2E_RH_EX1: SongScore = makeSong(
  {
    id: 'zth-2e-rh-ex1',
    title: 'Chapter 2E.1: Right-Hand Exercise #1 (C E G E C E F G)',
    subtitle: 'PDF p. 14 • Fingers 1-3-5-3-1-3-4-5 stepping up white keys',
    composer: 'PIX Series Zero to Hero (Ch. 2E)',
    stageId: 1,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Finger pattern 1-3-5-3-1-3-4-5 across every white-key position',
      'Shifting the 5-finger hand shape up one white key at a time',
    ],
    coachTip:
      'Keep your hand shape curved! After playing C-E-G-E-C-E-F-G, shift your whole 5-finger frame one key right to start on D with Finger 1.',
  },
  {
    beginner: parseWestern(RH_EX1_WESTERN, { bpm: 92, idPrefix: '2e1-b' }),
    intermediate: parseWestern(RH_EX1_WESTERN, { bpm: 92, idPrefix: '2e1-i' }),
    pro: parseWestern(RH_EX1_WESTERN, { bpm: 92, idPrefix: '2e1-p' }),
  }
);

// Exercise 2 (p. 14): C E C F G D E C (1 3 1 4 5 2 3 1) stepping up
const RH_EX2_WESTERN = `
RH: C/1 E/3 C/1 F/4 | G/5 D/2 E/3 C/1 |
RH: D/1 F/3 D/1 G/4 | A/5 E/2 F/3 D/1 |
RH: E/1 G/3 E/1 A/4 | B/5 F/2 G/3 E/1 |
RH: F/1 A/3 F/1 B/4 | C'/5 G/2 A/3 F/1 |
RH: G/1 B/3 G/1 C'/4 | D'/5 A/2 B/3 G/1 |
RH: C/1 E/3 C/1 F/4 | G/5 D/2 E/3 C/1 |
`;

export const ZTH_2E_RH_EX2: SongScore = makeSong(
  {
    id: 'zth-2e-rh-ex2',
    title: 'Chapter 2E.2: Right-Hand Exercise #2 (C E C F G D E C)',
    subtitle: 'PDF p. 14 • Fingers 1-3-1-4-5-2-3-1 • Ring & Pinky Independence',
    composer: 'PIX Series Zero to Hero (Ch. 2E)',
    stageId: 1,
    category: 'drill',
    bpm: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Unlocking the weak Ring Finger (4) and Pinky (5) via 1-3-1-4-5-2-3-1',
      'Clean jump from Finger 5 down to Index Finger 2',
    ],
    coachTip:
      'Notice how Finger 1 anchors you twice (C-E-C-F) before Finger 5 and Finger 2 trade off (G-D-E-C). Keep your wrist still!',
  },
  {
    beginner: parseWestern(RH_EX2_WESTERN, { bpm: 88, idPrefix: '2e2-b' }),
    intermediate: parseWestern(RH_EX2_WESTERN, { bpm: 88, idPrefix: '2e2-i' }),
    pro: parseWestern(RH_EX2_WESTERN, { bpm: 88, idPrefix: '2e2-p' }),
  }
);

// Exercise 3 (p. 15): G C G D G E G F (5 1 5 2 5 3 5 4) stepping up
const RH_EX3_WESTERN = `
RH: G/5 C/1 G/5 D/2 | G/5 E/3 G/5 F/4 |
RH: A/5 D/1 A/5 E/2 | A/5 F/3 A/5 G/4 |
RH: B/5 E/1 B/5 F/2 | B/5 G/3 B/5 A/4 |
RH: C'/5 F/1 C'/5 G/2 | C'/5 A/3 C'/5 B/4 |
RH: D'/5 G/1 D'/5 A/2 | D'/5 B/3 D'/5 C'/4 |
RH: G/5 C/1 G/5 D/2 | G/5 E/3 D/2 C/1 |
`;

export const ZTH_2E_RH_EX3: SongScore = makeSong(
  {
    id: 'zth-2e-rh-ex3',
    title: 'Chapter 2E.3: Right-Hand Exercise #3 (G C G D G E G F)',
    subtitle: 'PDF p. 15 • Pinky Pedal Pivot (Fingers 5-1-5-2-5-3-5-4)',
    composer: 'PIX Series Zero to Hero (Ch. 2E)',
    stageId: 1,
    category: 'drill',
    bpm: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Strengthening the Pinky (Finger 5) as an upper pivot note',
      'Playing 5-1, 5-2, 5-3, 5-4 without rotating the elbow',
    ],
    coachTip:
      'Your Pinky (Finger 5) is the boss in Exercise #3! Let it bounce lightly on the top note while Fingers 1, 2, 3, and 4 climb underneath.',
  },
  {
    beginner: parseWestern(RH_EX3_WESTERN, { bpm: 88, idPrefix: '2e3-b' }),
    intermediate: parseWestern(RH_EX3_WESTERN, { bpm: 88, idPrefix: '2e3-i' }),
    pro: parseWestern(RH_EX3_WESTERN, { bpm: 88, idPrefix: '2e3-p' }),
  }
);

// Exercise 4 (p. 15): 3/4 meter — E C G F E D (3 1 5 4 3 2) stepping up
const RH_EX4_WESTERN = `
RH: E/3 C/1 G/5 | F/4 E/3 D/2 |
RH: F/3 D/1 A/5 | G/4 F/3 E/2 |
RH: G/3 E/1 B/5 | A/4 G/3 F/2 |
RH: A/3 F/1 C'/5 | B/4 A/3 G/2 |
RH: B/3 G/1 D'/5 | C'/4 B/3 A/2 |
RH: E/3 C/1 G/5 | F/4 D/2 C/1 |
`;

export const ZTH_2E_RH_EX4: SongScore = makeSong(
  {
    id: 'zth-2e-rh-ex4',
    title: 'Chapter 2E.4: Right-Hand Exercise #4 in 3/4 (E C G F E D)',
    subtitle: 'PDF p. 15 • 3/4 Waltz Meter • Fingers 3-1-5-4-3-2',
    composer: 'PIX Series Zero to Hero (Ch. 2E)',
    stageId: 1,
    category: 'drill',
    bpm: 96,
    timeSignature: [3, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Counting 3 beats per bar (1-2-3 | 1-2-3) instead of 4',
      'Finger pattern 3-1-5-4-3-2 stepping smoothly up the keyboard',
    ],
    coachTip: 'Notice this exercise has 6 notes grouped into two 3-beat bars: E-C-G (1-2-3) | F-E-D (1-2-3)!',
  },
  {
    beginner: parseWestern(RH_EX4_WESTERN, { bpm: 96, timeSignature: [3, 4], idPrefix: '2e4-b' }),
    intermediate: parseWestern(RH_EX4_WESTERN, { bpm: 96, timeSignature: [3, 4], idPrefix: '2e4-i' }),
    pro: parseWestern(RH_EX4_WESTERN, { bpm: 96, timeSignature: [3, 4], idPrefix: '2e4-p' }),
  }
);

// ============================================================================
// MODULE 2: Chapter 2G — Playing Exercises in All 4 Rhythm Formats (pp. 20–24)
// ============================================================================

const RHYTHM_2G_WHOLE_HALF = `
// Format 1 (Whole Notes — hold 4 beats) & Format 2 (Half Notes — hold 2 beats)
RH: C/1 - - - | E/3 - - - | G/5 - - - | E/3 - - - |
RH: C/1 - E/3 - | G/5 - E/3 - | C/1 - E/3 - | F/4 - G/5 - |
`;

const RHYTHM_2G_QUARTER = `
// Format 3 (Quarter Notes — 1 hit per beat, PDF p. 21: 80–170 BPM)
RH: C/1 E/3 G/5 E/3 | C/1 E/3 F/4 G/5 | D/1 F/3 A/5 F/3 | D/1 F/3 G/4 A/5 |
RH: C/1 E/3 C/1 F/4 | G/5 D/2 E/3 C/1 | G/5 C/1 G/5 D/2 | G/5 E/3 G/5 F/4 |
`;

const RHYTHM_2G_EIGHTH = `
// Format 4 (Eighth Notes — 2 hits per beat, PDF p. 21: 60–140 BPM)
RH: (C/1 E/3) (G/5 E/3) (C/1 E/3) (F/4 G/5) | (D/1 F/3) (A/5 F/3) (D/1 F/3) (G/4 A/5) |
RH: (C/1 E/3) (C/1 F/4) (G/5 D/2) (E/3 C/1) | (G/5 C/1) (G/5 D/2) (G/5 E/3) (G/5 F/4) |
`;

export const ZTH_2G_RHYTHM_FORMATS: SongScore = makeSong(
  {
    id: 'zth-2g-rhythm-formats',
    title: 'Chapter 2G: Exercises 1–3 in Whole, Half, Quarter & 8th Notes',
    subtitle: 'PDF pp. 20–24 • Master all 4 rhythm speeds on the keyboard',
    composer: 'PIX Series Zero to Hero (Ch. 2G)',
    stageId: 2,
    category: 'drill',
    bpm: 84,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Playing the same exercise in Whole (4-beat), Half (2-beat), Quarter (1-beat), and Eighth (half-beat) rhythms',
      'Keeping the metronome steady while your hand doubles its note density',
    ],
    coachTip:
      'Use the Step 1 / Step 2 / Step 3 buttons at the top of the lesson to switch from Whole/Half notes (Step 1) to Quarter notes (Step 2) to Eighth notes (Step 3)!',
    teacherGuide: {
      whyLearnThis:
        'In Chapter 2G (pp. 20–24), Jash shows that real rhythm mastery means playing the exact same finger exercise in 4 note-value formats: Whole notes (1 hit per 4 beats), Half notes (beats 1 & 3), Quarter notes (every beat), and Eighth notes (2 notes per beat).',
      handPlacement: {
        rightHand: 'Fingers 1–5 on C4–G4 (shifting to D4–A4 when indicated).',
        leftHand: 'Rest in your lap.',
      },
      whatTeacherExpects: [
        'Step 1 (Whole & Half Notes): Hold each note for its full 4-beat or 2-beat count—do not release early!',
        'Step 2 (Quarter Notes): Land 1 note squarely on every metronome click.',
        'Step 3 (Eighth Notes): Fit 2 even notes ("1-and, 2-and") inside every single metronome click.',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Step 1: Whole & Half Note Formats',
          subtitle: 'Hold for 4 beats, then 2 beats',
          whatToExpect: 'Practice patience—hold the key down for the entire bar or half-bar.',
          handFilter: 'right',
          tier: 'beginner',
          practiceMode: 'rhythm',
          tempoMultiplier: 1.0,
        },
        {
          stepNumber: 2,
          title: 'Step 2: Quarter Note Format (1 per Beat)',
          subtitle: 'PDF p. 21 • 80–170 BPM target',
          whatToExpect: 'One note per metronome click across Exercises 1, 2, and 3.',
          handFilter: 'right',
          tier: 'intermediate',
          practiceMode: 'rhythm',
          tempoMultiplier: 1.0,
        },
        {
          stepNumber: 3,
          title: 'Step 3: Eighth Note Format (2 per Beat)',
          subtitle: 'PDF p. 21 • 60–140 BPM target',
          whatToExpect: 'Two even notes per metronome click—keep your fingers light and close to the keys.',
          handFilter: 'right',
          tier: 'pro',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.85,
        },
      ],
    },
  },
  {
    beginner: parseWestern(RHYTHM_2G_WHOLE_HALF, { bpm: 84, idPrefix: '2g-b' }),
    intermediate: parseWestern(RHYTHM_2G_QUARTER, { bpm: 84, idPrefix: '2g-i' }),
    pro: parseWestern(RHYTHM_2G_EIGHTH, { bpm: 84, idPrefix: '2g-p' }),
  },
  {
    beginner: 'Whole & Half Notes',
    intermediate: 'Quarter Notes',
    pro: 'Eighth Notes',
  }
);

// ============================================================================
// MODULE 2: Chapter 2J — Final Stage: Mastering Right Hand (pp. 59–61)
// ============================================================================

// Ex 1 (p. 59): Octave doubling in RH (Fingers 1 & 5 together on C D E F G F E D, 80–130 BPM)
const MASTER_RH_EX1 = `
RH: [C4/1 C5/5] [D4/1 D5/5] [E4/1 E5/5] [F4/1 F5/5] | [G4/1 G5/5] [F4/1 F5/5] [E4/1 E5/5] [D4/1 D5/5] |
RH: [D4/1 D5/5] [E4/1 E5/5] [F4/1 F5/5] [G4/1 G5/5] | [A4/1 A5/5] [G4/1 G5/5] [F4/1 F5/5] [E4/1 E5/5] |
RH: [C4/1 C5/5] - - 0 |
`;

// Ex 2 (p. 60): Black-Key Pentatonic Sequence (C# D# F# G# A# G# F# D#, 70–110 BPM)
const MASTER_RH_EX2 = `
RH: C#/1 D#/2 F#/3 G#/4 | A#/5 G#/4 F#/3 D#/2 |
RH: D#/1 F#/2 G#/3 A#/4 | C#'/5 A#/4 G#/3 F#/2 |
RH: C#/1 D#/2 F#/3 G#/4 | A#/5 G#/4 F#/3 D#/2 | C#/1 - - 0 |
`;

// Ex 3 (p. 61): Double-Note Harmonic Thirds (CE) (DF) (CE) with fingers (13) (24) (13) (100–160 BPM)
const MASTER_RH_EX3 = `
RH: [C/1 E/3] [D/2 F/4] [C/1 E/3] - | [D/1 F/3] [E/2 G/4] [D/1 F/3] - |
RH: [E/1 G/3] [F/2 A/4] [E/1 G/3] - | [F/1 A/3] [G/2 B/4] [F/1 A/3] - |
RH: [G/1 B/3] [A/2 C'/4] [G/1 B/3] - | [C/1 E/3] [D/2 F/4] [C/1 E/3] - |
`;

export const ZTH_2J_MASTER_RH: SongScore = makeSong(
  {
    id: 'zth-2j-master-rh',
    title: 'Chapter 2J: Final Stage — Mastering Right Hand (Exercises 1–3)',
    subtitle: 'PDF pp. 59–61 • Ex 1: Octaves • Ex 2: Black Keys • Ex 3: Double-Note Thirds',
    composer: 'PIX Series Zero to Hero (Ch. 2J)',
    stageId: 2,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Exercise 1 (p. 59): Right-Hand Octave span (Fingers 1 & 5 together, 80–130 BPM)',
      'Exercise 2 (p. 60): Black-Key Pentatonic agility (C#-D#-F#-G#-A#, 70–110 BPM)',
      'Exercise 3 (p. 61): Double-Note Thirds (CE)-(DF)-(CE) with fingers (13)-(24)-(13)',
    ],
    coachTip:
      'Use Step 1 for Exercise 1 (Octaves), Step 2 for Exercise 2 (Black Keys), and Step 3 for Exercise 3 (Harmonic Thirds)!',
    teacherGuide: {
      whyLearnThis:
        'Chapter 2J (pp. 59–61) is the final boss of Module 2! It trains 3 pro right-hand textures: playing full Octaves (1+5), gliding across all 5 Black Keys without slipping, and playing simultaneous two-note Thirds (1+3 and 2+4).',
      handPlacement: {
        rightHand: 'Step 1: Thumb on C4 + Pinky on C5. Step 2: Fingers 1-2-3-4-5 on C#-D#-F#-G#-A#. Step 3: Fingers 1+3 on C4+E4 and 2+4 on D4+F4.',
        leftHand: 'Rest in your lap.',
      },
      whatTeacherExpects: [
        'Step 1 (Exercise 1 — Octaves): Lock your hand span to 8 keys (C4+C5) and move from the arm, not the fingers.',
        'Step 2 (Exercise 2 — Black Keys): Keep your fingers slightly flatter on the narrow black keys so you never slip onto a white key.',
        'Step 3 (Exercise 3 — Double Thirds): Press C+E (1+3) at the exact same millisecond, then rock cleanly to D+F (2+4).',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Step 1: Exercise #1 — Right-Hand Octaves (p. 59)',
          subtitle: 'Fingers 1 & 5 together • 80–130 BPM',
          whatToExpect: 'Play C4+C5, D4+D5, E4+E5, F4+F5, G4+G5 together.',
          handFilter: 'right',
          tier: 'beginner',
          practiceMode: 'wait',
          tempoMultiplier: 0.85,
        },
        {
          stepNumber: 2,
          title: 'Step 2: Exercise #2 — Black-Key Run (p. 60)',
          subtitle: 'C# D# F# G# A# G# F# D# • 70–110 BPM',
          whatToExpect: 'Play only the black keys with fingers 1-2-3-4-5.',
          handFilter: 'right',
          tier: 'intermediate',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.85,
        },
        {
          stepNumber: 3,
          title: 'Step 3: Exercise #3 — Double-Note Thirds (p. 61)',
          subtitle: '(CE) (DF) (CE) with (13) (24) (13) • 100–160 BPM',
          whatToExpect: 'Rock cleanly between fingers 1+3 and 2+4 stepping up the white keys.',
          handFilter: 'right',
          tier: 'pro',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.95,
        },
      ],
    },
  },
  {
    beginner: parseWestern(MASTER_RH_EX1, { bpm: 92, idPrefix: '2j-e1' }),
    intermediate: parseWestern(MASTER_RH_EX2, { bpm: 92, idPrefix: '2j-e2' }),
    pro: parseWestern(MASTER_RH_EX3, { bpm: 92, idPrefix: '2j-e3' }),
  },
  {
    beginner: 'Ex 1: RH Octaves',
    intermediate: 'Ex 2: Black Keys',
    pro: 'Ex 3: Double Thirds',
  }
);

// ============================================================================
// MODULE 3: Chapter 3A & 3B — Major & Minor Scales Workouts (pp. 63–77)
// ============================================================================

const MAJOR_SCALES_3A = `
// C Major (RH 1-2-3-1-2-3-4-5, LH 5-4-3-2-1-3-2-1)
RH: C/1 D/2 E/3 F/1 | G/2 A/3 B/4 C'/5 | C'/5 B/4 A/3 G/2 | F/1 E/3 D/2 C/1 |
LH: C/5 D/4 E/3 F/2 | G/1 A/3 B/2 C'/1 | C'/1 B/2 A/3 G/1 | F/2 E/3 D/4 C/5 |
// G Major (F#)
RH: G/1 A/2 B/3 C'/1 | D'/2 E'/3 F#'/4 G'/5 | G'/5 F#'/4 E'/3 D'/2 | C'/1 B/3 A/2 G/1 |
LH: G/5 A/4 B/3 C'/2 | D'/1 E'/3 F#'/2 G'/1 | G'/1 F#'/2 E'/3 D'/1 | C'/2 B/3 A/4 G/5 |
// D Major (F#, C#)
RH: D/1 E/2 F#/3 G/1 | A/2 B/3 C#'/4 D'/5 | D'/5 C#'/4 B/3 A/2 | G/1 F#/3 E/2 D/1 |
LH: D/5 E/4 F#/3 G/2 | A/1 B/3 C#'/2 D'/1 | D'/1 C#'/2 B/3 A/1 | G/2 F#/3 E/4 D/5 |
// F Major (Bb = A#, RH 1-2-3-4-1-2-3-4 per PDF p. 69)
RH: F/1 G/2 A/3 A#/4 | C'/1 D'/2 E'/3 F'/4 | F'/4 E'/3 D'/2 C'/1 | A#/4 A/3 G/2 F/1 |
LH: F/5 G/4 A/3 A#/2 | C'/1 D'/3 E'/2 F'/1 | F'/1 E'/2 D'/3 C'/1 | A#/2 A/3 G/4 F/5 |
`;

export const ZTH_3A_MAJOR_SCALES_DRILL: SongScore = makeSong(
  {
    id: 'zth-3a-major-scales-drill',
    title: 'Chapter 3A: Major Scales Workout (C, G, D, F — LH & RH)',
    subtitle: 'PDF pp. 66–71 • Formula: - T T ST T T T ST • Metronome 80–110 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 3A)',
    stageId: 3,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Exact LH & RH Major Scale fingerings from PDF pp. 66–71 (including F Major RH 1-2-3-4-1-2-3-4)',
      'Practicing Right Hand alone, Left Hand alone, and Both Hands together at 80–110 BPM',
    ],
    coachTip:
      'In F Major (PDF p. 69), your Right Hand uses Finger 4 on A# (Bb) and then tucks Thumb (1) onto C—never put your thumb on a black key in standard white-root scales!',
  },
  {
    beginner: parseWestern(MAJOR_SCALES_3A, { bpm: 92, idPrefix: '3a-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(MAJOR_SCALES_3A, { bpm: 92, idPrefix: '3a-i' }).filter((n) => n.hand === 'left'),
    pro: parseWestern(MAJOR_SCALES_3A, { bpm: 92, idPrefix: '3a-p' }),
  },
  {
    beginner: 'Right Hand Scales',
    intermediate: 'Left Hand Scales',
    pro: 'Both Hands Together',
  }
);

const MINOR_SCALES_3B = `
// A Natural Minor (A B C D E F G A)
RH: A,/1 B,/2 C/3 D/1 | E/2 F/3 G/4 A/5 | A/5 G/4 F/3 E/2 | D/1 C/3 B,/2 A,/1 |
LH: A,/5 B,/4 C/3 D/2 | E/1 F/3 G/2 A/1 | A/1 G/2 F/3 E/1 | D/2 C/3 B,/4 A,/5 |
// E Natural Minor (E F# G A B C D E)
RH: E/1 F#/2 G/3 A/1 | B/2 C'/3 D'/4 E'/5 | E'/5 D'/4 C'/3 B/2 | A/1 G/3 F#/2 E/1 |
LH: E/5 F#/4 G/3 A/2 | B/1 C'/3 D'/2 E'/1 | E'/1 D'/2 C'/3 B/1 | A/2 G/3 F#/4 E/5 |
// D Natural Minor (D E F G A A# C D)
RH: D/1 E/2 F/3 G/1 | A/2 A#/3 C'/4 D'/5 | D'/5 C'/4 A#/3 A/2 | G/1 F/3 E/2 D/1 |
LH: D/5 E/4 F/3 G/2 | A/1 A#/3 C'/2 D'/1 | D'/1 C'/2 A#/3 A/1 | G/2 F/3 E/4 D/5 |
`;

export const ZTH_3B_MINOR_SCALES_DRILL: SongScore = makeSong(
  {
    id: 'zth-3b-minor-scales-drill',
    title: 'Chapter 3B: Natural Minor Scales Workout (Am, Em, Dm — LH & RH)',
    subtitle: 'PDF pp. 74–77 • Formula: - T ST T T ST T T • Metronome 80–110 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 3B)',
    stageId: 3,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'Am',
    pedagogyFocus: [
      'Natural Minor formula (- T ST T T ST T T) from PDF pp. 72–77',
      'Hearing the dark minor 3rd (ST between degrees 2 and 3)',
    ],
    coachTip:
      'Practice Right Hand in Step 1, Left Hand in Step 2, and Both Hands Together in Step 3 at 80–110 BPM.',
  },
  {
    beginner: parseWestern(MINOR_SCALES_3B, { bpm: 92, idPrefix: '3b-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(MINOR_SCALES_3B, { bpm: 92, idPrefix: '3b-i' }).filter((n) => n.hand === 'left'),
    pro: parseWestern(MINOR_SCALES_3B, { bpm: 92, idPrefix: '3b-p' }),
  },
  {
    beginner: 'Right Hand Minor Scales',
    intermediate: 'Left Hand Minor Scales',
    pro: 'Both Hands Together',
  }
);

// ============================================================================
// MODULE 3: Chapter 3D — Chord Inversions Workout (pp. 90–93)
// ============================================================================

const INVERSIONS_3D = `
// C Major: Root (C-E-G), 1st Inversion (E-G-C'), 2nd Inversion (G-C'-E')
RH: [C/1 E/3 G/5] - [E/1 G/2 C'/5] - | [G/1 C'/3 E'/5] - [C/1 E/3 G/5] - |
LH: [C/5 E/3 G/1] - [E/5 G/3 C'/1] - | [G/5 C'/2 E'/1] - [C/5 E/3 G/1] - |
// Zero-Jump Progression: C Root (C-E-G) -> F 2nd Inv (C-F-A) -> G 1st Inv (B,-D-G) -> C Root
RH: [C/1 E/3 G/5] - [C/1 F/3 A/5] - | [B,/1 D/2 G/5] - [C/1 E/3 G/5] - |
LH: [C/5 E/3 G/1] - [C/5 F/2 A/1] - | [B,/5 D/3 G/1] - [C/5 E/3 G/1] - |
`;

export const ZTH_3D_CHORD_INVERSIONS: SongScore = makeSong(
  {
    id: 'zth-3d-chord-inversions',
    title: 'Chapter 3D: Chord Inversions (Root, 1st & 2nd Inversion)',
    subtitle: 'PDF pp. 90–93 • C-E-G → E-G-C → G-C-E & Smooth Voice Leading',
    composer: 'PIX Series Zero to Hero (Ch. 3D)',
    stageId: 3,
    category: 'drill',
    bpm: 76,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Playing every chord in 3 ways: Root Position (1-3-5), 1st Inversion (3-5-1), 2nd Inversion (5-1-3)',
      'Using inversions so your hand shifts by 1 key instead of jumping across the keyboard',
    ],
    coachTip:
      'As Jash explains on page 90: C-E-G, E-G-C, and G-C-E are all the exact same C Major chord! Pick whichever inversion sits closest to your hand.',
  },
  {
    beginner: parseWestern(INVERSIONS_3D, { bpm: 76, idPrefix: '3d-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(INVERSIONS_3D, { bpm: 76, idPrefix: '3d-i' }).filter((n) => n.hand === 'left'),
    pro: parseWestern(INVERSIONS_3D, { bpm: 76, idPrefix: '3d-p' }),
  }
);

// ============================================================================
// MODULE 4: Chapter 4D — 5 Best Exercises for Shifting Chords (pp. 117–119)
// ============================================================================

const CHORD_SHIFT_4D = `
// Exercise 1 (p. 117): LH chord on beats 1 & 3, RH plays 1-3-5-3 (C -> G -> D -> A -> E -> B)
RH: C/1 E/3 G/5 E/3 | G/1 B/3 D'/5 B/3 | D/1 F#/3 A/5 F#/3 | A/1 C#'/3 E'/5 C#'/3 |
LH: [C/5 E/3 G/1] - [C/5 E/3 G/1] - | [G,/5 B,/3 D/1] - [G,/5 B,/3 D/1] - | [D/5 F#/3 A/1] - [D/5 F#/3 A/1] - | [A,/5 C#/3 E/1] - [A,/5 C#/3 E/1] - |
// Exercise 2 & 3 (p. 118): LH chord on beat 1, RH plays 1-5-3-5 over Minor progression (Am -> Em -> Dm -> Am)
RH: A/1 E'/5 C'/3 E'/5 | E/1 B/5 G/3 B/5 | D/1 A/5 F/3 A/5 | A/1 E'/5 C'/3 E'/5 |
LH: [A,/5 C/3 E/1] - - - | [E/5 G/3 B/1] - - - | [D/5 F/3 A/1] - - - | [A,/5 C/3 E/1] - - - |
// Exercise 4 & 5 (p. 119): LH pulses on all 4 beats while RH plays ascending/descending triad
RH: C/1 E/3 G/5 C'/5 | G/1 B/3 D'/5 G'/5 | F/1 A/3 C'/5 F'/5 | C/1 E/3 G/5 C'/5 |
LH: [C/5 E/3 G/1] [C/5 E/3 G/1] [C/5 E/3 G/1] [C/5 E/3 G/1] | [G,/5 B,/3 D/1] [G,/5 B,/3 D/1] [G,/5 B,/3 D/1] [G,/5 B,/3 D/1] | [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] | [C/5 E/3 G/1] - - - |
`;

export const ZTH_4D_FIVE_CHORD_EXERCISES: SongScore = makeSong(
  {
    id: 'zth-4d-five-chord-shift-exercises',
    title: 'Chapter 4D: 5 Best Exercises for Shifting Chords',
    subtitle: 'PDF pp. 117–119 • LH Block Chords + RH Triad Patterns • 100–130 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 4D)',
    stageId: 4,
    category: 'drill',
    bpm: 100,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Shifting Left-Hand chords cleanly on Beat 1 (and Beat 3) while Right Hand plays broken chord patterns',
      'Practicing both Major (C-G-D-A) and Minor (Am-Em-Dm) progressions at 100–130 BPM',
    ],
    coachTip:
      'Look at your Left Hand’s next chord destination on Beat 4 so both hands land together on Beat 1 without pausing!',
  },
  {
    beginner: parseWestern(CHORD_SHIFT_4D, { bpm: 100, idPrefix: '4d-b' }),
    intermediate: parseWestern(CHORD_SHIFT_4D, { bpm: 100, idPrefix: '4d-i' }),
    pro: parseWestern(CHORD_SHIFT_4D, { bpm: 100, idPrefix: '4d-p' }),
  }
);

// ============================================================================
// MODULE 4: Chapter 4E — 4 Lessons to Play Chords on Correct Time (pp. 120–122)
// ============================================================================

const CHORDS_ON_TIME_4E = `
// Lesson 1 (p. 120): LH on Beat 1 & 3, RH on Beat 1, 2, 3, 4
RH: [C/1 E/3 G/5] [C/1 E/3 G/5] [C/1 E/3 G/5] [C/1 E/3 G/5] | [G,/1 B,/3 D/5] [G,/1 B,/3 D/5] [G,/1 B,/3 D/5] [G,/1 B,/3 D/5] |
LH: [C/5 E/3 G/1] - [C/5 E/3 G/1] - | [G,/5 B,/3 D/1] - [G,/5 B,/3 D/1] - |
// Lesson 2 (p. 121): LH on Beats 1, 2, 3, 4; RH on Beats 1 & 3
RH: [A,/1 C/3 E/5] - [A,/1 C/3 E/5] - | [F,/1 A,/3 C/5] - [F,/1 A,/3 C/5] - |
LH: [A,/5 C/3 E/1] [A,/5 C/3 E/1] [A,/5 C/3 E/1] [A,/5 C/3 E/1] | [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] [F,/5 A,/3 C/1] |
// Lesson 3 & 4 (pp. 121–122): Syncopated alternation between LH and RH chords
RH: [C/1 E/3 G/5] - [C/1 E/3 G/5] [C/1 E/3 G/5] | [G,/1 B,/3 D/5] - [G,/1 B,/3 D/5] [G,/1 B,/3 D/5] |
LH: [C/5 E/3 G/1] [C/5 E/3 G/1] - [C/5 E/3 G/1] | [G,/5 B,/3 D/1] [G,/5 B,/3 D/1] - [G,/5 B,/3 D/1] |
`;

export const ZTH_4E_CHORDS_ON_CORRECT_TIME: SongScore = makeSong(
  {
    id: 'zth-4e-chords-on-correct-time',
    title: 'Chapter 4E: 4 Lessons to Play Chords on Correct Time',
    subtitle: 'PDF pp. 120–122 • Two-Hand Chord Rhythm Grid • 90–120 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 4E)',
    stageId: 4,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Independent rhythmic chord hits between Left Hand and Right Hand (Lessons 1–4, pp. 120–122)',
      'Locking chord attacks to the exact beat subdivision',
    ],
    coachTip:
      'In Lesson 1, RH hits every beat (1-2-3-4) while LH hits only beats 1 & 3. In Lesson 2, they swap roles! In Lessons 3 & 4, feel the syncopated groove.',
  },
  {
    beginner: parseWestern(CHORDS_ON_TIME_4E, { bpm: 92, idPrefix: '4e-b' }),
    intermediate: parseWestern(CHORDS_ON_TIME_4E, { bpm: 92, idPrefix: '4e-i' }),
    pro: parseWestern(CHORDS_ON_TIME_4E, { bpm: 92, idPrefix: '4e-p' }),
  }
);

// ============================================================================
// MODULE 4: Chapter 4F — Advanced Exercises for Chords Coordination (pp. 123–124)
// ============================================================================

const ADV_CHORD_COORD_4F = `
// Exercise 1 (p. 123): RH scale ascending/descending while LH shifts C (beat 1) -> G (beat 3)
RH: C/1 D/2 E/3 F/1 | G/2 A/3 B/4 C'/5 | C'/5 B/4 A/3 G/2 | F/1 E/3 D/2 C/1 |
LH: [C/5 E/3 G/1] - [G,/5 B,/3 D/1] - | [C/5 E/3 G/1] - [G,/5 B,/3 D/1] - | [C/5 E/3 G/1] - [G,/5 B,/3 D/1] - | [C/5 E/3 G/1] - - - |
// Exercise 3 (p. 124): Fast chord progression C - G - Am - F - Em - Dm - G - C under continuous RH melody
RH: C/1 E/3 G/5 E/3 | D/1 G/3 B/5 G/3 | C/1 E/3 A/5 E/3 | C/1 F/3 A/5 F/3 |
LH: [C/5 E/3 G/1] - [G,/5 B,/3 D/1] - | [A,/5 C/3 E/1] - [F,/5 A,/3 C/1] - | [E/5 G/3 B/1] - [D/5 F/3 A/1] - | [G,/5 B,/3 D/1] - [C/5 E/3 G/1] - |
`;

export const ZTH_4F_ADVANCED_CHORD_COORDINATION: SongScore = makeSong(
  {
    id: 'zth-4f-advanced-chord-coordination',
    title: 'Chapter 4F: Advanced Exercises for Chords Coordination',
    subtitle: 'PDF pp. 123–124 • Mid-Bar Chord Changes (C→G, C–G–Am–F–Em–Dm–G–C)',
    composer: 'PIX Series Zero to Hero (Ch. 4F)',
    stageId: 4,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Changing Left-Hand chords on Beat 3 (mid-bar) without interrupting a Right-Hand scale run',
      'Mastering the 8-chord Canon loop: C – G – Am – F – Em – Dm – G – C (PDF p. 124)',
    ],
    coachTip:
      'When your Right Hand tucks its thumb on F (Beat 4) or crosses over on E, keep the Right Hand moving like clockwork while your Left Hand shifts chords on Beat 3!',
  },
  {
    beginner: parseWestern(ADV_CHORD_COORD_4F, { bpm: 92, idPrefix: '4f-b' }),
    intermediate: parseWestern(ADV_CHORD_COORD_4F, { bpm: 92, idPrefix: '4f-i' }),
    pro: parseWestern(ADV_CHORD_COORD_4F, { bpm: 92, idPrefix: '4f-p' }),
  }
);

// ============================================================================
// MODULE 4: Chapter 4I — Learn Advanced Chords ("Fat Chords" 1-5-8, pp. 172–174)
// ============================================================================

const FAT_CHORDS_4I = `
// Fat Chords (1-5-8 with LH fingers 5-2-1): C-G-C', Am (A,-E-A), F (F,-C-F), G (G,-D-G)
RH: E/3 G/5 C'/5 B/4 | A/3 C'/5 E'/5 D'/4 | C'/5 A/3 F/1 A/3 | G/2 B/3 D'/5 C'/5 |
LH: [C3/5 G3/2 C4/1] - - - | [A2/5 E3/2 A3/1] - - - | [F2/5 C3/2 F3/1] - - - | [G2/5 D3/2 G3/1] - - - |
`;

export const ZTH_4I_FAT_CHORDS: SongScore = makeSong(
  {
    id: 'zth-4i-fat-chords',
    title: 'Chapter 4I: Advanced "Fat Chords" (1–5–8 Power Voicing)',
    subtitle: 'PDF pp. 172–174 • Root + 5th + Octave (Fingers 5-2-1) • Universal for Major & Minor!',
    composer: 'PIX Series Zero to Hero (Ch. 4I)',
    stageId: 4,
    category: 'drill',
    bpm: 84,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Playing Jash’s "Fat Chords" (1st + 5th + 8th scale notes with LH fingers 5-2-1)',
      'Understanding why Fat Chords work identically for both Major and Minor chords (no 3rd!)',
    ],
    coachTip:
      'As shown on PDF pp. 172–174, a Fat Chord drops the middle 3rd note and doubles the Root an octave higher (e.g., C–G–C with fingers 5–2–1). It sounds huge and works for both C Major and C Minor!',
  },
  {
    beginner: parseWestern(FAT_CHORDS_4I, { bpm: 84, idPrefix: '4i-b' }).filter((n) => n.hand === 'left'),
    intermediate: parseWestern(FAT_CHORDS_4I, { bpm: 84, idPrefix: '4i-i' }),
    pro: parseWestern(FAT_CHORDS_4I, { bpm: 84, idPrefix: '4i-p' }),
  },
  {
    beginner: 'LH Fat Chords Only',
    intermediate: 'Both Hands (Wait)',
    pro: 'Both Hands (Rhythm)',
  }
);

// ============================================================================
// MODULE 5: Chapter 5A — 5 Exercises to Make Left Hand Powerful (pp. 176–178)
// ============================================================================

const LH_POWER_5A = `
// Ex 1 (p. 176): C D E F G F E D (LH 5 4 3 2 1 2 3 4)
LH: C/5 D/4 E/3 F/2 | G/1 F/2 E/3 D/4 |
RH: C/1 D/2 E/3 F/4 | G/5 F/4 E/3 D/2 |
// Ex 2 (p. 177): C E D F E G F D (LH 5 3 4 2 3 1 2 4)
LH: C/5 E/3 D/4 F/2 | E/3 G/1 F/2 D/4 |
RH: C/1 E/3 D/2 F/4 | E/3 G/5 F/4 D/2 |
// Ex 3 (p. 177): C D E C D E F D (LH 5 4 3 5 4 3 2 4)
LH: C/5 D/4 E/3 C/5 | D/4 E/3 F/2 D/4 |
RH: C/1 D/2 E/3 C/1 | D/2 E/3 F/4 D/2 |
// Ex 4 (p. 178): C E G E C E G E (LH 5 3 1 3)
LH: C/5 E/3 G/1 E/3 | C/5 E/3 G/1 E/3 |
RH: C/1 E/3 G/5 E/3 | C/1 E/3 G/5 E/3 |
// Ex 5 (p. 178): G E C E G E C E (LH 1 3 5 3)
LH: G/1 E/3 C/5 E/3 | G/1 E/3 C/5 - |
RH: G/5 E/3 C/1 E/3 | G/5 E/3 C/1 - |
`;

export const ZTH_5A_LEFT_HAND_POWER: SongScore = makeSong(
  {
    id: 'zth-5a-left-hand-power',
    title: 'Chapter 5A: 5 Exercises to Make Left Hand Powerful',
    subtitle: 'PDF pp. 176–178 • All 5 LH Finger-Strength Patterns • 60–140 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 5A)',
    stageId: 5,
    category: 'drill',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Waking up Left-Hand fingers 5, 4, and 3 across all 5 exercises on pp. 176–178',
      'Practicing Left Hand alone first (Step 1 & 2), then Both Hands together (Step 3)',
    ],
    coachTip:
      'In Chapter 5A, your Left Pinky (5) and Ring Finger (4) do the heavy lifting. Practice Step 1 & Step 2 with your Left Hand alone before uniting both hands in Step 3!',
    teacherGuide: {
      whyLearnThis:
        'Most right-handed players have a sleepy Left Hand. Chapter 5A (pp. 176–178) gives you 5 targeted exercises to make your Left Hand just as fast and articulate as your Right Hand.',
      handPlacement: {
        rightHand: 'Fingers 1–5 on C4–G4 (joins in Step 3).',
        leftHand: 'Fingers 5–1 on C3–G3 (Pinky on C3, Thumb on G3).',
      },
      whatTeacherExpects: [
        'Step 1: Left Hand alone in Wait-for-Me mode across all 5 exercises.',
        'Step 2: Left Hand alone in steady rhythm with the metronome.',
        'Step 3: Both Hands together in parallel motion!',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Step 1: Left Hand Alone (Wait-for-Me)',
          subtitle: 'Master all 5 patterns with LH 5-4-3-2-1',
          whatToExpect: 'Only blue Left-Hand notes appear. Focus on lifting each finger cleanly.',
          handFilter: 'left',
          tier: 'beginner',
          practiceMode: 'wait',
          tempoMultiplier: 0.75,
        },
        {
          stepNumber: 2,
          title: 'Step 2: Left Hand Alone in Rhythm',
          subtitle: 'Steady pulse (60–140 BPM)',
          whatToExpect: 'Play all 5 exercises with your Left Hand locked to the metronome click.',
          handFilter: 'left',
          tier: 'intermediate',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.9,
        },
        {
          stepNumber: 3,
          title: 'Step 3: Both Hands Together in Rhythm',
          subtitle: 'Synchronized LH + RH power workout',
          whatToExpect: 'Play both hands together as directed on pages 176–178.',
          handFilter: 'both',
          tier: 'pro',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.95,
        },
      ],
    },
  },
  {
    beginner: parseWestern(LH_POWER_5A, { bpm: 92, idPrefix: '5a-b' }).filter((n) => n.hand === 'left'),
    intermediate: parseWestern(LH_POWER_5A, { bpm: 92, idPrefix: '5a-i' }).filter((n) => n.hand === 'left'),
    pro: parseWestern(LH_POWER_5A, { bpm: 92, idPrefix: '5a-p' }),
  },
  {
    beginner: 'LH Alone (Wait)',
    intermediate: 'LH Alone (Rhythm)',
    pro: 'Both Hands Together',
  }
);

// ============================================================================
// MODULE 5: Chapter 5B — 3 Advanced Left-Hand Exercises (pp. 179–180)
// ============================================================================

const ADV_LH_5B = `
// Ex 1 (p. 179): C E G C' G E C E (LH 5-3-2-1-2-3-5-3) stepping up
LH: C3/5 E3/3 G3/2 C4/1 | G3/2 E3/3 C3/5 E3/3 | D3/5 F3/3 A3/2 D4/1 | A3/2 F3/3 D3/5 F3/3 |
// Ex 2 (p. 179): C F A C' A F C F (2nd inversion span, LH 5-3-2-1-2-3-5-3)
LH: C3/5 F3/3 A3/2 C4/1 | A3/2 F3/3 C3/5 F3/3 | D3/5 G3/3 B3/2 D4/1 | B3/2 G3/3 D3/5 G3/3 |
// Ex 3 (p. 180): C G C' G E C G E (Open 1-5-8 + 3rd, LH 5-2-1-2-3-5-2-3)
LH: C3/5 G3/2 C4/1 G3/2 | E3/3 C3/5 G3/2 E3/3 | C3/5 - - 0 |
`;

export const ZTH_5B_ADVANCED_LEFT_HAND: SongScore = makeSong(
  {
    id: 'zth-5b-advanced-left-hand',
    title: 'Chapter 5B: 3 Advanced Left-Hand Octave Arpeggio Exercises',
    subtitle: 'PDF pp. 179–180 • Wide-Span 5-3-2-1 Arpeggios • 100–150 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 5B)',
    stageId: 5,
    category: 'drill',
    bpm: 104,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Stretching the Left Hand across a full octave (C3–C4) with fingers 5-3-2-1',
      'Preparing the Left Hand for Module 6 Arpeggios at 100–150 BPM',
    ],
    coachTip:
      'Let your wrist pivot gently from Pinky (5 on C3) up to Thumb (1 on C4) so your hand never feels stiff during wide octave stretches.',
  },
  {
    beginner: parseWestern(ADV_LH_5B, { bpm: 104, idPrefix: '5b-b' }),
    intermediate: parseWestern(ADV_LH_5B, { bpm: 104, idPrefix: '5b-i' }),
    pro: parseWestern(ADV_LH_5B, { bpm: 104, idPrefix: '5b-p' }),
  }
);

// ============================================================================
// MODULE 5: Chapter 5C — Establishing Two-Hand Coordination (pp. 181–185)
// ============================================================================

const TWO_HAND_COORD_5C = `
// Ex 2 (p. 182): LH plays 5-4-3-2-1-2-3-4 (C D E F G F E D) while RH plays 1-3-5-3-1-3-4-5 (C E G E C E F G)
RH: C/1 E/3 G/5 E/3 | C/1 E/3 F/4 G/5 | D/1 F/3 A/5 F/3 | D/1 F/3 G/4 A/5 |
LH: C/5 D/4 E/3 F/2 | G/1 F/2 E/3 D/4 | D/5 E/4 F/3 G/2 | A/1 G/2 F/3 E/4 |
// Ex 3 (p. 183): LH plays C-E-G-E (5-3-1-3) while RH plays C-E-C-F-G-D-E-C (1-3-1-4-5-2-3-1)
RH: C/1 E/3 C/1 F/4 | G/5 D/2 E/3 C/1 |
LH: C/5 E/3 G/1 E/3 | C/5 E/3 G/1 E/3 |
// Ex 4 & 5 (pp. 184–185): Contrary & Asymmetrical 5-finger patterns between LH & RH
RH: C/1 D/2 E/3 F/4 | G/5 F/4 E/3 D/2 | C/1 E/3 G/5 E/3 | C/1 - - 0 |
LH: G/1 F/2 E/3 D/4 | C/5 D/4 E/3 F/2 | G/1 E/3 C/5 E/3 | C/5 - - 0 |
`;

export const ZTH_5C_TWO_HAND_COORDINATION: SongScore = makeSong(
  {
    id: 'zth-5c-two-hand-coordination',
    title: 'Chapter 5C: Establishing Two-Hand Coordination (Exercises 1–5)',
    subtitle: 'PDF pp. 181–185 • Different Patterns in Each Hand Simultaneously • 100–140 BPM',
    composer: 'PIX Series Zero to Hero (Ch. 5C)',
    stageId: 5,
    category: 'drill',
    bpm: 96,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Playing one finger pattern in the Left Hand (e.g. C-D-E-F-G-F-E-D) while the Right Hand plays a completely different pattern (C-E-G-E-C-E-F-G)',
      'Breaking "mirror lock" so each hand can think independently',
    ],
    coachTip:
      'In Chapter 5C, your two hands play different patterns at the exact same speed. Use Step 1 (Wait-for-Me) to verify each beat pair one by one!',
  },
  {
    beginner: parseWestern(TWO_HAND_COORD_5C, { bpm: 96, idPrefix: '5c-b' }),
    intermediate: parseWestern(TWO_HAND_COORD_5C, { bpm: 96, idPrefix: '5c-i' }),
    pro: parseWestern(TWO_HAND_COORD_5C, { bpm: 96, idPrefix: '5c-p' }),
  }
);

// ============================================================================
// MODULE 5: Chapter 5D — Daily Practice Routine: Contrary Motion (pp. 186–187)
// ============================================================================

const DAILY_ROUTINE_5D = `
// Exercise 1 (p. 186): Hands move INWARD in mirror contrary motion toward the middle
RH: C5/5 B4/4 A4/3 G4/2 | F4/1 E4/3 D4/2 C4/1 | D4/2 E4/3 F4/1 G4/2 | A4/3 B4/4 C5/5 - |
LH: C3/5 D3/4 E3/3 F3/2 | G3/1 A3/3 B3/2 C4/1 | B3/2 A3/3 G3/1 F3/2 | E3/3 D3/4 C3/5 - |
// Exercise 2 (p. 187): Hands start at Middle C and move OUTWARD in mirror contrary motion
RH: C4/1 D4/2 E4/3 F4/1 | G4/2 A4/3 B4/4 C5/5 | B4/4 A4/3 G4/2 F4/1 | E4/3 D4/2 C4/1 - |
LH: C4/1 B3/2 A3/3 G3/1 | F3/2 E3/3 D3/4 C3/5 | D3/4 E3/3 F3/2 G3/1 | A3/3 B3/2 C4/1 - |
`;

export const ZTH_5D_DAILY_ROUTINE: SongScore = makeSong(
  {
    id: 'zth-5d-daily-practice-routine',
    title: 'Chapter 5D: Daily Warm-Up Routine (Contrary Motion Inward & Outward)',
    subtitle: 'PDF pp. 186–187 • Symmetrical Mirror-Finger Scales (1-2-3-1-2-3-4-5)',
    composer: 'PIX Series Zero to Hero (Ch. 5D)',
    stageId: 5,
    category: 'drill',
    bpm: 96,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Exercise 1 (p. 186): Moving inward from opposite octaves until both thumbs meet on Middle C',
      'Exercise 2 (p. 187): Starting with both thumbs on Middle C and fanning outward in mirror motion (both hands tucking thumb at the exact same moment!)',
    ],
    coachTip:
      'Contrary motion is a secret weapon: because your hands move in opposite directions on white keys, both hands use the EXACT same finger numbers (1-2-3-1-2-3-4-5) at the exact same time!',
  },
  {
    beginner: parseWestern(DAILY_ROUTINE_5D, { bpm: 96, idPrefix: '5d-b' }),
    intermediate: parseWestern(DAILY_ROUTINE_5D, { bpm: 96, idPrefix: '5d-i' }),
    pro: parseWestern(DAILY_ROUTINE_5D, { bpm: 96, idPrefix: '5d-p' }),
  }
);

// ============================================================================
// MODULE 5: Chapter 5E — Master Playing with Both Hands (1:2 & 1:4 Speeds, pp. 188–191)
// ============================================================================

const MASTER_BOTH_HANDS_5E = `
// Ex 1 (p. 188): LH 1x speed (Quarter notes) vs RH 2x speed (Eighth notes)
RH: (C/1 D/2) (E/3 F/4) (G/5 F/4) (E/3 D/2) | (C/1 E/3) (G/5 E/3) (C/1 E/3) (F/4 G/5) |
LH: C/5 D/4 E/3 F/2 | G/1 F/2 E/3 D/4 |
// Ex 3 (p. 190): LH 2x speed (Eighth notes) vs RH 1x speed (Quarter notes)
RH: C/1 D/2 E/3 F/4 | G/5 F/4 E/3 D/2 |
LH: (C/5 D/4) (E/3 F/2) (G/1 F/2) (E/3 D/4) | (C/5 E/3) (G/1 E/3) (C/5 E/3) (D/4 C/5) |
// Ex 2 (p. 189): LH 1x speed vs RH 4x speed
RH: (C/1 D/2 E/3 F/4) (G/5 F/4 E/3 D/2) (C/1 D/2 E/3 F/4) (G/5 F/4 E/3 D/2) | C/1 - - 0 |
LH: C/5 E/3 G/1 E/3 | C/5 - - 0 |
`;

export const ZTH_5E_MASTER_BOTH_HANDS: SongScore = makeSong(
  {
    id: 'zth-5e-master-both-hands',
    title: 'Chapter 5E: Master Playing with Both Hands (1:2 & 1:4 Speed Ratios)',
    subtitle: 'PDF pp. 188–191 • LH Slow / RH Fast & LH Fast / RH Slow Independence',
    composer: 'PIX Series Zero to Hero (Ch. 5E)',
    stageId: 5,
    category: 'drill',
    bpm: 78,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Ex 1 & 2 (pp. 188–189): Left Hand plays 1 note while Right Hand plays 2 or 4 notes',
      'Ex 3 & 4 (pp. 190–191): Left Hand plays 2 notes while Right Hand plays 1 note',
    ],
    coachTip:
      'Think in pairs: on beat 1, both hands strike together; on the "and" of beat 1, only the faster hand strikes!',
  },
  {
    beginner: parseWestern(MASTER_BOTH_HANDS_5E, { bpm: 78, idPrefix: '5e-b' }),
    intermediate: parseWestern(MASTER_BOTH_HANDS_5E, { bpm: 78, idPrefix: '5e-i' }),
    pro: parseWestern(MASTER_BOTH_HANDS_5E, { bpm: 78, idPrefix: '5e-p' }),
  }
);

// ============================================================================
// MODULE 5: Chapter 5F — My Favourite Twister Exercise (p. 192)
// ============================================================================

// Exact PDF p. 192: (CE) (DF) (EG) (DF) in both hands simultaneously!
// LH fingers: (53) (42) (31) (42) | RH fingers: (13) (24) (35) (24)
const TWISTER_5F = `
RH: [C/1 E/3] [D/2 F/4] [E/3 G/5] [D/2 F/4] | [C/1 E/3] [D/2 F/4] [E/3 G/5] [D/2 F/4] |
LH: [C/5 E/3] [D/4 F/2] [E/3 G/1] [D/4 F/2] | [C/5 E/3] [D/4 F/2] [E/3 G/1] [D/4 F/2] |
RH: [D/1 F/3] [E/2 G/4] [F/3 A/5] [E/2 G/4] | [C/1 E/3] [D/2 F/4] [C/1 E/3] - |
LH: [D/5 F/3] [E/4 G/2] [F/3 A/1] [E/4 G/2] | [C/5 E/3] [D/4 F/2] [C/5 E/3] - |
`;

export const ZTH_5F_TWISTER_EXERCISE: SongScore = makeSong(
  {
    id: 'zth-5f-twister-exercise',
    title: 'Chapter 5F: Jash’s Favourite Twister Exercise (Two-Hand Dyad Thirds)',
    subtitle: 'PDF p. 192 • (CE)-(DF)-(EG)-(DF) with LH (53)-(42)-(31)-(42) & RH (13)-(24)-(35)-(24)',
    composer: 'PIX Series Zero to Hero (Ch. 5F)',
    stageId: 5,
    category: 'drill',
    bpm: 100,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Playing 4 keys simultaneously (2 in LH + 2 in RH) and rocking smoothly across (CE)–(DF)–(EG)–(DF)',
      'Building ultimate finger 3/4/5 control at 120–180 BPM',
    ],
    coachTip:
      'Practice RH alone in Step 1, LH alone in Step 2, and unite all 4 fingers at once in Step 3! Keep your wrists buoyant.',
    teacherGuide: {
      whyLearnThis:
        'On page 192, Jash calls this his #1 Favourite Twister Exercise because it forces Fingers 1+3, 2+4, and 3+5 in the Right Hand to coordinate with Fingers 5+3, 4+2, and 3+1 in the Left Hand at the exact same moment!',
      handPlacement: {
        rightHand: 'Fingers 1–5 on C4–G4 (pairs: 1+3, 2+4, 3+5).',
        leftHand: 'Fingers 5–1 on C3–G3 (pairs: 5+3, 4+2, 3+1).',
      },
      whatTeacherExpects: [
        'Step 1: Right Hand double-note thirds alone in Wait-for-Me.',
        'Step 2: Left Hand double-note thirds alone in Wait-for-Me.',
        'Step 3: Both Hands together (4 keys per beat) in steady rhythm!',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Step 1: Right Hand Thirds (13–24–35–24)',
          subtitle: 'Wait-for-Me • Master RH dyads',
          whatToExpect: 'Press C+E (1+3), D+F (2+4), E+G (3+5), D+F (2+4) cleanly together.',
          handFilter: 'right',
          tier: 'beginner',
          practiceMode: 'wait',
          tempoMultiplier: 0.75,
        },
        {
          stepNumber: 2,
          title: 'Step 2: Left Hand Thirds (53–42–31–42)',
          subtitle: 'Wait-for-Me • Master LH dyads',
          whatToExpect: 'Press C3+E3 (5+3), D3+F3 (4+2), E3+G3 (3+1), D3+F3 (4+2) cleanly together.',
          handFilter: 'left',
          tier: 'intermediate',
          practiceMode: 'wait',
          tempoMultiplier: 0.75,
        },
        {
          stepNumber: 3,
          title: 'Step 3: Full Two-Hand Twister in Rhythm',
          subtitle: '4 simultaneous notes per beat!',
          whatToExpect: 'Unite both hands in rhythm and aim for crisp, simultaneous attacks.',
          handFilter: 'both',
          tier: 'pro',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.9,
        },
      ],
    },
  },
  {
    beginner: parseWestern(TWISTER_5F, { bpm: 100, idPrefix: '5f-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(TWISTER_5F, { bpm: 100, idPrefix: '5f-i' }).filter((n) => n.hand === 'left'),
    pro: parseWestern(TWISTER_5F, { bpm: 100, idPrefix: '5f-p' }),
  },
  {
    beginner: 'RH Twister Only',
    intermediate: 'LH Twister Only',
    pro: 'Both Hands Twister',
  }
);

// ============================================================================
// MODULE 6: Chapter 6D — 4-Step Process to Play Songs with Arpeggios (pp. 200–202)
// ============================================================================

const ARPEGGIO_SONG_MELODY = `
// Raatan Lambiyan chorus melody over C - G - Am - F
RH: E/2 G/4 G/4 G/4 | (A/5 G/4) (F/3 E/2) D/1 - |
RH: E/2 G/4 G/4 G/4 | (A/5 G/4) (F/3 E/2) D/1 - |
RH: C/1 D/2 E/3 G/5 | F/4 E/3 D/2 C/1 |
RH: D/2 E/3 F/4 E/3 | D/2 - C/1 - |
`;

const ARPEGGIO_PROGRESSION = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
];

// Step 3 of PDF p. 201: Keep LH on a SINGLE base chord (C-G-C'-G) throughout while RH plays the melody!
const BASE_CHORD_ONLY_PROGRESSION = Array.from({ length: 8 }, () => ({
  rootPc: PC.C,
  quality: 'major' as const,
}));

export const ZTH_6D_FOUR_STEP_ARPEGGIO_SONG: SongScore = (() => {
  const bpm = 80;
  const rh = parseWestern(ARPEGGIO_SONG_MELODY, { bpm, idPrefix: '6d-rh' });
  const lhBlock = buildLeftHandChords(ARPEGGIO_PROGRESSION, { bpm, style: 'block', idPrefix: '6d-lhb' });
  const lhSingleBaseArp = buildLeftHandChords(BASE_CHORD_ONLY_PROGRESSION, {
    bpm,
    style: 'arpeggio',
    idPrefix: '6d-lhbase',
  });
  const lhFullArp = buildLeftHandChords(ARPEGGIO_PROGRESSION, { bpm, style: 'arpeggio', idPrefix: '6d-lhfull' });

  return makeSong(
    {
      id: 'zth-6d-four-step-arpeggio-song',
      title: 'Chapter 6D: 4-Step Process to Play Songs with Arpeggios',
      subtitle: 'PDF pp. 200–202 • Step 1: Block Chords → Step 2: Base-Chord Arpeggio → Step 3: Full Arpeggios',
      composer: 'PIX Series Zero to Hero (Ch. 6D)',
      stageId: 6,
      category: 'drill',
      bpm,
      timeSignature: [4, 4],
      keySignature: 'C',
      pedagogyFocus: [
        'Jash’s exact 4-Step Arpeggio Secret from PDF p. 201',
        'Locking the Left Hand to 1 single base-chord arpeggio (C-G-C\'-G) while playing the Right-Hand melody BEFORE changing chords!',
      ],
      coachTip:
        'Look at Step 2 (Intermediate Tier): just like page 201 of the PDF, your Left Hand repeats ONLY the base chord C-G-C\'-G without shifting while your Right Hand plays the melody. Once your hands coordinate, switch to Step 3 to shift the arpeggio across C–G–Am–F!',
      teacherGuide: {
        whyLearnThis:
          'Why do students struggle when adding arpeggios to a song? Because they try to play a moving melody, a moving arpeggio, AND jump between chords all at once! On page 201, Jash reveals the bridge: first play the RH melody while your LH repeats the arpeggio on ONE single base chord (C–G–C\'–G). Only after that feels effortless do you shift chords!',
        handPlacement: {
          rightHand: 'Middle Octave C4–A4 playing the vocal melody.',
          leftHand: 'C3–C4 playing Block Chords (Step 1), Base-Chord Arpeggio C-G-C\'-G (Step 2), and Full C–G–Am–F Arpeggios (Step 3).',
        },
        whatTeacherExpects: [
          'Step 1 (PDF Step 1): Play the song with simple Left-Hand Block Chords.',
          'Step 2 (PDF Step 3 Bridge): Play the Right-Hand melody while your Left Hand repeats ONLY C–G–C\'–G on every bar (no chord jumps!).',
          'Step 3 (PDF Step 4): Play the full chord-changing arpeggios (C → G → Am → F) under the melody!',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Step 1: Song with Block Chords (PDF Step 1)',
            subtitle: 'Confirm chord changes under the melody',
            whatToExpect: 'Hold Left-Hand block chords while playing the Right-Hand melody.',
            handFilter: 'both',
            tier: 'beginner',
            practiceMode: 'wait',
            tempoMultiplier: 0.8,
          },
          {
            stepNumber: 2,
            title: 'Step 2: Melody + Base-Chord Arpeggio (PDF Step 3 Secret!)',
            subtitle: 'LH stays on C–G–C\'–G so you focus 100% on hand independence',
            whatToExpect: 'Your Left Hand never jumps—it loops C-G-C\'-G while your Right Hand plays the tune.',
            handFilter: 'both',
            tier: 'intermediate',
            practiceMode: 'wait',
            tempoMultiplier: 0.8,
          },
          {
            stepNumber: 3,
            title: 'Step 3: Full Chord-Changing Arpeggios (PDF Step 4)',
            subtitle: 'C → G → Am → F arpeggios + melody in rhythm',
            whatToExpect: 'Shift the 1-5-8-5 arpeggio across all 4 chords smoothly in rhythm.',
            handFilter: 'both',
            tier: 'pro',
            practiceMode: 'rhythm',
            tempoMultiplier: 0.85,
          },
        ],
      },
    },
    {
      beginner: [...rh, ...lhBlock],
      intermediate: [...withIdPrefix(rh, '6d-rhi'), ...lhSingleBaseArp],
      pro: [...withIdPrefix(rh, '6d-rhp'), ...lhFullArp],
    },
    {
      beginner: '1. Block Chords',
      intermediate: '2. Base-Chord Arpeggio',
      pro: '3. Full Arpeggios',
    }
  );
})();

// ============================================================================
// MODULE 9: Chapters 9B, 9C & 9E — Fillers, Harmonies & Sustain Pedal (pp. 241–247)
// ============================================================================

const FILLERS_9B = `
// Line 1: Melody on beats 1–2, then 4-note Scale Filler on beats 3–4 (PDF p. 242)!
RH: E/3 G/5 A/5 - | G/4 - (A/3 B/4 C'/5 D'/5) |
RH: E'/5 D'/4 C'/3 - | B/2 - (G/1 A/2 B/3 C'/4) |
RH: A/3 G/2 F/1 - | E/2 - (C/1 D/2 E/3 G/5) |
RH: D/2 E/3 C/1 - | C/1 - - 0 |
LH: [C3/5 G3/2 C4/1] - - - | [A2/5 E3/2 A3/1] - - - |
LH: [F2/5 C3/2 F3/1] - - - | [G2/5 D3/2 G3/1] - - - |
LH: [F2/5 C3/2 F3/1] - - - | [C3/5 G3/2 C4/1] - - - |
LH: [G2/5 D3/2 G3/1] - - - | [C3/5 G3/2 C4/1] - - - |
`;

export const ZTH_9B_FILLERS_IN_SONGS: SongScore = makeSong(
  {
    id: 'zth-9b-fillers-in-songs',
    title: 'Chapter 9B: Using Fillers in Songs (2-Beat Vocal Gap Fillers)',
    subtitle: 'PDF pp. 241–242 • Adding 3–5 Scale Notes in the 2-Beat Silence Between Lines',
    composer: 'PIX Series Zero to Hero (Ch. 9B)',
    stageId: 6,
    category: 'drill',
    bpm: 80,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Spotting the 2-beat gap at the end of a vocal line (Bar 2 Beats 3–4)',
      'Playing 4 quick scale notes as a melodic bridge into the next chord',
    ],
    coachTip:
      'As Jash explains on page 241: never play a filler while the singer is singing! Wait for the 2-beat silence at the end of the line, then whisper 3 to 5 scale notes leading into the next line.',
  },
  {
    beginner: parseWestern(FILLERS_9B, { bpm: 80, idPrefix: '9b-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(FILLERS_9B, { bpm: 80, idPrefix: '9b-i' }),
    pro: parseWestern(FILLERS_9B, { bpm: 80, idPrefix: '9b-p' }),
  }
);

const HARMONIES_9C = `
// Adding a lower chord-tone harmony underneath the main RH melody note (PDF pp. 243–244)
RH: [C/1 E/3] [D/2 F/4] [E/3 G/5] - | [F/1 A/3] [E/2 G/4] [D/1 F/3] - |
RH: [E/1 G/3] [F/2 A/4] [G/3 C'/5] - | [D/1 G/3] [B,/1 D/2] [C/1 E/3] - |
LH: [C3/5 G3/2 C4/1] - - - | [G2/5 D3/2 G3/1] - - - |
LH: [A2/5 E3/2 A3/1] - - - | [G2/5 D3/2 G3/1] - [C3/5 G3/2 C4/1] - |
`;

export const ZTH_9C_HARMONIES_IN_SONGS: SongScore = makeSong(
  {
    id: 'zth-9C-harmonies-in-songs'.toLowerCase(),
    title: 'Chapter 9C: Using Harmonies in Songs (Two-Note RH Voicings)',
    subtitle: 'PDF pp. 243–244 • Adding a Chord Tone Below the Main Melody Note',
    composer: 'PIX Series Zero to Hero (Ch. 9C)',
    stageId: 6,
    category: 'drill',
    bpm: 78,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Harmonizing a Right-Hand melody by adding a chord tone underneath with Finger 1 or 2',
      'Balancing velocity so the top melody note sings slightly louder than the lower harmony note',
    ],
    coachTip:
      'On page 243, Jash’s rule for harmonies is simple: when your Right Hand lands on an important melody note, add 1 note from the current chord underneath it!',
  },
  {
    beginner: parseWestern(HARMONIES_9C, { bpm: 78, idPrefix: '9c-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(HARMONIES_9C, { bpm: 78, idPrefix: '9c-i' }),
    pro: parseWestern(HARMONIES_9C, { bpm: 78, idPrefix: '9c-p' }),
  }
);

const SUSTAIN_PEDAL_9E = `
// Expressive ballad progression for practicing Lift-and-Press Sustain Pedal on every barline (PDF p. 247)
RH: E/1 G/2 C'/5 B/4 | A/3 C'/5 E'/5 C'/3 | F/1 A/2 C'/4 A/2 | G/1 B/2 D'/4 B/2 |
RH: E/1 G/2 C'/5 B/4 | A/3 C'/5 E'/5 D'/4 | C'/5 G/2 E/1 D/2 | C/1 - - - |
LH: (C3/5 G3/2) (C4/1 G3/2) (C4/1 G3/2) (C4/1 G3/2) | (A2/5 E3/2) (A3/1 E3/2) (A3/1 E3/2) (A3/1 E3/2) |
LH: (F2/5 C3/2) (F3/1 C3/2) (F3/1 C3/2) (F3/1 C3/2) | (G2/5 D3/2) (G3/1 D3/2) (G3/1 D3/2) (G3/1 D3/2) |
LH: (C3/5 G3/2) (C4/1 G3/2) (C4/1 G3/2) (C4/1 G3/2) | (F2/5 C3/2) (F3/1 C3/2) (F3/1 C3/2) (F3/1 C3/2) |
LH: (G2/5 D3/2) (G3/1 D3/2) (G3/1 D3/2) (G3/1 D3/2) | [C3/5 G3/2 C4/1] - - - |
`;

export const ZTH_9E_SUSTAIN_PEDAL: SongScore = makeSong(
  {
    id: 'zth-9e-sustain-pedal',
    title: 'Chapter 9E: How to Use the Sustain Pedal (Lift & Press on Chord Changes)',
    subtitle: 'PDF p. 247 • Clean Pedal Reset on Every New Chord so Harmonies Never Blur',
    composer: 'PIX Series Zero to Hero (Ch. 9E)',
    stageId: 6,
    category: 'drill',
    bpm: 74,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: [
      'Keeping your heel on the floor while pressing the pedal with the ball of your right foot',
      'Lifting and re-pressing the sustain pedal every time the chord changes (Beat 1 of each bar)',
    ],
    coachTip:
      'Never hold the sustain pedal down across two different chords or the sound turns muddy! Lift your toes and press back down right as the new chord strikes on Beat 1.',
  },
  {
    beginner: parseWestern(SUSTAIN_PEDAL_9E, { bpm: 74, idPrefix: '9e-b' }).filter((n) => n.hand === 'right'),
    intermediate: parseWestern(SUSTAIN_PEDAL_9E, { bpm: 74, idPrefix: '9e-i' }),
    pro: parseWestern(SUSTAIN_PEDAL_9E, { bpm: 74, idPrefix: '9e-p' }),
  }
);

export const ZTH_EXERCISES: SongScore[] = [
  ZTH_2B_ALANKARS_KALI_EK,
  ZTH_2B_ALANKARS_SAFED_EK,
  ZTH_2C_HAPPY_BIRTHDAY,
  ZTH_2E_RH_EX1,
  ZTH_2E_RH_EX2,
  ZTH_2E_RH_EX3,
  ZTH_2E_RH_EX4,
  ZTH_2G_RHYTHM_FORMATS,
  ZTH_2J_MASTER_RH,
  ZTH_3A_MAJOR_SCALES_DRILL,
  ZTH_3B_MINOR_SCALES_DRILL,
  ZTH_3D_CHORD_INVERSIONS,
  ZTH_4D_FIVE_CHORD_EXERCISES,
  ZTH_4E_CHORDS_ON_CORRECT_TIME,
  ZTH_4F_ADVANCED_CHORD_COORDINATION,
  ZTH_4I_FAT_CHORDS,
  ZTH_5A_LEFT_HAND_POWER,
  ZTH_5B_ADVANCED_LEFT_HAND,
  ZTH_5C_TWO_HAND_COORDINATION,
  ZTH_5D_DAILY_ROUTINE,
  ZTH_5E_MASTER_BOTH_HANDS,
  ZTH_5F_TWISTER_EXERCISE,
  ZTH_6D_FOUR_STEP_ARPEGGIO_SONG,
  ZTH_9B_FILLERS_IN_SONGS,
  ZTH_9C_HARMONIES_IN_SONGS,
  ZTH_9E_SUSTAIN_PEDAL,
];
