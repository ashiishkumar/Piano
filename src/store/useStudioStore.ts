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
  ProblemSpot,
  ScoreNote,
  SongScore,
  TimingClassification,
} from '../types/music';
import { BUILTIN_SONGS } from '../data/curriculum';
import { MidiDeviceInfo, midiManager } from '../services/MIDIManager';
import { audioEngine } from '../services/AudioEngine';
import { db, recordSessionToDb, SongMasteryRecord, UserProfileRecord } from '../db/database';
import { getWesternName } from '../utils/notation';
import { getTeacherGuideForSong } from '../utils/teacherGuidance';

export type ViewportLayout = 'split' | 'highway' | 'sheet';
export type StudioTab = 'studio' | 'curriculum' | 'importer' | 'analytics';
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
  activeTab: 'studio',
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

  songs: BUILTIN_SONGS,
  currentSong: BUILTIN_SONGS[0],
  currentTier: 'beginner',
  practiceMode: 'wait',
  handFilter: 'right',
  autoBacking: true,
  isPlaying: true,
  currentTime: 0,
  tempoMultiplier: 0.75,
  loopEnabled: false,
  loopStartMeasure: 1,
  loopEndMeasure: BUILTIN_SONGS[0].totalMeasures,
  autoRampTempo: false,
  waitingForNoteIds: BUILTIN_SONGS[0].arrangements.beginner.notes
    .filter((n) => n.hand === 'right' && n.startTime <= 0.045)
    .map((n) => n.id),
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
      message: BUILTIN_SONGS[0].coachTip,
      severity: 'info',
    },
  ],
  lastCompletedSession: null,
  showReportModal: false,

  sessionHistory: [],
  masteryMap: {},
  userProfile: DEFAULT_PROFILE,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUiComplexityMode: (mode) =>
    set((s) => ({
      uiComplexityMode: mode,
      viewportLayout: mode === 'pro' ? 'split' : 'highway',
      showHeatmapOverlay: mode === 'guided' ? false : s.showHeatmapOverlay,
    })),

  applyLessonStep: (stepNumber) => {
    const state = get();
    const guide = getTeacherGuideForSong(state.currentSong);
    const stepConfig = guide.steps[stepNumber - 1];
    triggeredBackingIds.clear();
    lastMetronomeBeatIndex = -1;
    audioEngine.panic();

    const initialWaitIds = state.currentSong.arrangements[stepConfig.tier].notes
      .filter(
        (n) =>
          (stepConfig.handFilter === 'both' || n.hand === stepConfig.handFilter) &&
          n.startTime <= 0.045
      )
      .map((n) => n.id);

    set({
      activeLessonStep: stepNumber,
      handFilter: stepConfig.handFilter,
      currentTier: stepConfig.tier,
      practiceMode: stepConfig.practiceMode,
      tempoMultiplier: stepConfig.tempoMultiplier,
      isPlaying: true,
      currentTime: 0,
      waitingForNoteIds: stepConfig.practiceMode === 'wait' ? initialWaitIds : [],
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

    const initialWaitIds = found.arrangements[nextTier].notes
      .filter((n) => (nextHandFilter === 'both' || n.hand === nextHandFilter) && n.startTime <= 0.045)
      .map((n) => n.id);

    set({
      currentSong: found,
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
      waitingForNoteIds: nextPracticeMode === 'wait' ? initialWaitIds : [],
      waitStartedAtMs: nextPracticeMode === 'wait' ? performance.now() : null,
      matchedNoteIds: {},
      sessionEvaluations: [],
      activeHoldTracking: {},
      keyErrorCounts: {},
      keyHitCounts: {},
      hitBursts: [],
      activeTab: 'studio',
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
    const initialWaitIds = state.currentSong.arrangements[tier].notes
      .filter((n) => (state.handFilter === 'both' || n.hand === state.handFilter) && n.startTime <= 0.045)
      .map((n) => n.id);

    set({
      currentTier: tier,
      isPlaying: state.practiceMode === 'wait',
      currentTime: 0,
      waitingForNoteIds: state.practiceMode === 'wait' ? initialWaitIds : [],
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
      activeTab: 'studio',
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
          title: `Targeted Loop Drill: Measures ${startMeasure}–${endMeasure}`,
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

    // Check which notes belong to the user vs backing generator
    const isUserNote = (n: ScoreNote) =>
      state.handFilter === 'both' || n.hand === state.handFilter;

    // 1. In "Wait-for-Me" Flow Mode, check if any unmatched user note has reached its startTime
    if (state.practiceMode === 'wait') {
      const dueNotes = notes.filter(
        (n) =>
          isUserNote(n) &&
          !state.matchedNoteIds[n.id] &&
          n.startTime <= state.currentTime + 0.025 &&
          n.startTime >= state.currentTime - 0.35
      );

      if (dueNotes.length > 0) {
        const earliestOnset = Math.min(...dueNotes.map((d) => d.startTime));
        const chordCluster = dueNotes.filter((d) => Math.abs(d.startTime - earliestOnset) < 0.045);

        // If user is already holding any of the chord notes (e.g. pressed simultaneously or at t=0), mark them matched
        const nowPerf = performance.now();
        const autoMatched: Record<string, TimingClassification> = {};
        for (const d of chordCluster) {
          if (!state.matchedNoteIds[d.id]) {
            const held = state.activeNotes[d.midi];
            if (held && (earliestOnset === 0 || nowPerf - held.timestamp < 350)) {
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
      const missThresholdSec = 0.16 * state.tempoMultiplier;
      const newlyMissed: Record<string, TimingClassification> = {};
      const newEvals: NoteEvaluationEvent[] = [];
      const newKeyErrors = { ...state.keyErrorCounts };

      for (const n of notes) {
        if (
          isUserNote(n) &&
          !state.matchedNoteIds[n.id] &&
          nextTime - n.startTime > missThresholdSec
        ) {
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
            deltaMs: 180,
            timingClass: 'missed',
            expectedVelocity: n.velocity,
            actualVelocity: 0,
            expectedDuration: n.duration,
            isWrongPitch: true,
            isFatFinger: false,
          });
        }
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
      const loopNotes = notes.filter(
        (n) =>
          isUserNote(n) &&
          n.measure >= state.loopStartMeasure &&
          n.measure <= state.loopEndMeasure
      );
      const hitCount = loopNotes.filter(
        (n) =>
          state.matchedNoteIds[n.id] && state.matchedNoteIds[n.id] !== 'missed'
      ).length;
      const loopAccuracy = loopNotes.length > 0 ? (hitCount / loopNotes.length) * 100 : 100;

      let nextMult = state.tempoMultiplier;
      const alerts = [...state.coachingAlerts];

      if (state.autoRampTempo && loopAccuracy >= 95 && state.tempoMultiplier < 1.35) {
        nextMult = Number(Math.min(1.35, state.tempoMultiplier + 0.05).toFixed(2));
        alerts.unshift({
          id: `ramp-${Date.now()}`,
          timestamp: Date.now(),
          type: 'praise',
          title: `Speed Trainer +5% -> ${Math.round(song.bpm * nextMult)} BPM!`,
          message: `You achieved ${Math.round(loopAccuracy)}% accuracy on Measures ${state.loopStartMeasure}–${state.loopEndMeasure}. Tempo automatically increased!`,
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
        const heldSec = ((nowPerf - holdInfo.startPerfMs) / 1000) * state.tempoMultiplier;
        const ratio = heldSec / Math.max(0.1, holdInfo.expectedDurSec);
        let articulationIssue: 'cut-short' | 'over-held' | 'ok' = 'ok';
        if (holdInfo.articulation === 'legato' && ratio < 0.5) {
          articulationIssue = 'cut-short';
        } else if (holdInfo.articulation === 'staccato' && ratio > 1.5) {
          articulationIssue = 'over-held';
        }

        const updatedEvals = state.sessionEvaluations.map((ev) =>
          ev.noteId === holdInfo.noteId
            ? {
                ...ev,
                actualDuration: Number(heldSec.toFixed(3)),
                durationRatio: Number(ratio.toFixed(2)),
                articulationIssue,
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

    const song = state.currentSong;
    const notes = song.arrangements[state.currentTier].notes;
    const isUserNote = (n: ScoreNote) =>
      state.handFilter === 'both' || n.hand === state.handFilter;

    // Candidate window around currentTime
    const windowSec = state.practiceMode === 'wait' ? 0.35 : 0.24;
    let candidates = notes.filter(
      (n) =>
        isUserNote(n) &&
        !state.matchedNoteIds[n.id] &&
        Math.abs(n.startTime - state.currentTime) <= windowSec
    );

    // In Wait-for-Me mode, if all notes at currentTime are already matched (or we are rolling toward the next beat),
    // allow matching the next upcoming beat cluster immediately so the player never gets blocked waiting for scroll
    if (state.practiceMode === 'wait' && candidates.length === 0) {
      const futureUnmatched = notes.filter(
        (n) =>
          isUserNote(n) &&
          !state.matchedNoteIds[n.id] &&
          n.startTime >= state.currentTime - 0.35 &&
          n.startTime <= state.currentTime + 1.5
      );
      if (futureUnmatched.length > 0) {
        const nextOnset = Math.min(...futureUnmatched.map((n) => n.startTime));
        candidates = futureUnmatched.filter((n) => Math.abs(n.startTime - nextOnset) < 0.045);
      }
    }

    let exactMatch = candidates.find((n) => n.midi === midi);
    let isOctaveShiftedMatch = false;

    // In Wait-for-Me mode, if no exact MIDI match was found, check if the user played the right pitch class (e.g. Sa / C)
    // in a different octave on their 61-key keyboard so the tutorial still advances smoothly with an octave coaching tip
    if (!exactMatch && state.practiceMode === 'wait' && candidates.length > 0) {
      const pitchClassMatch = candidates.find(
        (n) => (((n.midi - midi) % 12) + 12) % 12 === 0
      );
      if (pitchClassMatch) {
        exactMatch = pitchClassMatch;
        isOctaveShiftedMatch = true;
      }
    }

    if (exactMatch) {
      // Compute micro-timing drift in milliseconds
      const rawDeltaMs =
        state.practiceMode === 'wait' && state.waitStartedAtMs
          ? Math.round(nowPerf - state.waitStartedAtMs)
          : Math.round(((state.currentTime - exactMatch.startTime) / state.tempoMultiplier) * 1000);

      const absDelta = Math.abs(rawDeltaMs);
      let timingClass: TimingClassification = 'perfect';
      if (state.practiceMode === 'wait') {
        timingClass = rawDeltaMs <= 180 ? 'perfect' : rawDeltaMs <= 450 ? 'good' : 'late';
      } else {
        if (absDelta <= 25) timingClass = 'perfect';
        else if (absDelta <= 60) timingClass = 'good';
        else if (rawDeltaMs < -60) timingClass = 'early';
        else timingClass = 'late';
      }

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
            message: `Tip: Lighten your Left Hand chord touch (currently ~${Math.round(avgLh)})—keep LH velocity around 55–65 and RH melody around 80–95.`,
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
        isPlaying: state.activeTab === 'studio' ? true : state.isPlaying,
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
    } else if (state.isPlaying && candidates.length > 0) {
      // User pressed a wrong key while playing! Check if it's an adjacent fat-fingered key (|diff| <= 2)
      const nearestTarget = candidates.reduce((best, curr) =>
        Math.abs(curr.midi - midi) < Math.abs(best.midi - midi) ? curr : best
      );
      const semitoneDist = Math.abs(nearestTarget.midi - midi);
      const isFatFinger = semitoneDist > 0 && semitoneDist <= 2;

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
    const song = state.currentSong;
    const evals = state.sessionEvaluations;
    if (evals.length === 0) return;

    const validHits = evals.filter((e) => !e.isWrongPitch);
    const wrongEvents = evals.filter((e) => e.isWrongPitch);

    const pitchAccuracy = Math.round(
      (validHits.length / Math.max(1, validHits.length + wrongEvents.length)) * 100
    );

    const timingScores = validHits.map((e) => {
      const ad = Math.abs(e.deltaMs);
      if (ad <= 25) return 100;
      if (ad <= 60) return 86;
      if (ad <= 110) return 68;
      return 45;
    });
    const timingPrecision =
      timingScores.length > 0
        ? Math.round(timingScores.reduce((a, b) => a + b, 0) / timingScores.length)
        : 85;

    const rhHits = validHits.filter((e) => e.hand === 'right');
    const lhHits = validHits.filter((e) => e.hand === 'left');
    const avgRhVelocity =
      rhHits.length > 0
        ? Math.round(rhHits.reduce((a, b) => a + b.actualVelocity, 0) / rhHits.length)
        : 84;
    const avgLhVelocity =
      lhHits.length > 0
        ? Math.round(lhHits.reduce((a, b) => a + b.actualVelocity, 0) / lhHits.length)
        : 60;

    // Score Dynamic Control based on target velocity accuracy & RH > LH voicing balance
    const velDiffs = validHits.map((e) =>
      Math.max(0, 100 - Math.abs(e.actualVelocity - e.expectedVelocity) * 1.4)
    );
    const baseDyn =
      velDiffs.length > 0
        ? velDiffs.reduce((a, b) => a + b, 0) / velDiffs.length
        : 85;
    const balanceBonus = rhHits.length > 0 && lhHits.length > 0 && avgRhVelocity > avgLhVelocity ? 6 : 0;
    const dynamicControlScore = Math.min(100, Math.round(baseDyn + balanceBonus));

    const overallScore = Math.round(
      pitchAccuracy * 0.45 + timingPrecision * 0.35 + dynamicControlScore * 0.2
    );

    const meanDeltaMs =
      validHits.length > 0
        ? Math.round(validHits.reduce((a, b) => a + b.deltaMs, 0) / validHits.length)
        : 0;

    // Build Timing Drift Histogram (-90ms to +90ms)
    const buckets = [
      { label: '<-60ms (Rush)', min: -9999, max: -60, count: 0 },
      { label: '-60..-25ms', min: -60, max: -25, count: 0 },
      { label: '±25ms (Perfect)', min: -25, max: 25, count: 0 },
      { label: '+25..+60ms', min: 25, max: 60, count: 0 },
      { label: '>+60ms (Drag)', min: 60, max: 9999, count: 0 },
    ];
    for (const h of validHits) {
      const b = buckets.find((bk) => h.deltaMs >= bk.min && h.deltaMs <= bk.max);
      if (b) b.count++;
    }

    // Identify Problem Spots by Measure
    const measureStats = new Map<number, { errors: number; delays: number[] }>();
    for (const ev of evals) {
      const st = measureStats.get(ev.measure) || { errors: 0, delays: [] };
      if (ev.isWrongPitch || ev.timingClass === 'missed') st.errors++;
      if (ev.transitionDelayMs) st.delays.push(ev.transitionDelayMs);
      else st.delays.push(Math.abs(ev.deltaMs));
      measureStats.set(ev.measure, st);
    }

    const problemSpots: ProblemSpot[] = [];
    for (const [m, st] of measureStats.entries()) {
      const avgDelay =
        st.delays.length > 0
          ? Math.round(st.delays.reduce((a, b) => a + b, 0) / st.delays.length)
          : 0;
      if (st.errors > 0 || avgDelay > 65) {
        problemSpots.push({
          measureStart: m,
          measureEnd: Math.min(song.totalMeasures, m + 1),
          reason:
            st.errors > 0
              ? `${st.errors} pitch slip(s) & +${avgDelay}ms transition hesitation`
              : `+${avgDelay}ms chord transition / finger-crossing delay`,
          avgDelayMs: avgDelay,
          errorCount: st.errors,
          recommendedBpm: Math.max(50, Math.round(song.bpm * 0.75)),
        });
      }
    }
    problemSpots.sort((a, b) => b.errorCount * 100 + b.avgDelayMs - (a.errorCount * 100 + a.avgDelayMs));

    // Generate 3 specific, actionable AI Coach Prescriptions (Module F.4)
    const prescriptions: PracticeSessionRecord['prescriptions'] = [];

    if (problemSpots.length > 0) {
      const top = problemSpots[0];
      prescriptions.push({
        title: `Isolate Measures ${top.measureStart}–${top.measureEnd} (${top.reason})`,
        description: `Launch a targeted A–B loop drill at ${top.recommendedBpm} BPM with Auto-Ramp Speed Trainer enabled to smooth out this transition.`,
        measureStart: top.measureStart,
        measureEnd: top.measureEnd,
        targetBpm: top.recommendedBpm,
      });
    } else {
      prescriptions.push({
        title: `Mastery Speed Challenge (Measures 1–${song.totalMeasures})`,
        description: `Zero problem spots flagged! Loop the full piece starting at ${Math.round(song.bpm * 1.05)} BPM to build concert-tempo security.`,
        measureStart: 1,
        measureEnd: song.totalMeasures,
        targetBpm: Math.round(song.bpm * 1.05),
      });
    }

    if (lhHits.length > 0 && avgLhVelocity > avgRhVelocity - 10) {
      prescriptions.push({
        title: `Voicing & Hand Balance Drill (LH ${avgLhVelocity} vs RH ${avgRhVelocity})`,
        description: `Your Left-Hand accompaniment velocity averaged ${avgLhVelocity}, nearly matching your Right-Hand melody (${avgRhVelocity}). Practice Measures 1–2 aiming for LH ~55 and RH ~88.`,
        measureStart: 1,
        measureEnd: Math.min(2, song.totalMeasures),
        targetBpm: Math.round(song.bpm * 0.85),
      });
    } else {
      prescriptions.push({
        title: `Blind-Mode Sight-Reading Challenge`,
        description: `Your hand balance was well controlled (RH ${avgRhVelocity} / LH ${avgLhVelocity}). Re-run Measures 1–${Math.min(4, song.totalMeasures)} in Blind Notation Mode to cement muscle memory.`,
        measureStart: 1,
        measureEnd: Math.min(4, song.totalMeasures),
        targetBpm: song.bpm,
      });
    }

    prescriptions.push({
      title:
        meanDeltaMs > 20
          ? `Rhythm Tightening Drill (Avg +${meanDeltaMs}ms Late Drag)`
          : meanDeltaMs < -20
          ? `Pulse Stabilization Drill (Avg ${meanDeltaMs}ms Early Rush)`
          : `Micro-Timing Precision Polish (Avg ${meanDeltaMs >= 0 ? '+' : ''}${meanDeltaMs}ms)`,
      description:
        meanDeltaMs > 20
          ? `You tended to drag slightly behind the beat (+${meanDeltaMs}ms). Practice in Strict Tempo Mode with the metronome active.`
          : meanDeltaMs < -20
          ? `You tended to rush ahead of the beat (${meanDeltaMs}ms). Breathe and lock into the downbeat click.`
          : `Excellent rhythmic centering (${meanDeltaMs >= 0 ? '+' : ''}${meanDeltaMs}ms mean drift). Ready for the next stage or arrangement tier!`,
      measureStart: 1,
      measureEnd: song.totalMeasures,
      targetBpm: song.bpm,
    });

    const record: PracticeSessionRecord = {
      songId: song.id,
      songTitle: song.title,
      stageId: song.stageId,
      tier: state.currentTier,
      practiceMode: state.practiceMode,
      timestamp: Date.now(),
      durationSeconds: Math.round(song.durationSeconds / state.tempoMultiplier),
      overallScore,
      pitchAccuracy,
      timingPrecision,
      dynamicControlScore,
      avgRhVelocity,
      avgLhVelocity,
      meanDeltaMs,
      timingHistogram: buckets.map((b) => ({ bucketLabel: b.label, count: b.count })),
      keyErrorCounts: { ...state.keyErrorCounts },
      keyHitCounts: { ...state.keyHitCounts },
      problemSpots: problemSpots.slice(0, 4),
      prescriptions,
    };

    await recordSessionToDb(record);
    await get().loadPersistedData();
    set({
      lastCompletedSession: record,
      showReportModal: true,
    });
  },

  closeReportModal: () => set({ showReportModal: false }),

  addImportedSong: async (song) => {
    await db.customSongs.put(song);
    const state = get();
    const updatedSongs = [song, ...state.songs.filter((s) => s.id !== song.id)];
    set({
      songs: updatedSongs,
      currentSong: song,
      currentTier: 'beginner',
      activeTab: 'studio',
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
      const [customSongs, sessions, masteryList, profile] = await Promise.all([
        db.customSongs.toArray(),
        db.sessions.orderBy('timestamp').reverse().limit(50).toArray(),
        db.mastery.toArray(),
        db.profile.get('default'),
      ]);

      const masteryMap: Record<string, SongMasteryRecord> = {};
      for (const m of masteryList) {
        masteryMap[m.songId] = m;
      }

      const mergedSongs = [
        ...BUILTIN_SONGS,
        ...customSongs.filter((cs) => !BUILTIN_SONGS.some((b) => b.id === cs.id)),
      ];

      set({
        songs: mergedSongs,
        sessionHistory: sessions,
        masteryMap,
        userProfile: profile || DEFAULT_PROFILE,
      });
    } catch {
      // Fallback if IndexedDB is unavailable in private context
    }
  },
}));
