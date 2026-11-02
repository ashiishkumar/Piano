import { ConceptPayload, K, KeyboardTaskPayload, allOfClass, labels } from './types';

const SARGAM = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
const WHITE_C4_B4 = [K.C4, K.D4, K.E4, K.F4, K.G4, K.A4, K.B4];
const KALI_EK_MIDIS = [K.Cs4, K.Ds4, K.F4, K.Fs4, K.Gs4, K.As4, K.C5, K.Cs5];
const KALI_EK_FINGERS = ['2', '3', '1', '2', '3', '4', '1', '2'];

export const MEET_YOUR_KEYBOARD: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Chapter 1A: PIX Series Welcome & Keyboard Setup',
  subtitle: 'PDF pp. 1–3 • Connect your keyboard, set Grand Piano voice & verify USB MIDI',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'course 1A (pp. 1–3)',
  objectives: [
    'Welcome to the PIX Series Zero to Hero Piano Course interactive companion',
    'Connect your keyboard via USB TO HOST so the app hears every key you play',
    'Set a clean Grand Piano sound (PORTABLE GRAND) and test the Metronome',
  ],
  steps: [
    {
      instruction: 'Switch on your keyboard and set it on a sturdy stand or table in front of you.',
      panelButton: 'STANDBY_ON',
      explanation:
        'Welcome to Jash Gotawala’s PIX Series Zero to Hero Course! Watch each chapter video, then open the matching Chapter code (2A–10C) here to practice with live feedback.',
      verify: { kind: 'manual' },
    },
    {
      instruction:
        'Plug your USB cable into the USB TO HOST socket on the back of the keyboard and into your computer/device. Then press any key.',
      panelButton: 'USB_TO_HOST',
      explanation: 'One USB cable lets VirtuosoStudio detect your exact notes, chord shifts, rhythm timing, and touch velocity.',
      verify: { kind: 'any-note' },
    },
    {
      instruction: 'Press PORTABLE GRAND to reset your keyboard to a pure acoustic Grand Piano (Voice 001).',
      panelButton: 'PORTABLE_GRAND',
      explanation:
        'Throughout Modules 2 to 8, you should practice on a clean Piano sound (except in Module 7 Ear Training where we also use Strings).',
      verify: { kind: 'program-change' },
    },
    {
      instruction: 'Turn MASTER VOLUME to a comfortable level and play a few keys softly and firmly.',
      panelButton: 'MASTER_VOLUME',
      verify: { kind: 'any-note' },
    },
    {
      instruction: 'Press METRONOME to hear your keyboard’s click, then press it again to stop.',
      panelButton: 'METRONOME',
      explanation: 'Every chapter in the Zero to Hero PDF gives you a Metronome BPM range—both your keyboard and this app have a built-in metronome.',
      verify: { kind: 'manual' },
    },
  ],
};

export const POSTURE: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 2A: Best Posture for Pianists',
  subtitle: 'PDF pp. 5–6 • Belly-button height, 90° elbow angle & chair without fixed armrests',
  track: 'play',
  durationMinutes: 4,
  source: 'course 2A (pp. 5–6)',
  objectives: [
    'Position the piano at belly-button (navel) height (PDF p. 6 Rule #1)',
    'Keep a 90° angle between elbow and hands with curved fingers (PDF p. 6 Rule #2)',
    'Use a chair or bench without fixed armrests so your elbows can move freely across all octaves (PDF p. 6 Rule #3)',
  ],
  cards: [
    {
      title: 'Rule 1: Piano at belly-button level (PDF p. 6)',
      body:
        'As Jash demonstrates in Chapter 2A (pages 5–6), your keyboard should sit right around your belly-button (navel) level when you are seated.\n\nIf the keyboard is too high (near your chest), your shoulders hunch up and your wrists bend awkwardly. Adjust your stand or seat height first.',
    },
    {
      title: 'Rule 2: 90-degree angle between elbow and hands',
      body:
        'Your upper arms should hang naturally from your shoulders, forming a clean 90° angle at your elbows so your forearms are parallel to the floor.\n\nCurve your fingers gently as if holding a ball or orange so your fingertips—not flat fingers—press the keys.',
      diagram: 'finger-numbers',
    },
    {
      title: 'Rule 3: Chair without fixed armrests',
      body:
        'Never sit in an office chair with wide, fixed armrests while playing piano! Fixed armrests block your elbows when your Left Hand reaches down to the bass octave or your Right Hand reaches up to the higher octave.\n\nUse a piano bench, stool, or armless chair and sit on the front half with a straight back.',
    },
    {
      title: 'Finger numbers 1 to 5 (Both Hands)',
      body:
        'In every chapter of the course PDF, fingers are numbered 1 to 5 from the Thumb outward:\n• 1 = Thumb\n• 2 = Index finger\n• 3 = Middle finger\n• 4 = Ring finger\n• 5 = Little finger (Pinky)',
      diagram: 'finger-numbers',
    },
  ],
};

