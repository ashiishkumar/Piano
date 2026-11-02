import {
  ArrangementTier,
  NoteEvaluationEvent,
  PracticeMode,
  PracticeSessionRecord,
  ProblemSpot,
  SongScore,
} from '../types/music';
import { WEIGHT_DYNAMICS, WEIGHT_PITCH, WEIGHT_TIMING } from './constants';
import { timingScoreForDelta } from './timing';

export interface SessionInput {
  song: SongScore;
  tier: ArrangementTier;
  practiceMode: PracticeMode;
  tempoMultiplier: number;
  evaluations: NoteEvaluationEvent[];
  keyErrorCounts: Record<number, number>;
  keyHitCounts: Record<number, number>;
  timestamp: number;
}

export interface TimingBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

export function buildTimingHistogram(validHits: NoteEvaluationEvent[]): TimingBucket[] {
  const buckets: TimingBucket[] = [
    { label: '<-60ms (Rush)', min: -9999, max: -60, count: 0 },
    { label: '-60..-25ms', min: -60, max: -25, count: 0 },
    { label: '±25ms (Perfect)', min: -25, max: 25, count: 0 },
    { label: '+25..+60ms', min: 25, max: 60, count: 0 },
    { label: '>+60ms (Drag)', min: 60, max: 9999, count: 0 },
  ];
  for (const h of validHits) {
    const b = buckets.find((bk) => h.deltaMs >= bk.min && h.deltaMs <= bk.max);
    if (b) b.count++;
  }
  return buckets;
}

export function findProblemSpots(
  evaluations: NoteEvaluationEvent[],
  song: SongScore
): ProblemSpot[] {
  const measureStats = new Map<number, { errors: number; delays: number[] }>();
  for (const ev of evaluations) {
    const st = measureStats.get(ev.measure) || { errors: 0, delays: [] };
    if (ev.isWrongPitch || ev.timingClass === 'missed') st.errors++;
    if (ev.transitionDelayMs) st.delays.push(ev.transitionDelayMs);
    else st.delays.push(Math.abs(ev.deltaMs));
    measureStats.set(ev.measure, st);
  }

  const spots: ProblemSpot[] = [];
  for (const [m, st] of measureStats.entries()) {
    const avgDelay =
      st.delays.length > 0
        ? Math.round(st.delays.reduce((a, b) => a + b, 0) / st.delays.length)
        : 0;
    if (st.errors > 0 || avgDelay > 65) {
      spots.push({
        measureStart: m,
        measureEnd: Math.min(song.totalMeasures, m + 1),
        reason:
          st.errors > 0
            ? `${st.errors} pitch slip(s) & +${avgDelay}ms transition hesitation`
            : `+${avgDelay}ms chord transition / finger-crossing delay`,
        avgDelayMs: avgDelay,
        errorCount: st.errors,
        recommendedBpm: Math.max(50, Math.round(song.bpm * 0.75)),
      });
    }
  }
  spots.sort(
    (a, b) => b.errorCount * 100 + b.avgDelayMs - (a.errorCount * 100 + a.avgDelayMs)
  );
  return spots;
}

interface PrescriptionContext {
  song: SongScore;
  problemSpots: ProblemSpot[];
  lhHitCount: number;
  avgLhVelocity: number;
  avgRhVelocity: number;
  meanDeltaMs: number;
}

