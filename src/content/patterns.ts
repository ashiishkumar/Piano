import { PatternStep, PatternTemplate } from '../types/lesson';

/**
 * The accompaniment pattern library. Steps are chord tones on a beat grid;
 * tone 1 root, 3 third, 5 fifth, 8 octave, 10 tenth, 12 twelfth.
 */

const eighths = (tones: number[]): PatternStep[] => tones.map((tone, i) => ({ tone, beat: i * 0.5, durationBeats: 0.5 }));
const quarters = (tones: number[]): PatternStep[] => tones.map((tone, i) => ({ tone, beat: i, durationBeats: 1 }));
const together = (tones: number[], beat: number, durationBeats: number): PatternStep[] => tones.map((tone) => ({ tone, beat, durationBeats }));

export const PATTERNS_44: PatternTemplate[] = [
  { id: 'block', label: 'Block chord', timeSignature: [4, 4], steps: together([1, 3, 5], 0, 4) },
  {
    id: 'oom-pah',
    label: 'Root then chord (oom-pah)',
    timeSignature: [4, 4],
    steps: [{ tone: 1, beat: 0, durationBeats: 1 }, ...together([3, 5], 1, 1), { tone: 1, beat: 2, durationBeats: 1 }, ...together([3, 5], 3, 1)],
  },
  { id: 'rising', label: 'Rising arpeggio 1-3-5-8', timeSignature: [4, 4], steps: quarters([1, 3, 5, 8]) },
  { id: 'alberti', label: 'Alberti bass 1-5-3-5', timeSignature: [4, 4], steps: eighths([1, 5, 3, 5, 1, 5, 3, 5]) },
  { id: 'ballad-1585', label: 'Ballad 1-5-8-5', timeSignature: [4, 4], steps: eighths([1, 5, 8, 5, 1, 5, 8, 5]) },
  { id: 'wave', label: 'Wave 1-3-5-8-10-8-5-3', timeSignature: [4, 4], steps: eighths([1, 3, 5, 8, 10, 8, 5, 3]) },
  {
    id: 'pop-sync',
    label: 'Pop syncopation',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 1.5 },
      { tone: 5, beat: 1.5, durationBeats: 0.5 },
      { tone: 8, beat: 2, durationBeats: 1 },
      { tone: 5, beat: 3, durationBeats: 1 },
    ],
  },
];

export const PATTERNS_34: PatternTemplate[] = [
  {
    id: 'waltz',
    label: 'Waltz oom-pah-pah',
    timeSignature: [3, 4],
    steps: [{ tone: 1, beat: 0, durationBeats: 1 }, ...together([3, 5], 1, 1), ...together([3, 5], 2, 1)],
  },
  { id: 'rising-3', label: 'Rising 1-3-5', timeSignature: [3, 4], steps: quarters([1, 3, 5]) },
  { id: 'open-158', label: 'Open 1-5-8', timeSignature: [3, 4], steps: quarters([1, 5, 8]) },
  { id: 'flowing-3', label: 'Flowing 1-3-5-8-5-3', timeSignature: [3, 4], steps: eighths([1, 3, 5, 8, 5, 3]) },
];

export const PATTERNS_EXCEPTIONAL: PatternTemplate[] = [
  { id: 'pedal-octave', label: 'Pedal octave 1-8-5-8-3-8-5-8', timeSignature: [4, 4], steps: eighths([1, 8, 5, 8, 3, 8, 5, 8]) },
  {
    id: 'open-tenth',
    label: 'Open tenth',
    timeSignature: [4, 4],
    steps: [
      { tone: 1, beat: 0, durationBeats: 4 },
      { tone: 10, beat: 1, durationBeats: 1 },
      { tone: 5, beat: 2, durationBeats: 1 },
      { tone: 3, beat: 3, durationBeats: 1 },
    ],
  },
  { id: 'rolling', label: 'Rolling 1-5-8-10-8-5', timeSignature: [4, 4], steps: [...eighths([1, 5, 8, 10, 8, 5]), { tone: 1, beat: 3, durationBeats: 1 }] },
];

export const ALL_PATTERNS: PatternTemplate[] = [...PATTERNS_44, ...PATTERNS_34, ...PATTERNS_EXCEPTIONAL];
export const PATTERN_BY_ID: Record<string, PatternTemplate> = Object.fromEntries(ALL_PATTERNS.map((p) => [p.id, p]));