export const KEYBOARD_MAP: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 2B.1: Everything About Sargam, Octaves & the 12 Swaras',
  subtitle: 'PDF pp. 7–9 • Lower/Middle/Higher Octaves, Komal/Tivra Swaras & Kali Ek (C#) Fingering',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 2B (pp. 7–9)',
  objectives: [
    'Distinguish Lower Octave (dot below), Middle Octave (plain), and Higher Octave (dot above) on the keyboard (PDF p. 7)',
    'Learn all 12 Sargam notes: 7 Shuddha + 4 Komal (Re, Ga, Dha, Ni) + 1 Tivra (Ma) (PDF p. 8)',
    'Play the exact Kali Ek (C#) Sargam scale with Jash’s 2-3-1-2-3-4-1-2 fingering (PDF p. 9)',
  ],
  cards: [
    {
      title: 'Three Octaves (Saptaks) on the Piano (PDF p. 7)',
      body:
        'Look at the black keys: they repeat in groups of 2 black keys + 3 black keys. Each 12-key pattern is one Octave (Saptak):\n\n• Lower Octave (Mandra Saptak — dot below, e.g. SẠ): Deeper, heavier voice on the left.\n• Middle Octave (Madhya Saptak — no dot, e.g. SA): Center of the keyboard where most melodies live.\n• Higher Octave (Taar Saptak — dot above, or RED notes in the PDF): Bright, high voice on the right.',
      highlight: { midis: [K.C3, K.C4, K.C5], labels: { [K.C3]: 'Low Sa', [K.C4]: 'Mid Sa', [K.C5]: 'High Sa' } },
      tryIt: { prompt: 'Press Low C (C3), Middle C (C4), and High C (C5) in order.', targetMidis: [K.C3, K.C4, K.C5] },
    },
    {
      title: 'All 12 Notes in Sargam: Shuddha, Komal & Tivra (PDF p. 8)',
      body:
        'Between one SA and the next SA there are 12 total keys (7 Shuddha + 5 Vikrit):\n\n• SA and PA are fixed (immovable — they have no Komal or Tivra).\n• RE, GA, DHA, NI each have a Komal (underlined) note 1 key to the left.\n• MA has a Tivra (MÁ) note 1 key to the right.\n\nTotal = 12 Swaras in every octave!',
      highlight: {
        midis: [K.C4, K.Cs4, K.D4, K.Ds4, K.E4, K.F4, K.Fs4, K.G4, K.Gs4, K.A4, K.As4, K.B4],
        labels: {
          [K.C4]: 'Sa',
          [K.Cs4]: 're',
          [K.D4]: 'Re',
          [K.Ds4]: 'ga',
          [K.E4]: 'Ga',
          [K.F4]: 'Ma',
          [K.Fs4]: 'Ma#',
          [K.G4]: 'Pa',
          [K.Gs4]: 'dha',
          [K.A4]: 'Dha',
          [K.As4]: 'ni',
          [K.B4]: 'Ni',
        },
      },
    },
    {
      title: 'Finger Positions in Sargam — Kali Ek / C# (PDF p. 9)',
      body:
        'On page 9 of the PDF, Jash shows the classic Indian Sargam scale starting on the first black key (C# / Kali Ek):\n\n• SA (C#) = Finger 2\n• RE (D#) = Finger 3\n• GA (F white key) = Finger 1 (Thumb tucks under!)\n• MA (F#) = Finger 2\n• PA (G#) = Finger 3\n• DHA (A#) = Finger 4\n• NI (C white key) = Finger 1 (Thumb tucks under!)\n• SȦ (C#) = Finger 2',
      highlight: { midis: KALI_EK_MIDIS, labels: labels(KALI_EK_MIDIS, KALI_EK_FINGERS) },
      tryIt: {
        prompt: 'Play SA RE GA MA PA DHA NI SȦ starting from C#4 (Kali Ek) with 2-3-1-2-3-4-1-2.',
        targetMidis: KALI_EK_MIDIS,
      },
    },
  ],
};

