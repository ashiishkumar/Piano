import { scaleMidis } from '../../engine/theory';
import { ChordDrillPayload, ConceptPayload, K, PC, QuizPayload, labels } from './types';

const DEGREES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const STEPS = ['W', 'W', 'H', 'W', 'W', 'W', 'H'];

const C_MAJOR = scaleMidis(K.C4, 'major');
const G_MAJOR = scaleMidis(K.G4, 'major');
const D_MAJOR = scaleMidis(K.D4, 'major');

export const MAJOR_SCALE_FORMULA: ConceptPayload = {
  type: 'concept',
  title: 'Major scale formula: W W H W W W H',
  subtitle: 'In all 12 keys',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 3A',
  objectives: ['Tell a half step from a whole step on the keys', 'Build a major scale from any key with one formula', 'Play C, G and D major ascending'],
  cards: [
    {
      title: 'Two sizes of step',
      body:
        'A half step is the very next key, black or white. C to C♯ is a half step; E to F is a half step too, because there is no black key between them.\n\nA whole step skips one key: C to D, or E to F♯.',
      highlight: { midis: [K.C4, K.Cs4, K.D4], labels: { [K.C4]: 'C', [K.Cs4]: 'H', [K.D4]: 'W' } },
    },
    {
      title: 'The formula',
      body:
        'Every major scale is the same ladder of steps: Whole, Whole, Half, Whole, Whole, Whole, Half.\n\nStart on C and climb that ladder and you land only on white keys. That is why C major is the first scale everyone learns: not because it is special, but because it hides the formula.',
      highlight: { midis: C_MAJOR, labels: labels(C_MAJOR, DEGREES) },
      tryIt: { prompt: 'Play C major ascending, one key at a time.', targetMidis: C_MAJOR },
    },
    {
      title: 'The same ladder from G',
      body:
        'Start on G and climb W W H W W W H. The seventh step lands on F♯, a black key. One sharp.\n\nThe fingering is the same as C major: 1 2 3, then 1 2 3 4 5.',
      highlight: { midis: G_MAJOR, labels: labels(G_MAJOR, STEPS.concat('')) },
      tryIt: { prompt: 'Play G major ascending.', targetMidis: G_MAJOR },
    },
    {
      title: 'And from D',
      body: 'From D the ladder crosses two black keys: F♯ and C♯. Two sharps.\n\nEvery key you start on gives a scale with its own black keys, but the ladder never changes.',
      highlight: { midis: D_MAJOR, labels: labels(D_MAJOR, DEGREES) },
      tryIt: { prompt: 'Play D major ascending.', targetMidis: D_MAJOR },
    },
    {
      title: 'In Sargam',
      body:
        'Sa Re Ga Ma Pa Dha Ni Sa is this ladder, whatever key Sa sits on. Shuddha (natural) Re Ga Dha Ni are the whole steps; Ma and the upper Sa are a half step above Ga and Ni.\n\nThat is the Bilawal thaat, the parent scale of hundreds of ragas and most film songs.',
      highlight: { midis: C_MAJOR, labels: labels(C_MAJOR, ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa']) },
    },
  ],
};

export const CIRCLE_OF_FIFTHS: ConceptPayload = {
  type: 'concept',
  title: 'Circle of fifths',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 3A',
  objectives: ['Count a fifth on the keyboard', 'Read how many sharps or flats a key has from the circle', 'See where the relative minors live'],
  cards: [
    {
      title: 'A fifth is five letter names',
      body: 'From C count five white keys: C D E F G. C to G is a fifth. It is the most stable distance in music; it is also the gap between Sa and Pa.',
      highlight: { midis: [K.C4, K.D4, K.E4, K.F4, K.G4], labels: { [K.C4]: '1', [K.D4]: '2', [K.E4]: '3', [K.F4]: '4', [K.G4]: '5' } },
      tryIt: { prompt: 'Play C, then G.', targetMidis: [K.C4, K.G4] },
    },
    {
      title: 'Go up a fifth, add a sharp',
      body:
        'Arrange the twelve keys so that each one is a fifth above the last and you get a circle. Clockwise from C: G has one sharp, D has two, A three, E four, B five.\n\nAnticlockwise from C: F has one flat, B♭ two, E♭ three, and so on. Twelve steps bring you home.',
      diagram: 'circle-of-fifths',
    },
    {
      title: 'The minors ride inside',
      body:
        'Each major key has a relative minor that uses exactly the same notes. It sits on the inner ring: A minor inside C major, E minor inside G major.\n\nFind the relative minor by going down three half steps from the major root: C down to A.',
      diagram: 'circle-of-fifths',
      highlight: { midis: [K.A3, K.C4], labels: { [K.A3]: 'Am', [K.C4]: 'C' } },
    },
    {
      title: 'Why it matters',
      body:
        'Neighbours on the circle share six of their seven notes, so songs move between them easily. Most Bollywood and pop songs live on three or four neighbouring keys of this circle.\n\nIn Level 8 you will use it to find the key of any song you hear.',
      diagram: 'circle-of-fifths',
    },
  ],
};

export const BUILDING_TRIADS: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Building triads from scale degrees',
  subtitle: 'Root, third, fifth: every other note',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 3C',
  objectives: ['Build a triad by taking every other note of the scale', 'Hold C, Dm, Em, F, G and Am cleanly', 'Hear that some come out major and some minor'],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.D, quality: 'minor' },
    { rootPc: PC.E, quality: 'minor' },
    { rootPc: PC.F, quality: 'major' },
    { rootPc: PC.G, quality: 'major' },
    { rootPc: PC.A, quality: 'minor' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 4000,
  repeats: 1,
};

const A_MINOR = scaleMidis(K.A3, 'natural-minor');
const E_MINOR = scaleMidis(K.E4, 'natural-minor');
const D_MINOR = scaleMidis(K.D4, 'natural-minor');
const A_HARMONIC = scaleMidis(K.A3, 'harmonic-minor');
const C_PENTATONIC = scaleMidis(K.C4, 'major-pentatonic');
const A_MINOR_PENTATONIC = scaleMidis(K.A3, 'minor-pentatonic');
const C_BLUES = scaleMidis(K.C4, 'blues');

export const NATURAL_MINOR_FORMULA: ConceptPayload = {
  type: 'concept',
  title: 'Natural minor formula',
  subtitle: 'W H W W H W W',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 3B',
  objectives: ['Build a natural minor scale from any key with its own formula', 'Hear why minor sounds darker: the third step is a half step closer', 'Play A, E and D minor'],
  cards: [
    {
      title: 'Start the ladder somewhere else',
      body:
        'A minor uses exactly the white keys of C major, but starts on A. Walking A to A gives a new ladder of steps: Whole, Half, Whole, Whole, Half, Whole, Whole.\n\nThat is the natural minor formula. Same seven notes, different home, different mood.',
      highlight: { midis: A_MINOR, labels: labels(A_MINOR, DEGREES) },
      tryIt: { prompt: 'Play A minor ascending, from A below Middle C.', targetMidis: A_MINOR },
    },
    {
      title: 'Why it sounds darker',
      body:
        'In a major scale the third note is four half steps above home. In minor it is three. That one half step is most of the difference between a bright song and a sad one.\n\nIn Sargam: shuddha Ga against komal Ga.',
      highlight: { midis: [K.A3, K.C4, K.Cs4], labels: { [K.A3]: 'Sa', [K.C4]: 'ga', [K.Cs4]: 'Ga' } },
    },
    {
      title: 'The same ladder from E',
      body: 'From E the formula crosses one black key, F♯. E minor shares its notes with G major, its relative major.',
      highlight: { midis: E_MINOR, labels: labels(E_MINOR, DEGREES) },
      tryIt: { prompt: 'Play E minor ascending.', targetMidis: E_MINOR },
    },
    {
      title: 'And from D',
      body: 'From D the formula needs B♭. D minor shares its notes with F major.\n\nThis is the Asavari thaat: komal Ga, komal Dha, komal Ni.',
      highlight: { midis: D_MINOR, labels: labels(D_MINOR, ['Sa', 'Re', 'ga', 'Ma', 'Pa', 'dha', 'ni', 'Sa']) },
      tryIt: { prompt: 'Play D minor ascending.', targetMidis: D_MINOR },
    },
  ],
};

export const CHORD_TYPES: ChordDrillPayload = {
  type: 'chord-drill',
  title: 'Chord types: Maj7, Dom7, Aug, Dim, Sus',
  subtitle: 'Six colours on one root, then the three sevenths that run every song',
  track: 'theory',
  durationMinutes: 10,
  source: 'course 3E',
  objectives: [
    'Hear and hold Cmaj7, C7, Caug, Cdim, Csus4 and Csus2',
    'Know which note changes each time: the seventh, the fifth, the third',
    'Use the PSR-E373 Chord Dictionary to check any chord you are unsure of',
  ],
  sequence: [
    { rootPc: PC.C, quality: 'major' },
    { rootPc: PC.C, quality: 'maj7' },
    { rootPc: PC.C, quality: 'dom7' },
    { rootPc: PC.C, quality: 'aug' },
    { rootPc: PC.C, quality: 'dim' },
    { rootPc: PC.C, quality: 'sus4' },
    { rootPc: PC.C, quality: 'sus2' },
    { rootPc: PC.F, quality: 'maj7' },
    { rootPc: PC.G, quality: 'dom7' },
    { rootPc: PC.D, quality: 'min7' },
  ],
  mode: 'free',
  match: { allowInversion: true, allowOctaveShift: true, allowDoubling: true },
  targetTransitionMs: 5000,
  repeats: 1,
};

export const SCALE_TYPES: ConceptPayload = {
  type: 'concept',
  title: 'Scale types: harmonic and melodic minor, pentatonic, blues',
  track: 'theory',
  durationMinutes: 8,
  source: 'course 3F',
  objectives: ['Hear what raising the seventh does to a minor scale', 'Play the five-note scales behind most folk and film melodies', 'Know the blues scale by its one extra note'],
  cards: [
    {
      title: 'Harmonic minor: raise the seventh',
      body:
        'Natural minor has a soft ending: the seventh note is a whole step below home, so it does not pull you back. Raise it a half step and the pull returns. That is harmonic minor.\n\nOn A: A B C D E F G♯ A. The jump from F to G♯ is what gives it the Middle Eastern or classical-Indian colour you may recognise.',
      highlight: { midis: A_HARMONIC, labels: labels(A_HARMONIC, DEGREES) },
      tryIt: { prompt: 'Play A harmonic minor ascending.', targetMidis: A_HARMONIC },
    },
    {
      title: 'Melodic minor: smooth the jump',
      body:
        'Raising only the seventh leaves an awkward leap from the sixth. Raise the sixth too and the climb is smooth: A B C D E F♯ G♯ A.\n\nClassical players use it going up and natural minor coming down. You will meet it in Level 10 repertoire; for now, just hear it.',
      highlight: { midis: scaleMidis(K.A3, 'melodic-minor'), labels: labels(scaleMidis(K.A3, 'melodic-minor'), DEGREES) },
    },
    {
      title: 'Pentatonic: five notes, no wrong ones',
      body:
        'Drop the fourth and seventh from a major scale and you get the major pentatonic: Sa Re Ga Pa Dha. It is Raag Bhupali, and the scale of countless folk tunes on every continent.\n\nAny note of it sounds right over its chord. That is why improvising starts here.',
      highlight: { midis: C_PENTATONIC, labels: labels(C_PENTATONIC, ['Sa', 'Re', 'Ga', 'Pa', 'Dha', 'Sa']) },
      tryIt: { prompt: 'Play the major pentatonic from Middle C, up to the next C.', targetMidis: C_PENTATONIC },
    },
    {
      title: 'Minor pentatonic and blues',
      body:
        'Start the same five notes from A and you have the minor pentatonic: A C D E G. Add one note, the flattened fifth (E♭ on A, F♯ on C), and it becomes the blues scale.\n\nThat one extra note is the whole attitude of the blues.',
      highlight: { midis: A_MINOR_PENTATONIC, labels: labels(A_MINOR_PENTATONIC, ['1', '♭3', '4', '5', '♭7', '1']) },
    },
    {
      title: 'The blues scale on C',
      body: 'C E♭ F F♯ G B♭ C. Play it slowly and listen for the F♯ leaning into G.',
      highlight: { midis: C_BLUES, labels: labels(C_BLUES, ['1', '♭3', '4', '♭5', '5', '♭7', '1']) },
      tryIt: { prompt: 'Play the blues scale from Middle C.', targetMidis: C_BLUES },
    },
  ],
};

export const RELATIVE_KEYS_QUIZ: QuizPayload = {
  type: 'quiz',
  title: 'Relative major and minor',
  track: 'theory',
  durationMinutes: 5,
  source: 'course 3G',
  objectives: ['Name the relative minor of a major key and back', 'Find it on the keys: three half steps down'],
  questions: [
    {
      prompt: 'What is the relative minor of C major?',
      kind: 'choice',
      choices: ['A minor', 'E minor', 'D minor', 'G minor'],
      answerIndex: 0,
      explanation: 'Three half steps below C is A. A minor uses the same seven notes as C major.',
    },
    {
      prompt: 'How many half steps below the major root is the relative minor root?',
      kind: 'choice',
      choices: ['2', '3', '4', '5'],
      answerIndex: 1,
      explanation: 'Always three: a minor third. C down to A, G down to E, F down to D.',
    },
    {
      prompt: 'Press the root of the relative minor of F major.',
      kind: 'press-key',
      answerMidis: [K.D4],
      anyOctave: true,
      explanation: 'F down three half steps: E, E♭, D. The relative minor of F major is D minor.',
    },
    {
      prompt: 'What is the relative major of E minor?',
      kind: 'choice',
      choices: ['C major', 'D major', 'G major', 'B major'],
      answerIndex: 2,
      explanation: 'Up three half steps from E: F, F♯, G. E minor and G major share the same notes, including F♯.',
    },
    {
      prompt: 'Hold the relative minor chord of C major.',
      kind: 'press-chord',
      answerMidis: [K.A3, K.C4, K.E4],
      anyOctave: true,
      explanation: 'A minor: A, C, E. Any octave or inversion counts.',
    },
    {
      prompt: 'Which pair shares exactly the same seven notes?',
      kind: 'choice',
      choices: ['C major and C minor', 'G major and E minor', 'D major and D minor', 'F major and A minor'],
      answerIndex: 1,
      explanation: 'Relative keys share notes; parallel keys (C major and C minor) share only the root.',
    },
  ],
};
