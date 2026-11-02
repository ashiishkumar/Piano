import { PATTERN_BY_ID } from '../patterns';
import { ConceptPayload, KeyboardTaskPayload, PC, PatternPayload } from './types';

export const SONG_TONE_SELECTION: ConceptPayload = {
  type: 'concept',
  title: '9A · How to Select a Tone for a Song',
  track: 'keyboard',
  durationMinutes: 5,
  source: 'course 9A',
  objectives: [
    'Match the instrument tone (Voice) to the genre and emotional feel of the song',
    'Know when to use Grand Piano, E-Piano, Strings, Santoor/Sitar, Harmonium/Accordion, and Flute',
  ],
  cards: [
    {
      title: '1. Match Tone to Genre & Era',
      body:
        'Before playing a song, listen to the original track and identify its lead sonic character:\n\n• Romantic / Modern Ballads: Grand Piano, Warm E-Piano, or Piano + Strings.\n• Classical / Retro Bollywood (1960s–70s): Accordion, Harmonium, Santoor, or Violin/Strings.\n• Patriotic / Folk / Devotional: Harmonium, Flute, Sitar, or Brass.',
      diagram: 'panel',
    },
    {
      title: '2. Sustained vs. Percussive Tones',
      body:
        'Every keyboard voice falls into one of two families:\n\n• Percussive (struck/plucked): Grand Piano, E-Piano, Santoor, Guitar, Harpsichord. The sound decays naturally after you strike the key.\n• Sustained (continuous breath/bow): Strings, Flute, Harmonium, Organ, Synth Pad. The sound holds as long as your finger holds the key.',
      diagram: 'panel',
    },
    {
      title: '3. Switching Voices Mid-Song',
      body:
        'Save your favorite tones in Registration Memory (Bank 1–4) so you can switch from Flute on the intro solo to Grand Piano on the verse with a single button press!',
      diagram: 'panel',
    },
  ],
};

export const DUAL_SPLIT_RHYTHM: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: '9D · Layering Tones (Dual), Split & Rhythm Tracks',
  subtitle: 'Master the Chapter 9D Golden Rule: Layer 1 Percussive Tone + 1 Sustained Tone!',
  track: 'keyboard',
  durationMinutes: 10,
  source: 'course 9D',
  objectives: [
    'Apply the Chapter 9D Layering Rule: combine 1 Percussive voice (Piano) + 1 Sustained voice (Strings)',
    'Give the Left Hand its own bass/chord voice with SPLIT',
    'Practice in time with a keyboard Rhythm Track (START/STOP)',
  ],
  steps: [
    {
      instruction: 'Press DUAL so it lights up, then play a key to hear Piano + Strings layered together.',
      panelButton: 'DUAL',
      explanation:
        'Chapter 9D Rule (p. 245): Never layer two percussive tones or two heavy sustained tones together. Always layer ONE Percussive tone (like Grand Piano) with ONE Sustained tone (like Strings) at a lower volume so the attack is crisp and the tail is warm!',
      verify: { kind: 'dual' },
    },
    {
      instruction: 'Press DUAL again to turn it off. Press SPLIT, then play one low left-hand key and one high right-hand key.',
      panelButton: 'SPLIT',
      explanation:
        'Below the split point (F#2 by default) the keyboard assigns a dedicated Left-Hand voice (such as Acoustic Bass or Warm Pad) while your Right Hand plays the lead melody voice.',
      verify: { kind: 'split' },
    },
    {
      instruction: 'Press SPLIT again to turn it off. Make sure ACMP is off, then press START/STOP to launch the drum rhythm.',
      panelButton: 'START_STOP',
      explanation:
        'Playing along with a drum style/rhythm track locks in your tempo and gives your performance a full-band groove.',
      verify: { kind: 'style-running' },
    },
    {
      instruction: 'Play a C Major chord progression along with the beat for 2 bars, then press START/STOP to finish.',
      panelButton: 'START_STOP',
      verify: { kind: 'style-stopped' },
    },
  ],
};

