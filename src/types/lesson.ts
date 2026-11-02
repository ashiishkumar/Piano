import { ChordQuality, ChordTargetOptions, ScaleType } from '../engine/theory';

/**
 * The lesson is the unit of content. A `score` lesson wraps the existing SongScore
 * engine unchanged; the other types each get their own player (Sprints 3 and 5).
 */

export type LessonType =
  | 'score'
  | 'concept'
  | 'rhythm'
  | 'chord-drill'
  | 'pattern'
  | 'ear'
  | 'quiz'
  | 'keyboard-task'
  | 'checkpoint';

export type Track = 'play' | 'theory' | 'chords' | 'ear' | 'keyboard' | 'perform';

export const TRACK_LABELS: Record<Track, string> = {
  play: 'Play',
  theory: 'Theory',
  chords: 'Chords',
  ear: 'Ear',
  keyboard: 'Your Keyboard',
  perform: 'Perform',
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  score: 'Play along',
  concept: 'Learn',
  rhythm: 'Rhythm drill',
  'chord-drill': 'Chord drill',
  pattern: 'Pattern',
  ear: 'Ear training',
  quiz: 'Quiz',
  'keyboard-task': 'On your keyboard',
  checkpoint: 'Checkpoint',
};

interface LessonBase {
  /** Stable id, e.g. 'L04.02' */
  id: string;
  /** Display number, e.g. '4.2' */
  code: string;
  levelId: number;
  title: string;
  subtitle?: string;
  track: Track;
  /** Estimated minutes for one pass */
  durationMinutes: number;
  objectives: string[];
  /** Where this came from: 'existing 1.1', 'course 4B', 'spec sheet' */
  source?: string;
  /** Score needed to pass (0-100). Default 70. */
  passScore?: number;
  /** Score needed for mastery (0-100). Default 90. */
  masterScore?: number;
}

/** Lesson that is on the path but has no payload yet. Shown as "coming soon". */
export interface PlannedLesson extends LessonBase {
  type: LessonType;
  status: 'planned';
}

// ---- Payloads -------------------------------------------------------------

export interface ScoreLesson extends LessonBase {
  type: 'score';
  status: 'ready';
  songId: string;
}

export interface KeyboardHighlight {
  midis: number[];
  /** Optional label per midi (finger number, Sargam, interval name) */
  labels?: Record<number, string>;
  colour?: 'green' | 'blue' | 'amber';
}

export interface TryIt {
  prompt: string;
  targetMidis: number[];
  anyOctave?: boolean;
  anyOrder?: boolean;
  /** All targets must be held together (chord) rather than played in sequence */
  together?: boolean;
}

export interface ConceptCard {
  title: string;
  /** Plain text; blank line separates paragraphs. */
  body: string;
  highlight?: KeyboardHighlight;
  tryIt?: TryIt;
  /** Named diagram the player knows how to draw: 'circle-of-fifths', 'panel', 'finger-numbers', 'staff' */
  diagram?: string;
}

export interface ConceptLesson extends LessonBase {
  type: 'concept';
  status: 'ready';
  cards: ConceptCard[];
}

export interface RhythmLesson extends LessonBase {
  type: 'rhythm';
  status: 'ready';
  bpm: number;
  timeSignature: [number, number];
  /** Onsets in beats from the start of the pattern, with durations in beats. */
  pattern: { beat: number; durationBeats: number; label?: string }[];
  repeats: number;
  countInBars: number;
}

export interface ChordSpec {
  rootPc: number;
  quality: ChordQuality;
  /** Preferred inversion for display; matching tolerance comes from options. */
  inversion?: number;
  /** Override the generated symbol, e.g. for Sargam labels */
  label?: string;
  /** Beats to hold when the drill is metronome-locked */
  beats?: number;
}

export interface ChordDrillLesson extends LessonBase {
  type: 'chord-drill';
  status: 'ready';
  sequence: ChordSpec[];
  /** free: no clock, measure transition time. timed: as fast as possible, scored on transitions. metronome: change on the beat. */
  mode: 'free' | 'timed' | 'metronome';
  bpm?: number;
  beatsPerChord?: number;
  match: ChordTargetOptions;
  /** Transition time (ms) that counts as a clean change in free/timed modes */
  targetTransitionMs?: number;
  repeats: number;
}

