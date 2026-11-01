import { CurriculumStage, ScoreNote, SongScore } from '../types/music';
import { buildThreeTierArrangements } from '../services/SongImporter';

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    id: 1,
    title: 'Stage 1: Orientation, Hand Posture & The Sargam-to-Western Bridge',
    subtitle: 'From 1-Hand Ear Melodies to Ergonomic Finger Crossings & Staff Mapping',
    badge: 'Foundation Bridge',
    description:
      'Bridge your natural ear for Indian Sargam (Sa Re Ga Ma) directly to Western Grand Staff notation, Middle C (C4) orientation on the 61-key PSR-E373, and the essential 1-2-3-1-2-3-4-5 thumb-under crossing.',
    skillsUnlocked: [
      'Middle C (MIDI 60) Spatial Anchor',
      'Sargam <-> Western Pitch Mapping',
      'Thumb-Under Crossing (1-2-3-1)',
      'Pickup Beats & Steady Metronome Pulse',
    ],
    lessonIds: ['stage1-sargam-scale', 'stage1-happy-birthday', 'stage1-om-shanti-om'],
  },
  {
    id: 2,
    title: 'Stage 2: Introducing the Left Hand & Hand Independence',
    subtitle: 'Breaking the 1-Hand Barrier with Symmetrical & Asymmetric Coordination',
    badge: 'Hand Independence',
    description:
      'Unlock your Left Hand on the lower octaves (C2–B3) of the PSR-E373. Master mirror-image contrary motion and holding long Left-Hand bass notes while the Right Hand plays moving rhythms.',
    skillsUnlocked: [
      'Left-Hand Bass Clef Navigation',
      'Symmetrical Contrary Motion',
      '2-Against-1 Rhythmic Independence',
      'Left/Right Hand Velocity Separation',
    ],
    lessonIds: ['stage2-contrary-motion', 'stage2-rhythmic-independence'],
  },
  {
    id: 3,
    title: 'Stage 3: Chords, Inversions & Bollywood/Pop Accompaniment',
    subtitle: 'Triads, Voice-Leading Inversions, and 1-5-8-5 Ballad Arpeggios',
    badge: 'Harmonic Arranger',
    description:
      'Stop jumping wildly across the keyboard! Learn Root, 1st, and 2nd chord inversions for smooth Left-Hand transitions, plus the iconic 1-5-8-5 broken arpeggio pattern used in Bollywood and Western Pop.',
    skillsUnlocked: [
      'Major & Minor Triads',
      '1st & 2nd Inversions (Minimal Jumps)',
      '1-5-8-5 Broken Arpeggio Comping',
      'Lead-Sheet Chord Symbol Reading',
    ],
    lessonIds: ['stage3-chord-inversions', 'stage3-bollywood-ballad-arpeggio'],
  },
  {
    id: 4,
    title: 'Stage 4: Scales, Arpeggios & Technical Dexterity',
    subtitle: 'Hanon Finger Independence, 4th/5th Finger Strength, and Czerny Agility',
    badge: 'Technical Dexterity',
    description:
      'Eliminate weak ring and pinky fingers (4 & 5) with interactive Hanon drills and Czerny velocity studies monitored to ±25ms micro-timing accuracy.',
    skillsUnlocked: [
      'Hanon No. 1 Parallel Hands',
      '4th & 5th Finger Equalized Velocity',
      'Sixteenth-Note Evenness',
      '2-Octave Arpeggio Sweeps',
    ],
    lessonIds: ['stage4-hanon-no1', 'stage4-czerny-velocity'],
  },
  {
    id: 5,
    title: 'Stage 5: Sight-Reading & Grand Staff Mastery',
    subtitle: 'Landmark Note Reflexes, Key Signatures, and Two-Voice Polyphony',
    badge: 'Sight-Reader',
    description:
      'Transition to Blind Mode on the keyboard by anchoring on Grand Staff landmarks (Bass F3, Middle C4, Treble G4) and reading two independent voices simultaneously.',
    skillsUnlocked: [
      'Grand Staff Landmark Reflexes',
      'No-Look Spatial Interval Leaps',
      'Baroque Counterpoint (Bach Minuet)',
      'Blind-Mode Sight-Reading',
    ],
    lessonIds: ['stage5-landmark-drills', 'stage5-bach-minuet-g'],
  },
  {
    id: 6,
    title: 'Stage 6: Expressive Virtuosity, Voicing & Sustain Pedal',
    subtitle: 'PSR-E373 Touch Response Shaping, Chord Voicing & CC64 Pedaling',
    badge: 'Virtuoso Artist',
    description:
      'Harness the full velocity sensitivity and sustain pedal (CC 64) of your Yamaha PSR-E373. Shape crescendos, voice the top note of Right-Hand chords, and master clean syncopated pedaling.',
    skillsUnlocked: [
      'Melody-Over-Accompaniment Voicing (RH > LH)',
      'Crescendo & Diminuendo Curves',
      'Top-Note Chord Voicing',
      'Syncopated Sustain Pedaling (CC 64)',
    ],
    lessonIds: ['stage6-nocturne-expression'],
  },
];

// Helper to create ScoreNotes concisely using beats instead of raw seconds
interface NoteSeed {
  midi: number;
  beatStart: number; // 0-indexed beat from start of song
  beatDur: number;
  hand: 'left' | 'right';
  velocity?: number;
  finger?: 1 | 2 | 3 | 4 | 5;
  lyric?: string;
  chordSymbol?: string;
  articulation?: 'legato' | 'staccato' | 'normal' | 'accent';
}

