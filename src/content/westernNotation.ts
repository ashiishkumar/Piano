import { HandType, ScoreNote, SongScore, TeacherLessonGuide } from '../types/music';
import { ChordSpec } from '../types/lesson';
import { chordMidis, chordSymbol } from '../engine/theory';
import { makeSong, SongSpec } from '../engine/sargam';
import { withIdPrefix } from '../engine/generators';

/**
 * Western letter notation parser tailored for the PIX Series Zero to Hero Course e-book.
 *
 * Syntax per beat token:
 *   C, C#, D, D#, E, F, F#, G, G#, A, A#, B (or Db, Eb, Gb, Ab, Bb)
 *   Octave suffixes:
 *     - ',' or ',,' for lower octave (e.g. G, = G3 when base octave is 4)
 *     - "'" or "''" for higher octave / RED letters in the PDF (e.g. C' = C5)
 *     - explicit octave number 2..6 (e.g. C3, G#4, D5)
 *   Finger suffix:
 *     - '/1' .. '/5' (e.g. C/1, E/3, G'/5)
 *   Hold & Rest:
 *     - '-' holds the previous note(s) for 1 more beat
 *     - '0' or '.' rests for 1 beat
 *   Subdivisions (notes sharing 1 beat sequentially):
 *     - '(C D)' = two eighth notes in 1 beat
 *     - '(C D E F)' = four sixteenth notes in 1 beat
 *   Simultaneous dyads/chords (notes played at the exact same time for 1 beat):
 *     - '[C/1 E/3]' = harmonic third C4 + E4 together
 *     - '[C4/1 C5/5]' = octave C4 + C5 together
 *   Line prefixes:
 *     - 'RH:' (default base octave 4)
 *     - 'LH:' (default base octave 3)
 */

const PITCH_MAP: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

interface NoteAtom {
  pc: number;
  octaveOffset: number;
  explicitOctave?: number;
  finger?: 1 | 2 | 3 | 4 | 5;
}

type WesternToken =
  | { kind: 'single'; atom: NoteAtom }
  | { kind: 'chord'; atoms: NoteAtom[] }
  | { kind: 'subdiv'; items: WesternToken[] }
  | { kind: 'hold' }
  | { kind: 'rest' };

const ATOM_RE = /^([A-G](?:#|b)?)(?:([2-6])|('*|,*))?(?:\/([1-5]))?$/;

function parseAtom(raw: string): NoteAtom {
  const m = ATOM_RE.exec(raw.trim());
  if (!m) {
    throw new Error(`WesternNotation: cannot parse note token "${raw}"`);
  }
  const [, name, explicitOct, relOct, fingerStr] = m;
  const pc = PITCH_MAP[name];
  if (pc === undefined) {
    throw new Error(`WesternNotation: unknown pitch "${name}" in "${raw}"`);
  }
  let octaveOffset = 0;
  if (relOct) {
    octaveOffset = relOct.startsWith("'") ? relOct.length : -relOct.length;
  }
  return {
    pc,
    octaveOffset,
    explicitOctave: explicitOct ? Number(explicitOct) : undefined,
    finger: fingerStr ? (Number(fingerStr) as 1 | 2 | 3 | 4 | 5) : undefined,
  };
}

function tokenizeWesternLine(line: string): WesternToken[] {
  const src = line.replace(/\/\/.*$/, '').trim();
  const out: WesternToken[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch) || ch === '|') {
      i++;
      continue;
    }
    if (ch === '[') {
      const close = src.indexOf(']', i);
      if (close < 0) throw new Error(`WesternNotation: unclosed "[" in "${line}"`);
      const inner = src
        .slice(i + 1, close)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      out.push({ kind: 'chord', atoms: inner.map(parseAtom) });
      i = close + 1;
      continue;
    }
    if (ch === '(') {
      const close = src.indexOf(')', i);
      if (close < 0) throw new Error(`WesternNotation: unclosed "(" in "${line}"`);
      const innerStr = src.slice(i + 1, close).trim();
      const subTokens = tokenizeWesternLine(innerStr);
      out.push({ kind: 'subdiv', items: subTokens });
      i = close + 1;
      continue;
    }
    let j = i;
    while (j < src.length && !/[\s|()[\]]/.test(src[j])) j++;
    const word = src.slice(i, j);
    if (word === '-') {
      out.push({ kind: 'hold' });
    } else if (word === '0' || word === '.') {
      out.push({ kind: 'rest' });
    } else {
      out.push({ kind: 'single', atom: parseAtom(word) });
    }
    i = j;
  }
  return out;
}

