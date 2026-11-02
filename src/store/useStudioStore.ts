import { create } from 'zustand';
import {
  ActiveMidiNote,
  ArrangementTier,
  CoachingAlert,
  HandPracticeFilter,
  NotationMode,
  NoteEvaluationEvent,
  PracticeMode,
  PracticeSessionRecord,
  SongScore,
  TimingClassification,
} from '../types/music';
import { ALL_SONGS } from '../content/songs';
import { MidiDeviceInfo, midiManager } from '../services/MIDIManager';
import { audioEngine } from '../services/AudioEngine';
import { db, recordSessionToDb, SongMasteryRecord, UserProfileRecord } from '../db/database';
import { getWesternName } from '../utils/notation';
import { getTeacherGuideForSong } from '../utils/teacherGuidance';
import {
  clusterAtEarliestOnset,
  findCandidates,
  findDueWaitNotes,
  findMissedNotes,
  initialWaitIds,
  isUserNote,
  loopAccuracy,
  resolvePress,
} from '../engine/matching';
import { classifyTiming, computeDeltaMs, evaluateArticulation } from '../engine/timing';
import { summarizeSession } from '../engine/session';
import {
  LessonStatus,
  ProgressMap,
  applyAttempt,
  computeLessonStatuses,
  progressFromSongMastery,
} from '../engine/progress';
import { LEVELS, LESSON_BY_ID, LESSON_BY_SONG_ID } from '../content/path';
import { shouldShowFirstRun } from '../engine/dailyPlan';
import { ReadyLesson } from '../types/lesson';
import { masterScoreOf, passScoreOf } from '../engine/progress';
import {
  AUTO_RAMP_MAX_MULTIPLIER,
  AUTO_RAMP_MIN_ACCURACY,
  AUTO_RAMP_STEP,
  MISSED_DELTA_MS,
  WAIT_HELD_RECENT_MS,
} from '../engine/constants';

export interface LessonResult {
  lessonId: string;
  score: number;
  passed: boolean;
  mastered: boolean;
  /** One line the player wants to say about the attempt, e.g. "6 of 6 chords, 2 wrong tries" */
  summary?: string;
}

export type ViewportLayout = 'split' | 'highway' | 'sheet';
export type StudioTab = 'today' | 'path' | 'lesson' | 'songs' | 'progress' | 'lab';
export type UiComplexityMode = 'guided' | 'pro';

export interface HitBurstParticle {
  id: string;
  midi: number;
  hand: 'left' | 'right';
  classification: TimingClassification;
  deltaMs: number;
  velocity: number;
  timestamp: number;
}

interface StudioState {
  // Navigation & Viewport
  activeTab: StudioTab;
  /** The one-time introduction (keyboard check, Middle C, Sa Re Ga) */
  showFirstRun: boolean;
  uiComplexityMode: UiComplexityMode;
  activeLessonStep: 1 | 2 | 3;
  showLessonBriefingModal: boolean;
  showOnboardingWizard: boolean;
  showFeatureGuideModal: boolean;
  viewportLayout: ViewportLayout;
  keyCountMode: 61 | 88;
  notationMode: NotationMode;
  rootSaPitchClass: number; // 0 = C, 1 = C#, ..., 11 = B
  showHeatmapOverlay: boolean;

  // Hardware & Audio State
  midiInputs: MidiDeviceInfo[];
  midiOutputs: MidiDeviceInfo[];
  activeInputId: string | null;
  activeOutputId: string | null;
  webMidiSupported: boolean;
  lastMidiChannel: number;
  lastLatencyMs: number;
  lastVelocity: number;
  sustainPedalValue: number; // 0..127 (CC 64)
  mutePcSynth: boolean;
  metronomeEnabled: boolean;
  activeNotes: Record<number, ActiveMidiNote>;

  // Song & Practice Engine State
  songs: SongScore[];
  currentSong: SongScore;
  currentTier: ArrangementTier;
  practiceMode: PracticeMode;
  handFilter: HandPracticeFilter;
  autoBacking: boolean;
  isPlaying: boolean;
  currentTime: number; // seconds in base score timeline
  tempoMultiplier: number; // 0.4 to 1.5
  loopEnabled: boolean;
  loopStartMeasure: number;
  loopEndMeasure: number;
  autoRampTempo: boolean;
  waitingForNoteIds: string[];
  waitStartedAtMs: number | null;

  // Real-Time Evaluation & Telemetry State
  matchedNoteIds: Record<string, TimingClassification>;
  sessionEvaluations: NoteEvaluationEvent[];
  activeHoldTracking: Record<
    number,
    { noteId: string; startPerfMs: number; expectedDurSec: number; articulation?: string }
  >;
  keyErrorCounts: Record<number, number>;
  keyHitCounts: Record<number, number>;
  hitBursts: HitBurstParticle[];
  coachingAlerts: CoachingAlert[];
  lastCompletedSession: PracticeSessionRecord | null;
  showReportModal: boolean;

  // Persisted DB caches
  sessionHistory: PracticeSessionRecord[];
  masteryMap: Record<string, SongMasteryRecord>;
  userProfile: UserProfileRecord;

  // Learning path progress (lesson model)
  lessonProgress: ProgressMap;
  lessonStatuses: Record<string, LessonStatus>;
  /** The lesson the current song belongs to, if any */
  currentLessonId: string | null;
  /** A non-song lesson being played (concept, rhythm, chord drill, quiz, keyboard task). Null while a song lesson is open. */
  activeLesson: ReadyLesson | null;
  /** Result card for a finished non-song lesson */
  lessonResult: LessonResult | null;
  /** Bumped every time a lesson is opened so "Try again" gets a fresh player */
  activeLessonNonce: number;