function buildScoreFromSeeds(
  meta: Omit<SongScore, 'arrangements' | 'totalMeasures' | 'durationSeconds'>,
  seeds: NoteSeed[]
): SongScore {
  const spb = 60 / meta.bpm;
  const beatsPerMeasure = meta.timeSignature[0];

  const proNotes: ScoreNote[] = seeds.map((s, idx) => {
    const measure = Math.floor(s.beatStart / beatsPerMeasure) + 1;
    const beat = Math.floor(s.beatStart % beatsPerMeasure) + 1;
    return {
      id: `${meta.id}-n${idx}`,
      midi: s.midi,
      startTime: Number((s.beatStart * spb).toFixed(3)),
      duration: Number((s.beatDur * spb).toFixed(3)),
      measure,
      beat,
      hand: s.hand,
      velocity: s.velocity ?? (s.hand === 'right' ? 84 : 60),
      finger: s.finger,
      lyric: s.lyric,
      chordSymbol: s.chordSymbol,
      articulation: s.articulation ?? 'legato',
    };
  });

  const maxBeat = seeds.reduce((m, s) => Math.max(m, s.beatStart + s.beatDur), 4);
  const totalMeasures = Math.max(1, Math.ceil(maxBeat / beatsPerMeasure));
  const durationSeconds = Number((maxBeat * spb).toFixed(2));

  return {
    ...meta,
    totalMeasures,
    durationSeconds,
    arrangements: buildThreeTierArrangements(proNotes, meta.bpm, meta.timeSignature),
  };
}

// ============================================================================
// STAGE 1 LESSONS
// ============================================================================

