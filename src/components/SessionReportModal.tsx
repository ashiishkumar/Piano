import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';

export const SessionReportModal: React.FC = () => {
  const {
    showReportModal,
    closeReportModal,
    lastCompletedSession,
    launchPrescriptionDrill,
    setActiveTab,
    activeLessonStep,
    applyLessonStep,
    restartSong,
  } = useStudioStore();

  if (!showReportModal || !lastCompletedSession) return null;

  const s = lastCompletedSession;
  const maxBucket = Math.max(1, ...s.timingHistogram.map((b) => b.count));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-emerald-500/30 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Award className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Post-Session Performance Report Card
              </span>
              <h2 className="text-lg font-bold text-white">{s.songTitle}</h2>
              <p className="text-xs text-slate-400 capitalize">
                {s.tier} Arrangement • {s.practiceMode === 'wait' ? 'Wait-for-Me Mode' : 'Strict Tempo Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={closeReportModal}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Score Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-[11px] text-slate-400">Overall Score</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {s.overallScore}%
            </div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-[11px] text-slate-400">Pitch Accuracy</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {s.pitchAccuracy}%
            </div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-[11px] text-slate-400">Timing Precision</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {s.timingPrecision}%
            </div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-[11px] text-slate-400">Dynamic Control</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {s.dynamicControlScore}%
            </div>
          </div>
        </div>

        {/* Compact Timing Drift Histogram */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Timing Drift Histogram (Mean: {s.meanDeltaMs >= 0 ? `+${s.meanDeltaMs}` : s.meanDeltaMs}ms)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              RH Vel {s.avgRhVelocity} / LH Vel {s.avgLhVelocity}
            </span>
          </div>

          <div className="h-24 flex items-end justify-between gap-2 pt-3">
            {s.timingHistogram.map((b, i) => {
              const hPct = Math.max(10, Math.round((b.count / maxBucket) * 100));
              return (
                <div
                  key={b.bucketLabel}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                >
                  <span className="text-[10px] font-mono text-slate-200">{b.count}</span>
                  <div
                    style={{ height: `${hPct}%` }}
                    className={`w-full rounded-t ${
                      i === 2
                        ? 'bg-emerald-400'
                        : i === 1 || i === 3
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-full">
                    {b.bucketLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Automated Practice Prescriptions */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Automated AI Coach Practice Prescriptions (Click to Launch Drill)</span>
          </div>

          <div className="space-y-2">
            {s.prescriptions.map((p, idx) => (
              <div
                key={idx}
                className="glass-card rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{p.description}</p>
                </div>

                <button
                  onClick={() =>
                    launchPrescriptionDrill(
                      s.songId,
                      p.measureStart,
                      p.measureEnd,
                      p.targetBpm
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Loop M{p.measureStart}–M{p.measureEnd}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              closeReportModal();
              setActiveTab('analytics');
            }}
            className="px-3.5 py-2 rounded-xl bg-studio-900 border border-white/15 text-xs font-medium text-slate-200 hover:text-white"
          >
            Open Full Analytics
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeReportModal();
                restartSong();
              }}
              className="px-3.5 py-2 rounded-xl bg-studio-900 border border-white/15 text-xs font-medium text-slate-200 hover:text-white"
            >
              Replay Step {activeLessonStep}
            </button>

            {activeLessonStep < 3 ? (
              <button
                onClick={() => {
                  closeReportModal();
                  applyLessonStep((activeLessonStep + 1) as 1 | 2 | 3);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
              >
                {activeLessonStep === 1
                  ? 'Advance to Step 2: Add Left Hand →'
                  : 'Advance to Step 3: Play in Rhythm →'}
              </button>
            ) : (
              <button
                onClick={() => {
                  closeReportModal();
                  setActiveTab('curriculum');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
              >
                Choose Next Curriculum Lesson →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
