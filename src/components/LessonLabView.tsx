import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Circle,
  Download,
  Eraser,
  FlaskConical,
  ListChecks,
  Lock,
  Pause,
  Play,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { midiManager } from '../services/MIDIManager';
import { KeyboardStateSnapshot, MonitorEntry } from '../engine/midi';
import { recognizeChord } from '../engine/theory';
import { useStudioStore } from '../store/useStudioStore';
import { LEVELS } from '../content/path';
import { LESSON_TYPE_LABELS, TRACK_LABELS } from '../types/lesson';
import { LessonStatus } from '../engine/progress';

// ---------------------------------------------------------------------------
// Small shared bits
// ---------------------------------------------------------------------------

const Chip: React.FC<{ on: boolean; label: string; detail?: string }> = ({ on, label, detail }) => (
  <div
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
      on
        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        : 'bg-studio-950 border-white/10 text-slate-500'
    }`}
  >
    <span className={`w-2 h-2 rounded-full ${on ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
    <span>{label}</span>
    {detail && <span className="font-mono text-[11px] text-slate-300">{detail}</span>}
  </div>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  right,
  children,
}) => (
  <section className="glass-panel rounded-2xl p-4 space-y-3 min-w-0">
    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
      <h2 className="flex items-center gap-2 text-sm font-bold text-white">
        <span className="text-emerald-400">{icon}</span>
        {title}
      </h2>
      {right}
    </div>
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// MIDI monitor
// ---------------------------------------------------------------------------

const kindColour: Record<string, string> = {
  noteon: 'text-emerald-300',
  noteoff: 'text-slate-400',
  cc: 'text-cyan-300',
  programchange: 'text-amber-300',
  pitchbend: 'text-fuchsia-300',
  clock: 'text-slate-600',
  start: 'text-amber-200',
  stop: 'text-amber-200',
  sysex: 'text-rose-300',
};

const MidiMonitor: React.FC = () => {
  const [entries, setEntries] = useState<MonitorEntry[]>(() => midiManager.getMonitorEntries());
  const [paused, setPaused] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = midiManager.subscribeMonitor(() => {
      if (pausedRef.current) return;
      setEntries(midiManager.getMonitorEntries());
    });
    return unsub;
  }, []);

  useEffect(() => {
    midiManager.setMonitorFilterClock(!showClock);
  }, [showClock]);

  useEffect(() => {
    const el = listRef.current;
    if (el && !paused) el.scrollTop = el.scrollHeight;
  }, [entries, paused]);

  const start = entries[0]?.at ?? 0;

  return (
    <Section
      title="MIDI Monitor"
      icon={<Radio className="w-4 h-4" />}
      right={
        <div className="flex items-center gap-1.5">
          <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} />
            clock
          </label>
          <button
            onClick={() => setPaused((p) => !p)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              midiManager.clearMonitor();
              setEntries([]);
            }}
            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            title="Clear"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const log = midiManager.getMonitorEntries().map((e) => ({ at: Math.round(e.at), raw: e.raw, source: e.sourceId ?? null }));
              const blob = new Blob([JSON.stringify(log, null, 1)], { type: 'application/json' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `midi-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            title="Download log as JSON (use as a test fixture)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div ref={listRef} className="h-72 overflow-y-auto font-mono text-[11px] bg-studio-950 rounded-xl border border-white/5 p-2">
        {entries.length === 0 ? (
          <div className="text-slate-500 p-2">
            Press a key on the PSR-E373, turn a knob, change a voice, or start a style. Every message shows here.
            Computer-keyboard and mouse notes are logged too.
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.seq} className="grid grid-cols-[52px_28px_120px_1fr] gap-2 py-0.5 border-b border-white/[0.03]">
              <span className="text-slate-500">+{((e.at - start) / 1000).toFixed(2)}s</span>
              <span className="text-slate-500">{e.decoded.channel ? `ch${e.decoded.channel}` : 'sys'}</span>
              <span className="text-slate-600">{e.raw.map((b) => b.toString(16).padStart(2, '0')).join(' ')}</span>
              <span className={kindColour[e.decoded.kind] ?? 'text-slate-300'}>
                {e.decoded.description}
                {e.sourceId && !e.sourceId.includes('-') && e.sourceId !== 'hardware' ? (
                  <span className="text-slate-600"> ({e.sourceId})</span>
                ) : null}
              </span>
            </div>
          ))
        )}
      </div>
    </Section>
  );
};

// ---------------------------------------------------------------------------
// Keyboard state
// ---------------------------------------------------------------------------

const KeyboardStatePanel: React.FC = () => {
  const [snap, setSnap] = useState<KeyboardStateSnapshot>(() => midiManager.getKeyboardState());

  useEffect(() => midiManager.subscribeKeyboardState(setSnap), []);

  const channels = Object.values(snap.channels).sort((a, b) => a.channel - b.channel);

  return (
    <Section
      title="Keyboard State (decoded from MIDI)"
      icon={<Activity className="w-4 h-4" />}
      right={
        <button
          onClick={() => midiManager.resetKeyboardState()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[11px] text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-3 h-3" /> reset
        </button>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Chip on={snap.dualDetected} label="Dual" />
        <Chip on={snap.splitDetected} label="Split" detail={snap.splitPointGuess !== null ? `@${snap.splitPointGuess}` : undefined} />
        <Chip on={snap.styleRunning} label="Style" detail={snap.styleChannelsActive.length ? `ch ${snap.styleChannelsActive.join(',')}` : undefined} />
        <Chip on={snap.clock.running} label="Clock" detail={snap.clock.bpm !== null ? `${snap.clock.bpm} BPM` : `${snap.clock.ticks} ticks`} />
        <Chip on={snap.transport !== 'stopped'} label="Transport" detail={snap.transport} />
        <Chip on={(snap.sustain?.value ?? 0) >= 64} label="Sustain" detail={snap.sustain ? String(snap.sustain.value) : undefined} />
        <Chip on={snap.pitchBend !== null && snap.pitchBend.value !== 0} label="Pitch bend" detail={snap.pitchBend ? String(snap.pitchBend.value) : undefined} />
        <Chip
          on={snap.velocity.touchResponseGuess !== 'unknown'}
          label={`Touch: ${snap.velocity.touchResponseGuess}`}
          detail={snap.velocity.recent.length ? `${snap.velocity.min}–${snap.velocity.max}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div className="glass-card rounded-xl p-3 text-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Last voice change</div>
          {snap.lastProgramChange ? (
            <div className="text-slate-200">
              <span className="font-mono text-amber-300">ch{snap.lastProgramChange.channel}</span>{' '}
              bank {snap.lastProgramChange.bankMsb}/{snap.lastProgramChange.bankLsb} · program{' '}
              {snap.lastProgramChange.program + 1} → <span className="font-semibold text-white">{snap.lastProgramChange.voiceName}</span>
            </div>
          ) : (
            <div className="text-slate-500">Press VOICE and choose a different voice on the keyboard.</div>
          )}
        </div>
        <div className="glass-card rounded-xl p-3 text-xs">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Messages</div>
          <div className="font-mono text-lg text-white">{snap.totalMessages}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead className="text-slate-400">
            <tr className="text-left">
              <th className="py-1 pr-2">ch</th>
              <th className="py-1 pr-2">voice</th>
              <th className="py-1 pr-2">bank</th>
              <th className="py-1 pr-2">pc</th>
              <th className="py-1 pr-2">notes</th>
              <th className="py-1 pr-2">range</th>
              <th className="py-1 pr-2">held</th>
              <th className="py-1 pr-2">vol</th>
              <th className="py-1 pr-2">rev</th>
              <th className="py-1 pr-2">cho</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {channels.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-2 text-slate-500">
                  No channel activity yet.
                </td>
              </tr>
            ) : (
              channels.map((c) => (
                <tr key={c.channel} className="border-t border-white/5">
                  <td className={`py-1 pr-2 ${c.channel >= 9 ? 'text-amber-300' : 'text-emerald-300'}`}>{c.channel}</td>
                  <td className="py-1 pr-2 text-white">{c.voiceName ?? '—'}</td>
                  <td className="py-1 pr-2">{c.bankMsb}/{c.bankLsb}</td>
                  <td className="py-1 pr-2">{c.program === null ? '—' : c.program + 1}</td>
                  <td className="py-1 pr-2">{c.noteOnCount}</td>
                  <td className="py-1 pr-2">{c.lowestMidi === null ? '—' : `${c.lowestMidi}–${c.highestMidi}`}</td>
                  <td className="py-1 pr-2">{c.activeNotes.length ? c.activeNotes.join(' ') : '—'}</td>
                  <td className="py-1 pr-2">{c.volume ?? '—'}</td>
                  <td className="py-1 pr-2">{c.reverbSend ?? '—'}</td>
                  <td className="py-1 pr-2">{c.chorusSend ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
};

// ---------------------------------------------------------------------------
// Live chord
// ---------------------------------------------------------------------------

const LiveChord: React.FC = () => {
  const activeNotes = useStudioStore((s) => s.activeNotes);
  const held = useMemo(() => Object.keys(activeNotes).map(Number).sort((a, b) => a - b), [activeNotes]);
  const chord = useMemo(() => recognizeChord(held), [held]);

  return (
    <Section title="Chord you are holding" icon={<FlaskConical className="w-4 h-4" />}>
      <div className="flex items-end gap-4">
        <div className="text-4xl font-bold text-white min-w-[120px]">
          {chord ? chord.symbol : held.length ? <span className="text-slate-500 text-2xl">{held.length === 1 ? 'one note' : 'not a chord'}</span> : <span className="text-slate-600 text-2xl">—</span>}
        </div>
        <div className="text-xs text-slate-300 space-y-0.5">
          {chord && (
            <>
              <div>
                {chord.inversion === 0 ? 'root position' : chord.inversion === 1 ? '1st inversion' : chord.inversion === 2 ? '2nd inversion' : `${chord.inversion}th inversion`}
              </div>
              {chord.alternatives.length > 0 && (
                <div className="text-slate-500">also: {chord.alternatives.map((a) => a.symbol).join(', ')}</div>
              )}
            </>
          )}
          <div className="font-mono text-slate-500">{held.join(' ') || 'press 2+ keys'}</div>
        </div>
      </div>
    </Section>
  );
};

// ---------------------------------------------------------------------------
// Hardware verification checklist
// ---------------------------------------------------------------------------

interface Check {
  id: string;
  question: string;
  how: string;
  pass: (s: KeyboardStateSnapshot) => boolean;
}

const CHECKS: Check[] = [
  {
    id: 'pc',
    question: 'Does a voice change arrive as Program Change?',
    how: 'Press VOICE, pick any other voice, play a note.',
    pass: (s) => s.lastProgramChange !== null,
  },
  {
    id: 'dual',
    question: 'Does Dual send the same note on two channels?',
    how: 'Press DUAL so it lights, then play one key.',
    pass: (s) => s.dualDetected,
  },
  {
    id: 'split',
    question: 'Does Split put the left-hand zone on another channel?',
    how: 'Press SPLIT, play a low key and a high key.',
    pass: (s) => s.splitDetected,
  },
  {
    id: 'style',
    question: 'Does a running style send notes on channels 9–16?',
    how: 'Press ACMP ON/OFF then START/STOP, or SYNC START and play a chord.',
    pass: (s) => s.styleRunning,
  },
  {
    id: 'clock',
    question: 'Does the keyboard send MIDI Clock while a style plays?',
    how: 'With a style running, the Clock chip should show a BPM.',
    pass: (s) => s.clock.running && s.clock.bpm !== null,
  },
  {
    id: 'sustain',
    question: 'Does the sustain pedal arrive as CC 64?',
    how: 'Press the footswitch (or hold Shift on the PC).',
    pass: (s) => (s.sustain?.value ?? 0) >= 64,
  },
  {
    id: 'bend',
    question: 'Does the pitch bend wheel transmit?',
    how: 'Roll the PITCH BEND wheel while holding a note.',
    pass: (s) => s.pitchBend !== null && s.pitchBend.value !== 0,
  },
  {
    id: 'reverb',
    question: 'Does changing Reverb depth send CC 91?',
    how: 'FUNCTION → Reverb Level, turn it up. Look for CC 91 in the monitor.',
    pass: (s) => Object.values(s.channels).some((c) => c.reverbSend !== null),
  },
  {
    id: 'fixed',
    question: 'Does Touch Response = Fixed produce identical velocities?',
    how: 'FUNCTION → Touch Response → Fixed, play 8 keys. The Touch chip should say fixed.',
    pass: (s) => s.velocity.touchResponseGuess === 'fixed',
  },
];

const HardwareChecklist: React.FC = () => {
  const [snap, setSnap] = useState<KeyboardStateSnapshot>(() => midiManager.getKeyboardState());
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  useEffect(
    () =>
      midiManager.subscribeKeyboardState((s) => {
        setSnap(s);
        setSeen((prev) => {
          const next = { ...prev };
          for (const c of CHECKS) if (c.pass(s)) next[c.id] = true;
          return next;
        });
      }),
    []
  );

  const passed = CHECKS.filter((c) => seen[c.id]).length;

  return (
    <Section
      title="Hardware verification"
      icon={<ListChecks className="w-4 h-4" />}
      right={<span className="text-xs font-mono text-slate-400">{passed}/{CHECKS.length} seen</span>}
    >
      <p className="text-xs text-slate-400">
        Each row turns green the first time the keyboard sends the evidence. Ten minutes with the PSR-E373 settles what the
        keyboard-track lessons can verify automatically.
      </p>
      <ul className="space-y-1.5">
        {CHECKS.map((c) => {
          const ok = seen[c.id] || c.pass(snap);
          return (
            <li key={c.id} className="flex items-start gap-2 text-xs">
              {ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className={ok ? 'text-emerald-200' : 'text-slate-200'}>{c.question}</div>
                <div className="text-slate-500">{c.how}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

// ---------------------------------------------------------------------------
// Lesson registry
// ---------------------------------------------------------------------------

const statusStyle: Record<LessonStatus, string> = {
  locked: 'text-slate-500',
  available: 'text-sky-300',
  'in-progress': 'text-amber-300',
  passed: 'text-emerald-300',
  mastered: 'text-emerald-200 font-bold',
};

const LessonRegistry: React.FC = () => {
  const { lessonStatuses, lessonProgress, openLesson, currentLessonId } = useStudioStore();
  const [onlyReady, setOnlyReady] = useState(false);

  const ready = LEVELS.flatMap((l) => l.lessons).filter((l) => l.status === 'ready').length;
  const total = LEVELS.reduce((n, l) => n + l.lessons.length, 0);

  return (
    <Section
      title="Learning path registry"
      icon={<ListChecks className="w-4 h-4" />}
      right={
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">{ready} ready / {total} planned</span>
          <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.target.checked)} />
            ready only
          </label>
        </div>
      }
    >
      <div className="max-h-[560px] overflow-y-auto space-y-4 pr-1">
        {LEVELS.map((level) => {
          const lessons = onlyReady ? level.lessons.filter((l) => l.status === 'ready') : level.lessons;
          if (lessons.length === 0) return null;
          return (
            <div key={level.id}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Level {level.id}
                </span>
                <span className="text-sm font-semibold text-white">{level.title}</span>
                <span className="text-xs text-slate-500">{level.subtitle}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {lessons.map((l) => {
                    const st = lessonStatuses[l.id] ?? 'locked';
                    const prog = lessonProgress[l.id];
                    const isCurrent = l.id === currentLessonId;
                    return (
                      <tr key={l.id} className={`border-t border-white/5 ${isCurrent ? 'bg-emerald-500/5' : ''}`}>
                        <td className="py-1 pr-2 font-mono text-slate-400 w-10">{l.code}</td>
                        <td className="py-1 pr-2 text-slate-100">
                          {l.title}
                          {l.subtitle && <span className="text-slate-500"> — {l.subtitle}</span>}
                        </td>
                        <td className="py-1 pr-2 text-slate-400 whitespace-nowrap">{TRACK_LABELS[l.track]}</td>
                        <td className="py-1 pr-2 text-slate-400 whitespace-nowrap">{LESSON_TYPE_LABELS[l.type]}</td>
                        <td className="py-1 pr-2 text-slate-500 whitespace-nowrap">{l.source}</td>
                        <td className={`py-1 pr-2 whitespace-nowrap ${l.status === 'planned' ? 'text-slate-600' : statusStyle[st]}`}>
                          {l.status === 'planned' ? 'planned' : st}
                          {prog && <span className="text-slate-500"> · best {prog.bestScore}</span>}
                        </td>
                        <td className="py-1 text-right">
                          {l.status === 'ready' ? (
                            <button
                              onClick={() => openLesson(l.id)}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 text-[11px] font-semibold"
                            >
                              Open
                            </button>
                          ) : (
                            <Lock className="w-3 h-3 text-slate-700 inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

// ---------------------------------------------------------------------------

export const LessonLabView: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4">
      <div className="max-w-[1500px] mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-lg font-bold text-white">Lesson Lab</h1>
            <p className="text-xs text-slate-400">
              Authoring and hardware tools. See what the keyboard transmits, check the path, open any lesson.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <MidiMonitor />
          <KeyboardStatePanel />
          <LiveChord />
          <HardwareChecklist />
        </div>

        <LessonRegistry />
      </div>
    </div>
  );
};
