import { Midi } from '@tonejs/midi';
import JSZip from 'jszip';
import { HandType, ScoreNote, SongScore } from '../types/music';
import {
  estimateFingeringForNotes,
  getWesternName,
  PSR_E373_MAX_MIDI,
  PSR_E373_MIN_MIDI,
} from '../utils/notation';

/**
 * Clamps any out-of-bounds MIDI note into the Yamaha PSR-E373 61-key range (36..96)
 * by octave-shifting while preserving pitch class.
 */
function foldIntoPsrE373Range(midi: number): number {
  let m = midi;
  while (m < PSR_E373_MIN_MIDI) m += 12;
  while (m > PSR_E373_MAX_MIDI) m -= 12;
  return m;
}

/**
 * Polyphonic Hand Separation Algorithm:
 * Separates a merged stream of notes into Right Hand (Melody/Upper) and Left Hand (Bass/Accompaniment)
 * using simultaneous chord slicing + a dynamic voice-leading split point around Middle C (60).
 */
export function autoSeparateHands(rawNotes: Omit<ScoreNote, 'hand'>[]): ScoreNote[] {
  const sorted = [...rawNotes].sort((a, b) => a.startTime - b.startTime || a.midi - b.midi);
  const groups: Omit<ScoreNote, 'hand'>[][] = [];

  for (const n of sorted) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && Math.abs(n.startTime - lastGroup[0].startTime) < 0.04) {
      lastGroup.push(n);
    } else {
      groups.push([n]);
    }
  }

  let runningSplitMidi = 60; // Dynamic split point starting at Middle C (C4)
  const output: ScoreNote[] = [];

  for (const group of groups) {
    group.sort((a, b) => a.midi - b.midi);
    if (group.length === 1) {
      const n = group[0];
      const hand: HandType = n.midi >= runningSplitMidi - 2 ? 'right' : 'left';
      // Gently adapt split point with voice-leading inertia
      if (hand === 'right' && n.midi < 62) runningSplitMidi = Math.max(55, n.midi - 2);
      if (hand === 'left' && n.midi > 58) runningSplitMidi = Math.min(64, n.midi + 2);
      output.push({ ...n, hand });
    } else {
      // Multiple simultaneous notes: if span > 12 semitones or spans across split point, split between hands
      const lowest = group[0].midi;
      const highest = group[group.length - 1].midi;

      for (let i = 0; i < group.length; i++) {
        const n = group[i];
        let hand: HandType;
        if (i === group.length - 1 && highest >= 57) {
          hand = 'right'; // Top note is melody
        } else if (i === 0 && lowest < 60 && highest - lowest >= 7) {
          hand = 'left'; // Bottom note is bass
        } else {
          hand = n.midi >= runningSplitMidi ? 'right' : 'left';
        }
        output.push({ ...n, hand });
      }
    }
  }

  return output;
}

/**
 * Generates the 3-tier arrangements (Beginner, Intermediate, Pro) from a full Pro note list.
 * When targetStageId is 1 or 2, the Beginner tier is kept strictly 1-Hand (Right Hand Melody only)
 * so the learner can practice any imported internet MIDI at their current fundamental pace without being rushed.
 */
