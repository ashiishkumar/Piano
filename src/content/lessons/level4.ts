import { chordMidis } from '../../engine/theory';
import { ChordDrillPayload, ConceptPayload, K, KeyboardTaskPayload, PC } from './types';

const C = chordMidis(K.C4, 'major');
const AM = chordMidis(K.A3, 'minor');
const F_INV2 = chordMidis(K.F3, 'major', 2); // C F A
const G_INV1 = chordMidis(K.G3, 'major', 1); // B D G

export const HOW_TO_SHIFT_CHORDS: ConceptPayload = {
  type: 'concept',
  title: 'How to shift chords: common tones, minimal movement',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4A',
  objectives: ['Find the notes two chords share and keep those fingers down', 'Use inversions so the hand barely moves', 'Change C to Am, F and G without jumping'],
  cards: [
    {
      title: 'Most chord changes are one finger',
      body:
        'C major is C E G. A minor is A C E. Two of the three notes are the same. If you play C major and then move only your thumb... no, only the top finger down from G to A, you have A minor.\n\nBeginners lift the whole hand and land again. Players move one finger.',
      highlight: { midis: [...C, K.A3], labels: { [K.C4]: 'C', [K.E4]: 'E', [K.G4]: 'G', [K.A3]: 'A' } },
      tryIt: { prompt: 'Hold C major: C E G together.', targetMidis: C, together: true },
    },
    {
      title: 'C to A minor',
      body: 'Keep C and E down. Drop the G to the A below your thumb... or, easier: keep C and E, and add A with your little finger below while releasing G. Either way, two notes never move.',
      highlight: { midis: AM, labels: { [K.A3]: 'A', [K.C4]: 'C', [K.E4]: 'E' } },
      tryIt: { prompt: 'Now hold A minor: A C E.', targetMidis: AM, together: true },
    },
    {
      title: 'C to F, without jumping',
      body:
        'F major in root position is F A C, a long way from C E G. But F major in second inversion is C F A: the thumb stays on C, and the other two fingers move up one key each.\n\nThat is why inversions exist. Not for theory: for your hand.',
      highlight: { midis: F_INV2, labels: { [K.C4]: 'C', [K.F4]: 'F', [K.A4]: 'A' } },
      tryIt: { prompt: 'Hold F major as C F A.', targetMidis: F_INV2, together: true },
    },
    {
      title: 'C to G, the other way',
      body: 'G major in first inversion is B D G. From C E G, the top finger stays on G and the other two step down one key each.\n\nC, Am, F, G: four chords, and your hand never travels more than one key.',
      highlight: { midis: G_INV1, labels: { [K.B3]: 'B', [K.D4]: 'D', [K.G4]: 'G' } },
      tryIt: { prompt: 'Hold G major as B D G.', targetMidis: G_INV1, together: true },
    },
    {
      title: 'Look before you move',
      body:
        'Before every change, name the notes that stay. Then move the rest. In the next lessons the drill times you; the fastest players are not the ones with fast hands, they are the ones who move the fewest fingers.',
    },
  ],
};

export const CHORD_SHIFT_TEST_1: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chord shifting test 1',
  subtitle: 'C F G C · Am F G C, as fast as you can change cleanly',
  track: 'chords',
  durationMinutes: 5,
  source: 'course 4B',
  objectives: ['Change between C, F, G and Am in under 1.5 seconds', 'Move only the fingers that need to move'],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
  ],
  mode: 'timed',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 1500,
  repeats: 2,
  passScore: 70,
};

export const CHORD_SHIFT_TEST_2: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chord shifting test 2',
  subtitle: 'G D Em C · Am Em F C · Dm G C Am, under 1.2 seconds',
  track: 'chords',
  durationMinutes: 6,
  source: 'course 4C',
  objectives: ['Add D, Em and Dm to the chords you can reach without looking', 'Change in under 1.2 seconds, in any inversion'],
  sequence: [
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.D, quality: 'major' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.D, quality: 'minor' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
  ],
  mode: 'timed',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 1200,
  repeats: 1,
  passScore: 70,
};

export const FIVE_CHANGE_EXERCISES: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Five exercises for changing chords',
  subtitle: 'Two chords at a time, back and forth, until the change is a reflex',
  track: 'chords',
  durationMinutes: 10,
  source: 'course 4D',
  objectives: ['Make each of the five most common changes automatic', 'Keep the common tone down during every change'],
  sequence: [
    // 1. C–F
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    // 2. C–G
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    // 3. F–G
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    // 4. C–Am
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    // 5. Am–F–G–C
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 2000,
  repeats: 1,
};

