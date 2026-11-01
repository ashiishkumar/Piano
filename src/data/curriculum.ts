import { CurriculumStage, ScoreNote, SongScore } from '../types/music';
import { buildThreeTierArrangements } from '../services/SongImporter';

export interface StageExtensionMetadata {
  stageId: number;
  indianPedagogyConcept: string;
  westernPedagogyConcept: string;
  paceRule: string;
  recommendedInternetMidiSearches: string[];
}

export const STAGE_PEDAGOGY_META: Record<number, StageExtensionMetadata> = {
  1: {
    stageId: 1,
    indianPedagogyConcept: 'Panch-Swara Sthayi (Stationary 5-Note Sa-Re-Ga-Ma-Pa & Basic Alankars)',
    westernPedagogyConcept: 'C-Position 5-Finger Ergonomics (Fingers 1–5, One Finger Per Key)',
    paceRule:
      'Do NOT move your hand or cross your thumb yet! Keep Fingers 1–5 resting gently on C4–G4 (Sa Re Ga Ma Pa) with your Right Hand only.',
    recommendedInternetMidiSearches: [
      'Jana Gana Mana simple melody midi',
      'Ode to Joy Beethoven easy piano midi',
      'Twinkle Twinkle Little Star simple midi',
      'Om Jai Jagdish Hare melody midi',
    ],
  },
  2: {
    stageId: 2,
    indianPedagogyConcept: 'Sampoorna Saptak (Full Octave Sa to Sȧ, Thumb-Tuck & Komal/Tivra Swaras)',
    westernPedagogyConcept: '1-2-3-1-2-3-4-5 Scale Crossing & Black-Key Accidentals',
    paceRule:
      'Still focus on mastering your Right Hand first! Learn the 1-2-3-1 thumb tuck from Ga (E4) to Ma (F4) and explore the black keys (Tivra Ma in Raag Yaman) before adding a simple Left-Hand tonic drone.',
    recommendedInternetMidiSearches: [
      'Om Shanti Om piano theme midi',
      'Happy Birthday piano midi',
      'Pehla Nasha melody midi',
      'Lag Jaa Gale melody midi',
    ],
  },
  3: {
    stageId: 3,
    indianPedagogyConcept: 'Mandra Saptak Awakening (Left-Hand Shadja-Pancham Drone & Bass Pulse)',
    westernPedagogyConcept: 'Left-Hand Bass Clef Orientation, Contrary Motion & 2-Against-1 Independence',
    paceRule:
      'Train your Left Hand alone first on C3–G3, then combine 1 single Left-Hand bass note on Beat 1 against a slow Right-Hand melody in Wait-for-Me mode.',
    recommendedInternetMidiSearches: [
      'Tujhe Dekha To DDLJ piano midi',
      'Chura Liya Hai Tumne midi',
      'Canon in D easy piano midi',
    ],
  },
  4: {
    stageId: 4,
    indianPedagogyConcept: 'Swara-Samvad & Lehra Comping (Harmonic Chords & 1-5-8-5 Ballad Patterns)',
    westernPedagogyConcept: 'Major/Minor Triads, Zero-Jump Inversions (I–vi–IV–V) & Broken Arpeggios',
    paceRule:
      'Progress from 2-note Open Fifths (Sa+Pa) to 3-note Triads, then learn 1st & 2nd inversions so your Left Hand never has to jump wildly.',
    recommendedInternetMidiSearches: [
      'Kal Ho Naa Ho piano midi',
      'Tum Hi Ho Aashiqui 2 piano midi',
      'Kesariya Brahmastra piano midi',
    ],
  },
  5: {
    stageId: 5,
    indianPedagogyConcept: 'Drut Laya Alankars (Fast Finger Agility & Sight-Reading Without Looking Down)',
    westernPedagogyConcept: 'Hanon Finger Equalizer, Grand Staff Landmarks & Two-Voice Polyphony',
    paceRule:
      'Use the A–B Measure Looper starting at 60% speed and let the +5% Auto-Ramp Speed Trainer build your tempo organically only when you hit >=95% accuracy.',
    recommendedInternetMidiSearches: [
      'Fur Elise Beethoven piano midi',
      'Minuet in G Bach midi',
      'Turkish March Mozart midi',
    ],
  },
  6: {
    stageId: 6,
    indianPedagogyConcept: 'Bhava & Gamak Expression (Touch Velocity Voicing & Sustain Pedal Mastery)',
    westernPedagogyConcept: 'Cantabile Chord Voicing (RH > LH), Crescendo/Diminuendo & CC64 Syncopated Pedaling',
    paceRule:
      'Listen closely to the volume balance between your hands: keep Left-Hand accompaniment whispered (velocity 50–60) and Right-Hand melody singing (velocity 85–95).',
    recommendedInternetMidiSearches: [
      'Moonlight Sonata 1st Movement midi',
      'Chopin Nocturne Op 9 No 2 midi',
      'River Flows in You Yiruma midi',
    ],
  },
};

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    id: 1,
    title: 'Stage 1: First Touch & The 5-Finger Home (Sa Re Ga Ma Pa — Stationary Hand)',
    subtitle: 'Zero Hand Movement • 1 Finger Per Key (C4–G4) • Basic Alankars & First 5-Note Melodies',
    badge: 'Step 1: 5-Finger Home',
    description:
      'Just like a traditional Indian keyboard guru, we begin WITHOUT moving your hand or crossing your thumb. Rest Fingers 1–5 on C4–G4 (Sa Re Ga Ma Pa), strengthen each finger with Alankar #1 & #2, and play your first real melodies using only 5 keys!',
    skillsUnlocked: [
      'Finding Middle C4 (Madhya Sa)',
      '5-Finger Stationary Home (C4–G4)',
      'Alankar #1 (Stepwise) & Alankar #2 (Skips)',
      'First 5-Note Melodies (Jana Gana Mana & Ode to Joy)',
    ],
    lessonIds: [
      'stage1-five-finger-home',
      'stage1-alankar-1-steps',
      'stage1-alankar-2-skips',
      'stage1-jana-gana-5note',
    ],
  },
  {
    id: 2,
    title: 'Stage 2: Completing the Saptak (The 1-2-3-1 Thumb Tuck, Black Keys & Ear Melodies)',
    subtitle: 'Reaching Dha, Ni & Taar Sȧ • Komal/Tivra Black Keys (Raag Yaman) • Bollywood Hooks',
    badge: 'Step 2: Full Octave',
    description:
      'Now that your 5 fingers are steady, learn the secret to playing all 8 notes of the octave without running out of fingers: the "1-2-3-1 Thumb Tuck" from Ga (E4) to Ma (F4). Then explore the black keys (Tivra Ma) and play Om Shanti Om & Happy Birthday!',
    skillsUnlocked: [
      'Isolated 1-2-3-1 Thumb-Tuck Drill',
      'Full Bilawal Thaat (Sa to Sȧ)',
      'Black Keys & Tivra Ma (Raag Yaman)',
      'Om Shanti Om & Happy Birthday Melodies',
    ],
    lessonIds: [
      'stage2-thumb-tuck-drill',
      'stage1-sargam-scale',
      'stage2-raag-yaman-black-keys',
      'stage1-om-shanti-om',
      'stage1-happy-birthday',
    ],
  },
  {
    id: 3,
    title: 'Stage 3: Awakening the Left Hand (Mandra Saptak Bass & Two-Hand Coordination)',
    subtitle: 'Left-Hand Alone Warmup • Mirror Hands • Tanpura Drone + Melody • 2-Against-1 Rhythm',
    badge: 'Step 3: Left Hand Joins',
    description:
      'Never rush into complex two-hand chords! First we train your Left Hand by itself on C3–G3, then use symmetrical mirror motion from Middle C, and finally hold a calm Left-Hand Sa/Pa drone while your Right Hand plays a melody.',
    skillsUnlocked: [
      'Left-Hand 5-Finger Home (C3–G3)',
      'Symmetrical Mirror Motion (Both Thumbs on C4)',
      'Left-Hand Tanpura Drone + Right-Hand Melody',
      '2-Against-1 Rhythmic Independence',
    ],
    lessonIds: [
      'stage3-left-hand-alone',
      'stage2-contrary-motion',
      'stage2-rhythmic-independence',
    ],
  },
  {
    id: 4,
    title: 'Stage 4: Chords, Inversions & Bollywood/Pop Accompaniment Patterns',
    subtitle: 'Open Fifths (Sa+Pa) • Major & Minor Triads • Zero-Jump Inversions • 1-5-8-5 Arpeggios',
    badge: 'Step 4: Chords & Arpeggios',
    description:
      'Upgrade your Left Hand from single bass notes to rich studio harmony. Learn C, Am, F, and G chords, smooth inversions that eliminate big hand jumps, and the iconic 1-5-8-5 Bollywood ballad arpeggio.',
    skillsUnlocked: [
      'Sa–Pa Power Fifths & Triads',
      'Zero-Jump 1st & 2nd Chord Inversions',
      '1-5-8-5 Broken Arpeggio Flow (5-2-1-2)',
      'Lead-Sheet Chord Symbol Reading',
    ],
    lessonIds: ['stage3-chord-inversions', 'stage3-bollywood-ballad-arpeggio'],
  },
  {
    id: 5,
    title: 'Stage 5: Technical Dexterity, Speed & Grand Staff Sight-Reading',
    subtitle: 'Hanon Finger Equalizer • Czerny Velocity • Grand Staff Landmarks • Bach Counterpoint',
    badge: 'Step 5: Speed & Sight-Reading',
    description:
      'Strengthen your 4th and 5th fingers with Hanon and Drut-Laya Alankars, build reflex recognition of Treble & Bass Clef landmark notes without looking at your hands, and play two independent voices in Bach’s Minuet.',
    skillsUnlocked: [
      'Hanon No. 1 Parallel Hands',
      '4th & 5th Finger Equalized Strength',
      'Grand Staff Landmark Reflexes (Blind Mode)',
      'Bach Minuet in G Counterpoint',
    ],
    lessonIds: [
      'stage4-hanon-no1',
      'stage5-landmark-drills',
      'stage4-czerny-velocity',
      'stage5-bach-minuet-g',
    ],
  },
  {
    id: 6,
    title: 'Stage 6: Expressive Virtuosity, Dynamic Voicing & Sustain Pedal (CC 64)',
    subtitle: 'PSR-E373 Touch Response Shaping • Singing Melody Over Whispered Chords • Pedaling',
    badge: 'Step 6: Virtuoso Expression',
    description:
      'Master the touch sensitivity and sustain pedal (CC 64) of your Yamaha PSR-E373. Shape crescendos, voice the top note of Right-Hand chords, and balance melody volume above accompaniment.',
    skillsUnlocked: [
      'Melody-Over-Accompaniment Voicing (RH > LH)',
      'Crescendo & Diminuendo Shaping',
      'Top-Note Chord Voicing',
      'Syncopated Sustain Pedaling (CC 64)',
    ],
    lessonIds: ['stage6-nocturne-expression'],
  },
];

