import { describe, expect, it } from 'vitest';
import { Lesson, Level } from '../types/lesson';
import { PracticeSessionRecord } from '../types/music';
import { buildDailyPlan, greetingFor, shouldShowFirstRun, totalPlanMinutes } from './dailyPlan';
import { applyAttempt, computeLessonStatuses } from './progress';

function score(id: string, levelId: number, minutes = 8): Lesson {
  return {
    id,
    code: id,
    levelId,
    title: `Lesson ${id}`,
    track: 'play',
    type: 'score',
    status: 'ready',
    durationMinutes: minutes,
    objectives: [],
    songId: `song-${id}`,
  };
}

const levels: Level[] = [
  { id: 1, title: 'L1', subtitle: '', description: '', lessons: [score('a', 1), score('b', 1), score('c', 1)] },
];

const session: PracticeSessionRecord = {
  songId: 'song-a',
  songTitle: 'Song A',
  stageId: 1,
  tier: 'beginner',
  practiceMode: 'wait',
  timestamp: 1,
  durationSeconds: 60,
  overallScore: 75,
  pitchAccuracy: 80,
  timingPrecision: 70,
  dynamicControlScore: 70,
  avgRhVelocity: 80,
  avgLhVelocity: 60,
  meanDeltaMs: 10,
  timingHistogram: [],
  keyErrorCounts: {},
  keyHitCounts: {},
  problemSpots: [],
  prescriptions: [
    { title: 'Isolate', description: '', measureStart: 3, measureEnd: 4, targetBpm: 54 },
  ],
};

describe('buildDailyPlan', () => {
  it('starts with the next lesson when nothing has been played', () => {
    const plan = buildDailyPlan({
      levels,
      statuses: computeLessonStatuses(levels, {}),
      lastSession: null,
      lessonIdForSong: () => undefined,
    });
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ kind: 'lesson', lessonId: 'a', minutes: 8 });
    expect(plan[0].detail).toContain('new');
  });

  it('adds a drill from the last report and a review of a passed lesson', () => {
    const short: Level[] = [
      { ...levels[0], lessons: [score('a', 1, 5), score('b', 1, 5), score('c', 1, 5)] },
    ];
    const progress = { a: applyAttempt(undefined, score('a', 1, 5), 75, 1) };
    const statuses = computeLessonStatuses(short, progress);
    const plan = buildDailyPlan({ levels: short, statuses, lastSession: session, lessonIdForSong: () => 'a' });
    expect(plan.map((p) => p.kind)).toEqual(['lesson', 'drill', 'review']);
    expect(plan[0]).toMatchObject({ lessonId: 'b', minutes: 5 });
    expect(plan[1]).toMatchObject({ songId: 'song-a', measureStart: 3, measureEnd: 4, targetBpm: 54, minutes: 3 });
    expect(plan[2]).toMatchObject({ lessonId: 'a', minutes: 2 });
    expect(totalPlanMinutes(plan)).toBe(10);
  });

  it('drops the review when the lesson and drill use the whole budget', () => {
    const progress = { a: applyAttempt(undefined, score('a', 1), 75, 1) };
    const statuses = computeLessonStatuses(levels, progress);
    const plan = buildDailyPlan({ levels, statuses, lastSession: session, lessonIdForSong: () => 'a' });
    expect(plan.map((p) => p.kind)).toEqual(['lesson', 'drill']);
    expect(totalPlanMinutes(plan)).toBe(10);
  });

  it('respects the minute budget', () => {
    const plan = buildDailyPlan({
      levels,
      statuses: computeLessonStatuses(levels, {}),
      lastSession: session,
      lessonIdForSong: () => undefined,
      budgetMinutes: 8,
    });
    // 8 minutes go to the lesson; nothing left for the drill
    expect(plan).toHaveLength(1);
    expect(totalPlanMinutes(plan)).toBe(8);
  });

  it('labels an in-progress lesson as continue', () => {
    const progress = { a: applyAttempt(undefined, score('a', 1), 40, 1) };
    const plan = buildDailyPlan({
      levels,
      statuses: computeLessonStatuses(levels, progress),
      lastSession: null,
      lessonIdForSong: () => undefined,
    });
    expect(plan[0].detail).toContain('continue');
  });
});

describe('shouldShowFirstRun', () => {
  it('shows once for brand-new profiles only', () => {
    expect(shouldShowFirstRun({ profile: null, sessionCount: 0 })).toBe(true);
    expect(shouldShowFirstRun({ profile: { hasCompletedFirstRun: false }, sessionCount: 0 })).toBe(true);
    expect(shouldShowFirstRun({ profile: { hasCompletedFirstRun: true }, sessionCount: 0 })).toBe(false);
    // existing user from before the flag existed
    expect(shouldShowFirstRun({ profile: {}, sessionCount: 3 })).toBe(false);
  });
});

describe('greetingFor', () => {
  it('changes with the hour', () => {
    expect(greetingFor(new Date(2026, 0, 1, 8))).toBe('Good morning');
    expect(greetingFor(new Date(2026, 0, 1, 14))).toBe('Good afternoon');
    expect(greetingFor(new Date(2026, 0, 1, 20))).toBe('Good evening');
    expect(greetingFor(new Date(2026, 0, 1, 2))).toBe('Late night practice');
  });
});
