import React, { useState } from 'react';
import {
  CheckCircle2,
  FileAudio,
  FolderUp,
  Layers,
  Play,
  Sparkles,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { CURRICULUM_STAGES } from '../data/curriculum';
import { useStudioStore } from '../store/useStudioStore';
import { importUniversalSongFile, parseMusicXmlString } from '../services/SongImporter';
import { ArrangementTier, SongScore } from '../types/music';

const SAMPLE_BOLLYWOOD_MUSICXML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Kal Ho Naa Ho — Heartbeat Piano Theme (MusicXML)</work-title></work>
  <identification><creator type="composer">Shankar-Ehsaan-Loy / Arr. VirtuosoStudio</creator></identification>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <direction><sound tempo="88"/></direction>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><staff>2</staff></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><staff>2</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
    </measure>
    <measure number="2">
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><staff>2</staff></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><staff>2</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><staff>2</staff></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><staff>2</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><staff>1</staff></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><staff>1</staff></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
    </measure>
    <measure number="4">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>8</duration><staff>2</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><staff>1</staff></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><staff>1</staff></note>
    </measure>
  </part>
</score-partwise>`;

export const SongImporterView: React.FC = () => {
  const { addImportedSong, songs, selectSong } = useStudioStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastImported, setLastImported] = useState<SongScore | null>(null);
  const [targetStageId, setTargetStageId] = useState<number>(1);

  const importedSongs = songs.filter((s) => s.category === 'imported');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const parsed = await importUniversalSongFile(file, targetStageId);
      await addImportedSong(parsed);
      setLastImported(parsed);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to parse file. Please upload a valid .mid, .midi, .musicxml, or .mxl file.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleMusicXml = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await parseMusicXmlString(
        SAMPLE_BOLLYWOOD_MUSICXML,
        'Kal_Ho_Naa_Ho_Theme.musicxml',
        targetStageId
      );
      await addImportedSong(parsed);
      setLastImported(parsed);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error parsing sample XML');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-studio-950 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-2">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Universal MIDI & MusicXML Smart Arranger</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Import Any Song & Auto-Generate 3 Difficulty Tiers
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Drop any <code className="text-emerald-300">.mid</code>,{' '}
              <code className="text-emerald-300">.midi</code>,{' '}
              <code className="text-emerald-300">.musicxml</code>, or{' '}
              <code className="text-emerald-300">.mxl</code> file. Our DSP engine folds out-of-range notes into your 61-key PSR-E373 (C1–C6), separates Left & Right hands, estimates 1–5 fingerings, and builds Beginner, Intermediate, and Pro arrangements.
            </p>
          </div>

          <button
            onClick={handleLoadSampleMusicXml}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Test Instant Bollywood MusicXML Import</span>
          </button>
        </div>

        {/* Stage-Pace Selector so Imported Internet Songs Never Rush the Learner */}
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                1. Choose Your Current Curriculum Stage Pace (Don&apos;t Rush!)
              </h2>
              <p className="text-xs text-slate-400">
                Importing into Stage 1 or 2 keeps the Beginner tier strictly 1-Hand (Right-Hand melody only) and slows down fast tempos so you can enjoy internet songs at your exact skill level.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CURRICULUM_STAGES.map((st) => {
              const active = targetStageId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setTargetStageId(st.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                      : 'bg-studio-950/80 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-emerald-400">
                    STAGE {st.id} PACE
                  </div>
                  <div className="text-xs font-semibold truncate mt-0.5">{st.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-white/15 bg-studio-900/60 hover:border-emerald-500/50 hover:bg-studio-900'
          }`}
        >
          <input
            type="file"
            accept=".mid,.midi,.musicxml,.xml,.mxl"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <FolderUp className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-base font-semibold text-white">
            {isLoading
              ? 'Analyzing Polyphony, Splitting Hands & Computing Fingerings...'
              : 'Drag & Drop your MIDI or MusicXML file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Supports Standard MIDI (.mid, .midi) and Uncompressed/Compressed MusicXML (.musicxml, .xml, .mxl)
          </p>
        </label>

        {errorMessage && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Newly Imported Song 3-Tier Preview */}
        {lastImported && (
          <div className="glass-panel rounded-2xl p-5 space-y-4 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">{lastImported.title}</h2>
                  <p className="text-xs text-slate-400">
                    {lastImported.bpm} BPM • {lastImported.timeSignature[0]}/
                    {lastImported.timeSignature[1]} • {lastImported.totalMeasures} Measures • Mapped to PSR-E373 (MIDI 36–96)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['beginner', 'intermediate', 'pro'] as ArrangementTier[]).map((tier) => {
                const arr = lastImported.arrangements[tier];
                const rhCount = arr.notes.filter((n) => n.hand === 'right').length;
                const lhCount = arr.notes.filter((n) => n.hand === 'left').length;

                return (
                  <div
                    key={tier}
                    className="glass-card rounded-xl p-4 flex flex-col justify-between space-y-3 border border-white/10"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        {tier} Tier
                      </span>
                      <h3 className="text-sm font-bold text-white">{arr.label}</h3>
                      <p className="text-xs text-slate-400">{arr.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-300">RH Notes: {rhCount}</span>
                        <span className="text-sky-300">LH Notes: {lhCount}</span>
                      </div>
                      <button
                        onClick={() => selectSong(lastImported.id, tier)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Practice {tier} Tier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How the Smart Arranger Pipeline Works + Previously Imported Songs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Layers className="w-4 h-4" />
              <span>1. Polyphonic Hand Auto-Split</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merged single-track MIDI files are separated using a dynamic voice-leading split point around Middle C (MIDI 60), routing soprano melodies to Right Hand and bass/chords to Left Hand.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <Wand2 className="w-4 h-4" />
              <span>2. 3-Tier Difficulty Simplifier</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Beginner isolates the top melody + Beat 1 root bass; Intermediate pairs the melody with Root-Fifth harmonic support; Pro preserves the full polyphonic score.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <FileAudio className="w-4 h-4" />
              <span>3. Rule-Based 1–5 Fingering</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically assigns ergonomic finger numbers (1 Thumb to 5 Pinky) using interval span heuristics, black-key thumb avoidance, and 1-2-3-1 scale crossings.
            </p>
          </div>
        </div>

        {importedSongs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              Your Imported Library ({importedSongs.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importedSongs.map((song) => (
                <div
                  key={song.id}
                  className="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{song.title}</div>
                    <div className="text-xs text-slate-400">
                      {song.bpm} BPM • {song.totalMeasures} Bars • Beginner / Int / Pro Ready
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['beginner', 'intermediate', 'pro'] as ArrangementTier[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => selectSong(song.id, t)}
                        className="px-2.5 py-1.5 rounded-lg bg-studio-950 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-medium capitalize border border-white/10 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
