import React from 'react';
import {
  BookOpen,
  Columns,
  EyeOff,
  Flame,
  Gauge,
  GraduationCap,
  Hand,
  HelpCircle,
  Music,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useStudioStore, ViewportLayout } from '../store/useStudioStore';
import { ArrangementTier, HandPracticeFilter, NotationMode, PracticeMode } from '../types/music';
import { getTeacherGuideForSong } from '../utils/teacherGuidance';

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const PracticeTransportBar: React.FC = () => {
  const {
    songs,
    currentSong,
    selectSong,
    uiComplexityMode,
    setUiComplexityMode,
    activeLessonStep,
    applyLessonStep,
    setShowLessonBriefingModal,
    setShowOnboardingWizard,
    setShowFeatureGuideModal,
    currentTier,
    setArrangementTier,
    practiceMode,
    setPracticeMode,
    handFilter,
    setHandFilter,
    autoBacking,
    setAutoBacking,
    isPlaying,
    togglePlay,
    restartSong,
    tempoMultiplier,
    setTempoMultiplier,
    metronomeEnabled,
    setMetronomeEnabled,
    loopEnabled,
    loopStartMeasure,
    loopEndMeasure,
    autoRampTempo,
    setLoopConfig,
    notationMode,
    setNotationMode,
    rootSaPitchClass,
    setRootSaPitchClass,
    viewportLayout,
    setViewportLayout,
    keyCountMode,
    setKeyCountMode,
    showHeatmapOverlay,
    setShowHeatmapOverlay,
    finishAndSaveSession,
    sessionEvaluations,
  } = useStudioStore();

  const effectiveBpm = Math.round(currentSong.bpm * tempoMultiplier);
  const teacherGuide = getTeacherGuideForSong(currentSong);

  return (
    <div className="bg-studio-900/95 border-b border-white/10 px-3 py-2 flex flex-col gap-2 select-none z-20 shrink-0">
      {/* Row 1: Lesson Picker, 3-Step Guided Progression, Notation Labels & Simple/Pro Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Play/Restart, Lesson Selector & Teacher Briefing Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{practiceMode === 'wait' ? 'Active (Wait-for-Me)' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={restartSong}
            title="Start Lesson Over from Note 1"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-studio-950 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          {/* Active Song Selector */}
          <select
            aria-label="Select Curriculum Lesson or Imported Song"
            value={currentSong.id}
            onChange={(e) => selectSong(e.target.value)}
            className="bg-studio-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 max-w-[240px] truncate cursor-pointer"
          >
            {songs.map((s) => (
              <option key={s.id} value={s.id} className="bg-studio-900 text-slate-100">
                {s.stageId > 0 ? `[Stage ${s.stageId}] ${s.title}` : `[Imported] ${s.title}`}
              </option>
            ))}
          </select>

          {/* Teacher Briefing Button */}
          <button
            onClick={() => setShowLessonBriefingModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Lesson Guide</span>
          </button>
        </div>

        {/* Center: Step-by-Step Teacher Progression (Step 1 -> Step 2 -> Step 3) */}
        <div className="flex items-center bg-studio-950 p-1 rounded-xl border border-white/10 gap-1">
          {teacherGuide.steps.map((st) => {
            const active = activeLessonStep === st.stepNumber;
            const shortLabels: Record<number, string> = {
              1: 'Step 1: Right Hand Only',
              2: 'Step 2: Add Left Hand',
              3: 'Step 3: Play in Rhythm',
            };
            return (
              <button
                key={st.stepNumber}
                onClick={() => applyLessonStep(st.stepNumber)}
                title={`${st.title} — ${st.whatToExpect}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {shortLabels[st.stepNumber]}
              </button>
            );
          })}
        </div>

        {/* Right: Notation Labels, Sheet Music Toggle, Help & Guided/Pro Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Notation Bridge Selector */}
          <div className="flex items-center bg-studio-950 p-0.5 rounded-xl border border-white/10">
            <Music className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
            {(
              [
                { id: 'sargam', label: 'Sargam (सा रे ग)' },
                { id: 'western', label: 'Western (C4)' },
                { id: 'fingers', label: 'Fingers (1–5)' },
                { id: 'blind', label: 'Blind' },
              ] as { id: NotationMode; label: string }[]
            ).map((nm) => (
              <button
                key={nm.id}
                onClick={() => setNotationMode(nm.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                  notationMode === nm.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {nm.id === 'blind' && <EyeOff className="w-3 h-3" />}
                {nm.label}
              </button>
            ))}

            {notationMode === 'sargam' && (
              <select
                aria-label="Root Sa Key"
                value={rootSaPitchClass}
                onChange={(e) => setRootSaPitchClass(Number(e.target.value))}
                title="Select Root Key for Shadja (Sa)"
                className="ml-1 mr-1 bg-studio-900 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 focus:outline-none cursor-pointer"
              >
                {PITCH_CLASSES.map((name, pc) => (
                  <option key={name} value={pc} className="bg-studio-900">
                    Sa={name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Toggle Sheet Music On/Off */}
          <button
            onClick={() =>
              setViewportLayout(viewportLayout === 'highway' ? 'split' : 'highway')
            }
            title="Show or Hide Grand Staff Sheet Music above the Falling Notes"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              viewportLayout !== 'highway'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-studio-950 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{viewportLayout !== 'highway' ? 'Sheet Music: ON' : '+ Sheet Music'}</span>
          </button>

          {/* How It Works / Feature Guide Button */}
          <button
            onClick={() => setShowFeatureGuideModal(true)}
            title="Plain-English Guide to All Features"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-studio-950 border border-white/10 text-slate-300 hover:text-white text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">How It Works</span>
          </button>

          {/* Guided Beginner UI vs Pro Studio UI Switch */}
          <button
            onClick={() =>
              setUiComplexityMode(uiComplexityMode === 'guided' ? 'pro' : 'guided')
            }
            title="Switch between Simple Guided Beginner View and Full Pro Studio Controls"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              uiComplexityMode === 'pro'
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-200'
                : 'bg-studio-950 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{uiComplexityMode === 'pro' ? 'Pro Controls: ON' : 'Pro Controls'}</span>
          </button>

          {sessionEvaluations.length > 0 && (
            <button
              onClick={() => finishAndSaveSession()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Finish & Score</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2 (Only Shown When Pro Studio Controls Are Toggled ON): Fine-Grained Studio Controls */}
      {uiComplexityMode === 'pro' && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Manual 3-Tier Switch */}
            <div className="flex items-center bg-studio-950 p-0.5 rounded-xl border border-white/10">
              {(['beginner', 'intermediate', 'pro'] as ArrangementTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setArrangementTier(tier)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                    currentTier === tier
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Wait-for-Me vs Strict Tempo */}
            <div className="flex items-center bg-studio-950 p-0.5 rounded-xl border border-white/10">
              {(
                [
                  { id: 'wait', label: 'Wait-for-Me' },
                  { id: 'rhythm', label: 'Strict Tempo' },
                ] as { id: PracticeMode; label: string }[]
              ).map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPracticeMode(pm.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    practiceMode === pm.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>

            {/* Left / Right / Both Hands + Auto Backing */}
            <div className="flex items-center bg-studio-950 p-0.5 rounded-xl border border-white/10">
              <Hand className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              {(
                [
                  { id: 'both', label: 'Both Hands' },
                  { id: 'right', label: 'Right Hand' },
                  { id: 'left', label: 'Left Hand' },
                ] as { id: HandPracticeFilter; label: string }[]
              ).map((hf) => (
                <button
                  key={hf.id}
                  onClick={() => setHandFilter(hf.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    handFilter === hf.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {hf.label}
                </button>
              ))}
              {handFilter !== 'both' && (
                <button
                  onClick={() => setAutoBacking(!autoBacking)}
                  className={`ml-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    autoBacking
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  +Backing
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tempo & Metronome */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-studio-950 border border-white/10">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="range"
                aria-label="Tempo Speed Percentage"
                min={0.4}
                max={1.4}
                step={0.05}
                value={tempoMultiplier}
                onChange={(e) => setTempoMultiplier(Number(e.target.value))}
                className="w-16 accent-emerald-400 cursor-pointer h-1"
              />
              <span className="text-[11px] font-mono text-slate-200 w-20 text-right">
                {effectiveBpm} BPM ({Math.round(tempoMultiplier * 100)}%)
              </span>
              <button
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  metronomeEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'border-white/10 text-slate-500'
                }`}
              >
                CLICK
              </button>
            </div>

            {/* A-B Measure Looper & Auto-Ramp Speed Trainer */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-studio-950 border border-white/10 text-[11px]">
              <button
                onClick={() =>
                  setLoopConfig(!loopEnabled, loopStartMeasure, loopEndMeasure, autoRampTempo)
                }
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium transition-colors ${
                  loopEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Repeat className="w-3 h-3" />
                <span>A–B Loop</span>
              </button>

              <select
                aria-label="Loop Start Measure"
                value={loopStartMeasure}
                onChange={(e) =>
                  setLoopConfig(true, Number(e.target.value), loopEndMeasure, autoRampTempo)
                }
                className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer"
              >
                {Array.from({ length: currentSong.totalMeasures }, (_, i) => i + 1).map((m) => (
                  <option key={`start-${m}`} value={m} className="bg-studio-900">
                    M{m}
                  </option>
                ))}
              </select>
              <span className="text-slate-500">→</span>
              <select
                aria-label="Loop End Measure"
                value={loopEndMeasure}
                onChange={(e) =>
                  setLoopConfig(true, loopStartMeasure, Number(e.target.value), autoRampTempo)
                }
                className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer"
              >
                {Array.from({ length: currentSong.totalMeasures }, (_, i) => i + 1).map((m) => (
                  <option key={`end-${m}`} value={m} className="bg-studio-900">
                    M{m}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  setLoopConfig(true, loopStartMeasure, loopEndMeasure, !autoRampTempo)
                }
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] transition-all ${
                  autoRampTempo && loopEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>+5% Ramp</span>
              </button>
            </div>

            {/* Viewport Mode */}
            <div className="flex items-center bg-studio-950 p-0.5 rounded-xl border border-white/10">
              <Columns className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              {(
                [
                  { id: 'split', label: 'Dual Split' },
                  { id: 'highway', label: 'Highway' },
                  { id: 'sheet', label: 'Staff' },
                ] as { id: ViewportLayout; label: string }[]
              ).map((vl) => (
                <button
                  key={vl.id}
                  onClick={() => setViewportLayout(vl.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    viewportLayout === vl.id
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {vl.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setKeyCountMode(keyCountMode === 61 ? 88 : 61)}
              className="px-2 py-1 rounded-xl bg-studio-950 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white"
            >
              {keyCountMode}-Key
            </button>

            <button
              onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-medium transition-all ${
                showHeatmapOverlay
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-studio-950 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Heatmap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
