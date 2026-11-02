import { SongScore, TeacherLessonGuide } from '../types/music';
import { BUILTIN_SONGS } from '../data/curriculum';
import { generateAccompaniment, generateAlankar, generateChordToneMelody, withIdPrefix } from '../engine/generators';
import { makeSong, parseSargam, songFromSargam } from '../engine/sargam';
import { PC } from './lessons/types';

/**
 * Songs and drills authored for the path, built from Sargam text or generated.
 * These join the hand-coded BUILTIN_SONGS in ALL_SONGS. Copyright: everything here
 * is traditional, public domain, or original exercise material.
 */

// ---------------------------------------------------------------------------
// 1.8 Alankars 3–6 inside the five-finger home
// ---------------------------------------------------------------------------

function alankarSet(): SongScore {
  const bpm = 76;
  const patterns: { name: string; pattern: number[] }[] = [
    { name: 'four-note groups', pattern: [0, 1, 2, 3] },
    { name: 'five-note groups', pattern: [0, 1, 2, 3, 4] },
    { name: 'zigzag', pattern: [0, 1, 0, 1, 2] },
    { name: 'crossing thirds', pattern: [0, 2, 1, 3] },
  ];
  let beat = 0;
  const notes = patterns.flatMap((p, i) => {
    const part = generateAlankar({ bpm, pattern: p.pattern, topDegree: 4, startBeat: beat, idPrefix: `alk${i}` });
    const last = part[part.length - 1];
    beat = Math.round((last.startTime + last.duration) / (60 / bpm)) + 2; // two-beat breath between paltas
    return part;
  });
  return makeSong(
    {
      id: 'gen-alankars-3-6',
      title: 'Alankars 3–6: the standard set',
      subtitle: 'Four paltas inside Sa–Pa: four-note groups, five-note groups, zigzag, crossing thirds',
      composer: 'Traditional (generated)',
      stageId: 1,
      category: 'drill',
      bpm,
      timeSignature: [4, 4],
      keySignature: 'C',
      pedagogyFocus: ['Finger independence inside the five-finger home', 'Hearing a pattern move up and down the scale'],
      coachTip:
        'Every alankar is one small shape that walks up the scale and back down. Say the Sargam aloud as you play; the mouth remembers before the fingers do.',
    },
    { beginner: notes }
  );
}

// ---------------------------------------------------------------------------
// 1.10 Top four right-hand exercises (Sargam text)
// ---------------------------------------------------------------------------

const RH_EXERCISES = `
# 1. Repeated notes: each finger twice
RH: S1 S1 R2 R2 | G3 G3 M4 M4 | P5 P5 M4 M4 | G3 G3 R2 R2 | S1 - - 0 |
# 2. Leaps to Pa: thumb stays home, pinky stays on Pa
S1 P5 R2 P5 | G3 P5 M4 P5 | S1 P5 R2 P5 | G3 P5 S1 - |
# 3. Turns
S1 R2 G3 R2 | R2 G3 M4 G3 | G3 M4 P5 M4 | P5 M4 G3 R2 | S1 - - 0 |
# 4. Shrinking descents
P5 M4 G3 R2 | S1 0 M4 G3 | R2 S1 0 G3 | R2 S1 0 R2 | S1 - - - |
`;

// ---------------------------------------------------------------------------
// 4.6 Two-hand coordination over I–vi–IV–V
// ---------------------------------------------------------------------------

