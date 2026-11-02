import { PATTERNS_34, PATTERNS_44, PATTERNS_EXCEPTIONAL, PATTERN_BY_ID } from '../patterns';
import { ConceptPayload, K, PC, PatternPayload } from './types';

const I_V_vi_IV = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
];
const I_vi_IV_V = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.A, quality: 'minor' as const },
  { rootPc: PC.F, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
];
const I_IV_V_I = [
  { rootPc: PC.C, quality: 'major' as const },
  { rootPc: PC.F, quality: 'major' as const },
  { rootPc: PC.G, quality: 'major' as const },
  { rootPc: PC.C, quality: 'major' as const },
];

export const INTRO_TO_ARPEGGIOS: ConceptPayload = {
  type: 'concept',
  title: 'Introduction to arpeggios',
  subtitle: 'A chord, one note at a time',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6A',
  objectives: ['Know what an arpeggio is and why accompaniments use them', 'Play C major as 1-3-5-8 with the left hand', 'Read the tone numbers used in every pattern lesson'],
  cards: [
    {
      title: 'Spread the chord out',
      body:
        'A chord is three notes at once. An arpeggio is the same three notes one after another, usually with the root again on top. Play C E G C and you have arpeggiated a C major chord.\n\nBlock chords in the left hand are heavy; arpeggios keep the harmony moving under a melody. Almost every ballad you know does this.',
      highlight: { midis: [K.C3, K.E3, K.G3, K.C4], labels: { [K.C3]: '1', [K.E3]: '3', [K.G3]: '5', [K.C4]: '8' } },
      tryIt: { prompt: 'Left hand: play C E G C, one at a time, from C below Middle C.', targetMidis: [K.C3, K.E3, K.G3, K.C4] },
    },
    {
      title: 'Tone numbers',
      body:
        'Pattern lessons name notes by their place in the chord, not by letter: 1 is the root, 3 the third, 5 the fifth, 8 the root an octave up, 10 the third up, 12 the fifth up.\n\nThe same numbers work on every chord. 1-3-5-8 on C is C E G C; on F it is F A C F. Learn the shape once, move the hand.',
      highlight: { midis: [K.F3, K.A3, K.C4, K.F4], labels: { [K.F3]: '1', [K.A3]: '3', [K.C4]: '5', [K.F4]: '8' } },
      tryIt: { prompt: 'Now 1-3-5-8 on F: F A C F.', targetMidis: [K.F3, K.A3, K.C4, K.F4] },
    },
    {
      title: 'Fingering that never changes',
      body:
        'Left hand: little finger on the root (1), middle finger on the third (3), thumb on the fifth (5). For the octave (8), the thumb hops up or the hand rolls. Every pattern in this level uses that same hand shape; only the order of notes changes.',
    },
  ],
};

export const ARPEGGIO_COORDINATION_44: PatternPayload = {
  type: 'pattern',
  title: 'Coordination exercises in 4/4',
  subtitle: 'Block chord, then root-and-chord, then the rising arpeggio, over C G Am F',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6B',
  objectives: ['Hold a left-hand shape while the chord root changes', 'Move from block chords to a moving pattern without losing the beat'],
  templates: [PATTERN_BY_ID.block, PATTERN_BY_ID['oom-pah'], PATTERN_BY_ID.rising],
  progression: I_V_vi_IV,
  bpm: 72,
  repeats: 2,
};

export const ARPEGGIO_COORDINATION_34: PatternPayload = {
  type: 'pattern',
  title: 'Coordination exercises in 3/4',
  subtitle: 'Waltz time: oom-pah-pah, rising 1-3-5, open 1-5-8',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6C',
  objectives: ['Feel three beats in a bar in the left hand', 'Play the waltz bass that carries slow film songs'],
  templates: [PATTERN_BY_ID.waltz, PATTERN_BY_ID['rising-3'], PATTERN_BY_ID['open-158']],
  progression: I_vi_IV_V,
  bpm: 84,
  repeats: 2,
};

export const FOUR_STEP_PROCESS: ConceptPayload = {
  type: 'concept',
  title: 'Four-step process to play songs with arpeggios',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6D',
  objectives: ['Turn any chord chart into a left-hand arpeggio part', 'Know the order: chords, roots, pattern, melody'],
  cards: [
    {
      title: '1. Get the chords',
      body: 'Write the chord for every bar. Level 8 teaches you to find them by ear; until then use a chord chart or the one the app shows for imported songs.',
    },
    {
      title: '2. Play the roots in time',
      body: 'Left hand, one root per bar, with the metronome. Boring and essential: it proves you can change on the beat before the pattern makes it harder.',
    },
    {
      title: '3. Replace each root with the pattern',
      body:
        'Pick one pattern from the library and play it on every chord. Do not mix patterns yet. The hand shape stays; only the root moves.\n\nIf a change is late, slow the tempo. The pattern lessons let you go down to 35%.',
    },
    {
      title: '4. Add the melody on top',
      body:
        'Right hand plays the tune while the left hand keeps the pattern. Start by holding just the chord in the right hand, as the pattern lessons do in Step 3; then replace it with the real melody from My Songs.',
    },
  ],
};