export const PLAYING_WITH_A_SINGER: ConceptPayload = {
  type: 'concept',
  title: '10A · How to Play Piano with a Singer (Accompaniment Mastery)',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 10A',
  objectives: [
    'Stop playing the vocal melody on top of the singer — become the harmonic foundation',
    'Use the 3 Accompaniment Textures: 1. Two-Hand Chords, 2. LH Arpeggio + RH Chords, 3. Vocal-Gap Fillers & Harmonies',
  ],
  cards: [
    {
      title: 'Rule #1: Don\'t Double the Singer\'s Every Note!',
      body:
        'When you play solo instrumental piano, your Right Hand carries the lyrics melody. When accompanying a vocalist (or singing yourself), the voice already carries the melody!\n\nYour job switches to supporting the singer with rhythm, harmony, and atmosphere.',
    },
    {
      title: 'Texture 1 & 2: Two-Hand Chords & LH Arpeggios + RH Chords',
      body:
        'Use these two core accompaniment textures from Chapter 10A (pp. 249–250):\n\n1. Both-Hand Chords: Left hand plays Root or Fat Chord (1-5-8) in the bass while Right Hand plays rhythmic triad inversions in the middle register.\n2. LH Arpeggio + RH Chords: Left hand flows through a 1-5-8 or 1-5-8-5 arpeggio while Right Hand pulses chords or gentle counter-notes.',
    },
    {
      title: 'Texture 3: Fillers & Harmonies in Vocal Gaps',
      body:
        'Listen for the 2-beat and 4-beat pauses at the end of the singer\'s lines (just like Chapter 9B). Step forward with a short Right-Hand filler or harmony motif during the pause, then step back smoothly as soon as the singer starts the next line.',
    },
  ],
};

export const INTRO_AND_OUTRO: PatternPayload = {
  type: 'pattern',
  title: '10B · How to Create Your Own Intro & Outro for Any Song',
  subtitle: 'Combine the song\'s Priority Chord Progression + Time Signature + Scale notes landing on Chord Tones!',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 10B',
  objectives: [
    'Build a custom 4-bar Intro or Outro using the song\'s chord progression, time signature, and scale',
    'Start and end your intro/outro phrases on notes of the current chord (1st, 3rd, or 5th)',
    'Slow down gradually (ritardando) on the final chord of an Outro',
  ],
  templates: [
    PATTERN_BY_ID['ballad-1585'],
    PATTERN_BY_ID.alberti,
    PATTERN_BY_ID['open-tenth'],
    PATTERN_BY_ID.rolling,
  ],
  progression: [
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.E, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
  ],
  bpm: 74,
  repeats: 1,
  allowTranspose: true,
};

export const TRANSPOSING_AND_STAGE_PRESENCE: ConceptPayload = {
  type: 'concept',
  title: '10C · Transposing (-12 to +12) & Performing Expressively on Stage',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'course 10C',
  objectives: [
    'Use the Keyboard Transpose function (-12 to +12 semitones) to shift any scale to match a singer\'s vocal range instantly',
    'Perform with natural body language, dynamics, and confidence',
  ],
  cards: [
    {
      title: '1. How the Transpose Function Works (-12 to +12)',
      body:
        'Every +1 or -1 step on your keyboard\'s TRANSPOSE button shifts the sound by 1 semitone (half-step):\n\n• Playing in C Major with Transpose = +1 outputs C# Major.\n• Playing in C Major with Transpose = +2 outputs D Major.\n• Playing in C Major with Transpose = -2 outputs A# (Bb) Major.\n• +12 or -12 shifts by one full octave.',
      diagram: 'panel',
    },
    {
      title: '2. When to Use Transpose (and When Not To)',
      body:
        'If you practiced a complex arrangement in C Major or A Minor and a singer asks for F# Minor on stage 30 seconds before the show, set Transpose to -3 (A down 3 semitones -> F#) and play your A Minor shapes with total confidence!\n\nIn daily practice, however, still practice all 12 scales manually so your fingers stay fearless across black keys.',
    },
    {
      title: '3. Facial Expressions, Dynamics & Stage Presence (Page 256)',
      body:
        'Audience members watch how you feel the music before they analyze your notes:\n\n• Breathe with the phrases and let your posture move naturally with the rhythm.\n• Play verses softly (gentle touch) and build power into the chorus (firmer touch + Fat Chords/Arpeggios).\n• Never freeze or grimace if you miss a note — keep the left-hand pulse flowing and smile!',
    },
  ],
};