export interface WesternParseOptions {
  bpm: number;
  timeSignature?: [number, number];
  rhBaseOctave?: number; // default 4 (C4 = 60)
  lhBaseOctave?: number; // default 3 (C3 = 48)
  rightVelocity?: number;
  leftVelocity?: number;
  idPrefix?: string;
}

export function parseWestern(text: string, opts: WesternParseOptions): ScoreNote[] {
  const spb = 60 / opts.bpm;
  const beatsPerBar = (opts.timeSignature ?? [4, 4])[0];
  const rhOct = opts.rhBaseOctave ?? 4;
  const lhOct = opts.lhBaseOctave ?? 3;
  const prefix = opts.idPrefix ?? 'wn';

  const notes: ScoreNote[] = [];
  const cursor: Record<HandType, number> = { right: 0, left: 0 };
  let hand: HandType = 'right';
  let counter = 0;

  const atomMidi = (atom: NoteAtom, h: HandType): number => {
    const baseOct = atom.explicitOctave ?? (h === 'right' ? rhOct : lhOct) + atom.octaveOffset;
    const rawMidi = (baseOct + 1) * 12 + atom.pc;
    // Clamp safely within the 61-key range 36..96
    return Math.max(36, Math.min(96, rawMidi));
  };

  const emitAtoms = (atoms: NoteAtom[], startBeat: number, durationBeats: number, h: HandType): ScoreNote[] => {
    const startTime = startBeat * spb;
    const created: ScoreNote[] = [];
    for (const atom of atoms) {
      const note: ScoreNote = {
        id: `${prefix}-${h === 'right' ? 'r' : 'l'}${counter++}`,
        midi: atomMidi(atom, h),
        startTime: Number(startTime.toFixed(4)),
        duration: Number((durationBeats * spb).toFixed(4)),
        measure: Math.floor(startBeat / beatsPerBar) + 1,
        beat: Math.floor(startBeat % beatsPerBar) + 1,
        hand: h,
        velocity: h === 'right' ? opts.rightVelocity ?? 84 : opts.leftVelocity ?? 62,
        finger: atom.finger,
        articulation: 'normal',
      };
      notes.push(note);
      created.push(note);
    }
    return created;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;
    const handMatch = /^(RH|LH)\s*:\s*/i.exec(line);
    if (handMatch) {
      hand = handMatch[1].toUpperCase() === 'LH' ? 'left' : 'right';
      line = line.slice(handMatch[0].length);
    }
    let lastGroup: ScoreNote[] = [];

    const processToken = (tok: WesternToken, beatAt: number, beatSpan: number) => {
      if (tok.kind === 'hold') {
        for (const prev of lastGroup) {
          prev.duration = Number((prev.duration + beatSpan * spb).toFixed(4));
        }
      } else if (tok.kind === 'rest') {
        lastGroup = [];
      } else if (tok.kind === 'single') {
        lastGroup = emitAtoms([tok.atom], beatAt, beatSpan, hand);
      } else if (tok.kind === 'chord') {
        lastGroup = emitAtoms(tok.atoms, beatAt, beatSpan, hand);
      } else if (tok.kind === 'subdiv') {
        const subLen = tok.items.length;
        tok.items.forEach((sub, idx) => {
          processToken(sub, beatAt + (idx * beatSpan) / subLen, beatSpan / subLen);
        });
      }
    };

    const tokens = tokenizeWesternLine(line);
    for (const tok of tokens) {
      const at = cursor[hand];
      processToken(tok, at, 1);
      cursor[hand] = at + 1;
    }
  }

  notes.sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);
  return notes;
}

/**
 * Generates a Left-Hand chord accompaniment track aligned to a bar-by-bar chord list.
 * Supports:
 *  - 'root': single bass root note (1 finger)
 *  - 'block': 3-note triad (5-3-1)
 *  - 'fat': Chapter 4I "Fat Chord" 1-5-8 octave voicing (C3-G3-C4 with fingers 5-2-1)
 *  - 'arpeggio': 1-5-8-5 broken arpeggio
 */