export function buildThreeTierArrangements(
  proNotesInput: ScoreNote[],
  bpm: number,
  timeSignature: [number, number],
  targetStageId = 0
): SongScore['arrangements'] {
  const proNotes = estimateFingeringForNotes(
    [...proNotesInput].sort((a, b) => a.startTime - b.startTime || a.midi - b.midi)
  );

  const secondsPerBeat = 60 / bpm;
  const secondsPerMeasure = secondsPerBeat * timeSignature[0];
  const isOneHandFundamentalStage = targetStageId === 1 || targetStageId === 2;

  // Group by measure for intelligent reduction
  const byMeasure = new Map<number, ScoreNote[]>();
  for (const n of proNotes) {
    const list = byMeasure.get(n.measure) || [];
    list.push(n);
    byMeasure.set(n.measure, list);
  }

  const beginnerRaw: ScoreNote[] = [];
  const intermediateRaw: ScoreNote[] = [];

  for (const [measureNum, mNotes] of byMeasure.entries()) {
    const rhNotes = mNotes.filter((n) => n.hand === 'right');
    const lhNotes = mNotes.filter((n) => n.hand === 'left');

    // Extract monophonic top melody for Beginner Right Hand (highest note at each onset)
    const rhGroups: ScoreNote[][] = [];
    for (const rn of rhNotes) {
      const last = rhGroups[rhGroups.length - 1];
      if (last && Math.abs(rn.startTime - last[0].startTime) < 0.045) {
        last.push(rn);
      } else {
        rhGroups.push([rn]);
      }
    }

    for (const grp of rhGroups) {
      grp.sort((a, b) => b.midi - a.midi);
      const topMelody = grp[0];
      beginnerRaw.push({
        ...topMelody,
        id: `beg-rh-${topMelody.id}`,
        finger: undefined,
      });

      // Intermediate keeps top 1-2 notes in RH
      grp.slice(0, isOneHandFundamentalStage ? 1 : 2).forEach((n, idx) => {
        intermediateRaw.push({
          ...n,
          id: `int-rh-${n.id}-${idx}`,
          finger: undefined,
        });
      });
    }

    // Left Hand root calculation
    const measureStartSec = (measureNum - 1) * secondsPerMeasure;
    const lowestLh = [...lhNotes].sort((a, b) => a.midi - b.midi)[0];
    const fallbackRoot = rhGroups[0]?.[0]
      ? foldIntoPsrE373Range(rhGroups[0][0].midi - 12)
      : 48;
    const rootMidi = lowestLh ? lowestLh.midi : fallbackRoot;

    // Only add Left Hand in Beginner tier if Stage >= 3 or general import (0)
    if (!isOneHandFundamentalStage) {
      beginnerRaw.push({
        id: `beg-lh-m${measureNum}`,
        midi: rootMidi,
        startTime: lowestLh ? lowestLh.startTime : measureStartSec,
        duration: Math.min(secondsPerMeasure * 0.9, secondsPerBeat * 2),
        measure: measureNum,
        beat: 1,
        hand: 'left',
        velocity: 60,
        chordSymbol: getWesternName(rootMidi, false),
      });
    }

    // Left Hand for Intermediate: Single Beat-1 Root for Stage 1/2, or Root + Fifth / Triad for Stage 3+
    if (isOneHandFundamentalStage) {
      intermediateRaw.push({
        id: `int-lh-m${measureNum}`,
        midi: rootMidi,
        startTime: lowestLh ? lowestLh.startTime : measureStartSec,
        duration: Math.min(secondsPerMeasure * 0.9, secondsPerBeat * 2),
        measure: measureNum,
        beat: 1,
        hand: 'left',
        velocity: 60,
        chordSymbol: getWesternName(rootMidi, false),
      });
    } else if (lhNotes.length > 0 && lhNotes.length <= 4) {
      lhNotes.forEach((ln) =>
        intermediateRaw.push({
          ...ln,
          id: `int-lh-${ln.id}`,
          velocity: Math.min(68, ln.velocity),
          finger: undefined,
        })
      );
    } else {
      // Synthesize clean Root + Fifth accompaniment
      const fifthMidi = foldIntoPsrE373Range(rootMidi + 7);
      intermediateRaw.push(
        {
          id: `int-lh-m${measureNum}-b1-r`,
          midi: rootMidi,
          startTime: measureStartSec,
          duration: secondsPerBeat * 1.8,
          measure: measureNum,
          beat: 1,
          hand: 'left',
          velocity: 62,
        },
        {
          id: `int-lh-m${measureNum}-b1-5`,
          midi: fifthMidi,
          startTime: measureStartSec + secondsPerBeat,
          duration: secondsPerBeat * 0.9,
          measure: measureNum,
          beat: 2,
          hand: 'left',
          velocity: 58,
        }
      );
    }
  }

  return {
    beginner: {
      tier: 'beginner',
      label: isOneHandFundamentalStage
        ? `Stage ${targetStageId} Pace (Pure Right-Hand Melody)`
        : 'Beginner (Melody + Root Bass)',
      description: isOneHandFundamentalStage
        ? 'Pure single-note Right-Hand melody with 1–5 finger guidance and zero Left-Hand rush.'
        : 'Single-note Right-Hand melody with Left-Hand root bass on Beat 1.',
      notes: estimateFingeringForNotes(beginnerRaw),
    },
    intermediate: {
      tier: 'intermediate',
      label: isOneHandFundamentalStage
        ? 'Next Step (Melody + Single Root Bass)'
        : 'Intermediate (Melody + Chords/Fifths)',
      description: isOneHandFundamentalStage
        ? 'Adds a single Beat-1 Left-Hand bass note once your Right-Hand melody is effortless.'
        : 'Expressive melody paired with structured Left-Hand harmonic accompaniment.',
      notes: estimateFingeringForNotes(intermediateRaw),
    },
    pro: {
      tier: 'pro',
      label: 'Original / Pro Arrangement',
      description: 'Full polyphonic two-hand transcription with complete voicings and dynamics.',
      notes: proNotes,
    },
  };
}

