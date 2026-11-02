import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { LESSON_BY_ID } from '../content/path';
import { getLiveTeacherNotePrompt, getTeacherGuideForSong } from '../utils/teacherGuidance';
import { LessonPracticeStep } from '../types/music';
import { isUserNote } from '../engine/matching';
import { FallingNotesCanvas } from './FallingNotesCanvas';
import { PracticeTransportBar } from './PracticeTransportBar';
import { KeyGlyph, GlyphKey } from './KeyGlyph';

/** Short pill label from what the step actually asks for. */
function stepShort(step: LessonPracticeStep): string {
  if (step.handFilter === 'left') return step.practiceMode === 'rhythm' ? 'Left hand in rhythm' : 'Left hand';
  if (step.handFilter === 'right') return step.practiceMode === 'rhythm' ? 'Right hand in rhythm' : 'Right hand';
  return step.practiceMode === 'rhythm' ? 'In rhythm' : 'Both hands';
}

const LessonHeaderBar: React.FC<{ showAdvanced: boolean; onToggleAdvanced: () => void }> = ({ showAdvanced, onToggleAdvanced }) => {
  const {
    currentSong,
    currentLessonId,
    activeLessonStep,
    applyLessonStep,
    isPlaying,
    togglePlay,
    restartSong,
    setActiveTab,
    setShowLessonBriefingModal,
    tempoMultiplier,
    practiceMode,
  } = useStudioStore();

  const lesson = currentLessonId ? LESSON_BY_ID[currentLessonId] : undefined;
  const guide = getTeacherGuideForSong(currentSong);
  const bpm = Math.round(currentSong.bpm * tempoMultiplier);

  return (
    <div className="bg-studio-900/95 border-b border-white/10 px-4 py-2 flex items-center gap-3 select-none shrink-0 flex-wrap">
      <button
        onClick={() => setActiveTab('path')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Path
      </button>

      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
          {lesson ? `Lesson ${lesson.code}` : 'Song'}
        </div>
        <div className="text-sm font-semibold text-white truncate">{lesson?.title ?? currentSong.title}</div>
      </div>

      <div className="flex items-center bg-studio-950 border border-white/10 rounded-xl p-0.5" role="group" aria-label="Lesson step">
        {guide.steps.map((st) => {
          const active = activeLessonStep === st.stepNumber;
          return (
            <button
              key={st.stepNumber}
              onClick={() => applyLessonStep(st.stepNumber)}
              aria-pressed={active}
              title={st.title}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="font-mono mr-1.5">{st.stepNumber}</span>
              {stepShort(st)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
            isPlaying ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isPlaying ? (practiceMode === 'wait' ? 'Waiting for you' : 'Pause') : 'Resume'}
        </button>
        <button onClick={restartSong} title="Start over" className="p-1.5 rounded-xl bg-studio-950 border border-white/10 text-slate-300 hover:text-white">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] text-slate-500 px-1.5">{bpm} BPM</span>
        <button
          onClick={() => setShowLessonBriefingModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Briefing
        </button>
        <button
          onClick={onToggleAdvanced}
          aria-pressed={showAdvanced}
          title="Tempo, loop, hands, notation and more"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
            showAdvanced ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More
        </button>
      </div>
    </div>
  );
};

const InstructionCard: React.FC = () => {
  const {
    currentSong,
    currentTier,
    currentTime,
    waitingForNoteIds,
    matchedNoteIds,
    handFilter,
    rootSaPitchClass,
    activeLessonStep,
    applyLessonStep,
    coachingAlerts,
    isPlaying,
  } = useStudioStore();

  const notes = currentSong.arrangements[currentTier].notes;
  const guide = useMemo(() => getTeacherGuideForSong(currentSong), [currentSong]);
  const step = guide.steps[activeLessonStep - 1];

  const live = useMemo(
    () => getLiveTeacherNotePrompt(currentSong, notes, currentTime, waitingForNoteIds, matchedNoteIds, handFilter, rootSaPitchClass),
    [currentSong, notes, currentTime, waitingForNoteIds, matchedNoteIds, handFilter, rootSaPitchClass]
  );

  const userNotes = useMemo(() => notes.filter((n) => isUserNote(n, handFilter)), [notes, handFilter]);
  const played = userNotes.filter((n) => matchedNoteIds[n.id] && matchedNoteIds[n.id] !== 'missed').length;
  const pct = Math.round((played / Math.max(1, userNotes.length)) * 100);
  const finished = !isPlaying && currentTime >= currentSong.durationSeconds - 0.05;
  const readyForNext = activeLessonStep < 3 && played >= Math.max(4, Math.floor(userNotes.length * 0.5));

  const glyphKeys: GlyphKey[] = useMemo(() => {
    if (!live) return [];
    return live.targetNotesSummary.map((t) => ({
      midi: t.midi,
      hand: t.hand,
      label: t.finger.match(/\d/)?.[0] ?? t.sargam,
      matched: t.isMatched,
    }));
  }, [live]);

  const latestAlert = coachingAlerts[0];

  return (
    <div className="px-4 pt-3 pb-2 shrink-0">
      <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-6">
        {glyphKeys.length > 0 && (
          <div className="shrink-0 hidden sm:block">
            <KeyGlyph keys={glyphKeys} keyHeight={60} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Step {activeLessonStep} · {step.subtitle}
          </div>
          {finished ? (
            <h2 className="font-display text-2xl text-white">Lesson complete. Your report is ready.</h2>
          ) : live ? (
            <>
              <h2 className="font-display text-2xl text-white leading-snug">{live.headline}</h2>
              <p className="text-sm text-slate-300">
                <span className="text-emerald-300 font-medium">{live.fingerBadge}.</span>{' '}
                <span className="text-slate-400">{live.keyLocationHint}</span>
              </p>
              {live.techniqueTip && <p className="text-sm text-amber-200">{live.techniqueTip}</p>}
            </>
          ) : (
            <h2 className="font-display text-2xl text-white">{isPlaying ? 'Listening…' : 'Press Resume when you are ready.'}</h2>
          )}
          {latestAlert && !finished && latestAlert.type !== 'posture' && (
            <p className={`text-xs ${latestAlert.severity === 'warning' ? 'text-amber-300' : latestAlert.severity === 'success' ? 'text-emerald-300' : 'text-slate-400'}`}>
              {latestAlert.title}
            </p>
          )}
        </div>

        <div className="shrink-0 w-40 space-y-2 text-right">
          <div className="font-mono text-xs text-slate-400">
            <span className="text-white font-semibold">{played}</span> / {userNotes.length} notes
          </div>
          <div className="h-1.5 w-full bg-studio-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150" style={{ width: `${pct}%` }} />
          </div>
          {readyForNext && (
            <button
              onClick={() => applyLessonStep((activeLessonStep + 1) as 1 | 2 | 3)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold transition-colors"
            >
              Step {activeLessonStep + 1}: {stepShort(guide.steps[activeLessonStep as 1 | 2])}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Guided mode lesson player: header, instruction, highway. The keyboard is
 * rendered by App beneath this. Everything else lives behind "More".
 */
export const GuidedLessonView: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <LessonHeaderBar showAdvanced={showAdvanced} onToggleAdvanced={() => setShowAdvanced((v) => !v)} />
      {showAdvanced && <PracticeTransportBar />}
      <InstructionCard />
      <div className="flex-1 min-h-0 relative">
        <FallingNotesCanvas />
      </div>
    </div>
  );
};
