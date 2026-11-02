import { HandType, ScoreNote, SongArrangement, SongScore, TeacherLessonGuide } from '../types/music';
import { pitchClass } from './theory';

/**
 * Sargam text notation → ScoreNote[].
 *
 * Written the way Indian notation books write it, one matra (beat) per token:
 *
 *   RH: S R G M | P D N S' |
 *   LH: S, - - - | P, - - - |
 *
 *   S R G M P D N   shuddha (natural) notes
 *   r g d n         komal (flat) Re Ga Dha Ni
 *   m               tivra (sharp) Ma
 *   S'  S''         one, two octaves up (taar)
 *   S,  S,,         one, two octaves down (mandra)
 *   S3              finger number 1–5 after the note (S'3 for taar Sa with finger 3)
 *   -               hold the previous note one more matra
 *   0               rest for one matra
 *   (S R)  (S R G)  several notes sharing one matra
 *   |               bar line, ignored for timing
 *   # ...           comment to end of line
 *   RH: / LH:       hand for that line; lines without a prefix keep the previous hand
 */

const DEGREE_SEMITONES: Record<string, number> = {
  S: 0,
  r: 1,
  R: 2,
  g: 3,
  G: 4,
  M: 5,
  m: 6,
  P: 7,
  d: 8,
  D: 9,
  n: 10,
  N: 11,
};

export interface SargamParseOptions {
  /** MIDI of Sa for the right hand (default 60, Middle C) */
  saMidi?: number;
  /** Octaves the left hand sits below the right-hand Sa (default 1) */
  leftHandOctaveOffset?: number;
  bpm: number;
  timeSignature: [number, number];
  rightVelocity?: number;
  leftVelocity?: number;
  idPrefix?: string;
}

interface Token {
  kind: 'note' | 'hold' | 'rest' | 'group';
  semitones?: number;
  octave?: number;
  finger?: 1 | 2 | 3 | 4 | 5;
  notes?: Token[];
  raw: string;
}

const NOTE_RE = /^([SrRgGMmPdDnN])('*|,*)([1-5])?$/;

function parseNoteToken(raw: string): Token {
  const m = NOTE_RE.exec(raw);
  if (!m) throw new Error(`Sargam: cannot read token "${raw}"`);
  const [, letter, octMarks, finger] = m;
  const octave = octMarks.startsWith("'") ? octMarks.length : octMarks.startsWith(',') ? -octMarks.length : 0;
  return {
    kind: 'note',
    semitones: DEGREE_SEMITONES[letter],
    octave,
    finger: finger ? (Number(finger) as 1 | 2 | 3 | 4 | 5) : undefined,
    raw,
  };
}

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  const src = line.replace(/#.*$/, '').trim();
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch) || ch === '|') {
      i++;
      continue;
    }
    if (ch === '(') {
      const close = src.indexOf(')', i);
      if (close < 0) throw new Error(`Sargam: unclosed "(" in "${line}"`);
      const inner = src.slice(i + 1, close).trim().split(/\s+/).filter(Boolean);
      out.push({ kind: 'group', notes: inner.map(parseNoteToken), raw: src.slice(i, close + 1) });
      i = close + 1;
      continue;
    }
    let j = i;
    while (j < src.length && !/[\s|()]/.test(src[j])) j++;
    const word = src.slice(i, j);
    if (word === '-') out.push({ kind: 'hold', raw: word });
    else if (word === '0' || word === '.') out.push({ kind: 'rest', raw: word });
    else out.push(parseNoteToken(word));
    i = j;
  }
  return out;
}

export interface ParsedSargam {
  notes: ScoreNote[];
  totalBeats: number;
  totalMeasures: number;
  durationSeconds: number;
}

