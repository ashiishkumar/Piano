import { SongScore } from '../types/music';
import { ChordSpec } from '../types/lesson';
import { PC } from './lessons/types';
import { makeRhCourseSong, makeRccrCourseSong } from './westernNotation';

/**
 * All Course Songs from the PIX Series Zero to Hero Piano Course e-book:
 *  - Module 2, Chapter 2H (pp. 25–56): 11 Right-Hand Songs
 *  - Module 4, Chapter 4G (pp. 129–132): Gulabi Aankhein (RCCR Framework Song)
 *  - Module 4, Chapter 4H (pp. 133–171): 10 RCCR Lead-Sheet Songs with Chords
 */

const C: ChordSpec = { rootPc: PC.C, quality: 'major' };
const Cs: ChordSpec = { rootPc: PC.Cs, quality: 'major' };
const D: ChordSpec = { rootPc: PC.D, quality: 'major' };
const Dm: ChordSpec = { rootPc: PC.D, quality: 'minor' };
const E: ChordSpec = { rootPc: PC.E, quality: 'major' };
const Em: ChordSpec = { rootPc: PC.E, quality: 'minor' };
const F: ChordSpec = { rootPc: PC.F, quality: 'major' };
const Fs: ChordSpec = { rootPc: PC.Fs, quality: 'major' };
const G: ChordSpec = { rootPc: PC.G, quality: 'major' };
const Gs: ChordSpec = { rootPc: PC.Gs, quality: 'major' };
const Am: ChordSpec = { rootPc: PC.A, quality: 'minor' };
const As: ChordSpec = { rootPc: PC.As, quality: 'major' };
const Asm: ChordSpec = { rootPc: PC.As, quality: 'minor' };
const Bm: ChordSpec = { rootPc: PC.B, quality: 'minor' };

// ============================================================================
// 1. CHURA LIYA HAI TUMNE JO DIL KO (PDF pp. 25–26)
// ============================================================================

const CHURA_LIYA_MELODY = `
// Chura liya hai tumne jo dil ko (PDF p. 25: A, E E D E | F# - D E | A, A, G F | E - - 0)
RH: A, E E (D E) | F# - D E | A, A, G F | E - - 0 |
// Nazar nahin churaana sanam (A, E E D E | G F D E | A, G, A, B, | C - - 0)
RH: A, E E (D E) | G F D E | A, G, (A, B,) C | A, - - 0 |
// Badalke meri tum zindagaani (A, E E D E | F# - D E | A, A, G F | E - - 0)
RH: A, E E (D E) | F# - D E | A, A, G F | E - - 0 |
// Kahin badal na jaana sanam (A, E E D E | G F D E | A, G, A, B, | A, - - 0)
RH: A, E E (D E) | G F D E | A, G, (A, B,) C | A, - - 0 |
// Oh le liya dil, oh haai mera dil (PDF p. 26: E' - D' C' | D' - C' B | C' - B A | G# E E -)
RH: E' - D' C' | D' - C' B | C' - B A | G# E E - |
// Haai dil lekar mujhko na behlaana (A B C' D' | E' D' C' B | A B C' B | A - - 0)
RH: A B C' D' | E' D' C' B | A B C' B | A - - 0 |
`;

export const ZTH_2H_CHURA_LIYA = makeRhCourseSong({
  id: 'zth-2h-chura-liya',
  title: 'Chapter 2H.1: Chura Liya Hai Tumne Jo Dil Ko (Right Hand)',
  subtitle: 'PDF pp. 25–26 • Lower-octave A, to middle E jump & high E\' chorus • 80–120 BPM',
  composer: 'R.D. Burman • PIX Series Ch. 2H',
  bpm: 96,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  bpmRange: '80–120 BPM',
  pdfPages: 'pp. 25–26',
  melodyWestern: CHURA_LIYA_MELODY,
});

// ============================================================================
// 2. TUM HI HO (PDF pp. 27–32 & pp. 165–169)
// ============================================================================

