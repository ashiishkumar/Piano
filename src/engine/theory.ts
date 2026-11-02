import { ScoreNote, SongScore } from '../types/music';

// ---------------------------------------------------------------------------
// Pitch classes
// ---------------------------------------------------------------------------

export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function pitchClassName(pc: number, preferFlats = false): string {
  const i = pitchClass(pc);
  return preferFlats ? FLAT_NAMES[i] : SHARP_NAMES[i];
}

/** Parse 'C', 'C#', 'Db', 'F#', 'Bb' → pitch class. Returns null if unknown. */
export function parsePitchClass(name: string): number | null {
  const t = name.trim();
  const sharp = SHARP_NAMES.findIndex((n) => n.toLowerCase() === t.toLowerCase());
  if (sharp >= 0) return sharp;
  const flat = FLAT_NAMES.findIndex((n) => n.toLowerCase() === t.toLowerCase());
  if (flat >= 0) return flat;
  return null;
}

export function uniquePitchClasses(midis: number[]): number[] {
  return Array.from(new Set(midis.map(pitchClass))).sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Scales and thaats
// ---------------------------------------------------------------------------

export type ScaleType =
  | 'major'
  | 'natural-minor'
  | 'harmonic-minor'
  | 'melodic-minor'
  | 'major-pentatonic'
  | 'minor-pentatonic'
  | 'blues'
  | 'chromatic'
  // Hindustani thaats (parent scales)
  | 'bilawal'
  | 'kalyan'
  | 'khamaj'
  | 'kafi'
  | 'asavari'
  | 'bhairavi'
  | 'bhairav'
  | 'marwa'
  | 'purvi'
  | 'todi';

export interface ScaleDefinition {
  id: ScaleType;
  label: string;
  /** Semitone offsets from the root, ascending, without the octave. */
  intervals: number[];
  /** Western mode or raga family this is equivalent to, for teaching. */
  alsoKnownAs?: string;
}

export const SCALES: Record<ScaleType, ScaleDefinition> = {
  major: { id: 'major', label: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], alsoKnownAs: 'Bilawal thaat / Ionian' },
  'natural-minor': { id: 'natural-minor', label: 'Natural minor', intervals: [0, 2, 3, 5, 7, 8, 10], alsoKnownAs: 'Asavari thaat / Aeolian' },
  'harmonic-minor': { id: 'harmonic-minor', label: 'Harmonic minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  'melodic-minor': { id: 'melodic-minor', label: 'Melodic minor (ascending)', intervals: [0, 2, 3, 5, 7, 9, 11] },
  'major-pentatonic': { id: 'major-pentatonic', label: 'Major pentatonic', intervals: [0, 2, 4, 7, 9], alsoKnownAs: 'Raag Bhupali' },
  'minor-pentatonic': { id: 'minor-pentatonic', label: 'Minor pentatonic', intervals: [0, 3, 5, 7, 10], alsoKnownAs: 'Raag Dhani' },
  blues: { id: 'blues', label: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  chromatic: { id: 'chromatic', label: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  bilawal: { id: 'bilawal', label: 'Bilawal thaat', intervals: [0, 2, 4, 5, 7, 9, 11], alsoKnownAs: 'Major / Ionian' },
  kalyan: { id: 'kalyan', label: 'Kalyan thaat', intervals: [0, 2, 4, 6, 7, 9, 11], alsoKnownAs: 'Lydian (Raag Yaman)' },
  khamaj: { id: 'khamaj', label: 'Khamaj thaat', intervals: [0, 2, 4, 5, 7, 9, 10], alsoKnownAs: 'Mixolydian' },
  kafi: { id: 'kafi', label: 'Kafi thaat', intervals: [0, 2, 3, 5, 7, 9, 10], alsoKnownAs: 'Dorian' },
  asavari: { id: 'asavari', label: 'Asavari thaat', intervals: [0, 2, 3, 5, 7, 8, 10], alsoKnownAs: 'Natural minor / Aeolian' },
  bhairavi: { id: 'bhairavi', label: 'Bhairavi thaat', intervals: [0, 1, 3, 5, 7, 8, 10], alsoKnownAs: 'Phrygian' },
  bhairav: { id: 'bhairav', label: 'Bhairav thaat', intervals: [0, 1, 4, 5, 7, 8, 11], alsoKnownAs: 'Double harmonic major' },
  marwa: { id: 'marwa', label: 'Marwa thaat', intervals: [0, 1, 4, 6, 7, 9, 11] },
  purvi: { id: 'purvi', label: 'Purvi thaat', intervals: [0, 1, 4, 6, 7, 8, 11] },
  todi: { id: 'todi', label: 'Todi thaat', intervals: [0, 1, 3, 6, 7, 8, 11] },
};

/** Pitch classes of a scale on the given root. */
export function scalePitchClasses(rootPc: number, type: ScaleType): number[] {
  return SCALES[type].intervals.map((i) => pitchClass(rootPc + i));
}

/**
 * MIDI notes of a scale starting at startMidi, spanning `octaves` octaves,
 * including the top octave note. Useful for generating scale drills.
 */
export function scaleMidis(startMidi: number, type: ScaleType, octaves = 1): number[] {
  const out: number[] = [];
  const intervals = SCALES[type].intervals;
  for (let o = 0; o < octaves; o++) {
    for (const i of intervals) out.push(startMidi + o * 12 + i);
  }
  out.push(startMidi + octaves * 12);
  return out;
}

/** Circle of fifths order starting from C: C G D A E B F# C# G# D# A# F */
export const CIRCLE_OF_FIFTHS: number[] = Array.from({ length: 12 }, (_, i) => pitchClass(i * 7));

/** Relative minor root of a major key (down a minor third). */
export function relativeMinorOf(majorRootPc: number): number {
  return pitchClass(majorRootPc - 3);
}

/** Relative major root of a minor key (up a minor third). */
export function relativeMajorOf(minorRootPc: number): number {
  return pitchClass(minorRootPc + 3);
}

// ---------------------------------------------------------------------------
// Chords
// ---------------------------------------------------------------------------

export type ChordQuality =
  | 'fifth'
  | 'major'
  | 'minor'
  | 'dim'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | 'maj7'
  | 'dom7'
  | 'min7'
  | 'dim7'
  | 'm7b5'
  | 'minMaj7'
  | 'maj6'
  | 'min6'
  | 'add9'
  | 'dom9'
  | 'maj9'
  | 'min9';

export interface ChordTemplate {
  quality: ChordQuality;
  /** Suffix used in chord symbols, e.g. 'm', '7', 'maj7'. */
  symbol: string;
  label: string;
  /** Semitone offsets from the root. */
  intervals: number[];
}

/** Order matters: earlier templates win ties when a pitch-class set has two names. */
export const CHORD_TEMPLATES: ChordTemplate[] = [
  { quality: 'major', symbol: '', label: 'Major', intervals: [0, 4, 7] },
  { quality: 'minor', symbol: 'm', label: 'Minor', intervals: [0, 3, 7] },
  { quality: 'dim', symbol: 'dim', label: 'Diminished', intervals: [0, 3, 6] },
  { quality: 'aug', symbol: 'aug', label: 'Augmented', intervals: [0, 4, 8] },
  { quality: 'sus2', symbol: 'sus2', label: 'Suspended 2nd', intervals: [0, 2, 7] },
  { quality: 'sus4', symbol: 'sus4', label: 'Suspended 4th', intervals: [0, 5, 7] },
  { quality: 'dom7', symbol: '7', label: 'Dominant 7th', intervals: [0, 4, 7, 10] },
  { quality: 'maj7', symbol: 'maj7', label: 'Major 7th', intervals: [0, 4, 7, 11] },
  { quality: 'min7', symbol: 'm7', label: 'Minor 7th', intervals: [0, 3, 7, 10] },
  { quality: 'dim7', symbol: 'dim7', label: 'Diminished 7th', intervals: [0, 3, 6, 9] },
  { quality: 'm7b5', symbol: 'm7b5', label: 'Half-diminished', intervals: [0, 3, 6, 10] },
  { quality: 'minMaj7', symbol: 'mMaj7', label: 'Minor-major 7th', intervals: [0, 3, 7, 11] },
  { quality: 'maj6', symbol: '6', label: 'Major 6th', intervals: [0, 4, 7, 9] },
  { quality: 'min6', symbol: 'm6', label: 'Minor 6th', intervals: [0, 3, 7, 9] },
  { quality: 'add9', symbol: 'add9', label: 'Add 9', intervals: [0, 2, 4, 7] },
  { quality: 'dom9', symbol: '9', label: 'Dominant 9th', intervals: [0, 2, 4, 7, 10] },
  { quality: 'maj9', symbol: 'maj9', label: 'Major 9th', intervals: [0, 2, 4, 7, 11] },
  { quality: 'min9', symbol: 'm9', label: 'Minor 9th', intervals: [0, 2, 3, 7, 10] },
  { quality: 'fifth', symbol: '5', label: 'Open fifth (Sa–Pa)', intervals: [0, 7] },
];

export const CHORD_BY_QUALITY: Record<ChordQuality, ChordTemplate> = Object.fromEntries(
  CHORD_TEMPLATES.map((t) => [t.quality, t])
) as Record<ChordQuality, ChordTemplate>;

export function chordPitchClasses(rootPc: number, quality: ChordQuality): number[] {
  return CHORD_BY_QUALITY[quality].intervals.map((i) => pitchClass(rootPc + i));
}

/**
 * MIDI notes for a chord voiced upward from rootMidi, in the given inversion
 * (0 = root position, 1 = first inversion, ...). Inverted notes are moved up an octave.
 */
export function chordMidis(rootMidi: number, quality: ChordQuality, inversion = 0): number[] {
  const base = CHORD_BY_QUALITY[quality].intervals.map((i) => rootMidi + i);
  const inv = ((inversion % base.length) + base.length) % base.length;
  const rotated = [...base.slice(inv), ...base.slice(0, inv).map((m) => m + 12)];
  return rotated;
}

export function chordSymbol(rootPc: number, quality: ChordQuality, preferFlats = false): string {
  return `${pitchClassName(rootPc, preferFlats)}${CHORD_BY_QUALITY[quality].symbol}`;
}

export interface ChordMatch {
  rootPc: number;
  quality: ChordQuality;
  /** e.g. 'C', 'Am', 'G7', 'F/A' */
  symbol: string;
  /** 0 = root position, 1 = first inversion, 2 = second, ... */
  inversion: number;
  bassPc: number;
  /** Other valid names for the same pitch-class set, best first. */
  alternatives: Omit<ChordMatch, 'alternatives'>[];
}

function setsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * Name the chord formed by the given MIDI notes (any octave, any doubling).
 * Exact pitch-class-set match only. Returns null for single notes or unknown sets.
 * When a set has two names (C6 = Am7), the one whose root is in the bass wins,
 * then template order.
 */
export function recognizeChord(midis: number[], preferFlats = false): ChordMatch | null {
  if (midis.length < 2) return null;
  const pcs = uniquePitchClasses(midis);
  const bassPc = pitchClass(Math.min(...midis));

  const matches: Omit<ChordMatch, 'alternatives'>[] = [];
  for (let root = 0; root < 12; root++) {
    for (const t of CHORD_TEMPLATES) {
      if (t.intervals.length !== pcs.length) continue;
      const tpcs = t.intervals.map((i) => pitchClass(root + i)).sort((a, b) => a - b);
      if (!setsEqual(tpcs, pcs)) continue;
      const inversion = t.intervals.findIndex((i) => pitchClass(root + i) === bassPc);
      const base = chordSymbol(root, t.quality, preferFlats);
      const symbol = inversion > 0 ? `${base}/${pitchClassName(bassPc, preferFlats)}` : base;
      matches.push({ rootPc: root, quality: t.quality, symbol, inversion, bassPc });
    }
  }
  if (matches.length === 0) return null;

  const templateRank = (q: ChordQuality) => CHORD_TEMPLATES.findIndex((t) => t.quality === q);
  matches.sort((a, b) => {
    const aRootInBass = a.inversion === 0 ? 0 : 1;
    const bRootInBass = b.inversion === 0 ? 0 : 1;
    if (aRootInBass !== bRootInBass) return aRootInBass - bRootInBass;
    return templateRank(a.quality) - templateRank(b.quality);
  });

  const [best, ...rest] = matches;
  return { ...best, alternatives: rest };
}

export interface ChordTargetOptions {
  /** Accept any inversion (default true). If false, the lowest note must be the root. */
  allowInversion?: boolean;
  /** Accept the pitch classes in any octave (default true). */
  allowOctaveShift?: boolean;
  /** Accept extra doubled chord tones (default true). Non-chord tones always fail. */
  allowDoubling?: boolean;
}

/**
 * Does what the learner is holding satisfy a target chord? Used by chord drills.
 */
export function matchesChordTarget(
  heldMidis: number[],
  targetRootPc: number,
  quality: ChordQuality,
  opts: ChordTargetOptions = {}
): boolean {
  const { allowInversion = true, allowOctaveShift = true, allowDoubling = true } = opts;
  if (heldMidis.length === 0) return false;
  const target = chordPitchClasses(targetRootPc, quality).sort((a, b) => a - b);
  const held = uniquePitchClasses(heldMidis);

  if (!allowDoubling && heldMidis.length !== target.length) return false;
  if (!setsEqual(held, target)) return false;

  if (!allowInversion && pitchClass(Math.min(...heldMidis)) !== pitchClass(targetRootPc)) return false;

  if (!allowOctaveShift) {
    // Every held note must sit within one octave above the lowest note.
    const lo = Math.min(...heldMidis);
    if (heldMidis.some((m) => m - lo >= 12)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Diatonic harmony (chord families)
// ---------------------------------------------------------------------------

export type RomanNumeral = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°' | 'i' | 'ii°' | 'III' | 'iv' | 'v' | 'VI' | 'VII';

export interface DiatonicChord {
  degree: number; // 1..7
  numeral: RomanNumeral;
  rootPc: number;
  quality: ChordQuality;
  symbol: string;
}

const MAJOR_TRIAD_QUALITIES: { numeral: RomanNumeral; quality: ChordQuality }[] = [
  { numeral: 'I', quality: 'major' },
  { numeral: 'ii', quality: 'minor' },
  { numeral: 'iii', quality: 'minor' },
  { numeral: 'IV', quality: 'major' },
  { numeral: 'V', quality: 'major' },
  { numeral: 'vi', quality: 'minor' },
  { numeral: 'vii°', quality: 'dim' },
];

const MINOR_TRIAD_QUALITIES: { numeral: RomanNumeral; quality: ChordQuality }[] = [
  { numeral: 'i', quality: 'minor' },
  { numeral: 'ii°', quality: 'dim' },
  { numeral: 'III', quality: 'major' },
  { numeral: 'iv', quality: 'minor' },
  { numeral: 'v', quality: 'minor' },
  { numeral: 'VI', quality: 'major' },
  { numeral: 'VII', quality: 'major' },
];

/** The seven triads built on each degree of a major or natural-minor key. */
export function diatonicTriads(rootPc: number, mode: 'major' | 'minor', preferFlats = false): DiatonicChord[] {
  const scale = scalePitchClasses(rootPc, mode === 'major' ? 'major' : 'natural-minor');
  const qualities = mode === 'major' ? MAJOR_TRIAD_QUALITIES : MINOR_TRIAD_QUALITIES;
  return scale.map((pc, i) => ({
    degree: i + 1,
    numeral: qualities[i].numeral,
    rootPc: pc,
    quality: qualities[i].quality,
    symbol: chordSymbol(pc, qualities[i].quality, preferFlats),
  }));
}

// ---------------------------------------------------------------------------
// Transposition
// ---------------------------------------------------------------------------

export interface TransposeOptions {
  /** Fold notes that leave this range back in by octaves. */
  minMidi?: number;
  maxMidi?: number;
}

export function foldIntoRange(midi: number, minMidi: number, maxMidi: number): number {
  let m = midi;
  while (m < minMidi) m += 12;
  while (m > maxMidi) m -= 12;
  return m;
}

export function transposeNotes(notes: ScoreNote[], semitones: number, opts: TransposeOptions = {}): ScoreNote[] {
  if (semitones === 0) return notes;
  return notes.map((n) => {
    let midi = n.midi + semitones;
    if (opts.minMidi !== undefined && opts.maxMidi !== undefined) {
      midi = foldIntoRange(midi, opts.minMidi, opts.maxMidi);
    }
    return { ...n, midi };
  });
}

/** Transpose every arrangement of a song, updating key and Sa. The id is suffixed so caches stay distinct. */
export function transposeSong(song: SongScore, semitones: number, opts: TransposeOptions = {}): SongScore {
  if (semitones === 0) return song;
  const tiers = ['beginner', 'intermediate', 'pro'] as const;
  const arrangements = { ...song.arrangements };
  for (const t of tiers) {
    arrangements[t] = { ...song.arrangements[t], notes: transposeNotes(song.arrangements[t].notes, semitones, opts) };
  }
  const keyPc = parsePitchClass(song.keySignature.replace(/m$/, ''));
  const isMinor = /m$/.test(song.keySignature);
  const newKey =
    keyPc === null ? song.keySignature : `${pitchClassName(keyPc + semitones)}${isMinor ? 'm' : ''}`;
  return {
    ...song,
    id: `${song.id}@${semitones > 0 ? '+' : ''}${semitones}`,
    keySignature: newKey,
    rootSaMidi: pitchClass(song.rootSaMidi + semitones),
    arrangements,
  };
}

// ---------------------------------------------------------------------------
// Key detection (Krumhansl–Schmuckler)
// ---------------------------------------------------------------------------

const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export interface KeyEstimate {
  rootPc: number;
  mode: 'major' | 'minor';
  /** Pearson correlation with the best-fitting profile, -1..1. */
  confidence: number;
  label: string;
  /** All 24 candidates ranked, for "was it close?" feedback. */
  ranked: { rootPc: number; mode: 'major' | 'minor'; score: number }[];
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

/**
 * Estimate the key from notes weighted by duration.
 * Works on anything with midi and duration (ScoreNote, imported MIDI, held notes with 1s each).
 */
export function detectKey(notes: { midi: number; duration: number }[]): KeyEstimate | null {
  if (notes.length === 0) return null;
  const hist = new Array<number>(12).fill(0);
  for (const n of notes) hist[pitchClass(n.midi)] += Math.max(0.05, n.duration);

  const ranked: KeyEstimate['ranked'] = [];
  for (let root = 0; root < 12; root++) {
    const rotate = (p: number[]) => p.map((_, i) => p[(i - root + 12) % 12]);
    ranked.push({ rootPc: root, mode: 'major', score: pearson(hist, rotate(KS_MAJOR)) });
    ranked.push({ rootPc: root, mode: 'minor', score: pearson(hist, rotate(KS_MINOR)) });
  }
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];
  return {
    rootPc: best.rootPc,
    mode: best.mode,
    confidence: best.score,
    label: `${pitchClassName(best.rootPc)} ${best.mode}`,
    ranked,
  };
}
