import { ScoreNote, SongScore, TeacherLessonGuide } from '../types/music';
import { ChordSpec, PatternStep, PatternTemplate } from '../types/lesson';
import { chordMidis, chordSymbol } from './theory';
import { makeSong } from './sargam';

/**
 * Accompaniment patterns: a template of chord tones on a beat grid, applied to a
 * chord progression in a key, becomes a ScoreNote[] the song engine can play.
 *
 * Tone numbers: 1 root · 3 third · 5 fifth · 7 seventh (fifth if the chord has none)
 * 8 root an octave up · 10 third up · 12 fifth up.
 */

const TONE_INDEX: Record<number, { idx: number; octave: number }> = {
  1: { idx: 0, octave: 0 },
  3: { idx: 1, octave: 0 },
  5: { idx: 2, octave: 0 },
  7: { idx: 3, octave: 0 },
  8: { idx: 0, octave: 1 },
  10: { idx: 1, octave: 1 },
  12: { idx: 2, octave: 1 },
};

export const PATTERN_TONES = [1, 3, 5, 8, 10, 12] as const;

/** Left-hand finger for a chord tone in a root-position voicing. */
const LH_FINGER: Record<number, 1 | 2 | 3 | 4 | 5> = { 1: 5, 3: 3, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1 };
const RH_FINGER: Record<number, 1 | 2 | 3 | 4 | 5> = { 1: 1, 3: 3, 5: 5, 7: 5, 8: 5, 10: 5, 12: 5 };

export function toneMidi(spec: ChordSpec, rootMidi: number, tone: number): number {
  const voicing = chordMidis(rootMidi + spec.rootPc, spec.quality, 0);
  const t = TONE_INDEX[tone] ?? TONE_INDEX[1];
  const idx = Math.min(t.idx, voicing.length - 1);
  return voicing[idx] + t.octave * 12;
}

export interface PatternScoreOptions {
  bpm: number;
  /** Lowest root for the left hand (default 48, C3) */
  rootMidi?: number;
  repeats?: number;
  idPrefix?: string;
  velocity?: number;
}

export function patternBeats(template: PatternTemplate): number {
  const end = Math.max(...template.steps.map((s) => s.beat + s.durationBeats), template.timeSignature[0]);
  return Math.ceil(end / template.timeSignature[0]) * template.timeSignature[0];
}

/** One pass of the template over each chord of the progression, repeated. */
export function generatePatternScore(template: PatternTemplate, progression: ChordSpec[], opts: PatternScoreOptions): ScoreNote[] {
  const spb = 60 / opts.bpm;
  const beatsPerBar = template.timeSignature[0];
  const barBeats = patternBeats(template);
  const rootMidi = opts.rootMidi ?? 48;
  const prefix = opts.idPrefix ?? 'pat';
  const seq = Array.from({ length: opts.repeats ?? 1 }, () => progression).flat();
  const notes: ScoreNote[] = [];
  let n = 0;
  seq.forEach((spec, chordIdx) => {
    const base = chordIdx * barBeats;
    for (const step of template.steps) {
      const hand = step.hand ?? 'left';
      const beat = base + step.beat;
      notes.push({
        id: `${prefix}-${n++}`,
        midi: toneMidi(spec, hand === 'left' ? rootMidi : rootMidi + 12, step.tone),
        startTime: Number((beat * spb).toFixed(4)),
        duration: Number((step.durationBeats * spb).toFixed(4)),
        measure: Math.floor(beat / beatsPerBar) + 1,
        beat: Math.floor(beat % beatsPerBar) + 1,
        hand,
        velocity: opts.velocity ?? (hand === 'left' ? 64 : 84),
        finger: hand === 'left' ? LH_FINGER[step.tone] : RH_FINGER[step.tone],
        chordSymbol: step.beat === 0 ? chordSymbol(spec.rootPc, spec.quality) : undefined,
        articulation: 'normal',
      });
    }
  });
  notes.sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);
  return notes;
}

