import { ConceptPayload, K, KeyboardTaskPayload, allOfClass, labels } from './types';

const SARGAM = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
const WHITE_C4_B4 = [K.C4, K.D4, K.E4, K.F4, K.G4, K.A4, K.B4];

export const MEET_YOUR_KEYBOARD: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Meet your PSR-E373',
  subtitle: 'Power, volume, Portable Grand, headphones, USB TO HOST',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'spec sheet',
  objectives: [
    'Switch on, set the volume, and reset to a piano sound in one press',
    'Connect the keyboard to this computer so the app can hear you',
    'Know where the headphone and pedal sockets are',
  ],
  steps: [
    {
      instruction: 'Hold the power button for about a second until the display lights up.',
      panelButton: 'STANDBY_ON',
      explanation: 'The keyboard switches itself off after 30 minutes of silence. You can change that later in FUNCTION.',
      verify: { kind: 'manual' },
    },
    {
      instruction:
        'Plug the USB cable into the USB TO HOST socket on the back and into this computer. Then press any key. The keyboard chip at the top of the screen turns green when we hear you.',
      panelButton: 'USB_TO_HOST',
      explanation: 'One cable carries both the notes you play and, if you want it, the keyboard\'s own sound.',
      verify: { kind: 'any-note' },
    },
    {
      instruction: 'Press PORTABLE GRAND.',
      panelButton: 'PORTABLE_GRAND',
      explanation:
        'That one button resets everything to a grand piano: voice 001, no layers, no styles. Whenever the keyboard sounds strange, press it. Over the cable it arrives as a "voice change" message, which is how we know you pressed it.',
      verify: { kind: 'program-change' },
    },
    {
      instruction: 'Turn MASTER VOLUME to about half way and play a few keys, soft and loud.',
      panelButton: 'MASTER_VOLUME',
      verify: { kind: 'any-note' },
    },
    {
      instruction: 'Press METRONOME to hear the click. Press it again to stop it.',
      panelButton: 'METRONOME',
      explanation: 'The metronome does not travel over the cable, so this one is on trust. You will use it a lot in Level 2.',
      verify: { kind: 'manual' },
    },
    {
      instruction: 'Find the PHONES/OUTPUT and SUSTAIN sockets on the back panel.',
      panelButton: 'PHONES_OUTPUT',
      explanation: 'Headphones mute the speakers, so you can practise late. A sustain footswitch goes next to it; you will need one by Level 9.',
      verify: { kind: 'manual' },
    },
  ],
};

export const POSTURE: ConceptPayload = {
  type: 'concept',
  title: 'Posture and hand shape',
  track: 'play',
  durationMinutes: 4,
  source: 'course 2A',
  objectives: ['Sit so your forearms are level with the keys', 'Curve the fingers, relax the wrist, drop the shoulders'],
  cards: [
    {
      title: 'Sit at the middle, a forearm away',
      body:
        'Put the bench or chair in front of Middle C, the C nearest the middle of the keyboard.\n\nSit so that your elbows are a little in front of your body and your forearms are level with the keys. If the keys are higher than your forearms, raise the seat or lower the stand.',
    },
    {
      title: 'Hold an orange',
      body:
        'Rest your right hand on the keys as if a small orange were under your palm. The fingers curve, the fingertips touch the keys, the knuckles make a gentle bridge.\n\nFlat fingers get stuck between keys. Curved fingers find the centre of each key without looking.',
      diagram: 'finger-numbers',
    },
    {
      title: 'Wrist level, shoulders down',
      body:
        'The wrist should be a straight line from the forearm, not drooping below the keys and not hitched up above them.\n\nBefore you start, breathe out and let both shoulders drop. Tension starts there and travels down to the fingers.',
    },
    {
      title: 'Look at the keys now, the screen later',
      body:
        'For the first lessons it is fine to look down at your hand. The app will tell you the next key in words and show it on the small keyboard at the top of the lesson.\n\nAs the five-finger home becomes automatic you will look at the keys less, and that is when the falling notes start to help.',
    },
  ],
};

