// Browser smoke test. Start the dev server first (`npm run dev`), then `npm run smoke`.
// Runs in a fresh headless Chromium profile, so it exercises the first-run flow,
// then Today → lesson, the Path, the Lab's monitor and chord recogniser, and
// lesson-progress persistence across a reload. Reports any console errors.
// Test progress rows are removed at the end so your own data is untouched.
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:5173/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));

const store = (fn) =>
  page.evaluate(async (src) => {
    // eslint-disable-next-line no-new-func
    return new Function('store', `return (${src})(store)`)(window.__studio);
  }, fn.toString());

const press = async (key, wait = 150) => {
  await page.keyboard.press(key);
  await page.waitForTimeout(wait);
};
const button = (name) => page.getByRole('button', { name, exact: true }).first();
const nav = (name) => page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name, exact: true });

const results = {};

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// 1. First run shows on a fresh profile and walks through on the computer keys
results.firstRunShown = (await page.getByText("Let's begin").count()) === 1;
await button("Let's begin").click();
await button('Next').click(); // keyboard check
await press('e'); // wrong key for Middle C
results.wrongKeyHint = (await page.getByText(/That's E4/).count()) === 1;
await press('q'); // Middle C
await button('Next').click();
await press('q');
await press('w');
await press('e'); // Sa Re Ga
results.phraseRecognised = (await page.getByText('That was your first phrase.').count()) === 1;
await button('Next').click();
await button('Look around first').click();
await page.waitForTimeout(500);

// 2. Today lands with one Start button; starting opens the guided lesson. Level 2 is still locked.
results.statusBefore = await store((s) => s.getState().lessonStatuses['stage2-thumb-tuck-drill']);
results.todayStart = (await page.getByRole('button', { name: /Start lesson/ }).count()) === 1;
await page.getByRole('button', { name: /Start lesson/ }).click();
await page.waitForTimeout(700);
// The first lesson on the path is the keyboard task; the song player is checked on 1.5
results.todayOpensFirstLesson = (await page.getByText('Meet your PSR-E373').count()) >= 1;
await page.evaluate(() => window.__studio.getState().startLesson('stage1-five-finger-home'));
await page.waitForTimeout(700);
results.guidedInstruction = (await page.getByText(/Play Sa \(C4\)/).count()) >= 1;
results.proUiHidden = (await page.getByText('Pro Controls').count()) === 0;
await press('q', 300);
await press('w', 300);
results.progressCounter = (await page.getByText('2 / 16 notes').count()) === 1;

// 3. Path shows the current lesson highlighted and planned lessons as coming soon
await nav('Path').click();
await page.waitForTimeout(400);
results.pathLockedHint = (await page.getByText(/finish Level 1 to unlock/).count()) === 1;
results.pathLevel1Open = (await page.getByText('Alankar 1: stepwise palta').count()) === 1;

// 3b. One lesson of each new type, driven from the computer keys
const open = (id) => page.evaluate((lessonId) => window.__studio.getState().openLesson(lessonId), id);
const hold = async (keys, wait = 450) => {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(wait);
  for (const k of keys) await page.keyboard.up(k);
  await page.waitForTimeout(450);
};
const resultScore = async () => {
  const txt = await page.locator('.font-display.text-6xl').first().innerText();
  return Number(txt);
};
const closeResult = async () => {
  await page.getByRole('button', { name: 'Back to the path' }).click();
  await page.waitForTimeout(300);
};

// Concept 1.3: five cards, three try-its
await open('keyboard-map');
await page.waitForTimeout(400);
await button('Read on').click();
await button('Next').click();
await button('Next').click();
await press('q', 300); // Middle C
await button('Next').click();
await press('r', 300); // any F
await button('Next').click();
await press('q', 200);
await press('i', 300); // C4 then C5
await button('Finish').click();
await page.waitForTimeout(500);
results.conceptScore = await resultScore();
await closeResult();

// Chord drill 3.4: six triads, free mode
await open('building-triads');
await page.waitForTimeout(400);
await button('Start').click();
for (const chord of [['q', 'e', 't'], ['w', 'r', 'y'], ['e', 't', 'u'], ['r', 'y', 'i'], ['t', 'u', 'o'], ['y', 'i', 'p']]) await hold(chord);
await page.waitForTimeout(600);
results.chordDrillScore = await resultScore();
await closeResult();

// Quiz 3.8: six questions, two on the keyboard
await open('relative-keys-quiz');
await page.waitForTimeout(400);
await button('Start the quiz').click();
await button('A minor').click();
await button('Next').click();
await button('3').click();
await button('Next').click();
await press('w', 300); // D = relative minor of F
await button('Next').click();
await button('G major').click();
await button('Next').click();
await hold(['y', 'i', 'p']); // A minor
await button('Next').click();
await button('G major and E minor').click();
await button('Finish').click();
await page.waitForTimeout(500);
results.quizScore = await resultScore();
await closeResult();

// Keyboard task 1.1: manual steps plus two verified by a key press
await open('meet-your-keyboard');
await page.waitForTimeout(400);
await button('Start').click();
await button('Done').click();
await button('Next step').click();
await press('q', 300);
results.keyboardStepVerified = (await page.getByText('Confirmed over USB').count()) === 1;
await button('Next step').click();
await button('Mark done anyway').click();
await button('Next step').click();
await press('q', 300);
await button('Next step').click();
await button('Done').click();
await button('Next step').click();
await button('Done').click();
await button('Finish').click();
await page.waitForTimeout(500);
results.keyboardTaskScore = await resultScore();
await closeResult();

// Generated and notated songs open in the song player; 4.6 starts with the left hand per its own guide
await page.evaluate(() => window.__studio.getState().startLesson('gen-alankars-3-6'));
await page.waitForTimeout(600);
results.alankarsOpen = (await page.getByText(/Play Sa \(C4\)/).count()) >= 1;
await page.evaluate(() => window.__studio.getState().startLesson('gen-coordination-1645'));
await page.waitForTimeout(600);
results.coordinationStartsLeft = (await page.getByRole('button', { name: /^1\s*Left hand$/ }).count()) === 1 && (await page.getByText(/C3/).count()) >= 1;

// Pattern 6.5: choose a pattern, transpose, play it in the song player (left hand first)
await open('seven-patterns-44');
await page.waitForTimeout(400);
await button('Choose a pattern').click();
await page.getByRole('button', { name: 'Alberti bass 1-5-3-5' }).click();
await page.getByRole('button', { name: 'G', exact: true }).click(); // transpose to G
await button('Play this pattern').click();
await page.waitForTimeout(800);
results.patternPlays =
  (await page.getByRole('button', { name: /^1\s*Left hand$/ }).count()) === 1 && (await page.getByText(/\(G3\) with your Left Hand/).count()) >= 1;

// Ear 7.1: hear Sa then Pa, play Pa back
await open('ear-single-notes');
await page.waitForTimeout(400);
await button('Start listening').click();
await page.waitForTimeout(2600); // reference + target playback
await press('t', 400); // G4
results.earFirstTime = (await page.getByText('First time.').count()) === 1;

// Checkpoint 2.9: parts are read from progress; completing it records the lesson
await store(async (s) => {
  await s.getState().recordLessonResult('note-values', 80);
  await s.getState().recordLessonResult('playing-in-rhythm', 90);
});
await open('rhythm-checkpoint');
await page.waitForTimeout(400);
results.checkpointReady = (await page.getByText('2 of 2').count()) >= 1;
await button('Complete checkpoint').click();
await page.waitForTimeout(500);
results.checkpointScore = await resultScore();
await closeResult();

// Rhythm 2.1: starts, counts in, renders the lane (full run is too long for a smoke test)
await open('note-values');
await page.waitForTimeout(400);
await button('Start with a count-in').click();
await page.waitForTimeout(1500);
results.rhythmCountIn = (await page.getByText('Count-in').count()) === 1;

// 4. Lab (pro only): monitor saw notes, chord recogniser reads a held C major
await button('pro').click();
await nav('Lab').click();
await page.waitForTimeout(500);
results.monitorNoteOns = await page.locator('.font-mono >> text=/Note On/').count();
await page.keyboard.down('q');
await page.keyboard.down('e');
await page.keyboard.down('t');
await page.waitForTimeout(300);
results.chord = (await page.locator('text=Chord you are holding').locator('..').locator('..').innerText())
  .replace(/\s+/g, ' ')
  .includes(' C root position');
await page.keyboard.up('q');
await page.keyboard.up('e');
await page.keyboard.up('t');

// 5. Progress persists across reload, gates levels, and first run does not return
await store(async (s) => {
  await s.getState().recordLessonResult('stage1-five-finger-home', 85);
  await s.getState().recordLessonResult('stage1-alankar-1-steps', 95);
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
results.firstRunAgain = (await page.getByText("Let's begin").count()) === 0;
results.afterReload = await store((s) => {
  const st = s.getState();
  return { l105: st.lessonStatuses['stage1-five-finger-home'], l106: st.lessonStatuses['stage1-alankar-1-steps'], l203: st.lessonStatuses['stage2-thumb-tuck-drill'] };
});
results.proUnlocksAll = await store((s) => {
  s.getState().setUiComplexityMode('pro');
  return s.getState().lessonStatuses['stage5-bach-minuet-g'] === 'available';
});

// Clean up test rows
await page.evaluate(async () => {
  await window.__db.lessonProgress.where('lessonId').anyOf(['stage1-five-finger-home', 'stage1-alankar-1-steps', 'note-values', 'playing-in-rhythm', 'rhythm-checkpoint', 'keyboard-map', 'building-triads', 'relative-keys-quiz', 'meet-your-keyboard', 'seven-patterns-44', 'ear-single-notes']).delete();
});

await browser.close();

const ok =
  results.firstRunShown &&
  results.wrongKeyHint &&
  results.phraseRecognised &&
  results.todayStart &&
  results.todayOpensFirstLesson &&
  results.guidedInstruction &&
  results.proUiHidden &&
  results.progressCounter &&
  results.pathLockedHint &&
  results.pathLevel1Open &&
  results.conceptScore === 100 &&
  results.chordDrillScore === 100 &&
  results.quizScore === 100 &&
  results.keyboardStepVerified &&
  results.keyboardTaskScore === 90 &&
  results.alankarsOpen &&
  results.coordinationStartsLeft &&
  results.patternPlays &&
  results.earFirstTime &&
  results.checkpointReady &&
  results.checkpointScore === 85 &&
  results.rhythmCountIn &&
  results.monitorNoteOns >= 3 &&
  results.chord === true &&
  results.statusBefore === 'locked' &&
  results.firstRunAgain &&
  results.afterReload.l105 === 'passed' &&
  results.afterReload.l106 === 'mastered' &&
  results.proUnlocksAll &&
  errors.length === 0;

console.log(JSON.stringify({ ok, ...results, errors }, null, 2));
process.exit(ok ? 0 : 1);
