/**
 * Pure MIDI decoding and keyboard-state tracking.
 * No Web MIDI, no DOM: everything here is testable with plain arrays.
 */

export type MidiKind =
  | 'noteon'
  | 'noteoff'
  | 'polyaftertouch'
  | 'cc'
  | 'programchange'
  | 'channelpressure'
  | 'pitchbend'
  | 'sysex'
  | 'timecode'
  | 'songposition'
  | 'songselect'
  | 'tunerequest'
  | 'clock'
  | 'start'
  | 'continue'
  | 'stop'
  | 'activesensing'
  | 'reset'
  | 'unknown';

export interface DecodedMidi {
  kind: MidiKind;
  /** 1-16 for channel messages, undefined for system messages */
  channel?: number;
  data1: number;
  data2: number;
  /** Human-readable one-liner for the monitor */
  description: string;
}

export const CC_NAMES: Record<number, string> = {
  0: 'Bank Select MSB',
  1: 'Modulation',
  5: 'Portamento Time',
  6: 'Data Entry MSB',
  7: 'Channel Volume',
  10: 'Pan',
  11: 'Expression',
  32: 'Bank Select LSB',
  38: 'Data Entry LSB',
  64: 'Sustain Pedal',
  65: 'Portamento',
  66: 'Sostenuto',
  67: 'Soft Pedal',
  71: 'Harmonic Content',
  72: 'Release Time',
  73: 'Attack Time',
  74: 'Brightness',
  84: 'Portamento Control',
  91: 'Reverb Send',
  93: 'Chorus Send',
  94: 'Variation (DSP) Send',
  96: 'Data Increment',
  97: 'Data Decrement',
  98: 'NRPN LSB',
  99: 'NRPN MSB',
  100: 'RPN LSB',
  101: 'RPN MSB',
  120: 'All Sound Off',
  121: 'Reset All Controllers',
  123: 'All Notes Off',
};

