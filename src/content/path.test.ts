import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, LESSON_BY_ID, LESSON_BY_SONG_ID, LEVELS } from './path';
import { ALL_SONGS } from './songs';

describe('learning path', () => {
  it('has 10 modules and 101 lessons with unique stable ids and positional codes', () => {
    expect(LEVELS).toHaveLength(10);
    expect(ALL_LESSONS).toHaveLength(101);
    expect(new Set(ALL_LESSONS.map((l) => l.id)).size).toBe(101);
    expect(new Set(ALL_LESSONS.map((l) => l.code)).size).toBe(101);
    for (const l of ALL_LESSONS) expect(l.id, l.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it('numbers lessons within their level', () => {
    for (const level of LEVELS) {
      level.lessons.forEach((lesson, i) => {
        expect(lesson.levelId).toBe(level.id);
        expect(lesson.code).toBe(`${level.id}.${i + 1}`);
      });
    }
  });

  it('places every song exactly once as a ready score lesson, with the song id as the lesson id', () => {
    const songIds = ALL_SONGS.map((s) => s.id);
    const placed = Object.keys(LESSON_BY_SONG_ID);
    expect(placed.sort()).toEqual([...songIds].sort());
    for (const id of songIds) expect(LESSON_BY_ID[id]?.type).toBe('score');
  });

  it('marks the keyboard track with 7 lessons', () => {
    expect(ALL_LESSONS.filter((l) => l.track === 'keyboard')).toHaveLength(7);
  });

  it('all 10 modules (1 to 10) are 100% complete with zero planned stubs', () => {
    const planned = LEVELS.flatMap((l) => l.lessons).filter((l) => l.status === 'planned');
    expect(planned).toEqual([]);
  });

  it('checkpoints reference earlier ready lessons', () => {
    for (const l of ALL_LESSONS) {
      if (l.status !== 'ready' || l.type !== 'checkpoint') continue;
      const myIndex = ALL_LESSONS.indexOf(l);
      for (const part of l.parts) {
        const target = LESSON_BY_ID[part.lessonId];
        expect(target, `${l.id} → ${part.lessonId}`).toBeDefined();
        expect(target.status, `${l.id} → ${part.lessonId}`).toBe('ready');
        expect(ALL_LESSONS.indexOf(target), `${l.id} → ${part.lessonId} should come first`).toBeLessThan(myIndex);
      }
    }
  });
});
