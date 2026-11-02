import { describe, expect, it } from 'vitest';
import { Lesson, Level } from '../types/lesson';
import {
  applyAttempt,
  computeLessonStatuses,
  isLevelComplete,
  nextLesson,
  progressFromSongMastery,
  summarizeLevels,
} from './progress';

function score(id: string, levelId: number, songId = id): Lesson {
  return {
    id,
    code: id,
    levelId,
    title: id,
    track: 'play',
    type: 'score',
    status: 'ready',
    durationMinutes: 5,
    objectives: [],
    songId,
  };
}

function planned(id: string, levelId: number): Lesson {
  return {
    id,
    code: id,
    levelId,
    title: id,
    track: 'theory',
    type: 'concept',
    status: 'planned',
    durationMinutes: 5,
    objectives: [],
  };
}

function checkpoint(id: string, levelId: number, parts: string[]): Lesson {
  return {
    id,
    code: id,
    levelId,
    title: id,
    track: 'play',
    type: 'checkpoint',
    status: 'ready',
    durationMinutes: 5,
    objectives: [],
    parts: parts.map((p) => ({ lessonId: p, passScore: 70 })),
    passAll: true,
  };
}

function level(id: number, lessons: Lesson[]): Level {
  return { id, title: `Level ${id}`, subtitle: '', description: '', lessons };
}

const levels: Level[] = [
  level(1, [score('a', 1), score('b', 1), planned('p1', 1)]),
  level(2, [score('c', 2), score('d', 2), checkpoint('cp2', 2, ['c', 'd'])]),
  level(3, [score('e', 3)]),
];

describe('applyAttempt', () => {
  const lesson = score('a', 1);
  it('tracks attempts, best score and pass/master timestamps once', () => {
    const r1 = applyAttempt(undefined, lesson, 55, 100);
    expect(r1).toMatchObject({ attempts: 1, bestScore: 55, lastScore: 55, lastAttemptAt: 100 });
    expect(r1.passedAt).toBeUndefined();

    const r2 = applyAttempt(r1, lesson, 75, 200);
    expect(r2.passedAt).toBe(200);
    expect(r2.masteredAt).toBeUndefined();

    const r3 = applyAttempt(r2, lesson, 95, 300);
    expect(r3.passedAt).toBe(200); // first pass time is kept
    expect(r3.masteredAt).toBe(300);
    expect(r3.bestScore).toBe(95);

    const r4 = applyAttempt(r3, lesson, 40, 400);
    expect(r4.bestScore).toBe(95);
    expect(r4.lastScore).toBe(40);
    expect(r4.attempts).toBe(4);
  });

  it('respects per-lesson thresholds and clamps scores', () => {
    const strict = { ...lesson, passScore: 90, masterScore: 98 };
    expect(applyAttempt(undefined, strict, 85, 1).passedAt).toBeUndefined();
    expect(applyAttempt(undefined, strict, 150, 1)).toMatchObject({ bestScore: 100, masteredAt: 1 });
  });
});

describe('isLevelComplete', () => {
  it('requires every ready lesson when there is no checkpoint, ignoring planned ones', () => {
    expect(isLevelComplete(levels[0], {})).toBe(false);
    expect(isLevelComplete(levels[0], { a: applyAttempt(undefined, score('a', 1), 80, 1) })).toBe(false);
    expect(
      isLevelComplete(levels[0], {
        a: applyAttempt(undefined, score('a', 1), 80, 1),
        b: applyAttempt(undefined, score('b', 1), 80, 1),
      })
    ).toBe(true);
  });

  it('uses the checkpoint as the gate when one exists', () => {
    const cp = levels[1].lessons[2];
    expect(isLevelComplete(levels[1], { c: applyAttempt(undefined, score('c', 2), 99, 1) })).toBe(false);
    expect(isLevelComplete(levels[1], { cp2: applyAttempt(undefined, cp, 80, 1) })).toBe(true);
  });

  it('treats a level with no ready lessons as complete', () => {
    expect(isLevelComplete(level(9, [planned('x', 9)]), {})).toBe(true);
  });
});

describe('computeLessonStatuses', () => {
  it('unlocks level 1 only at the start', () => {
    const s = computeLessonStatuses(levels, {});
    expect(s.a).toBe('available');
    expect(s.p1).toBe('available');
    expect(s.c).toBe('locked');
    expect(s.e).toBe('locked');
  });

  it('unlocks the next level when the previous is complete and marks passed/mastered', () => {
    const progress = {
      a: applyAttempt(undefined, score('a', 1), 95, 1),
      b: applyAttempt(undefined, score('b', 1), 72, 2),
      c: applyAttempt(undefined, score('c', 2), 30, 3),
    };
    const s = computeLessonStatuses(levels, progress);
    expect(s.a).toBe('mastered');
    expect(s.b).toBe('passed');
    expect(s.c).toBe('in-progress');
    expect(s.d).toBe('available');
    expect(s.e).toBe('locked');
  });

  it('can unlock everything for pro mode', () => {
    const s = computeLessonStatuses(levels, {}, { unlockAll: true });
    expect(s.e).toBe('available');
  });
});

describe('nextLesson', () => {
  it('returns the first available or in-progress ready lesson', () => {
    expect(nextLesson(levels, computeLessonStatuses(levels, {}))?.id).toBe('a');
    const progress = { a: applyAttempt(undefined, score('a', 1), 80, 1) };
    expect(nextLesson(levels, computeLessonStatuses(levels, progress))?.id).toBe('b');
  });

  it('skips planned lessons', () => {
    const progress = {
      a: applyAttempt(undefined, score('a', 1), 80, 1),
      b: applyAttempt(undefined, score('b', 1), 80, 1),
    };
    expect(nextLesson(levels, computeLessonStatuses(levels, progress))?.id).toBe('c');
  });

  it('falls back to a passed-but-not-mastered lesson when everything is passed', () => {
    const progress: Record<string, ReturnType<typeof applyAttempt>> = {};
    for (const l of levels.flatMap((lv) => lv.lessons)) {
      if (l.status === 'ready') progress[l.id] = applyAttempt(undefined, l, 75, 1);
    }
    expect(nextLesson(levels, computeLessonStatuses(levels, progress))?.id).toBe('a');
  });
});

describe('summarizeLevels', () => {
  it('counts ready, planned, passed and unlocked per level', () => {
    const progress = { a: applyAttempt(undefined, score('a', 1), 95, 1) };
    const statuses = computeLessonStatuses(levels, progress);
    const sum = summarizeLevels(levels, progress, statuses);
    expect(sum[0]).toMatchObject({ readyCount: 2, plannedCount: 1, passedCount: 1, masteredCount: 1, unlocked: true, complete: false });
    expect(sum[1].unlocked).toBe(false);
  });
});

describe('progressFromSongMastery', () => {
  it('seeds score lessons from the legacy per-song table', () => {
    const p = progressFromSongMastery(levels, {
      a: { bestScore: 92, lastPlayedAt: 500, playCount: 3 },
      c: { bestScore: 40, lastPlayedAt: 600, playCount: 1 },
      unused: { bestScore: 100, lastPlayedAt: 1, playCount: 1 },
    });
    expect(p.a).toMatchObject({ attempts: 3, bestScore: 92, passedAt: 500, masteredAt: 500 });
    expect(p.c).toMatchObject({ attempts: 1, bestScore: 40 });
    expect(p.c.passedAt).toBeUndefined();
    expect(p.unused).toBeUndefined();
    expect(p.b).toBeUndefined();
  });
});