export const CHORDS_ON_THE_BEAT: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chords on the beat',
  subtitle: 'C F G C every four beats at 60, then Am F C G',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4E',
  objectives: ['Land each chord on beat 1, not after it', 'Prepare the next chord during beats 3 and 4'],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
  ],
  mode: 'metronome',
  bpm: 60,
  beatsPerChord: 4,
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  repeats: 2,
};

export const ADVANCED_CHORDS_IN_CONTEXT: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Advanced chords in context: 7ths and slash chords',
  subtitle: 'Cmaj7 Am7 Dm7 G7, then C/E F/A G/B C',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4I',
  objectives: ['Add the seventh to the four chords you already know', 'Read a slash chord: the letter after the slash is the lowest note', 'Hear how a bass note changes a chord without changing its name'],
  sequence: [
    { rootPc: PC.C, quality: 'maj7' },
    { rootPc: PC.A, quality: 'min7' },
    { rootPc: PC.D, quality: 'min7' },
    { rootPc: PC.G, quality: 'dom7' },
    { rootPc: PC.C, quality: 'major', inversion: 1, label: 'C/E' },
    { rootPc: PC.F, quality: 'major', inversion: 1, label: 'F/A' },
    { rootPc: PC.G, quality: 'major', inversion: 1, label: 'G/B' },
    { rootPc: PC.C, quality: 'major' },
  ],
  mode: 'free',
  match: { allowInversion: false, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 4000,
  repeats: 1,
};

export const SMART_CHORD_AND_ACMP: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Smart Chord, Multi Finger, ACMP and SYNC START',
  subtitle: 'Let the keyboard play the band',
  track: 'keyboard',
  durationMinutes: 10,
  source: 'course 9D, spec sheet',
  objectives: ['Start a style from a left-hand chord', 'Change the chord the band follows', 'End a style with a proper ending'],
  steps: [
    {
      instruction: 'Press STYLE, then type 001 on the number buttons. The display shows the style name.',
      panelButton: 'STYLE',
      explanation: 'There are 205 styles: pop, rock, Latin, Indian, waltz. Any of them works for this lesson.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press ACMP ON/OFF so its light comes on.',
      panelButton: 'ACMP_ON_OFF',
      explanation:
        'ACMP is the accompaniment. With it on, the keys to the left of the split point stop playing a voice and start telling the band which chord to play. In Smart Chord mode one finger is enough; in Multi Finger mode you play the full chord.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press SYNC START. Then play a C with your left hand, below the split point.',
      panelButton: 'SYNC_START',
      explanation: 'The band waits for your first chord and starts on it. Over the cable we see drums and bass arrive on their own channels, which is how we know it is running.',
      verify: { kind: 'style-running' },
    },
    {
      instruction: 'While it plays, change the chord: F, then G, then back to C. Watch the display name each chord.',
      explanation: 'This is accompaniment. The right hand is free for the melody; the left hand just has to be in the right place on the beat.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press MAIN/AUTO FILL once. Hear the drum fill and the change to the second pattern.',
      panelButton: 'MAIN_AUTO_FILL',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press INTRO/ENDING/rit. The band plays an ending and stops.',
      panelButton: 'INTRO_ENDING',
      verify: { kind: 'style-stopped' },
    },
    {
      instruction: 'Press ACMP ON/OFF again to turn the accompaniment off, so your left hand plays notes again.',
      panelButton: 'ACMP_ON_OFF',
      verify: { kind: 'manual' },
    },
  ],
};

export const BUILT_IN_CHORD_SONGS: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Built-in Chord Study and Chord Progression songs',
  subtitle: 'Forty-two practice songs already inside the keyboard',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'spec sheet',
  objectives: ['Find the 12 Chord Study and 30 Chord Progression songs', 'Play along with one using the built-in Waiting lesson mode', 'Know when to use the keyboard\'s teacher and when to use this app'],
  steps: [
    {
      instruction: 'Press SONG. Use the number buttons or +/− to reach the Chord Study songs. The display shows each song\'s name.',
      panelButton: 'SONG',
      explanation: 'The 154 preset songs include 12 Chord Study songs (simple chord changes) and 30 Chord Progression songs (common loops). The Owner\'s Manual lists their numbers.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press START/STOP to hear the song. Listen for where the chords change, then press START/STOP again.',
      panelButton: 'START_STOP',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Press the LESSON 3 (Waiting) button, then START/STOP. The song now waits for you to play the right chord before it moves on. Play along for a few bars.',
      panelButton: 'LESSON_WAITING',
      explanation: 'This is the keyboard\'s own version of Wait-for-Me. Use it when you are away from the computer. This app adds the scoring, the loop and the report.',
      verify: { kind: 'any-note' },
    },
    {
      instruction: 'Press START/STOP to stop, then press PORTABLE GRAND to return to a plain piano.',
      panelButton: 'PORTABLE_GRAND',
      verify: { kind: 'program-change' },
    },
  ],
};