interface NoteSeed {
  midi: number;
  beatStart: number;
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
  seeds: NoteSeed[],
  pureOneHandBeginner = false
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

  const arrangements = buildThreeTierArrangements(proNotes, meta.bpm, meta.timeSignature);

  // For Stage 1 & 2 foundational lessons, ensure the Beginner tier is 100% pure Right-Hand (or single-hand)
  // with explicit fingerings preserved so novices are never surprised by extra notes!
  if (pureOneHandBeginner) {
    const rhOnly = proNotes.filter((n) => n.hand === 'right');
    if (rhOnly.length > 0) {
      arrangements.beginner = {
        tier: 'beginner',
        label: 'Step 1: Pure Right-Hand Foundation',
        description: 'One hand only, one note at a time with exact finger numbers (1–5).',
        notes: rhOnly.map((n) => ({ ...n, id: `beg-pure-${n.id}` })),
      };
    }
  }

  return {
    ...meta,
    totalMeasures,
    durationSeconds,
    arrangements,
  };
}

// ============================================================================
// STAGE 1: 5-FINGER STATIONARY HOME (SA RE GA MA PA - ZERO THUMB CROSSING)
// ============================================================================

const stage1FiveFingerHome = buildScoreFromSeeds(
  {
    id: 'stage1-five-finger-home',
    title: 'Lesson 1.1: The 5-Finger Home (Sa Re Ga Ma Pa — Stationary Hand)',
    subtitle: 'Stage 1.1 • Place Fingers 1–5 on C4–G4 Without Moving Your Wrist',
    composer: 'Indian Conservatory Foundation',
    stageId: 1,
    category: 'curriculum',
    bpm: 72,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['5-Finger Home Position (C4–G4)', 'Zero Hand Movement', 'Pinky & Ring Control'],
    coachTip:
      'Rest your Right Thumb (1) on Sa (Middle C4), Index (2) on Re (D4), Middle (3) on Ga (E4), Ring (4) on Ma (F4), and Pinky (5) on Pa (G4). Do NOT tuck your thumb—each finger already has its own key!',
  },
  [
    // Measure 1: Sa Re Ga Ma (Fingers 1 2 3 4)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 55, finger: 5, chordSymbol: 'C (Sa)' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 84, finger: 4, lyric: 'Ma (4)' },

    // Measure 2: Pa Ma Ga Re (Fingers 5 4 3 2)
    { midi: 55, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 55, finger: 1, chordSymbol: 'G (Pa)' },
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa (5)' },
    { midi: 65, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 4, lyric: 'Ma (4)' },
    { midi: 64, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 82, finger: 3, lyric: 'Ga (3)' },
    { midi: 62, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2, lyric: 'Re (2)' },

    // Measure 3: Sa Re Ga Ma -> Pa held
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'C' },
    { midi: 60, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },
    { midi: 62, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 64, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa (5)' },

    // Measure 4: Ma Ga Re Sa
    { midi: 48, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 65, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 84, finger: 4, lyric: 'Ma (4)' },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 82, finger: 3, lyric: 'Ga (3)' },
    { midi: 62, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2, lyric: 'Re (2)' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 85, finger: 1, lyric: 'Sa (1)' },
  ],
  true
);

