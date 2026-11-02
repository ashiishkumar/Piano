import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { QuizLesson, QuizQuestion } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useHeldMidis, useNoteOn } from '../../hooks/useMidiNotes';
import { pitchClass, recognizeChord, uniquePitchClasses } from '../../engine/theory';
import { getWesternName } from '../../utils/notation';
import { LessonFrame, LessonIntro } from './LessonFrame';
import { playNotes } from './EarPlayer';
import { Volume2 } from 'lucide-react';

function hearQuestion(q: QuizQuestion): void {
  if (!q.playMidis?.length) return;
  const events = q.playAsChord
    ? q.playMidis.map((midi) => ({ midi, at: 0, duration: 1.6 }))
    : q.playMidis.map((midi, i) => ({ midi, at: i * 0.5, duration: 0.45 }));
  playNotes(events);
}

type Answer = { correct: boolean; detail: string };

function chordMatches(q: QuizQuestion, held: number[]): boolean {
  if (!q.answerMidis || held.length === 0) return false;
  const want = uniquePitchClasses(q.answerMidis);
  const have = uniquePitchClasses(held);
  if (want.length !== have.length) return false;
  return want.every((pc, i) => pc === have[i]);
}

export const QuizPlayer: React.FC<{ lesson: QuizLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const held = useHeldMidis();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState<Answer | null>(null);

  const q = lesson.questions[index];
  const answered = current !== null;

  const answer = (correct: boolean, detail: string) => {
    if (answered) return;
    setCurrent({ correct, detail });
  };

  useNoteOn((e) => {
    if (!started || answered || !q || q.kind !== 'press-key' || !q.answerMidis) return;
    const want = q.answerMidis[0];
    const ok = q.anyOctave ? pitchClass(e.midi) === pitchClass(want) : e.midi === want;
    answer(ok, `You pressed ${getWesternName(e.midi)}.`);
  });

  useEffect(() => {
    if (!started || answered || !q || q.kind !== 'press-chord') return;
    if (held.length < 3) return;
    if (chordMatches(q, held)) answer(true, `You held ${recognizeChord(held)?.symbol ?? 'the chord'}.`);
    else if (recognizeChord(held)) answer(false, `You held ${recognizeChord(held)!.symbol}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, started, answered, index]);

  const next = () => {
    if (!current) return;
    const all = [...answers, current];
    if (index + 1 >= lesson.questions.length) {
      const correct = all.filter((a) => a.correct).length;
      finishActiveLesson(Math.round((correct / all.length) * 100), `${correct} of ${all.length} correct`);
      return;
    }
    setAnswers(all);
    setCurrent(null);
    setIndex(index + 1);
  };

  if (!started) {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={() => setStarted(true)} startLabel="Start the quiz">
          <p className="text-sm text-slate-400">{lesson.questions.length} questions. Some are answered on the keyboard.</p>
        </LessonIntro>
      </LessonFrame>
    );
  }

  const correctSoFar = answers.filter((a) => a.correct).length + (current?.correct ? 1 : 0);

  return (
    <LessonFrame lesson={lesson} progressLabel={`Question ${index + 1} of ${lesson.questions.length}`} progress={index / lesson.questions.length}>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-7 select-none">
        <div className="font-mono text-xs text-slate-500">{correctSoFar} correct so far</div>
        <h2 className="font-display text-3xl text-white leading-snug">{q.prompt}</h2>

        {q.playMidis && q.playMidis.length > 0 && (
          <button
            onClick={() => hearQuestion(q)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 hover:bg-white/10"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Hear it
          </button>
        )}

        {q.kind === 'choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.choices!.map((c, i) => {
              const isAnswer = i === q.answerIndex;
              const state = !answered ? 'idle' : isAnswer ? 'right' : current.detail === c ? 'wrong' : 'dim';
              return (
                <button
                  key={c}
                  disabled={answered}
                  onClick={() => answer(isAnswer, c)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    state === 'idle'
                      ? 'border-white/10 bg-white/[0.03] text-slate-100 hover:border-emerald-500/50 hover:bg-white/[0.06]'
                      : state === 'right'
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                      : state === 'wrong'
                      ? 'border-rose-500/60 bg-rose-500/10 text-rose-200'
                      : 'border-white/5 text-slate-500'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {(q.kind === 'press-key' || q.kind === 'press-chord') && !answered && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-slate-200">
            {q.kind === 'press-key' ? 'Press the key on your keyboard.' : 'Hold the chord on your keyboard.'}
            {held.length > 0 && <span className="font-mono text-slate-400 ml-2">{held.map((m) => getWesternName(m)).join(' ')}</span>}
          </div>
        )}

        {answered && (
          <div className={`rounded-2xl p-5 border ${current.correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}>
            <div className={`flex items-center gap-2 font-semibold ${current.correct ? 'text-emerald-200' : 'text-rose-200'}`}>
              {current.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {current.correct ? 'Right.' : 'Not quite.'}
              {q.kind !== 'choice' && <span className="font-normal text-slate-300">{current.detail}</span>}
            </div>
            <p className="text-slate-200 mt-2">{q.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={next}
            disabled={!answered}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
          >
            {index + 1 >= lesson.questions.length ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </LessonFrame>
  );
};