export const KEYBOARD_MAP: ConceptPayload = {
  type: 'concept',
  title: 'The keyboard map: black-key groups and Middle C',
  track: 'play',
  durationMinutes: 5,
  source: 'existing wizard',
  objectives: ['Find any C and any F by the black-key groups', 'Find Middle C without counting', 'Hear that the same note name repeats every octave'],
  cards: [
    {
      title: 'Sixty-one keys, one pattern',
      body:
        'Your keyboard has 61 keys: 36 white and 25 black. The black keys are not spread evenly. They sit in groups of two and groups of three, and the pattern repeats five times across the keyboard.\n\nThat pattern is the map. Once you can read it, you never have to count keys from the end.',
      highlight: { midis: [K.Cs4, K.Ds4, K.Fs4, K.Gs4, K.As4], colour: 'amber' },
    },
    {
      title: 'C sits just left of the two black keys',
      body: 'Every white key immediately to the left of a group of two black keys is a C. There are six of them on your keyboard.',
      highlight: { midis: allOfClass(0), labels: labels(allOfClass(0), ['C']) },
    },
    {
      title: 'Middle C',
      body:
        'Of those six Cs, the one nearest the middle of the keyboard is Middle C. Musicians write it C4. In this app it is also Sa, the home note of Sargam.\n\nPress it now.',
      highlight: { midis: [K.C4], labels: { [K.C4]: 'C4' } },
      tryIt: { prompt: 'Press Middle C.', targetMidis: [K.C4] },
    },
    {
      title: 'F sits just left of the three black keys',
      body: 'The same trick works for the other group. The white key immediately left of three black keys is always an F.',
      highlight: { midis: allOfClass(5), labels: labels(allOfClass(5), ['F']) },
      tryIt: { prompt: 'Press any F.', targetMidis: [K.F4], anyOctave: true },
    },
    {
      title: 'Same name, higher voice',
      body:
        'Play Middle C, then the next C to the right. It is the same note, one octave higher: the same name, a thinner voice. Every note name repeats like this all the way up the keyboard.',
      highlight: { midis: [K.C4, K.C5], labels: { [K.C4]: 'C4', [K.C5]: 'C5' } },
      tryIt: { prompt: 'Press C4, then C5.', targetMidis: [K.C4, K.C5] },
    },
  ],
};

export const SARGAM_AND_WESTERN: ConceptPayload = {
  type: 'concept',
  title: 'Sargam and Western names',
  subtitle: 'Why both are shown and which to think in',
  track: 'theory',
  durationMinutes: 5,
  source: 'course 2B, 2D',
  objectives: ['Match Sa Re Ga Ma Pa Dha Ni to C D E F G A B', 'Know that Sa can move but starts on C here', 'Play the seven notes in order'],
  cards: [
    {
      title: 'Seven names, seven white keys',
      body:
        'Indian music names the notes Sa, Re, Ga, Ma, Pa, Dha, Ni. Western music names the same seven white keys C, D, E, F, G, A, B.\n\nFrom Middle C upward they line up one to one. The eighth key is Sa again, an octave higher.',
      highlight: { midis: WHITE_C4_B4, labels: labels(WHITE_C4_B4, SARGAM) },
    },
    {
      title: 'Sa can move; C cannot',
      body:
        'Here is the real difference. C is always the same key. Sa is wherever the song starts: a singer picks a comfortable Sa and every other note follows from it.\n\nFor now we fix Sa on C so both systems agree. Later, when you transpose for a singer, Sa moves and you will be glad you learned it this way.',
      highlight: { midis: [K.C4], labels: { [K.C4]: 'Sa = C' } },
    },
    {
      title: 'Which should you think in?',
      body:
        'Think in Sargam for melodies: it tells you the distance from home, which is what your ear hears.\n\nThink in Western names for chords and for reading music: chord symbols and sheet music are written that way everywhere.\n\nThis app shows both until you ask it not to.',
    },
    {
      title: 'Play the seven',
      body: 'Thumb on Sa, then one white key at a time up to Ni, then Sa again.',
      highlight: { midis: [...WHITE_C4_B4, K.C5], labels: labels([...WHITE_C4_B4, K.C5], [...SARGAM, 'Sa']) },
      tryIt: { prompt: 'Play Sa Re Ga Ma Pa Dha Ni Sa, in order.', targetMidis: [...WHITE_C4_B4, K.C5] },
    },
  ],
};

export const TOUCH_RESPONSE: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Touch Response: Soft, Medium, Hard, Fixed',
  subtitle: 'What velocity is; see your own touch on screen',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'course 9A',
  objectives: ['Hear and see that harder keystrokes play louder', 'Find the Touch Response setting in FUNCTION', 'Know why Fixed is useful for one lesson and wrong for the rest'],
  steps: [
    {
      instruction: 'Play eight keys: some as softly as you can, some firmly. Watch the touch meter below.',
      explanation:
        'Each keystroke carries a number from 1 to 127 called velocity. The keyboard uses it to decide how loud to play. This app uses it to score how you shape a melody.',
      verify: { kind: 'touch-response', expect: 'variable' },
    },
    {
      instruction:
        'Press FUNCTION, then use the CATEGORY buttons to reach "TouchRes". Use +/− to set it to Fixed. Press EXIT, then play eight keys again, soft and hard.',
      panelButton: 'FUNCTION',
      explanation: 'Every key now arrives at the same velocity. The meter stops moving: the keyboard has stopped listening to your touch.',
      verify: { kind: 'touch-response', expect: 'fixed' },
    },
    {
      instruction: 'Go back into FUNCTION and set TouchRes to Medium (2). Play eight keys once more.',
      panelButton: 'FUNCTION',
      explanation: 'Medium suits most players. Soft makes it easier to play loud; Hard asks for more force. Leave it on Medium unless your hands tell you otherwise.',
      verify: { kind: 'touch-response', expect: 'variable' },
    },
  ],
};
