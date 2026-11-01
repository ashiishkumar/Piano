import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Hand,
  HelpCircle,
  Piano,
  Sliders,
  Sparkles,
  Target,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import {
  getLiveTeacherNotePrompt,
  getTeacherGuideForSong,
} from '../utils/teacherGuidance';

export const LiveTelemetryPanel: React.FC = () => {
  const {
    sessionEvaluations,
    coachingAlerts,
    currentSong,
    currentTier,
    currentTime,
    waitingForNoteIds,
    matchedNoteIds,
    handFilter,
    rootSaPitchClass,
    lastVelocity,
    uiComplexityMode,
    activeLessonStep,
    applyLessonStep,
    setShowLessonBriefingModal,
    setShowOnboardingWizard,
  } = useStudioStore();

  const notes = currentSong.arrangements[currentTier].notes;
  const teacherGuide = useMemo(() => getTeacherGuideForSong(currentSong), [currentSong]);
  const currentStepInfo = teacherGuide.steps[activeLessonStep - 1];

  const liveInstruction = useMemo(
    () =>
      getLiveTeacherNotePrompt(
        currentSong,
        notes,
        currentTime,
        waitingForNoteIds,
        matchedNoteIds,
        handFilter,
        rootSaPitchClass
      ),
    [
      currentSong,
      notes,
      currentTime,
      waitingForNoteIds,
      matchedNoteIds,
      handFilter,
      rootSaPitchClass,
    ]
  );

  const userNotesCount = useMemo(
    () =>
      notes.filter((n) => handFilter === 'both' || n.hand === handFilter).length,
    [notes, handFilter]
  );

  const matchedUserNotesCount = useMemo(
    () =>
      notes.filter(
        (n) =>
          (handFilter === 'both' || n.hand === handFilter) &&
          matchedNoteIds[n.id] &&
          matchedNoteIds[n.id] !== 'missed'
      ).length,
    [notes, handFilter, matchedNoteIds]
  );

  const stats = useMemo(() => {
    const valid = sessionEvaluations.filter((e) => !e.isWrongPitch);
    const wrong = sessionEvaluations.filter((e) => e.isWrongPitch);
    const total = valid.length + wrong.length;

    const pitchAcc = total > 0 ? Math.round((valid.length / total) * 100) : 100;
    const perfectCount = valid.filter((e) => e.timingClass === 'perfect').length;
    const goodCount = valid.filter((e) => e.timingClass === 'good').length;
    const earlyCount = valid.filter((e) => e.timingClass === 'early').length;
    const lateCount = valid.filter((e) => e.timingClass === 'late').length;

    const meanDelta =
      valid.length > 0
        ? Math.round(valid.reduce((acc, e) => acc + e.deltaMs, 0) / valid.length)
        : 0;

    const rh = valid.filter((e) => e.hand === 'right');
    const lh = valid.filter((e) => e.hand === 'left');

    const avgRhVel =
      rh.length > 0 ? Math.round(rh.reduce((a, b) => a + b.actualVelocity, 0) / rh.length) : 84;
    const avgLhVel =
      lh.length > 0 ? Math.round(lh.reduce((a, b) => a + b.actualVelocity, 0) / lh.length) : 58;

    return {
      total,
      pitchAcc,
      perfectCount,
      goodCount,
      earlyCount,
      lateCount,
      meanDelta,
      avgRhVel,
      avgLhVel,
    };
  }, [sessionEvaluations]);

  const progressPct = Math.min(
    100,
    Math.round((matchedUserNotesCount / Math.max(1, userNotesCount)) * 100)
  );

  return (
    <aside className="w-80 xl:w-96 bg-studio-900/95 border-l border-white/10 flex flex-col justify-between p-3.5 gap-3 overflow-y-auto select-none shrink-0 hidden lg:flex">
      <div className="space-y-3">
        {/* 1. STEP-BY-STEP TEACHER GOAL CARD */}
        <div className="glass-card rounded-2xl p-3.5 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>Your Piano Teacher</span>
            </span>
            <button
              onClick={() => setShowLessonBriefingModal(true)}
              className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Full Lesson Briefing</span>
            </button>
          </div>

          <div>
            <div className="text-xs font-bold text-white">{currentStepInfo.title}</div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              {currentStepInfo.whatToExpect}
            </p>
          </div>

          {/* Note-by-Note Completion Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Notes Played: <strong className="text-white">{matchedUserNotesCount}</strong> of{' '}
                <strong className="text-white">{userNotesCount}</strong>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-studio-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {activeLessonStep < 3 && matchedUserNotesCount >= Math.max(4, Math.floor(userNotesCount * 0.5)) && (
            <button
              onClick={() => applyLessonStep((activeLessonStep + 1) as 1 | 2 | 3)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold transition-all"
            >
              <span>Ready for Step {activeLessonStep + 1}? Click Here</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. LIVE NEXT-NOTE INSTRUCTION CARD (What Key, Which Hand, Which Finger) */}
        {liveInstruction && (
          <div className="glass-card rounded-2xl p-4 border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                Next Key to Press
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" />
                {liveInstruction.handBadge}
              </span>
            </div>

            <div className="text-base font-bold text-white leading-snug">
              {liveInstruction.headline}
            </div>

            {/* Individual Note Pills for Single Note or 2-Hand Chord */}
            <div className="space-y-1.5">
              {liveInstruction.targetNotesSummary.map((item) => (
                <div
                  key={`${item.midi}-${item.hand}`}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs ${
                    item.isMatched
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : item.hand === 'right'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-sky-500/10 border-sky-500/30 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.hand === 'right' ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                    />
                    <span className="font-bold">
                      {item.sargam} ({item.western})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-300 font-semibold">
                    {item.isMatched ? '✓ Pressed!' : item.finger}
                  </span>
                </div>
              ))}
            </div>

            {/* Where to find this key on the PSR-E373 */}
            <div className="p-2.5 rounded-xl bg-studio-950/90 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-amber-300">Where on keyboard:</strong>{' '}
              {liveInstruction.keyLocationHint}
            </div>

            {/* Special Thumb Tuck / Crossover Alert */}
            {liveInstruction.techniqueTip && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-[11px] text-emerald-200 leading-relaxed font-medium">
                {liveInstruction.techniqueTip}
              </div>
            )}
          </div>
        )}

        {/* 3. LIVE FEEDBACK & ACCURACY SUMMARY */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Note Accuracy</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{stats.pitchAcc}%</span>
              <span className="text-[10px] font-mono text-slate-400">{stats.total} played</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Touch Strength</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{lastVelocity}</span>
              <span className="text-[10px] text-emerald-400">
                {lastVelocity < 55 ? 'Soft (p)' : lastVelocity < 90 ? 'Balanced (mf)' : 'Strong (f)'}
              </span>
            </div>
          </div>
        </div>

        {/* Pro Mode Extra Telemetry (Micro-Timing & Hand Velocity Balance) */}
        {uiComplexityMode === 'pro' && (
          <>
            <div className="glass-card rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Micro-Timing (±25ms)
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  Avg {stats.meanDelta >= 0 ? `+${stats.meanDelta}` : stats.meanDelta}ms
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-1">
                  <div className="text-xs font-bold text-emerald-300">{stats.perfectCount}</div>
                  <div className="text-[9px] text-slate-400">Perfect</div>
                </div>
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-1">
                  <div className="text-xs font-bold text-sky-300">{stats.goodCount}</div>
                  <div className="text-[9px] text-slate-400">Good</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-1">
                  <div className="text-xs font-bold text-amber-300">{stats.earlyCount}</div>
                  <div className="text-[9px] text-slate-400">Early</div>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-1">
                  <div className="text-xs font-bold text-rose-300">{stats.lateCount}</div>
                  <div className="text-[9px] text-slate-400">Late</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-3 space-y-2">
              <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hand Balance (RH {stats.avgRhVel} / LH {stats.avgLhVel})</span>
              </div>
              <div className="w-full h-1.5 bg-studio-950 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${Math.min(100, (stats.avgRhVel / 127) * 100)}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Coaching Tips Feed */}
        {coachingAlerts.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Teacher Notes</span>
            </div>
            {coachingAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-2.5 border text-xs space-y-1 ${
                  alert.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                    : 'bg-studio-950/90 border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {alert.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate">{alert.title}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Interactive Orientation Button */}
      <button
        onClick={() => setShowOnboardingWizard(true)}
        className="w-full glass-card hover:border-emerald-500/40 rounded-xl p-2.5 text-left flex items-center justify-between gap-2 transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Piano className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-300">
              New to Piano? Find Middle C
            </div>
            <div className="text-[10px] text-slate-400">
              Interactive 3-step keyboard & hand guide
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
      </button>
    </aside>
  );
};
