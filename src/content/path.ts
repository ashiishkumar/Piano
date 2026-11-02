import { Lesson, LessonType, Level, ReadyLesson, ScoreLesson, Track } from '../types/lesson';
import { ALL_SONGS, ALANKARS_3_6, COORDINATION_1645, RIGHT_HAND_EXERCISES, TWINKLE_WITH_CHORDS } from './songs';
import { Payload } from './lessons/types';
import { KEYBOARD_MAP, MEET_YOUR_KEYBOARD, POSTURE, SARGAM_AND_WESTERN, TOUCH_RESPONSE } from './lessons/level1';
import { HOW_TO_MASTER_A_SONG, NOTE_VALUES, PLAYING_IN_RHYTHM } from './lessons/level2';
import {
  BUILDING_TRIADS,
  CHORD_TYPES,
  CIRCLE_OF_FIFTHS,
  MAJOR_SCALE_FORMULA,
  NATURAL_MINOR_FORMULA,
  RELATIVE_KEYS_QUIZ,
  SCALE_TYPES,
} from './lessons/level3';
import {
  ADVANCED_CHORDS_IN_CONTEXT,
  BUILT_IN_CHORD_SONGS,
  CHORDS_ON_THE_BEAT,
  CHORD_LOOPS_BEHIND_SONGS,
  CHORD_SHIFT_TEST_1,
  CHORD_SHIFT_TEST_2,
  FIVE_CHANGE_EXERCISES,
  FOUR_LOOPS_ON_THE_BEAT,
  HOW_TO_SHIFT_CHORDS,
  SMART_CHORD_AND_ACMP,
} from './lessons/level4';
import {
  ARPEGGIO_COORDINATION_34,
  ARPEGGIO_COORDINATION_44,
  BUILD_YOUR_OWN_PATTERN,
  EXCEPTIONAL_PATTERNS,
  FOUR_PATTERNS_34,
  FOUR_STEP_PROCESS,
  IDENTIFY_THE_PATTERN,
  IMPROVISE_WITH_ARPEGGIOS,
  INTRO_TO_ARPEGGIOS,
  SEVEN_PATTERNS_44,
} from './lessons/level6';
import { EAR_INTERVALS, EAR_MAJOR_MINOR, EAR_MELODIES, EAR_SINGLE_NOTES, PLAY_BY_EAR_METHOD } from './lessons/level7';
import { CHORDS_BY_EAR, CHORD_FAMILIES, FIND_THE_SCALE, MAJOR_OR_MINOR, PRIORITY_PROGRESSIONS } from './lessons/level8';
import { DUAL_SPLIT_RHYTHM } from './lessons/level9';
import { RHYTHM_CHECKPOINT, RIGHT_HAND_CHECKPOINT, THEORY_CHECKPOINT } from './lessons/checkpoints';

/**
 * The learning path: 10 levels, 94 lessons.
 *
 * Ids are stable slugs (song lessons use the song id) so progress survives
 * reordering. Codes ("4.7") come from position and are display only.
 * Planned lessons are on the path with their type and source so the Path view
 * shows the whole journey. See docs/PRODUCT_PLAN.md section 3.
 */

let order = 0;
let level = 0;
const seen = new Set<string>();

function begin(levelId: number): void {
  level = levelId;
  order = 0;
}

function ids(slug: string): { id: string; code: string; levelId: number } {
  order += 1;
  if (seen.has(slug)) throw new Error(`path: duplicate lesson id "${slug}"`);
  seen.add(slug);
  return { id: slug, code: `${level}.${order}`, levelId: level };
}

function song(songId: string, title: string, track: Track, source: string, minutes = 8, extra: Partial<ScoreLesson> = {}): ScoreLesson {
  const songData = ALL_SONGS.find((s) => s.id === songId);
  if (!songData) throw new Error(`path: unknown song "${songId}"`);
  return {
    ...ids(songId),
    title,
    subtitle: songData.subtitle.replace(/^Stage \d\.\d\s*•\s*/, ''),
    track,
    type: 'score',
    status: 'ready',
    songId,
    durationMinutes: minutes,
    objectives: songData.pedagogyFocus,
    source,
    ...extra,
  };
}

function ready<T extends ReadyLesson>(slug: string, payload: Payload<T>): T {
  return { ...ids(slug), status: 'ready', ...payload } as T;
}

function planned(slug: string, title: string, track: Track, type: LessonType, source: string, minutes = 6, subtitle?: string): Lesson {
  return { ...ids(slug), title, subtitle, track, type, status: 'planned', durationMinutes: minutes, objectives: [], source };
}

