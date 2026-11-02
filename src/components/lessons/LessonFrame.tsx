import React from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Star } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { LESSON_BY_ID, LEVELS } from '../../content/path';
import { LESSON_TYPE_LABELS, ReadyLesson } from '../../types/lesson';
import { nextLesson } from '../../engine/progress';

interface FrameProps {
  lesson: ReadyLesson;
  /** e.g. "Card 2 of 5", "Chord 3 of 8" */
  progressLabel?: string;
  /** 0..1 */
  progress?: number;
  children: React.ReactNode;
}

/**
 * Chrome shared by every non-song lesson: back to the path, what this is, how far along.
 */
export const LessonFrame: React.FC<FrameProps> = ({ lesson, progressLabel, progress, children }) => {
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="bg-studio-900/95 border-b border-white/10 px-4 py-2 flex items-center gap-3 select-none shrink-0">
        <button
          onClick={() => setActiveTab('path')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Path
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
            Lesson {lesson.code} · {LESSON_TYPE_LABELS[lesson.type]}
          </div>
          <div className="text-sm font-semibold text-white truncate">{lesson.title}</div>
        </div>
        {progressLabel && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400">{progressLabel}</span>
            {progress !== undefined && (
              <div className="w-28 h-1.5 bg-studio-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
};

/** First screen of a lesson: title, why, what you will do, one button. */
export const LessonIntro: React.FC<{ lesson: ReadyLesson; onStart: () => void; startLabel?: string; children?: React.ReactNode }> = ({
  lesson,
  onStart,
  startLabel = 'Start',
  children,
}) => (
  <div className="max-w-2xl mx-auto px-6 py-12 space-y-7">
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
        {LESSON_TYPE_LABELS[lesson.type]} · about {lesson.durationMinutes} min
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
    {children}
    <button
      onClick={onStart}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors"
    >
      {startLabel}
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

/** The result card for a finished non-song lesson. */
export const LessonResultModal: React.FC = () => {
  const { lessonResult, closeLessonResult, openLesson, startLesson, setActiveTab, lessonStatuses } = useStudioStore();
  if (!lessonResult) return null;
  const lesson = LESSON_BY_ID[lessonResult.lessonId];
  const next = nextLesson(LEVELS, lessonStatuses);
  const nextIsDifferent = next && next.id !== lessonResult.lessonId;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="glass-panel rounded-3xl max-w-md w-full p-8 border border-emerald-500/30 space-y-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Lesson {lesson?.code}</div>
        <div className="font-display text-6xl text-white">{lessonResult.score}</div>
        <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${lessonResult.passed ? 'text-emerald-300' : 'text-amber-300'}`}>
          {lessonResult.mastered ? (
            <>
              <Star className="w-4 h-4 fill-current" /> Mastered
            </>
          ) : lessonResult.passed ? (
            <>
              <Check className="w-4 h-4" /> Passed
            </>
          ) : (
            'Not yet. Try once more.'
          )}
        </div>
        {lessonResult.summary && <p className="text-sm text-slate-300">{lessonResult.summary}</p>}
        <div className="flex flex-col gap-2 pt-2">
          {lessonResult.passed && nextIsDifferent && (
            <button
              onClick={() => {
                closeLessonResult();
                startLesson(next.id);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400"
            >
              Next: {next.title}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              closeLessonResult();
              openLesson(lessonResult.lessonId);
            }}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold ${
              lessonResult.passed ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => {
              closeLessonResult();
              setActiveTab('path');
            }}
            className="w-full px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Back to the path
          </button>
        </div>
      </div>
    </div>
  );
};