export function buildPrescriptions(ctx: PrescriptionContext): PracticeSessionRecord['prescriptions'] {
  const { song, problemSpots, lhHitCount, avgLhVelocity, avgRhVelocity, meanDeltaMs } = ctx;
  const out: PracticeSessionRecord['prescriptions'] = [];

  if (problemSpots.length > 0) {
    const top = problemSpots[0];
    out.push({
      title: `Isolate Measures ${top.measureStart}–${top.measureEnd} (${top.reason})`,
      description: `Launch a targeted A–B loop drill at ${top.recommendedBpm} BPM with Auto-Ramp Speed Trainer enabled to smooth out this transition.`,
      measureStart: top.measureStart,
      measureEnd: top.measureEnd,
      targetBpm: top.recommendedBpm,
    });
  } else {
    out.push({
      title: `Mastery Speed Challenge (Measures 1–${song.totalMeasures})`,
      description: `Zero problem spots flagged! Loop the full piece starting at ${Math.round(song.bpm * 1.05)} BPM to build concert-tempo security.`,
      measureStart: 1,
      measureEnd: song.totalMeasures,
      targetBpm: Math.round(song.bpm * 1.05),
    });
  }

  if (lhHitCount > 0 && avgLhVelocity > avgRhVelocity - 10) {
    out.push({
      title: `Voicing & Hand Balance Drill (LH ${avgLhVelocity} vs RH ${avgRhVelocity})`,
      description: `Your Left-Hand accompaniment velocity averaged ${avgLhVelocity}, nearly matching your Right-Hand melody (${avgRhVelocity}). Practice Measures 1–2 aiming for LH ~55 and RH ~88.`,
      measureStart: 1,
      measureEnd: Math.min(2, song.totalMeasures),
      targetBpm: Math.round(song.bpm * 0.85),
    });
  } else {
    out.push({
      title: `Blind-Mode Sight-Reading Challenge`,
      description: `Your hand balance was well controlled (RH ${avgRhVelocity} / LH ${avgLhVelocity}). Re-run Measures 1–${Math.min(4, song.totalMeasures)} in Blind Notation Mode to cement muscle memory.`,
      measureStart: 1,
      measureEnd: Math.min(4, song.totalMeasures),
      targetBpm: song.bpm,
    });
  }

  out.push({
    title:
      meanDeltaMs > 20
        ? `Rhythm Tightening Drill (Avg +${meanDeltaMs}ms Late Drag)`
        : meanDeltaMs < -20
        ? `Pulse Stabilization Drill (Avg ${meanDeltaMs}ms Early Rush)`
        : `Micro-Timing Precision Polish (Avg ${meanDeltaMs >= 0 ? '+' : ''}${meanDeltaMs}ms)`,
    description:
      meanDeltaMs > 20
        ? `You tended to drag slightly behind the beat (+${meanDeltaMs}ms). Practice in Strict Tempo Mode with the metronome active.`
        : meanDeltaMs < -20
        ? `You tended to rush ahead of the beat (${meanDeltaMs}ms). Breathe and lock into the downbeat click.`
        : `Excellent rhythmic centering (${meanDeltaMs >= 0 ? '+' : ''}${meanDeltaMs}ms mean drift). Ready for the next stage or arrangement tier!`,
    measureStart: 1,
    measureEnd: song.totalMeasures,
    targetBpm: song.bpm,
  });

  return out;
}

function average(values: number[], fallback: number): number {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : fallback;
}

/**
 * Turn a session's note evaluations into the saved report card.
 * Pure: same input, same record. Returns null if nothing was played.
 */
export function summarizeSession(input: SessionInput): PracticeSessionRecord | null {
  const { song, evaluations } = input;
  if (evaluations.length === 0) return null;

  const validHits = evaluations.filter((e) => !e.isWrongPitch);
  const wrongEvents = evaluations.filter((e) => e.isWrongPitch);

  const pitchAccuracy = Math.round(
    (validHits.length / Math.max(1, validHits.length + wrongEvents.length)) * 100
  );

  const timingScores = validHits.map((e) => timingScoreForDelta(e.deltaMs));
  const timingPrecision = timingScores.length > 0 ? Math.round(average(timingScores, 85)) : 85;

  const rhHits = validHits.filter((e) => e.hand === 'right');
  const lhHits = validHits.filter((e) => e.hand === 'left');
  const avgRhVelocity = Math.round(average(rhHits.map((e) => e.actualVelocity), 84));
  const avgLhVelocity = Math.round(average(lhHits.map((e) => e.actualVelocity), 60));

  const velDiffs = validHits.map((e) =>
    Math.max(0, 100 - Math.abs(e.actualVelocity - e.expectedVelocity) * 1.4)
  );
  const baseDyn = average(velDiffs, 85);
  const balanceBonus =
    rhHits.length > 0 && lhHits.length > 0 && avgRhVelocity > avgLhVelocity ? 6 : 0;
  const dynamicControlScore = Math.min(100, Math.round(baseDyn + balanceBonus));

  const overallScore = Math.round(
    pitchAccuracy * WEIGHT_PITCH + timingPrecision * WEIGHT_TIMING + dynamicControlScore * WEIGHT_DYNAMICS
  );

  const meanDeltaMs = Math.round(average(validHits.map((e) => e.deltaMs), 0));

  const buckets = buildTimingHistogram(validHits);
  const problemSpots = findProblemSpots(evaluations, song);
  const prescriptions = buildPrescriptions({
    song,
    problemSpots,
    lhHitCount: lhHits.length,
    avgLhVelocity,
    avgRhVelocity,
    meanDeltaMs,
  });

  return {
    songId: song.id,
    songTitle: song.title,
    stageId: song.stageId,
    tier: input.tier,
    practiceMode: input.practiceMode,
    timestamp: input.timestamp,
    durationSeconds: Math.round(song.durationSeconds / input.tempoMultiplier),
    overallScore,
    pitchAccuracy,
    timingPrecision,
    dynamicControlScore,
    avgRhVelocity,
    avgLhVelocity,
    meanDeltaMs,
    timingHistogram: buckets.map((b) => ({ bucketLabel: b.label, count: b.count })),
    keyErrorCounts: { ...input.keyErrorCounts },
    keyHitCounts: { ...input.keyHitCounts },
    problemSpots: problemSpots.slice(0, 4),
    prescriptions,
  };
}
