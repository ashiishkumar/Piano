import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FolderUp,
  GraduationCap,
  Music2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CURRICULUM_STAGES, STAGE_PEDAGOGY_META } from '../data/curriculum';
import { useStudioStore } from '../store/useStudioStore';
import { importUniversalSongFile } from '../services/SongImporter';
import { ArrangementTier } from '../types/music';

export const CurriculumView: React.FC = () => {
  const { songs, selectSong, masteryMap, addImportedSong } = useStudioStore();
  const [importingStageId, setImportingStageId] = useState<number | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    stageId: number;
    message: string;
    isError?: boolean;
  } | null>(null);

  const handleStageMidiImport = async (stageId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setImportingStageId(stageId);
    setImportFeedback(null);

    try {
      const parsed = await importUniversalSongFile(file, stageId);
      await addImportedSong(parsed);
      setImportFeedback({
        stageId,
        message: `Added "${parsed.title}" to Stage ${stageId} at a gentle Stage-${stageId} fundamental pace!`,
      });
    } catch (err) {
      setImportFeedback({
        stageId,
        message:
          err instanceof Error
            ? err.message
            : 'Could not parse file. Please upload a .mid, .midi, .musicxml, or .mxl file.',
        isError: true,
      });
    } finally {
      setImportingStageId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-studio-950 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/25 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <GraduationCap className="w-4 h-4" />
              <span>Indian Guru Parampara (Alankar & Sargam) × Western Conservatory Syllabus</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Unhurried, Step-by-Step Piano Mastery for Yamaha PSR-E373
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Just like an Indian classical master teaches stationary <strong className="text-emerald-300">Sa Re Ga Ma Pa</strong> and <strong className="text-emerald-300">Alankars (Paltas)</strong> before thumb crossings or two-hand songs, this course builds one physical habit at a time. Want more songs at any stage? Use the <strong className="text-amber-300">Stage-Paced MIDI Importer</strong> inside any stage to practice extra melodies from the internet without rushing ahead!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-studio-950/90 border border-amber-500/30 max-w-xs shrink-0 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Golden Rule: Never Rush a Stage</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every lesson starts in <strong className="text-slate-200">Step 1 (1 Hand • Wait-for-Me)</strong>. Only move to the next lesson or import harder songs when your fingers feel relaxed and effortless.
            </p>
          </div>
        </div>

        {/* 6 Progressive Stages */}
        <div className="space-y-8">
          {CURRICULUM_STAGES.map((stage) => {
            const stageSongs = songs.filter(
              (s) =>
                stage.lessonIds.includes(s.id) ||
                (s.category === 'imported' && s.stageId === stage.id)
            );
            const meta = STAGE_PEDAGOGY_META[stage.id];

            return (
              <div
                key={stage.id}
                className="glass-panel rounded-2xl p-5 space-y-5 border border-white/10"
              >
                {/* Stage Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs">
                        STAGE {stage.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                        {stage.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {stageSongs.length} Playable Lessons
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white pt-0.5">{stage.title}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">{stage.description}</p>
                  </div>

                  {/* Skills Unlocked Pills */}
                  <div className="flex flex-wrap gap-1.5 max-w-md shrink-0">
                    {stage.skillsUnlocked.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 text-[11px] text-slate-300"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Indian Guru + Western Pedagogy Rationale Banner */}
                {meta && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-studio-950/70 rounded-xl p-3.5 border border-white/5">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                        🇮🇳 Indian Classical Guru Method
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {meta.indianPedagogyConcept}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                        🎹 Western Conservatory Method
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {meta.westernPedagogyConcept}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                        🐢 Fundamental Pace Rule (Don&apos;t Rush)
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{meta.paceRule}</p>
                    </div>
                  </div>
                )}

                {/* Playable Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stageSongs.map((lesson, idx) => {
                    const mastery = masteryMap[lesson.id];
                    const bestScore = mastery?.bestScore ?? 0;
                    const isCustomImported = lesson.category === 'imported';

                    return (
                      <div
                        key={lesson.id}
                        className={`glass-card rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all ${
                          isCustomImported
                            ? 'border-amber-500/35 hover:border-amber-400'
                            : 'hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                                  {isCustomImported
                                    ? `Bonus Stage ${stage.id} Import`
                                    : `Step ${stage.id}.${idx + 1}`}
                                </span>
                                {(lesson.category === 'drill' ||
                                  lesson.category === 'curriculum') && (
                                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                    Alankar / Drill
                                  </span>
                                )}
                                {lesson.category === 'repertoire' && (
                                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    Melody / Song
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-white leading-snug">
                                {lesson.title}
                              </h3>
                            </div>
                            {bestScore > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0">
                                <Award className="w-3 h-3" />
                                {bestScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{lesson.subtitle}</p>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {lesson.bpm} BPM
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Music2 className="w-3 h-3 text-amber-400" />
                              {lesson.timeSignature[0]}/{lesson.timeSignature[1]} (
                              {lesson.totalMeasures} bars)
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-studio-950/90 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                            <strong className="text-amber-300">Guru Tip:</strong>{' '}
                            {lesson.coachTip}
                          </div>
                        </div>

                        {/* Launch in Guided Beginner / Intermediate / Pro Tiers */}
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                            <span>Start Lesson (Guided 3-Step):</span>
                            <span className="text-emerald-400">Recommended: Beginner</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['beginner', 'intermediate', 'pro'] as ArrangementTier[]).map(
                              (tier) => {
                                const isDone = mastery?.completedTiers?.includes(tier);
                                return (
                                  <button
                                    key={tier}
                                    onClick={() => selectSong(lesson.id, tier)}
                                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                                      tier === 'beginner'
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20'
                                        : 'bg-studio-950 text-slate-200 border border-white/15 hover:border-emerald-400 hover:text-emerald-300'
                                    }`}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                                    ) : (
                                      <Play className="w-3 h-3 fill-current shrink-0" />
                                    )}
                                    <span>{tier === 'intermediate' ? 'Interm.' : tier}</span>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage-Specific Extra Practice MIDI Importer Footer */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-studio-900 to-amber-500/10 border border-emerald-500/25 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>
                        Want more songs at Stage {stage.id}&apos;s exact skill level before moving to Stage{' '}
                        {Math.min(6, stage.id + 1)}?
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Download any MIDI/MusicXML melody from the internet and import it right into{' '}
                      <strong className="text-white">Stage {stage.id}</strong>—VirtuosoStudio automatically simplifies the notes and tempo to match Stage {stage.id}&apos;s fundamental pace so you never rush!
                    </p>
                    {meta && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium">
                          <Search className="w-3 h-3" />
                          Suggested Internet MIDI Searches:
                        </span>
                        {meta.recommendedInternetMidiSearches.map((query) => (
                          <span
                            key={query}
                            className="px-2 py-0.5 rounded bg-studio-950/90 border border-white/10 text-[11px] font-mono text-slate-300"
                          >
                            &ldquo;{query}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                    {importFeedback && importFeedback.stageId === stage.id && (
                      <div
                        className={`text-xs font-medium pt-1 ${
                          importFeedback.isError ? 'text-rose-300' : 'text-emerald-300'
                        }`}
                      >
                        {importFeedback.message}
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shrink-0 shadow-lg shadow-emerald-500/15">
                    <FolderUp className="w-4 h-4" />
                    <span>
                      {importingStageId === stage.id
                        ? `Pacing for Stage ${stage.id}...`
                        : `+ Import MIDI / XML into Stage ${stage.id}`}
                    </span>
                    <input
                      type="file"
                      accept=".mid,.midi,.musicxml,.xml,.mxl"
                      className="hidden"
                      onChange={(e) => handleStageMidiImport(stage.id, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
