import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RhythmLesson } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { useNoteOn } from '../../hooks/useMidiNotes';
import { audioEngine } from '../../services/AudioEngine';
import { buildRhythmSchedule, findMissedOnsets, matchTap, scoreRhythm, TapResult } from '../../engine/rhythm';
import { LessonFrame, LessonIntro } from './LessonFrame';

type Phase = 'intro' | 'running' | 'done';

const hitColour: Record<string, string> = {
  perfect: '#34d399',
  good: '#38bdf8',
  early: '#fbbf24',
  late: '#fbbf24',
  missed: '#f43f5e',
};

export const RhythmPlayer: React.FC<{ lesson: RhythmLesson }> = ({ lesson }) => {
  const finishActiveLesson = useStudioStore((s) => s.finishActiveLesson);
  const schedule = useMemo(() => buildRhythmSchedule(lesson), [lesson]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [clock, setClock] = useState(0); // seconds since start
  const startRef = useRef<number | null>(null);
  const matchedRef = useRef<Set<string>>(new Set());
  const tapsRef = useRef<TapResult[]>([]);
  const missedRef = useRef<Set<string>>(new Set());
  const lastBeatRef = useRef(-1);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const start = () => {
    audioEngine.init().catch(() => {});
    matchedRef.current = new Set();
    tapsRef.current = [];
    missedRef.current = new Set();
    lastBeatRef.current = -1;
    startRef.current = performance.now();
    setPhase('running');
  };

  // Clock loop: metronome, misses, end of exercise
  useEffect(() => {
    if (phase !== 'running') return;
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - (startRef.current ?? 0)) / 1000;
      setClock(t);
      const beat = Math.floor(t / schedule.secondsPerBeat);
      if (beat > lastBeatRef.current && t < schedule.totalSec) {
        lastBeatRef.current = beat;
        audioEngine.playMetronomeClick(beat % schedule.beatsPerBar === 0);
      }
      for (const o of findMissedOnsets(schedule, matchedRef.current, t)) {
        if (!missedRef.current.has(o.id)) {
          missedRef.current.add(o.id);
          matchedRef.current.add(o.id); // no longer available to taps
        }
      }
      if (t >= schedule.totalSec + 0.4) {
        const result = scoreRhythm(schedule, tapsRef.current, missedRef.current.size);
        setPhase('done');
        finishActiveLesson(
          result.score,
          `${result.hits} of ${result.total} taps landed, ${result.perfect} perfect${result.extra ? `, ${result.extra} stray` : ''}${
            result.meanDeltaMs ? `, on average ${result.meanDeltaMs > 0 ? '+' : ''}${result.meanDeltaMs} ms` : ''
          }`
        );
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, schedule, finishActiveLesson]);

  useNoteOn((e) => {
    if (phase !== 'running' || startRef.current === null) return;
    const t = (e.at - startRef.current) / 1000;
    if (t < schedule.countInSec - 0.2) return; // taps during count-in are ignored
    const tap = matchTap(schedule, matchedRef.current, t);
    if (tap.onsetId) matchedRef.current.add(tap.onsetId);
    tapsRef.current.push(tap);
    rerender();
  });

  if (phase === 'intro') {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={start} startLabel="Start with a count-in">
          <p className="text-sm text-slate-400">
            Tap any key, on your keyboard or the computer keys, exactly on each marker. {lesson.bpm} beats per minute, {lesson.countInBars} bar of clicks first, {lesson.repeats} passes.
          </p>
        </LessonIntro>
      </LessonFrame>
    );
  }

  // Which pass and where in it
  const inCountIn = clock < schedule.countInSec;
  const passLen = schedule.patternBeats * schedule.secondsPerBeat;
  const sinceStart = Math.max(0, clock - schedule.countInSec);
  const pass = Math.min(lesson.repeats - 1, Math.floor(sinceStart / passLen));
  const posBeats = inCountIn ? 0 : (sinceStart - pass * passLen) / schedule.secondsPerBeat;
  const beatInBar = Math.floor(((inCountIn ? clock : sinceStart) / schedule.secondsPerBeat) % schedule.beatsPerBar) + 1;
  const bars = schedule.patternBeats / schedule.beatsPerBar;

  const tapsByOnset = new Map(tapsRef.current.filter((t) => t.onsetId).map((t) => [t.onsetId!, t]));

  return (
    <LessonFrame lesson={lesson} progressLabel={`Pass ${pass + 1} of ${lesson.repeats}`} progress={Math.min(1, clock / schedule.totalSec)}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 select-none">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{inCountIn ? 'Count-in' : `Bar ${Math.floor(posBeats / schedule.beatsPerBar) + 1} of ${bars}`}</div>
            <div className="font-display text-6xl text-white tabular-nums leading-none mt-1">{beatInBar}</div>
          </div>
          <div className="font-mono text-sm text-slate-400">
            {tapsRef.current.filter((t) => t.onsetId).length} / {schedule.onsets.length} hit · {missedRef.current.size} missed
          </div>
        </div>

        {/* The lane: one pass of the pattern, bar lines, onset blocks, playhead */}
        <div className="relative h-40 bg-studio-900 rounded-2xl border border-white/5 overflow-hidden">
          {Array.from({ length: bars + 1 }, (_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${(i / bars) * 100}%` }} />
          ))}
          {Array.from({ length: schedule.patternBeats }, (_, i) => (
            <div key={`b${i}`} className="absolute bottom-2 font-mono text-[10px] text-slate-600" style={{ left: `calc(${(i / schedule.patternBeats) * 100}% + 4px)` }}>
              {(i % schedule.beatsPerBar) + 1}
            </div>
          ))}
          {lesson.pattern.map((p, i) => {
            const id = `r${pass}-${i}`;
            const tap = tapsByOnset.get(id);
            const missed = missedRef.current.has(id);
            const colour = tap ? hitColour[tap.classification] : missed ? hitColour.missed : undefined;
            const left = (p.beat / schedule.patternBeats) * 100;
            const width = (p.durationBeats / schedule.patternBeats) * 100;
            return (
              <div
                key={id}
                className="absolute top-8 h-16 rounded-lg border flex items-start justify-start px-2 py-1"
                style={{
                  left: `calc(${left}% + 3px)`,
                  width: `calc(${width}% - 6px)`,
                  background: colour ? `${colour}33` : 'rgba(255,255,255,0.06)',
                  borderColor: colour ?? 'rgba(255,255,255,0.15)',
                }}
              >
                <span className="text-xl text-slate-200">{p.label}</span>
                {tap && (
                  <span className="ml-auto font-mono text-[10px]" style={{ color: colour }}>
                    {tap.deltaMs > 0 ? '+' : ''}
                    {tap.deltaMs}
                  </span>
                )}
              </div>
            );
          })}
          {!inCountIn && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]" style={{ left: `${(posBeats / schedule.patternBeats) * 100}%` }} />
          )}
          {inCountIn && (
            <div className="absolute inset-0 flex items-center justify-center font-display text-3xl text-slate-400">
              {schedule.beatsPerBar - Math.floor(clock / schedule.secondsPerBeat)}…
            </div>
          )}
        </div>

        <p className="text-sm text-slate-400">
          Green is within 25 ms, blue within 60. Amber means early or late. A held note is one tap and then silence: do not fill the gap.
        </p>
      </div>
    </LessonFrame>
  );
};