// ---------------------------------------------------------------------------

begin(1);
const level1: Level = {
  id: 1,
  title: 'First Touch',
  subtitle: 'Your keyboard, your hands, your first five notes',
  description: 'Set up the keyboard, learn where everything is, and play Sa Re Ga Ma Pa with one hand that never moves.',
  lessons: [
    ready('meet-your-keyboard', MEET_YOUR_KEYBOARD),
    ready('posture', POSTURE),
    ready('keyboard-map', KEYBOARD_MAP),
    ready('sargam-and-western', SARGAM_AND_WESTERN),
    song('stage1-five-finger-home', 'The 5-finger home: Sa Re Ga Ma Pa', 'play', 'existing 1.1'),
    song('stage1-alankar-1-steps', 'Alankar 1: stepwise palta', 'play', 'existing 1.2'),
    song('stage1-alankar-2-skips', 'Alankar 2: skipping keys', 'play', 'existing 1.3'),
    song(ALANKARS_3_6.id, 'Alankars 3–6: the standard set', 'play', 'course 2B (generated)', 10),
    ready('touch-response', TOUCH_RESPONSE),
    song(RIGHT_HAND_EXERCISES.id, 'Top four right-hand exercises', 'play', 'course 2E', 10),
    song('stage1-jana-gana-5note', 'First melodies in 5 notes: Jana Gana Mana, Ode to Joy', 'play', 'existing 1.4, course 2C', 10),
  ],
};

begin(2);
const level2: Level = {
  id: 2,
  title: 'Rhythm and the Full Octave',
  subtitle: 'Note values, the metronome, the thumb tuck, your first songs',
  description: 'Learn to count, play with a steady beat, reach all eight notes of the saptak, and finish two real songs.',
  lessons: [
    ready('note-values', NOTE_VALUES),
    ready('playing-in-rhythm', PLAYING_IN_RHYTHM),
    song('stage2-thumb-tuck-drill', 'The thumb tuck (1-2-3-1)', 'play', 'existing 2.1'),
    song('stage1-sargam-scale', 'Full saptak: Sa Re Ga Ma Pa Dha Ni Sa', 'play', 'existing 2.2'),
    song('stage2-raag-yaman-black-keys', 'Black keys: Raag Yaman and Tivra Ma', 'play', 'existing 2.3'),
    song('stage1-om-shanti-om', 'Song: Om Shanti Om', 'play', 'existing 2.4', 10),
    song('stage1-happy-birthday', 'Song: Happy Birthday', 'play', 'existing 2.5', 10),
    ready('how-to-master-a-song', HOW_TO_MASTER_A_SONG),
    ready('rhythm-checkpoint', RHYTHM_CHECKPOINT),
    ready('right-hand-checkpoint', RIGHT_HAND_CHECKPOINT),
  ],
};

begin(3);
const level3: Level = {
  id: 3,
  title: 'Scales and Chords: the Theory',
  subtitle: 'Formulas you can play, not memorise',
  description: 'Every scale and chord comes from a formula. Learn the formulas on the keyboard, in all twelve keys.',
  lessons: [
    ready('major-scale-formula', MAJOR_SCALE_FORMULA),
    ready('circle-of-fifths', CIRCLE_OF_FIFTHS),
    ready('natural-minor-formula', NATURAL_MINOR_FORMULA),
    ready('building-triads', BUILDING_TRIADS),
    song('stage3-chord-inversions', 'Chord inversions: zero-jump voice leading', 'chords', 'existing 4.1, course 3D', 10),
    ready('chord-types', CHORD_TYPES),
    ready('scale-types', SCALE_TYPES),
    ready('relative-keys-quiz', RELATIVE_KEYS_QUIZ),
    ready('theory-checkpoint', THEORY_CHECKPOINT),
  ],
};

