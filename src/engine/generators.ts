import { HandType, ScoreNote } from '../types/music';
import { ChordSpec } from '../types/lesson';
import { ScaleType, chordMidis, scalePitchClasses } from './theory';

/**
 * Procedural drills: alankars (paltas), scale runs, and chord-progression scores.
 * Everything returns ScoreNote[] so the existing score engine plays it.
 */

export interface GenOptions {
  bpm: number;
  beatsPerBar?: number;
  hand?: HandType;
  velocity?: number;
  idPrefix?: string;
  /** Beats per note (default 1) */
  noteBeats?: number;
  /** Beat offset to start at (default 0) */
  startBeat?: number;
}

interface Emitter {
  notes: ScoreNote[];
  beat: number;
  push(midi: number, finger?: number, beats?: number): void;
  rest(beats?: number): void;
}

function emitter(opts: GenOptions): Emitter {
  const spb = 60 / opts.bpm;
  const bpb = opts.beatsPerBar ?? 4;
  const hand = opts.hand ?? 'right';
  const vel = opts.velocity ?? (hand === 'right' ? 84 : 62);
  const prefix = opts.idPrefix ?? 'gen';
  const noteBeats = opts.noteBeats ?? 1;
  const notes: ScoreNote[] = [];
  let n = 0;
  const e: Emitter = {
    notes,
    beat: opts.startBeat ?? 0,
    push(midi, finger, beats = noteBeats) {
      notes.push({
        id: `${prefix}-${n++}`,
        midi,
        startTime: Number((e.beat * spb).toFixed(4)),
        duration: Number((beats * spb).toFixed(4)),
        measure: Math.floor(e.beat / bpb) + 1,
        beat: Math.floor(e.beat % bpb) + 1,
        hand,
        velocity: vel,
        finger: finger && finger >= 1 && finger <= 5 ? (finger as 1 | 2 | 3 | 4 | 5) : undefined,
        articulation: 'normal',
      });
      e.beat += beats;
    },
    rest(beats = noteBeats) {
      e.beat += beats;
    },
  };
  return e;
}

/** MIDI for scale degree `deg` (0-based, may exceed 6 for the next octave) above rootMidi. */
export function degreeMidi(rootMidi: number, scale: ScaleType, deg: number): number {
  const pcs = scalePitchClasses(0, scale);
  const n = pcs.length;
  const oct = Math.floor(deg / n);
  const idx = ((deg % n) + n) % n;
  return rootMidi + oct * 12 + pcs[idx];
}

/**
 * Right-hand fingering for a scale degree within one octave, in two regimes:
 * five-finger position (degrees 0–4 → 1–5) and the standard tucked octave
 * (1 2 3 1 2 3 4 5 ascending). Left hand mirrors (5 4 3 2 1 3 2 1).
 */
export function scaleFinger(deg: number, span: number, hand: HandType = 'right'): number {
  const d = ((deg % 7) + 7) % 7;
  if (span <= 5) return hand === 'right' ? d + 1 : 5 - d;
  const rh = [1, 2, 3, 1, 2, 3, 4];
  const lh = [5, 4, 3, 2, 1, 3, 2];
  if (deg === 7) return hand === 'right' ? 5 : 1;
  return hand === 'right' ? rh[d] : lh[d];
}

export interface AlankarOptions extends GenOptions {
  scale?: ScaleType;
  rootMidi?: number;
  /** Degree offsets of one group, e.g. [0,1,2,3] for S R G M */
  pattern: number[];
  /** Highest degree the pattern may touch (default 4 = Pa: the five-finger home) */
  topDegree?: number;
  /** Also play the mirrored descent (default true) */
  descend?: boolean;
}

/**
 * An alankar: the pattern starts on each degree in turn, rising until its top
 * note would pass `topDegree`, then descends by mirroring.
 */
export function generateAlankar(opts: AlankarOptions): ScoreNote[] {
  const scale = opts.scale ?? 'major';
  const root = opts.rootMidi ?? 60;
  const top = opts.topDegree ?? 4;
  const span = top + 1;
  const e = emitter(opts);
  const maxOffset = Math.max(...opts.pattern);
  const starts: number[] = [];
  for (let s = 0; s + maxOffset <= top; s++) starts.push(s);

  for (const s of starts) for (const o of opts.pattern) e.push(degreeMidi(root, scale, s + o), scaleFinger(s + o, span, opts.hand));
  if (opts.descend !== false) {
    const mirror = opts.pattern.map((o) => maxOffset - o);
    for (const s of [...starts].reverse()) for (const o of mirror) e.push(degreeMidi(root, scale, s + o), scaleFinger(s + o, span, opts.hand));
  }
  return e.notes;
}