export const SARGAM_AND_WESTERN: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 2D: Sargam v/s Western Notes — Which is Easy?',
  subtitle: 'PDF pp. 12–13 • Why Sargam is movable and Western notes (C to B) are fixed',
  track: 'theory',
  durationMinutes: 5,
  source: 'course 2D (pp. 12–13)',
  objectives: [
    'Understand why Sargam is movable (any key can become Sa) while Western notes are fixed (C is always C) (PDF p. 12)',
    'Name all 7 white keys (C D E F G A B) and all 5 black keys (C# D# F# G# A#) (PDF p. 13)',
    'Know why the rest of the Zero to Hero course uses Western letter names for scales, chords, and songs',
  ],
  cards: [
    {
      title: 'The Core Difference: Movable Sa vs. Fixed C (PDF p. 12)',
      body:
        'In Chapter 2D (pages 12–13), Jash compares Sargam and Western notation:\n\n• In Sargam, "SA" is movable—a male singer might make C# his SA, while a female singer might make G# her SA.\n• In Western notation, every key has one permanent name forever: the white key left of the 2 black keys is ALWAYS "C".',
      highlight: { midis: allOfClass(0), labels: labels(allOfClass(0), ['C']) },
    },
    {
      title: 'The 7 White Keys: C D E F G A B (PDF p. 13)',
      body:
        'Starting from the white key to the left of the two black keys, the 7 white keys are named:\nC – D – E – F – G – A – B.\n\nWhen SA is on C, they match SA – RE – GA – MA – PA – DHA – NI one-to-one.',
      highlight: { midis: WHITE_C4_B4, labels: labels(WHITE_C4_B4, ['C', 'D', 'E', 'F', 'G', 'A', 'B']) },
      tryIt: { prompt: 'Play the 7 white keys from Middle C4 up to B4.', targetMidis: WHITE_C4_B4 },
    },
    {
      title: 'The 5 Black Keys: Sharps (#) & Flats (b) (PDF p. 13)',
      body:
        'Moving 1 key to the RIGHT of a white key gives its Sharp (#):\n• C → C# (or Db)\n• D → D# (or Eb)\n• F → F# (or Gb)\n• G → G# (or Ab)\n• A → A# (or Bb)\n\nNotice E and B have no black key to their right!',
      highlight: {
        midis: [K.Cs4, K.Ds4, K.Fs4, K.Gs4, K.As4],
        labels: { [K.Cs4]: 'C#', [K.Ds4]: 'D#', [K.Fs4]: 'F#', [K.Gs4]: 'G#', [K.As4]: 'A#' },
        colour: 'amber',
      },
      tryIt: {
        prompt: 'Press the 5 black keys in the middle octave: C#, D#, F#, G#, A#.',
        targetMidis: [K.Cs4, K.Ds4, K.Fs4, K.Gs4, K.As4],
      },
    },
    {
      title: 'Why We Use Western Notes From Here On',
      body:
        'Because Western keys are fixed, writing "Play F# Major chord" or "Play E – G – A – G" tells you the exact physical keys on your piano with zero confusion!\n\nVirtuosoStudio lets you toggle between Western names, Sargam, and Finger Numbers anytime in the toolbar.',
      highlight: { midis: [...WHITE_C4_B4, K.C5], labels: labels([...WHITE_C4_B4, K.C5], [...SARGAM, 'Sa']) },
    },
  ],
};

export const TOUCH_RESPONSE: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Chapter 9A: How to Use Touch Sensitive Function',
  subtitle: 'PDF pp. 239–240 • Playing Soft (Piano) vs. Loud (Forte) & Crescendo/Diminuendo',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'course 9A (pp. 239–240)',
  objectives: [
    'Understand how Touch Sensitivity turns finger speed/pressure into volume & emotion (PDF p. 239)',
    'Practice Jash’s Scale Dynamics drill: start very soft, build to loud in the middle, and fade back to soft (PDF p. 240)',
    'Verify Touch Response settings on your keyboard over USB MIDI',
  ],
  steps: [
    {
      instruction:
        'Play 8 notes starting as softly as a whisper (low velocity) and gradually pressing harder (crescendo) up to loud! Watch the live velocity meter.',
      explanation:
        'In Chapter 9A (pp. 239–240), Jash shows that Touch Sensitivity is what separates a robotic keyboard player from an expressive pianist. Soft touch = intimate emotion; firm touch = chorus power!',
      verify: { kind: 'touch-response', expect: 'variable' },
    },
    {
      instruction:
        'On your keyboard, press FUNCTION and check "TouchRes". Set it to Fixed briefly and play 8 keys to hear how robotic a non-touch keyboard sounds.',
      panelButton: 'FUNCTION',
      explanation: 'With Touch Response off (Fixed), every note blasts at the exact same volume no matter how gently you play.',
      verify: { kind: 'touch-response', expect: 'fixed' },
    },
    {
      instruction:
        'Switch TouchRes back to Medium (or Soft) in FUNCTION, then play a scale starting soft, getting loud at the top, and fading soft at the end.',
      panelButton: 'FUNCTION',
      explanation: 'Always keep Touch Sensitivity ON when playing songs in Modules 4, 6, 9, and 10!',
      verify: { kind: 'touch-response', expect: 'variable' },
    },
  ],
};
