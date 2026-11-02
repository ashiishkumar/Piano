import { KeyboardTaskPayload } from './types';

export const DUAL_SPLIT_RHYTHM: KeyboardTaskPayload = {
  type: 'keyboard-task',
  title: 'Dual, Split, and rhythm tracks',
  subtitle: 'Verified over the cable',
  track: 'keyboard',
  durationMinutes: 10,
  source: 'course 9D',
  objectives: ['Layer two voices with Dual', 'Give the left hand its own voice with Split', 'Play against a rhythm track without a backing band'],
  steps: [
    {
      instruction: 'Press DUAL so it lights, then play one key.',
      panelButton: 'DUAL',
      explanation:
        'You hear two voices on one key: the main voice and a second one, usually strings. Over the cable the same note arrives on two channels at once, which is how the app knows Dual is on.',
      verify: { kind: 'dual' },
    },
    {
      instruction: 'Press DUAL again to turn it off. Press SPLIT, then play a low key and a high key.',
      panelButton: 'SPLIT',
      explanation:
        'Below the split point (F♯2 unless you change it) the keyboard plays a different voice, usually a bass. The two zones arrive on different channels.',
      verify: { kind: 'split' },
    },
    {
      instruction: 'Press SPLIT again to turn it off. Make sure ACMP is off, then press START/STOP.',
      panelButton: 'START_STOP',
      explanation: 'With ACMP off, a style plays drums only: a rhythm track. Good for practising in time without a band deciding your chords.',
      verify: { kind: 'style-running' },
    },
    {
      instruction: 'Play Sa Re Ga Ma Pa along with the drums for a bar or two, then press START/STOP to stop.',
      panelButton: 'START_STOP',
      verify: { kind: 'style-stopped' },
    },
  ],
};