const TUM_HI_HO_MELODY = `
// Intro Piano Hook (PDF p. 27: E B A G | F# - E D | E B A G | F# G E -)
RH: E B A G | F# - E D | E B A G | F# G E - |
// Hum tere bin ab reh nahi sakte (E F# G D | E C B, - | D E F# E | D E F# -)
RH: E F# G D | E C B, - | D E F# E | D E F# - |
// Tere bina kya wajood mera (E F# G D | E C B, - | B, C D D | C B, A, B, | E - - 0)
RH: E F# G D | E C B, - | B, C D D | (C B,) A, B, |
// Kyunki tum hi ho, ab tum hi ho (G A B A | G F# G A | G F# E D | E - - 0)
RH: G A B A | G F# G A | G F# E D | E - - 0 |
// Zindagi ab tum hi ho (D E F# E | D E F# G | F# E D F# | E - - 0)
RH: D E F# E | D E F# G | F# E D F# | E - - 0 |
// Chain bhi, mera dard bhi, meri aashiqui ab tum hi ho
RH: G A B A | G F# G A | F# E D F# | E - - 0 |
`;

const TUM_HI_HO_CHORDS: ChordSpec[] = [
  // Intro (4 bars)
  Em, C, D, Em,
  // Hum tere bin (4 bars)
  Em, Am, D, Bm,
  // Tere bina kya (4 bars)
  Em, Am, Bm, Em,
  // Kyunki tum hi ho (4 bars)
  Em, C, D, Bm,
  // Zindagi ab tum hi ho (4 bars)
  C, D, Bm, Em,
  // Chain bhi mera dard bhi (4 bars)
  Em, C, D, Em,
];

export const ZTH_2H_TUM_HI_HO = makeRhCourseSong({
  id: 'zth-2h-tum-hi-ho',
  title: 'Chapter 2H.2: Tum Hi Ho (Right Hand)',
  subtitle: 'PDF pp. 27–32 • Intro Piano Hook + Verse + Chorus • 60–110 BPM',
  composer: 'Mithoon • PIX Series Ch. 2H',
  bpm: 84,
  keySignature: 'Em',
  rootSaPitchClass: PC.E,
  bpmRange: '60–110 BPM',
  pdfPages: 'pp. 27–32',
  melodyWestern: TUM_HI_HO_MELODY,
});

export const ZTH_4H_TUM_HI_HO = makeRccrCourseSong({
  id: 'zth-4h-tum-hi-ho',
  title: 'Chapter 4H.9: Tum Hi Ho (with Chords — RCCR)',
  subtitle: 'PDF pp. 165–169 • Chords: Em, C, D, Bm, Am • RCCR 4-Step Method',
  composer: 'Mithoon • PIX Series Ch. 4H',
  bpm: 84,
  keySignature: 'Em',
  rootSaPitchClass: PC.E,
  pdfPages: 'pp. 165–169',
  melodyWestern: TUM_HI_HO_MELODY,
  chords: TUM_HI_HO_CHORDS,
});

// ============================================================================
// 3. RAATAN LAMBIYAN (PDF pp. 33–35 & pp. 161–164)
// ============================================================================

const RAATAN_LAMBIYAN_MELODY = `
// Teri meri gallan ho gayi mashhoor (PDF p. 33: E G G G | A G F E D - | E G G G | A G F E D -)
RH: E G G G | (A G) (F E) D - | E G G G | (A G) (F E) D - |
// Kar na kabhi tu mujhe nazron se door (E G G G | A G F E D - | D E F E | D - C -)
RH: E G G G | (A G) (F E) D - | D E F E | D - C - |
// Kithe chaliye tu kithe chaliye (C D E G | F E D C | C D E G | F E D -)
RH: C D E G | F E D C | C D E G | F E D - |
// Kaatun kaise raatan oh saawre (G C' C' B | A G A G | G C' C' B | A G A G)
RH: G C' C' B | A G A G | G C' C' B | A G A G |
// Jiya nahi jaata sunn baawre (F A A G | F E F E | D E F E | D C C -)
RH: F A A G | F E F E | D E F E | D C C - |
`;

const RAATAN_LAMBIYAN_CHORDS: ChordSpec[] = [
  // Teri meri gallan (4 bars)
  C, G, C, G,
  // Kar na kabhi (4 bars)
  C, G, F, C,
  // Kithe chaliye (4 bars)
  Am, F, C, G,
  // Kaatun kaise raatan (4 bars)
  C, Am, C, Am,
  // Jiya nahi jaata (4 bars)
  F, Dm, G, C,
];

