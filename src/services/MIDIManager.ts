import { audioEngine } from './AudioEngine';
import {
  KeyboardStateSnapshot,
  KeyboardStateTracker,
  MidiMonitorLog,
  MonitorEntry,
  decodeMidiMessage,
} from '../engine/midi';

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
  isYamaha: boolean;
}

export interface MidiEventPayload {
  type: 'noteon' | 'noteoff' | 'sustain';
  midi: number;
  velocity: number;
  channel: number;
  timestamp: number;
  latencyMs: number;
  source: 'hardware' | 'computer-keyboard' | 'mouse';
}

type MidiSubscriber = (event: MidiEventPayload) => void;
type DeviceSubscriber = (
  inputs: MidiDeviceInfo[],
  outputs: MidiDeviceInfo[],
  activeInputId: string | null,
  activeOutputId: string | null,
  webMidiSupported: boolean
) => void;
type KeyboardStateSubscriber = (state: KeyboardStateSnapshot) => void;
type MonitorSubscriber = (entry: MonitorEntry) => void;

/** How often keyboard-state subscribers are notified while messages are flowing. */
const KEYBOARD_STATE_THROTTLE_MS = 120;

// Computer keyboard fallback mapping (Lower row = C3-E4, Upper row = C4-G5)
const QWERTY_NOTE_MAP: Record<string, number> = {
  // Left-hand / lower octave row (Z..M -> C3..B3)
  KeyZ: 48, // C3
  KeyS: 49, // C#3
  KeyX: 50, // D3
  KeyD: 51, // D#3
  KeyC: 52, // E3
  KeyV: 53, // F3
  KeyG: 54, // F#3
  KeyB: 55, // G3
  KeyH: 56, // G#3
  KeyN: 57, // A3
  KeyJ: 58, // A#3
  KeyM: 59, // B3
  // Right-hand / middle C4..G5 row (Q..P / A..L)
  KeyQ: 60, // C4 (Middle C / Madhya Sa)
  Digit2: 61, // C#4
  KeyW: 62, // D4 (Re)
  Digit3: 63, // D#4
  KeyE: 64, // E4 (Ga)
  KeyR: 65, // F4 (Ma)
  Digit5: 66, // F#4
  KeyT: 67, // G4 (Pa)
  Digit6: 68, // G#4
  KeyY: 69, // A4 (Dha)
  Digit7: 70, // A#4
  KeyU: 71, // B4 (Ni)
  KeyI: 72, // C5 (Taar Sa)
  Digit9: 73, // C#5
  KeyO: 74, // D5
  Digit0: 75, // D#5
  KeyP: 76, // E5
  BracketLeft: 77, // F5
  BracketRight: 79, // G5
};

class MIDIManagerService {
  private midiAccess: MIDIAccess | null = null;
  private activeInputId: string | null = null;
  private activeOutputId: string | null = null;
  private subscribers = new Set<MidiSubscriber>();
  private deviceSubscribers = new Set<DeviceSubscriber>();
  private webMidiSupported = false;
  private qwertyOctaveShift = 0; // -2 to +2 octaves
  private qwertyVelocity = 82;   // simulated touch velocity for PC keyboard
  private heldQwertyKeys = new Set<string>();
  private keyboardEnabled = true;

  // Everything the hardware tells us beyond notes: voices, channels, clock, pedals.
  private tracker = new KeyboardStateTracker();
  private monitor = new MidiMonitorLog(300);
  private keyboardStateSubscribers = new Set<KeyboardStateSubscriber>();
  private monitorSubscribers = new Set<MonitorSubscriber>();
  private keyboardStateTimer: ReturnType<typeof setTimeout> | null = null;
  private keyboardStateDirty = false;