/**
 * The chord loops behind most film and pop songs. The loops are common property;
 * the melodies are not, so the songs are named as examples of what is commonly
 * played over each loop and learners bring the melody in through My Songs.
 */
export const CHORD_LOOPS_BEHIND_SONGS: ConceptPayload = {
  type: 'concept',
  title: 'The chord loops behind popular songs',
  subtitle: 'Four loops carry most of what you hear',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4H, 8E',
  objectives: ['Recognise the four loops that most film and pop songs sit on', 'Hold the first chord of each loop in C', 'Know how to bring any song\'s melody into My Songs'],
  cards: [
    {
      title: 'Songs are loops',
      body:
        'Most popular songs, in Hindi or English, sit on four chords repeating in a loop. The melody changes; the loop does not. Learn the loop and you can accompany the song, play it for a singer, or improvise over it.\n\nRoman numerals name chords by their place in the key, so one loop works in every key: I is the home chord, V the fifth, vi the relative minor, IV the fourth.',
    },
    {
      title: 'I – V – vi – IV',
      body:
        'In C: C G Am F. The most used loop in pop of the last thirty years. Kal Ho Naa Ho is commonly played over it, and so are hundreds of English songs.\n\nIt starts at home, lifts, turns sad for one bar, and comes back ready to repeat.',
      highlight: { midis: C, labels: { [K.C4]: 'C', [K.E4]: 'E', [K.G4]: 'G' } },
      tryIt: { prompt: 'Hold the first chord, C major.', targetMidis: C, together: true },
    },
    {
      title: 'vi – IV – I – V',
      body:
        'The same four chords starting on the minor: Am F C G. Tum Hi Ho is commonly played over this loop, in its own key. Starting on the minor makes the whole song feel like a question.\n\nSame chords as the loop before. Same fingers. A different first bar.',
      highlight: { midis: AM, labels: { [K.A3]: 'A', [K.C4]: 'C', [K.E4]: 'E' } },
      tryIt: { prompt: 'Hold the first chord, A minor.', targetMidis: AM, together: true },
    },
    {
      title: 'I – vi – IV – V',
      body:
        'C Am F G: the "fifties" loop, behind Stand By Me and a thousand slow dances, and behind most of the slow Bollywood ballads of the sixties and seventies. You already played its left hand in Advanced chord coordination.',
      highlight: { midis: C, labels: { [K.C4]: 'C', [K.E4]: 'E', [K.G4]: 'G' } },
    },
    {
      title: 'I – IV – V',
      body:
        'C F G, three chords only. Folk songs, bhajans, qawwali, the blues, Twinkle Twinkle, Happy Birthday. If a song sounds simple and bright, try these three first.\n\nThe next lesson plays all four loops on the beat.',
      highlight: { midis: F_INV2, labels: { [K.C4]: 'C', [K.F4]: 'F', [K.A4]: 'A' } },
      tryIt: { prompt: 'Hold F major as C F A, ready to change from C.', targetMidis: F_INV2, together: true },
    },
    {
      title: 'Your songs',
      body:
        'Melodies of film songs are owned by their composers, so this app does not ship them. It does not need to. Find a MIDI file of the song, drop it into My Songs, and the app separates the hands, estimates the fingering and arranges it for your level.\n\nIn Level 8 you will learn to work out a song\'s key and loop by ear, so you can accompany anything you can hum.',
    },
  ],
};

export const FOUR_LOOPS_ON_THE_BEAT: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Four loops on the beat',
  subtitle: 'I–V–vi–IV · vi–IV–I–V · I–vi–IV–V · I–IV–V, in C at 70',
  track: 'chords',
  durationMinutes: 8,
  source: 'course 4H',
  objectives: ['Play the four common loops with a steady change every four beats', 'Feel how the same four chords make different songs depending on where the loop starts'],
  sequence: [
    // I–V–vi–IV
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    // vi–IV–I–V
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    // I–vi–IV–V
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    // I–IV–V–I
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.C, quality: 'major' },
  ],
  mode: 'metronome',
  bpm: 70,
  beatsPerChord: 4,
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  repeats: 1,
};