export const ZTH_2H_RAATAN_LAMBIYAN = makeRhCourseSong({
  id: 'zth-2h-raatan-lambiyan',
  title: 'Chapter 2H.3: Raatan Lambiyan (Right Hand)',
  subtitle: 'PDF pp. 33–35 • Middle C4 to High C\'5 Chorus Jump • 80–130 BPM',
  composer: 'Tanishk Bagchi • PIX Series Ch. 2H',
  bpm: 96,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  bpmRange: '80–130 BPM',
  pdfPages: 'pp. 33–35',
  melodyWestern: RAATAN_LAMBIYAN_MELODY,
});

export const ZTH_4H_RAATAN_LAMBIYAN = makeRccrCourseSong({
  id: 'zth-4h-raatan-lambiyan',
  title: 'Chapter 4H.8: Raatan Lambiyan (with Chords — RCCR)',
  subtitle: 'PDF pp. 161–164 • Chords: C, G, Am, F, Dm • RCCR 4-Step Method',
  composer: 'Tanishk Bagchi • PIX Series Ch. 4H',
  bpm: 96,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  pdfPages: 'pp. 161–164',
  melodyWestern: RAATAN_LAMBIYAN_MELODY,
  chords: RAATAN_LAMBIYAN_CHORDS,
});

// ============================================================================
// 4. JANA GANA MANA IN C# (PDF pp. 36–37 & pp. 143–145)
// ============================================================================

const JANA_GANA_MANA_CS_MELODY = `
// Jana gana mana adhinayaka jaya he (PDF p. 36 in C#: C# D# F F F F | F F F F D# F F# -)
RH: (C# D#) F F F | F F (D# F) F# - | F F F D# | D# D# (C, D#) C# - |
// Punjab Sindh Gujarat Maratha (C# G# G# G# | G# A# G# F# | F# F# F F# | G# - - 0)
RH: C# G# G# G# | (G# A#) G# F# - | F# F# (F D#) F# | F - - 0 |
// Vindhya Himachala Yamuna Ganga (F F F D# | G# G# F# F# | F F D# D# | C# - - 0)
RH: F F F D# | G# G# F# F# | F F D# D# | C# - - 0 |
// Jaya jaya jaya he (A# C' C#' - | C' A# G# - | F# F D# F | C# - - 0)
RH: A# C' C#' - | C' A# G# - | (F# F) (D# F) C# | C# - - 0 |
`;

const JANA_GANA_MANA_CS_CHORDS: ChordSpec[] = [
  Cs, Fs, Gs, Cs,
  Cs, Fs, Gs, Cs,
  Cs, Fs, Gs, Cs,
  Asm, Fs, Gs, Cs,
];

export const ZTH_2H_JANA_GANA_MANA = makeRhCourseSong({
  id: 'zth-2h-jana-gana-mana',
  title: 'Chapter 2H.4: Jana Gana Mana in C# (Right Hand)',
  subtitle: 'PDF pp. 36–37 • Indian National Anthem in Kali Ek (C#) • 70–110 BPM',
  composer: 'Rabindranath Tagore • PIX Series Ch. 2H',
  bpm: 84,
  keySignature: 'C#',
  rootSaPitchClass: PC.Cs,
  bpmRange: '70–110 BPM',
  pdfPages: 'pp. 36–37',
  melodyWestern: JANA_GANA_MANA_CS_MELODY,
});

export const ZTH_4H_JANA_GANA_MANA = makeRccrCourseSong({
  id: 'zth-4h-jana-gana-mana',
  title: 'Chapter 4H.3: Jana Gana Mana (with Chords in C# — RCCR)',
  subtitle: 'PDF pp. 143–145 • Chords: C#, F#, G#, A#m • RCCR 4-Step Method',
  composer: 'Rabindranath Tagore • PIX Series Ch. 4H',
  bpm: 84,
  keySignature: 'C#',
  rootSaPitchClass: PC.Cs,
  pdfPages: 'pp. 143–145',
  melodyWestern: JANA_GANA_MANA_CS_MELODY,
  chords: JANA_GANA_MANA_CS_CHORDS,
});

