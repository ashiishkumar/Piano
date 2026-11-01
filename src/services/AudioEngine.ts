import * as Tone from 'tone';

class AudioEngineService {
  private sampler: Tone.Sampler | null = null;
  private fallbackPolySynth: Tone.PolySynth | null = null;
  private metronomeHigh: Tone.MembraneSynth | null = null;
  private metronomeLow: Tone.MembraneSynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private isInitialized = false;
  private isSamplerLoaded = false;
  private mutePcSynth = false;
  private masterVolumeDb = -2;
  private sustainPedalDown = false;
  private sustainedNotes = new Set<number>();
  private activePhysicalNotes = new Set<number>();

  public async init(): Promise<void> {
    if (this.isInitialized) {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }
      return;
    }

    await Tone.start();
    // Configure low-latency interactive lookahead
    Tone.getContext().lookAhead = 0.005;

    this.reverb = new Tone.Reverb({
      decay: 2.1,
      preDelay: 0.01,
      wet: 0.22,
    }).toDestination();

    // Instant zero-latency warm acoustic-modeled fallback synth (works offline or while Salamander samples stream)
    this.fallbackPolySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'fatsawtooth',
        count: 2,
        spread: 12,
      },
      envelope: {
        attack: 0.004,
        decay: 1.4,
        sustain: 0.18,
        release: 1.2,
      },
    }).connect(this.reverb);
    this.fallbackPolySynth.maxPolyphony = 32;
    this.fallbackPolySynth.volume.value = this.masterVolumeDb - 4;

    // Multi-sampled Salamander Grand Piano
    try {
      this.sampler = new Tone.Sampler({
        urls: {
          A1: 'A1.mp3',
          C2: 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          A2: 'A2.mp3',
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          A5: 'A5.mp3',
          C6: 'C6.mp3',
        },
        release: 1.1,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => {
          this.isSamplerLoaded = true;
        },
      }).connect(this.reverb);
      this.sampler.volume.value = this.masterVolumeDb;
    } catch {
      this.isSamplerLoaded = false;
    }

    // Precision Metronome Click Engine
    this.metronomeHigh = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.03 },
    }).toDestination();
    this.metronomeHigh.volume.value = -6;

    this.metronomeLow = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 3,
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
    }).toDestination();
    this.metronomeLow.volume.value = -9;

    this.isInitialized = true;
  }

  public setMutePcSynth(mute: boolean): void {
    this.mutePcSynth = mute;
    if (mute) {
      this.panic();
    }
  }

  public getMutePcSynth(): boolean {
    return this.mutePcSynth;
  }

  public setMasterVolume(db: number): void {
    this.masterVolumeDb = db;
    if (this.sampler) this.sampler.volume.value = db;
    if (this.fallbackPolySynth) this.fallbackPolySynth.volume.value = db - 4;
  }

  public noteOn(midi: number, velocity = 80, isBackingTrack = false): void {
    this.activePhysicalNotes.add(midi);
    this.sustainedNotes.delete(midi);

    if (this.mutePcSynth && !isBackingTrack) {
      return;
    }

    if (!this.isInitialized) {
      this.init().catch(() => {});
    }

    const freq = Tone.Frequency(midi, 'midi').toFrequency();
    // Curve velocity for expressive PSR-E373 touch response
    const normalizedVel = Math.pow(Math.max(1, Math.min(127, velocity)) / 127, 1.35);

    try {
      if (this.isSamplerLoaded && this.sampler) {
        this.sampler.triggerAttack(freq, Tone.now(), normalizedVel);
      } else if (this.fallbackPolySynth) {
        this.fallbackPolySynth.triggerAttack(freq, Tone.now(), normalizedVel);
      }
    } catch {
      // Ignore transient voice stealing errors
    }
  }

  public noteOff(midi: number): void {
    this.activePhysicalNotes.delete(midi);

    if (this.sustainPedalDown) {
      this.sustainedNotes.add(midi);
      return;
    }

    this.releaseNoteVoice(midi);
  }

  private releaseNoteVoice(midi: number): void {
    if (!this.isInitialized) return;
    const freq = Tone.Frequency(midi, 'midi').toFrequency();
    try {
      if (this.isSamplerLoaded && this.sampler) {
        this.sampler.triggerRelease(freq, Tone.now());
      } else if (this.fallbackPolySynth) {
        this.fallbackPolySynth.triggerRelease(freq, Tone.now());
      }
    } catch {
      // Ignore release errors
    }
  }

  public setSustainPedal(value: number): void {
    const isDown = value >= 64;
    if (this.sustainPedalDown && !isDown) {
      // Pedal released: release all sustained notes not currently held by fingers
      for (const midi of this.sustainedNotes) {
        if (!this.activePhysicalNotes.has(midi)) {
          this.releaseNoteVoice(midi);
        }
      }
      this.sustainedNotes.clear();
    }
    this.sustainPedalDown = isDown;
  }

  public playMetronomeClick(isDownbeat: boolean): void {
    if (!this.isInitialized) {
      this.init().catch(() => {});
    }
    try {
      if (isDownbeat) {
        this.metronomeHigh?.triggerAttackRelease('C6', '32n', Tone.now(), 0.9);
      } else {
        this.metronomeLow?.triggerAttackRelease('G5', '32n', Tone.now(), 0.65);
      }
    } catch {
      // Ignore audio context blocked before user gesture
    }
  }

  public panic(): void {
    this.activePhysicalNotes.clear();
    this.sustainedNotes.clear();
    try {
      this.sampler?.releaseAll();
      this.fallbackPolySynth?.releaseAll();
    } catch {
      // Ignore
    }
  }
}

export const audioEngine = new AudioEngineService();
