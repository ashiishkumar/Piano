import { ConceptPayload, K, RhythmPayload } from './types';

/**
 * Chapter 2F (pp. 16–19): Learning the Concept of Rhythm (Note Values)
 * Whole note (1 hit/4 beats), Half note (beats 1 & 3), Quarter note (beats 1,2,3,4), Eighth note (8 hits/4 beats).
 */
export const NOTE_VALUES: RhythmPayload = {
  type: 'rhythm',
  title: 'Chapter 2F: Learning the Concept of Rhythm (Note Values)',
  subtitle: 'PDF pp. 16–19 • Whole Note (1/bar), Half Note (2/bar), Quarter Note (4/bar) & Eighth Note (8/bar)',
  track: 'theory',
  durationMinutes: 6,
  source: 'course 2F (pp. 16–19)',
  objectives: [
    'Play Whole Notes (1 hit held for 4 beats: Beat 1 — 2 — 3 — 4, PDF p. 16)',
    'Play Half Notes (2 hits per bar on Beat 1 and Beat 3, PDF p. 17)',
    'Play Quarter Notes (4 hits per bar on Beats 1, 2, 3, 4, PDF p. 18)',
    'Play Eighth Notes (8 hits per bar: 2 even notes per beat, PDF p. 19)',
  ],
  bpm: 72,
  timeSignature: [4, 4],
  pattern: [
    // Bar 1: Whole note (PDF p. 16 — hit on beat 1, hold through beats 2, 3, 4)
    { beat: 0, durationBeats: 4, label: '𝅝' },
    // Bar 2: Half notes (PDF p. 17 — hit on beat 1 & beat 3)
    { beat: 4, durationBeats: 2, label: '𝅗𝅥' },
    { beat: 6, durationBeats: 2, label: '𝅗𝅥' },
    // Bar 3: Quarter notes (PDF p. 18 — hit on beats 1, 2, 3, 4)
    { beat: 8, durationBeats: 1, label: '♩' },
    { beat: 9, durationBeats: 1, label: '♩' },
    { beat: 10, durationBeats: 1, label: '♩' },
    { beat: 11, durationBeats: 1, label: '♩' },
    // Bar 4: Eighth notes (PDF p. 19 — 8 hits in 4 beats)
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
 * Chapter 2G (pp. 20–24): How to Play in Rhythm? (Beat Precision Drill)
 */
export const PLAYING_IN_RHYTHM: RhythmPayload = {
  type: 'rhythm',
  title: 'Chapter 2G.1: How to Play in Rhythm (Metronome Lock)',
  subtitle: 'PDF pp. 20–24 • Locking your fingers to Beats 1, 2, 3, 4 at 90 BPM',
  track: 'play',
  durationMinutes: 6,
  source: 'course 2G (pp. 20–24)',
  objectives: [
    'Lock your keystrokes to a 90 BPM metronome click with zero rushing or dragging',
    'Switch cleanly between Quarter-note pulse, Half-note holds, and Whole-note holds',
  ],
  bpm: 90,
  timeSignature: [4, 4],
  pattern: [
    // Bar 1: Quarter notes (1, 2, 3, 4)
    { beat: 0, durationBeats: 1, label: '1' },
    { beat: 1, durationBeats: 1, label: '2' },
    { beat: 2, durationBeats: 1, label: '3' },
    { beat: 3, durationBeats: 1, label: '4' },
    // Bar 2: Half notes (1, 3)
    { beat: 4, durationBeats: 2, label: '1' },
    { beat: 6, durationBeats: 2, label: '3' },
    // Bar 3: Syncopated Quarter + Half (1, 2, 4)
    { beat: 8, durationBeats: 1, label: '1' },
    { beat: 9, durationBeats: 2, label: '2' },
    { beat: 11, durationBeats: 1, label: '4' },
    // Bar 4: Whole note (Beat 1 held for 4 beats)
    { beat: 12, durationBeats: 4, label: '1' },
  ],
  repeats: 2,
  countInBars: 1,
};

export const HOW_TO_MASTER_A_SONG: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 2H.0: How to Read & Master the 11 Course Songs',
  subtitle: 'PDF pp. 25–56 • Understanding Black vs. Red (Higher Octave) Notes & BPM Tiers',
  track: 'play',
  durationMinutes: 4,
  source: 'course 2H (pp. 25–56)',
  objectives: [
    'Understand the colour code in Chapter 2H of the PDF: Black letters = Middle Octave, Red letters = Higher Octave',
    'Follow the 3-step song mastery workflow: Wait-for-Me → Slow Rhythm → Target BPM',
    'Prepare to play all 11 Bollywood & National songs in Chapter 2H',
  ],
  cards: [
    {
      title: 'How the PDF Writes Song Notes (pp. 25–56)',
      body:
        'In Chapter 2H (pages 25 to 56), Jash provides full Right-Hand notations for 11 iconic Bollywood and patriotic songs.\n\n• Normal BLACK letters (C, D, E, F, G, A, B) sit in the Middle Octave (C4–B4).\n• RED letters in the PDF sit in the Higher Octave (C5–B5).\n• Notes with a dot underneath (like Ạ in Chura Liya) sit in the Lower Octave (A3).',
      highlight: {
        midis: [K.A3, K.C4, K.E4, K.G4, K.C5, K.E5],
        labels: { [K.A3]: 'A,', [K.C4]: 'C4', [K.E4]: 'E4', [K.G4]: 'G4', [K.C5]: 'C5 (Red)', [K.E5]: 'E5 (Red)' },
      },
      tryIt: {
        prompt: 'Press Low A3, Middle E4, and Higher C5 (Red note in the PDF).',
        targetMidis: [K.A3, K.E4, K.C5],
      },
    },
    {
      title: 'Line-by-Line Practice (Never Rush the Whole Song)',
      body:
        'Every song in Chapter 2H is broken into lyric lines. When you open any of the 11 songs next:\n\n1. Start in Step 1 (Wait-for-Me): The app pauses on every note until you press it.\n2. Use the A–B Measure Looper ("More" button) if one line has a tricky octave jump.\n3. Move to Step 2 & Step 3 to play with the metronome inside the exact BPM box shown at the bottom of the PDF page!',
    },
  ],
};

export const MASTERING_RHYTHM_CONCEPT: ConceptPayload = {
  type: 'concept',
  title: 'Chapter 2I: After This, You Will Master Rhythm!',
  subtitle: 'PDF pp. 57–58 • Finding a Song’s Tempo (BPM) & Time Signature (4/4 vs. 3/4)',
  track: 'theory',
  durationMinutes: 5,
  source: 'course 2I (pp. 57–58)',
  objectives: [
    'Tap along with any song to find its pulse and BPM speed (PDF p. 57)',
    'Distinguish 4/4 time (1-2-3-4) from 3/4 waltz time (1-2-3) (PDF p. 58)',
    'Know why rhythm accuracy matters even more than playing fast',
  ],
  cards: [
    {
      title: 'Every Song Has a Heartbeat (PDF p. 57)',
      body:
        'In Chapter 2I (pages 57–58), Jash explains why two players can press the exact same notes of "Tum Hi Ho", yet one sounds like a beginner and the other sounds like a pro: RHYTHM.\n\nNotes are only 50% of music. Playing each note on its exact beat—and holding long notes at the end of a lyric line—is the other 50%.',
    },
    {
      title: '4/4 vs. 3/4 Time Signature (PDF p. 58)',
      body:
        'Most songs fall into one of two beat cycles:\n\n• 4/4 Time (4 beats per bar: 1 – 2 – 3 – 4): Used in Tum Hi Ho, Chura Liya, Raatan Lambiyan, Pehla Nasha, Ae Dil Hai Mushkil.\n• 3/4 or 6/8 Waltz Time (3 beats per bar: 1 – 2 – 3): Used in Lag Jaa Gale and Janam Janam.\n\nAlways clap or tap 1-2-3-4 or 1-2-3 with the original song before touching the keys!',
      highlight: { midis: [K.C4, K.E4, K.G4, K.C5], labels: { [K.C4]: 'Beat 1', [K.E4]: 'Beat 2', [K.G4]: 'Beat 3', [K.C5]: 'Beat 4' } },
      tryIt: { prompt: 'Tap C4, E4, G4, C5 steadily like 4 beats of a bar.', targetMidis: [K.C4, K.E4, K.G4, K.C5] },
    },
  ],
};