export interface ScaleRunOptions extends GenOptions {
  scale?: ScaleType;
  rootMidi?: number;
  octaves?: number;
  descend?: boolean;
}

/** Ascending (and descending) scale with fingering. */
export function generateScaleRun(opts: ScaleRunOptions): ScoreNote[] {
  const scale = opts.scale ?? 'major';
  const root = opts.rootMidi ?? 60;
  const octaves = opts.octaves ?? 1;
  const n = scalePitchClasses(0, scale).length;
  const e = emitter(opts);
  const total = octaves * n;
  const up: number[] = [];
  for (let d = 0; d <= total; d++) up.push(d);
  for (const d of up) e.push(degreeMidi(root, scale, d), scaleFinger(d === total ? 7 : d % n, 8, opts.hand));
  if (opts.descend !== false) for (const d of [...up].reverse().slice(1)) e.push(degreeMidi(root, scale, d), scaleFinger(d === total ? 7 : d % n, 8, opts.hand));
  return e.notes;
}

export type AccompanimentStyle = 'block' | 'root' | 'root-fifth' | 'broken';

export interface ProgressionOptions extends GenOptions {
  progression: ChordSpec[];
  beatsPerChord?: number;
  /** Lowest root MIDI for the left hand (default 48, C3) */
  rootMidi?: number;
  style?: AccompanimentStyle;
  repeats?: number;
}

/**
 * Left-hand accompaniment for a chord progression.
 * block: whole chord held per change · root: root only · root-fifth: root then fifth ·
 * broken: root, third, fifth, third as even notes.
 */
export function generateAccompaniment(opts: ProgressionOptions): ScoreNote[] {
  const beats = opts.beatsPerChord ?? 4;
  const rootBase = opts.rootMidi ?? 48;
  const style = opts.style ?? 'block';
  const e = emitter({ ...opts, hand: opts.hand ?? 'left' });
  const seq = Array.from({ length: opts.repeats ?? 1 }, () => opts.progression).flat();
  const lhFingers = [5, 3, 1];

  for (const spec of seq) {
    const root = rootBase + spec.rootPc;
    const voicing = chordMidis(root, spec.quality, spec.inversion ?? 0);
    switch (style) {
      case 'block': {
        const at = e.beat;
        voicing.forEach((m, i) => {
          e.beat = at;
          e.push(m, lhFingers[i] ?? 2, beats);
        });
        e.beat = at + beats;
        break;
      }
      case 'root':
        e.push(root, 5, beats);
        break;
      case 'root-fifth':
        e.push(root, 5, beats / 2);
        e.push(root + 7, 1, beats / 2);
        break;
      case 'broken': {
        const order = [voicing[0], voicing[1], voicing[2] ?? voicing[1], voicing[1]];
        const fingers = [5, 3, 1, 3];
        const each = beats / 4;
        order.forEach((m, i) => e.push(m, fingers[i], each));
        break;
      }
    }
  }
  return e.notes;
}

/**
 * A right-hand line over a progression: the chord tones in a repeating shape
 * (default 1-3-5-3), one note per beat. Pairs with generateAccompaniment for
 * two-hand coordination drills.
 */
export function generateChordToneMelody(opts: ProgressionOptions & { shape?: number[]; melodyRootMidi?: number }): ScoreNote[] {
  const beats = opts.beatsPerChord ?? 4;
  const shape = opts.shape ?? [0, 1, 2, 1];
  const base = opts.melodyRootMidi ?? 60;
  const e = emitter({ ...opts, hand: 'right' });
  const seq = Array.from({ length: opts.repeats ?? 1 }, () => opts.progression).flat();
  const rhFingers = [1, 3, 5, 3, 5];
  for (const spec of seq) {
    const voicing = chordMidis(base + spec.rootPc, spec.quality, spec.inversion ?? 0);
    const each = beats / shape.length;
    shape.forEach((idx, i) => e.push(voicing[idx % voicing.length], rhFingers[idx % rhFingers.length], each));
  }
  return e.notes;
}

/** Shift note ids so two generated parts can share one arrangement. */
export function withIdPrefix(notes: ScoreNote[], prefix: string): ScoreNote[] {
  return notes.map((n, i) => ({ ...n, id: `${prefix}-${i}` }));
}
