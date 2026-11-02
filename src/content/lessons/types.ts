import {
  CheckpointLesson,
  ChordDrillLesson,
  ConceptLesson,
  EarLesson,
  KeyboardTaskLesson,
  PatternLesson,
  QuizLesson,
  ReadyLesson,
  RhythmLesson,
} from '../../types/lesson';

/** A lesson payload before the path assigns its id, code, level and status. */
export type Payload<T extends ReadyLesson> = Omit<T, 'id' | 'code' | 'levelId' | 'status'>;

export type ConceptPayload = Payload<ConceptLesson>;
export type RhythmPayload = Payload<RhythmLesson>;
export type ChordDrillPayload = Payload<ChordDrillLesson>;
export type QuizPayload = Payload<QuizLesson>;
export type KeyboardTaskPayload = Payload<KeyboardTaskLesson>;
export type PatternPayload = Payload<PatternLesson>;
export type EarPayload = Payload<EarLesson>;
export type CheckpointPayload = Payload<CheckpointLesson>;

/** Pitch classes by name, so content reads like music rather than numbers. */
export const PC = { C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11 } as const;

/** MIDI numbers for the middle octave and neighbours, for highlights and try-its. */
export const K = {
  C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59,
  C4: 60, Cs4: 61, D4: 62, Ds4: 63, E4: 64, F4: 65, Fs4: 66, G4: 67, Gs4: 68, A4: 69, As4: 70, B4: 71,
  C5: 72, D5: 74, E5: 76, F5: 77, Fs5: 78, G5: 79, A5: 81, B5: 83, C6: 84,
} as const;

/** All MIDI notes of one pitch class across the 61-key range (36–96). */
export function allOfClass(pc: number): number[] {
  const out: number[] = [];
  for (let m = 36; m <= 96; m++) if (((m % 12) + 12) % 12 === pc) out.push(m);
  return out;
}

export function labels(midis: number[], names: string[]): Record<number, string> {
  const out: Record<number, string> = {};
  midis.forEach((m, i) => {
    out[m] = names[i % names.length];
  });
  return out;
}
