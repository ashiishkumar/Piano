import { describe, expect, it } from 'vitest';
import {
  KeyboardStateTracker,
  MidiMonitorLog,
  decodeMidiMessage,
  midiNoteName,
  pitchBendValue,
  voiceName,
} from './midi';

describe('decodeMidiMessage', () => {
  it('decodes channel voice messages with 1-based channels', () => {
    expect(decodeMidiMessage([0x90, 60, 100])).toMatchObject({ kind: 'noteon', channel: 1, data1: 60, data2: 100 });
    expect(decodeMidiMessage([0x91, 60, 0])).toMatchObject({ kind: 'noteoff', channel: 2 }); // vel 0 = off
    expect(decodeMidiMessage([0x80, 60, 64])).toMatchObject({ kind: 'noteoff', channel: 1 });
    expect(decodeMidiMessage([0xb0, 64, 127])).toMatchObject({ kind: 'cc', data1: 64, data2: 127 });
    expect(decodeMidiMessage([0xc0, 5])).toMatchObject({ kind: 'programchange', channel: 1, data1: 5 });
    expect(decodeMidiMessage([0xe0, 0, 64])).toMatchObject({ kind: 'pitchbend' });
    expect(pitchBendValue(decodeMidiMessage([0xe0, 0, 64]))).toBe(0);
    expect(pitchBendValue(decodeMidiMessage([0xe0, 127, 127]))).toBe(8191);
    expect(pitchBendValue(decodeMidiMessage([0xe0, 0, 0]))).toBe(-8192);
  });

  it('decodes system real-time messages that the old manager dropped', () => {
    expect(decodeMidiMessage([0xf8]).kind).toBe('clock');
    expect(decodeMidiMessage([0xfa]).kind).toBe('start');
    expect(decodeMidiMessage([0xfc]).kind).toBe('stop');
    expect(decodeMidiMessage([0xfe]).kind).toBe('activesensing');
    expect(decodeMidiMessage([0xf0, 0x43, 0x10, 0xf7]).kind).toBe('sysex');
  });

  it('writes readable descriptions', () => {
    expect(decodeMidiMessage([0x90, 60, 100]).description).toBe('Note On C4 vel 100');
    expect(decodeMidiMessage([0xb0, 64, 127]).description).toBe('CC 64 Sustain Pedal = 127');
    expect(decodeMidiMessage([0xc0, 0]).description).toBe('Program Change 1');
    expect(midiNoteName(36)).toBe('C2');
    expect(midiNoteName(96)).toBe('C7');
  });
});

describe('voiceName', () => {
  it('uses GM names for bank 0 and shows bank numbers otherwise', () => {
    expect(voiceName(0, 0, 0)).toBe('Acoustic Grand Piano');
    expect(voiceName(0, 0, 40)).toBe('Violin');
    expect(voiceName(0, 112, 0)).toMatch(/^Bank 0\/112 PC 1/);
    expect(voiceName(127, 0, 0)).toBe('Drum Kit PC 1');
  });
});

