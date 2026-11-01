import React from 'react';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Cpu,
  Flame,
  FolderUp,
  Piano,
  RefreshCw,
  Volume2,
  VolumeX,
  Disc,
} from 'lucide-react';
import { useStudioStore, StudioTab } from '../store/useStudioStore';
import { midiManager } from '../services/MIDIManager';
import { getVelocityHeatColor } from '../utils/notation';

export const TopDiagnosticsBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    midiInputs,
    activeInputId,
    webMidiSupported,
    lastMidiChannel,
    lastLatencyMs,
    lastVelocity,
    sustainPedalValue,
    mutePcSynth,
    setMutePcSynth,
    userProfile,
  } = useStudioStore();

  const activeDevice = midiInputs.find((d) => d.id === activeInputId);
  const velHeat = getVelocityHeatColor(lastVelocity);
  const sustainActive = sustainPedalValue >= 64;

  const navItems: { id: StudioTab; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Practice Studio', icon: <Piano className="w-4 h-4" /> },
    { id: 'curriculum', label: '6-Stage Curriculum', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'importer', label: 'MIDI / XML Importer', icon: <FolderUp className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & AI Coach', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="h-14 px-4 bg-studio-900/95 border-b border-white/10 flex items-center justify-between gap-3 select-none z-30 shrink-0">
      {/* Left: Brand & Main Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
            <Piano className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-white">
                Virtuoso<span className="text-emerald-400">Studio</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                PSR-E373 Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              61-Key Interactive Pedagogy & Telemetry Workstation
            </p>
          </div>
        </div>

        <nav className="flex items-center bg-studio-950/90 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Hardware Auto-Discovery & Live MIDI Diagnostics Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto">
        {/* MIDI Device Selector */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${
              activeDevice
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
          />
          <select
            aria-label="MIDI Input Device"
            value={activeInputId || ''}
            onChange={(e) => midiManager.selectInputDevice(e.target.value || null)}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[180px] truncate"
          >
            {midiInputs.length === 0 ? (
              <option value="" className="bg-studio-900 text-slate-200">
                {webMidiSupported
                  ? 'USB-MIDI Unplugged (PC Keys Active)'
                  : 'PC Keyboard Fallback Mode'}
              </option>
            ) : (
              midiInputs.map((inp) => (
                <option key={inp.id} value={inp.id} className="bg-studio-900 text-slate-100">
                  {inp.isYamaha ? `★ ${inp.name}` : inp.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => midiManager.refreshDevices()}
            title="Rescan USB-to-Host MIDI Devices"
            className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active MIDI Channel & Real-Time Latency */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">CH</span>
          <span className="text-slate-200 font-semibold">{lastMidiChannel}</span>
          <span className="text-slate-600">|</span>
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">{lastLatencyMs.toFixed(1)}ms</span>
        </div>

        {/* Live Velocity Touch Response Indicator */}
        <div
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 font-mono text-[11px]"
          title="PSR-E373 Touch Velocity (1–127)"
        >
          <span className="text-slate-400">VEL</span>
          <span className="font-bold text-white w-6 text-right">{lastVelocity}</span>
          <span
            className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase text-slate-950"
            style={{ backgroundColor: velHeat.hex }}
          >
            {velHeat.dynamicMark}
          </span>
        </div>

        {/* Sustain Pedal CC 64 Indicator */}
        <div
          onClick={() => midiManager.triggerVirtualSustain(!sustainActive)}
          title="Sustain Pedal (CC 64) — Hold Shift on PC Keyboard or press physical pedal"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-all ${
            sustainActive
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
              : 'bg-studio-950 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Disc className={`w-3.5 h-3.5 ${sustainActive ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
          <span>CC64</span>
          <span className="font-semibold">{sustainActive ? `ON (${sustainPedalValue})` : 'OFF'}</span>
        </div>

        {/* Local Control / Mute PC Synth Toggle */}
        <button
          onClick={() => setMutePcSynth(!mutePcSynth)}
          title={
            mutePcSynth
              ? 'PC Piano Synth Muted (Using Native Yamaha PSR-E373 Speakers)'
              : 'PC Piano Synth Active (Click to mute when using PSR-E373 speakers)'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
            mutePcSynth
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {mutePcSynth ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PSR Speaker Mode</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PC Synth ON</span>
            </>
          )}
        </button>

        {/* Streak & XP Pill */}
        <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 text-xs">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            {userProfile.streakDays}d
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
            <Award className="w-3.5 h-3.5" />
            {userProfile.xp} XP
          </span>
        </div>
      </div>
    </header>
  );
};