const COORDINATION_GUIDE: TeacherLessonGuide = {
  whyLearnThis:
    'Accompanying a song means the left hand holds a chord while the right hand moves. This drill makes that habit on the most common four chords in film music: C, Am, F, G.',
  handPlacement: {
    rightHand: 'Thumb on Middle C. The right hand plays the notes of each chord, one per beat: 1-3-5-3.',
    leftHand: 'Little finger on C3 (one octave below Middle C). The left hand holds each full chord for four beats.',
  },
  whatTeacherExpects: [
    'Step 1: left hand alone. Change chords exactly on beat 1.',
    'Step 2: both hands, waiting at every beat.',
    'Step 3: both hands in time. The left hand stays quieter than the right.',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Step 1: Left hand alone (Wait-for-Me)',
      subtitle: 'Block chords, one per bar',
      whatToExpect: 'Only the blue left-hand chords appear. Hold all three notes until the next bar.',
      handFilter: 'left',
      tier: 'beginner',
      practiceMode: 'wait',
      tempoMultiplier: 0.75,
    },
    {
      stepNumber: 2,
      title: 'Step 2: Both hands (Wait-for-Me)',
      subtitle: 'Chord under a moving melody',
      whatToExpect: 'The right hand adds 1-3-5-3 over each chord. The lesson waits for both hands.',
      handFilter: 'both',
      tier: 'beginner',
      practiceMode: 'wait',
      tempoMultiplier: 0.75,
    },
    {
      stepNumber: 3,
      title: 'Step 3: Both hands in rhythm',
      subtitle: 'Steady pulse',
      whatToExpect: 'Play it through with the metronome. Aim for the right hand a little louder than the left.',
      handFilter: 'both',
      tier: 'beginner',
      practiceMode: 'rhythm',
      tempoMultiplier: 0.85,
    },
  ],
};

function coordinationDrill(): SongScore {
  const bpm = 72;
  const progression = [
    { rootPc: PC.C, quality: 'major' as const },
    { rootPc: PC.A, quality: 'minor' as const },
    { rootPc: PC.F, quality: 'major' as const },
    { rootPc: PC.G, quality: 'major' as const },
  ];
  const lh = generateAccompaniment({ bpm, progression, beatsPerChord: 4, style: 'block', repeats: 2, idPrefix: 'co-l' });
  const rh = generateChordToneMelody({ bpm, progression, beatsPerChord: 4, repeats: 2, idPrefix: 'co-r' });
  return makeSong(
    {
      id: 'gen-coordination-1645',
      title: 'Advanced chord coordination: C, Am, F, G',
      subtitle: 'Left hand holds the chord, right hand walks its notes',
      composer: 'Exercise (generated)',
      stageId: 4,
      category: 'drill',
      bpm,
      timeSignature: [4, 4],
      keySignature: 'C',
      pedagogyFocus: ['Changing left-hand chords on beat 1', 'Right hand independent of the left'],
      coachTip: 'Change the left-hand chord a hair early rather than late; the ear forgives an early bass, never a late one.',
      teacherGuide: COORDINATION_GUIDE,
    },
    { beginner: [...lh, ...rh] }
  );
}

// ---------------------------------------------------------------------------
// 4.8 Twinkle Twinkle with chords (public domain)
// ---------------------------------------------------------------------------

const TWINKLE_RH = `
RH: S1 S1 P5 P5 | D5 D5 P5 - | M4 M4 G3 G3 | R2 R2 S1 - |
    P5 P5 M4 M4 | G3 G3 R2 - | P5 P5 M4 M4 | G3 G3 R2 - |
    S1 S1 P5 P5 | D5 D5 P5 - | M4 M4 G3 G3 | R2 R2 S1 - |
`;

/** Chord per half-bar (two beats). */
const TWINKLE_CHORDS = [
  PC.C, PC.C, PC.F, PC.C,
  PC.F, PC.C, PC.G, PC.C,
  PC.C, PC.F, PC.C, PC.G,
  PC.C, PC.F, PC.C, PC.G,
  PC.C, PC.C, PC.F, PC.C,
  PC.F, PC.C, PC.G, PC.C,
].map((rootPc) => ({ rootPc, quality: 'major' as const }));