describe('KeyboardStateTracker', () => {
  const on = (ch: number, midi: number, vel = 80) => decodeMidiMessage([0x90 | (ch - 1), midi, vel]);
  const off = (ch: number, midi: number) => decodeMidiMessage([0x80 | (ch - 1), midi, 0]);
  const cc = (ch: number, num: number, val: number) => decodeMidiMessage([0xb0 | (ch - 1), num, val]);
  const pc = (ch: number, prog: number) => decodeMidiMessage([0xc0 | (ch - 1), prog]);

  it('tracks bank select + program change into a voice name', () => {
    const t = new KeyboardStateTracker();
    t.ingest(cc(1, 0, 0), 0);
    t.ingest(cc(1, 32, 0), 1);
    t.ingest(pc(1, 40), 2);
    const s = t.snapshot(10);
    expect(s.channels[1].voiceName).toBe('Violin');
    expect(s.lastProgramChange).toMatchObject({ channel: 1, program: 40, voiceName: 'Violin' });
  });

  it('detects Dual when the same note arrives on two channels at once', () => {
    const t = new KeyboardStateTracker();
    t.ingest(on(1, 60), 1000);
    t.ingest(on(2, 60), 1003);
    const s = t.snapshot(1500);
    expect(s.dualDetected).toBe(true);
    expect(s.splitDetected).toBe(false);
    expect(s.melodyChannelsActive).toEqual([1, 2]);
    // Fades after the activity window
    expect(t.snapshot(10_000).dualDetected).toBe(false);
  });

  it('detects Split when two melody channels have non-overlapping ranges', () => {
    const t = new KeyboardStateTracker();
    t.ingest(on(2, 48), 100); // left hand on ch 2
    t.ingest(off(2, 48), 300);
    t.ingest(on(2, 52), 400);
    t.ingest(on(1, 64), 700); // right hand on ch 1
    t.ingest(on(1, 67), 900);
    const s = t.snapshot(1000);
    expect(s.dualDetected).toBe(false);
    expect(s.splitDetected).toBe(true);
    expect(s.splitPointGuess).toBe(64);
  });

  it('reports style activity on channels 9–16', () => {
    const t = new KeyboardStateTracker();
    t.ingest(on(10, 36, 100), 0); // kick
    t.ingest(on(11, 43, 90), 10); // bass
    t.ingest(on(1, 72), 20); // melody
    const s = t.snapshot(100);
    expect(s.styleRunning).toBe(true);
    expect(s.styleChannelsActive).toEqual([10, 11]);
    expect(s.melodyChannelsActive).toEqual([1]);
    expect(s.channels[10].activeNotes).toEqual([36]);
  });

  it('estimates tempo from MIDI clock (24 ticks per beat)', () => {
    const t = new KeyboardStateTracker();
    t.ingest(decodeMidiMessage([0xfa]), 0);
    const msPerTick = 60000 / (120 * 24); // 120 BPM
    for (let i = 0; i < 48; i++) t.ingest(decodeMidiMessage([0xf8]), i * msPerTick);
    const s = t.snapshot(48 * msPerTick);
    expect(s.transport).toBe('started');
    expect(s.clock.running).toBe(true);
    expect(s.clock.bpm).toBe(120);
    expect(s.clock.ticks).toBe(48);
    // Stops counting as running once ticks stop
    expect(t.snapshot(48 * msPerTick + 5000).clock.running).toBe(false);
  });

  it('guesses Fixed touch response from identical velocities', () => {
    const fixed = new KeyboardStateTracker();
    for (let i = 0; i < 10; i++) fixed.ingest(on(1, 60 + i, 100), i * 100);
    expect(fixed.snapshot(2000).velocity.touchResponseGuess).toBe('fixed');

    const variable = new KeyboardStateTracker();
    for (let i = 0; i < 10; i++) variable.ingest(on(1, 60 + i, 60 + i * 5), i * 100);
    const v = variable.snapshot(2000).velocity;
    expect(v.touchResponseGuess).toBe('variable');
    expect(v.min).toBe(60);
    expect(v.max).toBe(105);

    const few = new KeyboardStateTracker();
    few.ingest(on(1, 60, 100), 0);
    expect(few.snapshot(10).velocity.touchResponseGuess).toBe('unknown');
  });

  it('records sustain, pitch bend and effect sends', () => {
    const t = new KeyboardStateTracker();
    t.ingest(cc(1, 64, 127), 5);
    t.ingest(decodeMidiMessage([0xe0, 0, 96]), 6);
    t.ingest(cc(1, 91, 40), 7);
    t.ingest(cc(1, 93, 20), 8);
    const s = t.snapshot(10);
    expect(s.sustain).toMatchObject({ value: 127 });
    expect(s.pitchBend?.value).toBe(4096);
    expect(s.channels[1].reverbSend).toBe(40);
    expect(s.channels[1].chorusSend).toBe(20);
  });

  it('resets cleanly', () => {
    const t = new KeyboardStateTracker();
    t.ingest(on(1, 60), 0);
    t.reset();
    const s = t.snapshot(10);
    expect(s.totalMessages).toBe(0);
    expect(Object.keys(s.channels)).toEqual([]);
  });
});

describe('MidiMonitorLog', () => {
  it('keeps a bounded log and filters clock by default', () => {
    const log = new MidiMonitorLog(3);
    log.push([0xf8], decodeMidiMessage([0xf8]), 0);
    log.push([0x90, 60, 100], decodeMidiMessage([0x90, 60, 100]), 1);
    log.push([0x90, 62, 100], decodeMidiMessage([0x90, 62, 100]), 2);
    log.push([0x90, 64, 100], decodeMidiMessage([0x90, 64, 100]), 3);
    log.push([0x90, 65, 100], decodeMidiMessage([0x90, 65, 100]), 4);
    const entries = log.list();
    expect(entries).toHaveLength(3);
    expect(entries.map((e) => e.decoded.data1)).toEqual([62, 64, 65]);
    expect(entries[0].seq).toBe(1);

    log.setFilterClock(false);
    log.push([0xf8], decodeMidiMessage([0xf8]), 5);
    expect(log.list().at(-1)?.decoded.kind).toBe('clock');
  });
});
