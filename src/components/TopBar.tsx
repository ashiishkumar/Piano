import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  Disc,
  FlaskConical,
  FolderUp,
  Home,
  Map,
  Piano,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStudioStore, StudioTab } from '../store/useStudioStore';
import { midiManager } from '../services/MIDIManager';
import { getVelocityHeatColor, getWesternName } from '../utils/notation';

/** Friendly device label: "Yamaha PSR-E373" rather than "Digital Keyboard-1 MIDI 1". */
function friendlyDeviceName(name: string, manufacturer: string): string {
  const combined = `${manufacturer} ${name}`;
  const model = combined.match(/PSR[- ]?E?\d{3}|PSR[- ]?I\d{3}|CT-X\d+|P-\d{3}/i)?.[0];
  if (/yamaha/i.test(combined)) return model ? `Yamaha ${model.toUpperCase()}` : 'Yamaha keyboard';
  if (/casio/i.test(combined)) return model ? `Casio ${model.toUpperCase()}` : 'Casio keyboard';
  return name.replace(/\s*MIDI\s*\d*$/i, '').trim() || 'MIDI keyboard';
}

export const TopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    uiComplexityMode,
    setUiComplexityMode,
    midiInputs,
    activeInputId,
    webMidiSupported,
    lastMidiChannel,
    lastLatencyMs,
    lastVelocity,
    sustainPedalValue,
    mutePcSynth,
    setMutePcSynth,
    activeNotes,
  } = useStudioStore();

  const pro = uiComplexityMode === 'pro';
  const activeDevice = midiInputs.find((d) => d.id === activeInputId);

  // Show the most recently pressed key for a moment so a beginner sees the app is listening.
  const [heard, setHeard] = useState<string | null>(null);
  const held = Object.keys(activeNotes);
  useEffect(() => {
    if (held.length === 0) return;
    const latest = Object.values(activeNotes).sort((a, b) => b.timestamp - a.timestamp)[0];
    setHeard(getWesternName(latest.midi));
    const t = setTimeout(() => setHeard(null), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held.join(',')]);

  const navItems: { id: StudioTab; label: string; icon: React.ReactNode; proOnly?: boolean }[] = [
    { id: 'today', label: 'Today', icon: <Home className="w-4 h-4" /> },
    { id: 'path', label: 'Path', icon: <Map className="w-4 h-4" /> },
    { id: 'songs', label: 'My Songs', icon: <FolderUp className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'lab', label: 'Lab', icon: <FlaskConical className="w-4 h-4" />, proOnly: true },
  ];

  const velHeat = getVelocityHeatColor(lastVelocity);
  const sustainActive = sustainPedalValue >= 64;

  return (
    <header className="h-14 px-4 bg-studio-900/95 border-b border-white/10 flex items-center justify-between gap-3 select-none z-30 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2.5 shrink-0"
          aria-label="VirtuosoStudio home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
            <Piano className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <span className="font-bold tracking-tight text-sm text-white">
            Virtuoso<span className="text-emerald-400">Studio</span>
          </span>
        </button>

        <nav className="flex items-center bg-studio-950/90 p-1 rounded-xl border border-white/10" aria-label="Main">
          {navItems
            .filter((item) => !item.proOnly || pro)
            .map((item) => {
              const active = activeTab === item.id || (item.id === 'path' && activeTab === 'lesson');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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

      <div className="flex items-center gap-2.5 min-w-0">
        {/* Keyboard status */}
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 min-w-0"
          title={
            activeDevice
              ? `${activeDevice.manufacturer} ${activeDevice.name}`
              : webMidiSupported
              ? 'No USB keyboard found. Plug into USB TO HOST, or play with the computer keys: Q W E R T = Sa Re Ga Ma Pa.'
              : 'This browser cannot talk to USB keyboards. Use Chrome or Edge, or play with the computer keys.'
          }
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              activeDevice ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
          />
          {midiInputs.length > 1 ? (
            <select
              aria-label="Keyboard"
              value={activeInputId || ''}
              onChange={(e) => midiManager.selectInputDevice(e.target.value || null)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {midiInputs.map((inp) => (
                <option key={inp.id} value={inp.id} className="bg-studio-900 text-slate-100">
                  {friendlyDeviceName(inp.name, inp.manufacturer)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-medium text-slate-200 truncate">
              {activeDevice ? friendlyDeviceName(activeDevice.name, activeDevice.manufacturer) : 'Computer keys'}
            </span>
          )}
          <span className={`font-mono text-[11px] w-8 text-right transition-opacity ${heard ? 'text-emerald-300 opacity-100' : 'opacity-0'}`}>
            {heard ?? ''}
          </span>
          {!activeDevice && (
            <button
              onClick={() => midiManager.refreshDevices()}
              title="Look for a keyboard again"
              className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {pro && (
          <>
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">CH</span>
              <span className="text-slate-200 font-semibold">{lastMidiChannel}</span>
              <span className="text-slate-600">|</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">{lastLatencyMs.toFixed(1)}ms</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-studio-950 border border-white/10 font-mono text-[11px]" title="Touch velocity (1–127)">
              <span className="text-slate-400">VEL</span>
              <span className="font-bold text-white w-6 text-right">{lastVelocity}</span>
              <span className="px-1.5 rounded text-[10px] font-bold uppercase text-slate-950" style={{ backgroundColor: velHeat.hex }}>
                {velHeat.dynamicMark}
              </span>
            </div>
            <button
              onClick={() => midiManager.triggerVirtualSustain(!sustainActive)}
              title="Sustain pedal (CC 64). Hold Shift on the computer keyboard."
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                sustainActive
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  : 'bg-studio-950 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${sustainActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>CC64 {sustainActive ? sustainPedalValue : 'off'}</span>
            </button>
            <button
              onClick={() => setMutePcSynth(!mutePcSynth)}
              title={mutePcSynth ? 'Computer sound off (hearing the keyboard speakers)' : 'Computer sound on'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                mutePcSynth
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {mutePcSynth ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </>
        )}

        {/* Guided / Pro */}
        <div className="flex items-center bg-studio-950 border border-white/10 rounded-lg p-0.5" role="group" aria-label="Interface mode">
          {(['guided', 'pro'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setUiComplexityMode(mode)}
              aria-pressed={uiComplexityMode === mode}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                uiComplexityMode === mode ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
