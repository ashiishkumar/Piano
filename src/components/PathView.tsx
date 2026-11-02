import React, { useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronRight, Lock, Play, Star, Unlock } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { LEVELS } from '../content/path';
import { summarizeLevels, LessonStatus } from '../engine/progress';
import { Lesson, LESSON_TYPE_LABELS, TRACK_LABELS, Track } from '../types/lesson';

const TRACK_COLOUR: Record<Track, string> = {
  play: 'bg-emerald-400',
  theory: 'bg-violet-400',
  chords: 'bg-amber-400',
  ear: 'bg-rose-400',
  keyboard: 'bg-cyan-400',
  perform: 'bg-fuchsia-400',
};

const TRACKS: Track[] = ['play', 'theory', 'chords', 'ear', 'keyboard', 'perform'];

const StatusMark: React.FC<{ status: LessonStatus; planned: boolean; current: boolean; unlockedByCompanion: boolean }> = ({
  status,
  planned,
  current,
  unlockedByCompanion,
}) => {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border';
  if (planned) return <span className={`${base} border-dashed border-slate-700 text-slate-700`} aria-label="coming soon" />;
  switch (status) {
    case 'mastered':
      return (
        <span className={`${base} bg-amber-400/20 border-amber-400 text-amber-300`} aria-label="mastered">
          <Star className="w-3.5 h-3.5 fill-current" />
        </span>
      );
    case 'passed':
      return (
        <span className={`${base} bg-emerald-500/20 border-emerald-400 text-emerald-300`} aria-label="passed">
          <Check className="w-4 h-4" />
        </span>
      );
    case 'in-progress':
      return (
        <span className={`${base} border-amber-400 text-amber-300`} aria-label="in progress">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        </span>
      );
    case 'available':
      return (
        <span
          className={`${base} ${current ? 'border-emerald-400 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.35)]' : 'border-slate-500 text-slate-400'}`}
          aria-label={current ? 'next lesson' : 'available'}
        >
          {current ? <Play className="w-3.5 h-3.5 fill-current" /> : null}
        </span>
      );
    default:
      if (unlockedByCompanion) {
        return (
          <span className={`${base} border-slate-600 text-slate-400`} aria-label="available">
            <Play className="w-3 h-3" />
          </span>
        );
      }
      return (
        <span className={`${base} border-slate-800 text-slate-700`} aria-label="locked">
          <Lock className="w-3 h-3" />
        </span>
      );
  }
};

