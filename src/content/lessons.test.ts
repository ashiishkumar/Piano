import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from './path';
import { ALL_SONGS } from './songs';
import { PANEL_BY_ID } from './psrE373Panel';
import { CHORD_BY_QUALITY } from '../engine/theory';
import { buildRhythmSchedule } from '../engine/rhythm';
import { buildPatternSong, validateTemplate } from '../engine/patterns';

const ready = ALL_LESSONS.filter((l) => l.status === 'ready');
const inRange = (m: number) => m >= 36 && m <= 96;

describe('authored lessons', () => {
  it('every ready lesson has objectives and a duration', () => {
    for (const l of ready) {
      expect(l.objectives.length, l.id).toBeGreaterThan(0);
      expect(l.durationMinutes, l.id).toBeGreaterThan(0);
    }
  });

  it('concept cards stay on the 61-key range and try-its have targets', () => {
    for (const l of ready) {
      if (l.type !== 'concept') continue;
      expect(l.cards.length, l.id).toBeGreaterThan(0);
      for (const c of l.cards) {
        expect(c.title.length, l.id).toBeGreaterThan(0);
        expect(c.body.length, l.id).toBeGreaterThan(20);
        for (const m of c.highlight?.midis ?? []) expect(inRange(m), `${l.id} highlight ${m}`).toBe(true);
        if (c.tryIt) {
          expect(c.tryIt.targetMidis.length, l.id).toBeGreaterThan(0);
          for (const m of c.tryIt.targetMidis) expect(inRange(m), `${l.id} tryIt ${m}`).toBe(true);
        }
        if (c.diagram) expect(['circle-of-fifths', 'finger-numbers', 'panel'], `${l.id} diagram`).toContain(c.diagram);
      }
    }
  });

  it('rhythm lessons build a schedule with onsets', () => {
    for (const l of ready) {
      if (l.type !== 'rhythm') continue;
      const s = buildRhythmSchedule(l);
      expect(s.onsets.length, l.id).toBeGreaterThan(0);
      expect(s.totalSec, l.id).toBeLessThan(l.durationMinutes * 60);
    }
  });

  it('chord drills use known qualities and sane targets', () => {
    for (const l of ready) {
      if (l.type !== 'chord-drill') continue;
      expect(l.sequence.length, l.id).toBeGreaterThan(0);
      for (const c of l.sequence) {
        expect(CHORD_BY_QUALITY[c.quality], `${l.id} quality ${c.quality}`).toBeDefined();
        expect(c.rootPc, l.id).toBeGreaterThanOrEqual(0);
        expect(c.rootPc, l.id).toBeLessThan(12);
      }
      if (l.mode === 'metronome') expect(l.bpm, l.id).toBeDefined();
      if (l.mode === 'timed') expect(l.targetTransitionMs, l.id).toBeDefined();
    }
  });

  it('quiz questions each have exactly one answer of the right kind', () => {
    for (const l of ready) {
      if (l.type !== 'quiz') continue;
      for (const q of l.questions) {
        expect(q.explanation.length, l.id).toBeGreaterThan(0);
        if (q.kind === 'choice') {
          expect(q.choices?.length, l.id).toBeGreaterThanOrEqual(2);
          expect(q.answerIndex, l.id).toBeDefined();
          expect(q.answerIndex!, l.id).toBeLessThan(q.choices!.length);
        } else {
          expect(q.answerMidis?.length, l.id).toBeGreaterThan(0);
          if (q.kind === 'press-key') expect(q.answerMidis!.length, l.id).toBe(1);
        }
      }
    }
  });

  it('keyboard tasks reference real panel regions', () => {
    for (const l of ready) {
      if (l.type !== 'keyboard-task') continue;
      expect(l.steps.length, l.id).toBeGreaterThan(0);
      for (const s of l.steps) {
        expect(s.instruction.length, l.id).toBeGreaterThan(10);
        if (s.panelButton) expect(PANEL_BY_ID[s.panelButton], `${l.id} panel ${s.panelButton}`).toBeDefined();
      }
    }
  });

  it('pattern lessons have valid templates and progressions', () => {
    for (const l of ready) {
      if (l.type !== 'pattern') continue;
      expect(l.templates.length, l.id).toBeGreaterThan(0);
      for (const t of l.templates) expect(validateTemplate(t), `${l.id} ${t.id}`).toBeNull();
      expect(l.progression.length, l.id).toBeGreaterThan(0);
      for (const c of l.progression) expect(CHORD_BY_QUALITY[c.quality], `${l.id} ${c.quality}`).toBeDefined();
      const song = buildPatternSong({ lessonId: l.id, title: l.title, template: l.templates[0], progression: l.progression, bpm: l.bpm, repeats: l.repeats });
      for (const n of song.arrangements.pro.notes) expect(inRange(n.midi), `${l.id} midi ${n.midi}`).toBe(true);
    }
  });

  it('ear lessons have playable items in range', () => {
    for (const l of ready) {
      if (l.type !== 'ear') continue;
      expect(l.items.length, l.id).toBeGreaterThan(0);
      for (const item of l.items) {
        expect(item.targetMidis.length, l.id).toBeGreaterThan(0);
        for (const m of [...item.targetMidis, ...(item.referenceMidi !== undefined ? [item.referenceMidi] : [])]) expect(inRange(m), `${l.id} ${m}`).toBe(true);
        if (item.kind === 'note') expect(item.targetMidis, l.id).toHaveLength(1);
        if (item.kind === 'interval') expect(item.targetMidis, l.id).toHaveLength(2);
        if (item.kind === 'chord') expect(item.targetMidis.length, l.id).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('quiz audio stays in range', () => {
    for (const l of ready) {
      if (l.type !== 'quiz') continue;
      for (const q of l.questions) for (const m of q.playMidis ?? []) expect(inRange(m), `${l.id} play ${m}`).toBe(true);
    }
  });

  it('counts: 101 ready lessons, 53 of them non-song and 48 of them score songs/exercises', () => {
    expect(ready).toHaveLength(101);
    expect(ready.filter((l) => l.type !== 'score')).toHaveLength(53);
    expect(ready.filter((l) => l.type === 'score')).toHaveLength(48);
  });

  it('every song lesson plays notes inside the 61-key range with sane durations', () => {
    for (const l of ready) {
      if (l.type !== 'score') continue;
      const song = ALL_SONGS.find((s) => s.id === l.songId)!;
      expect(song, l.id).toBeDefined();
      for (const tier of ['beginner', 'intermediate', 'pro'] as const) {
        const notes = song.arrangements[tier].notes;
        expect(notes.length, `${l.id} ${tier}`).toBeGreaterThan(0);
        const barSec = (60 / song.bpm) * song.timeSignature[0];
        for (const n of notes) {
          expect(inRange(n.midi), `${l.id} ${tier} midi ${n.midi}`).toBe(true);
          expect(n.duration, `${l.id} ${tier} duration`).toBeGreaterThan(0);
          // Every onset must be reachable before the session ends.
          expect(n.startTime, `${l.id} ${tier} onset after the end`).toBeLessThan(song.durationSeconds);
          // The arranger's bar-long bass notes may ring past the last barline, but never by more than a bar.
          expect(n.startTime + n.duration, `${l.id} ${tier} overruns`).toBeLessThanOrEqual(song.durationSeconds + barSec);
        }
      }
    }
  });
});