/**
 * Parses a standard `.mid` or `.midi` ArrayBuffer using `@tonejs/midi`
 */
export async function parseMidiFile(
  buffer: ArrayBuffer,
  fileName: string,
  targetStageId = 0
): Promise<SongScore> {
  const midi = new Midi(buffer);
  const rawBpm = Math.round(midi.header.tempos[0]?.bpm || 100);
  // If imported into Stage 1 or 2, cap default tempo to a gentle fundamental pace (68-80 BPM)
  const bpm =
    targetStageId === 1
      ? Math.min(rawBpm, 68)
      : targetStageId === 2
      ? Math.min(rawBpm, 78)
      : rawBpm;
  const ts = midi.header.timeSignatures[0]?.timeSignature || [4, 4];
  const timeSignature: [number, number] = [ts[0] || 4, ts[1] || 4];
  const keySignature = midi.header.keySignatures[0]?.key || 'C';

  const secondsPerBeat = 60 / bpm;
  const secondsPerMeasure = secondsPerBeat * timeSignature[0];

  const nonEmptyTracks = midi.tracks.filter((t) => t.notes.length > 0);
  let notesWithHands: ScoreNote[] = [];

  if (nonEmptyTracks.length >= 2) {
    // Check if tracks represent Right and Left hands by average pitch or track name
    const trackStats = nonEmptyTracks.map((t, idx) => {
      const avgMidi = t.notes.reduce((acc, n) => acc + n.midi, 0) / t.notes.length;
      return { track: t, avgMidi, idx };
    });
    trackStats.sort((a, b) => b.avgMidi - a.avgMidi);

    trackStats.forEach((tsItem, idx) => {
      const hand: HandType = idx === 0 ? 'right' : 'left';
      tsItem.track.notes.forEach((n, nIdx) => {
        const clampedMidi = foldIntoPsrE373Range(n.midi);
        const measure = Math.floor(n.time / secondsPerMeasure) + 1;
        const beat = Math.floor((n.time % secondsPerMeasure) / secondsPerBeat) + 1;
        notesWithHands.push({
          id: `midi-t${idx}-n${nIdx}`,
          midi: clampedMidi,
          startTime: Number(n.time.toFixed(3)),
          duration: Math.max(0.1, Number(n.duration.toFixed(3))),
          measure,
          beat,
          hand,
          velocity: Math.max(25, Math.min(127, Math.round(n.velocity * 127))),
        });
      });
    });
  } else if (nonEmptyTracks.length === 1) {
    const raw: Omit<ScoreNote, 'hand'>[] = nonEmptyTracks[0].notes.map((n, nIdx) => {
      const clampedMidi = foldIntoPsrE373Range(n.midi);
      const measure = Math.floor(n.time / secondsPerMeasure) + 1;
      const beat = Math.floor((n.time % secondsPerMeasure) / secondsPerBeat) + 1;
      return {
        id: `midi-merged-${nIdx}`,
        midi: clampedMidi,
        startTime: Number(n.time.toFixed(3)),
        duration: Math.max(0.1, Number(n.duration.toFixed(3))),
        measure,
        beat,
        velocity: Math.max(25, Math.min(127, Math.round(n.velocity * 127))),
      };
    });
    notesWithHands = autoSeparateHands(raw);
  }

  const totalMeasures =
    notesWithHands.reduce((max, n) => Math.max(max, n.measure), 1) || 1;
  const durationSeconds =
    notesWithHands.reduce((max, n) => Math.max(max, n.startTime + n.duration), 4) || 4;

  const cleanTitle = fileName.replace(/\.(mid|midi)$/i, '').replace(/[_-]+/g, ' ');
  const arrangements = buildThreeTierArrangements(
    notesWithHands,
    bpm,
    timeSignature,
    targetStageId
  );

  return {
    id: `imported-${Date.now()}`,
    title: cleanTitle || 'Imported MIDI Piece',
    subtitle:
      targetStageId > 0
        ? `Stage ${targetStageId} Custom Practice Melody (Skill-Paced)`
        : 'Universal MIDI Smart Arrangement (3 Tiers)',
    composer: midi.header.name || 'Imported Score',
    stageId: targetStageId,
    category: 'imported',
    bpm,
    timeSignature,
    keySignature,
    rootSaMidi: 0,
    totalMeasures,
    durationSeconds,
    pedagogyFocus:
      targetStageId > 0
        ? [`Stage ${targetStageId} Extra Practice`, 'Fundamental Pace', '3-Tier Simplifier']
        : ['Custom Repertoire', 'Auto Hand-Split', '3-Tier Simplifier'],
    coachTip:
      targetStageId === 1 || targetStageId === 2
        ? `Automatically paced for Stage ${targetStageId}: Start in Beginner tier to practice the pure Right-Hand melody in Wait-for-Me mode with zero rush!`
        : 'Start with the Beginner tier to master the right-hand phrasing and downbeat bass before switching to Intermediate or Pro.',
    arrangements,
  };
}