  public async init(): Promise<void> {
    this.setupComputerKeyboardFallback();

    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
        this.webMidiSupported = true;
        this.midiAccess.onstatechange = () => {
          this.refreshDevices();
        };
        this.refreshDevices();
      } catch {
        this.webMidiSupported = false;
        this.notifyDeviceSubscribers([], []);
      }
    } else {
      this.webMidiSupported = false;
      this.notifyDeviceSubscribers([], []);
    }
  }

  public refreshDevices(): void {
    if (!this.midiAccess) {
      this.notifyDeviceSubscribers([], []);
      return;
    }

    const inputs: MidiDeviceInfo[] = [];
    const outputs: MidiDeviceInfo[] = [];

    this.midiAccess.inputs.forEach((input) => {
      const name = input.name || 'MIDI Input Device';
      const manufacturer = input.manufacturer || 'Generic';
      const isYamaha = /yamaha|psr|e373|digital keyboard/i.test(`${name} ${manufacturer}`);
      inputs.push({
        id: input.id,
        name,
        manufacturer,
        state: input.state,
        isYamaha,
      });
    });

    this.midiAccess.outputs.forEach((output) => {
      const name = output.name || 'MIDI Output Device';
      const manufacturer = output.manufacturer || 'Generic';
      const isYamaha = /yamaha|psr|e373|digital keyboard/i.test(`${name} ${manufacturer}`);
      outputs.push({
        id: output.id,
        name,
        manufacturer,
        state: output.state,
        isYamaha,
      });
    });

    // Auto-select Yamaha PSR-E373 if available, otherwise first available input
    if (!this.activeInputId || !inputs.some((i) => i.id === this.activeInputId)) {
      const yamahaInput = inputs.find((i) => i.isYamaha);
      this.activeInputId = yamahaInput ? yamahaInput.id : inputs[0]?.id || null;
    }

    if (!this.activeOutputId || !outputs.some((o) => o.id === this.activeOutputId)) {
      const yamahaOutput = outputs.find((o) => o.isYamaha);
      this.activeOutputId = yamahaOutput ? yamahaOutput.id : outputs[0]?.id || null;
    }

    this.bindActiveInput();
    this.notifyDeviceSubscribers(inputs, outputs);
  }

  public selectInputDevice(id: string | null): void {
    this.activeInputId = id;
    this.bindActiveInput();
    this.refreshDevices();
  }

  public selectOutputDevice(id: string | null): void {
    this.activeOutputId = id;
    this.refreshDevices();
  }

  private bindActiveInput(): void {
    if (!this.midiAccess) return;
    // Bind listener to all available MIDI inputs so multi-port USB-MIDI interfaces
    // always receive physical keypresses immediately regardless of port index.
    this.midiAccess.inputs.forEach((input) => {
      input.onmidimessage = (msg) => this.handleRawMidiMessage(msg, input.id);
    });
  }

  private handleRawMidiMessage(event: MIDIMessageEvent, sourceInputId?: string): void {
    const data = event.data;
    if (!data || data.length === 0) return;

    const now = performance.now();
    const decoded = decodeMidiMessage(data);

    // Every message, including clock and program changes, feeds the keyboard-state
    // tracker and the monitor so the Lesson Lab can show what the hardware is doing.
    this.tracker.ingest(decoded, now);
    const entry = this.monitor.push(data, decoded, now, sourceInputId);
    if (entry) this.monitorSubscribers.forEach((cb) => cb(entry));
    this.scheduleKeyboardStateNotify();

    // Active sensing and clock are not user actions; do not switch inputs or wake the UI for them.
    if (decoded.kind === 'activesensing' || decoded.kind === 'clock') return;

    if (sourceInputId && this.activeInputId !== sourceInputId) {
      this.activeInputId = sourceInputId;
      this.refreshDevices();
    }

    const rawTime = event.timeStamp || now;
    const latencyMs = Math.max(0.4, Math.min(9.8, Math.abs(now - rawTime)));
    const channel = decoded.channel ?? 1;

    switch (decoded.kind) {
      case 'noteon':
        audioEngine.noteOn(decoded.data1, decoded.data2, false);
        this.emit({
          type: 'noteon',
          midi: decoded.data1,
          velocity: decoded.data2,
          channel,
          timestamp: now,
          latencyMs,
          source: 'hardware',
        });
        break;
      case 'noteoff':
        // Covers both 0x80 and the 0x90 velocity-0 form the PSR-E373 uses
        audioEngine.noteOff(decoded.data1);
        this.emit({
          type: 'noteoff',
          midi: decoded.data1,
          velocity: decoded.data2,
          channel,
          timestamp: now,
          latencyMs,
          source: 'hardware',
        });
        break;
      case 'cc':
        if (decoded.data1 === 64) {
          audioEngine.setSustainPedal(decoded.data2);
          this.emit({
            type: 'sustain',
            midi: 64,
            velocity: decoded.data2,
            channel,
            timestamp: now,
            latencyMs,
            source: 'hardware',
          });
        }
        break;
      default:
        // Program change, pitch bend, sysex, transport: tracked above, nothing to play.
        break;
    }
  }

  private scheduleKeyboardStateNotify(): void {
    this.keyboardStateDirty = true;
    if (this.keyboardStateTimer) return;
    this.keyboardStateTimer = setTimeout(() => {
      this.keyboardStateTimer = null;
      if (!this.keyboardStateDirty) return;
      this.keyboardStateDirty = false;
      const snap = this.tracker.snapshot(performance.now());
      this.keyboardStateSubscribers.forEach((cb) => cb(snap));
    }, KEYBOARD_STATE_THROTTLE_MS);
  }

  /** Current decoded hardware state (voices per channel, dual/split, style, clock, pedal). */
  public getKeyboardState(): KeyboardStateSnapshot {
    return this.tracker.snapshot(performance.now());
  }

  public subscribeKeyboardState(cb: KeyboardStateSubscriber): () => void {
    this.keyboardStateSubscribers.add(cb);
    cb(this.getKeyboardState());
    return () => this.keyboardStateSubscribers.delete(cb);
  }

  public resetKeyboardState(): void {
    this.tracker.reset();
    this.scheduleKeyboardStateNotify();
  }

  public resetVelocitySample(): void {
    this.tracker.resetVelocities();
    this.scheduleKeyboardStateNotify();
  }

  public getMonitorEntries(): MonitorEntry[] {
    return this.monitor.list();
  }

  public clearMonitor(): void {
    this.monitor.clear();
  }

  public setMonitorFilterClock(on: boolean): void {
    this.monitor.setFilterClock(on);
  }

  public subscribeMonitor(cb: MonitorSubscriber): () => void {
    this.monitorSubscribers.add(cb);
    return () => this.monitorSubscribers.delete(cb);
  }

  /**
   * Sends MIDI Output back to the Yamaha PSR-E373 USB-to-Host port
   * (e.g., for auto-accompaniment backing track playback through the keyboard's speakers)
   */
  public sendHardwareNoteOn(midi: number, velocity = 75, channel = 1): void {
    if (!this.midiAccess || !this.activeOutputId) return;
    const output = this.midiAccess.outputs.get(this.activeOutputId);
    if (output) {
      try {
        output.send([0x90 | ((channel - 1) & 0x0f), midi & 0x7f, velocity & 0x7f]);
      } catch {
        // Ignore output send errors
      }
    }
  }

  public sendHardwareNoteOff(midi: number, channel = 1): void {
    if (!this.midiAccess || !this.activeOutputId) return;
    const output = this.midiAccess.outputs.get(this.activeOutputId);
    if (output) {
      try {
        output.send([0x80 | ((channel - 1) & 0x0f), midi & 0x7f, 0]);
      } catch {
        // Ignore output send errors
      }
    }
  }

  /**
   * Trigger a note from mouse/touch on the 61-key virtual keyboard or from computer keyboard
   */
  private logVirtual(raw: number[], source: string): void {
    const decoded = decodeMidiMessage(raw);
    const entry = this.monitor.push(raw, decoded, performance.now(), source);
    if (entry) this.monitorSubscribers.forEach((cb) => cb(entry));
  }

  public triggerVirtualNoteOn(
    midi: number,
    velocity = 82,
    source: 'computer-keyboard' | 'mouse' = 'mouse'
  ): void {
    audioEngine.noteOn(midi, velocity, false);
    this.logVirtual([0x90, midi & 0x7f, velocity & 0x7f], source);
    this.emit({
      type: 'noteon',
      midi,
      velocity,
      channel: 1,
      timestamp: performance.now(),
      latencyMs: 1.2,
      source,
    });
  }

  public triggerVirtualNoteOff(
    midi: number,
    source: 'computer-keyboard' | 'mouse' = 'mouse'
  ): void {
    audioEngine.noteOff(midi);
    this.logVirtual([0x80, midi & 0x7f, 0], source);
    this.emit({
      type: 'noteoff',
      midi,
      velocity: 0,
      channel: 1,
      timestamp: performance.now(),
      latencyMs: 1.2,
      source,
    });
  }

  public triggerVirtualSustain(down: boolean): void {
    const val = down ? 127 : 0;
    audioEngine.setSustainPedal(val);
    this.logVirtual([0xb0, 64, val], 'computer-keyboard');
    this.emit({
      type: 'sustain',
      midi: 64,
      velocity: val,
      channel: 1,
      timestamp: performance.now(),
      latencyMs: 1.0,
      source: 'computer-keyboard',
    });
  }

  public setComputerKeyboardVelocity(vel: number): void {
    this.qwertyVelocity = Math.max(15, Math.min(127, vel));
  }

  public getComputerKeyboardVelocity(): number {
    return this.qwertyVelocity;
  }

  private setupComputerKeyboardFallback(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      if (!this.keyboardEnabled) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      // Sustain pedal via ShiftLeft / ShiftRight
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.triggerVirtualSustain(true);
        return;
      }

      // Octave transpose via Comma (<) and Period (>)
      if (e.code === 'Comma') {
        this.qwertyOctaveShift = Math.max(-2, this.qwertyOctaveShift - 1);
        return;
      }
      if (e.code === 'Period') {
        this.qwertyOctaveShift = Math.min(2, this.qwertyOctaveShift + 1);
        return;
      }

      // Velocity simulation via ArrowUp / ArrowDown
      if (e.code === 'ArrowUp') {
        this.setComputerKeyboardVelocity(this.qwertyVelocity + 12);
        return;
      }
      if (e.code === 'ArrowDown') {
        this.setComputerKeyboardVelocity(this.qwertyVelocity - 12);
        return;
      }

      const baseMidi = QWERTY_NOTE_MAP[e.code];
      if (baseMidi !== undefined && !this.heldQwertyKeys.has(e.code)) {
        const midi = Math.max(36, Math.min(96, baseMidi + this.qwertyOctaveShift * 12));
        this.heldQwertyKeys.add(e.code);
        this.triggerVirtualNoteOn(midi, this.qwertyVelocity, 'computer-keyboard');
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.triggerVirtualSustain(false);
        return;
      }

      const baseMidi = QWERTY_NOTE_MAP[e.code];
      if (baseMidi !== undefined && this.heldQwertyKeys.has(e.code)) {
        const midi = Math.max(36, Math.min(96, baseMidi + this.qwertyOctaveShift * 12));
        this.heldQwertyKeys.delete(e.code);
        this.triggerVirtualNoteOff(midi, 'computer-keyboard');
      }
    });
  }

  public subscribe(cb: MidiSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public subscribeDevices(cb: DeviceSubscriber): () => void {
    this.deviceSubscribers.add(cb);
    this.refreshDevices();
    return () => this.deviceSubscribers.delete(cb);
  }

  private emit(event: MidiEventPayload): void {
    this.subscribers.forEach((cb) => cb(event));
  }

  private notifyDeviceSubscribers(inputs: MidiDeviceInfo[], outputs: MidiDeviceInfo[]): void {
    this.deviceSubscribers.forEach((cb) =>
      cb(inputs, outputs, this.activeInputId, this.activeOutputId, this.webMidiSupported)
    );
  }
}

export const midiManager = new MIDIManagerService();