// ============================================================================
// 5. PEHLA NASHA (PDF pp. 38–40 & pp. 157–160)
// ============================================================================

const PEHLA_NASHA_MELODY = `
// Signature Strings Intro (PDF p. 38: C A G F | D F G A | C A G F | G - - 0)
RH: C A G F | D F G A | C A G F | G - - 0 |
// Chahe tum kuch na kaho, maine sun liya (A G F G | A G F D | F G A G | F - - 0)
RH: A G F G | A G F D | F G A G | F - - 0 |
// Ke saathi pyaar ka, mujhe chun liya (A G F G | A G F D | F G A G | F - - 0)
RH: A G F G | A G F D | F G A G | F - - 0 |
// Pehla nasha, pehla khumaar (A C' D' C' | A# A G A | G A A# A | G F F -)
RH: A C' D' C' | A# A G A | G A A# A | G F F - |
// Naya pyaar hai, naya intezaar (F G A G | F E D E | F G A G | F - - 0)
RH: F G A G | F E D E | F G A G | F - - 0 |
`;

const PEHLA_NASHA_CHORDS: ChordSpec[] = [
  F, Dm, F, C,
  F, Dm, As, F,
  F, Dm, As, F,
  F, As, C, F,
  Dm, Am, C, F,
];

export const ZTH_2H_PEHLA_NASHA = makeRhCourseSong({
  id: 'zth-2h-pehla-nasha',
  title: 'Chapter 2H.5: Pehla Nasha (Right Hand)',
  subtitle: 'PDF pp. 38–40 • Iconic Intro Melody + Verse + Chorus in F • 60–100 BPM',
  composer: 'Jatin-Lalit • PIX Series Ch. 2H',
  bpm: 82,
  keySignature: 'F',
  rootSaPitchClass: PC.F,
  bpmRange: '60–100 BPM',
  pdfPages: 'pp. 38–40',
  melodyWestern: PEHLA_NASHA_MELODY,
});

export const ZTH_4H_PEHLA_NASHA = makeRccrCourseSong({
  id: 'zth-4h-pehla-nasha',
  title: 'Chapter 4H.7: Pehla Nasha (with Chords — RCCR)',
  subtitle: 'PDF pp. 157–160 • Chords: F, Dm, A#, C, Am • RCCR 4-Step Method',
  composer: 'Jatin-Lalit • PIX Series Ch. 4H',
  bpm: 82,
  keySignature: 'F',
  rootSaPitchClass: PC.F,
  pdfPages: 'pp. 157–160',
  melodyWestern: PEHLA_NASHA_MELODY,
  chords: PEHLA_NASHA_CHORDS,
});

// ============================================================================
// 6. LAG JAA GALE (PDF pp. 41–43 & pp. 149–152)
// ============================================================================

const LAG_JAA_GALE_MELODY = `
// Lag jaa gale ke phir yeh haseen raat ho na ho (PDF p. 41: C G G G | A G F E | D E F A | G - - 0)
RH: C G G G | A G F E | D E F A | G - - 0 |
// Shaayad phir is janam mein mulaaqaat ho na ho (G B C' D' | C' B A G | F G A G | E D C -)
RH: G B C' D' | C' B A G | F G A G | (E D) C - |
// Hum ko mili hain aaj yeh ghadiyaan naseeb se (G C' C' C' | B C' D' C' | A B C' A | G - - 0)
RH: G C' C' C' | B C' D' C' | A B C' A | G - - 0 |
// Jee bhar ke dekh leejiye hum ko kareeb se (G B C' D' | C' B A G | F G A G | E D C -)
RH: G B C' D' | C' B A G | F G A G | (E D) C - |
`;

const LAG_JAA_GALE_CHORDS: ChordSpec[] = [
  C, C, Dm, G,
  G, F, G, C,
  C, G, F, C,
  G, F, G, C,
];