const stage1SargamScale = buildScoreFromSeeds(
  {
    id: 'stage1-sargam-scale',
    title: 'Sa Re Ga Ma — Bilawal Thaat to C-Major Crossing',
    subtitle: 'Stage 1.1 • Mastering the 1-2-3-1-2-3-4-5 Thumb-Under Technique',
    composer: 'Conservatory Foundation Bridge',
    stageId: 1,
    category: 'curriculum',
    bpm: 84,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Thumb Tuck (1-2-3-1)', 'Sargam-to-Staff Mapping', 'Left-Hand Shadja Drone'],
    coachTip:
      'When ascending from Ga (E4, Finger 3) to Ma (F4, Finger 1), relax your wrist and glide your thumb smoothly underneath Finger 3 without twisting your elbow.',
  },
  [
    // Measure 1: Ascending Sa Re Ga Ma (C4 D4 E4 F4) + LH C3 Tonic
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C (Sa)' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1, lyric: 'Ma' },

    // Measure 2: Ascending Pa Dha Ni Sa' (G4 A4 B4 C5) + LH G3 Pa
    { midi: 55, beatStart: 4, beatDur: 1.9, hand: 'left', velocity: 58, finger: 1, chordSymbol: 'G (Pa)' },
    { midi: 48, beatStart: 6, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2, lyric: 'Pa' },
    { midi: 69, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Dha' },
    { midi: 71, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'Ni' },
    { midi: 72, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 94, finger: 5, lyric: 'Sȧ' },

    // Measure 3: Descending Sa' Ni Dha Pa (C5 B4 A4 G4)
    { midi: 48, beatStart: 8, beatDur: 1.9, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 10, beatDur: 1.9, hand: 'left', velocity: 58, finger: 1, chordSymbol: 'G' },
    { midi: 72, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5, lyric: 'Sȧ' },
    { midi: 71, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: 'Ni' },
    { midi: 69, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3, lyric: 'Dha' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Pa' },

    // Measure 4: Descending Ma Ga Re Sa (F4 E4 D4 C4) with Finger 3 crossing over Thumb
    { midi: 53, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 58, finger: 2, chordSymbol: 'F' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 65, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'Ma' },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 82, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 78, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 75, finger: 1, lyric: 'Sa' },
  ]
);

const stage1HappyBirthday = buildScoreFromSeeds(
  {
    id: 'stage1-happy-birthday',
    title: 'Happy Birthday to You (Two-Hand Waltz Arrangement)',
    subtitle: 'Stage 1.2 • Upgrading a Familiar Ear Melody to 3/4 Meter & Chords',
    composer: 'Traditional / Arr. VirtuosoStudio',
    stageId: 1,
    category: 'curriculum',
    bpm: 92,
    timeSignature: [3, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['3/4 Waltz Pulse', 'Octave Stretch (G4 to G5)', 'I–V–IV–I Harmony'],
    coachTip:
      'Keep your Left Hand waltz chords gentle (velocity ~55–62) so the Right Hand celebration melody sings clearly above the accompaniment.',
  },
  [
    // Measure 1 (C Major): Pa Pa Dha Pa Sa' Ni
    { midi: 48, beatStart: 0, beatDur: 2.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'C' },
    { midi: 52, beatStart: 1, beatDur: 0.8, hand: 'left', velocity: 52, finger: 3 },
    { midi: 55, beatStart: 2, beatDur: 0.8, hand: 'left', velocity: 52, finger: 1 },
    { midi: 67, beatStart: 0, beatDur: 0.5, hand: 'right', velocity: 82, finger: 1, lyric: 'Hap-' },
    { midi: 67, beatStart: 0.5, beatDur: 0.45, hand: 'right', velocity: 84, finger: 1, lyric: 'py' },
    { midi: 69, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 88, finger: 2, lyric: 'Birth-' },
    { midi: 67, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'day' },

    // Measure 2 (G Major): C5 (Sa') -> B4 (Ni) + pickup
    { midi: 43, beatStart: 3, beatDur: 2.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'G' },
    { midi: 50, beatStart: 4, beatDur: 0.8, hand: 'left', velocity: 52, finger: 2 },
    { midi: 55, beatStart: 5, beatDur: 0.8, hand: 'left', velocity: 52, finger: 1 },
    { midi: 72, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'to' },
    { midi: 71, beatStart: 4, beatDur: 1.4, hand: 'right', velocity: 85, finger: 3, lyric: 'you,' },
    { midi: 67, beatStart: 5.5, beatDur: 0.45, hand: 'right', velocity: 82, finger: 1, lyric: 'Hap-' },

    // Measure 3 (G7 -> C): A4 G4 D5 C5
    { midi: 43, beatStart: 6, beatDur: 2.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'G7' },
    { midi: 53, beatStart: 7, beatDur: 0.8, hand: 'left', velocity: 52, finger: 2 },
    { midi: 55, beatStart: 8, beatDur: 0.8, hand: 'left', velocity: 52, finger: 1 },
    { midi: 69, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2, lyric: 'Birth-' },
    { midi: 67, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'day' },
    { midi: 74, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5, lyric: 'to' },

    // Measure 4 (C -> F): C5 held, then Octave leap G4 -> G5 -> E5 -> C5
    { midi: 48, beatStart: 9, beatDur: 1.4, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 53, beatStart: 10.5, beatDur: 1.4, hand: 'left', velocity: 60, finger: 2, chordSymbol: 'F' },
    { midi: 72, beatStart: 9, beatDur: 1.0, hand: 'right', velocity: 88, finger: 4, lyric: 'you!' },
    { midi: 79, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 95, finger: 5, lyric: 'Dear' },
    { midi: 76, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Pian-ist' },
  ]
);

const stage1OmShantiOm = buildScoreFromSeeds(
  {
    id: 'stage1-om-shanti-om',
    title: 'Om Shanti Om — Bollywood Anthem Theme (Sargam to 2-Hand)',
    subtitle: 'Stage 1.3 • Transforming Ear-Played Sargam into Full Two-Hand Harmony',
    composer: 'Bollywood Repertoire Bridge',
    stageId: 1,
    category: 'curriculum',
    bpm: 96,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Sargam Phrasing (Ga-Ma-Pa-Dha-Pa)', 'Syncopated Hook', 'Left-Hand C–Am–F–G Groove'],
    coachTip:
      'You likely played this hook with one hand using Ga-Ma-Pa! Notice how adding the Left-Hand C -> Am -> F -> G bass progression immediately gives it a studio sound.',
  },
  [
    // Measure 1 (C Major): E4 F4 G4 G4 A4 G4 F4 E4 (Ga Ma Pa Pa Dha Pa Ma Ga)
    { midi: 48, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 2, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 64, beatStart: 0, beatDur: 0.5, hand: 'right', velocity: 85, finger: 2, lyric: 'Ga' },
    { midi: 65, beatStart: 0.5, beatDur: 0.5, hand: 'right', velocity: 86, finger: 3, lyric: 'Ma' },
    { midi: 67, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 92, finger: 4, lyric: 'Pa (Om)' },
    { midi: 69, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5, lyric: 'Dha (Shan-)' },
    { midi: 67, beatStart: 3, beatDur: 0.5, hand: 'right', velocity: 88, finger: 4, lyric: 'ti' },
    { midi: 64, beatStart: 3.5, beatDur: 0.5, hand: 'right', velocity: 84, finger: 2, lyric: 'Om' },

    // Measure 2 (A Minor): E4 D4 C4 D4 E4 G4 E4 D4
    { midi: 45, beatStart: 4, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'Am' },
    { midi: 52, beatStart: 6, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Sa' },
    { midi: 62, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },

    // Measure 3 (F Major): F4 G4 A4 C5 B4 A4 G4
    { midi: 41, beatStart: 8, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'F' },
    { midi: 48, beatStart: 10, beatDur: 1.9, hand: 'left', velocity: 58, finger: 1 },
    { midi: 65, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 88, finger: 1, lyric: 'Ma' },
    { midi: 69, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Dha' },
    { midi: 72, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 95, finger: 5, lyric: 'Sȧ' },
    { midi: 69, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Dha' },

    // Measure 4 (G Major -> C Major Cadence): G4 F4 E4 D4 C4
    { midi: 43, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'G' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 64, finger: 5, chordSymbol: 'C' },
    { midi: 67, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'Pa' },
    { midi: 65, beatStart: 13, beatDur: 0.5, hand: 'right', velocity: 86, finger: 3, lyric: 'Ma' },
    { midi: 62, beatStart: 13.5, beatDur: 0.5, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 90, finger: 1, lyric: 'Sa' },
  ]
);

// ============================================================================
// STAGE 2 LESSONS
// ============================================================================

const stage2ContraryMotion = buildScoreFromSeeds(
  {
    id: 'stage2-contrary-motion',
    title: 'Symmetrical Contrary Motion Drill (From Middle C)',
    subtitle: 'Stage 2.1 • Mirror-Image Finger Crossings (1-2-3-1-2-3-4-5 Both Hands)',
    composer: 'Conservatory Pedagogy Engine',
    stageId: 2,
    category: 'curriculum',
    bpm: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Mirror-Image Symmetry', 'Simultaneous Thumb-Under (Beat 4)', 'Equal Hand Timing'],
    coachTip:
      'Both thumbs start on Middle C (C4) and use identical finger numbers (1-2-3-1-2-3-4-5) moving in opposite directions! Watch for simultaneous thumb tucks on F4 (RH) and G3 (LH).',
  },
  [
    // Measure 1: Outward expansion C4 -> C5 (RH) and C4 -> C3 (LH)
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1 },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 78, finger: 1 },

    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2 },
    { midi: 59, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 80, finger: 2 },

    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3 },
    { midi: 57, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 82, finger: 3 },

    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1 },
    { midi: 55, beatStart: 3, beatDur: 0.9, hand: 'left', velocity: 82, finger: 1 },

    // Measure 2: Continue outward to C5 / C3
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2 },
    { midi: 53, beatStart: 4, beatDur: 0.9, hand: 'left', velocity: 84, finger: 2 },

    { midi: 69, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3 },
    { midi: 52, beatStart: 5, beatDur: 0.9, hand: 'left', velocity: 85, finger: 3 },

    { midi: 71, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4 },
    { midi: 50, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 86, finger: 4 },

    { midi: 72, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5 },
    { midi: 48, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 88, finger: 5 },

    // Measure 3: Return inward toward Middle C
    { midi: 71, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4 },
    { midi: 50, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 84, finger: 4 },

    { midi: 69, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3 },
    { midi: 52, beatStart: 9, beatDur: 0.9, hand: 'left', velocity: 82, finger: 3 },

    { midi: 67, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2 },
    { midi: 53, beatStart: 10, beatDur: 0.9, hand: 'left', velocity: 80, finger: 2 },

    { midi: 65, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1 },
    { midi: 55, beatStart: 11, beatDur: 0.9, hand: 'left', velocity: 78, finger: 1 },

    // Measure 4: Converge on Middle C4
    { midi: 64, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 82, finger: 3 },
    { midi: 57, beatStart: 12, beatDur: 0.9, hand: 'left', velocity: 78, finger: 3 },

    { midi: 62, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2 },
    { midi: 59, beatStart: 13, beatDur: 0.9, hand: 'left', velocity: 76, finger: 2 },

    { midi: 60, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 85, finger: 1 },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 75, finger: 5 },
  ]
);

