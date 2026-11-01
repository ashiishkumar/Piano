import { HandType, NotationMode, ScoreNote } from '../types/music';

export const PSR_E373_MIN_MIDI = 36; // C2 (labeled C1 on 61-key Yamaha keyboards)
export const PSR_E373_MAX_MIDI = 96; // C7 (labeled C6 on 61-key Yamaha keyboards)

export const FULL_88_MIN_MIDI = 21;  // A0
export const FULL_88_MAX_MIDI = 108; // C8

const WESTERN_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SOLFEGE_NAMES = ['Do', 'Di', 'Re', 'Ri', 'Mi', 'Fa', 'Fi', 'Sol', 'Si', 'La', 'Li', 'Ti'];

// Indian Sargam 12-semitone mapping relative to Sa:
// 0: Sa, 1: re (Komal), 2: Re, 3: ga (Komal), 4: Ga, 5: Ma, 6: Ma' (Tivra),
// 7: Pa, 8: dha (Komal), 9: Dha, 10: ni (Komal), 11: Ni
export interface SargamLabel {
  short: string;
  full: string;
  variant: 'shuddha' | 'komal' | 'tivra' | 'achala';
  saptak: 'mandra' | 'madhya' | 'taar' | 'ati'; // Octave register relative to Middle Sa (C4 = 60)
}

const SARGAM_SEMITONES: { short: string; full: string; variant: SargamLabel['variant'] }[] = [
  { short: 'Sa', full: 'Sa (Shadja)', variant: 'achala' },
  { short: 're̱', full: 'Komal Re', variant: 'komal' },
  { short: 'Re', full: 'Shuddha Re', variant: 'shuddha' },
  { short: 'ga̱', full: 'Komal Ga', variant: 'komal' },
  { short: 'Ga', full: 'Shuddha Ga', variant: 'shuddha' },
  { short: 'Ma', full: 'Shuddha Ma', variant: 'shuddha' },
  { short: 'Ma तीव्र', full: 'Tivra Ma (M♯)', variant: 'tivra' },
  { short: 'Pa', full: 'Pa (Pancham)', variant: 'achala' },
  { short: 'dha̱', full: 'Komal Dha', variant: 'komal' },
  { short: 'Dha', full: 'Shuddha Dha', variant: 'shuddha' },
  { short: 'ni̱', full: 'Komal Ni', variant: 'komal' },
  { short: 'Ni', full: 'Shuddha Ni', variant: 'shuddha' },
];

export function isBlackKey(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12;
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}

export function getWesternName(midi: number, includeOctave = true): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return includeOctave ? `${WESTERN_NAMES[pc]}${octave}` : WESTERN_NAMES[pc];
}

export function getYamahaKeyLabel(midi: number): string {
  // On 61-key Yamaha PSR-E373, MIDI 36 is the leftmost C (often referred to as C1 in 61-key manuals or C2 in scientific pitch)
  const pc = ((midi % 12) + 12) % 12;
  const scientificOctave = Math.floor(midi / 12) - 1;
  return `${WESTERN_NAMES[pc]}${scientificOctave}`;
}

export function getSolfegeName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  return SOLFEGE_NAMES[pc];
}

export function getSargamLabel(midi: number, rootSaPitchClass = 0): SargamLabel {
  const diff = midi - (60 + rootSaPitchClass); // relative to Madhya Sa around C4
  const semitone = ((diff % 12) + 12) % 12;
  const octaveOffset = Math.floor(diff / 12);

  const base = SARGAM_SEMITONES[semitone];
  let short = base.short === 'Ma तीव्र' ? "Ma'" : base.short;
  let saptak: SargamLabel['saptak'] = 'madhya';

  if (octaveOffset < 0) {
    saptak = 'mandra';
    short = `${short}̣`; // underdot for lower octave (Mandra Saptak)
  } else if (octaveOffset === 1) {
    saptak = 'taar';
    short = `${short}̇`; // overdot for upper octave (Taar Saptak)
  } else if (octaveOffset > 1) {
    saptak = 'ati';
    short = `${short}̈`;
  }

  return {
    short,
    full: base.full,
    variant: base.variant,
    saptak,
  };
}

export function formatNoteByMode(
  midi: number,
  mode: NotationMode,
  rootSaPitchClass = 0,
  finger?: number
): string {
  switch (mode) {
    case 'sargam':
      return getSargamLabel(midi, rootSaPitchClass).short;
    case 'western':
      return getWesternName(midi, true);
    case 'solfege':
      return getSolfegeName(midi);
    case 'fingers':
      return finger ? `${finger}` : getWesternName(midi, false);
    case 'blind':
      return '';
  }
}

export interface KeyGeometry {
  midi: number;
  isBlack: boolean;
  whiteIndex: number; // index among white keys
  xNormalized: number; // 0..1 left position across total keyboard width
  widthNormalized: number; // 0..1 width across total keyboard width
}

