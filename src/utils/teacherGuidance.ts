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
  'stage1-five-finger-home': {
    whyLearnThis:
      'In both Indian Harmonium/Keyboard Parampara and Western Conservatory pedagogy, your very first day never involves moving or crossing your hand. You rest your 5 Right-Hand fingers on 5 neighboring white keys (Sa Re Ga Ma Pa / C4–G4) so each finger learns its own independent weight and strength.',
    handPlacement: {
      rightHand:
        'Rest your Right Thumb (Finger 1) on Middle C (C4 — 3rd C from the left, marked MID C4). Let Index (2) rest on Re (D4), Middle (3) on Ga (E4), Ring (4) on Ma (F4), and Pinky (5) on Pa (G4). Curve your fingers gently like holding a small orange!',
      leftHand:
        'In Step 1 & Step 2, rest your Left Hand comfortably in your lap! In Step 3 (Pro), you can optionally add a single C3 Left-Hand Sa drone.',
    },
    whatTeacherExpects: [
      'Do NOT move or shift your hand left or right—all 5 keys are already directly under your 5 fingers!',
      'Press one finger down while keeping the other 4 fingers relaxed on the keys.',
      'Listen to the steady breathing of Sa -> Re -> Ga -> Ma -> Pa -> Ma -> Ga -> Re -> Sa.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right Hand Only (Wait-for-Me • No Rush)',
        subtitle: '1 Hand (Sa–Pa) • Zero Time Pressure',
        whatToExpect:
          'Only the 5 green Right-Hand notes (C4–G4) appear. The lesson pauses at every note until you press the matching finger.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Right Hand in Steady Rhythm',
        subtitle: '1 Hand (Sa–Pa) • Gentle Metronome',
        whatToExpect:
          'Still Right Hand only! Now walk up and down Sa–Re–Ga–Ma–Pa with a calm, steady heartbeat.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Optional Tanpura Sa Drone (2 Hands)',
        subtitle: 'Right Hand + Left Hand C3 Drone',
        whatToExpect:
          'Hold a single Left-Hand Sa (C3) at the start of each bar while your Right Hand plays Sa Re Ga Ma Pa.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-alankar-1-steps': {
    whyLearnThis:
      'Every Indian music student learns Alankars (Paltas)—woven note patterns like "Sa Re Ga, Re Ga Ma, Ga Ma Pa". Because your Ring Finger (4) and Pinky (5) share a tendon in your hand, this 3-note rolling pattern builds vital independence between fingers 3, 4, and 5 before you ever attempt a full scale.',
    handPlacement: {
      rightHand:
        'Keep your Right Hand in the exact same 5-Finger Home (1=Sa/C4, 2=Re/D4, 3=Ga/E4, 4=Ma/F4, 5=Pa/G4). Zero hand shifts!',
      leftHand:
        'Keep your Left Hand relaxed in your lap during Step 1 and Step 2.',
    },
    whatTeacherExpects: [
      'Play in groups of 3: (1-2-3), (2-3-4), (3-4-5) going up, then (5-4-3), (4-3-2), (3-2-1) coming down.',
      'Pay special attention to Ma (Finger 4) and Pa (Finger 5)—make sure they sound just as clear as your Thumb!',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Learn the 3-Note Alankar Pattern (Wait-for-Me)',
        subtitle: 'Right Hand Only • Self-Paced',
        whatToExpect:
          'Practice the ascending and descending 3-note groups at your own speed.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Smooth Alankar Flow in Tempo',
        subtitle: 'Right Hand Only • Steady Pulse',
        whatToExpect:
          'Connect the 3-note groups smoothly (legato) with the metronome.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Alankar with Left-Hand Tanpura Drone',
        subtitle: '2 Hands • Wait-for-Me or Rhythm',
        whatToExpect:
          'Add the Left-Hand C3–G3 Tanpura fifth drone underneath your Right-Hand Alankar.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-alankar-2-skips': {
    whyLearnThis:
      'Real songs don’t just walk next-door—they jump across keys! Alankar #2 ("Sa Ga, Re Ma, Ga Pa") teaches your eyes and fingers to recognize "skips" (playing Finger 1 then Finger 3 while leaving Finger 2 unpressed).',
    handPlacement: {
      rightHand:
        'Keep your 5 Right-Hand fingers anchored on Sa–Re–Ga–Ma–Pa (C4 to G4).',
      leftHand:
        'Rest your Left Hand in Step 1 & 2, or place it on C3 for the optional Step 3 drone.',
    },
    whatTeacherExpects: [
      'Play 1 -> 3 (Sa–Ga), then 2 -> 4 (Re–Ma), then 3 -> 5 (Ga–Pa).',
      'Notice how skipping one white key creates a sweet, harmonious interval called a "Third".',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right-Hand Skips (Wait-for-Me)',
        subtitle: '1 Hand • Learn 1-3, 2-4, 3-5',
        whatToExpect: 'Take your time jumping cleanly between odd and even fingers.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Right-Hand Skips in Rhythm',
        subtitle: '1 Hand • Steady Beat',
        whatToExpect: 'Play the skipping Alankar evenly without rushing.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Add Left-Hand Drone',
        subtitle: '2 Hands • Wait-for-Me',
        whatToExpect: 'Combine your skipping melody with a calm Left-Hand bass note.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-jana-gana-5note': {
    whyLearnThis:
      'Reward time! Because you mastered the stationary 5-finger home (Sa–Pa), you can play both the opening of "Jana Gana Mana" and Beethoven’s "Ode to Joy" without moving your hand an inch!',
    handPlacement: {
      rightHand:
        'Place Fingers 1–5 on C4–G4 (Sa–Pa). Start with Finger 1 on Sa (C4) for Jana Gana Mana, then Finger 3 on Ga (E4) for Ode to Joy.',
      leftHand:
        'Rest your Left Hand in Step 1. In Step 2/3, place Left Pinky on C3 and Thumb on G3.',
    },
    whatTeacherExpects: [
      'Hear how repeated notes (Re-Re-Re-Re-Re-Re) create speech-like rhythm in Jana Gana Mana.',
      'Play Ode to Joy (Ga-Ga-Ma-Pa-Pa-Ma-Ga-Re) with a warm, singing touch.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right-Hand Melody Only (Wait-for-Me)',
        subtitle: '1 Hand • Stationary C4–G4',
        whatToExpect: 'Play your first two famous melodies with zero hand movement.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Right-Hand Melody in Rhythm',
        subtitle: '1 Hand • Song Flow',
        whatToExpect: 'Make the melodies sing in steady time!',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Two-Hand Accompaniment Preview',
        subtitle: '2 Hands • Optional Bass Support',
        whatToExpect: 'Add simple Left-Hand C3 and G3 bass notes on Beat 1.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage2-thumb-tuck-drill': {
    whyLearnThis:
      'To play beyond Pa (G4) and reach Dha, Ni, and high Sȧ (C5), we need 8 notes—but we only have 5 fingers! Before playing the full scale, a great teacher isolates the exact "1-2-3-1" Thumb-Under tuck between Ga (E4) and Ma (F4) so your wrist stays relaxed and never twists.',
    handPlacement: {
      rightHand:
        'Place Finger 1 on Sa (C4), Finger 2 on Re (D4), Finger 3 on Ga (E4). As you play Ga (3), let your Thumb (1) sneak quietly underneath your palm to land on Ma (F4)!',
      leftHand: 'Rest your Left Hand in your lap during Step 1 and Step 2.',
    },
    whatTeacherExpects: [
      'Never jerk your elbow out to the right when tucking your thumb—let your thumb hinge smoothly under Finger 3.',
      'On the way down (Ma -> Ga), cross Finger 3 smoothly over Finger 1.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Slow-Motion Thumb-Tuck (Wait-for-Me)',
        subtitle: 'Right Hand • 1-2-3-1 Bridge Drill',
        whatToExpect: 'Practice the Sa-Re-Ga-(Thumb)-Ma bridge at your own pace.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Smooth Bridge in Tempo',
        subtitle: 'Right Hand • Even Volume',
        whatToExpect: 'Make sure the thumb note (Ma/F4) doesn’t sound louder or bumpy.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Bridge Drill with Left-Hand Sa',
        subtitle: '2 Hands • Wait-for-Me',
        whatToExpect: 'Anchor each bar with a Left-Hand C3 bass note.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-sargam-scale': {
    whyLearnThis:
      'Now that you practiced the 1-2-3-1 Thumb-Tuck micro-drill, you are ready to ascend and descend the entire 8-note Saptak (Sa Re Ga Ma Pa Dha Ni Sȧ / C4 to C5) smoothly without running out of fingers!',
    handPlacement: {
      rightHand:
        'Place your Right Thumb (Finger 1) on Middle C (C4). Play 1-2-3 on C4-D4-E4, tuck Thumb (1) to F4, and finish 1-2-3-4-5 all the way up to High Sȧ (C5)!',
      leftHand:
        'In Step 1, rest your Left Hand in your lap! In Step 2, place your Left Pinky (Finger 5) on C3 (one octave left of Middle C).',
    },
    whatTeacherExpects: [
      'Start in Step 1 (Right Hand Only) so you focus purely on 1-2-3-1-2-3-4-5 going up and 5-4-3-2-1-3-2-1 going down.',
      'Once your Right Hand glides effortlessly, click Step 2 to add the Left-Hand Tanpura drone.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Right Hand Full Saptak (Wait-for-Me)',
        subtitle: '1 Hand • 1-2-3-1-2-3-4-5',
        whatToExpect:
          'Only green Right-Hand notes appear. The song pauses at every single note until you press it.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Add Simple Left-Hand Sa Drone',
        subtitle: '2 Hands • Wait-for-Me',
        whatToExpect:
          'Adds a Left-Hand C3/G3 drone while you play the full Sa Re Ga Ma scale in your Right Hand.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Play Full Saptak in Steady Rhythm',
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
  'stage2-raag-yaman-black-keys': {
    whyLearnThis:
      'In Indian classical music, evening tutorials often begin with Raag Yaman (Kalyan Thaat), which replaces natural Ma (F4) with Tivra Ma (F#4 — the leftmost black key in the group of 3 black keys). This teaches your hand to slide forward slightly onto the raised black keys!',
    handPlacement: {
      rightHand:
        'Start with Finger 1 on low Ni (B3, just left of Middle C) or C4, and when reaching Ma#, lift your Ring Finger (4) onto the F#4 black key.',
      leftHand: 'Rest Left Hand in Step 1; place on C3–G3 for the Tanpura drone in Step 2 & 3.',
    },
    whatTeacherExpects: [
      'Avoid playing black keys with your short Thumb (Finger 1) whenever possible—use longer fingers 2, 3, or 4.',
      'Enjoy the unmistakable, serene evening sound of Raag Yaman (Ni Re Ga Ma# Dha Ni Sȧ)!',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Raag Yaman Aaroh & Avroh (Right Hand)',
        subtitle: '1 Hand • Discover Tivra Ma (F#4)',
        whatToExpect: 'Learn where F#4 lives on your keyboard with zero time pressure.',
        handFilter: 'right',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Add Left-Hand Sa-Pa Tanpura Drone',
        subtitle: '2 Hands • Wait-for-Me',
        whatToExpect: 'Hear how Tivra Ma glows against the C3–G3 Tanpura fifth!',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.8,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Flowing Raag Yaman Alaap in Tempo',
        subtitle: '2 Hands • Expressive Rhythm',
        whatToExpect: 'Play the Yaman phrases smoothly in time.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage3-left-hand-alone': {
    whyLearnThis:
      'The #1 mistake beginners make is jumping straight into two-handed songs when their Left Hand has never practiced on its own! Notice that your Left Hand is a mirror image of your Right Hand: on C3 (Mandra Sa), your Left Pinky is Finger 5 and your Left Thumb is Finger 1 on G3 (Pa).',
    handPlacement: {
      rightHand:
        'Give your Right Hand a break in Step 1 & Step 2! Rest it in your lap while your Left Hand gets the spotlight.',
      leftHand:
        'Place your Left Pinky (Finger 5) on Bass C3 (2nd C from the left, one octave below Middle C). Let Ring (4) rest on D3, Middle (3) on E3, Index (2) on F3, and Thumb (1) on G3.',
    },
    whatTeacherExpects: [
      'In Step 1 & 2, ONLY play with your Left Hand (blue notes)!',
      'Strengthen your Left Pinky (5) on C3 and Left Ring Finger (4) on D3 so your bass notes sound confident and steady.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Left Hand Alone (Wait-for-Me)',
        subtitle: 'Left Hand Only (C3–G3) • No Rush',
        whatToExpect: 'Only blue Left-Hand notes appear. Train Fingers 5-4-3-2-1 in the bass octave!',
        handFilter: 'left',
        tier: 'beginner',
        practiceMode: 'wait',
        tempoMultiplier: 0.75,
      },
      {
        stepNumber: 2,
        title: 'Step 2: Left Hand Alone in Steady Rhythm',
        subtitle: 'Left Hand Only • Bass Pulse',
        whatToExpect: 'Play the Left-Hand bass pattern in steady rhythm with the metronome.',
        handFilter: 'left',
        tier: 'beginner',
        practiceMode: 'rhythm',
        tempoMultiplier: 0.85,
      },
      {
        stepNumber: 3,
        title: 'Step 3: Add Right-Hand Bell Chimes (2 Hands)',
        subtitle: 'Left Hand Bass + Simple Right Hand',
        whatToExpect: 'Keep your Left Hand walking steadily while your Right Hand taps gentle whole-note chimes.',
        handFilter: 'both',
        tier: 'pro',
        practiceMode: 'wait',
        tempoMultiplier: 0.85,
      },
    ],
  },
  'stage1-happy-birthday': {
    whyLearnThis:
      'Everyone knows how "Happy Birthday" sounds in their head! Now that you know the full octave, we turn that familiar ear melody into proper finger extensions (stretching Finger 1 to Finger 5 across a full octave) and a gentle 3-beat waltz.',
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
      'Bridge Bollywood ear-playing (Ga-Ma-Pa-Dha-Pa) into a full performance! In Stage 2, focus on the catchy Right-Hand hook first before previewing the famous C–Am–F–G bass roots.',
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
  // A guide authored with the song wins; then the hand-written guides for the original lessons.
  if (song.teacherGuide) {
    return song.teacherGuide;
  }
  if (CUSTOM_LESSON_GUIDES[song.id]) {
    return CUSTOM_LESSON_GUIDES[song.id];
  }

  // Stage-paced teacher plan for Stage 1 & 2 (One-Hand Fundamental Pace first!)
  if (song.stageId === 1 || song.stageId === 2) {
    return {
      whyLearnThis: `${song.coachTip} (Paced for Stage ${song.stageId}: Master the Right-Hand melody with zero rush before trying two hands!)`,
      handPlacement: {
        rightHand:
          'Position your Right Hand near Middle C (C4) to C5 (green falling notes) and follow the 1–5 finger badges.',
        leftHand:
          'In Step 1 & Step 2, rest your Left Hand in your lap so you never feel rushed! In Step 3, optionally add simple Beat-1 bass notes.',
      },
      whatTeacherExpects: [
        `Focus on ${song.pedagogyFocus.join(' & ')}.`,
        'Step 1: Learn the Right-Hand melody notes in Wait-for-Me mode with zero time pressure.',
        'Step 2: Play the Right-Hand melody in steady rhythm before optionally trying two hands in Step 3.',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Step 1: Right-Hand Melody Only (Wait-for-Me)',
          subtitle: '1 Hand • Self-Paced Note Discovery',
          whatToExpect:
            'Only green Right-Hand melody notes appear. The song waits patiently at every note.',
          handFilter: 'right',
          tier: 'beginner',
          practiceMode: 'wait',
          tempoMultiplier: 0.7,
        },
        {
          stepNumber: 2,
          title: 'Step 2: Right-Hand Melody in Steady Rhythm',
          subtitle: '1 Hand • Smooth Metronome Flow',
          whatToExpect:
            'Still Right Hand only! Connect the melody notes smoothly with a gentle pulse.',
          handFilter: 'right',
          tier: 'beginner',
          practiceMode: 'rhythm',
          tempoMultiplier: 0.8,
        },
        {
          stepNumber: 3,
          title: 'Step 3: Optional Simple Left-Hand Bass (Wait-for-Me)',
          subtitle: '2 Hands (Beginner Tier) • No Rush',
          whatToExpect:
            'Ready for a bonus challenge? Add 1 simple Left-Hand root note at the start of each bar.',
          handFilter: 'both',
          tier: 'intermediate',
          practiceMode: 'wait',
          tempoMultiplier: 0.8,
        },
      ],
    };
  }

  // Default intelligent 3-step teacher plan for Stages 3–6 and general custom imported songs
  const startsTwoHand = song.stageId >= 3;
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
        tier: startsTwoHand ? 'intermediate' : 'beginner',
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
