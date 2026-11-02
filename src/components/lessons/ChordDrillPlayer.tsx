import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { ChordDrillLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useHeldMidis } from '../../hooks/useMidiNotes';
import { audioEngine } from '../../services/AudioEngine';
import { ChordResult, chordDueTimes, evaluateHeld, scoreChordDrill, specSymbol, specVoicing } from '../../engine/chordDrill';
import { chordPitchClasses, recognizeChord } from '../../engine/theory';
import { classifyRhythmTiming } from '../../engine/timing';
import { KeyGlyph } from '../KeyGlyph';
import { LessonFrame, LessonIntro } from './LessonFrame';

type Phase = 'intro' | 'running' | 'done';
const TONE_LABEL = ['R', '3', '5', '7', '9'];

export const ChordDrillPlayer: React.FC<{ lesson: ChordDrillLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const held = useHeldMidis();

  const sequence = useMemo(() => Array.from({ length: lesson.repeats }, () => lesson.sequence).flat(), [lesson]);
  const due = useMemo(() => (lesson.mode === 'metronome' ? chordDueTimes(lesson) : null), [lesson]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ChordResult[]>([]);
  const [wrongNow, setWrongNow] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [clock, setClock] = useState(0);
  const shownAtRef = useRef(0);
  const startRef = useRef(0);
  const armedRef = useRef(true); // must release before the next chord can match
  const wrongCountRef = useRef(0);
  const lastWrongRef = useRef<string | null>(null);
  const lastBeatRef = useRef(-1);
  const advancingRef = useRef(false);

  const spec = sequence[index];
  const voicing = useMemo(() => (spec ? specVoicing(spec) : []), [spec]);
  const glyphKeys = useMemo(
    () => voicing.map((m, i) => ({ midi: m, hand: 'left' as const, label: TONE_LABEL[i] })),
    [voicing]
  );
  const nextSpec = sequence[index + 1];

  const start = () => {
    audioEngine.init().catch(() => {});
    const now = performance.now();
    startRef.current = now;
    shownAtRef.current = now;
    armedRef.current = true;
    wrongCountRef.current = 0;
    lastWrongRef.current = null;
    lastBeatRef.current = -1;
    setResults([]);
    setIndex(0);
    setPhase('running');
  };

  const finish = (all: ChordResult[]) => {
    const s = scoreChordDrill(lesson, all);
    setPhase('done');
    finishActiveLesson(
      s.score,
      `${s.cleanChanges} of ${s.total} clean changes${s.wrongAttempts ? `, ${s.wrongAttempts} wrong chord${s.wrongAttempts === 1 ? '' : 's'}` : ''}${
        lesson.mode !== 'metronome' && s.meanTransitionMs ? `, ${(s.meanTransitionMs / 1000).toFixed(1)} s per change` : ''
      }`
    );
  };

  const advance = (result: ChordResult) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setFlash(true);
    const all = [...results, result];
    setResults(all);
    setTimeout(() => {
      setFlash(false);
      advancingRef.current = false;
      if (index + 1 >= sequence.length) {
        finish(all);
        return;
      }
      setIndex(index + 1);
      shownAtRef.current = performance.now();
      armedRef.current = false;
      wrongCountRef.current = 0;
      lastWrongRef.current = null;
      setWrongNow(null);
    }, 350);
  };

  // Evaluate held keys against the current chord
  useEffect(() => {
    if (phase !== 'running' || !spec || advancingRef.current) return;
    const targetSize = chordPitchClasses(spec.rootPc, spec.quality).length;
    const distinct = new Set(held.map((m) => ((m % 12) + 12) % 12)).size;
    if (!armedRef.current) {
      if (distinct < targetSize) armedRef.current = true;
      else return;
    }
    const verdict = evaluateHeld(spec, held, lesson.match);
    if (verdict === 'match') {
      const now = performance.now();
      const result: ChordResult = {
        index,
        symbol: specSymbol(spec),
        transitionMs: Math.round(now - shownAtRef.current),
        wrongAttempts: wrongCountRef.current,
      };
      if (due) {
        const t = (now - startRef.current) / 1000;
        result.deltaMs = Math.round((t - due.dueSec[index]) * 1000);
      }
      advance(result);
    } else if (verdict === 'wrong') {
      const name = recognizeChord(held)?.symbol ?? null;
      if (name && name !== lastWrongRef.current) {
        lastWrongRef.current = name;
        wrongCountRef.current += 1;
        setWrongNow(name);
      }
    } else {
      setWrongNow(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, phase, index]);

  // Metronome mode clock: clicks, and a missed chord when the next one falls due
  useEffect(() => {
    if (phase !== 'running' || !due) return;
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setClock(t);
      const beat = Math.floor(t / due.secondsPerBeat);
      if (beat > lastBeatRef.current && t < due.totalSec) {
        lastBeatRef.current = beat;
        audioEngine.playMetronomeClick(beat % (lesson.beatsPerChord ?? 4) === 0);
      }
      const nextDue = due.dueSec[index + 1] ?? due.totalSec;
      if (t >= nextDue && !advancingRef.current) {
        advance({ index, symbol: specSymbol(spec), transitionMs: 0, wrongAttempts: wrongCountRef.current, missed: true });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, due, index]);

  if (phase === 'intro') {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={start}>
          <div className="flex items-center gap-2 flex-wrap">
            {lesson.sequence.map((s, i) => (
              <span key={i} className="font-mono text-sm px-2.5 py-1 rounded-lg bg-white/5 text-slate-200">
                {specSymbol(s)}
              </span>
            ))}
            {lesson.repeats > 1 && <span className="text-xs text-slate-500">× {lesson.repeats}</span>}
          </div>
          <p className="text-sm text-slate-400">
            {lesson.mode === 'free' && 'No clock. Hold each chord until it turns green, then move to the next. Any octave, any inversion.'}
            {lesson.mode === 'timed' && `Change as quickly as you can without wrong notes. Under ${((lesson.targetTransitionMs ?? 1500) / 1000).toFixed(1)} s per change is the target.`}
            {lesson.mode === 'metronome' && `Change chords on the beat: every ${lesson.beatsPerChord ?? 4} beats at ${lesson.bpm ?? 60} BPM.`}
          </p>
        </LessonIntro>
      </LessonFrame>
    );
  }

  const elapsedMs = Math.round(performance.now() - shownAtRef.current);
  const heldName = recognizeChord(held)?.symbol;

  return (
    <LessonFrame lesson={lesson} progressLabel={`Chord ${Math.min(index + 1, sequence.length)} of ${sequence.length}`} progress={index / sequence.length}>
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center select-none">
        <div className="space-y-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {lesson.mode === 'metronome' && due ? `Beat ${(Math.floor(clock / due.secondsPerBeat) % (lesson.beatsPerChord ?? 4)) + 1}` : 'Hold this chord'}
          </div>
          <div className={`font-display text-8xl leading-none transition-colors ${flash ? 'text-emerald-300' : 'text-white'}`}>
            {spec ? specSymbol(spec) : ''}
            {flash && <Check className="inline w-12 h-12 ml-4 text-emerald-300" />}
          </div>
          <div className="text-slate-400 text-sm h-5">
            {wrongNow ? (
              <span className="text-amber-300">That is {wrongNow}. We need {spec ? specSymbol(spec) : ''}.</span>
            ) : heldName && !flash ? (
              <span>Holding {heldName}…</span>
            ) : held.length > 0 && !flash ? (
              <span>{held.length} key{held.length === 1 ? '' : 's'} down</span>
            ) : null}
          </div>
          <div className="flex items-center gap-6 text-sm">
            {lesson.mode !== 'metronome' && (
              <span className="font-mono text-slate-400">
                {(elapsedMs / 1000).toFixed(1)} s
                {lesson.mode === 'timed' && <span className="text-slate-600"> / {((lesson.targetTransitionMs ?? 1500) / 1000).toFixed(1)} s</span>}
              </span>
            )}
            {nextSpec && (
              <span className="text-slate-500">
                next: <span className="font-mono text-slate-300">{specSymbol(nextSpec)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="bg-studio-900 rounded-2xl p-5 border border-white/5 justify-self-center">
          <KeyGlyph keys={glyphKeys} keyHeight={88} />
          <div className="text-[11px] text-slate-500 text-center mt-2">One way to play it. Any octave or inversion counts.</div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-8 flex items-center gap-1.5 flex-wrap">
        {sequence.map((s, i) => {
          const r = results[i];
          return (
            <span
              key={i}
              className={`font-mono text-xs px-2 py-1 rounded-md border ${
                i === index
                  ? 'border-emerald-400 text-white'
                  : r
                  ? r.missed
                    ? 'border-rose-500/40 text-rose-300'
                    : r.wrongAttempts > 0
                    ? 'border-amber-500/40 text-amber-200'
                    : 'border-emerald-500/40 text-emerald-200'
                  : 'border-white/10 text-slate-500'
              }`}
            >
              {specSymbol(s)}
              {r && !r.missed && lesson.mode !== 'metronome' && <span className="text-slate-500"> {(r.transitionMs / 1000).toFixed(1)}s</span>}
              {r?.deltaMs !== undefined && !r.missed && <span className="text-slate-500"> {classifyRhythmTiming(r.deltaMs)}</span>}
            </span>
          );
        })}
      </div>
    </LessonFrame>
  );
};