/**
 * Computes exact normalized [0..1] horizontal positions for every MIDI key in [minMidi..maxMidi].
 * Shared between the 61-key Virtual Piano DOM and the 60 FPS HTML5 Canvas Falling-Notes Highway.
 */
export function computeKeyboardGeometry(
  minMidi = PSR_E373_MIN_MIDI,
  maxMidi = PSR_E373_MAX_MIDI
): Map<number, KeyGeometry> {
  const whiteMidis: number[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    if (!isBlackKey(m)) {
      whiteMidis.push(m);
    }
  }

  const totalWhite = whiteMidis.length;
  const whiteWidth = 1 / totalWhite;
  const blackWidth = whiteWidth * 0.62;

  const map = new Map<number, KeyGeometry>();
  let currentWhiteIdx = 0;

  for (let m = minMidi; m <= maxMidi; m++) {
    const black = isBlackKey(m);
    if (!black) {
      map.set(m, {
        midi: m,
        isBlack: false,
        whiteIndex: currentWhiteIdx,
        xNormalized: currentWhiteIdx * whiteWidth,
        widthNormalized: whiteWidth,
      });
      currentWhiteIdx++;
    } else {
      // Position black key slightly offset depending on the semitone in the octave for realistic acoustic spacing
      const pc = ((m % 12) + 12) % 12;
      let offsetRatio = 0.5;
      if (pc === 1) offsetRatio = 0.58; // C# slightly left
      if (pc === 3) offsetRatio = 0.42; // D# slightly right
      if (pc === 6) offsetRatio = 0.60; // F# slightly left
      if (pc === 8) offsetRatio = 0.50; // G# centered
      if (pc === 10) offsetRatio = 0.40; // A# slightly right

      const boundaryX = currentWhiteIdx * whiteWidth;
      map.set(m, {
        midi: m,
        isBlack: true,
        whiteIndex: currentWhiteIdx - 1,
        xNormalized: boundaryX - blackWidth * offsetRatio,
        widthNormalized: blackWidth,
      });
    }
  }

  return map;
}

/**
 * Velocity Heat Color Generator (PSR-E373 Touch Response 1-127):
 * Soft velocity (p, <55) -> Cool Azure/Cyan
 * Medium velocity (mf, 55-85) -> Vibrant Emerald/Teal
 * High velocity (f/ff, >85) -> Warm Amber/Crimson
 */
export function getVelocityHeatColor(velocity: number): {
  bg: string;
  border: string;
  glow: string;
  hex: string;
  dynamicMark: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';
} {
  const v = Math.max(1, Math.min(127, velocity));
  if (v < 35) {
    return {
      bg: 'from-sky-500 to-blue-600',
      border: 'border-sky-300',
      glow: '0 0 16px rgba(56, 189, 248, 0.55)',
      hex: '#38bdf8',
      dynamicMark: 'pp',
    };
  }
  if (v < 58) {
    return {
      bg: 'from-cyan-400 to-sky-500',
      border: 'border-cyan-200',
      glow: '0 0 18px rgba(34, 211, 238, 0.65)',
      hex: '#22d3ee',
      dynamicMark: 'p',
    };
  }
  if (v < 75) {
    return {
      bg: 'from-emerald-400 to-teal-500',
      border: 'border-emerald-200',
      glow: '0 0 20px rgba(52, 211, 153, 0.7)',
      hex: '#34d399',
      dynamicMark: 'mp',
    };
  }
  if (v < 95) {
    return {
      bg: 'from-amber-400 to-orange-500',
      border: 'border-amber-200',
      glow: '0 0 22px rgba(251, 191, 36, 0.8)',
      hex: '#fbbf24',
      dynamicMark: 'mf',
    };
  }
  if (v < 112) {
    return {
      bg: 'from-orange-500 to-rose-500',
      border: 'border-orange-200',
      glow: '0 0 24px rgba(249, 115, 22, 0.85)',
      hex: '#f97316',
      dynamicMark: 'f',
    };
  }
  return {
    bg: 'from-rose-500 to-red-600',
    border: 'border-rose-200',
    glow: '0 0 28px rgba(244, 63, 94, 0.95)',
    hex: '#f43f5e',
    dynamicMark: 'ff',
  };
}

/**
 * Rule-Based Piano Fingering Estimator (1 = Thumb, 5 = Pinky)
 * Accounts for simultaneous chords, thumb-under scale crossings (1-2-3-1-2-3-4-5),
 * hand span limits, and black-key thumb avoidance.
 */