export const SEVEN_PATTERNS_44: PatternPayload = {
  type: 'pattern',
  title: 'Seven universal 4/4 patterns',
  subtitle: 'The library. Pick any pattern; it runs over C G Am F.',
  track: 'chords',
  durationMinutes: 15,
  source: 'course 6E',
  objectives: ['Play all seven patterns over the same progression', 'Hear how the pattern, not the chords, sets the mood', 'Transpose a pattern into another key'],
  templates: PATTERNS_44,
  progression: I_V_vi_IV,
  bpm: 76,
  repeats: 2,
  allowTranspose: true,
};

export const EXCEPTIONAL_PATTERNS: PatternPayload = {
  type: 'pattern',
  title: 'Exceptional patterns',
  subtitle: 'Pedal octave, open tenth, rolling: wider hand, bigger sound',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6F',
  objectives: ['Reach an octave and a tenth in the left hand without tension', 'Use a pedal note to anchor a moving pattern'],
  templates: PATTERNS_EXCEPTIONAL,
  progression: I_vi_IV_V,
  bpm: 66,
  repeats: 2,
  allowTranspose: true,
};

export const FOUR_PATTERNS_34: PatternPayload = {
  type: 'pattern',
  title: 'Four universal 3/4 patterns',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6G',
  objectives: ['Play all four waltz patterns over C Am F G', 'Keep the first beat heavier than the other two'],
  templates: PATTERNS_34,
  progression: I_vi_IV_V,
  bpm: 88,
  repeats: 2,
  allowTranspose: true,
};

export const IDENTIFY_THE_PATTERN: ConceptPayload = {
  type: 'concept',
  title: 'Identify the pattern in your favourite song',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 6H',
  objectives: ['Listen for the left hand in a recording', 'Match what you hear to a library pattern', 'Check your guess against an imported MIDI file'],
  cards: [
    {
      title: 'Listen below the singer',
      body:
        'Play the song and ignore the voice. Find the lowest instrument that moves with the chords: piano left hand, guitar bass strings, or the bass itself.\n\nCount along. Does it play once per bar (block or root), on every beat (oom-pah, rising), or twice per beat (Alberti, ballad, wave)?',
    },
    {
      title: 'Up, down, or back and forth?',
      body:
        'Three questions place almost any pattern in the library. Does the line climb and stop (rising), climb and return (wave, flowing), or bounce between two notes (Alberti, pedal octave)? Does the first beat have one note or the whole chord? Is the bar in three or four?',
    },
    {
      title: 'Check with My Songs',
      body:
        'Drop a MIDI file of the song into My Songs. The app separates the hands and shows the left-hand part as falling notes. Compare its shape with the patterns from the last three lessons; most songs use one of them, sometimes two.',
    },
  ],
};

export const BUILD_YOUR_OWN_PATTERN: PatternPayload = {
  type: 'pattern',
  title: 'Build your own pattern',
  subtitle: 'Place chord tones on the grid, then play it over the loop',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 6I',
  objectives: ['Design a one-bar left-hand pattern from chord tones', 'Hear it over a progression and refine it'],
  templates: [PATTERN_BY_ID.rising],
  progression: I_V_vi_IV,
  bpm: 76,
  repeats: 2,
  editor: true,
  allowTranspose: true,
};

export const IMPROVISE_WITH_ARPEGGIOS: ConceptPayload = {
  type: 'concept',
  title: 'How to improvise with arpeggios',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 6J',
  objectives: ['Use chord tones as safe notes for the right hand', 'Know the three ways to leave a pattern and come back'],
  cards: [
    {
      title: 'Chord tones are always right',
      body:
        'Over any chord, its own notes cannot sound wrong. While the left hand plays a pattern, the right hand can play the same chord tones in any order, any rhythm. That is improvisation, level one.',
      highlight: { midis: [K.C4, K.E4, K.G4, K.C5], labels: { [K.C4]: '1', [K.E4]: '3', [K.G4]: '5', [K.C5]: '8' } },
    },
    {
      title: 'Three ways to vary',
      body:
        'Change the order: 1-5-3-8 instead of 1-3-5-8. Change the rhythm: hold one note, hurry two. Skip a note: leave a gap where the pattern expects a note. Each variation keeps the chord and the beat, so it always resolves.',
    },
    {
      title: 'Then add the scale',
      body:
        'Between chord tones, pass through the scale notes of the key: C D E, not just C E. Scale notes on the beat are spicy; scale notes between beats are smooth. Start smooth.\n\nOpen Seven universal patterns, pick the wave, and try this over it with your right hand.',
    },
  ],
};