export function buildLeftHandChords(
  chords: ChordSpec[],
  opts: {
    bpm: number;
    timeSignature?: [number, number];
    beatsPerChord?: number;
    style: 'root' | 'block' | 'fat' | 'arpeggio';
    idPrefix?: string;
  }
): ScoreNote[] {
  const spb = 60 / opts.bpm;
  const beatsPerBar = (opts.timeSignature ?? [4, 4])[0];
  const defaultBeats = opts.beatsPerChord ?? beatsPerBar;
  const prefix = opts.idPrefix ?? 'lhc';
  const notes: ScoreNote[] = [];
  let beatCursor = 0;
  let n = 0;

  const pushNote = (midi: number, startBeat: number, durBeats: number, finger: 1 | 2 | 3 | 4 | 5, symbol?: string) => {
    notes.push({
      id: `${prefix}-${n++}`,
      midi: Math.max(36, Math.min(96, midi)),
      startTime: Number((startBeat * spb).toFixed(4)),
      duration: Number((durBeats * spb).toFixed(4)),
      measure: Math.floor(startBeat / beatsPerBar) + 1,
      beat: Math.floor(startBeat % beatsPerBar) + 1,
      hand: 'left',
      velocity: 62,
      finger,
      chordSymbol: symbol,
      articulation: 'normal',
    });
  };

  for (const spec of chords) {
    const durBeats = spec.beats ?? defaultBeats;
    // Keep LH roots in C2..B3 (MIDI 36..59) so they never collide with RH C4+
    const rootMidi = spec.rootPc >= 9 ? 36 + spec.rootPc : 48 + spec.rootPc;
    const sym = spec.label ?? chordSymbol(spec.rootPc, spec.quality);

    if (opts.style === 'root') {
      pushNote(rootMidi, beatCursor, durBeats, 5, sym);
    } else if (opts.style === 'block') {
      const triad = chordMidis(rootMidi, spec.quality, spec.inversion ?? 0);
      const fingers: (1 | 2 | 3 | 4 | 5)[] = [5, 3, 1];
      triad.forEach((m, i) => pushNote(m, beatCursor, durBeats, fingers[i] ?? 2, i === 0 ? sym : undefined));
    } else if (opts.style === 'fat') {
      // Chapter 4I Fat Chords: 1 - 5 - 8 (Root, Fifth, Octave) with fingers 5 - 2 - 1
      const fatVoicing: [number, 1 | 2 | 3 | 4 | 5][] = [
        [rootMidi, 5],
        [rootMidi + 7, 2],
        [rootMidi + 12, 1],
      ];
      fatVoicing.forEach(([m, f], i) => pushNote(m, beatCursor, durBeats, f, i === 0 ? sym : undefined));
    } else if (opts.style === 'arpeggio') {
      const pattern = [
        { offset: 0, finger: 5 as const },
        { offset: 7, finger: 2 as const },
        { offset: 12, finger: 1 as const },
        { offset: 7, finger: 2 as const },
      ];
      const stepBeats = durBeats / pattern.length;
      pattern.forEach((p, i) =>
        pushNote(rootMidi + p.offset, beatCursor + i * stepBeats, stepBeats, p.finger, i === 0 ? sym : undefined)
      );
    }
    beatCursor += durBeats;
  }

  return notes;
}

/**
 * Standard Teacher Guide for Module 2 Right-Hand Songs (Chapter 2H).
 * Follows Jash Gotawala's Chapter 2H & 4G "Right Hand Mastery" progression:
 *   Step 1: Right Hand Note Discovery (Wait-for-Me)
 *   Step 2: Right Hand in Slow Rhythm (75% BPM)
 *   Step 3: Right Hand at Target Course Tempo (100% BPM)
 */