export function parseSargam(text: string, opts: SargamParseOptions): ParsedSargam {
  const saMidi = opts.saMidi ?? 60;
  const lhOffset = (opts.leftHandOctaveOffset ?? 1) * 12;
  const spb = 60 / opts.bpm;
  const beatsPerBar = opts.timeSignature[0];
  const prefix = opts.idPrefix ?? 'sg';

  const notes: ScoreNote[] = [];
  const cursor: Record<HandType, number> = { right: 0, left: 0 };
  let hand: HandType = 'right';
  let counter = 0;

  const emit = (tok: Token, startBeat: number, beats: number, h: HandType): ScoreNote => {
    const midi = saMidi + (tok.semitones ?? 0) + (tok.octave ?? 0) * 12 - (h === 'left' ? lhOffset : 0);
    const startTime = startBeat * spb;
    const note: ScoreNote = {
      id: `${prefix}-${h === 'right' ? 'r' : 'l'}${counter++}`,
      midi,
      startTime: Number(startTime.toFixed(4)),
      duration: Number((beats * spb).toFixed(4)),
      measure: Math.floor(startBeat / beatsPerBar) + 1,
      beat: Math.floor(startBeat % beatsPerBar) + 1,
      hand: h,
      velocity: h === 'right' ? opts.rightVelocity ?? 84 : opts.leftVelocity ?? 62,
      finger: tok.finger,
      articulation: 'normal',
    };
    notes.push(note);
    return note;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const handMatch = /^(RH|LH)\s*:\s*/i.exec(line);
    if (handMatch) {
      hand = handMatch[1].toUpperCase() === 'LH' ? 'left' : 'right';
      line = line.slice(handMatch[0].length);
    }
    let last: ScoreNote | null = null;
    for (const tok of tokenize(line)) {
      const at = cursor[hand];
      if (tok.kind === 'hold') {
        if (last) last.duration = Number((last.duration + spb).toFixed(4));
        cursor[hand] = at + 1;
      } else if (tok.kind === 'rest') {
        last = null;
        cursor[hand] = at + 1;
      } else if (tok.kind === 'group') {
        const n = tok.notes!.length;
        tok.notes!.forEach((sub, k) => {
          last = emit(sub, at + k / n, 1 / n, hand);
        });
        cursor[hand] = at + 1;
      } else {
        last = emit(tok, at, 1, hand);
        cursor[hand] = at + 1;
      }
    }
  }

  notes.sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);
  const totalBeats = Math.max(cursor.right, cursor.left);
  const totalMeasures = Math.max(1, Math.ceil(totalBeats / beatsPerBar));
  return {
    notes,
    totalBeats,
    totalMeasures,
    durationSeconds: Number((totalMeasures * beatsPerBar * spb).toFixed(3)),
  };
}

// ---------------------------------------------------------------------------
// Song assembly
// ---------------------------------------------------------------------------

export interface SongSpec {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  stageId: number;
  category: SongScore['category'];
  bpm: number;
  timeSignature: [number, number];
  keySignature: string;
  /** Pitch class of Sa (0 = C) */
  rootSaPitchClass?: number;
  pedagogyFocus: string[];
  coachTip: string;
  teacherGuide?: TeacherLessonGuide;
}

export interface TierNotes {
  beginner: ScoreNote[];
  intermediate?: ScoreNote[];
  pro?: ScoreNote[];
}

function arrangement(tier: SongArrangement['tier'], notes: ScoreNote[], label: string, description: string): SongArrangement {
  return { tier, label, description, notes };
}

/** Build a SongScore from note arrays. Missing tiers reuse the beginner notes. */
export function makeSong(spec: SongSpec, tiers: TierNotes, labels?: Partial<Record<SongArrangement['tier'], string>>): SongScore {
  const beginner = tiers.beginner;
  const intermediate = tiers.intermediate ?? beginner;
  const pro = tiers.pro ?? intermediate;
  const all = [...beginner, ...intermediate, ...pro];
  const spb = 60 / spec.bpm;
  const beatsPerBar = spec.timeSignature[0];
  const end = all.reduce((m, n) => Math.max(m, n.startTime + n.duration), 0);
  const totalMeasures = Math.max(1, Math.ceil(end / (spb * beatsPerBar) - 1e-6));
  return {
    id: spec.id,
    title: spec.title,
    subtitle: spec.subtitle,
    composer: spec.composer,
    stageId: spec.stageId,
    category: spec.category,
    bpm: spec.bpm,
    timeSignature: spec.timeSignature,
    keySignature: spec.keySignature,
    rootSaMidi: pitchClass(spec.rootSaPitchClass ?? 0),
    totalMeasures,
    durationSeconds: Number((totalMeasures * beatsPerBar * spb).toFixed(3)),
    pedagogyFocus: spec.pedagogyFocus,
    coachTip: spec.coachTip,
    teacherGuide: spec.teacherGuide,
    arrangements: {
      beginner: arrangement('beginner', beginner, labels?.beginner ?? 'Beginner', 'As written, one hand.'),
      intermediate: arrangement('intermediate', intermediate, labels?.intermediate ?? 'Intermediate', 'With a simple left hand.'),
      pro: arrangement('pro', pro, labels?.pro ?? 'Pro', 'Full arrangement.'),
    },
  };
}

/** Build a SongScore straight from Sargam text, one block per tier. */
export function songFromSargam(
  spec: SongSpec,
  text: { beginner: string; intermediate?: string; pro?: string },
  parse: Omit<SargamParseOptions, 'bpm' | 'timeSignature'> = {}
): SongScore {
  const common = { ...parse, bpm: spec.bpm, timeSignature: spec.timeSignature };
  const tiers: TierNotes = {
    beginner: parseSargam(text.beginner, { ...common, idPrefix: `${spec.id}-b` }).notes,
    intermediate: text.intermediate ? parseSargam(text.intermediate, { ...common, idPrefix: `${spec.id}-i` }).notes : undefined,
    pro: text.pro ? parseSargam(text.pro, { ...common, idPrefix: `${spec.id}-p` }).notes : undefined,
  };
  return makeSong(spec, tiers);
}
