import React, { useMemo } from 'react';
import { ArrowRight, Check, Circle, Flag } from 'lucide-react';
import { CheckpointLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { LESSON_BY_ID } from '../../content/path';
import { LESSON_TYPE_LABELS } from '../../types/lesson';
import { LessonFrame } from './LessonFrame';

/**
 * A checkpoint is a gate: pass the listed lessons at the listed scores. It reads
 * progress rather than re-running the lessons, and offers each part in one click.
 */
export const CheckpointPlayer: React.FC<{ lesson: CheckpointLesson }> = ({ lesson }) => {
  const { lessonProgress, openLesson, finishActiveLesson } = useStudioStore();

  const parts = useMemo(
    () =>
      lesson.parts.map((p) => {
        const target = LESSON_BY_ID[p.lessonId];
        const best = lessonProgress[p.lessonId]?.bestScore ?? null;
        return { ...p, target, best, met: best !== null && best >= p.passScore };
      }),
    [lesson.parts, lessonProgress]
  );

  const metCount = parts.filter((p) => p.met).length;
  const average = parts.length ? Math.round(parts.reduce((a, p) => a + (p.best ?? 0), 0) / parts.length) : 0;
  const complete = lesson.passAll ? metCount === parts.length : average >= Math.min(...parts.map((p) => p.passScore));
  const nextPart = parts.find((p) => !p.met);

  return (
    <LessonFrame lesson={lesson} progressLabel={`${metCount} of ${parts.length}`} progress={parts.length ? metCount / parts.length : 0}>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-7 select-none">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" /> Checkpoint
          </div>
          <h1 className="font-display text-4xl text-white leading-tight mt-1">{lesson.title}</h1>
          {lesson.subtitle && <p className="text-slate-400 mt-1">{lesson.subtitle}</p>}
        </div>

        <ul className="space-y-2">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
              <span>{o}</span>
            </li>
          ))}
        </ul>

        <ol className="divide-y divide-white/5 rounded-2xl border border-white/10 overflow-hidden">
          {parts.map((p) => (
            <li key={p.lessonId} className="flex items-center gap-4 px-4 py-3 bg-studio-900/60">
              {p.met ? <Check className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-100 truncate">
                  <span className="font-mono text-slate-500 mr-2">{p.target?.code}</span>
                  {p.target?.title ?? p.lessonId}
                </div>
                <div className="text-xs text-slate-500">
                  {p.target ? LESSON_TYPE_LABELS[p.target.type] : ''} · need {p.passScore}
                  {p.best !== null ? ` · best ${p.best}` : ' · not yet played'}
                </div>
              </div>
              {!p.met && p.target && (
                <button
                  onClick={() => openLesson(p.lessonId)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 transition-colors"
                >
                  {p.best === null ? 'Start' : 'Try again'}
                </button>
              )}
            </li>
          ))}
        </ol>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-slate-400">
            {complete ? 'Every part is passed. Complete the checkpoint to unlock the next level.' : nextPart ? `Next up: ${nextPart.target?.title ?? nextPart.lessonId}.` : ''}
          </span>
          <button
            onClick={() => finishActiveLesson(average, `${metCount} of ${parts.length} parts passed`)}
            disabled={!complete}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
          >
            Complete checkpoint
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </LessonFrame>
  );
};
