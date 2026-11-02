import { useEffect, useMemo, useRef } from 'react';
import { midiManager } from '../services/MIDIManager';
import { useStudioStore } from '../store/useStudioStore';

export interface NoteOnEvent {
  midi: number;
  velocity: number;
  at: number;
}

/**
 * Call `handler` for every note-on from any source (USB, computer keys, mouse).
 * The latest handler is always used, so callers can close over state freely.
 */
export function useNoteOn(handler: (e: NoteOnEvent) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(
    () =>
      midiManager.subscribe((ev) => {
        if (ev.type === 'noteon') ref.current({ midi: ev.midi, velocity: ev.velocity, at: ev.timestamp });
      }),
    []
  );
}

/** Keys currently held, ascending. */
export function useHeldMidis(): number[] {
  const activeNotes = useStudioStore((s) => s.activeNotes);
  return useMemo(() => Object.keys(activeNotes).map(Number).sort((a, b) => a - b), [activeNotes]);
}