export function buildRhSongGuide(title: string, bpmRange: string, pdfPages: string): TeacherLessonGuide {
  return {
    whyLearnThis: `From PIX Series Zero to Hero Course (${pdfPages}): Master the complete Right-Hand melody of "${title}". Remember Jash's golden rule: RED notes in the PDF are higher-octave notes (C5+), and normal notes sit in the middle octave (C4–B4). Target metronome speed: ${bpmRange}.`,
    handPlacement: {
      rightHand:
        'Position your Right Hand in the Middle Octave (C4–B4) and glide smoothly up to the Higher Octave (C5+) when higher notes appear.',
      leftHand:
        'In Module 2 (Chapter 2H), keep your Left Hand resting comfortably in your lap! You will add Left-Hand chords to this exact song in Module 4 (Chapter 4H).',
    },
    whatTeacherExpects: [
      'Step 1: Learn the exact Right-Hand notes in Wait-for-Me mode with zero time pressure.',
      'Step 2: Play the Right-Hand melody smoothly in rhythm at a comfortable slow tempo.',
      `Step 3: Play at the full course metronome target (${bpmRange}) without hesitating between lines.`,
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right Hand Notes (Wait-for-Me)',
        subtitle: 'Find every note at your own pace',
        whatToExpect: 'The lesson waits at each melody note until you press it. Watch for octave jumps!',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.7,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Right Hand in Slow Rhythm',
        subtitle: 'Connect phrases smoothly with the click',
        whatToExpect: 'Play with the metronome at 75% speed so your transitions between lines feel natural.',
        handFilter: 'right',
        tier: 'intermediate',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Full Rhythm Mastery',
        subtitle: `Course target speed (${bpmRange})`,
        whatToExpect: 'Play the entire song in strict rhythm with clean note durations and expression.',
        handFilter: 'right',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.95,
      },
    ],
  };
}

/**
 * Jash Gotawala's signature RCCR Framework Teacher Guide for Module 4 (Chapters 4G & 4H):
 *   R = Right-Hand Mastery
 *   C = Chords Placement (on Beat 1 lyrics)
 *   C = Coordination (Both hands together slowly, releasing LH chord slightly early to shift smoothly)
 *   R = Rhythm (Playing with metronome as your reality checker)
 */
export function buildRccrSongGuide(
  title: string,
  chordNames: string,
  pdfPages: string
): TeacherLessonGuide {
  return {
    whyLearnThis: `PIX Series RCCR Framework (${pdfPages}): Play "${title}" with both hands using chords (${chordNames}). Follow Jash's 4-pillar RCCR formula: Right-Hand Mastery → Chords Placement → Coordination → Rhythm!`,
    handPlacement: {
      rightHand: 'Play the vocal melody in the Middle/Higher Octave (C4–E5).',
      leftHand: `Play the progression chords (${chordNames}) in the Lower Octave (C3–B3) using fingers 5-3-1 (or Fat Chords 5-2-1 in Pro tier).`,
    },
    whatTeacherExpects: [
      'Step 1 (R + C — Chord Placement): Practice the Left-Hand chord shifts and see where each chord lands on Beat 1.',
      'Step 2 (C — Coordination in Wait-for-Me): Bring both hands together slowly. Release the Left-Hand chord a fraction early before shifting to the next chord!',
      'Step 3 (R — Rhythm Reality Check): Play both hands in time with the metronome, including full triads/Fat Chords.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: R & C — Melody + Root Placement (Wait-for-Me)',
        subtitle: 'Place each chord on the exact Beat-1 note',
        whatToExpect:
          'Play the Right-Hand melody while placing the Left-Hand root note on Beat 1 of each chord change.',
        handFilter: 'both',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: C — Two-Hand Chord Coordination (Wait-for-Me)',
        subtitle: 'Full 3-note triads + melody, no rush',
        whatToExpect:
          'Hold the full 3-note Left-Hand chord with the Right-Hand melody. Release the LH chord slightly early to prepare the next shift.',
        handFilter: 'both',
        tier: 'intermediate',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: R — Full RCCR Performance in Rhythm',
        subtitle: 'Metronome reality check with full chords',
        whatToExpect:
          'Play the complete two-hand arrangement in steady rhythm with the metronome.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.9,
      },
    ],
  };
}

/**
 * Helper to assemble a complete Chapter 2H Right-Hand SongScore from Western notation.
 */