const TWINKLE_GUIDE: TeacherLessonGuide = {
  whyLearnThis:
    'The first song most of the world learns, and the clearest way to feel how three chords, C, F and G, carry a whole melody. Learn the tune, then add the roots, then the full chords.',
  handPlacement: {
    rightHand: 'Thumb on Middle C. Fingers 1 to 5 on C D E F G; stretch the little finger up to A for "Dha".',
    leftHand: 'Little finger on C3. The chords C, F and G sit under this hand without moving it far.',
  },
  whatTeacherExpects: [
    'Step 1: the melody alone, in Wait-for-Me. Watch the held note at the end of each line.',
    'Step 2: add one left-hand root every two beats: C, F or G.',
    'Step 3: full chords in the left hand, in time.',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Step 1: Melody alone (Wait-for-Me)',
      subtitle: 'Right hand',
      whatToExpect: 'Only the melody. The lesson waits for every note.',
      handFilter: 'right',
      tier: 'beginner',
      practiceMode: 'wait',
      tempoMultiplier: 0.8,
    },
    {
      stepNumber: 2,
      title: 'Step 2: Add the roots (Wait-for-Me)',
      subtitle: 'C, F and G bass notes',
      whatToExpect: 'One left-hand note every two beats under the melody.',
      handFilter: 'both',
      tier: 'intermediate',
      practiceMode: 'wait',
      tempoMultiplier: 0.8,
    },
    {
      stepNumber: 3,
      title: 'Step 3: Full chords in time',
      subtitle: 'Block chords, steady pulse',
      whatToExpect: 'Three-note chords in the left hand, melody on top, metronome on.',
      handFilter: 'both',
      tier: 'pro',
      practiceMode: 'rhythm',
      tempoMultiplier: 0.85,
    },
  ],
};

function twinkleWithChords(): SongScore {
  const bpm = 84;
  const parse = { bpm, timeSignature: [4, 4] as [number, number] };
  const rh = parseSargam(TWINKLE_RH, { ...parse, idPrefix: 'tw-r' }).notes;
  const roots = generateAccompaniment({ bpm, progression: TWINKLE_CHORDS, beatsPerChord: 2, style: 'root', idPrefix: 'tw-root' });
  const blocks = generateAccompaniment({ bpm, progression: TWINKLE_CHORDS, beatsPerChord: 2, style: 'block', idPrefix: 'tw-blk' });
  return makeSong(
    {
      id: 'pd-twinkle-chords',
      title: 'Playing songs with chords: Twinkle Twinkle',
      subtitle: 'Melody right hand, C–F–G left hand',
      composer: 'Traditional (public domain)',
      stageId: 4,
      category: 'repertoire',
      bpm,
      timeSignature: [4, 4],
      keySignature: 'C',
      pedagogyFocus: ['Three chords under a melody', 'Changing chords every two beats'],
      coachTip: 'Sing the words as you play. When the words say "star", the chord is C; when they say "are", it is G.',
      teacherGuide: TWINKLE_GUIDE,
    },
    { beginner: rh, intermediate: [...rh, ...roots], pro: [...withIdPrefix(rh, 'tw-rp'), ...blocks] },
    { beginner: 'Melody only', intermediate: 'Melody + roots', pro: 'Melody + chords' }
  );
}

// ---------------------------------------------------------------------------

export const ALANKARS_3_6 = alankarSet();

export const RIGHT_HAND_EXERCISES = songFromSargam(
  {
    id: 'sg-rh-exercises',
    title: 'Top four right-hand exercises',
    subtitle: 'Repeated notes, leaps to Pa, turns, shrinking descents',
    composer: 'Exercise',
    stageId: 1,
    category: 'drill',
    bpm: 72,
    timeSignature: [4, 4],
    keySignature: 'C',
    pedagogyFocus: ['Each finger pressing twice without the others moving', 'Jumping to the little finger and back to the thumb'],
    coachTip: 'Keep the fingers that are not playing resting on their keys. A lifted finger is a slow finger.',
  },
  { beginner: RH_EXERCISES }
);

export const COORDINATION_1645 = coordinationDrill();
export const TWINKLE_WITH_CHORDS = twinkleWithChords();

export const CONTENT_SONGS: SongScore[] = [ALANKARS_3_6, RIGHT_HAND_EXERCISES, COORDINATION_1645, TWINKLE_WITH_CHORDS];

export const ALL_SONGS: SongScore[] = [...BUILTIN_SONGS, ...CONTENT_SONGS];
