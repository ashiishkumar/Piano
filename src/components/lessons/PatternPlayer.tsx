import React, { useMemo, useState } from 'react';
import { Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { PatternLesson, PatternStep, PatternTemplate } from '../../types/lesson';
import { useStudioStore } from '../../store/useStudioStore';
import { buildPatternSong, PATTERN_TONES, patternBeats, transposeProgression, validateTemplate } from '../../engine/patterns';
import { chordSymbol, pitchClassName } from '../../engine/theory';
import { LessonFrame, LessonIntro } from './LessonFrame';

const TONE_LABEL: Record<number, string> = { 1: '1', 3: '3', 5: '5', 8: '8', 10: '10', 12: '12' };
const KEYS = [0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6]; // circle of fifths order for the key picker

/** A one- or two-bar grid of chord tones (rows) against eighth-note slots (columns). */
const PatternGrid: React.FC<{
  template: PatternTemplate;
  onToggle?: (tone: number, beat: number) => void;
}> = ({ template, onToggle }) => {
  const beats = patternBeats(template);
  const slots = beats * 2;
  const beatsPerBar = template.timeSignature[0];
  const rows = [...PATTERN_TONES].reverse();
  const at = (tone: number, slot: number) => template.steps.find((s) => s.tone === tone && Math.abs(s.beat - slot / 2) < 0.01);
  const covered = (tone: number, slot: number) => template.steps.find((s) => s.tone === tone && s.beat < slot / 2 && s.beat + s.durationBeats > slot / 2);

  return (
    <div className="inline-block">
      <div className="grid" style={{ gridTemplateColumns: `36px repeat(${slots}, 34px)` }}>
        <div />
        {Array.from({ length: slots }, (_, i) => (
          <div key={i} className={`text-center font-mono text-[10px] pb-1 ${i % 2 === 0 ? 'text-slate-300' : 'text-slate-600'}`}>
            {i % 2 === 0 ? (i / 2) % beatsPerBar + 1 : '·'}
          </div>
        ))}
        {rows.map((tone) => (
          <React.Fragment key={tone}>
            <div className="font-mono text-xs text-slate-400 flex items-center justify-end pr-2">{TONE_LABEL[tone]}</div>
            {Array.from({ length: slots }, (_, slot) => {
              const step = at(tone, slot);
              const inside = !step && covered(tone, slot);
              const barStart = slot % (beatsPerBar * 2) === 0;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={onToggle ? () => onToggle(tone, slot / 2) : undefined}
                  disabled={!onToggle}
                  aria-label={`tone ${tone} beat ${slot / 2 + 1}`}
                  className={`h-8 border-b border-r border-white/5 ${barStart ? 'border-l border-l-white/20' : ''} ${
                    step ? 'bg-emerald-500/80' : inside ? 'bg-emerald-500/30' : onToggle ? 'hover:bg-white/10' : ''
                  } ${onToggle ? 'cursor-pointer' : 'cursor-default'}`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const PatternPlayer: React.FC<{ lesson: PatternLesson }> = ({ lesson }) => {
  const playGeneratedSong = useStudioStore((s) => s.playGeneratedSong);
  const [started, setStarted] = useState(false);
  const [templateId, setTemplateId] = useState(lesson.templates[0].id);
  const [semitones, setSemitones] = useState(0);
  const [custom, setCustom] = useState<PatternTemplate>(() => ({
    id: 'custom',
    label: 'My pattern',
    timeSignature: lesson.templates[0].timeSignature,
    steps: [],
  }));
  const [editing, setEditing] = useState(Boolean(lesson.editor));

  const library = lesson.templates;
  const template = editing ? custom : library.find((t) => t.id === templateId) ?? library[0];
  const progression = useMemo(() => transposeProgression(lesson.progression, semitones), [lesson.progression, semitones]);
  const problem = editing ? validateTemplate(custom) : null;
  const keyPc = (((lesson.progression[0].rootPc + semitones) % 12) + 12) % 12;

  const toggle = (tone: number, beat: number) => {
    setCustom((c) => {
      const existing = c.steps.find((s) => s.tone === tone && Math.abs(s.beat - beat) < 0.01);
      if (existing) return { ...c, steps: c.steps.filter((s) => s !== existing) };
      // New notes are an eighth; click again to remove. Hold is a second click on the slot after? Keep it simple: eighths.
      const step: PatternStep = { tone, beat, durationBeats: 0.5 };
      return { ...c, steps: [...c.steps, step] };
    });
  };

  const lengthen = () => setCustom((c) => ({ ...c, steps: c.steps.map((s) => ({ ...s, durationBeats: Math.min(4, s.durationBeats * 2) })) }));

  const play = () => {
    const song = buildPatternSong({
      lessonId: lesson.id,
      title: lesson.title,
      template,
      progression,
      bpm: lesson.bpm,
      rootMidi: lesson.rootMidi,
      repeats: lesson.repeats,
      keyPc,
    });
    playGeneratedSong(song, lesson.id);
  };

  if (!started) {
    return (
      <LessonFrame lesson={lesson}>
        <LessonIntro lesson={lesson} onStart={() => setStarted(true)} startLabel="Choose a pattern">
          <div className="flex items-center gap-2 flex-wrap">
            {lesson.progression.map((c, i) => (
              <span key={i} className="font-mono text-sm px-2.5 py-1 rounded-lg bg-white/5 text-slate-200">
                {chordSymbol(c.rootPc, c.quality)}
              </span>
            ))}
            <span className="text-xs text-slate-500">
              {lesson.bpm} BPM · {lesson.templates[0].timeSignature.join('/')}
              {lesson.repeats > 1 ? ` · ×${lesson.repeats}` : ''}
            </span>
          </div>
        </LessonIntro>
      </LessonFrame>
    );
  }

  return (
    <LessonFrame lesson={lesson}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Library */}
          <aside className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Pattern</div>
            {library.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setEditing(false);
                  setTemplateId(t.id);
                }}
                aria-pressed={!editing && t.id === templateId}
                className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors ${
                  !editing && t.id === templateId ? 'border-emerald-400 bg-emerald-500/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
            {lesson.editor && (
              <button
                onClick={() => setEditing(true)}
                aria-pressed={editing}
                className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors flex items-center gap-2 ${
                  editing ? 'border-emerald-400 bg-emerald-500/10 text-white' : 'border-dashed border-white/20 text-slate-300 hover:bg-white/5'
                }`}
              >
                <Plus className="w-4 h-4" /> My pattern
              </button>
            )}

            {lesson.allowTranspose && (
              <div className="pt-3 space-y-1.5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Key</div>
                <div className="flex flex-wrap gap-1">
                  {KEYS.map((pc) => {
                    const st = (((pc - lesson.progression[0].rootPc) % 12) + 12) % 12;
                    const on = (((semitones % 12) + 12) % 12) === st;
                    return (
                      <button
                        key={pc}
                        onClick={() => setSemitones(st)}
                        aria-pressed={on}
                        className={`w-9 h-8 rounded-lg border font-mono text-xs ${on ? 'border-emerald-400 bg-emerald-500/15 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                      >
                        {pitchClassName(pc, [5, 10, 3, 8].includes(pc))}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Grid and play */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-3xl text-white leading-snug">{template.label}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Over {progression.map((c) => chordSymbol(c.rootPc, c.quality)).join(' – ')} at {lesson.bpm} BPM. Rows are chord tones, columns are eighth notes.
              </p>
            </div>

            <div className="bg-studio-900 rounded-2xl border border-white/5 p-4 overflow-x-auto">
              <PatternGrid template={template} onToggle={editing ? toggle : undefined} />
              {editing && (
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className="text-slate-500">Click a cell to add or remove an eighth note.</span>
                  <button onClick={lengthen} className="px-2 py-1 rounded-md bg-white/5 text-slate-300 hover:text-white">
                    Double every note's length
                  </button>
                  <button onClick={() => setCustom((c) => ({ ...c, steps: [] }))} className="px-2 py-1 rounded-md bg-white/5 text-slate-300 hover:text-white flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                  {problem && <span className="text-amber-300">{problem}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={play}
                disabled={Boolean(problem)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-current" />
                Play this pattern
              </button>
              <span className="text-xs text-slate-500">
                Opens in the song player: left hand alone first, then in rhythm, then with the chord on top. Your score counts for this lesson.
              </span>
            </div>
            {semitones !== 0 && (
              <button onClick={() => setSemitones(0)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> back to {chordSymbol(lesson.progression[0].rootPc, lesson.progression[0].quality)}
              </button>
            )}
          </div>
        </div>
      </div>
    </LessonFrame>
  );
};
