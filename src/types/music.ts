export type HandType = 'left' | 'right';

export type NotationMode = 'sargam' | 'western' | 'solfege' | 'fingers' | 'blind';

export type PracticeMode = 'wait' | 'rhythm';

export type HandPracticeFilter = 'both' | 'right' | 'left';

export type ArrangementTier = 'beginner' | 'intermediate' | 'pro';

export type TimingClassification = 'perfect' | 'good' | 'early' | 'late' | 'missed';

export interface ScoreNote {
  id: string;
  midi: number;            // 36 (C2/C1 on 61-key) to 96 (C7/C6 on 61-key)
  startTime: number;       // seconds at base tempo (1.0x)
  duration: number;        // seconds at base tempo
  measure: number;         // 1-indexed measure number
  beat: number;            // 1-indexed beat within measure
  hand: HandType;
  velocity: number;        // target MIDI velocity 1-127
  finger?: 1 | 2 | 3 | 4 | 5;
  lyric?: string;
  chordSymbol?: string;
  articulation?: 'legato' | 'staccato' | 'normal' | 'accent';
}

export interface SongArrangement {
  tier: ArrangementTier;
  label: string;
  description: string;
  notes: ScoreNote[];
}

export interface LessonPracticeStep {
  stepNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  whatToExpect: string;
  handFilter: HandPracticeFilter;
  tier: ArrangementTier;
  practiceMode: PracticeMode;
  tempoMultiplier: number;
}

export interface TeacherLessonGuide {
  whyLearnThis: string;
  handPlacement: {
    rightHand: string;
    leftHand: string;
  };
  whatTeacherExpects: string[];
  steps: [LessonPracticeStep, LessonPracticeStep, LessonPracticeStep];
}

export interface SongScore {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  stageId: number;         // 1 to 6, or 0 for custom imported songs
  category: 'curriculum' | 'repertoire' | 'imported' | 'drill';
  bpm: number;
  timeSignature: [number, number]; // e.g., [4, 4] or [3, 4]
  keySignature: string;    // e.g., 'C', 'G', 'F', 'Am'
  rootSaMidi: number;      // Pitch class 0-11 for Sa (default 0 = C)
  totalMeasures: number;
  durationSeconds: number;
  pedagogyFocus: string[];
  coachTip: string;
  teacherGuide?: TeacherLessonGuide;
  arrangements: {
    beginner: SongArrangement;
    intermediate: SongArrangement;
    pro: SongArrangement;
  };
}

export interface ActiveMidiNote {
  midi: number;
  velocity: number;        // 1-127
  timestamp: number;       // performance.now()
  channel: number;
  handHint?: HandType;
  source: 'hardware' | 'computer-keyboard' | 'mouse' | 'backing';
}

export interface NoteEvaluationEvent {
  noteId: string;
  expectedMidi: number;
  actualMidi: number;
  hand: HandType;
  measure: number;
  expectedTime: number;    // seconds in song timeline
  actualTime: number;      // seconds in song timeline
  deltaMs: number;         // actual - expected in ms (negative = early/rushing, positive = late/dragging)
  timingClass: TimingClassification;
  expectedVelocity: number;
  actualVelocity: number;
  expectedDuration: number;
  actualDuration?: number;
  durationRatio?: number;  // actualDuration / expectedDuration
  articulationIssue?: 'cut-short' | 'over-held' | 'ok';
  isWrongPitch: boolean;
  isFatFinger: boolean;
  transitionDelayMs?: number; // extra wait delay in Wait-for-Me or chord transition spike
}

export interface CoachingAlert {
  id: string;
  timestamp: number;
  type: 'balance' | 'timing' | 'articulation' | 'posture' | 'pedal' | 'praise';
  title: string;
  message: string;
  measure?: number;
  severity: 'info' | 'warning' | 'success';
}

export interface ProblemSpot {
  measureStart: number;
  measureEnd: number;
  reason: string;
  avgDelayMs: number;
  errorCount: number;
  recommendedBpm: number;
}

export interface PracticeSessionRecord {
  id?: number;
  songId: string;
  songTitle: string;
  stageId: number;
  tier: ArrangementTier;
  practiceMode: PracticeMode;
  timestamp: number;
  durationSeconds: number;
  overallScore: number;         // 0-100
  pitchAccuracy: number;        // 0-100
  timingPrecision: number;      // 0-100
  dynamicControlScore: number;  // 0-100
  avgRhVelocity: number;
  avgLhVelocity: number;
  meanDeltaMs: number;
  timingHistogram: {
    bucketLabel: string;        // e.g., "-100ms", "-50ms", "0ms", "+50ms", "+100ms"
    count: number;
  }[];
  keyErrorCounts: Record<number, number>; // midi -> error count
  keyHitCounts: Record<number, number>;   // midi -> total hit count
  problemSpots: ProblemSpot[];
  prescriptions: {
    title: string;
    description: string;
    measureStart: number;
    measureEnd: number;
    targetBpm: number;
  }[];
}

export interface CurriculumStage {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  skillsUnlocked: string[];
  lessonIds: string[];
}