export const ZTH_2H_LAG_JAA_GALE = makeRhCourseSong({
  id: 'zth-2h-lag-jaa-gale',
  title: 'Chapter 2H.6: Lag Jaa Gale (Right Hand)',
  subtitle: 'PDF pp. 41–43 • Expressive C-to-G Leap & High D\'5 Arch • 70–110 BPM',
  composer: 'Madan Mohan • PIX Series Ch. 2H',
  bpm: 82,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  bpmRange: '70–110 BPM',
  pdfPages: 'pp. 41–43',
  melodyWestern: LAG_JAA_GALE_MELODY,
});

export const ZTH_4H_LAG_JAA_GALE = makeRccrCourseSong({
  id: 'zth-4h-lag-jaa-gale',
  title: 'Chapter 4H.5: Lag Jaa Gale (with Chords — RCCR)',
  subtitle: 'PDF pp. 149–152 • Chords: C, Dm, G, F • RCCR 4-Step Method',
  composer: 'Madan Mohan • PIX Series Ch. 4H',
  bpm: 82,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  pdfPages: 'pp. 149–152',
  melodyWestern: LAG_JAA_GALE_MELODY,
  chords: LAG_JAA_GALE_CHORDS,
});

// ============================================================================
// 7. O MERE DIL KE CHAIN (PDF pp. 44–45 & pp. 153–156)
// ============================================================================

const O_MERE_DIL_MELODY = `
// O mere dil ke chain (PDF p. 44: E A B C' | B A G# A | E A B C' | B A - 0)
RH: E A B C' | B A G# A | E A B C' | B A - 0 |
// Chain aaye mere dil ko dua kijiye (A C' D' E' | D' C' B A | G B C' D' | B A - 0)
RH: A C' D' E' | D' C' B A | G B C' D' | B A - 0 |
// Apna hi saaya dekh ke tum (E' E' D' E' | F' E' D' C' | D' D' C' D' | E' C' - 0)
RH: E' E' D' E' | F' E' D' C' | D' D' C' D' | E' C' - 0 |
// Jaane jahaan sharma gaye (B C' D' C' | B A G F | E G# B G# | A - - 0)
RH: B C' D' C' | B A G F | E G# B G# | A - - 0 |
`;

const O_MERE_DIL_CHORDS: ChordSpec[] = [
  Am, E, Am, Am,
  Am, Dm, G, Am,
  Am, Dm, G, C,
  G, F, E, Am,
];

export const ZTH_2H_O_MERE_DIL = makeRhCourseSong({
  id: 'zth-2h-o-mere-dil-ke-chain',
  title: 'Chapter 2H.7: O Mere Dil Ke Chain (Right Hand)',
  subtitle: 'PDF pp. 44–45 • Classic Kishore-R.D. Burman Melody in A Minor • 80–120 BPM',
  composer: 'R.D. Burman • PIX Series Ch. 2H',
  bpm: 94,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  bpmRange: '80–120 BPM',
  pdfPages: 'pp. 44–45',
  melodyWestern: O_MERE_DIL_MELODY,
});

export const ZTH_4H_O_MERE_DIL = makeRccrCourseSong({
  id: 'zth-4h-o-mere-dil-ke-chain',
  title: 'Chapter 4H.6: O Mere Dil Ke Chain (with Chords — RCCR)',
  subtitle: 'PDF pp. 153–156 • Chords: Am, G, F, E, Dm, C • RCCR 4-Step Method',
  composer: 'R.D. Burman • PIX Series Ch. 4H',
  bpm: 94,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  pdfPages: 'pp. 153–156',
  melodyWestern: O_MERE_DIL_MELODY,
  chords: O_MERE_DIL_CHORDS,
});

// ============================================================================
// 8. VANDE MATARAM (PDF pp. 46–47 & pp. 170–171)
// ============================================================================

const VANDE_MATARAM_MELODY = `
// Vande Mataram, Vande Mataram (PDF p. 46: C D F G | F G B C' | C' - - 0)
RH: C D F G | F G B C' | C' - - 0 | (D' C') A G F - |
// Sujalam suphalam malayaja sheetalam (F E D E | F G A G | G B C' B | C' - - 0)
RH: F E D E | F G A G | G B C' B | C' - - 0 |
// Shasyashyamalam Mataram, Vande Mataram (C' D' C' B | A G F E | D F G B | C' - - 0)
RH: C' D' C' B | A G F E | D F G B | C' - - 0 |
`;