export function makeRhCourseSong(spec: {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  bpm: number;
  timeSignature?: [number, number];
  keySignature: string;
  rootSaPitchClass?: number;
  bpmRange: string;
  pdfPages: string;
  melodyWestern: string;
}): SongScore {
  const ts = spec.timeSignature ?? [4, 4];
  const notes = parseWestern(spec.melodyWestern, {
    bpm: spec.bpm,
    timeSignature: ts,
    idPrefix: spec.id,
  });
  return makeSong(
    {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      composer: spec.composer,
      stageId: 2,
      category: 'repertoire',
      bpm: spec.bpm,
      timeSignature: ts,
      keySignature: spec.keySignature,
      rootSaPitchClass: spec.rootSaPitchClass ?? 0,
      pedagogyFocus: [
        `Right-hand melody from PIX Course (${spec.pdfPages})`,
        `Target Metronome Speed: ${spec.bpmRange}`,
      ],
      coachTip: `Watch the octave shifts! Notes marked with ' (red in the PDF) jump to the higher octave. Target speed: ${spec.bpmRange}.`,
      teacherGuide: buildRhSongGuide(spec.title, spec.bpmRange, spec.pdfPages),
    },
    {
      beginner: notes,
      intermediate: withIdPrefix(notes, `${spec.id}-i`),
      pro: withIdPrefix(notes, `${spec.id}-p`),
    },
    {
      beginner: 'Wait-for-Me (RH)',
      intermediate: 'Slow Rhythm (RH)',
      pro: 'Target Tempo (RH)',
    }
  );
}

/**
 * Helper to assemble a complete Chapter 4G/4H RCCR Song with Chords.
 * - Beginner tier: RH Melody + LH Root notes on chord changes
 * - Intermediate tier: RH Melody + LH 3-note Block Triads (5-3-1)
 * - Pro tier: RH Melody + LH Fat Chords (1-5-8) or Arpeggiated Chords
 */
export function makeRccrCourseSong(spec: {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  bpm: number;
  timeSignature?: [number, number];
  keySignature: string;
  rootSaPitchClass?: number;
  pdfPages: string;
  melodyWestern: string;
  chords: ChordSpec[];
  beatsPerChord?: number;
}): SongScore {
  const ts = spec.timeSignature ?? [4, 4];
  const rh = parseWestern(spec.melodyWestern, {
    bpm: spec.bpm,
    timeSignature: ts,
    idPrefix: `${spec.id}-rh`,
  });
  const lhRoots = buildLeftHandChords(spec.chords, {
    bpm: spec.bpm,
    timeSignature: ts,
    beatsPerChord: spec.beatsPerChord,
    style: 'root',
    idPrefix: `${spec.id}-lhr`,
  });
  const lhBlocks = buildLeftHandChords(spec.chords, {
    bpm: spec.bpm,
    timeSignature: ts,
    beatsPerChord: spec.beatsPerChord,
    style: 'block',
    idPrefix: `${spec.id}-lhb`,
  });
  const lhFat = buildLeftHandChords(spec.chords, {
    bpm: spec.bpm,
    timeSignature: ts,
    beatsPerChord: spec.beatsPerChord,
    style: 'fat',
    idPrefix: `${spec.id}-lhf`,
  });

  const uniqueChordNames = Array.from(
    new Set(spec.chords.map((c) => c.label ?? chordSymbol(c.rootPc, c.quality)))
  ).join(', ');

  return makeSong(
    {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      composer: spec.composer,
      stageId: 4,
      category: 'repertoire',
      bpm: spec.bpm,
      timeSignature: ts,
      keySignature: spec.keySignature,
      rootSaPitchClass: spec.rootSaPitchClass ?? 0,
      pedagogyFocus: [
        `RCCR Framework (${spec.pdfPages}): Right Hand → Chords Placement → Coordination → Rhythm`,
        `Chords used: ${uniqueChordNames}`,
      ],
      coachTip: `Release your Left-Hand chord a split-second before Beat 1 of the next bar so your hand lands cleanly on the new chord (${uniqueChordNames}).`,
      teacherGuide: buildRccrSongGuide(spec.title, uniqueChordNames, spec.pdfPages),
    },
    {
      beginner: [...rh, ...lhRoots],
      intermediate: [...withIdPrefix(rh, `${spec.id}-rhi`), ...lhBlocks],
      pro: [...withIdPrefix(rh, `${spec.id}-rhp`), ...lhFat],
    },
    {
      beginner: 'Step 1: Melody + LH Roots',
      intermediate: 'Step 2: Melody + Triads',
      pro: 'Step 3: Melody + Fat Chords',
    }
  );
}
