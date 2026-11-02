import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Ear, Volume2 } from 'lucide-react';
import { EarLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useHeldMidis, useNoteOn } from '../../hooks/useMidiNotes';
import { audioEngine } from '../../services/AudioEngine';
import { advanceEar, earChordHeld, earPlayback, EarAttemptState, initialEarState, playbackLength, scoreEarLesson } from '../../engine/ear';
import { recognizeChord } from '../../engine/theory';
import { getSargamLabel, getWesternName } from '../../utils/notation';
import { KeyGlyph } from '../KeyGlyph';
import { LessonFrame, LessonIntro } from './LessonFrame';

/** Play a list of timed notes through the app's piano. Returns a cancel function. */
export function playNotes(events: { midi: number; at: number; duration: number }[]): () => void {
  audioEngine.init().catch(() => {});
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (const e of events) {
    timers.push(setTimeout(() => audioEngine.noteOn(e.midi, 84, true), e.at * 1000));
    timers.push(setTimeout(() => audioEngine.noteOff(e.midi), (e.at + e.duration) * 1000));
  }
  return () => {
    timers.forEach(clearTimeout);
    events.forEach((e) => audioEngine.noteOff(e.midi));
  };
}

export const EarPlayer: React.FC<{ lesson: EarLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const held = useHeldMidis();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<EarAttemptState>(initialEarState());
  const [done, setDone] = useState<EarAttemptState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [heardOnce, setHeardOnce] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const wrongChordRef = useRef<string | null>(null);

  const item = lesson.items[index];

  const play = useCallback(
    (countsAsReplay: boolean) => {
      if (!item) return;
      cancelRef.current?.();
      const events = earPlayback(item);
      cancelRef.current = playNotes(events);
      setPlaying(true);
      setTimeout(() => setPlaying(false), playbackLength(events) * 1000 + 100);
      if (countsAsReplay) setState((s) => ({ ...s, replaysUsed: s.replaysUsed + 1 }));
      setHeardOnce(true);
    },
    [item]
  );

  // Auto-play each new item once
  useEffect(() => {
    if (!started) return;
    setState(initialEarState());
    setHeardOnce(false);
    wrongChordRef.current = null;
    const t = setTimeout(() => play(false), 400);
    return () => {
      clearTimeout(t);
      cancelRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, started]);

  useNoteOn((e) => {
    if (!started || !item || state.complete || playing || item.kind === 'chord') return;
    setState((s) => advanceEar(item, s, e.midi));
  });

  useEffect(() => {
    if (!started || !item || item.kind !== 'chord' || state.complete || playing) return;
    const verdict = earChordHeld(item, held);
    if (verdict === 'match') setState((s) => ({ ...s, complete: true }));
    else if (verdict === 'wrong') {
      const name = recognizeChord(held)?.symbol ?? held.join(',');
      if (name !== wrongChordRef.current) {
        wrongChordRef.current = name;
        setState((s) => ({ ...s, wrongAttempts: s.wrongAttempts + 1 }));
      }
    } else wrongChordRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, started, index, playing]);

  const next = () => {
    const all = [...done, state];
    if (index + 1 >= lesson.items.length) {
      const score = scoreEarLesson(all, lesson.freeReplays);
      const clean = all.filter((s) => s.wrongAttempts === 0).length;
      finishActiveLesson(score, `${clean} of ${all.length} heard first time`);
      return;
    }
    setDone(all);
    setIndex(index + 1);
  };

  if (!started) {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={() => setStarted(true)} startLabel="Start listening">
          <p className="text-sm text-slate-400">
            {lesson.items.length} items. You hear each one, then play it back. {lesson.freeReplays} free replay{lesson.freeReplays === 1 ? '' : 's'} per item; more cost a little.
            {lesson.items.some((i) => i.referenceMidi !== undefined) && ' You will hear Sa first each time.'}
          </p>
        </LessonIntro>
      </LessonFrame>
    );
  }

  const kindLabel = { note: 'one note', interval: 'two notes', chord: 'a chord', melody: `${item.targetMidis.length} notes` }[item.kind];
  const revealKeys = item.targetMidis.map((m) => ({ midi: m, hand: 'right' as const, label: getSargamLabel(m).short }));

  return (
    <LessonFrame lesson={lesson} progressLabel={`${index + 1} of ${lesson.items.length}`} progress={index / lesson.items.length}>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-7 select-none">
        <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
          {item.referenceMidi !== undefined ? 'Sa, then ' : ''}
          {kindLabel}
        </div>
        <h2 className="font-display text-3xl text-white leading-snug">{item.prompt ?? (item.kind === 'chord' ? 'Hold the chord you hear.' : 'Play back what you hear.')}</h2>

        <div className={`rounded-2xl border p-6 flex items-center gap-5 ${state.complete ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
          <button
            onClick={() => play(heardOnce)}
            disabled={playing}
            className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 disabled:opacity-60 shrink-0"
            aria-label="Play again"
          >
            {playing ? <Ear className="w-7 h-7 animate-pulse" /> : <Volume2 className="w-7 h-7" />}
          </button>
          <div className="flex-1 min-w-0">
            {state.complete ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Check className="w-4 h-4" /> {state.wrongAttempts === 0 ? 'First time.' : `Got it after ${state.wrongAttempts} wrong ${state.wrongAttempts === 1 ? 'try' : 'tries'}.`}
                </div>
                <div className="text-sm text-slate-300">
                  {item.targetMidis.map((m) => `${getSargamLabel(m).short} (${getWesternName(m)})`).join(item.kind === 'chord' ? ' + ' : ', ')}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-sm text-slate-300">{playing ? 'Listening…' : item.kind === 'chord' ? 'Now hold it on the keyboard.' : 'Now play it on the keyboard.'}</div>
                {item.kind !== 'chord' && item.targetMidis.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    {item.targetMidis.map((_, i) => (
                      <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < state.played.length ? 'bg-emerald-400' : 'bg-white/15'}`} />
                    ))}
                  </div>
                )}
                {state.wrongAttempts > 0 && <div className="text-xs text-amber-300">Not that one. Listen again if you need to.</div>}
                <div className="text-[11px] text-slate-500">
                  Replays: {state.replaysUsed} ({lesson.freeReplays} free)
                </div>
              </div>
            )}
          </div>
        </div>

        {state.complete && (
          <div className="bg-studio-900 rounded-2xl p-4 border border-white/5 inline-block">
            <KeyGlyph keys={revealKeys} keyHeight={64} />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={next}
            disabled={!state.complete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
          >
            {index + 1 >= lesson.items.length ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </LessonFrame>
  );
};
