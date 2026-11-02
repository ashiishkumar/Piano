import { SongScore } from '../types/music';
import { GlyphKey } from '../components/KeyGlyph';
import { getTeacherGuideForSong } from './teacherGuidance';
import { getSargamLabel } from './notation';

/**
 * The keys a lesson starts on: the first distinct notes of the hand Step 1 uses,
 * labelled with finger numbers. Enough for a learner to place their hand before
 * the first note falls.
 */
export function openingHandPosition(song: SongScore, maxKeys = 5): GlyphKey[] {
  const guide = getTeacherGuideForSong(song);
  const step = guide.steps[0];
  const notes = song.arrangements[step.tier].notes
    .filter((n) => step.handFilter === 'both' || n.hand === step.handFilter)
    .sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);

  const seen = new Map<number, GlyphKey>();
  for (const n of notes) {
    if (seen.has(n.midi)) continue;
    seen.set(n.midi, {
      midi: n.midi,
      hand: n.hand,
      label: n.finger ? String(n.finger) : getSargamLabel(n.midi, song.rootSaMidi).short,
    });
    if (seen.size >= maxKeys) break;
  }
  return Array.from(seen.values()).sort((a, b) => a.midi - b.midi);
}
