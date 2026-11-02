import { PatternStep, PatternTemplate } from '../types/lesson';

/**
 * PIX Series Zero to Hero Course — Accompaniment Pattern Library (Module 6: Chapters 6B, 6C, 6E, 6F, 6G).
 * Steps are chord tones on a beat grid:
 * tone 1 = root, 3 = third, 5 = fifth, 8 = octave, 10 = tenth, 12 = twelfth.
 */

const eighths = (tones: number[]): PatternStep[] =>
  tones.map((tone, i) => ({ tone, beat: i * 0.5, durationBeats: 0.5 }));
const quarters = (tones: number[]): PatternStep[] =>
  tones.map((tone, i) => ({ tone, beat: i, durationBeats: 1 }));
const together = (tones: number[], beat: number, durationBeats: number): PatternStep[] =>
  tones.map((tone) => ({ tone, beat, durationBeats }));

/**
 * Chapter 6E (pp. 203–205): Jash's 7 Universal Arpeggio Patterns (4/4)
 */
export const PATTERNS_44: PatternTemplate[] = [
  {
    id: 'zth-44-p1-1353',
    label: 'Pattern 1: Classic 1-3-5-3 (C - E - G - E)',
    timeSignature: [4, 4],
    steps: quarters([1, 3, 5, 3]),
  },
  {
    id: 'zth-44-p2-1585-q',
    label: 'Pattern 2: Open Octave 1-5-8-5 (4 Counts)',
    timeSignature: [4, 4],
    steps: quarters([1, 5, 8, 5]),
  },
  {
    id: 'ballad-1585',
    label: 'Pattern 3: Flowing 8-Beat 1-5-8-5-8-5-8-5',
    timeSignature: [4, 4],
    steps: eighths([1, 5, 8, 5, 8, 5, 8, 5]),
  },
  {
    id: 'rising',
    label: 'Pattern 4: Rising Octave 1-3-5-8 (C - E - G - C\')',
    timeSignature: [4, 4],
    steps: quarters([1, 3, 5, 8]),
  },
  {
    id: 'alberti',
    label: 'Pattern 5: Wave Triad 1-3-5-8-5-3-1-3 (8 Counts)',
    timeSignature: [4, 4],
    steps: eighths([1, 3, 5, 8, 5, 3, 1, 3]),
  },
  {
    id: 'wave',
    label: 'Pattern 6: Wide Tenth 1-5-8-10-8-5-8-5 (8 Counts)',
    timeSignature: [4, 4],
    steps: eighths([1, 5, 8, 10, 8, 5, 8, 5]),
  },
  {
    id: 'pop-sync',
    label: 'Pattern 7: Held Octave 1 - 5 - 8 (Hold Beats 3–4)',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 1 },
      { tone: 5, beat: 1, durationBeats: 1 },
      { tone: 8, beat: 2, durationBeats: 2 },
    ],
  },
];

/**
 * Extra helper patterns used in Chapter 6B coordination drills
 */
export const PATTERNS_COORDINATION_EXTRAS: PatternTemplate[] = [
  {
    id: 'block',
    label: 'Block Chord (1+3+5 Together)',
    timeSignature: [4, 4],
    steps: together([1, 3, 5], 0, 4),
  },
  {
    id: 'oom-pah',
    label: 'Root then Chord (1 - [3+5] - 1 - [3+5])',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 1 },
      ...together([3, 5], 1, 1),
      { tone: 1, beat: 2, durationBeats: 1 },
      ...together([3, 5], 3, 1),
    ],
  },
];

/**
 * Chapter 6G (pp. 209–210): Jash's 4 Universal Arpeggio Patterns (3/4 Waltz)
 */
export const PATTERNS_34: PatternTemplate[] = [
  {
    id: 'waltz',
    label: '3/4 Pattern 1: C - (EG) - (EG) Waltz Chord',
    timeSignature: [3, 4],
    steps: [{ tone: 1, beat: 0, durationBeats: 1 }, ...together([3, 5], 1, 1), ...together([3, 5], 2, 1)],
  },
  {
    id: 'rising-3',
    label: '3/4 Pattern 2: Rising Triad 1 - 3 - 5 (C - E - G)',
    timeSignature: [3, 4],
    steps: quarters([1, 3, 5]),
  },
  {
    id: 'open-158',
    label: '3/4 Pattern 3: Open Octave 1 - 5 - 8 (C - G - C\')',
    timeSignature: [3, 4],
    steps: quarters([1, 5, 8]),
  },
  {
    id: 'flowing-3',
    label: '3/4 Pattern 4: Flowing 6-Count 1-5-8-10-8-5',
    timeSignature: [3, 4],
    steps: eighths([1, 5, 8, 10, 8, 5]),
  },
];

/**
 * Chapter 6F (pp. 206–208): Jash's 3 Exceptional Arpeggio Patterns
 */
export const PATTERNS_EXCEPTIONAL: PatternTemplate[] = [
  {
    id: 'pedal-octave',
    label: 'Exceptional 1: 6-Beat Ballad (Kaise Hua / Janam Janam 1-5-8-5-8-5)',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 0.5 },
      { tone: 5, beat: 0.5, durationBeats: 0.5 },
      { tone: 8, beat: 1, durationBeats: 0.5 },
      { tone: 5, beat: 1.5, durationBeats: 0.5 },
      { tone: 8, beat: 2, durationBeats: 1 },
      { tone: 5, beat: 3, durationBeats: 1 },
    ],
  },
  {
    id: 'open-tenth',
    label: 'Exceptional 2: Reggae Groove (Root Beat 1, Chord Stabs Beats 2 & 4)',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 1 },
      ...together([3, 5, 8], 1, 0.5),
      ...together([3, 5, 8], 3, 0.5),
    ],
  },
  {
    id: 'rolling',
    label: 'Exceptional 3: Boogie-Woogie Pulse (1-1-5-5-8-8-5-5)',
    timeSignature: [4, 4],
    steps: eighths([1, 1, 5, 5, 8, 8, 5, 5]),
  },
];

export const ALL_PATTERNS: PatternTemplate[] = [
  ...PATTERNS_44,
  ...PATTERNS_COORDINATION_EXTRAS,
  ...PATTERNS_34,
  ...PATTERNS_EXCEPTIONAL,
];
export const PATTERN_BY_ID: Record<string, PatternTemplate> = Object.fromEntries(ALL_PATTERNS.map((p) => [p.id, p]));