const stage1Alankar1Steps = buildScoreFromSeeds(
  {
    id: 'stage1-alankar-1-steps',
    title: 'Lesson 1.2: Alankar #1 — 3-Note Stepwise Palta (Sa Re Ga, Re Ga Ma)',
    subtitle: 'Stage 1.2 • Traditional Indian Finger-Independence Pattern Inside 5 Keys',
    composer: 'Indian Classical Alankar Series',
    stageId: 1,
    category: 'curriculum',
    bpm: 76,
    timeSignature: [3, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Alankar Pattern (1-2-3, 2-3-4, 3-4-5)', 'Ring & Pinky Control', '3-Beat Grouping'],
    coachTip:
      'Keep your hand completely still over C4–G4! Play groups of 3 adjacent fingers: (1-2-3 Sa Re Ga), then (2-3-4 Re Ga Ma), then (3-4-5 Ga Ma Pa), and walk back down.',
  },
  [
    // Measure 1: Sa Re Ga (1 2 3)
    { midi: 48, beatStart: 0, beatDur: 2.8, hand: 'left', velocity: 55, finger: 5, chordSymbol: 'Sa' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Sa' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },

    // Measure 2: Re Ga Ma (2 3 4)
    { midi: 50, beatStart: 3, beatDur: 2.8, hand: 'left', velocity: 55, finger: 4 },
    { midi: 62, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 65, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma' },

    // Measure 3: Ga Ma Pa (3 4 5)
    { midi: 55, beatStart: 6, beatDur: 2.8, hand: 'left', velocity: 56, finger: 1, chordSymbol: 'Pa' },
    { midi: 64, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 65, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma' },
    { midi: 67, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa' },

    // Measure 4: Pa Ma Ga (5 4 3)
    { midi: 55, beatStart: 9, beatDur: 2.8, hand: 'left', velocity: 56, finger: 1 },
    { midi: 67, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa' },
    { midi: 65, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma' },
    { midi: 64, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },

    // Measure 5: Ma Ga Re (4 3 2)
    { midi: 53, beatStart: 12, beatDur: 2.8, hand: 'left', velocity: 55, finger: 2 },
    { midi: 65, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma' },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },

    // Measure 6: Ga Re Sa (3 2 1)
    { midi: 48, beatStart: 15, beatDur: 2.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Sa' },
    { midi: 64, beatStart: 15, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 16, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 17, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1, lyric: 'Sa' },
  ],
  true
);

const stage1Alankar2Skips = buildScoreFromSeeds(
  {
    id: 'stage1-alankar-2-skips',
    title: 'Lesson 1.3: Alankar #2 — Skipping Keys (Sa-Ga, Re-Ma, Ga-Pa)',
    subtitle: 'Stage 1.3 • Training Finger Skips (1-3, 2-4, 3-5) for Melodies & Chords',
    composer: 'Indian Classical Alankar Series',
    stageId: 1,
    category: 'curriculum',
    bpm: 76,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Skipping 1 Key (Intervals of a 3rd)', 'Fingers 1-3, 2-4, 3-5', 'Chord Preparation'],
    coachTip:
      'Skip one finger and one white key each time: Thumb to Middle (1->3, Sa->Ga), Index to Ring (2->4, Re->Ma), and Middle to Pinky (3->5, Ga->Pa)!',
  },
  [
    // Measure 1: Sa-Ga (1-3), Re-Ma (2-4)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 55, finger: 5, chordSymbol: 'C' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },
    { midi: 64, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 62, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma (4)' },

    // Measure 2: Ga-Pa (3-5), Pa-Ga (5-3)
    { midi: 55, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 55, finger: 1, chordSymbol: 'G' },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 67, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa (5)' },
    { midi: 65, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 84, finger: 4, lyric: 'Ma (4)' },
    { midi: 62, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },

    // Measure 3: Sa-Ga-Pa (1-3-5 Broken Chord!) -> Sa
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C (Sa-Ga-Pa)' },
    { midi: 60, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Sa (1)' },
    { midi: 64, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3, lyric: 'Ga (3)' },
    { midi: 67, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa (5)' },
    { midi: 60, beatStart: 11, beatDur: 1.0, hand: 'right', velocity: 85, finger: 1, lyric: 'Sa (1)' },
  ],
  true
);

const stage1JanaGana5Note = buildScoreFromSeeds(
  {
    id: 'stage1-jana-gana-5note',
    title: 'Lesson 1.4: First 5-Note Melodies (Jana Gana Mana & Ode to Joy)',
    subtitle: 'Stage 1.4 • Playing Real Iconic Melodies Inside Your 5-Finger Home (C4–G4)',
    composer: 'Rabindranath Tagore / Beethoven (5-Finger Bridge)',
    stageId: 1,
    category: 'curriculum',
    bpm: 80,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Real Melodies in 5 Keys', 'Repeated Notes with Same Finger', 'Musical Phrasing'],
    coachTip:
      'You do not need to move your hand at all! The opening of "Jana Gana Mana" (Sa Re Ga Ga Ga...) and Beethoven’s "Ode to Joy" (Ga Ga Ma Pa Pa Ma Ga Re...) fit 100% under Fingers 1 to 5!',
  },
  [
    // Measure 1: Jana Gana Mana opening (Sa Re Ga Ga Ga Ga Ga Ga Re Ga Ma)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'C (Sa)' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Ja-na (Sa)' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Ga-na (Re)' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Ma-na (Ga)' },
    { midi: 64, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'A-dhi (Ga)' },

    // Measure 2: Ga Ga Re Ga Ma
    { midi: 53, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 56, finger: 2, chordSymbol: 'F (Ma)' },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'na-ya-ka' },
    { midi: 62, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Ja-ya' },
    { midi: 64, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'He' },
    { midi: 65, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: '(Ma)' },

    // Measure 3: Ode to Joy phrase (Ga Ga Ma Pa | Pa Ma Ga Re)
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'C' },
    { midi: 64, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3, lyric: 'Ga (3)' },
    { midi: 64, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'Ga (3)' },
    { midi: 65, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: 'Ma (4)' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5, lyric: 'Pa (5)' },

    // Measure 4: Pa Ma Ga Re -> Sa
    { midi: 55, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1, chordSymbol: 'G' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 67, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5, lyric: 'Pa (5)' },
    { midi: 65, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Ma (4)' },
    { midi: 64, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 86, finger: 1, lyric: 'Sa (1)' },
  ],
  true
);

// ============================================================================
// STAGE 2: COMPLETING THE SAPTAK (1-2-3-1 THUMB TUCK, BLACK KEYS & MELODIES)
// ============================================================================

const stage2ThumbTuckDrill = buildScoreFromSeeds(
  {
    id: 'stage2-thumb-tuck-drill',
    title: 'Lesson 2.1: The Magic Thumb-Tuck Drill (Sa-Re-Ga ↔ Ma Bridge)',
    subtitle: 'Stage 2.1 • Mastering the 1-2-3-1 Thumb Pivot Before Playing Full Scales',
    composer: 'Conservatory Technique Bridge',
    stageId: 2,
    category: 'drill',
    bpm: 74,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Isolated 1-2-3-1 Thumb Tuck', 'Relaxed Wrist Pivot', '3-Over-1 Return'],
    coachTip:
      'Instead of playing all 8 scale notes at once, we isolate just the 4-note bridge: Sa(1) -> Re(2) -> Ga(3) -> TUCK THUMB(1) under to Ma(F4)! Then cross Middle Finger(3) back over to Ga(E4).',
  },
  [
    // Measure 1: Sa(1) Re(2) Ga(3) -> Tuck Thumb(1) to Ma(F4)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 55, finger: 5, chordSymbol: 'C' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 88, finger: 1, lyric: 'TUCK 1 (Ma)' },

    // Measure 2: Step back down Ga(3) Re(2) Sa(1)
    { midi: 53, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 55, finger: 2, chordSymbol: 'F' },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'CROSS 3 (Ga)' },
    { midi: 62, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 60, beatStart: 6, beatDur: 1.8, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },

    // Measure 3: Repeat Sa(1) Re(2) Ga(3) Ma(1) Pa(2)
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'C' },
    { midi: 60, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa (1)' },
    { midi: 62, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (2)' },
    { midi: 64, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (3)' },
    { midi: 65, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 88, finger: 1, lyric: 'TUCK 1 (Ma)' },

    // Measure 4: Pa(2) Ma(1) Ga(3) Sa(1)
    { midi: 55, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1, chordSymbol: 'G' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 67, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 88, finger: 2, lyric: 'Pa (2)' },
    { midi: 65, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1, lyric: 'Ma (1)' },
    { midi: 64, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'CROSS 3 (Ga)' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 82, finger: 1, lyric: 'Sa (1)' },
  ],
  true
);

const stage1SargamScale = buildScoreFromSeeds(
  {
    id: 'stage1-sargam-scale',
    title: 'Lesson 2.2: Full Saptak — Sa Re Ga Ma Pa Dha Ni Sȧ (Bilawal Thaat)',
    subtitle: 'Stage 2.2 • Ascending & Descending Full Octave with 1-2-3-1-2-3-4-5',
    composer: 'Conservatory Foundation Bridge',
    stageId: 2,
    category: 'curriculum',
    bpm: 84,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Thumb Tuck (1-2-3-1)', 'Full 8-Note Saptak', 'Smooth Return Crossing'],
    coachTip:
      'Use the exact thumb-tuck you practiced in Lesson 2.1! After Ga (E4, Finger 3), glide your Thumb (1) to Ma (F4), and fingers 2-3-4-5 will naturally land on Pa-Dha-Ni-Sȧ!',
  },
  [
    // Measure 1: Ascending Sa Re Ga Ma (C4 D4 E4 F4)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C (Sa)' },
    { midi: 60, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, lyric: 'Sa' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 65, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1, lyric: 'Ma (Tuck 1)' },

    // Measure 2: Ascending Pa Dha Ni Sa' (G4 A4 B4 C5)
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

    // Measure 4: Descending Ma Ga Re Sa (F4 E4 D4 C4)
    { midi: 53, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 58, finger: 2, chordSymbol: 'F' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 65, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'Ma' },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 82, finger: 3, lyric: 'Ga (Cross 3)' },
    { midi: 62, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 78, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 75, finger: 1, lyric: 'Sa' },
  ],
  true
);

const stage2RaagYamanBlackKeys = buildScoreFromSeeds(
  {
    id: 'stage2-raag-yaman-black-keys',
    title: 'Lesson 2.3: Exploring Black Keys — Raag Yaman (Tivra Ma / F#4)',
    subtitle: 'Stage 2.3 • How Komal & Tivra Black Keys Work on Your Keyboard',
    composer: 'Indian Classical Raag Bridge',
    stageId: 2,
    category: 'curriculum',
    bpm: 80,
    timeSignature: [4, 4],
    keySignature: 'G',
    rootSaMidi: 0,
    pedagogyFocus: ['Tivra Ma (F#4 Black Key)', 'Raag Yaman Aroha (Nị Re Ga Ma\' Dha Ni Sȧ)', 'Long Finger on Black Key'],
    coachTip:
      'In Raag Yaman, Shuddha Ma (white key F4) moves up 1 semitone to the black key Tivra Ma (F#4)! Use your taller Ring or Middle Finger on the black key F#4.',
  },
  [
    // Measure 1: Ni. Re Ga Ma' (B3 D4 E4 F#4)
    { midi: 48, beatStart: 0, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'Sa Drone' },
    { midi: 59, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 78, finger: 1, lyric: 'Nị (B3)' },
    { midi: 62, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re (D4)' },
    { midi: 64, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga (E4)' },
    { midi: 66, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: "Ma' (F#4 Black)" },

    // Measure 2: Pa Dha Ni Sa' (G4 A4 B4 C5)
    { midi: 55, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 56, finger: 1, chordSymbol: 'Pa Drone' },
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 1, lyric: 'Pa (Tuck 1)' },
    { midi: 69, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 2, lyric: 'Dha (A4)' },
    { midi: 71, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Ni (B4)' },
    { midi: 72, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 94, finger: 4, lyric: 'Sȧ (C5)' },

    // Measure 3: Descending Sa' Ni Dha Pa
    { midi: 48, beatStart: 8, beatDur: 3.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'Sa' },
    { midi: 72, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 92, finger: 4, lyric: 'Sȧ' },
    { midi: 71, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Ni' },
    { midi: 69, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2, lyric: 'Dha' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'Pa' },

    // Measure 4: Ma' Ga Re Sa
    { midi: 48, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Sa' },
    { midi: 66, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 88, finger: 4, lyric: "Ma' (F#4)" },
    { midi: 64, beatStart: 13, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 14, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 15, beatDur: 1.0, hand: 'right', velocity: 85, finger: 1, lyric: 'Sa' },
  ],
  true
);

const stage1OmShantiOm = buildScoreFromSeeds(
  {
    id: 'stage1-om-shanti-om',
    title: 'Lesson 2.4: Om Shanti Om — Bollywood Anthem Theme',
    subtitle: 'Stage 2.4 • Applying Full-Octave Sargam (Ga-Ma-Pa-Dha-Pa) to a Hit Song',
    composer: 'Bollywood Repertoire Bridge',
    stageId: 2,
    category: 'curriculum',
    bpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Sargam Phrasing (Ga-Ma-Pa-Dha-Pa)', 'Syncopated Hook', 'Adding Root Bass in Step 2'],
    coachTip:
      'In Step 1, master the famous Right-Hand Ga-Ma-Pa-Dha-Pa melody by itself. Only move to Step 2 once your Right Hand can play all 4 bars smoothly!',
  },
  [
    // Measure 1 (C Major): E4 F4 G4 A4 G4 E4
    { midi: 48, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 2, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 64, beatStart: 0, beatDur: 0.5, hand: 'right', velocity: 85, finger: 2, lyric: 'Ga' },
    { midi: 65, beatStart: 0.5, beatDur: 0.5, hand: 'right', velocity: 86, finger: 3, lyric: 'Ma' },
    { midi: 67, beatStart: 1, beatDur: 0.9, hand: 'right', velocity: 92, finger: 4, lyric: 'Pa (Om)' },
    { midi: 69, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5, lyric: 'Dha (Shan-)' },
    { midi: 67, beatStart: 3, beatDur: 0.5, hand: 'right', velocity: 88, finger: 4, lyric: 'ti' },
    { midi: 64, beatStart: 3.5, beatDur: 0.5, hand: 'right', velocity: 84, finger: 2, lyric: 'Om' },

    // Measure 2 (A Minor): E4 D4 C4 D4
    { midi: 45, beatStart: 4, beatDur: 1.9, hand: 'left', velocity: 60, finger: 5, chordSymbol: 'Am' },
    { midi: 52, beatStart: 6, beatDur: 1.9, hand: 'left', velocity: 56, finger: 1 },
    { midi: 64, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 3, lyric: 'Ga' },
    { midi: 62, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Sa' },
    { midi: 62, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },

    // Measure 3 (F Major): F4 A4 C5 A4
    { midi: 41, beatStart: 8, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'F' },
    { midi: 48, beatStart: 10, beatDur: 1.9, hand: 'left', velocity: 58, finger: 1 },
    { midi: 65, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 88, finger: 1, lyric: 'Ma' },
    { midi: 69, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Dha' },
    { midi: 72, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 95, finger: 5, lyric: 'Sȧ' },
    { midi: 69, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3, lyric: 'Dha' },

    // Measure 4 (G Major -> C Major Cadence): G4 F4 D4 C4
    { midi: 43, beatStart: 12, beatDur: 1.9, hand: 'left', velocity: 62, finger: 5, chordSymbol: 'G' },
    { midi: 48, beatStart: 14, beatDur: 1.9, hand: 'left', velocity: 64, finger: 5, chordSymbol: 'C' },
    { midi: 67, beatStart: 12, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'Pa' },
    { midi: 65, beatStart: 13, beatDur: 0.5, hand: 'right', velocity: 86, finger: 3, lyric: 'Ma' },
    { midi: 62, beatStart: 13.5, beatDur: 0.5, hand: 'right', velocity: 84, finger: 2, lyric: 'Re' },
    { midi: 60, beatStart: 14, beatDur: 1.9, hand: 'right', velocity: 90, finger: 1, lyric: 'Sa' },
  ],
  true
);

const stage1HappyBirthday = buildScoreFromSeeds(
  {
    id: 'stage1-happy-birthday',
    title: 'Lesson 2.5: Happy Birthday to You (Octave Reach & 3/4 Waltz)',
    subtitle: 'Stage 2.5 • Stretching Your Hand from Pa (G4) to Taar Pȧ (G5)',
    composer: 'Traditional / Arr. VirtuosoStudio',
    stageId: 2,
    category: 'curriculum',
    bpm: 88,
    timeSignature: [3, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['3/4 Waltz Meter', 'Octave Reach (G4 to G5)', 'Pickup Note Phrasing'],
    coachTip:
      'Practice the Right Hand alone in Step 1 first so you feel comfortable opening your hand from Thumb on G4 up to Pinky on G5 in Measure 4!',
  },
  [
    // Measure 1 (C Major): Pa Pa Dha Pa
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

    // Measure 3 (G7 -> C): A4 G4 D5
    { midi: 43, beatStart: 6, beatDur: 2.8, hand: 'left', velocity: 56, finger: 5, chordSymbol: 'G7' },
    { midi: 53, beatStart: 7, beatDur: 0.8, hand: 'left', velocity: 52, finger: 2 },
    { midi: 55, beatStart: 8, beatDur: 0.8, hand: 'left', velocity: 52, finger: 1 },
    { midi: 69, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2, lyric: 'Birth-' },
    { midi: 67, beatStart: 7, beatDur: 0.9, hand: 'right', velocity: 84, finger: 1, lyric: 'day' },
    { midi: 74, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5, lyric: 'to' },

    // Measure 4 (C -> F): C5 held, then Octave leap G5 -> E5
    { midi: 48, beatStart: 9, beatDur: 1.4, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'C' },
    { midi: 53, beatStart: 10.5, beatDur: 1.4, hand: 'left', velocity: 60, finger: 2, chordSymbol: 'F' },
    { midi: 72, beatStart: 9, beatDur: 1.0, hand: 'right', velocity: 88, finger: 4, lyric: 'you!' },
    { midi: 79, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 95, finger: 5, lyric: 'Dear' },
    { midi: 76, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 90, finger: 3, lyric: 'Friend' },
  ],
  true
);

// ============================================================================
// STAGE 3: AWAKENING THE LEFT HAND & TWO-HAND COORDINATION
// ============================================================================

const stage3LeftHandAlone = buildScoreFromSeeds(
  {
    id: 'stage3-left-hand-alone',
    title: 'Lesson 3.1: Left-Hand 5-Finger Home (Mandra Saptak C3–G3)',
    subtitle: 'Stage 3.1 • Training Your Left Hand By Itself Before Combining Hands',
    composer: 'Conservatory Left-Hand Foundation',
    stageId: 3,
    category: 'curriculum',
    bpm: 74,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Left-Hand Pinky (5) on C3', 'Left-Hand Thumb (1) on G3', 'Mandra Saptak Control'],
    coachTip:
      'In the Left Hand, finger numbers are mirrored! Your Left Pinky (Finger 5) rests on Bass C3 (one octave left of Middle C) and your Left Thumb (Finger 1) rests on G3.',
  },
  [
    // Measure 1: Left Hand C3 D3 E3 F3 (Fingers 5 4 3 2)
    { midi: 48, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 72, finger: 5, lyric: 'Sạ (LH 5)', chordSymbol: 'C3 Bass' },
    { midi: 50, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 74, finger: 4, lyric: 'Rẹ (LH 4)' },
    { midi: 52, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 76, finger: 3, lyric: 'Gạ (LH 3)' },
    { midi: 53, beatStart: 3, beatDur: 0.9, hand: 'left', velocity: 76, finger: 2, lyric: 'Mạ (LH 2)' },

    // Measure 2: Left Hand G3 F3 E3 D3 (Fingers 1 2 3 4)
    { midi: 55, beatStart: 4, beatDur: 0.9, hand: 'left', velocity: 78, finger: 1, lyric: 'Pạ (LH 1)', chordSymbol: 'G3 Bass' },
    { midi: 53, beatStart: 5, beatDur: 0.9, hand: 'left', velocity: 76, finger: 2, lyric: 'Mạ (LH 2)' },
    { midi: 52, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 74, finger: 3, lyric: 'Gạ (LH 3)' },
    { midi: 50, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 72, finger: 4, lyric: 'Rẹ (LH 4)' },

    // Measure 3: Left Hand Root-Fifth Drone C3 -> G3 -> E3 -> C3 (5 - 1 - 3 - 5)
    { midi: 48, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 75, finger: 5, lyric: 'Sạ (5)', chordSymbol: 'C Triad' },
    { midi: 52, beatStart: 9, beatDur: 0.9, hand: 'left', velocity: 75, finger: 3, lyric: 'Gạ (3)' },
    { midi: 55, beatStart: 10, beatDur: 0.9, hand: 'left', velocity: 78, finger: 1, lyric: 'Pạ (1)' },
    { midi: 48, beatStart: 11, beatDur: 1.0, hand: 'left', velocity: 76, finger: 5, lyric: 'Sạ (5)' },
  ]
);

const stage2ContraryMotion = buildScoreFromSeeds(
  {
    id: 'stage2-contrary-motion',
    title: 'Lesson 3.2: Mirror Hands — Symmetrical Contrary Motion (From Middle C)',
    subtitle: 'Stage 3.2 • Both Thumbs Start on Middle C4 and Use Identical Fingers (1-2-3-1-2-3-4-5)',
    composer: 'Conservatory Pedagogy Engine',
    stageId: 3,
    category: 'curriculum',
    bpm: 82,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Mirror-Image Symmetry', 'Simultaneous Thumb-Under (Beat 4)', 'Easiest 2-Hand Start'],
    coachTip:
      'Why is Contrary Motion the #1 exercise for beginning two-hand play? Because both hands use the EXACT same finger numbers at the exact same time (1-2-3-1-2-3-4-5) moving outward like a mirror!',
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
    title: 'Lesson 3.3: Tanpura Drone & Melody (2-Against-1 Hand Independence)',
    subtitle: 'Stage 3.3 • Holding Long Left-Hand Bass Notes While Right Hand Moves',
    composer: 'Conservatory Pedagogy Engine',
    stageId: 3,
    category: 'curriculum',
    bpm: 86,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Holding LH While RH Moves', 'Preventing Staccato LH Cutoffs', 'Harmonic Anchoring'],
    coachTip:
      'Think of your Left Hand as a calm Tanpura drone: press and HOLD the Left-Hand bass note on Beat 1 while your Right Hand plays Beats 1 and 2 above it!',
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
// STAGE 4: CHORDS, INVERSIONS & BOLLYWOOD/POP ACCOMPANIMENT
// ============================================================================

const stage3ChordInversions = buildScoreFromSeeds(
  {
    id: 'stage3-chord-inversions',
    title: 'Lesson 4.1: Zero-Jump Voice Leading (I–vi–IV–V Chord Inversions)',
    subtitle: 'Stage 4.1 • C Root -> Am (1st Inv) -> F (2nd Inv) -> G (1st Inv)',
    composer: 'Harmony & Comping Lab',
    stageId: 4,
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

    // Measure 2: A Minor 1st Inversion (C3-E3-A3)
    { midi: 48, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 58, finger: 5, chordSymbol: 'Am/C (1st Inv)' },
    { midi: 52, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 56, finger: 3 },
    { midi: 57, beatStart: 4, beatDur: 3.8, hand: 'left', velocity: 58, finger: 1 },
    { midi: 71, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4 },
    { midi: 69, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 88, finger: 3 },
    { midi: 64, beatStart: 6, beatDur: 1.8, hand: 'right', velocity: 84, finger: 1 },

    // Measure 3: F Major 2nd Inversion (C3-F3-A3)
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
    title: 'Lesson 4.2: Bollywood Romantic Ballad — 1-5-8-5 Broken Arpeggio Flow',
    subtitle: 'Stage 4.2 • Left-Hand Octave-Fifth Arpeggios (5-2-1-2) Under Lyrical Melody',
    composer: 'VirtuosoStudio Repertoire',
    stageId: 4,
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
// STAGE 5: TECHNICAL DEXTERITY, SPEED & SIGHT-READING
// ============================================================================

const stage4HanonNo1 = buildScoreFromSeeds(
  {
    id: 'stage4-hanon-no1',
    title: 'Lesson 5.1: Hanon Exercise No. 1 — Drut-Laya Finger Equalizer',
    subtitle: 'Stage 5.1 • Precision Finger Independence & 4th/5th Finger Strength',
    composer: 'Charles-Louis Hanon',
    stageId: 5,
    category: 'drill',
    bpm: 96,
    timeSignature: [2, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Skip-Step Pattern (C-E-F-G-A-G-F-E)', '4th & 5th Finger Strength', 'Sub-25ms Evenness'],
    coachTip:
      'Lift each finger cleanly and strike every note with identical velocity (~82). Notice the skip between Finger 1 and Finger 2 on the ascending climb!',
  },
  [
    ...[
      { rh: 60, lh: 48, rf: 1, lf: 5 },
      { rh: 64, lh: 52, rf: 2, lf: 4 },
      { rh: 65, lh: 53, rf: 3, lf: 3 },
      { rh: 67, lh: 55, rf: 4, lf: 2 },
      { rh: 69, lh: 57, rf: 5, lf: 1 },
      { rh: 67, lh: 55, rf: 4, lf: 2 },
      { rh: 65, lh: 53, rf: 3, lf: 3 },
      { rh: 64, lh: 52, rf: 2, lf: 4 },
      { rh: 62, lh: 50, rf: 1, lf: 5 },
      { rh: 65, lh: 53, rf: 2, lf: 4 },
      { rh: 67, lh: 55, rf: 3, lf: 3 },
      { rh: 69, lh: 57, rf: 4, lf: 2 },
      { rh: 71, lh: 59, rf: 5, lf: 1 },
      { rh: 69, lh: 57, rf: 4, lf: 2 },
      { rh: 67, lh: 55, rf: 3, lf: 3 },
      { rh: 65, lh: 53, rf: 2, lf: 4 },
      { rh: 64, lh: 52, rf: 1, lf: 5 },
      { rh: 67, lh: 55, rf: 2, lf: 4 },
      { rh: 69, lh: 57, rf: 3, lf: 3 },
      { rh: 71, lh: 59, rf: 4, lf: 2 },
      { rh: 72, lh: 60, rf: 5, lf: 1 },
      { rh: 71, lh: 59, rf: 4, lf: 2 },
      { rh: 69, lh: 57, rf: 3, lf: 3 },
      { rh: 67, lh: 55, rf: 2, lf: 4 },
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

const stage5LandmarkDrills = buildScoreFromSeeds(
  {
    id: 'stage5-landmark-drills',
    title: 'Lesson 5.2: Grand Staff Landmark Reflex Trainer (C3–F3–C4–G4–C5)',
    subtitle: 'Stage 5.2 • Instant Spatial Recognition Without Looking at Your Hands',
    composer: 'Sight-Reading Lab',
    stageId: 5,
    category: 'drill',
    bpm: 80,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Bass Clef F3 Anchor', 'Middle C4 Ledger Line', 'Treble Clef G4 Anchor', 'Blind Mode Ready'],
    coachTip:
      'Turn ON "+ Sheet Music" and switch the Notation Bridge to "Blind Mode" for this exercise! Keep your eyes on the Grand Staff and feel the intervals on your PSR-E373 keys.',
  },
  [
    { midi: 48, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 75, finger: 5, lyric: 'Bass C3' },
    { midi: 53, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 78, finger: 2, lyric: 'Bass F3' },
    { midi: 60, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 82, finger: 1, lyric: 'Mid C4' },
    { midi: 67, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 4, lyric: 'Treb G4' },

    { midi: 72, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5, lyric: 'High C5' },
    { midi: 67, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3, lyric: 'Treb G4' },
    { midi: 53, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 78, finger: 2, lyric: 'Bass F3' },
    { midi: 48, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 76, finger: 5, lyric: 'Bass C3' },

    { midi: 55, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 76, finger: 1 },
    { midi: 64, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 84, finger: 3 },
    { midi: 62, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 82, finger: 2 },
    { midi: 60, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 85, finger: 1 },
  ]
);

const stage4CzernyVelocity = buildScoreFromSeeds(
  {
    id: 'stage4-czerny-velocity',
    title: 'Lesson 5.3: Czerny Op. 299 Velocity & Arpeggio Study in C',
    subtitle: 'Stage 5.3 • Rapid Right-Hand Passagework Over Staccato Left-Hand Chords',
    composer: 'Carl Czerny',
    stageId: 5,
    category: 'drill',
    bpm: 100,
    timeSignature: [4, 4],
    keySignature: 'C',
    rootSaMidi: 0,
    pedagogyFocus: ['Rapid Scale Runs', 'Crisp LH Staccato Chords', 'Speed Trainer Auto-Ramp'],
    coachTip:
      'Turn on Pro Controls -> A-B Loop with +5% Ramp starting at 60% speed. Let VirtuosoStudio increase BPM by +5% only when you achieve >=95% accuracy!',
  },
  [
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

const stage5BachMinuetG = buildScoreFromSeeds(
  {
    id: 'stage5-bach-minuet-g',
    title: 'Lesson 5.4: Minuet in G Major, BWV Anh. 114 (Two-Voice Counterpoint)',
    subtitle: 'Stage 5.4 • Two Independent Melodic Voices Conversing in 3/4 Meter',
    composer: 'J.S. Bach / Christian Petzold',
    stageId: 5,
    category: 'repertoire',
    bpm: 96,
    timeSignature: [3, 4],
    keySignature: 'G',
    rootSaMidi: 7,
    pedagogyFocus: ['Baroque Counterpoint', 'F# Key Signature', 'Contrary Bass Line'],
    coachTip:
      'In Baroque music, the Left Hand is not just block chords—it is a second singer! Shape both the Right-Hand D5–G4–A4–B4–C5 line and the Left-Hand B3–A3–G3–B3 bass.',
  },
  [
    { midi: 55, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 62, finger: 3, chordSymbol: 'G' },
    { midi: 59, beatStart: 0, beatDur: 1.9, hand: 'left', velocity: 60, finger: 1 },
    { midi: 57, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 60, finger: 2 },
    { midi: 74, beatStart: 0, beatDur: 0.9, hand: 'right', velocity: 88, finger: 5 },
    { midi: 67, beatStart: 1, beatDur: 0.45, hand: 'right', velocity: 82, finger: 1 },
    { midi: 69, beatStart: 1.5, beatDur: 0.45, hand: 'right', velocity: 84, finger: 2 },
    { midi: 71, beatStart: 2, beatDur: 0.45, hand: 'right', velocity: 86, finger: 3 },
    { midi: 72, beatStart: 2.5, beatDur: 0.45, hand: 'right', velocity: 88, finger: 4 },

    { midi: 59, beatStart: 3, beatDur: 2.8, hand: 'left', velocity: 62, finger: 1, chordSymbol: 'G' },
    { midi: 74, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 90, finger: 5 },
    { midi: 67, beatStart: 4, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
    { midi: 67, beatStart: 5, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },

    { midi: 60, beatStart: 6, beatDur: 2.8, hand: 'left', velocity: 62, finger: 1, chordSymbol: 'C' },
    { midi: 76, beatStart: 6, beatDur: 0.9, hand: 'right', velocity: 92, finger: 3 },
    { midi: 72, beatStart: 7, beatDur: 0.45, hand: 'right', velocity: 84, finger: 1 },
    { midi: 74, beatStart: 7.5, beatDur: 0.45, hand: 'right', velocity: 86, finger: 2 },
    { midi: 76, beatStart: 8, beatDur: 0.45, hand: 'right', velocity: 88, finger: 3 },
    { midi: 78, beatStart: 8.5, beatDur: 0.45, hand: 'right', velocity: 90, finger: 4 },

    { midi: 59, beatStart: 9, beatDur: 1.9, hand: 'left', velocity: 60, finger: 2, chordSymbol: 'G' },
    { midi: 55, beatStart: 11, beatDur: 0.9, hand: 'left', velocity: 58, finger: 5 },
    { midi: 79, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 94, finger: 5 },
    { midi: 67, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
    { midi: 67, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 80, finger: 1, articulation: 'staccato' },
  ]
);

// ============================================================================
// STAGE 6: EXPRESSIVE VIRTUOSITY & DYNAMICS
// ============================================================================

const stage6NocturneExpression = buildScoreFromSeeds(
  {
    id: 'stage6-nocturne-expression',
    title: 'Lesson 6.1: Moonlight & Nocturne Voicing Study (Dynamic Shaping & CC64 Pedal)',
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
      'Our AI Dynamics Monitor actively checks that your Right Hand melody velocity stays between 82–96 while your Left Hand accompaniment stays whispered around 50–60!',
  },
  [
    { midi: 48, beatStart: 0, beatDur: 0.9, hand: 'left', velocity: 52, finger: 5, chordSymbol: 'Cmaj7' },
    { midi: 55, beatStart: 1, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 59, beatStart: 2, beatDur: 0.9, hand: 'left', velocity: 52, finger: 1 },
    { midi: 55, beatStart: 3, beatDur: 0.9, hand: 'left', velocity: 48, finger: 2 },
    { midi: 71, beatStart: 0, beatDur: 1.9, hand: 'right', velocity: 88, finger: 4, lyric: 'Cantabile (mp)' },
    { midi: 72, beatStart: 2, beatDur: 0.9, hand: 'right', velocity: 92, finger: 5 },
    { midi: 67, beatStart: 3, beatDur: 0.9, hand: 'right', velocity: 86, finger: 2 },

    { midi: 41, beatStart: 4, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'Fmaj7' },
    { midi: 48, beatStart: 5, beatDur: 0.9, hand: 'left', velocity: 52, finger: 2 },
    { midi: 52, beatStart: 6, beatDur: 0.9, hand: 'left', velocity: 54, finger: 1 },
    { midi: 48, beatStart: 7, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 69, beatStart: 4, beatDur: 1.4, hand: 'right', velocity: 90, finger: 3, lyric: 'cresc.' },
    { midi: 72, beatStart: 5.5, beatDur: 0.5, hand: 'right', velocity: 94, finger: 4 },
    { midi: 76, beatStart: 6, beatDur: 1.9, hand: 'right', velocity: 98, finger: 5, lyric: 'forte (f)' },

    { midi: 50, beatStart: 8, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'Dm7' },
    { midi: 57, beatStart: 9, beatDur: 0.9, hand: 'left', velocity: 50, finger: 2 },
    { midi: 43, beatStart: 10, beatDur: 0.9, hand: 'left', velocity: 54, finger: 5, chordSymbol: 'G7' },
    { midi: 53, beatStart: 11, beatDur: 0.9, hand: 'left', velocity: 50, finger: 1 },
    { midi: 74, beatStart: 8, beatDur: 0.9, hand: 'right', velocity: 90, finger: 4, lyric: 'dim.' },
    { midi: 72, beatStart: 9, beatDur: 0.9, hand: 'right', velocity: 85, finger: 3 },
    { midi: 71, beatStart: 10, beatDur: 0.9, hand: 'right', velocity: 80, finger: 2 },
    { midi: 69, beatStart: 11, beatDur: 0.9, hand: 'right', velocity: 76, finger: 1 },

    { midi: 48, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 52, finger: 5, chordSymbol: 'C' },
    { midi: 55, beatStart: 12, beatDur: 3.8, hand: 'left', velocity: 50, finger: 1 },
    { midi: 64, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 65, finger: 1 },
    { midi: 67, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 68, finger: 2 },
    { midi: 72, beatStart: 12, beatDur: 3.8, hand: 'right', velocity: 94, finger: 5, lyric: 'Voiced Top Note!' },
  ]
);

export const BUILTIN_SONGS: SongScore[] = [
  stage1FiveFingerHome,
  stage1Alankar1Steps,
  stage1Alankar2Skips,
  stage1JanaGana5Note,
  stage2ThumbTuckDrill,
  stage1SargamScale,
  stage2RaagYamanBlackKeys,
  stage1OmShantiOm,
  stage1HappyBirthday,
  stage3LeftHandAlone,
  stage2ContraryMotion,
  stage2RhythmicIndependence,
  stage3ChordInversions,
  stage3BollywoodBalladArpeggio,
  stage4HanonNo1,
  stage5LandmarkDrills,
  stage4CzernyVelocity,
  stage5BachMinuetG,
  stage6NocturneExpression,
];
