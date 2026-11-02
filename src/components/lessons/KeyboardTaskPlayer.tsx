import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Cable, Check, Circle } from 'lucide-react';
import { KeyboardTaskLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useHeldMidis, useNoteOn } from '../../hooks/useMidiNotes';
import { midiManager } from '../../services/MIDIManager';
import { KeyboardStateSnapshot } from '../../engine/midi';
import { isManualOnly, scoreKeyboardTask, verifyStep } from '../../engine/keyboardTask';
import { recognizeChord } from '../../engine/theory';
import { PANEL_BY_ID } from '../../content/psrE373Panel';
import { PanelDiagram } from '../PanelDiagram';
import { LessonFrame, LessonIntro } from './LessonFrame';

type Outcome = 'verified' | 'confirmed';

const WAITING_TEXT: Record<string, string> = {
  'any-note': 'Waiting for a key…',
  'note-pressed': 'Waiting for the key…',
  'chord-held': 'Waiting for the chord…',
  'program-change': 'Waiting for a voice change over USB…',
  dual: 'Waiting to hear one key on two channels…',
  split: 'Waiting for two zones on two channels…',
  'style-running': 'Waiting for drums and bass on the style channels…',
  'style-stopped': 'Waiting for the style to stop…',
  'clock-running': 'Waiting for MIDI clock…',
  sustain: 'Waiting for the pedal…',
  'pitch-bend': 'Waiting for the wheel…',
  'touch-response': 'Play eight keys…',
  transpose: 'Waiting for a transposed note…',
  cc: 'Waiting for the setting to change…',
};