begin(4);
const level4: Level = {
  id: 4,
  title: 'Chord Shifting and Songs with Chords',
  subtitle: 'Change chords cleanly, on time, in real songs',
  description: 'Move between chords with the least hand movement, lock changes to the beat, and let the keyboard play the band.',
  lessons: [
    ready('how-to-shift-chords', HOW_TO_SHIFT_CHORDS),
    ready('chord-shift-test-1', CHORD_SHIFT_TEST_1),
    ready('chord-shift-test-2', CHORD_SHIFT_TEST_2),
    ready('five-change-exercises', FIVE_CHANGE_EXERCISES),
    ready('chords-on-the-beat', CHORDS_ON_THE_BEAT),
    song(COORDINATION_1645.id, 'Advanced chord coordination: C, Am, F, G', 'chords', 'course 4F (generated)', 10),
    song(TWINKLE_WITH_CHORDS.id, 'Playing songs with chords: Twinkle Twinkle', 'chords', 'course 4H, public domain', 12),
    ready('advanced-chords-in-context', ADVANCED_CHORDS_IN_CONTEXT),
    ready('smart-chord-and-acmp', SMART_CHORD_AND_ACMP),
    ready('built-in-chord-songs', BUILT_IN_CHORD_SONGS),
    ready('chord-loops-behind-songs', CHORD_LOOPS_BEHIND_SONGS),
    ready('four-loops-on-the-beat', FOUR_LOOPS_ON_THE_BEAT),
  ],
};

begin(5);
const level5: Level = {
  id: 5,
  title: 'Left Hand and Two-Hand Coordination',
  subtitle: 'Wake the left hand, then make the hands talk',
  description: 'Strengthen the left hand on its own, then combine hands with mirror motion, drones, and real repertoire.',
  lessons: [
    song('stage3-left-hand-alone', 'Left-hand 5-finger home (C3–G3)', 'play', 'existing 3.1'),
    planned('left-hand-power', 'Five exercises to make the left hand powerful', 'play', 'score', 'course 5A', 10),
    planned('left-hand-advanced', 'Advanced left-hand exercises', 'play', 'score', 'course 5B', 10),
    song('stage2-contrary-motion', 'Mirror hands: contrary motion', 'play', 'existing 3.2'),
    song('stage2-rhythmic-independence', 'Drone and melody: 2-against-1', 'play', 'existing 3.3'),
    planned('two-hand-coordination', 'Establishing two-hand coordination', 'play', 'score', 'course 5C', 10),
    planned('daily-practice-routine', 'Your daily practice routine', 'play', 'concept', 'course 5D', 5, 'Built from your weak spots'),
    planned('both-hands-mastery', 'Master playing with both hands', 'play', 'score', 'course 5E', 12),
    planned('twister-exercise', 'The twister exercise', 'play', 'score', 'course 5F', 8),
    song('stage4-hanon-no1', 'Hanon No. 1: finger equaliser', 'play', 'existing 5.1', 10),
  ],
};

begin(6);
const level6: Level = {
  id: 6,
  title: 'Arpeggios',
  subtitle: 'Patterns that turn chords into music',
  description: 'A small library of left-hand patterns works on any chord progression. Learn them, apply them to songs, then build your own.',
  lessons: [
    ready('intro-to-arpeggios', INTRO_TO_ARPEGGIOS),
    ready('arpeggio-coordination-44', ARPEGGIO_COORDINATION_44),
    ready('arpeggio-coordination-34', ARPEGGIO_COORDINATION_34),
    ready('four-step-arpeggio-process', FOUR_STEP_PROCESS),
    ready('seven-patterns-44', SEVEN_PATTERNS_44),
    ready('exceptional-patterns', EXCEPTIONAL_PATTERNS),
    ready('four-patterns-34', FOUR_PATTERNS_34),
    ready('identify-the-pattern', IDENTIFY_THE_PATTERN),
    ready('build-your-own-pattern', BUILD_YOUR_OWN_PATTERN),
    ready('improvise-with-arpeggios', IMPROVISE_WITH_ARPEGGIOS),
    song('stage3-bollywood-ballad-arpeggio', 'Bollywood ballad: 1-5-8-5 flow', 'chords', 'existing 4.2', 12),
    planned('arpeggio-and-harmony-functions', 'The Arpeggio function (150 types) and Harmony (26 types)', 'keyboard', 'keyboard-task', 'course 9C, spec sheet', 8),
  ],
};

begin(7);
const level7: Level = {
  id: 7,
  title: 'Ear Training',
  subtitle: 'Hear it, then find it on the keys',
  description: 'Start with single notes against Sa, move to intervals and short phrases, and learn the method for playing any song by ear.',
  lessons: [
    ready('ear-single-notes', EAR_SINGLE_NOTES),
    ready('ear-intervals', EAR_INTERVALS),
    ready('ear-melodies', EAR_MELODIES),
    ready('ear-major-minor-chords', EAR_MAJOR_MINOR),
    ready('play-by-ear-method', PLAY_BY_EAR_METHOD),
  ],
};