const stage2RhythmicIndependence = buildScoreFromSeeds(
  {
    id: 'stage2-rhythmic-independence',
    title: '2-Against-1 Rhythmic Independence Etude',
    subtitle: 'Stage 2.2 • Sustained Left-Hand Half Notes Under Flowing Right-Hand Quarters',
    composer: 'Conservatory Pedagogy Engine',
    stageId: 2,
    category: 'curriculum',
    bpm: 90,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Holding LH While RH Moves', 'Preventing Staccato LH Cutoffs', 'Harmonic Anchoring'],
    coachTip:
      'Do NOT lift your Left Hand when the Right Hand strikes Beat 2 or Beat 4! Hold the Left-Hand bass notes for their full 2-beat duration.',
  },
  [
    // Measure 1
    { midi: 48, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 2, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 64, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3 },
    { midi: 67, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 86, finger: 5 },
    { midi: 65, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 4 },
    { midi: 62, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2 },

    // Measure 2
    { midi: 45, beatStart: 4, beatDur: 1.9, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Am' },
    { midi: 52, beatStart: 6, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 60, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1 },
    { midi: 64, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3 },
    { midi: 69, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5 },
    { midi: 67, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4 },

    // Measure 3
    { midi: 41, beatStart: 8, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'F' },
    { midi: 43, beatStart: 10, beatDur: 1.9, hand: 'left', velocity: 60, finger: 4, chordSymbol: 'G' },
    { midi: 65, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3 },
    { midi: 69, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5 },
    { midi: 67, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4 },
    { midi: 62, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1 },

    // Measure 4
    { midi: 48, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 64, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3 },
    { midi: 62, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2 },
    { midi: 60, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 88, finger: 1 },
  ]
);

// ============================================================================
// STAGE 3 LESSONS
// ============================================================================

const stage3ChordInversions = buildScoreFromSeeds(
  {
    id: 'stage3-chord-inversions',
    title: 'Zero-Jump Voice Leading: I–vi–IV–V Chord Inversions',
    subtitle: 'Stage 3.1 • C Root -> Am (1st Inv) -> F (2nd Inv) -> G (1st Inv)',
    composer: 'Harmony & Comping Lab',
    stageId: 3,
    category: 'curriculum',
    bpm: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Voice Leading', '1st & 2nd Inversions', 'Eliminating Left-Hand Jumps'],
    coachTip:
      'Notice how moving from C Major (C3-E3-G3) to A Minor 1st Inversion (C3-E3-A3) requires moving ONLY your Left-Hand thumb up one white key from G3 to A3!',
  },
  [
    // Measure 1: C Major Root Position (C3-E3-G3) + RH Melody
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C (Root)' },
    { midi: 52, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 56, finger: 3 },
    { midi: 55, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 58, finger: 1 },
    { midi: 64, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 85, finger: 2 },
    { midi: 67, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4 },
    { midi: 72, beatStart: 2, beatDur: 1.8, hand: 'right', velocity: 92, finger: 5 },

    // Measure 2: A Minor 1st Inversion (C3-E3-A3) - Only thumb moves G3->A3!
    { midi: 48, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Am/C (1st Inv)' },
    { midi: 52, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 56, finger: 3 },
    { midi: 57, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 58, finger: 1 },
    { midi: 71, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4 },
    { midi: 69, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3 },
    { midi: 64, beatStart: 6, beatDur: 1.8, hand: 'right', velocity: 84, finger: 1 },

    // Measure 3: F Major 2nd Inversion (C3-F3-A3) - Only middle finger moves E3->F3!
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'F/C (2nd Inv)' },
    { midi: 53, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 58, finger: 2 },
    { midi: 57, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 60, finger: 1 },
    { midi: 65, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2 },
    { midi: 69, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4 },
    { midi: 67, beatStart: 10, beatDur: 1.8, hand: 'right', velocity: 88, finger: 3 },

    // Measure 4: G Major 1st Inversion (B2-D3-G3) -> C
    { midi: 47, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'G/B (1st Inv)' },
    { midi: 50, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 56, finger: 3 },
    { midi: 55, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 58, finger: 1 },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'C' },
    { midi: 52, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 58, finger: 3 },
    { midi: 55, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 60, finger: 1 },
    { midi: 62, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2 },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3 },
    { midi: 60, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 90, finger: 1 },
  ]
);