const VANDE_MATARAM_CHORDS: ChordSpec[] = [
  C, G, C, F,
  Dm, F, G, C,
  Am, F, G, C,
];

export const ZTH_2H_VANDE_MATARAM = makeRhCourseSong({
  id: 'zth-2h-vande-mataram',
  title: 'Chapter 2H.8: Vande Mataram (Right Hand)',
  subtitle: 'PDF pp. 46–47 • Desh Raag Patriotic Classic in C • 70–110 BPM',
  composer: 'Bankim Chandra Chatterjee • PIX Series Ch. 2H',
  bpm: 84,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  bpmRange: '70–110 BPM',
  pdfPages: 'pp. 46–47',
  melodyWestern: VANDE_MATARAM_MELODY,
});

export const ZTH_4H_VANDE_MATARAM = makeRccrCourseSong({
  id: 'zth-4h-vande-mataram',
  title: 'Chapter 4H.10: Vande Mataram (with Chords — RCCR)',
  subtitle: 'PDF pp. 170–171 • Chords: C, Dm, F, G, Am • RCCR 4-Step Method',
  composer: 'Bankim Chandra Chatterjee • PIX Series Ch. 4H',
  bpm: 84,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  pdfPages: 'pp. 170–171',
  melodyWestern: VANDE_MATARAM_MELODY,
  chords: VANDE_MATARAM_CHORDS,
});

// ============================================================================
// 9. KYA HUA TERA WADA (PDF pp. 48–49 & pp. 146–148)
// ============================================================================

const KYA_HUA_MELODY = `
// Kya hua tera wada, woh kasam woh iraada (PDF p. 48: G E C - | E G A G | F A G F | E - - 0)
RH: G E C - | E G A G | F A G F | E - - 0 |
// Bhoolega dil jis din tumhein (C D E F | G A A# A | G F E D | C - - 0)
RH: C D E F | G A A# A | G F E D | C - - 0 |
// Woh din zindagi ka aakhri din hoga (G C' C' C' | D' C' A# A | G A G F | E D C -)
RH: G C' C' C' | D' C' A# A | G A G F | (E D) C - |
// Yaad hai mujhko tune kaha tha (C' C' B C' | A C' B A | G A G F | E - - 0)
RH: C' C' B C' | A C' B A | G A G F | E - - 0 |
`;

const KYA_HUA_CHORDS: ChordSpec[] = [
  C, Am, F, C,
  C, As, G, C,
  C, F, G, C,
  Am, F, G, C,
];

export const ZTH_2H_KYA_HUA = makeRhCourseSong({
  id: 'zth-2h-kya-hua-tera-wada',
  title: 'Chapter 2H.9: Kya Hua Tera Wada (Right Hand)',
  subtitle: 'PDF pp. 48–49 • Expressive A#Komala Touch in C • 80–120 BPM',
  composer: 'R.D. Burman • PIX Series Ch. 2H',
  bpm: 92,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  bpmRange: '80–120 BPM',
  pdfPages: 'pp. 48–49',
  melodyWestern: KYA_HUA_MELODY,
});

export const ZTH_4H_KYA_HUA = makeRccrCourseSong({
  id: 'zth-4h-kya-hua-tera-wada',
  title: 'Chapter 4H.4: Kya Hua Tera Wada (with Chords — RCCR)',
  subtitle: 'PDF pp. 146–148 • Chords: C, Am, F, A#, G • RCCR 4-Step Method',
  composer: 'R.D. Burman • PIX Series Ch. 4H',
  bpm: 92,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  pdfPages: 'pp. 146–148',
  melodyWestern: KYA_HUA_MELODY,
  chords: KYA_HUA_CHORDS,
});

// ============================================================================
// 10. AE DIL HAI MUSHKIL (PDF pp. 50–53 & pp. 134–138)
// ============================================================================