export interface PatternStep {
  /** Which chord tone: 1 = root, 3, 5, 7, 8 = root an octave up, 10 = third an octave up... */
  tone: number;
  beat: number;
  durationBeats: number;
  hand?: 'left' | 'right';
}

export interface PatternTemplate {
  id: string;
  label: string;
  timeSignature: [number, number];
  steps: PatternStep[];
}

export interface PatternLesson extends LessonBase {
  type: 'pattern';
  status: 'ready';
  /** Patterns the learner can choose from; the first is selected by default */
  templates: PatternTemplate[];
  progression: ChordSpec[];
  bpm: number;
  /** MIDI of the lowest left-hand root, default 48 (C3) */
  rootMidi?: number;
  repeats: number;
  /** Show the grid editor so the learner can build a pattern */
  editor?: boolean;
  /** Offer the progression in other keys */
  allowTranspose?: boolean;
}

export interface EarItem {
  kind: 'note' | 'interval' | 'chord' | 'melody';
  /** Played first as a reference (Sa) when set */
  referenceMidi?: number;
  targetMidis: number[];
  /** For melodies: seconds per note during playback */
  noteSeconds?: number;
  anyOctave?: boolean;
  prompt?: string;
}

export interface EarLesson extends LessonBase {
  type: 'ear';
  status: 'ready';
  items: EarItem[];
  /** How many times the learner may replay before it counts against the score */
  freeReplays: number;
}

export interface QuizQuestion {
  prompt: string;
  kind: 'choice' | 'press-key' | 'press-chord';
  choices?: string[];
  answerIndex?: number;
  answerMidis?: number[];
  anyOctave?: boolean;
  explanation: string;
  /** Notes the learner can hear before answering ("Hear it") */
  playMidis?: number[];
  /** Play them together rather than one after another */
  playAsChord?: boolean;
}

export interface QuizLesson extends LessonBase {
  type: 'quiz';
  status: 'ready';
  questions: QuizQuestion[];
}

/** How the app confirms a keyboard-task step. 'manual' = the learner taps Done. */
export type KeyboardVerification =
  | { kind: 'manual' }
  | { kind: 'any-note' }
  | { kind: 'note-pressed'; midi: number; anyOctave?: boolean }
  | { kind: 'chord-held'; rootPc: number; quality: ChordQuality; options?: ChordTargetOptions }
  | { kind: 'program-change'; program?: number; bankMsb?: number; bankLsb?: number }
  | { kind: 'dual' }
  | { kind: 'split' }
  | { kind: 'style-running' }
  | { kind: 'style-stopped' }
  | { kind: 'clock-running' }
  | { kind: 'sustain'; state: 'down' | 'up' }
  | { kind: 'pitch-bend'; minAbs?: number }
  | { kind: 'touch-response'; expect: 'fixed' | 'variable' }
  | { kind: 'transpose'; pressMidi: number; expectedOffset: number }
  | { kind: 'cc'; controller: number; min?: number; max?: number };

export interface KeyboardTaskStep {
  instruction: string;
  /** Panel region id to highlight on the PSR-E373 diagram, e.g. 'VOICE', 'DUAL', 'ACMP' */
  panelButton?: string;
  /** Shown after the step is verified */
  explanation?: string;
  verify: KeyboardVerification;
}

export interface KeyboardTaskLesson extends LessonBase {
  type: 'keyboard-task';
  status: 'ready';
  steps: KeyboardTaskStep[];
}

export interface CheckpointLesson extends LessonBase {
  type: 'checkpoint';
  status: 'ready';
  parts: { lessonId: string; passScore: number }[];
  /** Pass every part (true) or reach the average passScore (false) */
  passAll: boolean;
}

export type ReadyLesson =
  | ScoreLesson
  | ConceptLesson
  | RhythmLesson
  | ChordDrillLesson
  | PatternLesson
  | EarLesson
  | QuizLesson
  | KeyboardTaskLesson
  | CheckpointLesson;

export type Lesson = ReadyLesson | PlannedLesson;

export function isReady(lesson: Lesson): lesson is ReadyLesson {
  return lesson.status === 'ready';
}

// ---- Levels and the path --------------------------------------------------

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  lessons: Lesson[];
}

/** Scale reference used by generated lessons. */
export interface ScaleSpec {
  rootPc: number;
  type: ScaleType;
}