const PATTERN_GUIDE = (templateLabel: string): TeacherLessonGuide => ({
  whyLearnThis: `The "${templateLabel}" pattern turns a chord into movement. Learn it on one chord, then let it run through the progression.`,
  handPlacement: {
    rightHand: 'Rests in your lap until Step 3; then it plays the chord tones on top.',
    leftHand: 'Little finger on the root of the first chord, one octave below Middle C.',
  },
  whatTeacherExpects: [
    'Step 1: left hand alone, waiting at every note until the shape is in your fingers.',
    'Step 2: left hand in rhythm with the metronome.',
    'Step 3: the same pattern with the right hand adding the chord on top.',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Step 1: Left hand (Wait-for-Me)',
      subtitle: 'Learn the shape',
      whatToExpect: 'Only the left-hand pattern appears. Take all the time you need at each note.',
      handFilter: 'left',
      tier: 'beginner',
      practiceMode: 'wait',
      tempoMultiplier: 0.7,
    },
    {
      stepNumber: 2,
      title: 'Step 2: Left hand in rhythm',
      subtitle: 'Steady pulse',
      whatToExpect: 'The same pattern in time with the click. Keep the fingers close to the keys.',
      handFilter: 'left',
      tier: 'beginner',
      practiceMode: 'rhythm',
      tempoMultiplier: 0.8,
    },
    {
      stepNumber: 3,
      title: 'Step 3: Both hands in rhythm',
      subtitle: 'Chord on top',
      whatToExpect: 'The right hand holds each chord while the left hand keeps the pattern going.',
      handFilter: 'both',
      tier: 'pro',
      practiceMode: 'rhythm',
      tempoMultiplier: 0.85,
    },
  ],
});

export interface PatternSongInput {
  lessonId: string;
  title: string;
  template: PatternTemplate;
  progression: ChordSpec[];
  bpm: number;
  rootMidi?: number;
  repeats?: number;
  /** Pitch class of the key, for the key signature label */
  keyPc?: number;
}

/**
 * A playable song for a pattern lesson: left-hand pattern in every tier, plus
 * right-hand block chords in the pro tier for both-hands practice.
 */
export function buildPatternSong(input: PatternSongInput): SongScore {
  const lh = generatePatternScore(input.template, input.progression, {
    bpm: input.bpm,
    rootMidi: input.rootMidi,
    repeats: input.repeats,
    idPrefix: 'pl',
  });
  const blocks: PatternTemplate = {
    id: 'rh-block',
    label: 'Chord on top',
    timeSignature: input.template.timeSignature,
    steps: [1, 3, 5].map((tone) => ({ tone, beat: 0, durationBeats: patternBeats(input.template), hand: 'right' as const })),
  };
  const rh = generatePatternScore(blocks, input.progression, {
    bpm: input.bpm,
    rootMidi: (input.rootMidi ?? 48) + 12,
    repeats: input.repeats,
    idPrefix: 'pr',
  }).map((n) => ({ ...n, midi: n.midi - 12 }));
  return makeSong(
    {
      id: `pattern:${input.lessonId}:${input.template.id}:${input.progression.map((c) => `${c.rootPc}${c.quality}`).join('-')}`,
      title: input.title,
      subtitle: `${input.template.label} over ${input.progression.map((c) => chordSymbol(c.rootPc, c.quality)).join(' – ')}`,
      composer: 'Pattern (generated)',
      stageId: 6,
      category: 'drill',
      bpm: input.bpm,
      timeSignature: input.template.timeSignature,
      keySignature: chordSymbol(input.keyPc ?? input.progression[0].rootPc, input.progression[0].quality === 'minor' ? 'minor' : 'major'),
      rootSaPitchClass: input.keyPc ?? input.progression[0].rootPc,
      pedagogyFocus: [`The ${input.template.label} pattern`, 'Keeping a left-hand shape while the chord changes'],
      coachTip: 'Keep the hand shape and move the whole hand to the new root. The fingers do not change; the hand does.',
      teacherGuide: PATTERN_GUIDE(input.template.label),
    },
    { beginner: lh, pro: [...lh, ...rh] },
    { beginner: 'Left hand', intermediate: 'Left hand', pro: 'Both hands' }
  );
}

/** Transpose a progression by semitones (pitch classes only). */
export function transposeProgression(progression: ChordSpec[], semitones: number): ChordSpec[] {
  return progression.map((c) => ({ ...c, rootPc: (((c.rootPc + semitones) % 12) + 12) % 12, label: undefined }));
}

/** Validate a user-built template: at least one step, all tones known, nothing past the bar. */
export function validateTemplate(t: PatternTemplate): string | null {
  if (t.steps.length === 0) return 'Add at least one note.';
  for (const s of t.steps) {
    if (!(s.tone in TONE_INDEX)) return `Unknown tone ${s.tone}.`;
    if (s.beat < 0 || s.beat + s.durationBeats > t.timeSignature[0] * 2) return 'A note runs past the end of the pattern.';
    if (s.durationBeats <= 0) return 'A note has no length.';
  }
  return null;
}

export function describeStep(step: PatternStep): string {
  const names: Record<number, string> = { 1: 'root', 3: 'third', 5: 'fifth', 7: 'seventh', 8: 'octave', 10: 'tenth', 12: 'twelfth' };
  return `${names[step.tone] ?? step.tone} on beat ${step.beat + 1}`;
}