export const PathView: React.FC = () => {
  const { lessonStatuses, lessonProgress, openLesson, currentLessonId } = useStudioStore();
  const [trackFilter, setTrackFilter] = useState<Track | null>(null);
  // Video Companion Mode lets the student jump directly to whichever video chapter they just watched.
  const [companionFreeJump, setCompanionFreeJump] = useState<boolean>(true);

  const summaries = useMemo(() => summarizeLevels(LEVELS, lessonProgress, lessonStatuses), [lessonProgress, lessonStatuses]);

  // The level holding the next available lesson starts expanded; in companion mode all modules can be expanded easily.
  const defaultOpen = useMemo(() => {
    const open: Record<number, boolean> = {};
    let firstIncomplete: number | null = null;
    for (const s of summaries) {
      if (firstIncomplete === null && s.unlocked && !s.complete) firstIncomplete = s.levelId;
    }
    for (const s of summaries) open[s.levelId] = s.unlocked && (s.levelId === firstIncomplete || !s.complete);
    return open;
  }, [summaries]);
  const [openOverride, setOpenOverride] = useState<Record<number, boolean>>({});
  const isOpen = (id: number) => openOverride[id] ?? defaultOpen[id] ?? false;

  const nextId = useMemo(() => {
    for (const level of LEVELS) {
      for (const l of level.lessons) {
        if (l.status !== 'ready') continue;
        const s = lessonStatuses[l.id];
        if (s === 'available' || s === 'in-progress') return l.id;
      }
    }
    return null;
  }, [lessonStatuses]);

  const visible = (l: Lesson) => trackFilter === null || l.track === trackFilter;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              PIX Series · Zero to Hero Piano Course Companion (Chapters 1A–10C)
            </div>
            <h1 className="font-display text-4xl text-white">Your path</h1>
            <p className="text-sm text-slate-400 mt-1">
              10 Modules · 101 Interactive Lessons & Songs mapped 1-to-1 to Jash Gotawala’s Zero to Hero video course & e-book.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCompanionFreeJump((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                companionFreeJump
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="When enabled, you can open any chapter across all 10 Modules right after watching its video."
            >
              {companionFreeJump ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {companionFreeJump ? 'Video Companion: All Chapters Unlocked' : 'Strict Sequential Lock'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by track">
          <button
            onClick={() => setTrackFilter(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              trackFilter === null ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => setTrackFilter(trackFilter === t ? null : t)}
              aria-pressed={trackFilter === t}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                trackFilter === t ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${TRACK_COLOUR[t]}`} />
              {TRACK_LABELS[t]}
            </button>
          ))}
        </div>

        <ol className="relative">
          {/* spine */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" aria-hidden />

          {LEVELS.map((level, idx) => {
            const sum = summaries[idx];
            const open = isOpen(level.id);
            const lessons = level.lessons.filter(visible);
            const progressPct = sum.readyCount ? Math.round((sum.passedCount / sum.readyCount) * 100) : 0;
            const levelUnlocked = sum.unlocked || companionFreeJump;

            return (
              <li key={level.id} className="relative pl-12 pb-8 last:pb-0">
                {/* level node on the spine */}
                <span
                  className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold ${
                    sum.complete
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : levelUnlocked
                      ? 'bg-studio-900 border-emerald-400 text-emerald-300'
                      : 'bg-studio-950 border-slate-700 text-slate-600'
                  }`}
                  aria-hidden
                >
                  {sum.complete ? <Check className="w-4 h-4" /> : level.id}
                </span>

                <button
                  onClick={() => setOpenOverride((o) => ({ ...o, [level.id]: !open }))}
                  className="w-full text-left group"
                  aria-expanded={open}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        Level {level.id} · PIX Series Module {level.id}
                        {!levelUnlocked && ` · finish Level ${level.id - 1} to unlock`}
                      </div>
                      <h2 className={`font-display text-2xl leading-snug ${levelUnlocked ? 'text-white' : 'text-slate-500'}`}>{level.title}</h2>
                      <p className="text-sm text-slate-400">{level.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-500">
                      {sum.readyCount > 0 && (
                        <span>
                          {sum.passedCount}/{sum.readyCount}
                        </span>
                      )}
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                  {sum.readyCount > 0 && (
                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  )}
                </button>

                {open && (
                  <ul className="mt-4 space-y-1.5">
                    {lessons.map((l) => {
                      const planned = l.status === 'planned';
                      const status = lessonStatuses[l.id] ?? 'locked';
                      const clickable = !planned && (status !== 'locked' || companionFreeJump);
                      const current = l.id === nextId;
                      const prog = lessonProgress[l.id];
                      const chapterTag = l.source?.startsWith('course ') ? l.source.replace('course ', 'Ch. ') : null;
                      return (
                        <li key={l.id}>
                          <button
                            onClick={clickable ? () => openLesson(l.id) : undefined}
                            disabled={!clickable}
                            aria-disabled={!clickable}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                              current
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : l.id === currentLessonId
                                ? 'bg-white/[0.04] border-white/10'
                                : 'border-transparent'
                            } ${clickable ? 'hover:bg-white/[0.06] hover:border-white/10' : 'cursor-default'} ${planned ? 'opacity-60' : ''}`}
                          >
                            <StatusMark
                              status={status}
                              planned={planned}
                              current={current}
                              unlockedByCompanion={companionFreeJump && status === 'locked'}
                            />
                            <span className="font-mono text-xs text-slate-500 w-9 shrink-0">{l.code}</span>
                            <span className="flex-1 min-w-0">
                              <span className={`block text-sm truncate ${planned || !clickable ? 'text-slate-400' : 'text-slate-100'}`}>
                                {l.title}
                              </span>
                              <span className="block text-[11px] text-slate-500 truncate">
                                {chapterTag ? `${chapterTag} · ` : ''}
                                {LESSON_TYPE_LABELS[l.type]} · {l.durationMinutes} min
                                {planned && ' · coming soon'}
                                {prog && ` · best ${prog.bestScore}`}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0" title={TRACK_LABELS[l.track]}>
                              <span className={`w-2 h-2 rounded-full ${TRACK_COLOUR[l.track]}`} />
                              <span className="hidden sm:inline text-[11px] text-slate-500">{TRACK_LABELS[l.track]}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    {lessons.length === 0 && (
                      <li className="text-xs text-slate-500 px-3 py-2">No {trackFilter ? TRACK_LABELS[trackFilter] : ''} lessons in this module.</li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
