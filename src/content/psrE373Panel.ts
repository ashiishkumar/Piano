/**
 * Yamaha PSR-E373 top panel, as named regions for keyboard-task lessons.
 *
 * SCHEMATIC. Controls and labels come from the official spec sheet; their positions
 * are approximate and grouped by function the way PSR-E panels are. To make it exact,
 * open the Owner's Manual (free PDF from Yamaha), compare the "Panel Controls" page,
 * and move the x/y/w/h numbers below. Nothing else needs to change.
 */

export type PanelGroup = 'power' | 'piano' | 'song' | 'style' | 'display' | 'select' | 'voice' | 'lesson' | 'wheel' | 'rear';

export interface PanelRegion {
  id: string;
  label: string;
  group: PanelGroup;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: 'rect' | 'knob' | 'wheel' | 'jack';
  /** Short learner-facing explanation shown when highlighted */
  tip?: string;
}

export const PANEL_WIDTH = 1000;
export const PANEL_HEIGHT = 230;

const btn = (id: string, label: string, group: PanelGroup, x: number, y: number, w = 54, h = 20, tip?: string): PanelRegion => ({
  id,
  label,
  group,
  x,
  y,
  w,
  h,
  tip,
});

export const PANEL_REGIONS: PanelRegion[] = [
  // Power and volume
  { id: 'STANDBY_ON', label: 'Standby/On', group: 'power', x: 14, y: 18, w: 44, h: 20, tip: 'Hold for a second to switch on. Auto power-off is on by default.' },
  { id: 'MASTER_VOLUME', label: 'MASTER VOLUME', group: 'power', x: 14, y: 52, w: 44, h: 44, shape: 'knob', tip: 'Start around the middle. Headphones plug into PHONES/OUTPUT at the back.' },

  // Piano, demo, metronome, tempo, recording
  btn('PORTABLE_GRAND', 'PORTABLE GRAND', 'piano', 72, 18, 70, 20, 'One press resets the whole keyboard to a grand piano sound.'),
  btn('DEMO', 'DEMO', 'song', 72, 46, 32, 20),
  btn('METRONOME', 'METRONOME', 'piano', 108, 46, 34, 20, 'Click track. Set the time signature in FUNCTION.'),
  btn('TEMPO_TAP', 'TEMPO/TAP', 'piano', 72, 74, 70, 20, 'Tap the beat four times to set the tempo, or press and use the number buttons.'),
  btn('REC', 'REC', 'song', 72, 102, 32, 20, 'Record up to 5 songs, 2 tracks each.'),
  btn('SONG', 'SONG', 'song', 108, 102, 34, 20, 'Choose one of the 154 built-in songs.'),

  // Style control
  btn('ACMP_ON_OFF', 'ACMP ON/OFF', 'style', 158, 18, 64, 20, 'Turns the backing band on. The keys left of the split point now play chords for the band.'),
  btn('INTRO_ENDING', 'INTRO/ENDING/rit.', 'style', 158, 46, 64, 20, 'Before starting: plays an intro. While playing: plays an ending and stops.'),
  btn('MAIN_AUTO_FILL', 'MAIN/AUTO FILL', 'style', 158, 74, 64, 20, 'Switches between Main A and Main B with a drum fill.'),
  btn('SYNC_START', 'SYNC START', 'style', 158, 102, 64, 20, 'Arms the style: it starts the moment you play a chord.'),
  btn('START_STOP', 'START/STOP', 'style', 158, 130, 64, 20),

  // Display
  { id: 'LCD', label: 'Display', group: 'display', x: 240, y: 18, w: 300, h: 132, tip: 'Shows the current voice, style, song, tempo, measure and the chord you are playing.' },

  // Selection: category buttons, number pad, +/−
  btn('VOICE', 'VOICE', 'select', 556, 18, 54, 20, 'Then pick a number: 622 voices. 001 is the Live! Grand Piano.'),
  btn('STYLE', 'STYLE', 'select', 614, 18, 54, 20, '205 backing styles.'),
  btn('FUNCTION', 'FUNCTION', 'select', 672, 18, 54, 20, 'Settings: touch response, split point, metronome, tuning, MIDI and more.'),
  btn('CATEGORY_DOWN', 'CATEGORY ◀', 'select', 556, 46, 54, 20),
  btn('CATEGORY_UP', 'CATEGORY ▶', 'select', 614, 46, 54, 20),
  btn('MUSIC_DATABASE', 'MUSIC DATABASE', 'select', 672, 46, 54, 20, '170 setups that pick a voice and style for a song type.'),
  { id: 'NUMBER_KEYS', label: 'Number buttons 0–9', group: 'select', x: 556, y: 74, w: 112, h: 48, tip: 'Type a voice, style or song number.' },
  btn('PLUS_MINUS', '+/YES  −/NO', 'select', 672, 74, 54, 48, 'Step through values, or answer the display.'),
  btn('EXIT', 'EXIT', 'select', 556, 130, 54, 20),
  btn('REGIST_MEMORY', 'REGIST MEMORY', 'select', 614, 130, 112, 20, 'Save your whole setup (voice, style, tempo, Dual, Split) to one of 9 buttons.'),

  // Voice functions
  btn('DUAL', 'DUAL', 'voice', 740, 18, 66, 20, 'Layer a second voice on every key. Over USB this shows as the same note on two channels.'),
  btn('SPLIT', 'SPLIT', 'voice', 740, 46, 66, 20, 'A different voice below the split point (default F#2). Over USB the left zone uses another channel.'),
  btn('HARMONY_ARPEGGIO', 'HARMONY/ARP.', 'voice', 740, 74, 66, 20, '26 harmony types that add notes to your melody, or 150 arpeggio patterns.'),
  btn('TRANSPOSE', 'TRANSPOSE', 'voice', 740, 102, 66, 20, 'Shift the whole keyboard up to 12 semitones. Handy for a singer.'),
  btn('DSP', 'DSP', 'voice', 740, 130, 66, 20, '38 effects: distortion, tremolo, phaser and more.'),

  // Lesson
  btn('KEYS_TO_SUCCESS', 'KEYS TO SUCCESS', 'lesson', 814, 18, 82, 20, 'The built-in lesson mode for the preset songs.'),
  btn('LESSON_LISTENING', 'LESSON 1 (Listening)', 'lesson', 814, 46, 82, 20),
  btn('LESSON_TIMING', 'LESSON 2 (Timing)', 'lesson', 814, 74, 82, 20),
  btn('LESSON_WAITING', 'LESSON 3 (Waiting)', 'lesson', 814, 102, 82, 20, 'The keyboard waits for the right key, like this app.'),
  btn('PHRASE_REPEAT', 'PHRASE REPEAT', 'lesson', 814, 130, 82, 20),
  btn('A_B_REPEAT', 'A-B REPEAT', 'lesson', 904, 18, 90, 20, 'Loop a section of a song.'),
  btn('CHORD_DICTIONARY', 'CHORD DICTIONARY', 'lesson', 904, 46, 90, 20, 'Shows which keys make any chord you name.'),
  btn('TOUCH_TUTOR', 'TOUCH TUTOR', 'lesson', 904, 74, 90, 20, 'Songs that teach dynamics.'),
  btn('CHORD_STUDY', 'CHORD STUDY', 'lesson', 904, 102, 90, 20, '12 songs for chord practice.'),
  btn('CHORD_PROGRESSION', 'CHORD PROGRESS.', 'lesson', 904, 130, 90, 20, '30 songs built on common progressions.'),

  // Pitch bend wheel (left of the keys)
  { id: 'PITCH_BEND', label: 'PITCH BEND', group: 'wheel', x: 14, y: 112, w: 44, h: 50, shape: 'wheel', tip: 'Bends the pitch while you hold a note. Springs back to centre.' },

  // Rear panel strip
  { id: 'PHONES_OUTPUT', label: 'PHONES/OUTPUT', group: 'rear', x: 530, y: 190, w: 100, h: 24, shape: 'jack', tip: 'Headphones or a speaker. Plugging in mutes the built-in speakers.' },
  { id: 'SUSTAIN_JACK', label: 'SUSTAIN', group: 'rear', x: 636, y: 190, w: 60, h: 24, shape: 'jack', tip: 'Footswitch. Arrives over USB as CC 64.' },
  { id: 'AUX_IN', label: 'AUX IN', group: 'rear', x: 702, y: 190, w: 60, h: 24, shape: 'jack', tip: 'Play a phone through the keyboard speakers. Melody Suppressor can duck the vocal.' },
  { id: 'USB_TO_HOST', label: 'USB TO HOST', group: 'rear', x: 766, y: 190, w: 90, h: 24, shape: 'jack', tip: 'MIDI and audio to the computer on one cable. This is how this app hears you.' },
  { id: 'DC_IN', label: 'DC IN 12V', group: 'rear', x: 868, y: 190, w: 70, h: 24, shape: 'jack' },
];

export const PANEL_BY_ID: Record<string, PanelRegion> = Object.fromEntries(PANEL_REGIONS.map((r) => [r.id, r]));

export const GROUP_LABELS: Record<PanelGroup, string> = {
  power: 'Power',
  piano: 'Piano & tempo',
  song: 'Songs & recording',
  style: 'Style control',
  display: 'Display',
  select: 'Selection',
  voice: 'Voice functions',
  lesson: 'Built-in lessons',
  wheel: 'Pitch bend',
  rear: 'Rear panel',
};
