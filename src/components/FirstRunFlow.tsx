import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Piano } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { midiManager } from '../services/MIDIManager';
import { LEVELS } from '../content/path';
import { nextLesson } from '../engine/progress';
import { getWesternName } from '../utils/notation';
import { KeyGlyph } from './KeyGlyph';

type Step = 1 | 2 | 3 | 4 | 5;

const SA_RE_GA = [60, 62, 64];

/**
 * The one-time introduction. Each screen has one job and one button.
 * Target: a first correct note within a minute of opening the app.
 */
export const FirstRunFlow: React.FC = () => {
  const { midiInputs, completeFirstRun, startLesson, lessonStatuses } = useStudioStore();
  const [step, setStep] = useState<Step>(1);
  const [lastNote, setLastNote] = useState<number | null>(null);
  const [foundMiddleC, setFoundMiddleC] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const stepRef = useRef(step);
  stepRef.current = step;
  const phraseRef = useRef(phraseIndex);
  phraseRef.current = phraseIndex;

  const device = midiInputs[0];
  const firstLesson = useMemo(() => nextLesson(LEVELS, lessonStatuses), [lessonStatuses]);

  // Listen to note-ons directly so the sequence check sees order, not just held keys.
  useEffect(() => {
    return midiManager.subscribe((ev) => {
      if (ev.type !== 'noteon') return;
      setLastNote(ev.midi);
      const s = stepRef.current;
      if (s === 3 && ev.midi === 60) setFoundMiddleC(true);
      if (s === 4) {
        const want = SA_RE_GA[phraseRef.current];
        if (ev.midi === want) setPhraseIndex((i) => Math.min(3, i + 1));
        else if (ev.midi === SA_RE_GA[0]) setPhraseIndex(1);
        else setPhraseIndex(0);
      }
    });
  }, []);

  const finish = async (openLesson: boolean) => {
    await completeFirstRun();
    if (openLesson && firstLesson) startLesson(firstLesson.id);
  };

  const Next: React.FC<{ label?: string; disabled?: boolean; onClick?: () => void }> = ({ label = 'Next', disabled, onClick }) => (
    <button
      onClick={onClick ?? (() => setStep((s) => Math.min(5, s + 1) as Step))}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );

  /** Where Middle C is relative to the key the learner pressed. */
  const relation = (midi: number) => (midi > 60 ? 'to the left of' : 'to the right of');

  return (
    <div className="fixed inset-0 z-[60] bg-studio-950 text-slate-100 flex flex-col select-none">
      <div className="h-14 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            <Piano className="w-4 h-4 text-slate-950 stroke-[2.2]" />
          </div>
          <span className="font-bold tracking-tight text-sm text-white">
            Virtuoso<span className="text-emerald-400">Studio</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ol className="flex items-center gap-1.5" aria-label="Introduction progress">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className={`h-1 rounded-full transition-all ${n <= step ? 'w-6 bg-emerald-400' : 'w-3 bg-white/15'}`} />
            ))}
          </ol>
          <button onClick={() => finish(false)} className="text-xs text-slate-500 hover:text-slate-300">
            Skip
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full space-y-8">
          {step === 1 && (
            <>
              <h1 className="font-display text-5xl text-white leading-tight">
                A teacher who hears
                <br />
                every key you press.
              </h1>
              <p className="text-lg text-slate-300 max-w-xl">
                Lessons go one note at a time and wait for you. Start from Sa Re Ga Ma; end up playing the songs you love, with both hands.
              </p>
              <Next label="Let's begin" />
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-4xl text-white leading-tight">
                {device ? 'Your keyboard is connected.' : 'Connect your keyboard.'}
              </h1>
              {device ? (
                <p className="text-lg text-slate-300">
                  We can hear <span className="text-emerald-300">{device.name}</span>. Press any key to check.
                </p>
              ) : (
                <div className="space-y-3 text-lg text-slate-300">
                  <p>
                    Plug the USB cable into the keyboard's <span className="font-mono text-slate-100">USB TO HOST</span> socket and into this computer, then switch the keyboard on.
                  </p>
                  <p className="text-base text-slate-400">
                    No keyboard yet? Use the computer keys: <span className="font-mono text-slate-200">Q W E R T</span> are Sa Re Ga Ma Pa.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Next />
                <span className={`font-mono text-sm transition-opacity ${lastNote !== null ? 'text-emerald-300 opacity-100' : 'opacity-0'}`}>
                  <Check className="w-4 h-4 inline mr-1" />
                  heard {lastNote !== null ? getWesternName(lastNote) : ''}
                </span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-4xl text-white leading-tight">Find Middle C. We call it Sa.</h1>
              <p className="text-lg text-slate-300">
                Look at the black keys: they come in groups of two and three. Find the group of <strong className="text-white">two</strong> nearest the middle of your keyboard. Middle C is the white key just to its left.
              </p>
              <div className="bg-studio-900 rounded-2xl p-5 border border-white/5 inline-block">
                <KeyGlyph keys={[{ midi: 60, hand: 'right', label: 'Sa' }]} from={48} to={71} keyHeight={80} />
              </div>
              <div className="flex items-center gap-4">
                <Next disabled={!foundMiddleC} />
                <span className="text-sm">
                  {foundMiddleC ? (
                    <span className="text-emerald-300">
                      <Check className="w-4 h-4 inline mr-1" />
                      That's it. Middle C.
                    </span>
                  ) : lastNote !== null && lastNote !== 60 ? (
                    <span className="text-amber-300">
                      That's {getWesternName(lastNote)}. Middle C is {relation(lastNote)} it.
                    </span>
                  ) : (
                    <span className="text-slate-500">Press it when you find it.</span>
                  )}
                </span>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-display text-4xl text-white leading-tight">Play Sa, Re, Ga.</h1>
              <p className="text-lg text-slate-300">
                Thumb on Sa. Then the next white key with your index finger, then the next with your middle finger. One at a time.
              </p>
              <div className="bg-studio-900 rounded-2xl p-5 border border-white/5 inline-block">
                <KeyGlyph
                  keys={SA_RE_GA.map((m, i) => ({
                    midi: m,
                    hand: 'right',
                    label: ['1', '2', '3'][i],
                    matched: i < phraseIndex,
                  }))}
                  from={60}
                  to={71}
                  keyHeight={80}
                />
              </div>
              <div className="flex items-center gap-4">
                <Next disabled={phraseIndex < 3} />
                <span className="text-sm">
                  {phraseIndex >= 3 ? (
                    <span className="text-emerald-300">
                      <Check className="w-4 h-4 inline mr-1" />
                      That was your first phrase.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      {['Sa', 'Re', 'Ga'].map((s, i) => (
                        <span key={s} className={`mr-2 ${i < phraseIndex ? 'text-emerald-300' : ''}`}>
                          {s}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="font-display text-4xl text-white leading-tight">Here is your path.</h1>
              <p className="text-lg text-slate-300 max-w-xl">
                Ten levels. The first one keeps your hand still on five keys until each finger knows its job. Every lesson waits for you at every note.
              </p>
              <ol className="space-y-2">
                {LEVELS.slice(0, 3).map((l) => (
                  <li key={l.id} className="flex items-baseline gap-3 text-slate-300">
                    <span className="font-mono text-xs text-slate-500 w-14">Level {l.id}</span>
                    <span className="font-display text-xl text-white">{l.title}</span>
                    <span className="text-sm text-slate-500 hidden sm:inline">{l.subtitle}</span>
                  </li>
                ))}
                <li className="text-sm text-slate-500 pl-[68px]">…and seven more.</li>
              </ol>
              <div className="flex items-center gap-4">
                <Next label={firstLesson ? `Start Lesson ${firstLesson.code}` : 'Go to Today'} onClick={() => finish(Boolean(firstLesson))} />
                <button onClick={() => finish(false)} className="text-sm text-slate-400 hover:text-white">
                  Look around first
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
