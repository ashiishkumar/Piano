import { Lesson, LessonType, Level, ReadyLesson, ScoreLesson, Track } from '../types/lesson';
import { ALL_SONGS } from './songs';
import { Payload } from './lessons/types';
import { KEYBOARD_MAP, MEET_YOUR_KEYBOARD, POSTURE, SARGAM_AND_WESTERN, TOUCH_RESPONSE } from './lessons/level1';
import { HOW_TO_MASTER_A_SONG, MASTERING_RHYTHM_CONCEPT, NOTE_VALUES, PLAYING_IN_RHYTHM } from './lessons/level2';
import {
  BUILDING_TRIADS,
  CHORD_FORMATION_CONCEPT,
  CHORD_TYPES,
  CIRCLE_OF_FIFTHS,
  MAJOR_SCALE_FORMULA,
  NATURAL_MINOR_FORMULA,
  RELATIVE_KEYS_QUIZ,
  SCALE_TYPES,
} from './lessons/level3';
import {
  ADVANCED_CHORDS_IN_CONTEXT,
  CHORD_LOOPS_BEHIND_SONGS,
  CHORD_SHIFT_TEST_1,
  CHORD_SHIFT_TEST_2,
  FOUR_LOOPS_ON_THE_BEAT,
  HOW_TO_SHIFT_CHORDS,
  RCCR_FRAMEWORK_CONCEPT,
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
import {
  DUAL_SPLIT_RHYTHM,
  INTRO_AND_OUTRO,
  PLAYING_WITH_A_SINGER,
  SONG_TONE_SELECTION,
  TRANSPOSING_AND_STAGE_PRESENCE,
} from './lessons/level9';
import { RHYTHM_CHECKPOINT, RIGHT_HAND_CHECKPOINT, THEORY_CHECKPOINT } from './lessons/checkpoints';

/**
 * PIX Series Zero to Hero Piano Course (by Jash Gotawala)
 * Complete 10-Module, 101-Lesson Interactive Companion Curriculum (Chapters 1A–10C).
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
  const objectives =
    songData.pedagogyFocus && songData.pedagogyFocus.length > 0
      ? songData.pedagogyFocus
      : songData.teacherGuide?.whatTeacherExpects && songData.teacherGuide.whatTeacherExpects.length > 0
        ? songData.teacherGuide.whatTeacherExpects
        : [songData.subtitle];
  return {
    ...ids(songId),
    title,
    subtitle: songData.subtitle,
    track,
    type: 'score',
    status: 'ready',
    songId,
    durationMinutes: minutes,
    objectives,
    source,
    ...extra,
  };
}

function ready<T extends ReadyLesson>(slug: string, payload: Payload<T>): T {
  return { ...ids(slug), status: 'ready', ...payload } as T;
}

export function planned(slug: string, title: string, track: Track, type: LessonType, source: string, minutes = 6, subtitle?: string): Lesson {
  return { ...ids(slug), title, subtitle, track, type, status: 'planned', durationMinutes: minutes, objectives: [], source };
}

// ---------------------------------------------------------------------------
// MODULE 1: Course Setup, Basics of Piano & First Sargam Alankars (Ch. 1A–2D)
// ---------------------------------------------------------------------------

begin(1);
const level1: Level = {
  id: 1,
  title: 'Module 1 · Piano Basics, Posture & First Sargam Alankars',
  subtitle: 'Chapters 1A–2D · Keyboard Setup, 12-Note Octave, Finger Numbers, Alankars 1–5 & Happy Birthday',
  description:
    'Set up your keyboard, learn the 12-key octave in Western (C–B) and Indian Sargam (Sa–Ni), master the 2-3-1-2-3-4-1-2 Kali Ek (C#) and 1-2-3-1-2-3-4-5 Safed Ek (C) fingerings, and play your first melody.',
  lessons: [
    ready('meet-your-keyboard', MEET_YOUR_KEYBOARD),
    ready('posture', POSTURE),
    ready('keyboard-map', KEYBOARD_MAP),
    ready('sargam-and-western', SARGAM_AND_WESTERN),
    ready('touch-response', TOUCH_RESPONSE),
    song('zth-2b-alankars-kali-ek', '2B · Basic Finger Exercises: Alankars 1–5 in C# (Kali Ek)', 'play', 'course 2B', 10),
    song('zth-2b-alankars-safed-ek', '2B · Basic Finger Exercises: Alankars 1–5 in C (Safed Ek)', 'play', 'course 2B', 10),
    song('zth-2c-happy-birthday', '2C · First Song in Sargam: Happy Birthday to You', 'play', 'course 2C', 8),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 2: Mastering the Right Hand, Rhythm & 11 Bollywood Songs (Ch. 2E–2J)
// ---------------------------------------------------------------------------

begin(2);
const level2: Level = {
  id: 2,
  title: 'Module 2 · Mastering the Right Hand, Rhythm & 11 Songs',
  subtitle: 'Chapters 2E–2J · Top #4 RH Drills, 4 Rhythm Formats, 11 Bollywood RH Songs & Final RH Mastery',
  description:
    'Build right-hand speed with Jash’s Top #4 Right-Hand Exercises, lock in Whole/Half/Quarter/Eighth note timing with a metronome, play all 11 Chapter 2H songs, and conquer octaves, black keys, and double thirds.',
  lessons: [
    song('zth-2e-rh-ex1', '2E · Right-Hand Exercise #1: 3-Note Climber (1-2-3)', 'play', 'course 2E', 8),
    song('zth-2e-rh-ex2', '2E · Right-Hand Exercise #2: 4-Note Turnaround (1-2-4-3)', 'play', 'course 2E', 8),
    song('zth-2e-rh-ex3', '2E · Right-Hand Exercise #3: 5-Finger Arch (1-2-3-4-5-4-3-2)', 'play', 'course 2E', 8),
    song('zth-2e-rh-ex4', '2E · Right-Hand Exercise #4: Skip & Return (1-3-2-4-3-5-4-2)', 'play', 'course 2E', 8),
    ready('note-values', NOTE_VALUES),
    ready('playing-in-rhythm', PLAYING_IN_RHYTHM),
    song('zth-2g-rhythm-formats', '2G · Playing in Rhythm: Exercises 1–3 in All 4 Note Formats', 'play', 'course 2G', 10),
    ready('how-to-master-a-song', HOW_TO_MASTER_A_SONG),
    song('zth-2h-chura-liya', '2H · Song 1: Chura Liya Hai Tumne Jo Dil Ko (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-tum-hi-ho', '2H · Song 2: Tum Hi Ho (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-raatan-lambiyan', '2H · Song 3: Raatan Lambiyan (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-jana-gana-mana', '2H · Song 4: Jana Gana Mana — National Anthem (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-pehla-nasha', '2H · Song 5: Pehla Nasha (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-lag-jaa-gale', '2H · Song 6: Lag Jaa Gale in 3/4 Waltz (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-o-mere-dil-ke-chain', '2H · Song 7: O Mere Dil Ke Chain (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-vande-mataram', '2H · Song 8: Vande Mataram (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-kya-hua-tera-wada', '2H · Song 9: Kya Hua Tera Wada (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-ae-dil-hai-mushkil', '2H · Song 10: Ae Dil Hai Mushkil (Right Hand)', 'play', 'course 2H', 10),
    song('zth-2h-jab-koi-baat', '2H · Song 11: Jab Koi Baat Bigad Jaaye (Right Hand)', 'play', 'course 2H', 10),
    ready('mastering-rhythm-concept', MASTERING_RHYTHM_CONCEPT),
    ready('rhythm-checkpoint', RHYTHM_CHECKPOINT),
    song('zth-2j-master-rh', '2J · Final Stage — Mastering the Right Hand: Octaves, Black Keys & Double Thirds', 'play', 'course 2J', 12),
    ready('right-hand-checkpoint', RIGHT_HAND_CHECKPOINT),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 3: Scales, Chords, Inversions & Circle of Fifths (Ch. 3A–3F)
// ---------------------------------------------------------------------------

begin(3);
const level3: Level = {
  id: 3,
  title: 'Module 3 · Scales, Chords, Inversions & Circle of Fifths',
  subtitle: 'Chapters 3A–3F · Major & Minor Scale Formulas, 4-3 / 3-4 Chords, Inversions, Sus/7th/Add9 & Circle of Fifths',
  description:
    'Understand how every Major and Minor scale is built, play two-hand scale workouts, construct Major (4-3) and Minor (3-4) chords plus 1st/2nd inversions, explore Sus2/Sus4/Dim/Aug/7th/Add9 chords, and decode the Circle of Fifths.',
  lessons: [
    ready('major-scale-formula', MAJOR_SCALE_FORMULA),
    song('zth-3a-major-scales-drill', '3A · Major Scales Two-Hand Workout (C, G, D & F Major)', 'theory', 'course 3A', 10),
    ready('circle-of-fifths', CIRCLE_OF_FIFTHS),
    ready('natural-minor-formula', NATURAL_MINOR_FORMULA),
    song('zth-3b-minor-scales-drill', '3B · Natural Minor Scales Two-Hand Workout (A, E & D Minor)', 'theory', 'course 3B', 10),
    ready('chord-formation-concept', CHORD_FORMATION_CONCEPT),
    ready('building-triads', BUILDING_TRIADS),
    song('zth-3d-chord-inversions', '3D · Chord Inversions: Root Position, 1st & 2nd Inversions', 'chords', 'course 3D', 10),
    ready('chord-types', CHORD_TYPES),
    ready('scale-types', SCALE_TYPES),
    ready('relative-keys-quiz', RELATIVE_KEYS_QUIZ),
    ready('theory-checkpoint', THEORY_CHECKPOINT),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 4: Chord Shifting & Playing 11 Songs with Chords (Ch. 4A–4K)
// ---------------------------------------------------------------------------

begin(4);
const level4: Level = {
  id: 4,
  title: 'Module 4 · Chord Shifting, RCCR Method & 11 Songs with Chords',
  subtitle: 'Chapters 4A–4K · Closest Inversions, 5 Shift Drills, Gulabi Aankhein RCCR Masterclass, 10 Chord Songs & Fat Chords',
  description:
    'Shift between chords without jumping, pass both Chord Shifting Tests, master the 5 Best Shifting Exercises and 4 Beat-1 Timing Lessons, and play Gulabi Aankhein plus 10 iconic songs with two-hand chords using the RCCR Framework.',
  lessons: [
    ready('how-to-shift-chords', HOW_TO_SHIFT_CHORDS),
    ready('four-loops-on-the-beat', FOUR_LOOPS_ON_THE_BEAT),
    ready('chord-shift-test-1', CHORD_SHIFT_TEST_1),
    ready('chord-shift-test-2', CHORD_SHIFT_TEST_2),
    song('zth-4d-five-chord-shift-exercises', '4D · 5 Best Exercises for Shifting Chords Smoothly', 'chords', 'course 4D', 10),
    song('zth-4e-chords-on-correct-time', '4E · 4 Lessons to Play Chords on the Correct Time', 'chords', 'course 4E', 10),
    song('zth-4f-advanced-chord-coordination', '4F · Advanced Exercises for Chords Coordination (Ex 1 & Ex 2)', 'chords', 'course 4F', 10),
    ready('rccr-framework-concept', RCCR_FRAMEWORK_CONCEPT),
    song('zth-4g-gulabi-aankhein', '4G · RCCR Masterclass Song: Gulabi Aankhein (Melody + Chords)', 'chords', 'course 4G', 12),
    song('zth-4h-ae-dil-hai-mushkil', '4H · RCCR Song 1: Ae Dil Hai Mushkil (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-jab-koi-baat', '4H · RCCR Song 2: Jab Koi Baat Bigad Jaaye (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-jana-gana-mana', '4H · RCCR Song 3: Jana Gana Mana (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-kya-hua-tera-wada', '4H · RCCR Song 4: Kya Hua Tera Wada (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-lag-jaa-gale', '4H · RCCR Song 5: Lag Jaa Gale in 3/4 (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-o-mere-dil-ke-chain', '4H · RCCR Song 6: O Mere Dil Ke Chain (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-pehla-nasha', '4H · RCCR Song 7: Pehla Nasha (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-raatan-lambiyan', '4H · RCCR Song 8: Raatan Lambiyan (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-tum-hi-ho', '4H · RCCR Song 9: Tum Hi Ho (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4h-vande-mataram', '4H · RCCR Song 10: Vande Mataram (Melody + Chords)', 'chords', 'course 4H', 12),
    song('zth-4i-fat-chords', '4I · Advanced Chords for Left Hand: "Fat Chords" (1-5-8 Power Voicing)', 'chords', 'course 4I', 10),
    ready('advanced-chords-in-context', ADVANCED_CHORDS_IN_CONTEXT),
    ready('smart-chord-and-acmp', SMART_CHORD_AND_ACMP),
    ready('chord-loops-behind-songs', CHORD_LOOPS_BEHIND_SONGS),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 5: Left-Hand Mastery & Two-Hand Coordination (Ch. 5A–5F)
// ---------------------------------------------------------------------------

begin(5);
const level5: Level = {
  id: 5,
  title: 'Module 5 · Left-Hand Power & Two-Hand Coordination',
  subtitle: 'Chapters 5A–5F · 5 LH Power Drills, Wide-Span 1-5-8-9-10, 5 Coordination Drills, Daily Warm-Up, Speed Ratios & Twister',
  description:
    'Turn a weak left hand into a powerhouse, stretch across 10th intervals, lock both hands together across 5 coordination stages, build your daily contrary-motion warm-up, and conquer Jash’s Twister Exercise.',
  lessons: [
    song('zth-5a-left-hand-power', '5A · 5 Exercises to Make Your Left Hand Powerful', 'play', 'course 5A', 10),
    song('zth-5b-advanced-left-hand', '5B · 3 Advanced Left-Hand Wide-Span Arpeggio Exercises (1-5-8-9-10)', 'play', 'course 5B', 10),
    song('zth-5c-two-hand-coordination', '5C · Establishing Two-Hand Coordination (Exercises 1–5)', 'play', 'course 5C', 12),
    song('zth-5d-daily-practice-routine', '5D · Daily Practice Routine: Contrary Motion Inward & Outward Warm-Up', 'play', 'course 5D', 8),
    song('zth-5e-master-both-hands', '5E · Master Playing with Both Hands: 1:2 & 1:4 Speed Ratios', 'play', 'course 5E', 12),
    song('zth-5f-twister-exercise', '5F · My Favourite Twister Exercise: Simultaneous Two-Hand Thirds', 'play', 'course 5F', 10),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 6: Arpeggios & Pattern Mastery (Ch. 6A–6J)
// ---------------------------------------------------------------------------

begin(6);
const level6: Level = {
  id: 6,
  title: 'Module 6 · Arpeggios: 4/4, 3/4 & Exceptional Patterns',
  subtitle: 'Chapters 6A–6J · 4-Step Arpeggio Process, 7 Universal 4/4 Patterns, 3 Exceptional Grooves & 4 Waltz Patterns',
  description:
    'Transform static left-hand chords into flowing arpeggios. Master the 4-Step Arpeggio Song Process, all 7 Universal 4/4 Patterns, the 6-Beat Kaise Hua/Janam Janam groove, Reggae, Boogie-Woogie, and 3/4 Waltz patterns.',
  lessons: [
    ready('intro-to-arpeggios', INTRO_TO_ARPEGGIOS),
    ready('arpeggio-coordination-44', ARPEGGIO_COORDINATION_44),
    ready('arpeggio-coordination-34', ARPEGGIO_COORDINATION_34),
    ready('four-step-arpeggio-process', FOUR_STEP_PROCESS),
    song('zth-6d-four-step-arpeggio-song', '6D · 4-Step Arpeggio Process in Action: Block -> Base -> Full Arpeggio Song', 'chords', 'course 6D', 10),
    ready('seven-patterns-44', SEVEN_PATTERNS_44),
    ready('exceptional-patterns', EXCEPTIONAL_PATTERNS),
    ready('four-patterns-34', FOUR_PATTERNS_34),
    ready('identify-the-pattern', IDENTIFY_THE_PATTERN),
    ready('build-your-own-pattern', BUILD_YOUR_OWN_PATTERN),
    ready('improvise-with-arpeggios', IMPROVISE_WITH_ARPEGGIOS),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 7: Ear Training — Play Any Song by Ear (Ch. 7A)
// ---------------------------------------------------------------------------

begin(7);
const level7: Level = {
  id: 7,
  title: 'Module 7 · Ear Training: Play Any Song by Ear',
  subtitle: 'Chapter 7A · Blind 1, 2 & 4 Note Identification, Humming -> Words -> Lines & 10 Target Bollywood Songs',
  description:
    'Train your ears to connect what you hear directly to the keyboard. Start with single notes against C, progress to 2-note intervals and 4-note word shapes, and decode the 10 course target songs by ear.',
  lessons: [
    ready('play-by-ear-method', PLAY_BY_EAR_METHOD),
    ready('ear-single-notes', EAR_SINGLE_NOTES),
    ready('ear-intervals', EAR_INTERVALS),
    ready('ear-melodies', EAR_MELODIES),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 8: Finding the Scale and Chords of Any Song (Ch. 8A–8E)
// ---------------------------------------------------------------------------

begin(8);
const level8: Level = {
  id: 8,
  title: 'Module 8 · Finding the Scale & Chords of Any Song',
  subtitle: 'Chapters 8A–8E · 3-Step Scale Finder, Major vs. Minor Mood, Chord Families, 3-Option Rule & Priority Chords',
  description:
    'Find the scale of any song in 3 steps, distinguish relative Major vs. Minor keys, apply the Chord Family table, narrow any Beat-1 melody note down to 3 candidate chords, and master Priority Chords (1-6-4-5 & 1-7-6-5).',
  lessons: [
    ready('find-the-scale', FIND_THE_SCALE),
    ready('major-or-minor', MAJOR_OR_MINOR),
    ready('ear-major-minor-chords', EAR_MAJOR_MINOR),
    ready('chord-families', CHORD_FAMILIES),
    ready('chords-by-ear', CHORDS_BY_EAR),
    ready('priority-progressions', PRIORITY_PROGRESSIONS),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 9: Keyboard Functions, Fillers, Harmonies & Sustain Pedal (Ch. 9A–9E)
// ---------------------------------------------------------------------------

begin(9);
const level9: Level = {
  id: 9,
  title: 'Module 9 · Tone Selection, Fillers, Harmonies, Layering & Sustain Pedal',
  subtitle: 'Chapters 9A–9E · Choosing Voices, 2-Beat Vocal Gap Fillers, Two-Note Harmonies, Dual/Split & Sustain Pedal Timing',
  description:
    'Elevate your arrangements with professional keyboard techniques: select the right instrument voice, add 2-beat melodic fillers in vocal gaps, voice two-note right-hand harmonies, layer Percussive + Sustained tones, and pedal cleanly.',
  lessons: [
    ready('song-tone-selection', SONG_TONE_SELECTION),
    song('zth-9b-fillers-in-songs', '9B · Using Fillers in Songs: 2-Beat Vocal Gap Fillers', 'play', 'course 9B', 10),
    song('zth-9c-harmonies-in-songs', '9C · Using Harmonies in Songs: Two-Note Right-Hand Voicings (3rds & 6ths)', 'play', 'course 9C', 10),
    ready('dual-split-rhythm', DUAL_SPLIT_RHYTHM),
    song('zth-9e-sustain-pedal', '9E · How to Use the Sustain Pedal: Lift & Press on Every Chord Change', 'keyboard', 'course 9E', 10),
  ],
};

// ---------------------------------------------------------------------------
// MODULE 10: Performing Like a Pro (Ch. 10A–10C)
// ---------------------------------------------------------------------------

begin(10);
const level10: Level = {
  id: 10,
  title: 'Module 10 · Performing: Accompanying Singers, Intros/Outros & Transpose',
  subtitle: 'Chapters 10A–10C · 3 Vocal Accompaniment Textures, Custom Intros & Outros, Transpose (-12 to +12) & Stage Presence',
  description:
    'Step onto the stage: accompany a live singer without clashing with the vocal line, compose custom intros and outros using chord tones, transpose instantly for any singer’s range, and perform with expressive confidence.',
  lessons: [
    ready('playing-with-a-singer', PLAYING_WITH_A_SINGER),
    ready('intro-and-outro', INTRO_AND_OUTRO),
    ready('transposing-and-stage-presence', TRANSPOSING_AND_STAGE_PRESENCE),
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
