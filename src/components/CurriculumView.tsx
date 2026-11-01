import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Music2,
  Play,
  Sparkles,
} from 'lucide-react';
import { CURRICULUM_STAGES } from '../data/curriculum';
import { useStudioStore } from '../store/useStudioStore';
import { ArrangementTier } from '../types/music';

export const CurriculumView: React.FC = () => {
  const { songs, selectSong, masteryMap } = useStudioStore();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-studio-950 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>6-Stage Conservatory Syllabus for Yamaha PSR-E373</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              From One-Handed Sargam Melodies to Two-Handed Virtuoso
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Every lesson includes 3 interactive difficulty tiers (<strong className="text-slate-200">Beginner</strong>: Melody + Beat 1 Root Bass, <strong className="text-slate-200">Intermediate</strong>: Melody + Chords/Fifths, and <strong className="text-slate-200">Pro</strong>: Full Two-Hand Arrangement).
            </p>
          </div>
        </div>

        {/* 6 Progressive Stages */}
        <div className="space-y-6">
          {CURRICULUM_STAGES.map((stage) => {
            const stageSongs = songs.filter((s) => stage.lessonIds.includes(s.id));

            return (
              <div
                key={stage.id}
                className="glass-panel rounded-2xl p-5 space-y-4 border border-white/10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs">
                        STAGE {stage.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300 text-xs font-medium">
                        {stage.badge}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white pt-1">{stage.title}</h2>
                    <p className="text-xs text-slate-400">{stage.description}</p>
                  </div>

                  {/* Skills Unlocked Pills */}
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {stage.skillsUnlocked.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 text-[11px] text-slate-300"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Playable Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stageSongs.map((lesson) => {
                    const mastery = masteryMap[lesson.id];
                    const bestScore = mastery?.bestScore ?? 0;

                    return (
                      <div
                        key={lesson.id}
                        className="glass-card rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-white leading-snug">
                              {lesson.title}
                            </h3>
                            {bestScore > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0">
                                <Award className="w-3 h-3" />
                                {bestScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{lesson.subtitle}</p>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {lesson.bpm} BPM
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Music2 className="w-3 h-3 text-amber-400" />
                              {lesson.timeSignature[0]}/{lesson.timeSignature[1]} ({lesson.totalMeasures} bars)
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-studio-950/90 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                            <strong className="text-amber-300">Coach Tip:</strong> {lesson.coachTip}
                          </div>
                        </div>

                        {/* Launch in Beginner / Intermediate / Pro Tiers */}
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <div className="text-[10px] font-mono uppercase text-slate-400">
                            Select Arrangement Tier to Practice:
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['beginner', 'intermediate', 'pro'] as ArrangementTier[]).map(
                              (tier) => {
                                const isDone = mastery?.completedTiers?.includes(tier);
                                return (
                                  <button
                                    key={tier}
                                    onClick={() => selectSong(lesson.id, tier)}
                                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                                      tier === 'pro'
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                        : 'bg-studio-950 text-slate-200 border border-white/15 hover:border-emerald-400 hover:text-emerald-300'
                                    }`}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Play className="w-3 h-3 fill-current shrink-0" />
                                    )}
                                    <span>{tier === 'intermediate' ? 'Interm.' : tier}</span>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
