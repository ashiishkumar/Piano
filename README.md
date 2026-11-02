# 🎹 VirtuosoStudio — Yamaha PSR-E373 Interactive Piano Teacher & Pedagogy Engine

**VirtuosoStudio** is an interactive piano learning companion, real-time performance analyzer, and 6-stage conservatory curriculum built specifically for a **61-key Yamaha PSR-E373 (C1–C6, USB-to-Host MIDI)**—bridging beginners from one-handed Indian Sargam / ear melodies (*Sa Re Ga Ma*, *Happy Birthday*, *Om Shanti Om*) to full two-handed sight-reading, chord accompaniment, and expressive playing.

---

## ✨ Key Features

- **🎓 Step-by-Step Guided Piano Teacher:**
  - Every lesson is broken into **3 Guided Steps**:
    1. **Step 1: Right Hand Only (Wait-for-Me)** — Learn the melody and finger numbers (`1–5`) one note at a time with zero time pressure.
    2. **Step 2: Add Left Hand (Wait-for-Me)** — Add simple Beat-1 root bass notes in your Left Hand.
    3. **Step 3: Play in Rhythm** — Play the full two-hand arrangement in steady tempo with the metronome.
  - Includes a **Live Next-Note Teacher Card**, **Pre-Lesson Teacher Briefings**, an interactive **"Find Middle C (C4 / Sa)" Setup Wizard**, and a **Plain-English Feature Guide**.
- **🎹 61-Key Interactive Virtual Keyboard & Notation Bridge:**
  - Matches the physical 61 keys of the Yamaha PSR-E373 (`MIDI 36–96`) with an 88-key toggle.
  - Instant switching between **Indian Sargam (`Sa, Re, Ga, Ma, Pa, Dha, Ni`)**, **Western Pitch Names (`C4, D4, E4`)**, **Finger Numbers (`1–5`)**, and **Blind Mode**.
- **🎼 Dual-View Visualizer (Grand Staff + 60 FPS Falling Notes):**
  - Synchronized scrolling Treble & Bass Clef Grand Staff + 60 FPS HTML5 Canvas falling-notes highway with hit-burst micro-timing feedback.
- **📂 Universal MIDI & MusicXML Importer + 3-Tier Auto-Arranger:**
  - Drag and drop any `.mid`, `.midi`, `.musicxml`, or `.mxl` file to automatically separate Left & Right hands, estimate `1–5` fingerings, and generate **Beginner**, **Intermediate**, and **Pro** arrangements.
- **📊 Real-Time Telemetry & Analytics Dashboard:**
  - Tracks Pitch Accuracy, Micro-Timing Drift (`±25ms`), Left/Right Hand Velocity Balance, 5-Axis Skill Radar, 61-Key Error Heatmap, and Automated Loop Prescriptions.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Unit tests (engine: matching, timing, session scoring, theory, MIDI decoding, progress)
npm test

# Browser smoke test (needs `npm run dev` running in another terminal; first time: npx playwright install chromium)
npm run smoke
```

## 🧭 Where things live

| Folder | What |
|---|---|
| `src/engine/` | Pure, tested logic: note matching and timing, session scoring, music theory (scales, chords, key detection, transposition), MIDI decoding and keyboard-state tracking, lesson progress rules. No React, no DOM. |
| `src/content/path.ts` | The learning path: 10 levels, 94 lessons with stable slug ids. Ready lessons have payloads; planned ones are placeholders with type and source. |
| `src/content/lessons/` | Authored lesson payloads, one file per level. Numbering is assigned by position in `path.ts`. |
| `src/content/songs.ts` | Songs written in Sargam text or generated (alankars, chord drills), merged with the hand-coded songs into `ALL_SONGS`. |
| `src/engine/sargam.ts`, `generators.ts` | Sargam notation parser (`S R G M | P - - 0`, `RH:`/`LH:` lines, finger numbers) and procedural drill generators. |
| `src/content/psrE373Panel.ts` | The PSR-E373 panel as named regions (schematic; see the note at the top to make it exact). |
| `src/types/lesson.ts` | The `Lesson` model: score, concept, rhythm, chord-drill, pattern, ear, quiz, keyboard-task, checkpoint. |
| `src/components/lessons/` | Players for every non-song lesson type (concept, rhythm, chord-drill, quiz, keyboard-task, pattern with grid editor, ear, checkpoint), plus the shared frame and result card. |
| `src/content/patterns.ts`, `src/engine/patterns.ts` | The accompaniment pattern library and the generator that turns a pattern × progression × key into a playable song. |
| `src/data/curriculum.ts` | The 19 authored songs (`SongScore`) that back today's score lessons. |
| `src/services/` | Web MIDI and audio adapters. `MIDIManager` decodes every message (program change, pitch bend, clock, all channels) and exposes keyboard state and a monitor log. |
| `src/store/useStudioStore.ts` | App state. Delegates evaluation to `src/engine`. |
| `src/components/TodayView.tsx`, `PathView.tsx`, `GuidedLessonView.tsx`, `FirstRunFlow.tsx` | The learner-facing screens: today's plan, the 10-level path, the guided lesson player, the one-time introduction. |
| `src/components/KeyGlyph.tsx` | The small SVG keyboard that shows a target key by its place among the black-key groups. |
| `docs/PRODUCT_PLAN.md` | Product direction, curriculum map, lesson types, build sequence, sprint status. |

**Guided vs Pro.** Guided mode (default) shows one instruction at a time and hides the workstation controls behind "More". Pro mode restores the full transport bar, grand staff, telemetry sidebar, MIDI diagnostics, and the **Lab** tab: live MIDI monitor, decoded keyboard state (voice per channel, Dual/Split/style/clock detection), the chord you are holding, a hardware verification checklist for the PSR-E373, and the full lesson registry.