const AE_DIL_MELODY = `
// Tu safar mera, hai tu hi meri manzil (PDF p. 50: E A B C' | B A G A | E A B C' | D' C' B -)
RH: E A B C' | B A G A | E A B C' | D' C' B - |
// Tere bina guzaara, ae dil hai mushkil (E G A B | A G F G | E D C D | E - - 0)
RH: E G A B | A G F G | E D C D | E - - 0 |
// Tu mera khuda, tu hi dua mein shaamil (E A B C' | B A G A | E A B C' | D' C' B -)
RH: E A B C' | B A G A | E A B C' | D' C' B - |
// Tere bina guzaara, ae dil hai mushkil (E G A B | A G F G | E D C B, | A, - - 0)
RH: E G A B | A G F G | E D C B, | A, - - 0 |
// Mujhe aazmaati hai teri kami (A B C' D' | E' D' C' B | A B C' B | A G F E)
RH: A B C' D' | E' D' C' B | A B C' B | A G F E |
// Meri har kami ko hai tu laazmi (F G A B | C' B A G | F E D E | A, - - 0)
RH: F G A B | C' B A G | F E D E | A, - - 0 |
`;

const AE_DIL_CHORDS: ChordSpec[] = [
  Am, F, C, G,
  Em, F, Dm, E,
  Am, F, C, G,
  Em, F, G, Am,
  Am, G, F, Em,
  Dm, G, Em, Am,
];

export const ZTH_2H_AE_DIL = makeRhCourseSong({
  id: 'zth-2h-ae-dil-hai-mushkil',
  title: 'Chapter 2H.10: Ae Dil Hai Mushkil (Right Hand)',
  subtitle: 'PDF pp. 50–53 • Soaring A Minor Ballad Hook • 60–100 BPM',
  composer: 'Pritam • PIX Series Ch. 2H',
  bpm: 84,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  bpmRange: '60–100 BPM',
  pdfPages: 'pp. 50–53',
  melodyWestern: AE_DIL_MELODY,
});

export const ZTH_4H_AE_DIL = makeRccrCourseSong({
  id: 'zth-4h-ae-dil-hai-mushkil',
  title: 'Chapter 4H.1: Ae Dil Hai Mushkil (with Chords — RCCR)',
  subtitle: 'PDF pp. 134–138 • Chords: Am, F, C, G, Dm, Em, E • RCCR 4-Step Method',
  composer: 'Pritam • PIX Series Ch. 4H',
  bpm: 84,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  pdfPages: 'pp. 134–138',
  melodyWestern: AE_DIL_MELODY,
  chords: AE_DIL_CHORDS,
});

// ============================================================================
// 11. JAB KOI BAAT BIGAD JAAYE (PDF pp. 54–56 & pp. 139–142)
// ============================================================================

const JAB_KOI_BAAT_MELODY = `
// Jab koi baat bigad jaaye, jab koi mushkil pad jaaye (PDF p. 54: E G A G | E D C D | E G A G | E D C -)
RH: E G A G | E D C D | E G A G | E D C - |
// Tum dena saath mera, o humnawaaz (C D E F | A G F E | D E F D | C - - 0)
RH: C D E F | A G F E | D E F D | C - - 0 |
// Na koi hai, na koi tha, zindagi mein tumhaare siva (G C' C' C' | B A G A | G A G F | E D C -)
RH: G C' C' C' | B A G A | G A G F | E D C - |
// Tum dena saath mera, o humnawaaz (C D E F | A G F E | D E F D | C - - 0)
RH: C D E F | A G F E | D E F D | C - - 0 |
`;

const JAB_KOI_BAAT_CHORDS: ChordSpec[] = [
  C, Am, C, Am,
  F, C, G, C,
  C, Am, F, G,
  F, C, G, C,
];

export const ZTH_2H_JAB_KOI_BAAT = makeRhCourseSong({
  id: 'zth-2h-jab-koi-baat',
  title: 'Chapter 2H.11: Jab Koi Baat Bigad Jaaye (Right Hand)',
  subtitle: 'PDF pp. 54–56 • Flowing C Major Evergreen Melody • 80–120 BPM',
  composer: 'Rajesh Roshan • PIX Series Ch. 2H',
  bpm: 92,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  bpmRange: '80–120 BPM',
  pdfPages: 'pp. 54–56',
  melodyWestern: JAB_KOI_BAAT_MELODY,
});