export function estimateFingeringForNotes(notes: ScoreNote[]): ScoreNote[] {
  const result = notes.map((n) => ({ ...n }));

  const assignForHand = (handNotes: ScoreNote[], hand: HandType) => {
    if (handNotes.length === 0) return;
    // Sort by startTime, then midi
    handNotes.sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);

    // Group simultaneous notes (chords within 35ms)
    const groups: ScoreNote[][] = [];
    for (const note of handNotes) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && Math.abs(note.startTime - lastGroup[0].startTime) < 0.035) {
        lastGroup.push(note);
      } else {
        groups.push([note]);
      }
    }

    let prevMidi: number | null = null;
    let prevFinger: 1 | 2 | 3 | 4 | 5 = hand === 'right' ? 1 : 5;

    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const group = groups[gIdx];
      group.sort((a, b) => a.midi - b.midi);

      if (group.length >= 3) {
        // Triad or 4-note chord fingering
        if (hand === 'right') {
          const chordFingers: (1 | 2 | 3 | 4 | 5)[] =
            group.length === 3 ? [1, 3, 5] : [1, 2, 3, 5];
          group.forEach((n, idx) => {
            if (!n.finger) n.finger = chordFingers[Math.min(idx, chordFingers.length - 1)];
          });
          prevMidi = group[group.length - 1].midi;
          prevFinger = 5;
        } else {
          const chordFingers: (1 | 2 | 3 | 4 | 5)[] =
            group.length === 3 ? [5, 3, 1] : [5, 3, 2, 1];
          group.forEach((n, idx) => {
            if (!n.finger) n.finger = chordFingers[Math.min(idx, chordFingers.length - 1)];
          });
          prevMidi = group[0].midi;
          prevFinger = 5;
        }
        continue;
      }

      if (group.length === 2) {
        // Dyad / interval
        const interval = group[1].midi - group[0].midi;
        if (hand === 'right') {
          if (!group[0].finger) group[0].finger = 1;
          if (!group[1].finger) group[1].finger = interval <= 4 ? 3 : 5;
          prevMidi = group[1].midi;
          prevFinger = group[1].finger!;
        } else {
          if (!group[0].finger) group[0].finger = interval <= 4 ? 3 : 5;
          if (!group[1].finger) group[1].finger = 1;
          prevMidi = group[0].midi;
          prevFinger = group[0].finger!;
        }
        continue;
      }

      // Single note melodic voice leading
      const note = group[0];
      if (note.finger) {
        prevMidi = note.midi;
        prevFinger = note.finger;
        continue;
      }

      if (prevMidi === null) {
        note.finger = hand === 'right' ? (isBlackKey(note.midi) ? 2 : 1) : (isBlackKey(note.midi) ? 2 : 5);
        prevMidi = note.midi;
        prevFinger = note.finger;
        continue;
      }

      const diff = note.midi - prevMidi;
      if (diff === 0) {
        note.finger = prevFinger;
      } else if (hand === 'right') {
        if (diff > 0) {
          // Ascending Right Hand
          const step = Math.min(4, Math.max(1, Math.round(diff / 2)));
          let nextF = prevFinger + step;
          // Check if next note continues ascending (thumb-under crossing 1-2-3-1)
          const nextGroup = groups[gIdx + 1];
          const continuesUp = nextGroup && nextGroup[0].midi > note.midi;
          if (prevFinger === 3 && continuesUp && !isBlackKey(note.midi) && diff <= 2) {
            nextF = 1; // Thumb tuck under 3
          } else if (nextF > 5) {
            nextF = isBlackKey(note.midi) ? 2 : 1;
          }
          note.finger = Math.max(1, Math.min(5, nextF)) as 1 | 2 | 3 | 4 | 5;
        } else {
          // Descending Right Hand
          const step = Math.min(4, Math.max(1, Math.round(Math.abs(diff) / 2)));
          let nextF = prevFinger - step;
          if (nextF < 1) {
            nextF = isBlackKey(note.midi) ? 3 : 3; // Cross 3 over 1
          }
          note.finger = Math.max(1, Math.min(5, nextF)) as 1 | 2 | 3 | 4 | 5;
        }
      } else {
        // Left Hand (1 = Thumb on top, 5 = Pinky on bottom)
        if (diff > 0) {
          // Ascending Left Hand (moving from 5 -> 1)
          const step = Math.min(4, Math.max(1, Math.round(diff / 2)));
          let nextF = prevFinger - step;
          if (nextF < 1) {
            nextF = 3; // Cross 3 over thumb
          }
          note.finger = Math.max(1, Math.min(5, nextF)) as 1 | 2 | 3 | 4 | 5;
        } else {
          // Descending Left Hand (moving from 1 -> 5)
          const step = Math.min(4, Math.max(1, Math.round(Math.abs(diff) / 2)));
          let nextF = prevFinger + step;
          if (nextF > 5) {
            nextF = 1;
          }
          note.finger = Math.max(1, Math.min(5, nextF)) as 1 | 2 | 3 | 4 | 5;
        }
      }

      prevMidi = note.midi;
      prevFinger = note.finger;
    }
  };

  assignForHand(
    result.filter((n) => n.hand === 'right'),
    'right'
  );
  assignForHand(
    result.filter((n) => n.hand === 'left'),
    'left'
  );

  return result;
}
