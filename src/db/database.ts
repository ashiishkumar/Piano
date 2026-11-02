import Dexie, { type Table } from 'dexie';
import { PracticeSessionRecord, SongScore } from '../types/music';
import { LessonProgressRecord } from '../engine/progress';

export interface SongMasteryRecord {
  songId: string;
  bestScore: number;
  bestAccuracy: number;
  bestTiming: number;
  bestDynamics: number;
  completedTiers: ('beginner' | 'intermediate' | 'pro')[];
  lastPlayedAt: number;
  playCount: number;
}

export interface UserProfileRecord {
  id: string; // 'default'
  xp: number;
  streakDays: number;
  lastPracticeDate: string; // YYYY-MM-DD
  totalPracticeSeconds: number;
  cumulativeKeyErrors: Record<number, number>;
  cumulativeKeyHits: Record<number, number>;
  /** Set once the introduction has been completed or skipped */
  hasCompletedFirstRun?: boolean;
}

class VirtuosoDatabase extends Dexie {
  sessions!: Table<PracticeSessionRecord, number>;
  customSongs!: Table<SongScore, string>;
  mastery!: Table<SongMasteryRecord, string>;
  profile!: Table<UserProfileRecord, string>;
  lessonProgress!: Table<LessonProgressRecord, string>;

  constructor() {
    super('VirtuosoStudioDB');
    this.version(1).stores({
      sessions: '++id, songId, stageId, timestamp, overallScore',
      customSongs: 'id, title, stageId, category',
      mastery: 'songId, bestScore, lastPlayedAt',
      profile: 'id',
    });
    // v2: per-lesson progress for the learning path (lesson model, Sprint 1)
    this.version(2).stores({
      sessions: '++id, songId, stageId, timestamp, overallScore',
      customSongs: 'id, title, stageId, category',
      mastery: 'songId, bestScore, lastPlayedAt',
      profile: 'id',
      lessonProgress: 'lessonId, lastAttemptAt',
    });
  }
}

export const db = new VirtuosoDatabase();

export async function recordSessionToDb(session: PracticeSessionRecord): Promise<void> {
  await db.sessions.add(session);

  // Update song mastery
  const existingMastery = await db.mastery.get(session.songId);
  const completedTiers = new Set<'beginner' | 'intermediate' | 'pro'>(
    existingMastery?.completedTiers || []
  );
  if (session.overallScore >= 80) {
    completedTiers.add(session.tier);
  }

  await db.mastery.put({
    songId: session.songId,
    bestScore: Math.max(existingMastery?.bestScore || 0, session.overallScore),
    bestAccuracy: Math.max(existingMastery?.bestAccuracy || 0, session.pitchAccuracy),
    bestTiming: Math.max(existingMastery?.bestTiming || 0, session.timingPrecision),
    bestDynamics: Math.max(existingMastery?.bestDynamics || 0, session.dynamicControlScore),
    completedTiers: Array.from(completedTiers),
    lastPlayedAt: session.timestamp,
    playCount: (existingMastery?.playCount || 0) + 1,
  });

  // Update user profile XP, streak, and 61-key cumulative heatmap
  const today = new Date(session.timestamp).toISOString().slice(0, 10);
  const profile = (await db.profile.get('default')) || {
    id: 'default',
    xp: 0,
    streakDays: 1,
    lastPracticeDate: today,
    totalPracticeSeconds: 0,
    cumulativeKeyErrors: {},
    cumulativeKeyHits: {},
  };

  const yesterday = new Date(session.timestamp - 86400000).toISOString().slice(0, 10);
  let streakDays = profile.streakDays;
  if (profile.lastPracticeDate === yesterday) {
    streakDays += 1;
  } else if (profile.lastPracticeDate !== today) {
    streakDays = 1;
  }

  const cumulativeKeyErrors = { ...profile.cumulativeKeyErrors };
  for (const [k, count] of Object.entries(session.keyErrorCounts)) {
    const midi = Number(k);
    cumulativeKeyErrors[midi] = (cumulativeKeyErrors[midi] || 0) + count;
  }

  const cumulativeKeyHits = { ...profile.cumulativeKeyHits };
  for (const [k, count] of Object.entries(session.keyHitCounts)) {
    const midi = Number(k);
    cumulativeKeyHits[midi] = (cumulativeKeyHits[midi] || 0) + count;
  }

  const earnedXp = Math.round(session.overallScore * 1.5 + session.durationSeconds * 0.5);

  await db.profile.put({
    ...profile,
    id: 'default',
    xp: profile.xp + earnedXp,
    streakDays,
    lastPracticeDate: today,
    totalPracticeSeconds: profile.totalPracticeSeconds + session.durationSeconds,
    cumulativeKeyErrors,
    cumulativeKeyHits,
  });
}
