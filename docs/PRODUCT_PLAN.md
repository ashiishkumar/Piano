# VirtuosoStudio Product Plan: depth before launch

Direction set by the owner: do not plan a launch now. Make the product feature-rich, make the first session effortless for someone who has never touched a keyboard, make the lessons deep, and in parallel teach the learner to master their Yamaha PSR-E373 itself.

Source material:
- Existing code (6 stages, 19 lessons, real-time MIDI evaluation engine).
- The "Zero to Hero Piano" course outline the owner supplied, transcribed in `reference/zero-to-hero-course-outline.md`. Items are cited below as [course 4B] etc.
- Yamaha PSR-E373 official spec sheet ([Yamaha](https://dk.yamaha.com/en/musical-instruments/keyboards/products/portable-keyboards/psr-e373/specs.html)).

Market research from the earlier pass is parked in `MARKET_NOTES.md`.

---

## 1. What a first-time user sees today

Findings from reading `App.tsx`, `TopDiagnosticsBar`, `PracticeTransportBar`, `LiveTelemetryPanel`, `TeacherLessonModals`, and the store's initial state:

1. **The onboarding wizard never shows by itself.** `showOnboardingWizard` defaults to `false` and nothing sets it on first run. The Find-Middle-C wizard only appears if the user finds the button for it.
2. **The app opens straight into the Practice Studio, already playing.** `isPlaying: true`, Wait-for-Me mode, Lesson 1.1. A new user is dropped into a dark workstation with a 14-item diagnostics header (channel, latency, velocity, CC64), a two-row transport bar with roughly twenty controls, falling notes, a telemetry sidebar, and a 61-key keyboard.
3. **"Guided" mode hides almost nothing.** `setUiComplexityMode('guided')` only switches the layout to highway and turns off the heatmap. The transport bar and telemetry panel are rendered unconditionally in `App.tsx`.
4. **Lesson selection is a `<select>` dropdown** of all lessons and imported songs. There is no path, no sense of "where am I", and no locked/unlocked progression even though `masteryMap` already stores per-song best scores.
5. **Vocabulary is engineering-facing.** Tab names are "Practice Studio", "6-Stage Curriculum", "MIDI / XML Importer", "Analytics & AI Coach". Header reads "61-Key Interactive Pedagogy & Telemetry Workstation". Alerts reference "Module C.4".
6. **There is exactly one lesson type**: play a `ScoreNote[]` arrangement in wait or rhythm mode. Every lesson is a song. Theory, ear training, chord drills, rhythm-only drills, quizzes, and keyboard-function tasks cannot be expressed.

Items 1–5 are the navigation problem. Item 6 is why the lessons feel limited: the content model cannot hold anything except songs.

---

## 2. Navigation redesign: first session to first correct note in under 60 seconds

### Screens (four tabs, renamed)
| Today | Path | My Songs | Progress |
|---|---|---|---|
| Default landing. One big "Continue: Lesson 2.3 Thumb Tuck" button, today's 10-minute plan (3 items generated from last session's prescriptions), streak. Nothing else. | The curriculum as a vertical path of levels and lesson nodes with locked / available / passed / mastered states. Track colour tags (Play, Theory, Chords, Ear, Keyboard, Perform) with a filter. Tap a node → briefing → start. | The importer, renamed. Drop a MIDI/MusicXML file, get a lesson. | The analytics dashboard, renamed. Skill radar, heatmap, history. |

### Lesson player: one screen, three regions, progressive disclosure
- **Instruction card** (hero, large type): what to do right now. The existing live teacher prompt ("Press Re with finger 2") becomes this.
- **Visualizer**: falling notes, keyboard highlights, a diagram, or a panel picture, chosen by lesson type.
- **Keyboard**: the virtual 61 keys, always visible.
- Everything else (telemetry sidebar, loop and tempo controls, tier and notation switches, diagnostics) is hidden in Guided mode and lives behind a "More" drawer or in Pro mode. `uiComplexityMode` has to actually gate rendering in `App.tsx`.

### First-run flow
1. Welcome (one sentence, one button).
2. Keyboard check: "We hear your Yamaha PSR-E373" if a MIDI input appears, otherwise "No keyboard yet? Use your computer keys: Q W E R T = Sa Re Ga Ma Pa" with the existing QWERTY fallback.
3. Find Middle C (existing wizard step 1, now auto-shown).
4. Play Sa Re Ga (a 20-second win with the wait engine).
5. "Here is your path" → lands on Today with Lesson 1.1 ready.

Persist a `hasCompletedFirstRun` flag in the profile so this shows exactly once.

### Vocabulary rules
One term per concept, learner-facing: Lesson, Step, Level, Path, Practice, Song, Keyboard. Model-specific text ("PSR-E373 Edition", "CC64", "CH 1 | 1.4 ms") moves to the Keyboard track lessons and the Pro diagnostics drawer, where it is content rather than clutter.

---

## 3. Curriculum: 10 levels, about 90 lessons

Merged from the existing 6 stages, the course outline, and a PSR-E373 track that is interleaved where each function first becomes useful. Legend: [existing N.N] = already authored; [course NX] = from the supplied outline; **[K]** = keyboard-mastery lesson; (type) = lesson type from section 4.

### Level 1 — First Touch
| # | Lesson | Source | Type |
|---|---|---|---|
| 1.1 | Meet your PSR-E373: power, volume, Portable Grand button, headphones, USB TO HOST, connecting to this app | **[K]** | keyboard-task |
| 1.2 | Posture and hand shape | [course 2A] | concept |
| 1.3 | The keyboard map: 2-and-3 black-key groups, finding every C, Middle C | existing wizard | concept |
| 1.4 | Sargam and Western names; which to use and why both are shown | [course 2B, 2D] | concept |
| 1.5 | The 5-finger home (Sa Re Ga Ma Pa, C4–G4) | [existing 1.1] | score |
| 1.6 | Alankar 1: stepwise palta | [existing 1.2] | score |
| 1.7 | Alankar 2: skips | [existing 1.3] | score |
| 1.8 | Alankars 3–6: the standard set, generated in any key | [course 2B] | score (generated) |
| 1.9 | Touch Response: Soft / Medium / Hard / Fixed, what velocity is, hear and see it | [course 9A] **[K]** | keyboard-task |
| 1.10 | Top 4 right-hand exercises | [course 2E] | score |
| 1.11 | First melodies in 5 notes: Jana Gana Mana, Ode to Joy | [existing 1.4] [course 2C] | score |

### Level 2 — Rhythm and the Full Octave
| # | Lesson | Source | Type |
|---|---|---|---|
| 2.1 | Note values: whole, half, quarter, eighth; tap them | [course 2F] | rhythm |
| 2.2 | Playing in rhythm with a metronome; the PSR-E373 metronome and TEMPO/TAP | [course 2G] **[K]** | rhythm + keyboard-task |
| 2.3 | The thumb tuck (1-2-3-1) | [existing 2.1] | score |
| 2.4 | Full saptak / C major scale | [existing 2.2] | score |
| 2.5 | Black keys: Raag Yaman and Tivra Ma | [existing 2.3] | score |
| 2.6 | Song: Om Shanti Om | [existing 2.4] | score |
| 2.7 | Song: Happy Birthday (3/4, octave reach) | [existing 2.5] | score |
| 2.8 | How to master any song: hands separate → slow → loop the hard bar → full tempo | [course 2H] | concept (wires to Step 1/2/3 and the loop feature) |
| 2.9 | Rhythm mastery test | [course 2I] | checkpoint |
| 2.10 | Right-hand checkpoint (unlocks Level 3) | [course 2J] | checkpoint |

### Level 3 — Scales and Chords: the Theory
| # | Lesson | Source | Type |
|---|---|---|---|
| 3.1 | Major scale formula (W W H W W W H) in all 12 keys | [course 3A] | concept + score (generated) |
| 3.2 | Circle of fifths | [course 3A] | concept (interactive diagram) |
| 3.3 | Natural minor formula | [course 3B] | concept + score |
| 3.4 | Building triads from scale degrees | [course 3C] | concept + chord-drill |
| 3.5 | Chord inversions | [course 3D] [existing 4.1] | chord-drill |
| 3.6 | Chord types: Maj7, Dom7, Aug, Dim, Sus; the PSR-E373 Chord Dictionary as a companion | [course 3E] **[K]** | concept + chord-drill |
| 3.7 | Scale types: harmonic and melodic minor, pentatonic, blues | [course 3F] | concept + score |
| 3.8 | Relative major and minor | [course 3G] | concept + quiz |
| 3.9 | Theory checkpoint | | checkpoint (quiz + play) |

### Level 4 — Chord Shifting and Songs with Chords
| # | Lesson | Source | Type |
|---|---|---|---|
| 4.1 | How to shift chords: common tones, minimal movement | [course 4A] | concept + chord-drill |
| 4.2 | Chord shifting test 1 | [course 4B] | chord-drill (timed) |
| 4.3 | Chord shifting test 2 | [course 4C] | chord-drill (timed) |
| 4.4 | Five exercises for changing chords | [course 4D] | chord-drill |
| 4.5 | Chords on the beat: four lessons | [course 4E] | chord-drill (metronome-locked) |
| 4.6 | Advanced chord coordination | [course 4F] | score |
| 4.7 | RCCR framework for songs with chords | [course 4G] | concept + score — **definition needed from owner** |
| 4.8 | Playing songs with chords: melody RH, block chords LH | [course 4H] | score |
| 4.9 | Advanced chords in context: 7ths, 9ths, slash chords | [course 4I] | chord-drill |
| 4.10 | Smart Chord and Multi Finger, ACMP ON/OFF, SYNC START: let the keyboard play the band | [course 9D] **[K]** | keyboard-task (MIDI-verified) |
| 4.11 | The PSR-E373's built-in Chord Study (12) and Chord Progression (30) songs | **[K]** | keyboard-task |

### Level 5 — Left Hand and Two-Hand Coordination
| # | Lesson | Source | Type |
|---|---|---|---|
| 5.1 | Left-hand 5-finger home (C3–G3) | [existing 3.1] | score |
| 5.2 | Five exercises to make the left hand powerful | [course 5A] | score |
| 5.3 | Advanced left-hand exercises | [course 5B] | score |
| 5.4 | Mirror hands (contrary motion) | [existing 3.2] | score |
| 5.5 | Drone and melody (2-against-1) | [existing 3.3] | score |
| 5.6 | Establishing two-hand coordination | [course 5C] | score |
| 5.7 | Your daily practice routine (the app builds it from your weak spots) | [course 5D] | concept + generated plan |
| 5.8 | Master playing with both hands | [course 5E] | score |
| 5.9 | The twister exercise | [course 5F] | score |
| 5.10 | Hanon No. 1 | [existing 5.1] | score |

### Level 6 — Arpeggios
| # | Lesson | Source | Type |
|---|---|---|---|
| 6.1 | Introduction to arpeggios | [course 6A] | concept |
| 6.2 | Coordination exercises in 4/4 | [course 6B] | pattern |
| 6.3 | Coordination exercises in 3/4 | [course 6C] | pattern |
| 6.4 | Four-step process to play songs with arpeggios | [course 6D] | concept + pattern |
| 6.5 | Seven universal 4/4 patterns | [course 6E] | pattern (library) |
| 6.6 | Exceptional patterns | [course 6F] | pattern |
| 6.7 | Four universal 3/4 patterns | [course 6G] | pattern |
| 6.8 | Identify the pattern in your favourite song | [course 6H] | pattern + importer |
| 6.9 | Build your own pattern | [course 6I] | pattern (editor) |
| 6.10 | Improvise with arpeggios | [course 6J] | pattern (free) |
| 6.11 | Bollywood ballad: 1-5-8-5 flow | [existing 4.2] | score |
| 6.12 | The PSR-E373 Arpeggio function (150 types) and Harmony (26 types) | [course 9C] **[K]** | keyboard-task |

### Level 7 — Ear Training
| # | Lesson | Source | Type |
|---|---|---|---|
| 7.1 | Hear it, play it: single notes against Sa | [course 7A] | ear |
| 7.2 | Intervals | | ear |
| 7.3 | Short melodies by ear (Bollywood hooks, 3–5 notes) | | ear |
| 7.4 | Major or minor chord by ear | [course 8B] | ear |
| 7.5 | Play any song by ear: the method | [course 7A] | concept + ear |

### Level 8 — Finding the Scale and Chords of Any Song
| # | Lesson | Source | Type |
|---|---|---|---|
| 8.1 | How to find the scale of a song (the app's key detection confirms your answer on imported songs) | [course 8A] | concept + quiz |
| 8.2 | Major or minor? | [course 8B] | ear + quiz |
| 8.3 | Chord families: I ii iii IV V vi in every key | [course 8C] | concept + chord-drill |
| 8.4 | Finding chords by ear | [course 8D] | ear |
| 8.5 | Priority progressions: I–V–vi–IV, I–vi–IV–V, ii–V–I, Bollywood favourites | [course 8E] | pattern |

### Level 9 — Your Keyboard as an Instrument (PSR-E373 deep dive)
| # | Lesson | Source | Type |
|---|---|---|---|
| 9.1 | Touch sensitivity in performance: shaping dynamics | [course 9A] **[K]** | score (dynamics-scored) |
| 9.2 | Fillers: MAIN/AUTO FILL, INTRO/ENDING/rit. | [course 9B] **[K]** | keyboard-task |
| 9.3 | Harmony types and when to use them | [course 9C] **[K]** | keyboard-task |
| 9.4 | Dual (layer), Split, and rhythm tracks | [course 9D] **[K]** | keyboard-task (MIDI-verified) |
| 9.5 | Sustain pedal, with the nocturne voicing study | [course 9E] [existing 6.1] **[K]** | score |
| 9.6 | Voices: the 622, the featured Live!/Sweet!/Cool!/Super Articulation Lite voices, Music Database and One Touch Setting | **[K]** | keyboard-task (MIDI-verified) |
| 9.7 | Effects: Reverb (12), Chorus (5), DSP (38), Master EQ (6) | **[K]** | keyboard-task |
| 9.8 | Registration Memory: save your setups on the 9 buttons | **[K]** | keyboard-task |
| 9.9 | Recording on the keyboard (5 songs × 2 tracks) and USB audio into the computer | **[K]** | keyboard-task |
| 9.10 | Keys to Success, Lesson 1–3 (Listening/Timing/Waiting), Phrase Repeat, A-B Repeat: using the built-in teacher with this app | **[K]** | keyboard-task |
| 9.11 | Transpose, Tuning, Duo mode, Melody Suppressor with AUX IN, pitch bend wheel | **[K]** | keyboard-task |

### Level 10 — Performing
| # | Lesson | Source | Type |
|---|---|---|---|
| 10.1 | What to play with a singer | [course 10A] | concept + pattern |
| 10.2 | Making your own intro and outro | [course 10B] | concept + pattern |
| 10.3 | Transposing for a singer's range, on the keyboard and in your head | [course 10C] **[K]** | concept + score (any key) |
| 10.4 | Stage presence and expression | [course 10C] | concept |
| 10.5 | Grand staff landmark reflexes | [existing 5.2] | score |
| 10.6 | Czerny Op. 299 velocity study | [existing 5.3] | score |
| 10.7 | Bach: Minuet in G | [existing 5.4] | score |
| 10.8 | A Bollywood set | owner to choose | score |
| 10.9 | Final recital: record a three-song set | | checkpoint |

Count: 11 + 10 + 9 + 11 + 10 + 12 + 5 + 5 + 11 + 9 = **93 lessons**, of which 19 exist, 17 are keyboard-track, and the rest are new. The path is encoded in `src/content/path.ts`.

---

## 4. Lesson types the engine must support

This is the core of "feature-rich". Today `SongScore` is the only content unit. Replace it with a `Lesson` that has a `type` and a type-specific payload; `score` lessons wrap the existing `SongScore` unchanged.

| Type | What the learner does | What the engine needs | Reuses |
|---|---|---|---|
| **score** | Plays an arrangement in wait/rhythm mode | Nothing new | Everything existing |
| **concept** | Reads 1–4 short cards; keyboard lights up the pattern (scale, chord, landmark); optional "now you play it" check: a set of pitches in any order | Pitch-set matcher (order-free); keyboard highlight API; card renderer | Keyboard component, wait engine |
| **rhythm** | Taps a rhythm on any key | Pitch-agnostic matching: evaluate `deltaMs` only | Timing classifier, metronome |
| **chord-drill** | Sees a chord symbol, plays all its notes; sequences of chords; timed test variant scores transition time | Chord recogniser (pitch-class set → name, with inversion and octave tolerance); transition timer | `transitionDelayMs` already measured in wait mode |
| **pattern** | Plays an accompaniment pattern over a chord progression; library of templates; editor to build one | Generator: progression × template × key → `ScoreNote[]`, then hand to the score engine | Score engine, importer's fingering estimator |
| **ear** | Hears a target (note, interval, chord, 3–5 note phrase), plays it back; no visual cue | Hidden-target mode (falling notes suppressed), replay button, same matcher | Audio engine, matcher |
| **quiz** | Answers multiple choice, or answers by pressing the right key | Simple renderer; "press the key" uses the pitch-set matcher | Keyboard |
| **keyboard-task** | Follows panel instructions on the PSR-E373; the app confirms over MIDI where it can, otherwise the learner taps "Done" | Keyboard-state tracker (section 5); panel diagram with the relevant button highlighted | MIDIManager |
| **checkpoint** | A short test built from the types above with pass thresholds; gates the next level | Composite runner; lesson progress model | Session scoring |

### Supporting engine work
- **Lesson progress model**: `lessonId → locked | available | in-progress | passed | mastered`, path order, checkpoint gating. Generalises `masteryMap`.
- **Transposition**: any score lesson in any key, with 61-key range folding (`foldIntoPsrE373Range` exists).
- **Generators**: alankars × thaat/scale, scales × 12 keys, chords × types × inversions, arpeggio templates × progressions. A few hundred drills from a few dozen templates.
- **Chord recogniser** and **key detection** (Krumhansl–Schmuckler profile on imported MIDI) for Levels 3, 4, 6, 8, and a live "chord you are holding" display.
- **Scoring engine extracted into pure functions with tests.** Adding seven lesson types to a 1,300-line store without tests will break the one type that works. This is an enabler, not hygiene.
- **A "Lesson Lab" dev view**: pick any lesson, preview it, see the MIDI monitor. Needed for authoring 70 new lessons and for verifying what the PSR-E373 actually transmits.

---

## 5. PSR-E373 mastery track: what the app can verify over USB

The PSR-E373 is a 16-channel multitimbral instrument that transmits on multiple channels depending on what the panel is doing ([Yamaha spec](https://dk.yamaha.com/en/musical-instruments/keyboards/products/portable-keyboards/psr-e373/specs.html); [YamahaMusicians forum on PSR-E MIDI behaviour](https://www.yamahamusicians.com/forum/viewtopic.php?t=8919)). Today `MIDIManager` handles Note On/Off and CC64 only and drops everything at or above `0xF8`. Extending it gives the keyboard track real feedback that no other app offers:

| Function | How the app can tell | Confidence |
|---|---|---|
| Voice selected | Program Change (0xC0) + Bank Select (CC0/CC32) on the main channel | High |
| Dual (layer) on | One key press → Note On on two channels | High |
| Split on | Keys below the split point arrive on a different channel | High |
| Style running | Note traffic on channels 9–16 (drums on 10) | High |
| Chord fed to ACMP (Smart Chord / Multi Finger) | Bass/chord part notes on the style channels; the chord recogniser names it | High |
| Sustain pedal | CC64 (already handled) | Done |
| Pitch bend wheel | 0xE0 messages | High |
| Transpose setting | Notes arrive offset from what the lesson expects | High |
| Touch Response = Fixed | Every velocity identical; Soft/Medium/Hard shift the distribution | Medium (infer) |
| Style tempo | MIDI Clock (0xF8) if transmitted during style playback; would let the falling notes lock to the keyboard's own band | Verify on hardware |
| Harmony / Arpeggio generated notes | Possibly transmitted as extra notes | Verify on hardware |
| Reverb / Chorus depth | Possibly CC91 / CC93 | Verify on hardware |
| Registration recall | Burst of Program Change / CC | Medium |
| Volume knob, Master EQ, DSP type, metronome, recording, headphones, AUX IN | Not transmitted | Learner confirms "Done" |

The "verify on hardware" rows take ten minutes with the Lesson Lab MIDI monitor and the owner's keyboard.

Two extra opportunities from the spec sheet:
- **USB audio interface (44.1 kHz, 16-bit).** The PSR-E373 sends its own audio over the same USB cable. The app can record the learner's recital with the keyboard's real voices (Lesson 10.7) and let them hear the keyboard's voices through computer headphones.
- **Built-in lessons overlap ours.** Keys to Success, Touch Tutor, Chord Study, Chord Progression, Chord Dictionary. Lesson 9.10 teaches when to use the keyboard's own tools and when to use the app, rather than pretending they do not exist.

Panel diagram: trace the top panel from the PSR-E373 Owner's Manual (free PDF from Yamaha) into an SVG with named button regions, so keyboard-task lessons can highlight the exact button.

---

## 6. Authoring content at scale

`curriculum.ts` hand-codes every note in 70 KB of TypeScript for 19 lessons. Ninety lessons need a different approach:

1. **Sargam text notation → `ScoreNote[]`.** Lessons written the way Indian notation books write them: `S R G M P | M G R S |`, with komal (`r g d n`) and tivra (`M'`) marks, matra durations, and a key. One line of text per bar. Also what a future community-content feature would accept.
2. **Generators** (section 4) for alankars, scales, chords, patterns.
3. **MIDI import** for repertoire (Czerny, Bach, Hanon, Bollywood melodies the owner has rights to).
4. **One file per lesson** (`src/content/levels/04-chords/4.2-shift-test-1.ts`) with a shared `Lesson` schema, instead of one 70 KB file.
5. **Lesson Lab** preview so authoring does not require running the full app flow.

---

## 7. Build sequence

Each sprint ends with something the owner can click through on their PSR-E373.

| Sprint | Weeks | Deliverable |
|---|---|---|
| **1. Foundations** | 1–2 | `Lesson` model with `type`; lesson progress model; scoring engine extracted to pure functions with Vitest fixtures from recorded MIDI; MIDIManager handles Program Change, Bank Select, Pitch Bend, MIDI Clock, per-channel state; chord recogniser; transposition; Lesson Lab with MIDI monitor. Verify the "verify on hardware" rows. |
| **2. Navigation** | 3–4 | Today, Path, My Songs, Progress tabs; lesson player with Guided mode that actually hides the pro UI; auto-shown first-run flow; vocabulary cleanup; existing 19 lessons placed on the path with lock/unlock. |
| **3. Lesson types, wave 1** | 5–7 | concept, rhythm, chord-drill, quiz, keyboard-task players; panel SVG. |
| **4. Content, wave 1** | 8–10 | Levels 1–4 complete (41 lessons incl. 6 keyboard lessons); Sargam notation parser; alankar/scale/chord generators. |
| **5. Lesson types, wave 2** | 11–12 | pattern (library + editor), ear, checkpoint; key detection in the importer. |
| **6. Content, wave 2** | 13–16 | Levels 5–10 (50 lessons incl. the full Level 9 keyboard deep dive); USB audio recording for the recital. |

Sixteen weeks for one developer working steadily; shorter with the owner authoring content in parallel from Sprint 4 using the Sargam notation and Lesson Lab.

---

## 7a. Sprint 1 status: done

| Deliverable | Where | Tests |
|---|---|---|
| Scoring engine extracted to pure functions, behaviour unchanged | `src/engine/matching.ts`, `timing.ts`, `session.ts`, `constants.ts` | 39 |
| Music theory: scales and thaats, chords, recogniser, inversions, diatonic families, transposition, Krumhansl–Schmuckler key detection | `src/engine/theory.ts` | 23 |
| MIDI decoder for every message type; keyboard-state tracker (voice per channel, Dual, Split, style channels, clock BPM, pitch bend, sustain, touch-response guess); bounded monitor log | `src/engine/midi.ts`, wired in `services/MIDIManager.ts` | 13 |
| `Lesson` model with nine types; `Level` and path | `src/types/lesson.ts`, `src/content/path.ts` | 4 |
| Progress rules: attempts, pass/master thresholds, level gating by checkpoint, Pro-mode unlock, seeding from legacy song mastery | `src/engine/progress.ts`, Dexie v2 `lessonProgress`, store actions `recordLessonResult` / `openLesson` | 13 |
| Lesson Lab tab: MIDI monitor with JSON export, keyboard state, live chord, hardware checklist, lesson registry | `src/components/LessonLabView.tsx` | browser smoke |
| Browser smoke test | `scripts/smoke.mjs` (`npm run smoke`) | — |

Found and fixed along the way: a negative-radius canvas error in the hit-burst animation (rAF timestamp trailing `performance.now()`).

Behaviour pinned but worth a decision: problem-spot ranking is `errors × 100 + avgDelayMs`, so in Wait mode a 300 ms hesitation outranks a wrong note. Probably wrong for beginners; left as-is until the owner decides.

## 7b. Sprint 2 status: done

Dark studio theme kept, per the owner. One display face added (Fraunces) for the teacher's voice: greeting, level titles, instruction headlines.

| Deliverable | Where |
|---|---|
| Four learner-facing tabs: Today, Path, My Songs, Progress (Lab in Pro mode only) | `TopBar.tsx` replaces `TopDiagnosticsBar.tsx`; CH/latency/VEL/CC64/synth-mute diagnostics render only in Pro |
| Today: greeting, one Continue card with the lesson's opening hand position drawn, a 3-item daily plan under 10 minutes, streak | `TodayView.tsx`, plan logic in `engine/dailyPlan.ts` (7 tests) |
| Path: vertical spine of 10 levels, lock/available/in-progress/passed/mastered marks, planned lessons shown as "coming soon", track filter, locked levels collapsed | `PathView.tsx` |
| Guided lesson player: header (back, title, 3 step pills, play/restart, briefing, More), instruction card as the hero with the target key drawn, highway, keyboard. Transport bar and telemetry sidebar hidden unless "More" or Pro | `GuidedLessonView.tsx`; `App.tsx` gates the Pro layout |
| First-run flow, auto-shown once: welcome → keyboard check → find Middle C (with wrong-key direction hint) → play Sa Re Ga (ordered) → your path | `FirstRunFlow.tsx`; `hasCompletedFirstRun` on the profile; "Replay the introduction" on Today |
| Key glyph: an SVG one- or two-octave keyboard that shows a target key by its place among the black-key groups, with finger numbers | `KeyGlyph.tsx`, used by Today, the instruction card, and the introduction |
| Free play rule: keys pressed outside the lesson screen light up but never score the lesson | `handleIncomingMidiEvent` |
| Vocabulary: "Path", "Progress", "My Songs", "See all progress", "Back to the path"; "Module" and "telemetry" copy removed from live screens | report modal, importer, progress dashboard |

Found and fixed: in Wait mode, a note played before the timeline reached it was scored as a negative reaction time ("PERFECT −644 ms"). Wait mode now floors drift at zero when not yet waiting.

Not removed: `CurriculumView.tsx` is no longer rendered (the Path replaces it) but still holds the per-stage MIDI import feature. Delete or fold into My Songs when convenient.

## 7c. Sprint 3 status: done

Five new lesson types have players, and 13 lessons were authored to exercise them. Ready lessons: 19 → 32.

| Deliverable | Where | Tests |
|---|---|---|
| Player framework: `activeLesson` in the store, `LessonPlayer` dispatcher, shared frame and intro, generic result card (Next / Try again / Back to the path), "Try again" remounts via a nonce | `components/lessons/LessonPlayer.tsx`, `LessonFrame.tsx`, store `openLesson` / `finishActiveLesson` | smoke |
| Concept player: cards, key-glyph highlights, three diagrams (circle of fifths, finger numbers, panel), try-its in sequence / any-order / together modes with skip | `ConceptPlayer.tsx`, `Diagrams.tsx`, `engine/tryIt.ts` | 7 |
| Rhythm player: count-in, metronome, pattern lane with sweeping playhead, taps matched to onsets, misses, score | `RhythmPlayer.tsx`, `engine/rhythm.ts` | 8 |
| Chord-drill player: free / timed / metronome modes, held-chord evaluation with wrong-chord naming, transition times, release-to-rearm | `ChordDrillPlayer.tsx`, `engine/chordDrill.ts` | 7 |
| Quiz player: choice, press-key, press-chord questions with explanations | `QuizPlayer.tsx` | content |
| Keyboard-task player: panel diagram with the step's button lit, live verification over MIDI (voice change, Dual, Split, style, clock, sustain, pitch bend, touch response, transpose, CC), Done fallback, live widgets (touch meter, chord, channel chips) | `KeyboardTaskPlayer.tsx`, `engine/keyboardTask.ts` | 9 |
| PSR-E373 panel as data: 45 named regions with learner tips, drawn by `PanelDiagram` | `content/psrE373Panel.ts`, `components/PanelDiagram.tsx` | content |
| Content: 1.1 Meet your PSR-E373, 1.2 Posture, 1.3 Keyboard map, 1.4 Sargam and Western, 1.9 Touch Response, 2.1 Note values, 3.1 Major scale formula, 3.2 Circle of fifths, 3.4 Building triads, 3.8 Relative keys quiz, 4.2 Chord shifting test 1, 4.10 Smart Chord and ACMP, 9.4 Dual, Split and rhythm tracks | `content/lessons/level{1,2,3,4,9}.ts` | 7 validation tests |
| Smoke test now completes one lesson of each type from the computer keys | `scripts/smoke.mjs` | — |

Panel positions are a schematic. The region list carries a note on how to make it exact from the Owner's Manual; moving a button is one line.

## 7d. Sprint 4 status: done

Levels 1–4 are complete except the three checkpoints (Sprint 5 player) and 4.7 RCCR (awaiting the owner's definition). Ready lessons: 32 → 49. Path: 95 lessons.

| Deliverable | Where | Tests |
|---|---|---|
| Sargam text notation → `ScoreNote[]`: shuddha/komal/tivra, octave marks, finger numbers, holds, rests, groups, bar lines, comments, RH/LH lines | `engine/sargam.ts` (`parseSargam`, `songFromSargam`, `makeSong`) | 12 |
| Generators: alankars from a degree pattern with mirrored descent and five-finger / thumb-tuck fingering; scale runs; chord-progression accompaniment (block, root, root-fifth, broken); chord-tone melodies | `engine/generators.ts` | 11 |
| Song registry: `ALL_SONGS` = hand-coded + generated/notated; store and path use it | `content/songs.ts` | — |
| Songs: 1.8 Alankars 3–6 (generated), 1.10 Top four right-hand exercises (Sargam text), 4.6 Advanced chord coordination (generated, left hand first), 4.8 Twinkle Twinkle with C–F–G (Sargam melody + generated roots and block chords, three tiers) | `content/songs.ts` | validation |
| Lessons: 2.2 Playing in rhythm (rests), 2.8 How to master any song, 3.3 Natural minor, 3.6 Chord types, 3.7 Scale types, 4.1 How to shift chords, 4.3 Chord shifting test 2, 4.4 Five change exercises, 4.5 Chords on the beat, 4.9 7ths and slash chords, 4.11 Built-in chord songs, 4.12 The chord loops behind popular songs, 4.13 Four loops on the beat | `content/lessons/level{2,3,4}.ts` | validation |
| Song guides authored with a song are now honoured (`song.teacherGuide`); step pills name the hand the step actually uses | `utils/teacherGuidance.ts`, `GuidedLessonView.tsx` | smoke |
| Song validation: every tier of every song lesson stays in the 61-key range, every onset is reachable before the session ends | `content/lessons.test.ts` | 1 |

**Bollywood songs.** Film melodies are copyrighted compositions, so none were transcribed. Lessons 4.12 and 4.13 teach the four chord loops most film and pop songs sit on (I–V–vi–IV, vi–IV–I–V, I–vi–IV–V, I–IV–V), name songs commonly played over them, and point learners at My Songs for the melody itself. 10.8 "A Bollywood set" stays planned until the owner sources MIDI or a licence. The pre-existing Om Shanti Om lesson (2.6) was left as found.

Found and fixed: the hand-coded songs declared `durationSeconds` as the last note's end rather than the last barline, so arranger-added bass notes in the final bar were unreachable before the session closed. Durations now run to the end of the last bar.

## 7e. Sprint 5 status: done

All nine lesson types now have players. Ready lessons: 49 → 72 of 94. Levels 1–4 and 6–8 are complete (one keyboard lesson in Level 6 remains planned); 4.7 RCCR was dropped at the owner's request.

| Deliverable | Where | Tests |
|---|---|---|
| **Stable lesson ids.** Ids are slugs (song lessons use the song id); display codes stay positional. Progress now survives reordering and removals. | `content/path.ts` | path tests |
| Pattern engine: tone numbers (1 3 5 7 8 10 12) on a beat grid × progression × key → `ScoreNote[]`; `buildPatternSong` adds right-hand chords for Step 3 and a left-hand-first guide; transposition; template validation | `engine/patterns.ts` | 7 |
| Pattern library: 7 universal 4/4, 4 universal 3/4, 3 exceptional | `content/patterns.ts` | validation |
| Pattern player: library picker, key picker (circle-of-fifths order), grid view, **grid editor** (click eighth-note cells, double lengths, clear), "Play this pattern" hands the generated song to the song engine and credits the lesson | `components/lessons/PatternPlayer.tsx`, store `playGeneratedSong` | smoke |
| Ear engine and player: reference Sa then target; note / interval / melody played back in sequence, chords held; replays with a free allowance; reveal with the key glyph; the on-screen keyboard no longer shows song targets during type lessons (it was giving the answer away) | `engine/ear.ts`, `EarPlayer.tsx`, `InteractiveKeyboard61.tsx` | 6 |
| Checkpoint player: reads the parts' best scores from progress, opens any unmet part in one click, "Complete checkpoint" records the average. Checkpoints now gate Levels 2→3 and 3→4. | `CheckpointPlayer.tsx`, `content/lessons/checkpoints.ts` | path tests |
| Quiz questions can carry audio ("Hear it": phrase or chord) | `QuizPlayer.tsx` | content |
| Key detection in the importer: Krumhansl–Schmuckler over the imported notes sets the key signature and Sa; shown in the import summary | `services/SongImporter.ts` (`applyDetectedKey`) | 3 |
| Content: Level 6 (intro, 4/4 and 3/4 coordination, four-step process, seven 4/4 patterns, exceptional, four 3/4, identify the pattern, build your own, improvise), Level 7 (single notes, intervals, melodies, major/minor chords, play-by-ear method), Level 8 (find the scale with audio, major or minor with audio, chord families of C and G, chords by ear, priority progressions), checkpoints 2.9, 2.10, 3.9 | `content/lessons/level{6,7,8}.ts`, `checkpoints.ts` | validation |

Smoke test now also runs a pattern lesson into the song player, an ear item, and a checkpoint completion.

## 8. Open questions for the owner

1. **RCCR** [course 4G]: what does the acronym stand for? Needed before authoring Lesson 4.7.
2. **Visual direction.** The current dark "studio" theme reads as a pro tool. A beginner-first product usually wants a brighter, calmer look. Keep the dark theme, offer both, or redesign? This decides how much of Sprint 2 is restyling.
3. **Bollywood repertoire.** Which specific songs do you want in Levels 4, 6, 7 and 10? Melodies you can supply as MIDI or Sargam text go straight in.
4. **Hardware verification.** Are you able to spend ten minutes with the Lesson Lab MIDI monitor and your PSR-E373 once Sprint 1 lands, to settle the "verify on hardware" rows?