  // Actions
  setActiveTab: (tab: StudioTab) => void;
  setUiComplexityMode: (mode: UiComplexityMode) => void;
  applyLessonStep: (stepNumber: 1 | 2 | 3) => void;
  setShowLessonBriefingModal: (show: boolean) => void;
  setShowOnboardingWizard: (show: boolean) => void;
  setShowFeatureGuideModal: (show: boolean) => void;
  setViewportLayout: (layout: ViewportLayout) => void;
  setKeyCountMode: (mode: 61 | 88) => void;
  setNotationMode: (mode: NotationMode) => void;
  setRootSaPitchClass: (pc: number) => void;
  setShowHeatmapOverlay: (show: boolean) => void;
  setMutePcSynth: (mute: boolean) => void;
  setMetronomeEnabled: (enabled: boolean) => void;

  selectSong: (songId: string, tier?: ArrangementTier) => void;
  setArrangementTier: (tier: ArrangementTier) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setHandFilter: (filter: HandPracticeFilter) => void;
  setAutoBacking: (enabled: boolean) => void;
  setTempoMultiplier: (mult: number) => void;
  setLoopConfig: (enabled: boolean, startM: number, endM: number, autoRamp?: boolean) => void;
  launchPrescriptionDrill: (songId: string, startMeasure: number, endMeasure: number, targetBpm: number) => void;

  togglePlay: () => void;
  restartSong: () => void;
  seekToMeasure: (measure: number) => void;
  tickTimeline: (dtRealSeconds: number) => void;
  handleIncomingMidiEvent: (
    type: 'noteon' | 'noteoff' | 'sustain',
    midi: number,
    velocity: number,
    channel: number,
    latencyMs: number,
    source: 'hardware' | 'computer-keyboard' | 'mouse'
  ) => void;
  finishAndSaveSession: () => Promise<void>;
  closeReportModal: () => void;
  addImportedSong: (song: SongScore) => Promise<void>;
  loadPersistedData: () => Promise<void>;
  /** Record an attempt at a lesson and recompute path statuses. */
  recordLessonResult: (lessonId: string, score: number) => Promise<void>;
  /** Open a lesson from the path. Score lessons load their song; other types are not playable yet. */
  openLesson: (lessonId: string) => void;
  /** Open a lesson and go straight to playing, skipping the briefing (used by "Continue"). */
  startLesson: (lessonId: string) => void;
  /** A type player reports its final score; progress is recorded and the result card shown. */
  finishActiveLesson: (score: number, summary?: string) => Promise<void>;
  /** Play a song built on the fly (pattern lessons) in the song engine, crediting the given lesson. */
  playGeneratedSong: (song: SongScore, lessonId: string) => void;
  closeLessonResult: () => void;
  completeFirstRun: () => Promise<void>;
  replayFirstRun: () => void;
}

const DEFAULT_PROFILE: UserProfileRecord = {
  id: 'default',
  xp: 240,
  streakDays: 1,
  lastPracticeDate: new Date().toISOString().slice(0, 10),
  totalPracticeSeconds: 0,
  cumulativeKeyErrors: {},
  cumulativeKeyHits: {},
};

// Track which backing notes & metronome beats have already been triggered in the current pass
const triggeredBackingIds = new Set<string>();
let lastMetronomeBeatIndex = -1;