begin(8);
const level8: Level = {
  id: 8,
  title: 'Finding the Scale and Chords of Any Song',
  subtitle: 'From "I know this tune" to "I can accompany it"',
  description: 'Work out the key, decide major or minor, know the chord family, and recognise the progressions that most songs use.',
  lessons: [
    ready('find-the-scale', FIND_THE_SCALE),
    ready('major-or-minor', MAJOR_OR_MINOR),
    ready('chord-families', CHORD_FAMILIES),
    ready('chords-by-ear', CHORDS_BY_EAR),
    ready('priority-progressions', PRIORITY_PROGRESSIONS),
  ],
};

begin(9);
const level9: Level = {
  id: 9,
  title: 'Your Keyboard as an Instrument',
  subtitle: 'Everything the PSR-E373 can do, verified over the cable',
  description: 'Voices, effects, Dual and Split, styles and fills, registration memory, recording, and the built-in lessons.',
  lessons: [
    planned('touch-in-performance', 'Touch sensitivity in performance: shaping dynamics', 'keyboard', 'score', 'course 9A', 10),
    planned('fillers', 'Fillers: MAIN/AUTO FILL, INTRO/ENDING/rit.', 'keyboard', 'keyboard-task', 'course 9B', 8),
    planned('harmony-types', 'Harmony types and when to use them', 'keyboard', 'keyboard-task', 'course 9C', 6),
    ready('dual-split-rhythm', DUAL_SPLIT_RHYTHM),
    song('stage6-nocturne-expression', 'Sustain pedal: nocturne voicing study', 'keyboard', 'existing 6.1, course 9E', 12),
    planned('voices', 'Voices: the 622, featured voices, Music Database, One Touch Setting', 'keyboard', 'keyboard-task', 'spec sheet', 10, 'MIDI-verified'),
    planned('effects', 'Effects: Reverb, Chorus, DSP, Master EQ', 'keyboard', 'keyboard-task', 'spec sheet', 8),
    planned('registration-memory', 'Registration Memory: save your setups', 'keyboard', 'keyboard-task', 'spec sheet', 6),
    planned('recording-and-usb-audio', 'Recording on the keyboard and USB audio into the computer', 'keyboard', 'keyboard-task', 'spec sheet', 8),
    planned('keys-to-success', 'Keys to Success, Phrase Repeat, A-B Repeat', 'keyboard', 'keyboard-task', 'spec sheet', 6, 'Using the built-in teacher with this app'),
    planned('transpose-tuning-duo', 'Transpose, Tuning, Duo mode, Melody Suppressor, pitch bend', 'keyboard', 'keyboard-task', 'spec sheet', 8),
  ],
};

begin(10);
const level10: Level = {
  id: 10,
  title: 'Performing',
  subtitle: 'Playing for people',
  description: 'Accompany a singer, write an intro and outro, transpose on the spot, read the grand staff, and record a recital.',
  lessons: [
    planned('playing-with-a-singer', 'What to play with a singer', 'perform', 'concept', 'course 10A', 8),
    planned('intro-and-outro', 'Making your own intro and outro', 'perform', 'pattern', 'course 10B', 8),
    planned('transposing-for-a-singer', "Transposing for a singer's range", 'perform', 'concept', 'course 10C', 8, 'On the keyboard and in your head'),
    planned('stage-presence', 'Stage presence and expression', 'perform', 'concept', 'course 10C', 4),
    song('stage5-landmark-drills', 'Grand staff landmark reflexes', 'play', 'existing 5.2', 8),
    song('stage4-czerny-velocity', 'Czerny Op. 299 velocity study', 'play', 'existing 5.3', 12),
    song('stage5-bach-minuet-g', 'Bach: Minuet in G, BWV Anh. 114', 'play', 'existing 5.4', 15),
    planned('bollywood-set', 'A Bollywood set', 'perform', 'score', 'owner to source MIDI or licence', 15),
    planned('final-recital', 'Final recital: record a three-song set', 'perform', 'checkpoint', 'plan', 20),
  ],
};

export const LEVELS: Level[] = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];

export const ALL_LESSONS: Lesson[] = LEVELS.flatMap((l) => l.lessons);

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

/** Score lessons keyed by the song they play, for mapping a finished session back to a lesson. */
export const LESSON_BY_SONG_ID: Record<string, ScoreLesson> = Object.fromEntries(
  ALL_LESSONS.filter((l): l is ScoreLesson => l.status === 'ready' && l.type === 'score').map((l) => [l.songId, l])
);

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID[id];
}

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