/**
 * Parses a MusicXML (`.musicxml`, `.xml`) string or compressed `.mxl` container
 */
export async function parseMusicXmlString(
  xmlText: string,
  fileName: string,
  targetStageId = 0
): Promise<SongScore> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const workTitle =
    doc.querySelector('work > work-title')?.textContent?.trim() ||
    doc.querySelector('movement-title')?.textContent?.trim() ||
    fileName.replace(/\.(musicxml|xml|mxl)$/i, '').replace(/[_-]+/g, ' ');

  const creator =
    doc.querySelector('identification > creator[type="composer"]')?.textContent?.trim() ||
    'MusicXML Score';

  const soundTempo = Number(doc.querySelector('sound[tempo]')?.getAttribute('tempo') || 100);
  const rawBpm = Number.isFinite(soundTempo) && soundTempo > 20 ? Math.round(soundTempo) : 100;
  const bpm =
    targetStageId === 1
      ? Math.min(rawBpm, 68)
      : targetStageId === 2
      ? Math.min(rawBpm, 78)
      : rawBpm;

  const beats = Number(doc.querySelector('time > beats')?.textContent || 4);
  const beatType = Number(doc.querySelector('time > beat-type')?.textContent || 4);
  const timeSignature: [number, number] = [beats, beatType];
  const secondsPerBeat = 60 / bpm;

  const stepToPc: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let divisions = 1;
  const extractedNotes: ScoreNote[] = [];
  let noteCounter = 0;

  const measures = Array.from(doc.querySelectorAll('part > measure'));
  let globalMeasureCursorSec = 0;

  measures.forEach((measureEl, mIdx) => {
    const measureNumber = Number(measureEl.getAttribute('number')) || mIdx + 1;
    const divEl = measureEl.querySelector('attributes > divisions');
    if (divEl && Number(divEl.textContent) > 0) {
      divisions = Number(divEl.textContent);
    }

    let cursorDivisions = 0;
    let lastNoteStartDivisions = 0;

    Array.from(measureEl.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'backup') {
        const dur = Number(child.querySelector('duration')?.textContent || 0);
        cursorDivisions = Math.max(0, cursorDivisions - dur);
      } else if (tag === 'forward') {
        const dur = Number(child.querySelector('duration')?.textContent || 0);
        cursorDivisions += dur;
      } else if (tag === 'note') {
        const isRest = child.querySelector('rest') !== null;
        const isChord = child.querySelector('chord') !== null;
        const durDiv = Number(child.querySelector('duration')?.textContent || divisions);
        const startDiv = isChord ? lastNoteStartDivisions : cursorDivisions;

        if (!isRest) {
          const step = child.querySelector('pitch > step')?.textContent?.trim() || 'C';
          const alter = Number(child.querySelector('pitch > alter')?.textContent || 0);
          const octave = Number(child.querySelector('pitch > octave')?.textContent || 4);
          const staff = Number(child.querySelector('staff')?.textContent || 1);
          const fingerNum = Number(child.querySelector('notations > technical > fingering')?.textContent || 0);

          const rawMidi = (octave + 1) * 12 + (stepToPc[step] ?? 0) + alter;
          const clampedMidi = foldIntoPsrE373Range(rawMidi);

          const startBeatOffset = startDiv / divisions;
          const durationBeats = Math.max(0.15, durDiv / divisions);
          const startTime = globalMeasureCursorSec + startBeatOffset * secondsPerBeat;
          const duration = durationBeats * secondsPerBeat;

          const hand: HandType = staff === 2 || clampedMidi < 58 ? 'left' : 'right';

          extractedNotes.push({
            id: `mxml-n${++noteCounter}`,
            midi: clampedMidi,
            startTime: Number(startTime.toFixed(3)),
            duration: Number(duration.toFixed(3)),
            measure: measureNumber,
            beat: Math.floor(startBeatOffset) + 1,
            hand,
            velocity: hand === 'right' ? 84 : 62,
            finger:
              fingerNum >= 1 && fingerNum <= 5
                ? (fingerNum as 1 | 2 | 3 | 4 | 5)
                : undefined,
          });
        }

        if (!isChord) {
          lastNoteStartDivisions = cursorDivisions;
          cursorDivisions += durDiv;
        }
      }
    });

    globalMeasureCursorSec += timeSignature[0] * secondsPerBeat;
  });

  // If all notes were on staff 1, run intelligent polyphonic split
  const hasLeft = extractedNotes.some((n) => n.hand === 'left');
  const finalNotes = hasLeft ? extractedNotes : autoSeparateHands(extractedNotes);

  const totalMeasures = Math.max(1, measures.length);
  const durationSeconds =
    finalNotes.reduce((max, n) => Math.max(max, n.startTime + n.duration), 4) || 4;

  return {
    id: `imported-xml-${Date.now()}`,
    title: workTitle,
    subtitle:
      targetStageId > 0
        ? `Stage ${targetStageId} Custom Practice Melody (Skill-Paced)`
        : 'MusicXML Smart Arrangement (3 Tiers)',
    composer: creator,
    stageId: targetStageId,
    category: 'imported',
    bpm,
    timeSignature,
    keySignature: 'C',
    rootSaMidi: 0,
    totalMeasures,
    durationSeconds,
    pedagogyFocus:
      targetStageId > 0
        ? [`Stage ${targetStageId} Extra Practice`, 'Fundamental Pace', '3-Tier Simplifier']
        : ['MusicXML Grand Staff', '3-Tier Simplifier'],
    coachTip:
      targetStageId === 1 || targetStageId === 2
        ? `Automatically paced for Stage ${targetStageId}: Start in Beginner tier to practice the pure Right-Hand melody in Wait-for-Me mode with zero rush!`
        : 'Use Wait-for-Me mode first to sight-read unfamiliar measures at your own pace.',
    arrangements: buildThreeTierArrangements(
      finalNotes,
      bpm,
      timeSignature,
      targetStageId
    ),
  };
}

export async function importUniversalSongFile(
  file: File,
  targetStageId = 0
): Promise<SongScore> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.mid') || lower.endsWith('.midi')) {
    const buf = await file.arrayBuffer();
    return parseMidiFile(buf, file.name, targetStageId);
  }

  if (lower.endsWith('.mxl')) {
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    let scoreXmlFile: JSZip.JSZipObject | null = null;
    zip.forEach((relPath, entry) => {
      if (
        !entry.dir &&
        !relPath.includes('META-INF') &&
        (relPath.endsWith('.xml') || relPath.endsWith('.musicxml'))
      ) {
        scoreXmlFile = entry;
      }
    });
    if (!scoreXmlFile) {
      throw new Error('No valid MusicXML score found inside the .mxl archive.');
    }
    const xmlText = await (scoreXmlFile as JSZip.JSZipObject).async('string');
    return parseMusicXmlString(xmlText, file.name, targetStageId);
  }

  const text = await file.text();
  return parseMusicXmlString(text, file.name, targetStageId);
}
