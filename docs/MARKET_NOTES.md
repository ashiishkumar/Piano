# VirtuosoStudio: Codebase Assessment and Product Plan

Written after cloning, reading every source file, and building the project (build passes, `npm run build`, 852 KB JS bundle).

---

## 1. What exists today

### Architecture
- Client-only React 18 + TypeScript + Vite + Tailwind single-page app. No backend, no auth, no payments.
- State: one Zustand store (`useStudioStore.ts`, ~1,300 lines) holding navigation, MIDI device state, the practice timeline, note matching, telemetry, and session scoring.
- Persistence: IndexedDB via Dexie (sessions, custom songs, mastery, one profile record). Progress lives in one browser profile.
- Audio: Tone.js. Salamander piano samples are streamed from `tonejs.github.io` at runtime; a synth fallback covers load time.
- Visuals: VexFlow grand staff + a 60 FPS Canvas falling-notes lane + a 61/88-key virtual keyboard.
- Input: Web MIDI (Chromium only), plus QWERTY and mouse fallbacks so anyone can try it with no hardware.
- Content: 6 stages, 19 lessons, hand-authored in `curriculum.ts` (70 KB). Pedagogy is Indian-first (Sargam, alankars, Raag Yaman, Bollywood themes) bridging to Western conservatory material (Hanon, Czerny, Bach Minuet, grand-staff sight-reading).
- Importer: `.mid`, `.musicxml`, `.mxl` → heuristic left/right hand separation → fingering estimate → Beginner/Intermediate/Pro auto-arrangements.
- Git history: 2 commits. Tests: none. Test framework: none.

### The real-time feedback engine (the part that matters)
This is the hardest thing to build in this category and it already works:

| Capability | Where | Notes |
|---|---|---|
| Wait-for-Me mode | `tickTimeline` step 1 | Freezes timeline at a chord cluster until every required pitch is held |
| Rhythm mode with miss detection | `tickTimeline` step 4 | >160 ms late (tempo-scaled) → `missed` |
| Timing classes | `handleIncomingMidiEvent` | ±25 ms perfect, ±60 ms good, else early/late |
| Octave forgiveness | same | Right pitch class, wrong octave → advances with a coaching tip |
| Fat-finger detection | same | Wrong key within 2 semitones → "adjacent key slip" alert |
| Hand velocity balance | same | LH louder than RH over last 5 notes → warning |
| Articulation | note-off handler | Hold duration vs expected; cut-short / over-held for legato / staccato |
| A-B loop + auto-ramp | `tickTimeline` step 5 | ≥95% loop accuracy → tempo +5% |
| Auto-accompaniment | `tickTimeline` step 3 | Plays the hand the learner is not practising, locally and out to the keyboard |
| Session report | `finishAndSaveSession` | Score = 45% pitch + 35% timing + 20% dynamics; problem spots by measure; 3 drill prescriptions |

The "AI coach" is template-driven rules, not a model. That is fine for v1 but the marketing should not call it AI until it is.