const stage3BollywoodBalladArpeggio = buildScoreFromSeeds(
  {
    id: 'stage3-bollywood-ballad-arpeggio',
    title: 'Bollywood Romantic Ballad — 1-5-8-5 Broken Arpeggio Flow',
    subtitle: 'Stage 3.2 • Left-Hand Octave-Fifth Arpeggios (5-2-1-2) Under Lyrical Melody',
    composer: 'VirtuosoStudio Repertoire',
    stageId: 3,
    category: 'curriculum',
    bpm: 86,
    timeSignature: [4, 4],
    keySignature: 'Am',
    rootSaMidi: 0,
    pedagogyFocus: ['1-5-8-5 Broken Arpeggio (Fingers 5-2-1-2)', 'Am–F–C–G Progression', 'Singing RH Legato'],
    coachTip:
      'Use Left-Hand fingers 5 (Root), 2 (Fifth), and 1 (Octave) for every 1-5-8-5 broken chord. Let your wrist rotate gently from pinky to thumb.',
  },
  [
    // Measure 1: Am (A2 - E3 - A3 - E3)
    { midi: 45, beatStart: 0, beatDur: 0.95, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Am' },
    { midi: 52, beatStart: 1, beatDur: 0.95, hand: 'left', velocity: 54, finger: 2 },
    { midi: 57, beatStart: 2, beatDur: 0.95, hand: 'left', velocity: 56, finger: 1 },
    { midi: 52, beatStart: 3, beatDur: 0.95, hand: 'left', velocity: 52, finger: 2 },
    { midi: 69, beatStart: 0, beatDur: 1.4, hand: 'right', velocity: 88, finger: 3, lyric: 'Dha' },
    { midi: 71, beatStart: 1.5, beatDur: 0.5, hand: 'right', velocity: 86, finger: 4, lyric: 'Ni' },
    { midi: 72, beatStart: 2, beatDur: 1.9, hand: 'right', velocity: 92, finger: 5, lyric: 'Sȧ' },

    // Measure 2: F Major (F2 - C3 - F3 - C3)
    { midi: 41, beatStart: 4, beatDur: 0.95, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'F' },
    { midi: 48, beatStart: 5, beatDur: 0.95, hand: 'left', velocity: 54, finger: 2 },
    { midi: 53, beatStart: 6, beatDur: 0.95, hand: 'left', velocity: 56, finger: 1 },
    { midi: 48, beatStart: 7, beatDur: 0.95, hand: 'left', velocity: 52, finger: 2 },
    { midi: 69, beatStart: 4, beatDur: 1.4, hand: 'right', velocity: 86, finger: 3, lyric: 'Dha' },
    { midi: 67, beatStart: 5.5, beatDur: 0.5, hand: 'right', velocity: 84, finger: 2, lyric: 'Pa' },
    { midi: 65, beatStart: 6, beatDur: 1.9, hand: 'right', velocity: 88, finger: 1, lyric: 'Ma' },

    // Measure 3: C Major (C3 - G3 - C4 - G3)
    { midi: 48, beatStart: 8, beatDur: 0.95, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 9, beatDur: 0.95, hand: 'left', velocity: 54, finger: 2 },
    { midi: 60, beatStart: 10, beatDur: 0.95, hand: 'left', velocity: 56, finger: 1 },
    { midi: 55, beatStart: 11, beatDur: 0.95, hand: 'left', velocity: 52, finger: 2 },
    { midi: 64, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1, lyric: 'Ga' },
    { midi: 67, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Pa' },
    { midi: 72, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 94, finger: 5, lyric: 'Sȧ' },
    { midi: 71, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: 'Ni' },

    // Measure 4: G Major -> Am
    { midi: 43, beatStart: 12, beatDur: 0.95, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'G' },
    { midi: 50, beatStart: 13, beatDur: 0.95, hand: 'left', velocity: 55, finger: 2 },
    { midi: 45, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'Am' },
    { midi: 69, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'Dha' },
    { midi: 67, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Pa' },
    { midi: 69, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Dha' },
  ]
);

// ============================================================================
// STAGE 4 LESSONS
// ============================================================================

const stage4HanonNo1 = buildScoreFromSeeds(
  {
    id: 'stage4-hanon-no1',
    title: 'Hanon Exercise No. 1 — The Virtuoso Pianist (Parallel Hands)',
    subtitle: 'Stage 4.1 • Precision Finger Independence & 4th/5th Finger Equalizer',
    composer: 'Charles-Louis Hanon',
    stageId: 4,
    category: 'drill',
    bpm: 96,
    timeSignature: [2, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Skip-Step Pattern (C-E-F-G-A-G-F-E)', '4th & 5th Finger Strength', 'Sub-25ms Evenness'],
    coachTip:
      'Lift each finger cleanly and strike every sixteenth/eighth note with identical velocity (~82). Notice the skip between Finger 1 and Finger 2 on the ascending climb!',
  },
  [
    // Pattern 1 starting on C (C4 RH / C3 LH): C - E - F - G - A - G - F - E
    ...[
      { rh: 60, lh: 48, rf: 1, lf: 5 },
      { rh: 64, lh: 52, rf: 2, lf: 4 },
      { rh: 65, lh: 53, rf: 3, lf: 3 },
      { rh: 67, lh: 55, rf: 4, lf: 2 },
      { rh: 69, lh: 57, rf: 5, lf: 1 },
      { rh: 67, lh: 55, rf: 4, lf: 2 },
      { rh: 65, lh: 53, rf: 3, lf: 3 },
      { rh: 64, lh: 52, rf: 2, lf: 4 },
      // Pattern 2 starting on D (D4 RH / D3 LH): D - F - G - A - B - A - G - F
      { rh: 62, lh: 50, rf: 1, lf: 5 },
      { rh: 65, lh: 53, rf: 2, lf: 4 },
      { rh: 67, lh: 55, rf: 3, lf: 3 },
      { rh: 69, lh: 57, rf: 4, lf: 2 },
      { rh: 71, lh: 59, rf: 5, lf: 1 },
      { rh: 69, lh: 57, rf: 4, lf: 2 },
      { rh: 67, lh: 55, rf: 3, lf: 3 },
      { rh: 65, lh: 53, rf: 2, lf: 4 },
      // Pattern 3 starting on E (E4 RH / E3 LH): E - G - A - B - C5 - B - A - G
      { rh: 64, lh: 52, rf: 1, lf: 5 },
      { rh: 67, lh: 55, rf: 2, lf: 4 },
      { rh: 69, lh: 57, rf: 3, lf: 3 },
      { rh: 71, lh: 59, rf: 4, lf: 2 },
      { rh: 72, lh: 60, rf: 5, lf: 1 },
      { rh: 71, lh: 59, rf: 4, lf: 2 },
      { rh: 69, lh: 57, rf: 3, lf: 3 },
      { rh: 67, lh: 55, rf: 2, lf: 4 },
      // Final resolution on F -> C
      { rh: 65, lh: 53, rf: 1, lf: 5 },
      { rh: 69, lh: 57, rf: 3, lf: 3 },
      { rh: 72, lh: 60, rf: 5, lf: 1 },
      { rh: 60, lh: 48, rf: 1, lf: 5 },
    ].flatMap((step, idx) => [
      {
        midi: step.rh,
        beatStart: idx * 0.5,
        beatDur: 0.45,
        hand: 'right' as const,
        velocity: 84,
        finger: step.rf as 1 | 2 | 3 | 4 | 5,
      },
      {
        midi: step.lh,
        beatStart: idx * 0.5,
        beatDur: 0.45,
        hand: 'left' as const,
        velocity: 80,
        finger: step.lf as 1 | 2 | 3 | 4 | 5,
      },
    ]),
  ]
);

const stage4CzernyVelocity = buildScoreFromSeeds(
  {
    id: 'stage4-czerny-velocity',
    title: 'Czerny Op. 299 Velocity & Arpeggio Study in C',
    subtitle: 'Stage 4.2 • Rapid Right-Hand Passagework Over Staccato Left-Hand Chords',
    composer: 'Carl Czerny',
    stageId: 4,
    category: 'drill',
    bpm: 104,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Rapid Scale Runs', 'Crisp LH Staccato Chords', 'Speed Trainer Auto-Ramp'],
    coachTip:
      'Turn on the A-B Measure Looper with Auto-Ramp Tempo starting at 60% speed. Let VirtuosoStudio increase BPM by +5% each time you score >= 95% accuracy!',
  },
  [
    // Measure 1: C Major cascade
    { midi: 48, beatStart: 0, beatDur: 0.6, hand: 'left', velocity: 60, finger: 5, articulation: 'staccato', chordSymbol: 'C' },
    { midi: 52, beatStart: 0, beatDur: 0.6, hand: 'left', velocity: 58, finger: 3, articulation: 'staccato' },
    { midi: 55, beatStart: 0, beatDur: 0.6, hand: 'left', velocity: 58, finger: 1, articulation: 'staccato' },
    { midi: 48, beatStart: 2, beatDur: 0.6, hand: 'left', velocity: 60, finger: 5, articulation: 'staccato' },
    { midi: 55, beatStart: 2, beatDur: 0.6, hand: 'left', velocity: 58, finger: 1, articulation: 'staccato' },

    { midi: 60, beatStart: 0, beatDur: 0.45, hand: 'right', velocity: 84, finger: 1 },
    { midi: 64, beatStart: 0.5, beatDur: 0.45, hand: 'right', velocity: 85, finger: 2 },
    { midi: 67, beatStart: 1, beatDur: 0.45, hand: 'right', velocity: 86, finger: 3 },
    { midi: 72, beatStart: 1.5, beatDur: 0.45, hand: 'right', velocity: 90, finger: 5 },
    { midi: 71, beatStart: 2, beatDur: 0.45, hand: 'right', velocity: 88, finger: 4 },
    { midi: 69, beatStart: 2.5, beatDur: 0.45, hand: 'right', velocity: 86, finger: 3 },
    { midi: 67, beatStart: 3, beatDur: 0.45, hand: 'right', velocity: 84, finger: 2 },
    { midi: 65, beatStart: 3.5, beatDur: 0.45, hand: 'right', velocity: 82, finger: 1 },

    // Measure 2: G7 -> C resolution
    { midi: 43, beatStart: 4, beatDur: 0.6, hand: 'left', velocity: 60, finger: 5, articulation: 'staccato', chordSymbol: 'G7' },
    { midi: 50, beatStart: 4, beatDur: 0.6, hand: 'left', velocity: 56, finger: 2, articulation: 'staccato' },
    { midi: 53, beatStart: 4, beatDur: 0.6, hand: 'left', velocity: 56, finger: 1, articulation: 'staccato' },
    { midi: 48, beatStart: 6, beatDur: 1.8, hand: 'left', velocity: 64, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 6, beatDur: 1.8, hand: 'left', velocity: 60, finger: 1 },

    { midi: 64, beatStart: 4, beatDur: 0.45, hand: 'right', velocity: 86, finger: 3 },
    { midi: 62, beatStart: 4.5, beatDur: 0.45, hand: 'right', velocity: 84, finger: 2 },
    { midi: 60, beatStart: 5, beatDur: 0.45, hand: 'right', velocity: 82, finger: 1 },
    { midi: 62, beatStart: 5.5, beatDur: 0.45, hand: 'right', velocity: 85, finger: 2 },
    { midi: 64, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3 },
    { midi: 60, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 90, finger: 1 },
  ]
);

// ============================================================================
// STAGE 5 LESSONS
// ============================================================================

const stage5LandmarkDrills = buildScoreFromSeeds(
  {
    id: 'stage5-landmark-drills',
    title: 'Grand Staff Landmark Reflex Trainer (C3–F3–C4–G4–C5)',
    subtitle: 'Stage 5.1 • Instant Spatial Recognition Without Looking at Your Hands',
    composer: 'Sight-Reading Lab',
    stageId: 5,
    category: 'drill',
    bpm: 80,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Bass Clef F3 Anchor', 'Middle C4 Ledger Line', 'Treble Clef G4 Anchor', 'Blind Mode Ready'],
    coachTip:
      'Switch the Notation Bridge to "Blind Mode" for this exercise! Keep your eyes strictly on the Grand Staff sheet music and feel the intervals on your PSR-E373 keys.',
  },
  [
    // Measure 1: Landmarks C3 -> F3 -> C4 -> G4 -> C5
    { midi: 48, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 75, finger: 5, lyric: 'Bass C3' },
    { midi: 53, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 78, finger: 2, lyric: 'Bass F3' },
    { midi: 60, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Mid C4' },
    { midi: 67, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Treb G4' },

    // Measure 2: High C5 -> G4 -> F3 -> C3
    { midi: 72, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5, lyric: 'High C5' },
    { midi: 67, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Treb G4' },
    { midi: 53, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 78, finger: 2, lyric: 'Bass F3' },
    { midi: 48, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 76, finger: 5, lyric: 'Bass C3' },

    // Measure 3: Stepwise Neighbors from Landmarks
    { midi: 55, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 76, finger: 1 },
    { midi: 64, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3 },
    { midi: 62, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2 },
    { midi: 60, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1 },
  ]
);

const stage5BachMinuetG = buildScoreFromSeeds(
  {
    id: 'stage5-bach-minuet-g',
    title: 'Minuet in G Major, BWV Anh. 114 (Grand Staff Counterpoint)',
    subtitle: 'Stage 5.2 • Two Independent Melodic Voices Conversing in 3/4 Meter',
    composer: 'J.S. Bach / Christian Petzold',
    stageId: 5,
    category: 'repertoire',
    bpm: 96,
    timeSignature: [3, 4],
    keySignature: 'G',
    rootSaMidi: 7, // G = Sa
    pedagogyFocus: ['Baroque Counterpoint', 'F# Key Signature', 'Contrary Bass Line'],
    coachTip:
      'In Baroque music, the Left Hand is not just block chords—it is a second singer! Shape both the Right-Hand D5–G4–A4–B4–C5 line and the Left-Hand B3–A3–G3–B3 bass.',
  },
  [
    // Measure 1 (G Major): RH D5, G4-A4-B4-C5 | LH G3-B3-D4 + A3
    { midi: 55, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 62, finger: 3, chordSymbol: 'G' },
    { midi: 59, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 60, finger: 1 },
    { midi: 57, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 60, finger: 2 },
    { midi: 74, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5 },
    { midi: 67, beatStart: 1, beatDur: 0.45, hand: 'right', velocity: 82, finger: 1 },
    { midi: 69, beatStart: 1.5, beatDur: 0.45, hand: 'right', velocity: 84, finger: 2 },
    { midi: 71, beatStart: 2, beatDur: 0.45, hand: 'right', velocity: 86, finger: 3 },
    { midi: 72, beatStart: 2.5, beatDur: 0.45, hand: 'right', velocity: 88, finger: 4 },

    // Measure 2: RH D5, G4, G4 | LH B3, G3
    { midi: 59, beatStart: 3, beatDur: 2.8, hand: 'left', velocity: 62, finger: 1, chordSymbol: 'G' },
    { midi: 74, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5 },
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
    { midi: 67, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },

    // Measure 3 (C Major / Am): RH E5, C5-D5-E5-F#5 | LH C4
    { midi: 60, beatStart: 6, beatDur: 2.8, hand: 'left', velocity: 62, finger: 1, chordSymbol: 'C' },
    { midi: 76, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 92, finger: 3 },
    { midi: 72, beatStart: 7, beatDur: 0.45, hand: 'right', velocity: 84, finger: 1 },
    { midi: 74, beatStart: 7.5, beatDur: 0.45, hand: 'right', velocity: 86, finger: 2 },
    { midi: 76, beatStart: 8, beatDur: 0.45, hand: 'right', velocity: 88, finger: 3 },
    { midi: 78, beatStart: 8.5, beatDur: 0.45, hand: 'right', velocity: 90, finger: 4 },

    // Measure 4: RH G5, G4, G4 | LH B3 -> G3
    { midi: 59, beatStart: 9, beatDur: 1.9, hand: 'left', velocity: 60, finger: 2, chordSymbol: 'G' },
    { midi: 55, beatStart: 11, beatDur: 0.9, hand: 'left', velocity: 58, finger: 5 },
    { midi: 79, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 94, finger: 5 },
    { midi: 67, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
  ]
);

// ============================================================================
// STAGE 6 LESSONS
// ============================================================================

const stage6NocturneExpression = buildScoreFromSeeds(
  {
    id: 'stage6-nocturne-expression',
    title: 'Moonlight & Nocturne Voicing Study (Dynamic Shaping & CC64 Pedal)',
    subtitle: 'Stage 6.1 • Singing Melody (Velocity 88–98) Over Whispered Accompaniment (Velocity 50–58)',
    composer: 'Conservatory Virtuoso Studio',
    stageId: 6,
    category: 'repertoire',
    bpm: 72,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Hand Velocity Balance (RH > LH +25)', 'Crescendo & Diminuendo', 'Sustain Pedal (CC 64)'],
    coachTip:
      'Our AI Dynamics Monitor actively checks that your Right Hand melody velocity stays between 82–96 while your Left Hand triplet accompaniment stays whispered around 50–60!',
  },
  [
    // Measure 1 (C Major): Whispered LH arpeggio + Soaring RH Cantabile
    { midi: 48, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 52, finger: 5, chordSymbol: 'Cmaj7' },
    { midi: 55, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 59, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 52, finger: 1 },
    { midi: 55, beatStart: 3, beatDur: 0.9, hand: 'left', velocity: 48, finger: 2 },
    { midi: 71, beatStart: 0, beatDur: 1.9, hand: 'right', velocity: 88, finger: 4, lyric: 'Cantabile (mp)' },
    { midi: 72, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5 },
    { midi: 67, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2 },

    // Measure 2 (Fmaj7): Crescendo to high E5
    { midi: 41, beatStart: 4, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'Fmaj7' },
    { midi: 48, beatStart: 5, beatDur: 0.9, hand: 'left', velocity: 52, finger: 2 },
    { midi: 52, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 54, finger: 1 },
    { midi: 48, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 69, beatStart: 4, beatDur: 1.4, hand: 'right', velocity: 90, finger: 3, lyric: 'cresc.' },
    { midi: 72, beatStart: 5.5, beatDur: 0.5, hand: 'right', velocity: 94, finger: 4 },
    { midi: 76, beatStart: 6, beatDur: 1.9, hand: 'right', velocity: 98, finger: 5, lyric: 'forte (f)' },

    // Measure 3 (Dm7 -> G7): Diminuendo
    { midi: 50, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'Dm7' },
    { midi: 57, beatStart: 9, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 43, beatStart: 10, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'G7' },
    { midi: 53, beatStart: 11, beatDur: 0.9, hand: 'left', velocity: 50, finger: 1 },
    { midi: 74, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'dim.' },
    { midi: 72, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3 },
    { midi: 71, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2 },
    { midi: 69, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 76, finger: 1 },

    // Measure 4 (C Major Voiced Chord): Top note C5 voiced louder than E4/G4
    { midi: 48, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 52, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 50, finger: 1 },
    { midi: 64, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 65, finger: 1 },
    { midi: 67, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 68, finger: 2 },
    { midi: 72, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 94, finger: 5, lyric: 'Voiced Top Note!' },
  ]
);

export const BUILTIN_SONGS: SongScore[] = [
  stage1SargamScale,
  stage1HappyBirthday,
  stage1OmShantiOm,
  stage2ContraryMotion,
  stage2RhythmicIndependence,
  stage3ChordInversions,
  stage3BollywoodBalladArpeggio,
  stage4HanonNo1,
  stage4CzernyVelocity,
  stage5LandmarkDrills,
  stage5BachMinuetG,
  stage6NocturneExpression,
];
