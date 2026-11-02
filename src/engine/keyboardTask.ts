import { KeyboardVerification } from '../types/lesson';
import { KeyboardStateSnapshot } from './midi';
import { matchesChordTarget, pitchClass } from './theory';

export interface VerifyContext {
  snapshot: KeyboardStateSnapshot;
  heldMidis: number[];
  lastNoteOn: { midi: number; at: number } | null;
  /** performance.now() when the step started; evidence must be newer */
  since: number;
  /** Set by the player once a running style has been observed during this step */
  sawStyleSince?: boolean;
}

/** Controllers the tracker keeps per channel, for the 'cc' verification. */
const CC_FIELD: Record<number, 'volume' | 'expression' | 'pan' | 'reverbSend' | 'chorusSend' | 'variationSend'> = {
  7: 'volume',
  11: 'expression',
  10: 'pan',
  91: 'reverbSend',
  93: 'chorusSend',
  94: 'variationSend',
};

/**
 * Has the keyboard produced the evidence this step asks for?
 * Pure: the player feeds it the latest snapshot and note events.
 */
export function verifyStep(v: KeyboardVerification, ctx: VerifyContext): boolean {
  const { snapshot: s, lastNoteOn, since } = ctx;
  switch (v.kind) {
    case 'manual':
      return false;
    case 'any-note':
      return lastNoteOn !== null && lastNoteOn.at >= since;
    case 'note-pressed':
      if (!lastNoteOn || lastNoteOn.at < since) return false;
      return v.anyOctave ? pitchClass(lastNoteOn.midi) === pitchClass(v.midi) : lastNoteOn.midi === v.midi;
    case 'chord-held':
      return matchesChordTarget(ctx.heldMidis, v.rootPc, v.quality, v.options ?? {});
    case 'program-change': {
      const pc = s.lastProgramChange;
      if (!pc || pc.at < since) return false;
      if (v.program !== undefined && pc.program !== v.program) return false;
      if (v.bankMsb !== undefined && pc.bankMsb !== v.bankMsb) return false;
      if (v.bankLsb !== undefined && pc.bankLsb !== v.bankLsb) return false;
      return true;
    }
    case 'dual':
      return s.dualDetected;
    case 'split':
      return s.splitDetected;
    case 'style-running':
      return s.styleRunning;
    case 'style-stopped':
      return Boolean(ctx.sawStyleSince) && !s.styleRunning;
    case 'clock-running':
      return s.clock.running;
    case 'sustain':
      if (!s.sustain || s.sustain.at < since) return false;
      return v.state === 'down' ? s.sustain.value >= 64 : s.sustain.value < 64;
    case 'pitch-bend':
      return s.pitchBend !== null && s.pitchBend.at >= since && Math.abs(s.pitchBend.value) >= (v.minAbs ?? 1000);
    case 'touch-response':
      return s.velocity.touchResponseGuess === v.expect;
    case 'transpose':
      if (!lastNoteOn || lastNoteOn.at < since) return false;
      return lastNoteOn.midi - v.pressMidi === v.expectedOffset;
    case 'cc': {
      const field = CC_FIELD[v.controller];
      if (!field) return false;
      return Object.values(s.channels).some((c) => {
        const val = c[field];
        if (val === null) return false;
        if (v.min !== undefined && val < v.min) return false;
        if (v.max !== undefined && val > v.max) return false;
        return true;
      });
    }
    default:
      return false;
  }
}

/** Steps a learner can only confirm by hand (nothing arrives over MIDI). */
export function isManualOnly(v: KeyboardVerification): boolean {
  return v.kind === 'manual';
}

/**
 * Score for a finished keyboard-task lesson: every step confirmed over the cable
 * is worth full marks; self-confirmed steps a little less, still a pass.
 */
export function scoreKeyboardTask(stepOutcomes: ('verified' | 'confirmed')[]): number {
  if (stepOutcomes.length === 0) return 0;
  const sum = stepOutcomes.reduce((a, o) => a + (o === 'verified' ? 100 : 85), 0);
  return Math.round(sum / stepOutcomes.length);
}