export const KeyboardTaskPlayer: React.FC<{ lesson: KeyboardTaskLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const midiInputs = useStudioStore((s) => s.midiInputs);
  const held = useHeldMidis();

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [stepDone, setStepDone] = useState<Outcome | null>(null);
  const [snap, setSnap] = useState<KeyboardStateSnapshot>(() => midiManager.getKeyboardState());
  const [lastNoteOn, setLastNoteOn] = useState<{ midi: number; at: number } | null>(null);
  const sinceRef = useRef(performance.now());
  const sawStyleRef = useRef(false);

  const step = lesson.steps[index];

  useEffect(() => midiManager.subscribeKeyboardState(setSnap), []);
  useNoteOn((e) => setLastNoteOn({ midi: e.midi, at: e.at }));

  // New step: reset the evidence window
  useEffect(() => {
    sinceRef.current = performance.now();
    sawStyleRef.current = false;
    setStepDone(null);
    if (step?.verify.kind === 'touch-response') midiManager.resetVelocitySample();
  }, [index, step]);

  // Live verification
  useEffect(() => {
    if (!started || !step || stepDone) return;
    if (snap.styleRunning) sawStyleRef.current = true;
    const ok = verifyStep(step.verify, {
      snapshot: snap,
      heldMidis: held,
      lastNoteOn,
      since: sinceRef.current,
      sawStyleSince: sawStyleRef.current,
    });
    if (ok) setStepDone('verified');
  }, [snap, held, lastNoteOn, started, step, stepDone]);

  const confirm = () => {
    if (!stepDone) setStepDone('confirmed');
  };

  const next = () => {
    if (!stepDone) return;
    const all = [...outcomes, stepDone];
    if (index + 1 >= lesson.steps.length) {
      const verified = all.filter((o) => o === 'verified').length;
      finishActiveLesson(scoreKeyboardTask(all), `${verified} of ${all.length} steps confirmed over USB`);
      return;
    }
    setOutcomes(all);
    setIndex(index + 1);
  };

  const region = step?.panelButton ? PANEL_BY_ID[step.panelButton] : undefined;
  const manual = step ? isManualOnly(step.verify) : true;

  // Small live widgets relevant to the current verification
  const widget = useMemo(() => {
    if (!step) return null;
    switch (step.verify.kind) {
      case 'touch-response': {
        const v = snap.velocity.recent.slice(-16);
        return (
          <div className="space-y-1.5">
            <div className="flex items-end gap-1 h-16">
              {v.length === 0 && <span className="text-xs text-slate-600 self-center">touch meter</span>}
              {v.map((vel, i) => (
                <div key={i} className="w-3 rounded-t bg-emerald-400" style={{ height: `${(vel / 127) * 100}%`, opacity: 0.5 + (i / v.length) * 0.5 }} title={String(vel)} />
              ))}
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              {v.length ? `${snap.velocity.min}–${snap.velocity.max} · ${snap.velocity.touchResponseGuess}` : 'velocity 1–127'}
            </div>
          </div>
        );
      }
      case 'chord-held':
        return <div className="font-display text-3xl text-white">{recognizeChord(held)?.symbol ?? <span className="text-slate-600 text-xl">hold a chord</span>}</div>;
      case 'dual':
      case 'split':
      case 'style-running':
      case 'style-stopped':
      case 'clock-running':
        return (
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {[
              ['Dual', snap.dualDetected],
              ['Split', snap.splitDetected],
              ['Style', snap.styleRunning],
              ['Clock', snap.clock.running],
            ].map(([label, on]) => (
              <span key={String(label)} className={`px-2 py-0.5 rounded border ${on ? 'border-emerald-500/50 text-emerald-200' : 'border-white/10 text-slate-600'}`}>
                {String(label)}
              </span>
            ))}
            {snap.melodyChannelsActive.length > 0 && <span className="text-slate-500">ch {snap.melodyChannelsActive.join(',')}</span>}
          </div>
        );
      case 'program-change':
        return snap.lastProgramChange ? (
          <div className="text-sm text-slate-300">
            Heard: <span className="text-white">{snap.lastProgramChange.voiceName}</span>
          </div>
        ) : null;
      default:
        return null;
    }
  }, [step, snap, held]);

  if (!started) {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={() => setStarted(true)} startLabel="Start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 flex items-start gap-3">
            <Cable className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              {midiInputs.length > 0 ? (
                <>
                  Your keyboard is connected. Most steps confirm themselves the moment the keyboard sends the evidence; the rest have a Done button.
                </>
              ) : (
                <>
                  No USB keyboard found. You can still read through and mark each step done; connect the keyboard to have the steps confirm themselves.
                </>
              )}
            </div>
          </div>
        </LessonIntro>
      </LessonFrame>
    );
  }

  return (
    <LessonFrame lesson={lesson} progressLabel={`Step ${index + 1} of ${lesson.steps.length}`} progress={index / lesson.steps.length}>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6 select-none">
        <div className="bg-studio-900 rounded-2xl border border-white/5 p-3">
          <PanelDiagram highlight={step.panelButton ? [step.panelButton] : []} className="w-full" />
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[11px] text-slate-500">{region ? region.label : 'PSR-E373 panel'}</span>
            <span className="text-[10px] text-slate-600">schematic</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-white leading-snug">{step.instruction}</h2>
            {region?.tip && !stepDone && <p className="text-sm text-slate-400">{region.tip}</p>}

            <div className={`rounded-2xl p-4 border ${stepDone ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
              {stepDone ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-200 font-semibold text-sm">
                    <Check className="w-4 h-4" />
                    {stepDone === 'verified' ? 'Confirmed over USB' : 'Marked done'}
                  </div>
                  {step.explanation && <p className="text-slate-200">{step.explanation}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    {manual ? <Circle className="w-4 h-4 text-slate-600" /> : <Cable className="w-4 h-4 text-amber-400 animate-pulse" />}
                    {manual ? 'This one is on trust.' : WAITING_TEXT[step.verify.kind] ?? 'Waiting…'}
                  </div>
                  <button onClick={confirm} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10">
                    {manual ? 'Done' : 'Mark done anyway'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={next}
                disabled={!stepDone}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
              >
                {index + 1 >= lesson.steps.length ? 'Finish' : 'Next step'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            {widget && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">{widget}</div>}
            <ol className="space-y-1">
              {lesson.steps.map((s, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs ${i === index ? 'text-white' : i < index ? 'text-emerald-300/80' : 'text-slate-600'}`}>
                  {i < index ? <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <span className="font-mono w-3.5 shrink-0">{i + 1}</span>}
                  <span className="truncate">{s.panelButton ? PANEL_BY_ID[s.panelButton]?.label : s.instruction.slice(0, 48)}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </LessonFrame>
  );
};
