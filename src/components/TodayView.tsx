import React, { useMemo } from 'react';
import { ArrowRight, BookOpen, Clock, Flame, Play, Repeat, Wrench } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { LEVELS, LESSON_BY_SONG_ID, getLevel } from '../content/path';
import { buildDailyPlan, greetingFor, totalPlanMinutes, PlanItem } from '../engine/dailyPlan';
import { nextLesson } from '../engine/progress';
import { LESSON_TYPE_LABELS } from '../types/lesson';
import { KeyGlyph } from './KeyGlyph';
import { openingHandPosition } from '../utils/lessonGlyph';

/** "The 5-finger home: Sa Re Ga Ma Pa" → "the 5-finger home". Proper nouns keep their case. */
function shortTitle(title: string): string {
  const head = title.replace(/[:—].*$/, '').trim();
  return /^(The|A|An|Your|How|What|Playing|Finding|Building|Meet)\b/.test(head)
    ? head.charAt(0).toLowerCase() + head.slice(1)
    : head;
}

const planIcon: Record<PlanItem['kind'], React.ReactNode> = {
  lesson: <BookOpen className="w-4 h-4" />,
  drill: <Wrench className="w-4 h-4" />,
  review: <Repeat className="w-4 h-4" />,
};

export const TodayView: React.FC = () => {
  const {
    lessonStatuses,
    sessionHistory,
    lastCompletedSession,
    userProfile,
    songs,
    startLesson,
    openLesson,
    launchPrescriptionDrill,
    setActiveTab,
    replayFirstRun,
    midiInputs,
  } = useStudioStore();

  const next = useMemo(() => nextLesson(LEVELS, lessonStatuses), [lessonStatuses]);
  const nextLevel = next ? getLevel(next.levelId) : undefined;
  const nextSong = next && next.status === 'ready' && next.type === 'score' ? songs.find((s) => s.id === next.songId) : undefined;
  const handPosition = useMemo(() => (nextSong ? openingHandPosition(nextSong) : []), [nextSong]);

  const plan = useMemo(
    () =>
      buildDailyPlan({
        levels: LEVELS,
        statuses: lessonStatuses,
        lastSession: lastCompletedSession ?? sessionHistory[0] ?? null,
        lessonIdForSong: (songId) => LESSON_BY_SONG_ID[songId]?.id,
      }),
    [lessonStatuses, lastCompletedSession, sessionHistory]
  );

  const practiceMinutes = Math.round(userProfile.totalPracticeSeconds / 60);
  const passedCount = Object.values(lessonStatuses).filter((s) => s === 'passed' || s === 'mastered').length;
  const isContinuing = next ? lessonStatuses[next.id] === 'in-progress' : false;

  const runPlanItem = (item: PlanItem) => {
    if (item.kind === 'drill') {
      launchPrescriptionDrill(item.songId, item.measureStart, item.measureEnd, item.targetBpm);
      return;
    }
    startLesson(item.lessonId);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Greeting and the numbers that matter */}
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1 className="font-display text-4xl text-white leading-tight">
            {greetingFor(new Date())}.
            {next && (
              <>
                <br />
                <span className="text-slate-400">Next up: {shortTitle(next.title)}.</span>
              </>
            )}
          </h1>
          <dl className="flex items-center gap-5 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${userProfile.streakDays > 1 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              <dd className="text-white font-semibold">{userProfile.streakDays}</dd>
              <dt>day{userProfile.streakDays === 1 ? '' : 's'}</dt>
            </div>
            <div className="flex items-center gap-1.5">
              <dd className="text-white font-semibold">{passedCount}</dd>
              <dt>lessons passed</dt>
            </div>
            <div className="flex items-center gap-1.5">
              <dd className="text-white font-semibold">{practiceMinutes}</dd>
              <dt>min practised</dt>
            </div>
          </dl>
        </div>

        {/* Continue: one card, one button */}
        {next && (
          <section className="glass-panel rounded-3xl p-7 border border-emerald-500/25 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-7 items-start md:items-center">
              <div className="flex-1 space-y-3 min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                  Lesson {next.code} · Level {next.levelId}{nextLevel ? ` · ${nextLevel.title}` : ''} · {LESSON_TYPE_LABELS[next.type]} · {next.durationMinutes} min
                </div>
                <h2 className="font-display text-3xl text-white leading-snug">{next.title}</h2>
                {next.subtitle && <p className="text-sm text-slate-300">{next.subtitle}</p>}
                {handPosition.length > 0 && (
                  <p className="text-sm text-slate-400">
                    Hand position for this lesson. The numbers are your fingers: 1 is the thumb.
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => startLesson(next.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isContinuing ? 'Continue lesson' : 'Start lesson'}
                  </button>
                  <button
                    onClick={() => openLesson(next.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Read the briefing first
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {handPosition.length > 0 && (
                <div className="shrink-0 bg-studio-950/70 rounded-2xl p-4 border border-white/5">
                  <KeyGlyph keys={handPosition} keyHeight={64} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Today's plan */}
        {plan.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-white">Today's practice</h3>
              <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> about {totalPlanMinutes(plan)} min
              </span>
            </div>
            <ol className="divide-y divide-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {plan.map((item, i) => (
                <li key={item.id} className="flex items-center gap-4 px-4 py-3 bg-studio-900/60 hover:bg-studio-900 transition-colors">
                  <span className="font-mono text-xs text-slate-500 w-4">{i + 1}</span>
                  <span className="text-emerald-400">{planIcon[item.kind]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-100 truncate">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{item.minutes} min</span>
                  <button
                    onClick={() => runPlanItem(item)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 transition-colors"
                  >
                    Start
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Quiet footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 flex-wrap gap-3">
          <span>
            {midiInputs.length > 0
              ? 'Your keyboard is connected.'
              : 'No keyboard connected. You can still play with the computer keys: Q W E R T = Sa Re Ga Ma Pa.'}
          </span>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('path')} className="hover:text-slate-300">
              See the whole path
            </button>
            <button onClick={replayFirstRun} className="hover:text-slate-300">
              Replay the introduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
