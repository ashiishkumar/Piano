import { PracticeSessionRecord } from '../types/music';
import { Lesson, Level, isReady } from '../types/lesson';
import { LessonStatus, nextLesson } from './progress';

export type PlanItem =
  | {
      id: string;
      kind: 'lesson';
      title: string;
      detail: string;
      minutes: number;
      lessonId: string;
    }
  | {
      id: string;
      kind: 'drill';
      title: string;
      detail: string;
      minutes: number;
      songId: string;
      measureStart: number;
      measureEnd: number;
      targetBpm: number;
    }
  | {
      id: string;
      kind: 'review';
      title: string;
      detail: string;
      minutes: number;
      lessonId: string;
    };

export interface DailyPlanInput {
  levels: Level[];
  statuses: Record<string, LessonStatus>;
  /** Most recent finished session, if any */
  lastSession: PracticeSessionRecord | null;
  /** Lesson id for a song id, to turn a session back into a lesson */
  lessonIdForSong: (songId: string) => string | undefined;
  /** Target total minutes; default 10 */
  budgetMinutes?: number;
}

/**
 * Today's plan: continue the path, then fix what went wrong last time, then
 * revisit something passed but not yet mastered. Three items at most, ten minutes.
 */
export function buildDailyPlan(input: DailyPlanInput): PlanItem[] {
  const budget = input.budgetMinutes ?? 10;
  const items: PlanItem[] = [];
  let used = 0;

  const next = nextLesson(input.levels, input.statuses);
  if (next) {
    const minutes = Math.min(next.durationMinutes, budget);
    items.push({
      id: `lesson-${next.id}`,
      kind: 'lesson',
      title: next.title,
      detail: `Lesson ${next.code} · ${input.statuses[next.id] === 'in-progress' ? 'continue' : 'new'}`,
      minutes,
      lessonId: next.id,
    });
    used += minutes;
  }

  // A drill from the last session's first prescription, if it points at real measures
  // and there is budget left.
  const rx = input.lastSession?.prescriptions?.[0];
  if (input.lastSession && rx && used < budget) {
    const minutes = Math.min(3, budget - used);
    items.push({
      id: `drill-${input.lastSession.songId}-${rx.measureStart}-${rx.measureEnd}`,
      kind: 'drill',
      title: `Fix bars ${rx.measureStart}–${rx.measureEnd} of ${input.lastSession.songTitle}`,
      detail: `${rx.targetBpm} BPM loop · from your last report`,
      minutes,
      songId: input.lastSession.songId,
      measureStart: rx.measureStart,
      measureEnd: rx.measureEnd,
      targetBpm: rx.targetBpm,
    });
    used += minutes;
  }

  // Review: the earliest passed-but-not-mastered lesson that is not already in the plan.
  if (used < budget) {
    const review = findReviewLesson(input.levels, input.statuses, items.flatMap((i) => (i.kind !== 'drill' ? [i.lessonId] : [])));
    if (review) {
      const minutes = Math.min(3, budget - used);
      items.push({
        id: `review-${review.id}`,
        kind: 'review',
        title: review.title,
        detail: `Lesson ${review.code} · passed, aim for mastery`,
        minutes,
        lessonId: review.id,
      });
    }
  }

  return items;
}

function findReviewLesson(levels: Level[], statuses: Record<string, LessonStatus>, exclude: string[]): Lesson | null {
  for (const level of levels) {
    for (const lesson of level.lessons) {
      if (!isReady(lesson)) continue;
      if (exclude.includes(lesson.id)) continue;
      if (statuses[lesson.id] === 'passed') return lesson;
    }
  }
  return null;
}

export function totalPlanMinutes(items: PlanItem[]): number {
  return items.reduce((n, i) => n + i.minutes, 0);
}

export interface FirstRunInput {
  profile: { hasCompletedFirstRun?: boolean } | null | undefined;
  sessionCount: number;
}

/**
 * Show the introduction once. Anyone with saved sessions used the app before the
 * flag existed and should not be interrupted.
 */
export function shouldShowFirstRun(input: FirstRunInput): boolean {
  if (input.profile?.hasCompletedFirstRun) return false;
  return input.sessionCount === 0;
}

export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return 'Late night practice';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