export const useStudioStore = create<StudioState>((set, get) => ({
  activeTab: 'today',
  showFirstRun: false,
  uiComplexityMode: 'guided',
  activeLessonStep: 1,
  showLessonBriefingModal: false,
  showOnboardingWizard: false,
  showFeatureGuideModal: false,
  viewportLayout: 'highway',
  keyCountMode: 61,
  notationMode: 'sargam',
  rootSaPitchClass: 0,
  showHeatmapOverlay: false,

  midiInputs: [],
  midiOutputs: [],
  activeInputId: null,
  activeOutputId: null,
  webMidiSupported: false,
  lastMidiChannel: 1,
  lastLatencyMs: 1.4,
  lastVelocity: 82,
  sustainPedalValue: 0,
  mutePcSynth: false,
  metronomeEnabled: true,
  activeNotes: {},

  songs: ALL_SONGS,
  currentSong: ALL_SONGS[0],
  currentTier: 'beginner',
  practiceMode: 'wait',
  handFilter: 'right',
  autoBacking: true,
  isPlaying: true,
  currentTime: 0,
  tempoMultiplier: 0.75,
  loopEnabled: false,
  loopStartMeasure: 1,
  loopEndMeasure: ALL_SONGS[0].totalMeasures,
  autoRampTempo: false,
  waitingForNoteIds: initialWaitIds(ALL_SONGS[0].arrangements.beginner.notes, 'right'),
  waitStartedAtMs: performance.now(),

  matchedNoteIds: {},
  sessionEvaluations: [],
  activeHoldTracking: {},
  keyErrorCounts: {},
  keyHitCounts: {},
  hitBursts: [],
  coachingAlerts: [
    {
      id: 'welcome-tip',
      timestamp: Date.now(),
      type: 'posture',
      title: 'Step 1: Right Hand Only (Wait-for-Me)',
      message: ALL_SONGS[0].coachTip,
      severity: 'info',
    },
  ],
  lastCompletedSession: null,
  showReportModal: false,

  sessionHistory: [],
  masteryMap: {},
  userProfile: DEFAULT_PROFILE,

  lessonProgress: {},
  lessonStatuses: computeLessonStatuses(LEVELS, {}),
  currentLessonId: LESSON_BY_SONG_ID[ALL_SONGS[0].id]?.id ?? null,
  activeLesson: null,
  lessonResult: null,
  activeLessonNonce: 0,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUiComplexityMode: (mode) =>
    set((s) => ({
      uiComplexityMode: mode,
      viewportLayout: mode === 'pro' ? 'split' : 'highway',
      showHeatmapOverlay: mode === 'guided' ? false : s.showHeatmapOverlay,
      lessonStatuses: computeLessonStatuses(LEVELS, s.lessonProgress, { unlockAll: mode === 'pro' }),
    })),

  applyLessonStep: (stepNumber) => {
    const state = get();
    const guide = getTeacherGuideForSong(state.currentSong);
    const stepConfig = guide.steps[stepNumber - 1];
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    audioEngine.panic();

    const startIds = initialWaitIds(
      state.currentSong.arrangements[stepConfig.tier].notes,
      stepConfig.handFilter
    );

    set({
      activeLessonStep: stepNumber,
      handFilter: stepConfig.handFilter,
      currentTier: stepConfig.tier,
      practiceMode: stepConfig.practiceMode,
      tempoMultiplier: stepConfig.tempoMultiplier,
      isPlaying: true,
      currentTime: 0,
      waitingForNoteIds: stepConfig.practiceMode === 'wait' ? startIds : [],
      waitStartedAtMs: stepConfig.practiceMode === 'wait' ? performance.now() : null,
      matchedNoteIds: {},
      sessionEvaluations: [],
      activeHoldTracking: {},
      hitBursts: [],
      coachingAlerts: [
        {
          id: `step-${Date.now()}`,
          timestamp: Date.now(),
          type: 'posture',
          title: stepConfig.title,
          message: stepConfig.whatToExpect,
          severity: 'info',
        },
      ],
    });
  },

  setShowLessonBriefingModal: (show) => set({ showLessonBriefingModal: show }),
  setShowOnboardingWizard: (show) => set({ showOnboardingWizard: show }),
  setShowFeatureGuideModal: (show) => set({ showFeatureGuideModal: show }),
  setViewportLayout: (layout) => set({ viewportLayout: layout }),
  setKeyCountMode: (mode) => set({ keyCountMode: mode }),
  setNotationMode: (mode) => set({ notationMode: mode }),
  setRootSaPitchClass: (pc) => set({ rootSaPitchClass: ((pc % 12) + 12) % 12 }),
  setShowHeatmapOverlay: (show) => set({ showHeatmapOverlay: show }),

  setMutePcSynth: (mute) => {
    audioEngine.setMutePcSynth(mute);
    set({ mutePcSynth: mute });
  },

  setMetronomeEnabled: (enabled) => set({ metronomeEnabled: enabled }),

  selectSong: (songId, tier) => {
    const state = get();
    const found = state.songs.find((s) => s.id === songId) || state.songs[0];
    const guide = getTeacherGuideForSong(found);

    // If user didn't force a specific tier, start gently at Step 1 (Right Hand Only, Wait-for-Me)
    const stepNumber: 1 | 2 | 3 = tier === 'pro' ? 3 : tier === 'intermediate' ? 2 : 1;
    const stepCfg = guide.steps[stepNumber - 1];
    const nextTier = tier || stepCfg.tier;
    const nextHandFilter = tier ? (tier === 'beginner' && found.stageId === 1 ? 'right' : 'both') : stepCfg.handFilter;
    const nextPracticeMode = state.uiComplexityMode === 'guided' && !tier ? stepCfg.practiceMode : state.practiceMode;
    const nextTempo = state.uiComplexityMode === 'guided' && !tier ? stepCfg.tempoMultiplier : state.tempoMultiplier;

    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    audioEngine.panic();

    const startIds = initialWaitIds(found.arrangements[nextTier].notes, nextHandFilter);

    set({
      currentSong: found,
      currentLessonId: LESSON_BY_SONG_ID[found.id]?.id ?? null,
      activeLesson: null,
      lessonResult: null,
      activeLessonStep: stepNumber,
      currentTier: nextTier,
      handFilter: nextHandFilter,
      practiceMode: nextPracticeMode,
      tempoMultiplier: nextTempo,
      isPlaying: nextPracticeMode === 'wait',
      currentTime: 0,
      loopEnabled: false,
      loopStartMeasure: 1,
      loopEndMeasure: found.totalMeasures,
      waitingForNoteIds: nextPracticeMode === 'wait' ? startIds : [],
      waitStartedAtMs: nextPracticeMode === 'wait' ? performance.now() : null,
      matchedNoteIds: {},
      sessionEvaluations: [],
      activeHoldTracking: {},
      keyErrorCounts: {},
      keyHitCounts: {},
      hitBursts: [],
      activeTab: 'lesson',
      showLessonBriefingModal: true,
      coachingAlerts: [
        {
          id: `coach-${Date.now()}`,
          timestamp: Date.now(),
          type: 'posture',
          title: `Pedagogy Focus: ${found.pedagogyFocus[0] || 'Technique'}`,
          message: found.coachTip,
          severity: 'info',
        },
      ],
    });
  },

  setArrangementTier: (tier) => {
    const state = get();
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    const startIds = initialWaitIds(state.currentSong.arrangements[tier].notes, state.handFilter);

    set({
      currentTier: tier,
      isPlaying: state.practiceMode === 'wait',
      currentTime: 0,
      waitingForNoteIds: state.practiceMode === 'wait' ? startIds : [],
      waitStartedAtMs: state.practiceMode === 'wait' ? performance.now() : null,
      matchedNoteIds: {},
      sessionEvaluations: [],
    });
  },

  setPracticeMode: (mode) =>
    set((s) => ({
      practiceMode: mode,
      isPlaying: mode === 'wait' ? true : s.isPlaying,
      waitingForNoteIds: [],
      waitStartedAtMs: null,
    })),

  setHandFilter: (filter) =>
    set({
      handFilter: filter,
      waitingForNoteIds: [],
      waitStartedAtMs: null,
    }),

  setAutoBacking: (enabled) => set({ autoBacking: enabled }),

  setTempoMultiplier: (mult) =>
    set({ tempoMultiplier: Math.max(0.35, Math.min(1.6, Number(mult.toFixed(2)))) }),

  setLoopConfig: (enabled, startM, endM, autoRamp) => {
    const song = get().currentSong;
    const validStart = Math.max(1, Math.min(song.totalMeasures, startM));
    const validEnd = Math.max(validStart, Math.min(song.totalMeasures, endM));
    set((s) => ({
      loopEnabled: enabled,
      loopStartMeasure: validStart,
      loopEndMeasure: validEnd,
      autoRampTempo: autoRamp !== undefined ? autoRamp : s.autoRampTempo,
    }));
  },

  launchPrescriptionDrill: (songId, startMeasure, endMeasure, targetBpm) => {
    const state = get();
    const found = state.songs.find((s) => s.id === songId) || state.currentSong;
    const spb = 60 / found.bpm;
    const spm = spb * found.timeSignature[0];
    const mult = Math.max(0.45, Math.min(1.25, targetBpm / found.bpm));
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;

    set({
      currentSong: found,
      activeTab: 'lesson',
      showReportModal: false,
      loopEnabled: true,
      loopStartMeasure: startMeasure,
      loopEndMeasure: endMeasure,
      autoRampTempo: true,
      tempoMultiplier: Number(mult.toFixed(2)),
      currentTime: (startMeasure - 1) * spm,
      isPlaying: true,
      matchedNoteIds: {},
      sessionEvaluations: [],
      waitingForNoteIds: [],
      waitStartedAtMs: null,
      coachingAlerts: [
        {
          id: `drill-${Date.now()}`,
          timestamp: Date.now(),
          type: 'timing',
          title: `Targeted Loop Drill: Measures ${startMeasure}�${endMeasure}`,
          message: `Auto-Ramp Speed Trainer active at ${Math.round(found.bpm * mult)} BPM. Achieve >=95% accuracy on the loop to auto-advance tempo by +5%!`,
          measure: startMeasure,
          severity: 'info',
        },
      ],
    });
  },

  togglePlay: () => {
    const state = get();
    audioEngine.init().catch(() => {});
    if (!state.isPlaying && state.currentTime >= state.currentSong.durationSeconds - 0.05) {
      triggeredBackingIds.clear();
      lastMetronomeBeatIndex = -1;
      set({
        isPlaying: true,
        currentTime: 0,
        matchedNoteIds: {},
        sessionEvaluations: [],
        waitingForNoteIds: [],
        waitStartedAtMs: null,
      });
    } else {
      set({ isPlaying: !state.isPlaying, waitStartedAtMs: null });
    }
  },

  restartSong: () => {
    const state = get();
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    audioEngine.panic();
    const spb = 60 / state.currentSong.bpm;
    const spm = spb * state.currentSong.timeSignature[0];
    const startSec = state.loopEnabled ? (state.loopStartMeasure - 1) * spm : 0;

    set({
      currentTime: startSec,
      waitingForNoteIds: [],
      waitStartedAtMs: null,
      matchedNoteIds: {},
      sessionEvaluations: [],
      activeHoldTracking: {},
      keyErrorCounts: {},
      keyHitCounts: {},
      hitBursts: [],
    });
  },

  seekToMeasure: (measure) => {
    const state = get();
    const clampedM = Math.max(1, Math.min(state.currentSong.totalMeasures, measure));
    const spb = 60 / state.currentSong.bpm;
    const spm = spb * state.currentSong.timeSignature[0];
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    set({
      currentTime: (clampedM - 1) * spm,
      waitingForNoteIds: [],
      waitStartedAtMs: null,
    });
  },

  tickTimeline: (dtRealSeconds) => {
    const state = get();
    if (!state.isPlaying) return;

    const song = state.currentSong;
    const arrangement = song.arrangements[state.currentTier];
    const notes = arrangement.notes;
    const spb = 60 / song.bpm;
    const spm = spb * song.timeSignature[0];

    // 1. In "Wait-for-Me" Flow Mode, check if any unmatched user note has reached its startTime
    if (state.practiceMode === 'wait') {
      const dueNotes = findDueWaitNotes(
        notes,
        state.currentTime,
        state.matchedNoteIds,
        state.handFilter
      );

      if (dueNotes.length > 0) {
        const chordCluster = clusterAtEarliestOnset(dueNotes);
        const earliestOnset = Math.min(...chordCluster.map((d) => d.startTime));

        // If user is already holding any of the chord notes (e.g. pressed simultaneously or at t=0), mark them matched
        const nowPerf = performance.now();
        const autoMatched: Record<string, TimingClassification> = {};
        for (const d of chordCluster) {
          if (!state.matchedNoteIds[d.id]) {
            const held = state.activeNotes[d.midi];
            if (held && (earliestOnset === 0 || nowPerf - held.timestamp < WAIT_HELD_RECENT_MS)) {
              autoMatched[d.id] = 'perfect';
            }
          }
        }

        const mergedMatched =
          Object.keys(autoMatched).length > 0
            ? { ...state.matchedNoteIds, ...autoMatched }
            : state.matchedNoteIds;

        const unmetIds = chordCluster
          .filter((d) => !mergedMatched[d.id])
          .map((d) => d.id);

        if (unmetIds.length > 0) {
          // Freeze timeline strictly at earliestOnset until user presses required pitches
          set({
            currentTime: earliestOnset,
            matchedNoteIds: mergedMatched,
            waitingForNoteIds: unmetIds,
            waitStartedAtMs: state.waitStartedAtMs ?? nowPerf,
          });
          return;
        } else if (Object.keys(autoMatched).length > 0) {
          set({ matchedNoteIds: mergedMatched, waitingForNoteIds: [] });
        }
      }
    }

    // Advance score timeline by dtRealSeconds * tempoMultiplier
    const deltaScoreSec = dtRealSeconds * state.tempoMultiplier;
    const nextTime = state.currentTime + deltaScoreSec;

    // 2. Metronome Click Engine
    if (state.metronomeEnabled) {
      const beatIndex = Math.floor(nextTime / spb);
      if (beatIndex > lastMetronomeBeatIndex && nextTime < song.durationSeconds) {
        lastMetronomeBeatIndex = beatIndex;
        const isDownbeat = beatIndex % song.timeSignature[0] === 0;
        audioEngine.playMetronomeClick(isDownbeat);
      }
    }

    // 3. Auto-Accompaniment Backing Track Generator
    for (const n of notes) {
      const shouldAutoPlay =
        state.autoBacking && state.handFilter !== 'both' && n.hand !== state.handFilter;
      if (
        shouldAutoPlay &&
        !triggeredBackingIds.has(n.id) &&
        n.startTime <= nextTime &&
        n.startTime >= state.currentTime - 0.05
      ) {
        triggeredBackingIds.add(n.id);
        audioEngine.noteOn(n.midi, n.velocity, true);
        midiManager.sendHardwareNoteOn(n.midi, n.velocity, 2);

        const releaseMs = Math.max(120, (n.duration / state.tempoMultiplier) * 950);
        setTimeout(() => {
          audioEngine.noteOff(n.midi);
          midiManager.sendHardwareNoteOff(n.midi, 2);
        }, releaseMs);
      }
    }

    // 4. In Strict Rhythm Mode, mark overdue unmatched notes (>160ms late) as 'missed'
    if (state.practiceMode === 'rhythm') {
      const newlyMissed: Record<string, TimingClassification> = {};
      const newEvals: NoteEvaluationEvent[] = [];
      const newKeyErrors = { ...state.keyErrorCounts };

      for (const n of findMissedNotes(
        notes,
        nextTime,
        state.matchedNoteIds,
        state.handFilter,
        state.tempoMultiplier
      )) {
        newlyMissed[n.id] = 'missed';
        newKeyErrors[n.midi] = (newKeyErrors[n.midi] || 0) + 1;
        newEvals.push({
          noteId: n.id,
          expectedMidi: n.midi,
          actualMidi: -1,
          hand: n.hand,
          measure: n.measure,
          expectedTime: n.startTime,
          actualTime: nextTime,
          deltaMs: MISSED_DELTA_MS,
          timingClass: 'missed',
          expectedVelocity: n.velocity,
          actualVelocity: 0,
          expectedDuration: n.duration,
          isWrongPitch: true,
          isFatFinger: false,
        });
      }

      if (Object.keys(newlyMissed).length > 0) {
        set((s) => ({
          matchedNoteIds: { ...s.matchedNoteIds, ...newlyMissed },
          sessionEvaluations: [...s.sessionEvaluations, ...newEvals],
          keyErrorCounts: newKeyErrors,
        }));
      }
    }

    // 5. Handle A-B Measure Loop Boundary & Speed Trainer Auto-Ramp
    const loopStartSec = (state.loopStartMeasure - 1) * spm;
    const loopEndSec = state.loopEndMeasure * spm;

    if (state.loopEnabled && nextTime >= Math.min(loopEndSec, song.durationSeconds)) {
      // Evaluate loop accuracy for Auto-Ramp Speed Trainer
      const { loopNotes, accuracy } = loopAccuracy(
        notes,
        state.matchedNoteIds,
        state.handFilter,
        state.loopStartMeasure,
        state.loopEndMeasure
      );

      let nextMult = state.tempoMultiplier;
      const alerts = [...state.coachingAlerts];

      if (
        state.autoRampTempo &&
        accuracy >= AUTO_RAMP_MIN_ACCURACY &&
        state.tempoMultiplier < AUTO_RAMP_MAX_MULTIPLIER
      ) {
        nextMult = Number(
          Math.min(AUTO_RAMP_MAX_MULTIPLIER, state.tempoMultiplier + AUTO_RAMP_STEP).toFixed(2)
        );
        alerts.unshift({
          id: `ramp-${Date.now()}`,
          timestamp: Date.now(),
          type: 'praise',
          title: `Speed Trainer +5% -> ${Math.round(song.bpm * nextMult)} BPM!`,
          message: `You achieved ${Math.round(accuracy)}% accuracy on Measures ${state.loopStartMeasure}�${state.loopEndMeasure}. Tempo automatically increased!`,
          measure: state.loopStartMeasure,
          severity: 'success',
        });
      }

      // Clear matched statuses for notes inside the loop so the next pass can be played fresh
      const remainingMatched = { ...state.matchedNoteIds };
      for (const ln of loopNotes) {
        delete remainingMatched[ln.id];
      }
      triggeredBackingIds.clear();
      lastMetronomeBeatIndex = Math.floor(loopStartSec / spb) - 1;

      set({
        currentTime: loopStartSec,
        tempoMultiplier: nextMult,
        matchedNoteIds: remainingMatched,
        waitingForNoteIds: [],
        waitStartedAtMs: null,
        coachingAlerts: alerts.slice(0, 8),
      });
      return;
    }

    // 6. Check End of Song
    if (nextTime >= song.durationSeconds + 0.25) {
      set({ isPlaying: false, currentTime: song.durationSeconds });
      get().finishAndSaveSession();
      return;
    }

    set({
      currentTime: nextTime,
      waitingForNoteIds: [],
    });
  },

  handleIncomingMidiEvent: (type, midi, velocity, channel, latencyMs, source) => {
    const state = get();
    const nowPerf = performance.now();

    if (type === 'sustain') {
      set({ sustainPedalValue: velocity, lastMidiChannel: channel, lastLatencyMs: latencyMs });
      return;
    }

    if (type === 'noteoff') {
      const nextActive = { ...state.activeNotes };
      delete nextActive[midi];

      // Check Note Duration & Articulation Telemetry on Note Off
      const holdInfo = state.activeHoldTracking[midi];
      if (holdInfo) {
        const art = evaluateArticulation(
          (nowPerf - holdInfo.startPerfMs) / 1000,
          holdInfo.expectedDurSec,
          state.tempoMultiplier,
          holdInfo.articulation
        );

        const updatedEvals = state.sessionEvaluations.map((ev) =>
          ev.noteId === holdInfo.noteId
            ? {
                ...ev,
                actualDuration: art.heldSec,
                durationRatio: art.ratio,
                articulationIssue: art.issue,
              }
            : ev
        );
        const nextHolds = { ...state.activeHoldTracking };
        delete nextHolds[midi];
        set({
          activeNotes: nextActive,
          activeHoldTracking: nextHolds,
          sessionEvaluations: updatedEvals,
        });
      } else {
        set({ activeNotes: nextActive });
      }
      return;
    }

    // Handle Note On
    const activeNoteObj: ActiveMidiNote = {
      midi,
      velocity,
      timestamp: nowPerf,
      channel,
      source,
      handHint: midi >= 60 ? 'right' : 'left',
    };

    const nextActiveNotes = { ...state.activeNotes, [midi]: activeNoteObj };
    const nextKeyHits = {
      ...state.keyHitCounts,
      [midi]: (state.keyHitCounts[midi] || 0) + 1,
    };

    // Keys pressed anywhere but the song lesson screen are free play: light the key,
    // report what was heard, but never score a song behind the scenes. Type players
    // (concept, rhythm, chord drill, quiz, keyboard task) listen to MIDI directly.
    if (state.activeTab !== 'lesson' || state.activeLesson) {
      set({
        activeNotes: nextActiveNotes,
        lastMidiChannel: channel,
        lastLatencyMs: latencyMs,
        lastVelocity: velocity,
      });
      return;
    }

    const song = state.currentSong;
    const notes = song.arrangements[state.currentTier].notes;

    const candidates = findCandidates({
      notes,
      currentTime: state.currentTime,
      matched: state.matchedNoteIds,
      handFilter: state.handFilter,
      mode: state.practiceMode,
    });
    const resolution = resolvePress(candidates, midi, state.practiceMode);

    if (resolution.kind === 'match') {
      const exactMatch = resolution.note;
      const isOctaveShiftedMatch = resolution.octaveShifted;

      // Micro-timing drift in milliseconds (reaction time in wait mode, beat drift in rhythm mode)
      const rawDeltaMs = computeDeltaMs({
        mode: state.practiceMode,
        nowPerfMs: nowPerf,
        waitStartedAtMs: state.waitStartedAtMs,
        currentTime: state.currentTime,
        noteStartTime: exactMatch.startTime,
        tempoMultiplier: state.tempoMultiplier,
      });
      const timingClass = classifyTiming(state.practiceMode, rawDeltaMs);

      const evalEvent: NoteEvaluationEvent = {
        noteId: exactMatch.id,
        expectedMidi: exactMatch.midi,
        actualMidi: midi,
        hand: exactMatch.hand,
        measure: exactMatch.measure,
        expectedTime: exactMatch.startTime,
        actualTime: state.currentTime,
        deltaMs: rawDeltaMs,
        timingClass,
        expectedVelocity: exactMatch.velocity,
        actualVelocity: velocity,
        expectedDuration: exactMatch.duration,
        isWrongPitch: false,
        isFatFinger: false,
        transitionDelayMs:
          state.practiceMode === 'wait' && state.waitStartedAtMs
            ? Math.round(nowPerf - state.waitStartedAtMs)
            : Math.max(0, rawDeltaMs),
      };

      const nextMatched: Record<string, TimingClassification> = {
        ...state.matchedNoteIds,
        [exactMatch.id]: timingClass,
      };

      // Also check if any other currently held physical keys satisfy remaining notes in this chord cluster
      for (const cand of candidates) {
        if (!nextMatched[cand.id]) {
          const heldExact = nextActiveNotes[cand.midi];
          if (heldExact) {
            nextMatched[cand.id] = 'perfect';
          }
        }
      }

      const remainingClusterIds = candidates
        .filter((c) => !nextMatched[c.id])
        .map((c) => c.id);

      const nextEvals = [...state.sessionEvaluations, evalEvent];

      // Check Touch Dynamics & Left/Right Hand Velocity Balance (Module C.4)
      const recentRh = nextEvals.filter((e) => !e.isWrongPitch && e.hand === 'right').slice(-5);
      const recentLh = nextEvals.filter((e) => !e.isWrongPitch && e.hand === 'left').slice(-5);
      const nextAlerts = [...state.coachingAlerts];

      if (isOctaveShiftedMatch) {
        nextAlerts.unshift({
          id: `oct-${Date.now()}`,
          timestamp: Date.now(),
          type: 'posture',
          title: `Octave Note: Played ${getWesternName(midi)} for ${getWesternName(exactMatch.midi)}`,
          message: `Right note name (${getWesternName(midi, false)}), shifted octave! Target ${getWesternName(exactMatch.midi)} is ${
            exactMatch.midi > midi ? 'higher (to the right)' : 'lower (to the left)'
          } on your PSR-E373.`,
          measure: exactMatch.measure,
          severity: 'info',
        });
      } else if (recentRh.length >= 3 && recentLh.length >= 3) {
        const avgRh = recentRh.reduce((s, e) => s + e.actualVelocity, 0) / recentRh.length;
        const avgLh = recentLh.reduce((s, e) => s + e.actualVelocity, 0) / recentLh.length;
        if (avgLh > avgRh - 6 && (!nextAlerts[0] || nextAlerts[0].type !== 'balance')) {
          nextAlerts.unshift({
            id: `bal-${Date.now()}`,
            timestamp: Date.now(),
            type: 'balance',
            title: 'Hand Balance Alert (LH Overpowering RH)',
            message: `Tip: Lighten your Left Hand chord touch (currently ~${Math.round(avgLh)})�keep LH velocity around 55�65 and RH melody around 80�95.`,
            measure: exactMatch.measure,
            severity: 'warning',
          });
        }
      }

      const burst: HitBurstParticle = {
        id: `burst-${nowPerf}-${exactMatch.midi}`,
        midi: exactMatch.midi,
        hand: exactMatch.hand,
        classification: timingClass,
        deltaMs: rawDeltaMs,
        velocity,
        timestamp: nowPerf,
      };

      const nextCurrentTime =
        state.practiceMode === 'wait' && exactMatch.startTime > state.currentTime
          ? exactMatch.startTime
          : state.currentTime;

      set({
        isPlaying: state.activeTab === 'lesson' ? true : state.isPlaying,
        currentTime: nextCurrentTime,
        activeNotes: nextActiveNotes,
        lastMidiChannel: channel,
        lastLatencyMs: latencyMs,
        lastVelocity: velocity,
        keyHitCounts: nextKeyHits,
        matchedNoteIds: nextMatched,
        waitingForNoteIds: remainingClusterIds,
        waitStartedAtMs: remainingClusterIds.length === 0 ? null : state.waitStartedAtMs,
        sessionEvaluations: nextEvals,
        activeHoldTracking: {
          ...state.activeHoldTracking,
          [midi]: {
            noteId: exactMatch.id,
            startPerfMs: nowPerf,
            expectedDurSec: exactMatch.duration,
            articulation: exactMatch.articulation,
          },
        },
        hitBursts: [...state.hitBursts.slice(-18), burst],
        coachingAlerts: nextAlerts.slice(0, 8),
      });
    } else if (resolution.kind === 'wrong' && state.isPlaying) {
      // User pressed a wrong key while playing. The engine tells us the nearest intended note
      // and whether this was an adjacent-key slip.
      const nearestTarget = resolution.nearest;
      const isFatFinger = resolution.isFatFinger;

      const wrongEval: NoteEvaluationEvent = {
        noteId: `wrong-${nowPerf}`,
        expectedMidi: nearestTarget.midi,
        actualMidi: midi,
        hand: nearestTarget.hand,
        measure: nearestTarget.measure,
        expectedTime: nearestTarget.startTime,
        actualTime: state.currentTime,
        deltaMs: 0,
        timingClass: 'missed',
        expectedVelocity: nearestTarget.velocity,
        actualVelocity: velocity,
        expectedDuration: nearestTarget.duration,
        isWrongPitch: true,
        isFatFinger,
      };

      const nextKeyErrors = {
        ...state.keyErrorCounts,
        [nearestTarget.midi]: (state.keyErrorCounts[nearestTarget.midi] || 0) + 1,
        [midi]: (state.keyErrorCounts[midi] || 0) + 1,
      };

      const nextAlerts = [...state.coachingAlerts];
      if (isFatFinger) {
        nextAlerts.unshift({
          id: `fat-${Date.now()}`,
          timestamp: Date.now(),
          type: 'posture',
          title: `Adjacent Key Slip (${getWesternName(midi)} vs ${getWesternName(nearestTarget.midi)})`,
          message: `You grazed ${getWesternName(midi)} instead of ${getWesternName(nearestTarget.midi)} in Measure ${nearestTarget.measure}. Curve your fingers slightly to center on the key.`,
          measure: nearestTarget.measure,
          severity: 'warning',
        });
      }

      set({
        activeNotes: nextActiveNotes,
        lastMidiChannel: channel,
        lastLatencyMs: latencyMs,
        lastVelocity: velocity,
        keyHitCounts: nextKeyHits,
        keyErrorCounts: nextKeyErrors,
        sessionEvaluations: [...state.sessionEvaluations, wrongEval],
        coachingAlerts: nextAlerts.slice(0, 8),
      });
    } else {
      // Free-play on the 61-key keyboard when song is paused
      set({
        activeNotes: nextActiveNotes,
        lastMidiChannel: channel,
        lastLatencyMs: latencyMs,
        lastVelocity: velocity,
        keyHitCounts: nextKeyHits,
      });
    }
  },

  finishAndSaveSession: async () => {
    const state = get();
    const record = summarizeSession({
      song: state.currentSong,
      tier: state.currentTier,
      practiceMode: state.practiceMode,
      tempoMultiplier: state.tempoMultiplier,
      evaluations: state.sessionEvaluations,
      keyErrorCounts: state.keyErrorCounts,
      keyHitCounts: state.keyHitCounts,
      timestamp: Date.now(),
    });
    if (!record) return;

    await recordSessionToDb(record);
    // Credit the lesson: a path song maps by song id; a generated song (pattern lesson) by the lesson that built it.
    const lessonId = LESSON_BY_SONG_ID[record.songId]?.id ?? (record.songId.startsWith('pattern:') ? state.currentLessonId : null);
    if (lessonId) {
      await get().recordLessonResult(lessonId, record.overallScore);
    }
    await get().loadPersistedData();
    set({
      lastCompletedSession: record,
      showReportModal: true,
    });
  },

  recordLessonResult: async (lessonId, score) => {
    const lesson = LESSON_BY_ID[lessonId];
    if (!lesson) return;
    const state = get();
    const next = applyAttempt(state.lessonProgress[lessonId], lesson, score, Date.now());
    try {
      await db.lessonProgress.put(next);
    } catch {
      // IndexedDB unavailable: keep the in-memory copy
    }
    const lessonProgress = { ...state.lessonProgress, [lessonId]: next };
    set({
      lessonProgress,
      lessonStatuses: computeLessonStatuses(LEVELS, lessonProgress, {
        unlockAll: state.uiComplexityMode === 'pro',
      }),
    });
  },

  openLesson: (lessonId) => {
    const lesson = LESSON_BY_ID[lessonId];
    if (!lesson || lesson.status !== 'ready') return;
    if (lesson.type === 'score') {
      get().selectSong(lesson.songId);
      return;
    }
    audioEngine.panic();
    set((s) => ({
      activeLesson: lesson,
      activeLessonNonce: s.activeLessonNonce + 1,
      currentLessonId: lesson.id,
      lessonResult: null,
      isPlaying: false,
      waitingForNoteIds: [],
      waitStartedAtMs: null,
      showLessonBriefingModal: false,
      activeTab: 'lesson',
    }));
  },

  startLesson: (lessonId) => {
    get().openLesson(lessonId);
    set({ showLessonBriefingModal: false });
  },

  finishActiveLesson: async (score, summary) => {
    const lesson = get().activeLesson;
    if (!lesson) return;
    await get().recordLessonResult(lesson.id, score);
    const rounded = Math.round(score);
    set({
      lessonResult: {
        lessonId: lesson.id,
        score: rounded,
        passed: rounded >= passScoreOf(lesson),
        mastered: rounded >= masterScoreOf(lesson),
        summary,
      },
    });
  },

  closeLessonResult: () => set({ lessonResult: null }),

  playGeneratedSong: (song, lessonId) => {
    const state = get();
    // Keep generated songs in memory only; they are rebuilt from the lesson each time.
    const songs = [...state.songs.filter((s) => s.id !== song.id), song];
    set({ songs, activeLesson: null, lessonResult: null });
    get().selectSong(song.id);
    set({ currentLessonId: lessonId, showLessonBriefingModal: false });
  },

  completeFirstRun: async () => {
    const profile = { ...get().userProfile, hasCompletedFirstRun: true };
    set({ showFirstRun: false, userProfile: profile, activeTab: 'today' });
    try {
      await db.profile.put(profile);
    } catch {
      // IndexedDB unavailable: the flag lives for this session only
    }
  },

  replayFirstRun: () => set({ showFirstRun: true }),

  closeReportModal: () => set({ showReportModal: false }),

  addImportedSong: async (song) => {
    await db.customSongs.put(song);
    const state = get();
    const updatedSongs = [song, ...state.songs.filter((s) => s.id !== song.id)];
    set({
      songs: updatedSongs,
      currentSong: song,
      currentTier: 'beginner',
      activeTab: 'lesson',
      currentTime: 0,
      isPlaying: false,
      loopEnabled: false,
      loopStartMeasure: 1,
      loopEndMeasure: song.totalMeasures,
      matchedNoteIds: {},
      sessionEvaluations: [],
    });
  },

  loadPersistedData: async () => {
    try {
      const [customSongs, sessions, masteryList, profile, progressRows] = await Promise.all([
        db.customSongs.toArray(),
        db.sessions.orderBy('timestamp').reverse().limit(50).toArray(),
        db.mastery.toArray(),
        db.profile.get('default'),
        db.lessonProgress.toArray(),
      ]);

      const masteryMap: Record<string, SongMasteryRecord> = {};
      for (const m of masteryList) {
        masteryMap[m.songId] = m;
      }

      const mergedSongs = [
        ...ALL_SONGS,
        ...customSongs.filter((cs) => !ALL_SONGS.some((b) => b.id === cs.id)),
      ];

      // First run after the lesson model arrived: seed lesson progress from song mastery
      // so existing practice history counts toward the path.
      let lessonProgress: ProgressMap = Object.fromEntries(progressRows.map((r) => [r.lessonId, r]));
      if (progressRows.length === 0 && masteryList.length > 0) {
        lessonProgress = progressFromSongMastery(LEVELS, masteryMap);
        const seeded = Object.values(lessonProgress);
        if (seeded.length > 0) await db.lessonProgress.bulkPut(seeded);
      }

      set({
        songs: mergedSongs,
        sessionHistory: sessions,
        masteryMap,
        userProfile: profile || DEFAULT_PROFILE,
        lessonProgress,
        lessonStatuses: computeLessonStatuses(LEVELS, lessonProgress, {
          unlockAll: get().uiComplexityMode === 'pro',
        }),
        showFirstRun: shouldShowFirstRun({ profile, sessionCount: sessions.length }),
      });
    } catch {
      // IndexedDB unavailable (private window): still introduce a first-time user
      set({ showFirstRun: true });
    }
  },
}));