### Gaps that block selling this
1. **No accounts, sync, or billing.** It is a local tool.
2. **Zero tests.** The scoring engine is the core IP and nothing guards it. Refactoring is unsafe.
3. **Hard-wired to one keyboard model.** "PSR-E373" appears in UI strings, function names (`describeKeyLocationOnPsrE373`, `foldIntoPsrE373Range`), range constants, and device auto-detection.
4. **No iPad.** Safari/iOS have no Web MIDI API and WebKit has said it will not ship one ([webmidijs.org](https://webmidijs.org/docs/getting-started), [caniuse](https://caniuse.com/midi) ≈79% global coverage, all Chromium). The iPad on a music stand is the default device for this category.
5. **Third-party sample host.** Audio depends on a GitHub Pages URL you do not control.
6. **Content volume.** 19 lessons versus thousands of songs at incumbents.
7. **Maintainability.** One 1,300-line store; a second engineer cannot work in it safely.

---

## 2. Market reality

Prices (best available annual plan, mid-2026 sources, rephrased for compliance):
- Yousician $139.99/yr, Skoove $119.99/yr, Piano Marvel $129/yr ([pianoers.com](https://pianoers.com/best-free-piano-learning-apps/))
- Simply Piano ≈€14.99/mo, Flowkey ≈€19.99/mo ([wwwhatsnew](https://wwwhatsnew.com/2026/05/20/aprender-instrumento-apps-2026-yousician-simply-piano-fender-play-guia/))

Scale of the leader: Simply (ex-JoyTunes) had 200K paying subscribers and $20M revenue in 2019 ([Calcalist](https://www.calcalistech.com/ctech/articles/0,7340,L-3769058,00.html)); current third-party revenue estimates range from ~$40M to ~$200M/yr ([Growjo](https://growjo.com/company/Simply_(formerly_JoyTunes)), [GetLatka](https://getlatka.com/companies/simply)). Simply Piano is mobile/tablet only with no desktop version ([Simply help centre](https://piano-help.hellosimply.com/en/articles/2728030-subscribe-to-simply-piano)). Flowkey is Yamaha-endorsed and claims 10M+ users.

Implication: "millions of paying users" is Simply Piano scale. That took VC money, years of paid acquisition, a patented microphone note-detection engine, and licensed Western pop. A head-on fight with a Chrome-only web app loses.

**A $1M ARR business is a different and achievable target**: roughly 10,000 annual subscribers at ~$100, or a blend across India pricing, diaspora pricing, and schools (math in section 5). Get there first, then decide whether to raise and chase the bigger number.

### The open wedge: Indian music learners
- India's most common first instrument is a ₹8K–₹30K portable keyboard. Yamaha launched the India-specific PSR-I610/I510 in Jan 2026 with a "riyaz mode" and Carnatic voices ([Yamaha India](https://in.yamaha.com/en/news/2026/0121-yamaha-music-india-launches-new-psr-i-series.html), [The Hindu](https://www.thehindu.com/life-and-style/yamahas-new-india-focussed-launch/article70532931.ece)). Casio and RSL announced an India keyboard-education partnership ([Outlook Business](https://www.outlookbusiness.com/spotlight/pr-wire/rsl-group-and-casio-announce-strategic-partnership-to-advance-keyboard-education-across-india)). Hardware makers are actively looking for the software layer.
- Trinity and ABRSM graded exams are mainstream in Indian music education; parents pay for exam outcomes.
- Diaspora (US, UK, Canada, Gulf, Australia) is tens of millions, affluent, with kids in lessons and a hunger for Bollywood/devotional repertoire that incumbents do not serve.
- Only one direct competitor found: [riaaz.app](https://riaaz.app/) — Bollywood, falling notes + score mode, MIDI, Trinity/ABRSM alignment, an "AI teacher". It is invite-only beta. The space is open but someone else has noticed it.

This repo's existing Sargam/alankar/raag pedagogy is a real head start here. It is not a translation layer on Western content; it teaches the way Indian teachers actually teach.

---

## 3. Positioning

**"The keyboard teacher that hears every key you press — built for Indian music, from Sa Re Ga Ma to Trinity Grade 5."**

Core promise: plug any MIDI keyboard into a laptop or Android device, and get the correction a good teacher gives, on every note, at ₹300/month instead of ₹3,000.

Not: a generic Simply Piano clone. Not: a Bollywood MIDI file player.

---

## 4. Roadmap

### Phase 0 — From project to product (weeks 1–4, no revenue)
Goal: a public URL that strangers can use, and a codebase that can be changed safely.

1. **Deploy** to Vercel or Cloudflare Pages. Self-host the Salamander samples (or a smaller licensed/CC set) in the bundle or on R2/S3.
2. **Generalize the hardware layer.** Replace PSR-E373 constants with a device profile: detect range from the first notes played or let the user pick 49/61/76/88; keep a Yamaha/Casio model list for friendly names. Strip model names from UI copy.
3. **Extract the scoring engine into pure functions** (`matchNote`, `classifyTiming`, `scoreSession`, `findProblemSpots`) and cover them with Vitest. Feed recorded MIDI event logs as fixtures. This is the IP; it needs to be deterministic.
4. **Split the store** into slices (device, transport, evaluation, persistence). Code-split the bundle (VexFlow and Tone.js are the heavy pieces).
5. **Add product analytics** (PostHog, free tier): time-to-first-correct-note, lesson completion, where people quit.
6. **Watch 10 real users.** Find 10 people who own a MIDI keyboard and have never played. Sit with them (or screen-share) while they go from zero to Happy Birthday. Nothing below this line matters until Wait-for-Me + falling notes demonstrably gets a zero-knowledge adult through Stage 1.

### Phase 1 — Accounts, paywall, first 50 paying users (months 2–3)
Goal: prove willingness to pay before building more.

1. **Backend:** Supabase (Postgres + auth + storage). Sync sessions, mastery, imported songs, profile. Keep Dexie as the offline cache.
2. **Billing:** Stripe for global cards; **Razorpay for India** (UPI is essential; card penetration in India is low). Annual and monthly.
3. **Free tier:** Stages 1 and 2 free forever (the learner reaches Happy Birthday and Om Shanti Om, the "aha" moment), one imported song, basic report. **Paid:** Stages 3–6, unlimited imports, full analytics, daily plan, parent view.
4. **Pricing hypothesis:** India ₹299/mo or ₹1,999/yr; global $12.99/mo or $89/yr. Test with a 7-day trial.
5. **Landing page** with a 60-second video of the live feedback catching a wrong note. That one clip is the entire pitch.
6. **Distribution, zero budget:** Bollywood piano tutorial YouTubers (collab: "learn this with live feedback"), Indian keyboard Facebook/WhatsApp groups, r/piano and r/india, Yamaha/Casio dealer WhatsApp lists in 3–4 cities.
7. **Exit criterion:** 50 paying users. If this cannot be reached in 8 weeks of effort, fix the product or the positioning before writing more code.

### Phase 2 — Content engine and retention (months 4–8)
Goal: enough content and habit to make annual plans worth it; monthly churn under 6%.

**Content (the moat), three sources:**
- **Original curriculum** 19 → 100+ lessons: Hindustani raag families (Bilawal, Kalyan, Khamaj, Bhairav), Carnatic basics (Sarali varisai), devotional/bhajan patterns, and a Western track aligned to the published Trinity/ABRSM Grade 1–3 syllabi (technical exercises and public-domain pieces).
- **Public domain classical**: Bach, Clementi, Czerny, Hanon, Burgmüller. Zero licensing cost, exam-relevant.
- **Bollywood**: the thing users most want and the thing hardest to license. Composition rights sit with publishers (T-Series, Saregama, Sony Music India, Zee Music) and are administered in India by IPRS. Teaching a melody via MIDI still implicates the composition copyright even with no recording. **Get a licensing opinion before publishing any Bollywood arrangement.** Meanwhile: user-imported MIDI is the user's own responsibility, and the importer already handles it.

**Retention mechanics:**
- The session prescriptions already exist; make them the home screen: "Today's 10 minutes" auto-built from last session's problem spots.
- Weekly progress email with the skill radar and streak. Parent/guardian digest for child accounts.
- Make the coach actually intelligent: send the structured session telemetry (timing histogram, per-measure errors, hand balance, articulation issues) to an LLM to produce specific natural-language feedback and to answer "why is my left hand always late?" The data is already rich enough; this is cheap and differentiates from template text.

### Phase 3 — Platform and distribution (months 9–18)
Goal: scale channels the web app cannot reach alone.

1. **Android app** via Capacitor. Android is ~95% of Indian mobile. Verify Web MIDI in the Android WebView; if blocked, use a native MIDI plugin. USB-OTG cable is a ₹150 accessory.
2. **iPad** via Capacitor + a native CoreMIDI plugin. This is the only route to the music-stand tablet short of building microphone pitch detection (a large ML project that Simply patented their version of). Defer mic detection.
3. **Teachers and schools (B2B2C).** India has tens of thousands of private keyboard tutors and music academies. A teacher dashboard (assign lessons, see each student's telemetry, flag weak measures) sells at ₹2,000–5,000/month per teacher or ₹200/student/yr to schools. Lower churn and higher ARPU than consumers.
4. **Hardware bundles.** Pitch Yamaha Music India and Casio India: a 3-month subscription QR card in every PSR-I / CT-X box. They want their keyboards to feel "smart"; you want their distribution.
5. **Exam-prep track.** Trinity/ABRSM Grade 1–5 mock exams with scoring aligned to the real marking criteria. Parents pay for outcomes.

---

## 5. Revenue math to $1M ARR

| Segment | Price | Subscribers | ARR |
|---|---|---|---|
| India consumers | ₹1,999/yr ≈ $24 | 15,000 | $360K |
| Diaspora + global | $89/yr | 4,500 | $400K |
| Teachers/schools | ~$2,400/teacher/yr | 100 | $240K |
| **Total** | | | **≈ $1.0M** |

At a 3–5% free-to-paid conversion, the consumer rows need roughly 400K–650K free signups over 18–24 months. That is reachable with the hardware-partner and YouTube channels; it is not reachable with organic web traffic alone.

---

## 6. Risks, in order

1. **Bollywood licensing.** The headline content is the hardest to clear. Mitigate with public domain + original + user import, and budget legal time early.
2. **No iPad without native work.** Capacitor + CoreMIDI is weeks, not months, but it is a hard requirement for the tablet market.
3. **Incumbents move into India.** Simply or Flowkey can add Hindi UI and a Bollywood pack. Defence is depth of Indian pedagogy (raag-based, Sargam-native, teacher network), speed, and hardware partnerships they will not prioritise.
4. **riaaz.app** is already positioned on the same wedge. Watch their launch; their beta status means the window is open now, not in a year.
5. **Single-developer bandwidth.** Adding a backend doubles the surface area of a codebase with no tests. Phase 0 item 3 is not optional.

---

## 7. First three actions

1. Deploy the current build to a public URL and put it in front of 10 real beginners with MIDI keyboards this month.
2. Extract and test the scoring engine.
3. Remove the PSR-E373 hard-coding so any keyboard works.

Everything else in this document depends on what those 10 users do.
