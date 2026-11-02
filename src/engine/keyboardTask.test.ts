import { describe, expect, it } from 'vitest';
import { KeyboardStateTracker, decodeMidiMessage } from './midi';
import { VerifyContext, scoreKeyboardTask, verifyStep } from './keyboardTask';

const on = (ch: number, midi: number, vel = 80) => decodeMidiMessage([0x90 | (ch - 1), midi, vel]);
const cc = (ch: number, num: number, val: number) => decodeMidiMessage([0xb0 | (ch - 1), num, val]);
const pc = (ch: number, prog: number) => decodeMidiMessage([0xc0 | (ch - 1), prog]);

function ctx(tracker: KeyboardStateTracker, now: number, extra: Partial<VerifyContext> = {}): VerifyContext {
  return { snapshot: tracker.snapshot(now), heldMidis: [], lastNoteOn: null, since: 1000, ...extra };
}

describe('verifyStep', () => {
  it('manual never auto-verifies', () => {
    expect(verifyStep({ kind: 'manual' }, ctx(new KeyboardStateTracker(), 2000))).toBe(false);
  });

  it('note checks require evidence newer than the step start', () => {
    const t = new KeyboardStateTracker();
    expect(verifyStep({ kind: 'any-note' }, ctx(t, 2000, { lastNoteOn: { midi: 60, at: 900 } }))).toBe(false);
    expect(verifyStep({ kind: 'any-note' }, ctx(t, 2000, { lastNoteOn: { midi: 60, at: 1500 } }))).toBe(true);
    expect(verifyStep({ kind: 'note-pressed', midi: 60 }, ctx(t, 2000, { lastNoteOn: { midi: 72, at: 1500 } }))).toBe(false);
    expect(verifyStep({ kind: 'note-pressed', midi: 60, anyOctave: true }, ctx(t, 2000, { lastNoteOn: { midi: 72, at: 1500 } }))).toBe(true);
  });

  it('chord-held uses the held keys', () => {
    const t = new KeyboardStateTracker();
    expect(verifyStep({ kind: 'chord-held', rootPc: 0, quality: 'major' }, ctx(t, 2000, { heldMidis: [60, 64, 67] }))).toBe(true);
    expect(verifyStep({ kind: 'chord-held', rootPc: 0, quality: 'major' }, ctx(t, 2000, { heldMidis: [60, 63, 67] }))).toBe(false);
  });

  it('program-change can require a specific voice', () => {
    const t = new KeyboardStateTracker();
    t.ingest(cc(1, 0, 0), 1200);
    t.ingest(pc(1, 0), 1201);
    expect(verifyStep({ kind: 'program-change' }, ctx(t, 2000))).toBe(true);
    expect(verifyStep({ kind: 'program-change', program: 0, bankMsb: 0 }, ctx(t, 2000))).toBe(true);
    expect(verifyStep({ kind: 'program-change', program: 40 }, ctx(t, 2000))).toBe(false);
    // Older than the step: not evidence
    expect(verifyStep({ kind: 'program-change' }, { ...ctx(t, 2000), since: 1500 })).toBe(false);
  });

  it('dual, split, style and clock read the tracker', () => {
    const t = new KeyboardStateTracker();
    t.ingest(on(1, 60), 1500);
    t.ingest(on(2, 60), 1503);
    expect(verifyStep({ kind: 'dual' }, ctx(t, 1600))).toBe(true);
    expect(verifyStep({ kind: 'split' }, ctx(t, 1600))).toBe(false);

    const s = new KeyboardStateTracker();
    s.ingest(on(10, 36), 1500);
    expect(verifyStep({ kind: 'style-running' }, ctx(s, 1600))).toBe(true);
    expect(verifyStep({ kind: 'style-stopped' }, ctx(s, 1600, { sawStyleSince: true }))).toBe(false);
    expect(verifyStep({ kind: 'style-stopped' }, ctx(s, 9000, { sawStyleSince: true }))).toBe(true);
    expect(verifyStep({ kind: 'style-stopped' }, ctx(s, 9000, { sawStyleSince: false }))).toBe(false);
  });

  it('sustain, pitch bend, touch response and transpose', () => {
    const t = new KeyboardStateTracker();
    t.ingest(cc(1, 64, 127), 1500);
    expect(verifyStep({ kind: 'sustain', state: 'down' }, ctx(t, 1600))).toBe(true);
    expect(verifyStep({ kind: 'sustain', state: 'up' }, ctx(t, 1600))).toBe(false);

    t.ingest(decodeMidiMessage([0xe0, 0, 100]), 1700); // +4608
    expect(verifyStep({ kind: 'pitch-bend' }, ctx(t, 1800))).toBe(true);
    expect(verifyStep({ kind: 'pitch-bend', minAbs: 5000 }, ctx(t, 1800))).toBe(false);

    for (let i = 0; i < 10; i++) t.ingest(on(1, 60 + i, 100), 2000 + i);
    expect(verifyStep({ kind: 'touch-response', expect: 'fixed' }, ctx(t, 2100))).toBe(true);

    expect(verifyStep({ kind: 'transpose', pressMidi: 60, expectedOffset: 2 }, ctx(t, 2100, { lastNoteOn: { midi: 62, at: 2050 } }))).toBe(true);
    expect(verifyStep({ kind: 'transpose', pressMidi: 60, expectedOffset: 2 }, ctx(t, 2100, { lastNoteOn: { midi: 60, at: 2050 } }))).toBe(false);
  });

  it('cc checks tracked controller values', () => {
    const t = new KeyboardStateTracker();
    t.ingest(cc(1, 91, 60), 1500);
    expect(verifyStep({ kind: 'cc', controller: 91, min: 50 }, ctx(t, 1600))).toBe(true);
    expect(verifyStep({ kind: 'cc', controller: 91, min: 70 }, ctx(t, 1600))).toBe(false);
    expect(verifyStep({ kind: 'cc', controller: 1 }, ctx(t, 1600))).toBe(false); // not tracked
  });
});

describe('scoreKeyboardTask', () => {
  it('rewards cable-verified steps over self-confirmed ones', () => {
    expect(scoreKeyboardTask(['verified', 'verified'])).toBe(100);
    expect(scoreKeyboardTask(['verified', 'confirmed'])).toBe(93);
    expect(scoreKeyboardTask(['confirmed'])).toBe(85);
    expect(scoreKeyboardTask([])).toBe(0);
  });
});
