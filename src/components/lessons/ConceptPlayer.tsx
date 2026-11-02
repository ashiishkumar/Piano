import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ConceptLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useHeldMidis, useNoteOn } from '../../hooks/useMidiNotes';
import { advanceTryIt, initialTryIt, scoreConcept, tryItHeld, TryItState } from '../../engine/tryIt';
import { getWesternName } from '../../utils/notation';
import { KeyGlyph } from '../KeyGlyph';
import { PanelDiagram } from '../PanelDiagram';
import { LessonFrame, LessonIntro } from './LessonFrame';
import { CircleOfFifths, FingerNumbers } from './Diagrams';

export const ConceptPlayer: React.FC<{ lesson: ConceptLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [tryStates, setTryStates] = useState<Record<number, TryItState>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const held = useHeldMidis();

  const card = lesson.cards[index];
  const tryIt = card?.tryIt;
  const tryState = tryIt ? tryStates[index] ?? initialTryIt(tryIt) : null;
  const tryDone = !tryIt || tryState?.complete || skipped.has(index);
  const tryItCount = lesson.cards.filter((c) => c.tryIt).length;

  useNoteOn((e) => {
    if (!started || !tryIt || tryIt.together || tryDone) return;
    setTryStates((prev) => ({ ...prev, [index]: advanceTryIt(tryIt, prev[index] ?? initialTryIt(tryIt), e.midi) }));
  });

  // Together mode: satisfied by what is held right now
  useEffect(() => {
    if (!started || !tryIt?.together || tryDone) return;
    if (tryItHeld(tryIt, held)) {
      setTryStates((prev) => ({ ...prev, [index]: { ...(prev[index] ?? initialTryIt(tryIt)), complete: true } }));
    }
  }, [held, tryIt, tryDone, index, started]);

  const glyphKeys = useMemo(() => {
    const h = card?.highlight;
    if (!h) return [];
    return h.midis.map((m) => ({
      midi: m,
      hand: (h.colour === 'blue' ? 'left' : 'right') as 'left' | 'right',
      label: h.labels?.[m],
      matched: tryIt && !tryIt.together && !tryIt.anyOrder ? tryIt.targetMidis.slice(0, tryState?.done ?? 0).includes(m) : false,
    }));
  }, [card, tryIt, tryState]);

  const isLast = index === lesson.cards.length - 1;

  const next = () => {
    if (isLast) {
      finishActiveLesson(scoreConcept(tryItCount, skipped.size), skipped.size ? `${skipped.size} exercise${skipped.size === 1 ? '' : 's'} skipped` : undefined);
      return;
    }
    setIndex((i) => i + 1);
  };

  if (!started) {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={() => setStarted(true)} startLabel="Read on" />
      </LessonFrame>
    );
  }

  return (
    <LessonFrame lesson={lesson} progressLabel={`Card ${index + 1} of ${lesson.cards.length}`} progress={(index + 1) / lesson.cards.length}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h2 className="font-display text-3xl text-white leading-snug">{card.title}</h2>

        {card.body.split(/\n\n+/).map((p, i) => (
          <p key={i} className="text-lg text-slate-200 leading-relaxed">
            {p}
          </p>
        ))}

        {card.diagram === 'circle-of-fifths' && (
          <div className="flex justify-center">
            <CircleOfFifths highlightPc={0} />
          </div>
        )}
        {card.diagram === 'finger-numbers' && <FingerNumbers />}
        {card.diagram === 'panel' && <PanelDiagram className="w-full" />}

        {glyphKeys.length > 0 && (
          <div className="bg-studio-900 rounded-2xl p-5 border border-white/5 overflow-x-auto">
            <KeyGlyph keys={glyphKeys} keyHeight={72} />
          </div>
        )}

        {tryIt && (
          <div className={`rounded-2xl p-5 border ${tryDone ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/5'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-amber-300">Try it</div>
                <div className="text-lg text-white mt-0.5">{tryIt.prompt}</div>
                {!tryIt.together && (
                  <div className="font-mono text-sm text-slate-400 mt-2 flex items-center gap-1.5 flex-wrap">
                    {tryIt.targetMidis.map((m, i) => {
                      const hit = tryIt.anyOrder ? tryState?.hit[i] : i < (tryState?.done ?? 0);
                      return (
                        <span key={`${m}-${i}`} className={`px-1.5 py-0.5 rounded ${hit || tryDone ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5 text-slate-400'}`}>
                          {getWesternName(m, !tryIt.anyOctave)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="text-sm shrink-0">
                {tryDone ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Check className="w-4 h-4" /> {skipped.has(index) ? 'Skipped' : 'Done'}
                  </span>
                ) : (
                  <button onClick={() => setSkipped((s) => new Set(s).add(index))} className="text-slate-500 hover:text-slate-300">
                    Skip
                  </button>
                )}
              </div>
            </div>
            {tryState && tryState.wrongPresses > 0 && !tryDone && (
              <p className="text-xs text-amber-200 mt-3">Not that one. Start again from the first key.</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!tryDone}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
          >
            {isLast ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </LessonFrame>
  );
};