export const ZTH_4H_JAB_KOI_BAAT = makeRccrCourseSong({
  id: 'zth-4h-jab-koi-baat',
  title: 'Chapter 4H.2: Jab Koi Baat Bigad Jaaye (with Chords — RCCR)',
  subtitle: 'PDF pp. 139–142 • Classic I–vi–IV–V Loop (C, Am, F, G) • RCCR 4-Step Method',
  composer: 'Rajesh Roshan • PIX Series Ch. 4H',
  bpm: 92,
  keySignature: 'C',
  rootSaPitchClass: PC.C,
  pdfPages: 'pp. 139–142',
  melodyWestern: JAB_KOI_BAAT_MELODY,
  chords: JAB_KOI_BAAT_CHORDS,
});

// ============================================================================
// 12. CHAPTER 4G MASTERCLASS SONG: GULABI AANKHEIN (PDF pp. 129–132)
// ============================================================================

const GULABI_AANKHEIN_MELODY = `
// Intro Motif (PDF p. 129: E E F E | D C B, C | D D E D | C B, A, -)
RH: E E F E | D C B, C | D D E D | C B, A, - |
// Gulabi aankhein jo teri dekhi (A, B, C E | E D E F | D B, D E | C A, C D | B, - - 0)
RH: (A, B,) C E | E (D E) F - | (G, A,) B, D | D (C D) E - |
// Sharaabi yeh dil ho gaya (F, G, A, C | C B, C D | E, G#, B, C | B, A, A, -)
RH: (F, G,) A, C | C (B, C) D - | E, G#, B, C | B, A, A, - |
// Sambhaalo mujhko o mere yaaron (A, B, C E | E D E F | G, A, B, D | D C D E)
RH: (A, B,) C E | E (D E) F - | (G, A,) B, D | D (C D) E - |
// Sambhalna mushkil ho gaya (F, G, A, C | C B, C D | E, G#, B, C | B, A, A, -)
RH: (F, G,) A, C | C (B, C) D - | E, G#, B, C | B, A, A, - |
`;

const GULABI_AANKHEIN_CHORDS: ChordSpec[] = [
  Am, G, F, E,
  Am, Am, G, G,
  F, F, E, Am,
  Am, Am, G, G,
  F, F, E, Am,
];

export const ZTH_4G_GULABI_AANKHEIN = makeRccrCourseSong({
  id: 'zth-4g-gulabi-aankhein',
  title: 'Chapter 4G: Gulabi Aankhein (The RCCR Framework Masterclass Song)',
  subtitle: 'PDF pp. 129–132 • Andalusian Cadence (Am – G – F – E) • First Two-Hand Song!',
  composer: 'R.D. Burman • PIX Series Ch. 4G',
  bpm: 96,
  keySignature: 'Am',
  rootSaPitchClass: PC.A,
  pdfPages: 'pp. 129–132',
  melodyWestern: GULABI_AANKHEIN_MELODY,
  chords: GULABI_AANKHEIN_CHORDS,
});

export const ZTH_CHAPTER_2H_SONGS: SongScore[] = [
  ZTH_2H_CHURA_LIYA,
  ZTH_2H_TUM_HI_HO,
  ZTH_2H_RAATAN_LAMBIYAN,
  ZTH_2H_JANA_GANA_MANA,
  ZTH_2H_PEHLA_NASHA,
  ZTH_2H_LAG_JAA_GALE,
  ZTH_2H_O_MERE_DIL,
  ZTH_2H_VANDE_MATARAM,
  ZTH_2H_KYA_HUA,
  ZTH_2H_AE_DIL,
  ZTH_2H_JAB_KOI_BAAT,
];

export const ZTH_CHAPTER_4_SONGS: SongScore[] = [
  ZTH_4G_GULABI_AANKHEIN,
  ZTH_4H_AE_DIL,
  ZTH_4H_JAB_KOI_BAAT,
  ZTH_4H_JANA_GANA_MANA,
  ZTH_4H_KYA_HUA,
  ZTH_4H_LAG_JAA_GALE,
  ZTH_4H_O_MERE_DIL,
  ZTH_4H_PEHLA_NASHA,
  ZTH_4H_RAATAN_LAMBIYAN,
  ZTH_4H_TUM_HI_HO,
  ZTH_4H_VANDE_MATARAM,
];
