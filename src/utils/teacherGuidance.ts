import { ScoreNote, SongScore, TeacherLessonGuide } from '../types/music';
import { getSargamLabel, getWesternName, isBlackKey } from './notation';

export const FINGER_NAMES: Record<number, string> = {
  1: 'Thumb (Finger 1)',
  2: 'Index Finger (Finger 2)',
  3: 'Middle Finger (Finger 3)',
  4: 'Ring Finger (Finger 4)',
  5: 'Pinky Finger (Finger 5)',
};

/**
 * Explains in plain, friendly language where to locate any MIDI key on the 61-key Yamaha PSR-E373
 */
export function describeKeyLocationOnPsrE373(midi: number): string {
  const name = getWesternName(midi, true);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const cNumberFromLeft = octave - 1; // MIDI 36 is C2 (1st C from left), MIDI 48 is C3 (2nd C), MIDI 60 is C4 (3rd C / Middle C)

  const blackDescriptions: Record<number, string> = {
    1: 'left black key in the group of 2 black keys',
    3: 'right black key in the group of 2 black keys',
    6: 'leftmost black key in the group of 3 black keys',
    8: 'middle black key in the group of 3 black keys',
    10: 'rightmost black key in the group of 3 black keys',
  };

  const whiteDescriptions: Record<number, string> = {
    0: 'white key just to the LEFT of the 2 black keys',
    2: 'white key in the MIDDLE of the 2 black keys',
    4: 'white key just to the RIGHT of the 2 black keys',
    5: 'white key just to the LEFT of the 3 black keys',
    7: 'white key between the 1st and 2nd black keys (in the group of 3)',
    9: 'white key between the 2nd and 3rd black keys (in the group of 3)',
    11: 'white key just to the RIGHT of the 3 black keys',
  };

  if (midi === 60) {
    return 'Middle C (C4) — the 3rd C from the left on your keyboard, right in the center (white key left of the 2 black keys).';
  }

  const registerHint =
    midi < 48
      ? `Deep Bass Octave #1 (leftmost section of keyboard)`
      : midi < 60
      ? `Lower-Middle Octave #2 (just left of Middle C, starting at the ${cNumberFromLeft}nd C from left)`
      : midi < 72
      ? `Middle Octave #3 (starting at Middle C4, the 3rd C from left)`
      : `Upper Octave #4 (to the right of Middle C, around the ${cNumberFromLeft}th C from left)`;

  const shapeDesc = isBlackKey(midi) ? blackDescriptions[pc] : whiteDescriptions[pc];
  return `${name} — ${shapeDesc}, in the ${registerHint}.`;
}

export interface LiveTeacherNoteInstruction {
  headline: string;
  handBadge: string;
  fingerBadge: string;
  keyLocationHint: string;
  techniqueTip: string | null;
  targetNotesSummary: {
    midi: number;
    western: string;
    sargam: string;
    hand: 'left' | 'right';
    finger: string;
    isMatched: boolean;
  }[];
}

/**
 * Generates a real-time, patient, step-by-step teacher prompt for the currently waiting or next upcoming note(s).
 */
