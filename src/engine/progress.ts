import { Lesson, Level, isReady } from '../types/lesson';

export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'passed' | 'mastered';

export interface LessonProgressRecord {
  lessonId: string;
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttemptAt: number;
  passedAt?: number;
  masteredAt?: number;
}

export type ProgressMap = Record<string, LessonProgressRecord>;

export const DEFAULT_PASS_SCORE = 70;
export const DEFAULT_MASTER_SCORE = 90;

export function passScoreOf(lesson: Lesson): number {
  return lesson.passScore ?? DEFAULT_PASS_SCORE;
}

export function masterScoreOf(lesson: Lesson): number {
  return lesson.masterScore ?? DEFAULT_MASTER_SCORE;
}

/** Fold a new attempt into a progress record. */
export function applyAttempt(
  existing: LessonProgressRecord | undefined,
  lesson: Lesson,
  score: number,
  at: number
): LessonProgressRecord {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const best = Math.max(existing?.bestScore ?? 0, clamped);
  const rec: LessonProgressRecord = {
    lessonId: lesson.id,
    attempts: (existing?.attempts ?? 0) + 1,
    bestScore: best,
    lastScore: clamped,
    lastAttemptAt: at,
    passedAt: existing?.passedAt,
    masteredAt: existing?.masteredAt,
  };
  if (rec.passedAt === undefined && clamped >= passScoreOf(lesson)) rec.passedAt = at;
  if (rec.masteredAt === undefined && clamped >= masterScoreOf(lesson)) rec.masteredAt = at;
  return rec;
}

/**
 * Is a level complete enough to unlock the next one?
 * If the level has a checkpoint lesson that is ready, passing it is the gate.
 * Otherwise every ready lesson in the level must be passed.
 * Planned (payload-less) lessons never block progress.
 */
export function isLevelComplete(level: Level, progress: ProgressMap): boolean {
  const ready = level.lessons.filter(isReady);
  if (ready.length === 0) return true;
  const checkpoints = ready.filter((l) => l.type === 'checkpoint');
  const gate = checkpoints.length > 0 ? checkpoints : ready;
  return gate.every((l) => progress[l.id]?.passedAt !== undefined);
}

export interface StatusOptions {
  /** Ignore level gating (owner/pro mode). */
  unlockAll?: boolean;
}

/**
 * Status of every lesson on the path. Levels unlock in order; inside an
 * unlocked level every lesson is available so adults can roam.
 */
export function computeLessonStatuses(
  levels: Level[],
  progress: ProgressMap,
  opts: StatusOptions = {}
): Record<string, LessonStatus> {
  const out: Record<string, LessonStatus> = {};
  let unlocked = true;
  for (const level of levels) {
    for (const lesson of level.lessons) {
      const rec = progress[lesson.id];
      if (rec?.masteredAt !== undefined) out[lesson.id] = 'mastered';
      else if (rec?.passedAt !== undefined) out[lesson.id] = 'passed';
      else if (rec && rec.attempts > 0) out[lesson.id] = unlocked || opts.unlockAll ? 'in-progress' : 'locked';
      else out[lesson.id] = unlocked || opts.unlockAll ? 'available' : 'locked';
    }
    if (unlocked && !isLevelComplete(level, progress)) unlocked = false;
  }
  return out;
}

/** The first ready lesson that is available or in progress: what "Continue" should open. */
export function nextLesson(levels: Level[], statuses: Record<string, LessonStatus>): Lesson | null {
  for (const level of levels) {
    for (const lesson of level.lessons) {
      if (!isReady(lesson)) continue;
      const s = statuses[lesson.id];
      if (s === 'available' || s === 'in-progress') return lesson;
    }
  }
  // Everything passed: offer the first un-mastered lesson, else the last lesson.
  for (const level of levels) {
    for (const lesson of level.lessons) {
      if (isReady(lesson) && statuses[lesson.id] === 'passed') return lesson;
    }
  }
  const all = levels.flatMap((l) => l.lessons).filter(isReady);
  return all.length ? all[all.length - 1] : null;
}

export interface LevelSummary {
  levelId: number;
  readyCount: number;
  plannedCount: number;
  passedCount: number;
  masteredCount: number;
  unlocked: boolean;
  complete: boolean;
}

export function summarizeLevels(
  levels: Level[],
  progress: ProgressMap,
  statuses: Record<string, LessonStatus>
): LevelSummary[] {
  return levels.map((level) => {
    const ready = level.lessons.filter(isReady);
    return {
      levelId: level.id,
      readyCount: ready.length,
      plannedCount: level.lessons.length - ready.length,
      passedCount: ready.filter((l) => progress[l.id]?.passedAt !== undefined).length,
      masteredCount: ready.filter((l) => progress[l.id]?.masteredAt !== undefined).length,
      unlocked: level.lessons.some((l) => statuses[l.id] !== 'locked'),
      complete: isLevelComplete(level, progress),
    };
  });
}

/**
 * Seed lesson progress from the pre-existing per-song mastery table so nobody
 * loses history when the lesson model arrives.
 */
export function progressFromSongMastery(
  levels: Level[],
  mastery: Record<string, { bestScore: number; lastPlayedAt: number; playCount: number }>
): ProgressMap {
  const out: ProgressMap = {};
  for (const level of levels) {
    for (const lesson of level.lessons) {
      if (lesson.status !== 'ready' || lesson.type !== 'score') continue;
      const m = mastery[lesson.songId];
      if (!m || m.playCount === 0) continue;
      let rec: LessonProgressRecord = {
        lessonId: lesson.id,
        attempts: m.playCount,
        bestScore: m.bestScore,
        lastScore: m.bestScore,
        lastAttemptAt: m.lastPlayedAt,
      };
      if (m.bestScore >= passScoreOf(lesson)) rec = { ...rec, passedAt: m.lastPlayedAt };
      if (m.bestScore >= masterScoreOf(lesson)) rec = { ...rec, masteredAt: m.lastPlayedAt };
      out[lesson.id] = rec;
    }
  }
  return out;
}