export const GM_PROGRAM_NAMES: string[] = [
  'Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano', 'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavi',
  'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer',
  'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion',
  'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)', 'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar Harmonics',
  'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2',
  'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani',
  'String Ensemble 1', 'String Ensemble 2', 'Synth Strings 1', 'Synth Strings 2', 'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orchestra Hit',
  'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2',
  'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet',
  'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina',
  'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)', 'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)',
  'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)', 'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)',
  'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)', 'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)',
  'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bag pipe', 'Fiddle', 'Shanai',
  'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal',
  'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot',
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiNoteName(midi: number): string {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

/**
 * Best-effort voice name. GM bank (MSB 0, LSB 0) uses the standard table.
 * Yamaha panel voices live in other banks; until the PSR-E373 Data List is
 * transcribed we show the bank/program numbers so the owner can map them.
 */
export function voiceName(bankMsb: number, bankLsb: number, program: number): string {
  if (bankMsb === 0 && bankLsb === 0 && program >= 0 && program < 128) {
    return GM_PROGRAM_NAMES[program];
  }
  if (bankMsb === 127) return `Drum Kit PC ${program + 1}`;
  const gm = GM_PROGRAM_NAMES[program] ?? 'Unknown';
  return `Bank ${bankMsb}/${bankLsb} PC ${program + 1} (${gm} family)`;
}

export function decodeMidiMessage(data: ArrayLike<number>): DecodedMidi {
  const status = data[0] ?? 0;
  const d1 = data[1] ?? 0;
  const d2 = data[2] ?? 0;

  if (status >= 0xf0) {
    switch (status) {
      case 0xf0:
        return { kind: 'sysex', data1: data.length, data2: 0, description: `SysEx (${data.length} bytes)` };
      case 0xf1:
        return { kind: 'timecode', data1: d1, data2: 0, description: 'MIDI Time Code' };
      case 0xf2:
        return { kind: 'songposition', data1: d1, data2: d2, description: `Song Position ${d1 | (d2 << 7)}` };
      case 0xf3:
        return { kind: 'songselect', data1: d1, data2: 0, description: `Song Select ${d1}` };
      case 0xf6:
        return { kind: 'tunerequest', data1: 0, data2: 0, description: 'Tune Request' };
      case 0xf8:
        return { kind: 'clock', data1: 0, data2: 0, description: 'Timing Clock' };
      case 0xfa:
        return { kind: 'start', data1: 0, data2: 0, description: 'Start' };
      case 0xfb:
        return { kind: 'continue', data1: 0, data2: 0, description: 'Continue' };
      case 0xfc:
        return { kind: 'stop', data1: 0, data2: 0, description: 'Stop' };
      case 0xfe:
        return { kind: 'activesensing', data1: 0, data2: 0, description: 'Active Sensing' };
      case 0xff:
        return { kind: 'reset', data1: 0, data2: 0, description: 'System Reset' };
      default:
        return { kind: 'unknown', data1: d1, data2: d2, description: `System 0x${status.toString(16)}` };
    }
  }

  const command = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  switch (command) {
    case 0x90:
      if (d2 === 0) {
        return { kind: 'noteoff', channel, data1: d1, data2: 0, description: `Note Off ${midiNoteName(d1)} (vel 0)` };
      }
      return { kind: 'noteon', channel, data1: d1, data2: d2, description: `Note On ${midiNoteName(d1)} vel ${d2}` };
    case 0x80:
      return { kind: 'noteoff', channel, data1: d1, data2: d2, description: `Note Off ${midiNoteName(d1)}` };
    case 0xa0:
      return { kind: 'polyaftertouch', channel, data1: d1, data2: d2, description: `Poly Aftertouch ${midiNoteName(d1)} ${d2}` };
    case 0xb0:
      return {
        kind: 'cc',
        channel,
        data1: d1,
        data2: d2,
        description: `CC ${d1} ${CC_NAMES[d1] ?? ''} = ${d2}`.replace(/\s+=/, ' ='),
      };
    case 0xc0:
      return { kind: 'programchange', channel, data1: d1, data2: 0, description: `Program Change ${d1 + 1}` };
    case 0xd0:
      return { kind: 'channelpressure', channel, data1: d1, data2: 0, description: `Channel Pressure ${d1}` };
    case 0xe0: {
      const value = (d1 | (d2 << 7)) - 8192;
      return { kind: 'pitchbend', channel, data1: d1, data2: d2, description: `Pitch Bend ${value > 0 ? '+' : ''}${value}` };
    }
    default:
      return { kind: 'unknown', channel, data1: d1, data2: d2, description: `0x${status.toString(16)}` };
  }
}

export function pitchBendValue(d: DecodedMidi): number {
  return (d.data1 | (d.data2 << 7)) - 8192;
}

// ---------------------------------------------------------------------------
// Keyboard state tracker
// ---------------------------------------------------------------------------

export interface ChannelState {
  channel: number;
  program: number | null;
  bankMsb: number;
  bankLsb: number;
  voiceName: string | null;
  volume: number | null;
  expression: number | null;
  pan: number | null;
  reverbSend: number | null;
  chorusSend: number | null;
  variationSend: number | null;
  noteOnCount: number;
  lastNoteOnAt: number | null;
  lowestMidi: number | null;
  highestMidi: number | null;
  activeNotes: Set<number>;
}

export interface KeyboardStateSnapshot {
  channels: Record<number, Omit<ChannelState, 'activeNotes'> & { activeNotes: number[] }>;
  lastProgramChange: { channel: number; program: number; bankMsb: number; bankLsb: number; voiceName: string; at: number } | null;
  pitchBend: { channel: number; value: number; at: number } | null;
  sustain: { channel: number; value: number; at: number } | null;
  clock: { bpm: number | null; running: boolean; ticks: number; lastAt: number | null };
  transport: 'stopped' | 'started' | 'continued';
  /** Channels 1–8 with note activity within the activity window. */
  melodyChannelsActive: number[];
  /** Channels 9–16 with note activity within the activity window. */
  styleChannelsActive: number[];
  styleRunning: boolean;
  /** Same note number arrived on two channels within DUAL_WINDOW_MS. */
  dualDetected: boolean;
  /** Two melody channels whose note ranges do not overlap. */
  splitDetected: boolean;
  splitPointGuess: number | null;
  velocity: { recent: number[]; min: number; max: number; distinct: number; touchResponseGuess: 'fixed' | 'variable' | 'unknown' };
  totalMessages: number;
}

const ACTIVITY_WINDOW_MS = 4000;
const DUAL_WINDOW_MS = 12;
const CLOCK_IDLE_MS = 600;
const CLOCKS_PER_BEAT = 24;
const VELOCITY_SAMPLE = 32;

function emptyChannel(channel: number): ChannelState {
  return {
    channel,
    program: null,
    bankMsb: 0,
    bankLsb: 0,
    voiceName: null,
    volume: null,
    expression: null,
    pan: null,
    reverbSend: null,
    chorusSend: null,
    variationSend: null,
    noteOnCount: 0,
    lastNoteOnAt: null,
    lowestMidi: null,
    highestMidi: null,
    activeNotes: new Set(),
  };
}

export class KeyboardStateTracker {
  private channels = new Map<number, ChannelState>();
  private lastProgramChange: KeyboardStateSnapshot['lastProgramChange'] = null;
  private pitchBend: KeyboardStateSnapshot['pitchBend'] = null;
  private sustain: KeyboardStateSnapshot['sustain'] = null;
  private clockTimes: number[] = [];
  private clockTicks = 0;
  private transport: KeyboardStateSnapshot['transport'] = 'stopped';
  private recentNoteOns: { midi: number; channel: number; at: number }[] = [];
  private dualSeenAt: number | null = null;
  private velocities: number[] = [];
  private totalMessages = 0;

  private channel(ch: number): ChannelState {
    let c = this.channels.get(ch);
    if (!c) {
      c = emptyChannel(ch);
      this.channels.set(ch, c);
    }
    return c;
  }

  /** Forget recent velocities so a touch-response check only sees notes played from now on. */
  resetVelocities(): void {
    this.velocities = [];
  }

  reset(): void {
    this.channels.clear();
    this.lastProgramChange = null;
    this.pitchBend = null;
    this.sustain = null;
    this.clockTimes = [];
    this.clockTicks = 0;
    this.transport = 'stopped';
    this.recentNoteOns = [];
    this.dualSeenAt = null;
    this.velocities = [];
    this.totalMessages = 0;
  }

  /** Feed one decoded message. `at` is performance.now()-style milliseconds. */
  ingest(d: DecodedMidi, at: number): void {
    this.totalMessages++;
    switch (d.kind) {
      case 'noteon': {
        const c = this.channel(d.channel!);
        c.noteOnCount++;
        c.lastNoteOnAt = at;
        c.lowestMidi = c.lowestMidi === null ? d.data1 : Math.min(c.lowestMidi, d.data1);
        c.highestMidi = c.highestMidi === null ? d.data1 : Math.max(c.highestMidi, d.data1);
        c.activeNotes.add(d.data1);

        // Dual detection: same note on another channel within the window
        const twin = this.recentNoteOns.find(
          (r) => r.midi === d.data1 && r.channel !== d.channel && at - r.at <= DUAL_WINDOW_MS
        );
        if (twin) this.dualSeenAt = at;
        this.recentNoteOns.push({ midi: d.data1, channel: d.channel!, at });
        if (this.recentNoteOns.length > 64) this.recentNoteOns.shift();

        if (d.channel! <= 8) {
          this.velocities.push(d.data2);
          if (this.velocities.length > VELOCITY_SAMPLE) this.velocities.shift();
        }
        break;
      }
      case 'noteoff': {
        this.channel(d.channel!).activeNotes.delete(d.data1);
        break;
      }
      case 'cc': {
        const c = this.channel(d.channel!);
        switch (d.data1) {
          case 0: c.bankMsb = d.data2; break;
          case 32: c.bankLsb = d.data2; break;
          case 7: c.volume = d.data2; break;
          case 11: c.expression = d.data2; break;
          case 10: c.pan = d.data2; break;
          case 91: c.reverbSend = d.data2; break;
          case 93: c.chorusSend = d.data2; break;
          case 94: c.variationSend = d.data2; break;
          case 64: this.sustain = { channel: d.channel!, value: d.data2, at }; break;
          case 123:
          case 120: c.activeNotes.clear(); break;
          default: break;
        }
        break;
      }
      case 'programchange': {
        const c = this.channel(d.channel!);
        c.program = d.data1;
        c.voiceName = voiceName(c.bankMsb, c.bankLsb, d.data1);
        this.lastProgramChange = {
          channel: d.channel!,
          program: d.data1,
          bankMsb: c.bankMsb,
          bankLsb: c.bankLsb,
          voiceName: c.voiceName,
          at,
        };
        break;
      }
      case 'pitchbend':
        this.pitchBend = { channel: d.channel!, value: pitchBendValue(d), at };
        break;
      case 'clock':
        this.clockTicks++;
        this.clockTimes.push(at);
        if (this.clockTimes.length > CLOCKS_PER_BEAT * 4) this.clockTimes.shift();
        break;
      case 'start':
        this.transport = 'started';
        this.clockTimes = [];
        break;
      case 'continue':
        this.transport = 'continued';
        break;
      case 'stop':
        this.transport = 'stopped';
        break;
      default:
        break;
    }
  }

  private clockBpm(now: number): { bpm: number | null; running: boolean } {
    const last = this.clockTimes[this.clockTimes.length - 1];
    const running = last !== undefined && now - last <= CLOCK_IDLE_MS;
    if (!running || this.clockTimes.length < CLOCKS_PER_BEAT) return { bpm: null, running };
    const span = this.clockTimes[this.clockTimes.length - 1] - this.clockTimes[0];
    const intervals = this.clockTimes.length - 1;
    if (span <= 0) return { bpm: null, running };
    const msPerClock = span / intervals;
    const bpm = 60000 / (msPerClock * CLOCKS_PER_BEAT);
    return { bpm: Math.round(bpm * 10) / 10, running };
  }

  snapshot(now: number): KeyboardStateSnapshot {
    const channels: KeyboardStateSnapshot['channels'] = {};
    const melodyActive: number[] = [];
    const styleActive: number[] = [];
    for (const [ch, c] of this.channels) {
      channels[ch] = { ...c, activeNotes: Array.from(c.activeNotes).sort((a, b) => a - b) };
      const active = c.lastNoteOnAt !== null && now - c.lastNoteOnAt <= ACTIVITY_WINDOW_MS;
      if (active) (ch <= 8 ? melodyActive : styleActive).push(ch);
    }
    melodyActive.sort((a, b) => a - b);
    styleActive.sort((a, b) => a - b);

    const dualDetected = this.dualSeenAt !== null && now - this.dualSeenAt <= ACTIVITY_WINDOW_MS;

    // Split: two active melody channels whose observed ranges do not overlap.
    let splitDetected = false;
    let splitPointGuess: number | null = null;
    if (!dualDetected && melodyActive.length >= 2) {
      const ranges = melodyActive
        .map((ch) => this.channels.get(ch)!)
        .filter((c) => c.lowestMidi !== null && c.highestMidi !== null)
        .sort((a, b) => a.lowestMidi! - b.lowestMidi!);
      for (let i = 0; i + 1 < ranges.length; i++) {
        if (ranges[i].highestMidi! < ranges[i + 1].lowestMidi!) {
          splitDetected = true;
          splitPointGuess = ranges[i + 1].lowestMidi!;
          break;
        }
      }
    }

    const vel = this.velocities;
    const distinct = new Set(vel).size;
    let touchResponseGuess: KeyboardStateSnapshot['velocity']['touchResponseGuess'] = 'unknown';
    if (vel.length >= 8) touchResponseGuess = distinct <= 1 ? 'fixed' : 'variable';

    const clock = this.clockBpm(now);
    return {
      channels,
      lastProgramChange: this.lastProgramChange,
      pitchBend: this.pitchBend,
      sustain: this.sustain,
      clock: {
        bpm: clock.bpm,
        running: clock.running,
        ticks: this.clockTicks,
        lastAt: this.clockTimes[this.clockTimes.length - 1] ?? null,
      },
      transport: this.transport,
      melodyChannelsActive: melodyActive,
      styleChannelsActive: styleActive,
      styleRunning: styleActive.length > 0,
      dualDetected,
      splitDetected,
      splitPointGuess,
      velocity: {
        recent: [...vel],
        min: vel.length ? Math.min(...vel) : 0,
        max: vel.length ? Math.max(...vel) : 0,
        distinct,
        touchResponseGuess,
      },
      totalMessages: this.totalMessages,
    };
  }
}

// ---------------------------------------------------------------------------
// Monitor log
// ---------------------------------------------------------------------------

export interface MonitorEntry {
  seq: number;
  at: number;
  raw: number[];
  decoded: DecodedMidi;
  sourceId?: string;
}

export class MidiMonitorLog {
  private entries: MonitorEntry[] = [];
  private seq = 0;
  private filterClock = true;

  constructor(private capacity = 300) {}

  setFilterClock(on: boolean): void {
    this.filterClock = on;
  }

  push(raw: ArrayLike<number>, decoded: DecodedMidi, at: number, sourceId?: string): MonitorEntry | null {
    if (this.filterClock && (decoded.kind === 'clock' || decoded.kind === 'activesensing')) return null;
    const entry: MonitorEntry = { seq: this.seq++, at, raw: Array.from(raw), decoded, sourceId };
    this.entries.push(entry);
    if (this.entries.length > this.capacity) this.entries.shift();
    return entry;
  }

  list(): MonitorEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