export function getLiveTeacherNotePrompt(
  song: SongScore,
  notes: ScoreNote[],
  currentTime: number,
  waitingForNoteIds: string[],
  matchedNoteIds: Record<string, string>,
  handFilter: 'both' | 'right' | 'left',
  rootSaPitchClass: number
): LiveTeacherNoteInstruction | null {
  const isUserNote = (n: ScoreNote) => handFilter === 'both' || n.hand === handFilter;
  const userNotes = notes.filter(isUserNote);
  if (userNotes.length === 0) return null;

  // Find active waiting cluster or next upcoming unmatched cluster
  let cluster: ScoreNote[] = [];
  if (waitingForNoteIds.length > 0) {
    const firstWait = userNotes.find((n) => waitingForNoteIds.includes(n.id));
    if (firstWait) {
      cluster = userNotes.filter(
        (n) => Math.abs(n.startTime - firstWait.startTime) < 0.045
      );
    }
  }

  if (cluster.length === 0) {
    const nextUnmatched = userNotes.filter(
      (n) => !matchedNoteIds[n.id] && n.startTime >= currentTime - 0.1
    );
    if (nextUnmatched.length > 0) {
      const earliest = Math.min(...nextUnmatched.map((n) => n.startTime));
      cluster = userNotes.filter((n) => Math.abs(n.startTime - earliest) < 0.045);
    }
  }

  if (cluster.length === 0) return null;

  // Sort so right hand or primary note is clear
  const unmatchedInCluster = cluster.filter((n) => !matchedNoteIds[n.id]);
  const primary = unmatchedInCluster[0] || cluster[0];

  const sargam = getSargamLabel(primary.midi, rootSaPitchClass).short;
  const western = getWesternName(primary.midi, true);
  const fingerText = primary.finger ? FINGER_NAMES[primary.finger] : 'Comfortable Finger';
  const handText = primary.hand === 'right' ? 'Right Hand' : 'Left Hand';

  // Check if this note involves a special thumb-tuck or finger crossing compared to previous note of same hand
  const sameHandNotes = userNotes.filter((n) => n.hand === primary.hand);
  const idxInHand = sameHandNotes.findIndex((n) => n.id === primary.id);
  const prevNote = idxInHand > 0 ? sameHandNotes[idxInHand - 1] : null;

  let techniqueTip: string | null = null;
  if (
    prevNote &&
    primary.hand === 'right' &&
    prevNote.finger === 3 &&
    primary.finger === 1 &&
    primary.midi > prevNote.midi
  ) {
    techniqueTip =
      '✨ Thumb-Under Tuck! Do NOT use your ring finger here—glide your Right Thumb (Finger 1) smoothly underneath your Middle Finger (3) so you have enough fingers for the rest of the scale!';
  } else if (
    prevNote &&
    primary.hand === 'right' &&
    prevNote.finger === 1 &&
    primary.finger === 3 &&
    primary.midi < prevNote.midi
  ) {
    techniqueTip =
      '✨ Finger Crossover! Cross your Right Middle Finger (Finger 3) gently over your Thumb (1) to step down smoothly.';
  } else if (cluster.length >= 2) {
    techniqueTip =
      '🤝 Two-Hand Coordination: You can press both keys together, or press and hold the Left-Hand key first, then press the Right-Hand key!';
  }

  const targetNotesSummary = cluster.map((n) => ({
    midi: n.midi,
    western: getWesternName(n.midi, true),
    sargam: getSargamLabel(n.midi, rootSaPitchClass).short,
    hand: n.hand,
    finger: n.finger ? FINGER_NAMES[n.finger] : 'Any Finger',
    isMatched: Boolean(matchedNoteIds[n.id]),
  }));

  return {
    headline:
      cluster.length === 1 || unmatchedInCluster.length === 1
        ? `Play ${sargam} (${western}) with your ${handText}`
        : `Play ${cluster
            .map((n) => `${getSargamLabel(n.midi, rootSaPitchClass).short} (${getWesternName(n.midi)})`)
            .join(' + ')}`,
    handBadge: handText,
    fingerBadge: `Use ${fingerText}`,
    keyLocationHint: describeKeyLocationOnPsrE373(primary.midi),
    techniqueTip,
    targetNotesSummary,
  };
}

/**
 * Comprehensive Teacher Lesson Guides for every Stage & Song
 */
