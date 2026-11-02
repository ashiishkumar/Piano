import { ConceptPayload, RhythmPayload } from './types';

/**
 * Four bars, one note value per bar: quarter, half, whole, eighth.
 * Tapped on any key, with a one-bar count-in, twice through.
 */
export const NOTE_VALUES: RhythmPayload = {
  type: 'rhythm',
  title: 'Note values: whole, half, quarter, eighth',
  subtitle: 'Tap them on any key',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 2F',
  objectives: ['Count four beats in a bar', 'Tap quarter, half, whole and eighth notes against a click', 'Feel that a half note is two beats of silence after the tap, not two taps'],
  bpm: 70,
  timeSignature: [4, 4],
  pattern: [
    // Bar 1: four quarter notes
    { beat: 0, durationBeats: 1, label: '♩' },
    { beat: 1, durationBeats: 1, label: '♩' },
    { beat: 2, durationBeats: 1, label: '♩' },
    { beat: 3, durationBeats: 1, label: '♩' },
    // Bar 2: two half notes
    { beat: 4, durationBeats: 2, label: '𝅗𝅥' },
    { beat: 6, durationBeats: 2, label: '𝅗𝅥' },
    // Bar 3: one whole note
    { beat: 8, durationBeats: 4, label: '𝅝' },
    // Bar 4: eight eighth notes
    { beat: 12, durationBeats: 0.5, label: '♪' },
    { beat: 12.5, durationBeats: 0.5, label: '♪' },
    { beat: 13, durationBeats: 0.5, label: '♪' },
    { beat: 13.5, durationBeats: 0.5, label: '♪' },
    { beat: 14, durationBeats: 0.5, label: '♪' },
    { beat: 14.5, durationBeats: 0.5, label: '♪' },
    { beat: 15, durationBeats: 0.5, label: '♪' },
    { beat: 15.5, durationBeats: 0.5, label: '♪' },
  ],
  repeats: 2,
  countInBars: 1,
};

/**
 * Steady beats with rests: the gaps are the lesson. 90 BPM, four bars, twice.
 */
export const PLAYING_IN_RHYTHM: RhythmPayload = {
  type: 'rhythm',
  title: 'Playing in rhythm: steady beats and rests',
  subtitle: 'Keep counting through the silence. Set 90 with TEMPO/TAP and press METRONOME to hear it on the keyboard too.',
  track: 'keyboard',
  durationMinutes: 6,
  source: 'course 2G',
  objectives: [
    'Keep a steady pulse at 90 BPM with the click',
    'Leave a rest without losing the count',
    'Use TEMPO/TAP on the keyboard to set 90 and METRONOME to hear it',
  ],
  bpm: 90,
  timeSignature: [4, 4],
  pattern: [
    // Bar 1: all four beats
    { beat: 0, durationBeats: 1, label: '1' },
    { beat: 1, durationBeats: 1, label: '2' },
    { beat: 2, durationBeats: 1, label: '3' },
    { beat: 3, durationBeats: 1, label: '4' },
    // Bar 2: beats 1 and 3 only
    { beat: 4, durationBeats: 1, label: '1' },
    { beat: 6, durationBeats: 1, label: '3' },
    // Bar 3: beats 1, 2 and 4
    { beat: 8, durationBeats: 1, label: '1' },
    { beat: 9, durationBeats: 1, label: '2' },
    { beat: 11, durationBeats: 1, label: '4' },
    // Bar 4: beat 1 only, held
    { beat: 12, durationBeats: 4, label: '1' },
  ],
  repeats: 2,
  countInBars: 1,
};

export const HOW_TO_MASTER_A_SONG: ConceptPayload = {
  type: 'concept',
  title: 'How to master any song',
  subtitle: 'Hands separate, slow, loop the hard bar, full tempo',
  track: 'play',
  durationMinutes: 5,
  source: 'course 2H',
  objectives: ['Know the four-stage method every lesson in this app is built on', 'Know when to move from one stage to the next', 'Use the loop and tempo controls on purpose'],
  cards: [
    {
      title: 'One hand, then the other',
      body:
        'Never start a new song with both hands. Learn the right hand until you can play it without reading, then the left hand on its own, then put them together.\n\nThis is what Step 1, Step 2 and Step 3 do in every song lesson here. Resist skipping to Step 3.',
    },
    {
      title: 'Slow is not a compromise',
      body:
        'Practise at a speed where you make no mistakes, even if that is half tempo. Mistakes practised fast become habits practised fast.\n\nThe tempo control under "More" in a lesson goes down to 35%. Use it. Speed arrives on its own once the movements are correct.',
    },
    {
      title: 'Loop the hard bar',
      body:
        'Every song has one or two bars that cause most of the trouble. Playing the whole song again to fix them wastes the easy bars.\n\nThe A–B loop under "More" repeats just those bars. After a session, your report names them for you and offers the loop in one click.',
    },
    {
      title: 'Then the whole thing, in time',
      body:
        'Only when the hard bars are clean, play the song from the top at full tempo with the metronome. If it breaks, you have found your next loop.\n\nTen focused minutes a day beats an hour on Sunday. The Today screen plans those minutes for you.',
    },
  ],
};