const CUSTOM_LESSON_GUIDES: Record<string, TeacherLessonGuide> = {
  'stage1-sargam-scale': {
    whyLearnThis:
      'If you have played "Sa Re Ga Ma Pa Dha Ni Sa" by ear, you may have run out of fingers after the 5th note! Professional pianists solve this with the "1-2-3-1 Thumb Tuck" after Ga (E4). This lesson teaches your Right Hand that magic movement.',
    handPlacement: {
      rightHand:
        'Place your Right Thumb (Finger 1) on Middle C (C4 — 3rd C from the left on your keyboard, marked MID C4). Let fingers 2 and 3 rest on Re (D4) and Ga (E4).',
      leftHand:
        'In Step 1, rest your Left Hand in your lap! In Step 2, place your Left Pinky (Finger 5) on C3 (one octave to the left of Middle C).',
    },
    whatTeacherExpects: [
      'Start in Step 1 (Right Hand Only) so you only focus on 1 note at a time.',
      'Play Sa (1) -> Re (2) -> Ga (3), then tuck your Thumb (1) under to play Ma (F4)!',
      'Once comfortable, click Step 2 to add a simple Left-Hand Sa drone, and Step 3 to play in steady rhythm.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right Hand Only (Learn Notes & Thumb Tuck)',
        subtitle: '1 Hand • Wait-for-Me (No Rush)',
        whatToExpect:
          'Only green Right-Hand notes appear. The song pauses at every single note until you press it.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Add Simple Left-Hand Bass Note',
        subtitle: '2 Hands (Beginner Tier) • Wait-for-Me',
        whatToExpect:
          'Adds a single Left-Hand C3 bass note on Beat 1 of each bar while you play the Sa Re Ga Ma scale in your Right Hand.',
        handFilter: 'both',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Play in Steady Rhythm with Metronome',
        subtitle: '2 Hands • Smooth Tempo Flow',
        whatToExpect:
          'Play along with a gentle metronome pulse without stopping between notes.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-happy-birthday': {
    whyLearnThis:
      'Everyone knows how "Happy Birthday" sounds in their head! Here we turn that familiar ear melody into proper finger extensions and a gentle 3-beat waltz accompaniment.',
    handPlacement: {
      rightHand:
        'Start your Right Thumb (Finger 1) on Pa (G4 — 4 white keys above Middle C4).',
      leftHand:
        'In Step 1, focus only on your Right Hand. In Step 2, place your Left Hand on C3 and G2 for the waltz bass.',
    },
    whatTeacherExpects: [
      'Notice the two quick "Hap-py" pickup notes on Pa (G4).',
      'In Measure 4, stretch your Pinky (Finger 5) up to high Pa (G5) for the big climax!',
      'Keep your Left Hand softer than your Right Hand when you reach Step 2 and Step 3.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right-Hand Melody Only',
        subtitle: '1 Hand • Wait-for-Me',
        whatToExpect: 'Learn the exact melody and finger stretches with your Right Hand at your own speed.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Add Beat-1 Root Bass (2 Hands)',
        subtitle: 'Beginner 2-Hand • Wait-for-Me',
        whatToExpect: 'Press one Left-Hand bass note at the start of each measure while playing the melody.',
        handFilter: 'both',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Full 3/4 Waltz Arrangement',
        subtitle: 'Full Two-Hand Waltz • Rhythm Mode',
        whatToExpect: 'Play the full Oom-Pah-Pah waltz accompaniment in steady 3/4 time.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-om-shanti-om': {
    whyLearnThis:
      'Bridge Bollywood ear-playing (Ga-Ma-Pa-Dha-Pa) into a full two-handed studio performance using the famous 4-chord progression (C – Am – F – G).',
    handPlacement: {
      rightHand: 'Place your Right Index Finger (Finger 2) on Ga (E4, two white keys right of Middle C).',
      leftHand: 'In Step 2, place your Left Pinky (Finger 5) on C3, ready to step down to A2, F2, and G2.',
    },
    whatTeacherExpects: [
      'Master the catchy Ga-Ma-Pa-Dha-Pa hook with clean Right-Hand fingers 2-3-4-5-4 in Step 1.',
      'In Step 2, anchor each measure with the Left-Hand root note (C -> A -> F -> G).',
      'In Step 3, feel the upbeat groove at 85%–100% tempo!',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right-Hand Hook Only (Ga-Ma-Pa)',
        subtitle: '1 Hand • Wait-for-Me',
        whatToExpect: 'Focus purely on the Bollywood melody in your Right Hand.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Add C–Am–F–G Bass Roots',
        subtitle: '2 Hands (Beginner) • Wait-for-Me',
        whatToExpect: 'Add one Left-Hand bass note per bar under the Right-Hand hook.',
        handFilter: 'both',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Full Bollywood Groove',
        subtitle: '2 Hands (Pro) • Rhythm Flow',
        whatToExpect: 'Full two-hand performance with moving bass fifths and syncopated melody.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.9,
      },
    ],
  },
};

export function getTeacherGuideForSong(song: SongScore): TeacherLessonGuide {
  if (CUSTOM_LESSON_GUIDES[song.id]) {
    return CUSTOM_LESSON_GUIDES[song.id];
  }

  // Default intelligent 3-step teacher plan for Stages 2–6 and custom imported songs
  const startsTwoHand = song.stageId >= 2;
  return {
    whyLearnThis: song.coachTip,
    handPlacement: {
      rightHand:
        'Position your Right Hand near Middle C (C4) to C5 (green falling notes) and follow the 1–5 finger badges.',
      leftHand:
        'Position your Left Hand in the C3 Bass octave (one octave left of Middle C, blue falling notes).',
    },
    whatTeacherExpects: [
      `Focus on ${song.pedagogyFocus.join(' & ')}.`,
      'Start in Step 1 with Wait-for-Me mode so you can inspect every note and finger number without time pressure.',
      'Keep your Right-Hand melody slightly louder (velocity 80–95) than your Left-Hand accompaniment (55–65).',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right Hand Alone (Wait-for-Me)',
        subtitle: '1 Hand • Zero Time Pressure',
        whatToExpect:
          'Isolate the Right-Hand part first. The timeline waits at every beat until you press the right key.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.7,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Hands Together (Wait-for-Me)',
        subtitle: '2 Hands • Step-by-Step Coordination',
        whatToExpect:
          'Combine Left and Right hands at your own pace. The song pauses at every beat until both hands press their keys.',
        handFilter: 'both',
        tier: startsTwoHand ? 'pro' : 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Full Performance in Tempo',
        subtitle: '2 Hands • Steady Metronome Pulse',
        whatToExpect:
          'Play the complete arrangement in smooth rhythm with live timing & dynamics feedback.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
    ],
  };
}

export const STUDIO_FEATURE_EXPLANATIONS = [
  {
    title: 'Wait-for-Me Mode vs. Strict Tempo Mode',
    badge: 'Practice Mode',
    explanation:
      'In "Wait-for-Me" mode, the song freezes at every note and waits patiently until you press the glowing key on your keyboard—perfect when learning a new song! In "Strict Tempo" mode, the song keeps moving with the metronome like a real band.',
  },
  {
    title: 'Step 1 (Right Hand) → Step 2 (Add Left Hand) → Step 3 (Tempo)',
    badge: '3-Step Lesson Flow',
    explanation:
      'Never try to play a brand-new song with both hands at full speed right away! Our 3-Step buttons let you master the Right Hand alone first, then add a simple Left Hand note, and finally play in rhythm.',
  },
  {
    title: 'Notation Bridge (Sargam ↔ Western ↔ Finger Numbers)',
    badge: 'Key Labels',
    explanation:
      'Switch between Indian Sargam (Sa Re Ga Ma), Western note names (C4, D4, E4), Finger Numbers (1=Thumb to 5=Pinky), or Blind Mode (hides labels so you train pure sight-reading).',
  },
  {
    title: 'Beginner / Intermediate / Pro Tiers',
    badge: '3-Tier Simplifier',
    explanation:
      'Every song in VirtuosoStudio has 3 versions: Beginner (simple melody + 1 bass note per bar), Intermediate (melody + simple chords), and Pro (full two-hand concert arrangement).',
  },
  {
    title: 'A–B Measure Looper & +5% Speed Trainer (Pro View)',
    badge: 'Speed Trainer',
    explanation:
      'Tricky measure? Select a start bar (M1) and end bar (M2) to repeat just that section in a loop. Turn on "+5% Ramp" and the app will start slow and automatically speed up by 5% every time you play it accurately!',
  },
  {
    title: 'PC Synth ON vs. PSR Speaker Mode',
    badge: 'Audio Output',
    explanation:
      'If you want to hear the sound coming from your Yamaha PSR-E373 built-in speakers without double sound from your laptop, click "PC Synth ON" to switch to "PSR Speaker Mode".',
  },
];
