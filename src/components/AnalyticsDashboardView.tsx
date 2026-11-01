import React, { useMemo } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  Clock,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import {
  getSargamLabel,
  getWesternName,
  isBlackKey,
  PSR_E373_MAX_MIDI,
  PSR_E373_MIN_MIDI,
} from '../utils/notation';

export const AnalyticsDashboardView: React.FC = () => {
  const {
    sessionHistory,
    userProfile,
    lastCompletedSession,
    launchPrescriptionDrill,
    currentSong,
    rootSaPitchClass,
  } = useStudioStore();

  const latestSession = lastCompletedSession || sessionHistory[0] || null;

  // Compute 5-Axis Skill Radar Scores (0..100)
  const radarSkills = useMemo(() => {
    if (sessionHistory.length === 0) {
      return [
        { label: 'Sight-Reading', value: 74 },
        { label: 'Rhythm Precision', value: 78 },
        { label: 'Hand Independence', value: 70 },
        { label: 'Dynamics / Touch', value: 76 },
        { label: 'Speed / Dexterity', value: 72 },
      ];
    }

    const avgPitch =
      sessionHistory.reduce((a, s) => a + s.pitchAccuracy, 0) / sessionHistory.length;
    const avgTiming =
      sessionHistory.reduce((a, s) => a + s.timingPrecision, 0) / sessionHistory.length;
    const avgDyn =
      sessionHistory.reduce((a, s) => a + s.dynamicControlScore, 0) / sessionHistory.length;
    const proSessions = sessionHistory.filter((s) => s.tier !== 'beginner').length;
    const handIndep = Math.min(100, Math.round(avgPitch * 0.7 + Math.min(30, proSessions * 6)));
    const speedDex = Math.min(100, Math.round((avgPitch + avgTiming) / 2));

    return [
      { label: 'Sight-Reading', value: Math.round(avgPitch) },
      { label: 'Rhythm Precision', value: Math.round(avgTiming) },
      { label: 'Hand Independence', value: handIndep },
      { label: 'Dynamics / Touch', value: Math.round(avgDyn) },
      { label: 'Speed / Dexterity', value: speedDex },
    ];
  }, [sessionHistory]);

  // Radar Pentagon SVG Helper
  const radarPolygonPoints = useMemo(() => {
    const cx = 130;
    const cy = 125;
    const maxR = 85;
    return radarSkills
      .map((sk, idx) => {
        const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
        const r = (sk.value / 100) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [radarSkills]);

  // 61-Key Error Heatmap Data (MIDI 36..96)
  const heatmapKeys = useMemo(() => {
    const list: { midi: number; errors: number; hits: number; rate: number }[] = [];
    for (let m = PSR_E373_MIN_MIDI; m <= PSR_E373_MAX_MIDI; m++) {
      const errors = userProfile.cumulativeKeyErrors?.[m] || 0;
      const hits = userProfile.cumulativeKeyHits?.[m] || 0;
      const rate = hits + errors > 0 ? errors / (hits + errors) : 0;
      list.push({ midi: m, errors, hits, rate });
    }
    return list;
  }, [userProfile]);

  const topProblemKeys = useMemo(
    () =>
      [...heatmapKeys]
        .filter((k) => k.errors > 0)
        .sort((a, b) => b.errors - a.errors)
        .slice(0, 5),
    [heatmapKeys]
  );

  const histogramBuckets = latestSession?.timingHistogram || [
    { bucketLabel: '<-60ms (Rush)', count: 2 },
    { bucketLabel: '-60..-25ms', count: 5 },
    { bucketLabel: '±25ms (Perfect)', count: 18 },
    { bucketLabel: '+25..+60ms', count: 6 },
    { bucketLabel: '>+60ms (Drag)', count: 3 },
  ];
  const maxBucketCount = Math.max(1, ...histogramBuckets.map((b) => b.count));

  const prescriptions = latestSession?.prescriptions || [
    {
      title: 'Isolate Measures 2–3 (Thumb-Under & Chord Jump)',
      description:
        'Launch a 3-minute isolated loop drill at 70 BPM with Auto-Ramp Speed Trainer (+5% per pass) to eliminate transition hesitation.',
      measureStart: 2,
      measureEnd: 3,
      targetBpm: 70,
    },
    {
      title: 'Left/Right Hand Voicing Balance Drill',
      description:
        'Keep Left-Hand chord velocity softly cushioned around 55–62 while projecting the Right-Hand melody at 85–92.',
      measureStart: 1,
      measureEnd: 4,
      targetBpm: 80,
    },
    {
      title: 'Blind-Mode Grand Staff Sight-Reading',
      description:
        'Hide key labels and lock your eyes on the scrolling Grand Staff to build spatial muscle memory on your PSR-E373.',
      measureStart: 1,
      measureEnd: 4,
      targetBpm: 84,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-studio-950 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Practice Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {userProfile.streakDays} Days
              </span>
              <span className="text-xs text-emerald-400 font-medium">Active</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Conservatory XP</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {userProfile.xp} XP
              </span>
              <span className="text-xs text-slate-400">
                Lvl {Math.floor(userProfile.xp / 200) + 1}
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Latest Score</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {latestSession ? `${latestSession.overallScore}%` : '92%'}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {latestSession ? latestSession.songTitle : 'Ready to Record'}
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mean Rhythm Drift</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {latestSession
                  ? `${latestSession.meanDeltaMs >= 0 ? '+' : ''}${latestSession.meanDeltaMs}ms`
                  : '+8ms'}
              </span>
              <span className="text-xs text-emerald-400">Sub-25ms Target</span>
            </div>
          </div>
        </div>

        {/* Middle Row: 5-Axis Skill Radar Chart + Timing Drift Histogram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5-Axis Skill Radar Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>5-Axis Conservatory Skill Radar</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed from your real-time MIDI pitch, micro-timing, velocity voicing, and two-hand coordination telemetry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
              <svg width={260} height={240} className="overflow-visible">
                {/* Concentric Pentagon Rings (25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1].map((scale) => {
                  const pts = [0, 1, 2, 3, 4]
                    .map((idx) => {
                      const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                      const r = scale * 85;
                      return `${(130 + r * Math.cos(angle)).toFixed(1)},${(
                        125 +
                        r * Math.sin(angle)
                      ).toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={scale}
                      points={pts}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Axis Spokes & Labels */}
                {radarSkills.map((sk, idx) => {
                  const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                  const x2 = 130 + 85 * Math.cos(angle);
                  const y2 = 125 + 85 * Math.sin(angle);
                  const lx = 130 + 108 * Math.cos(angle);
                  const ly = 125 + 102 * Math.sin(angle);
                  return (
                    <g key={sk.label}>
                      <line
                        x1={130}
                        y1={125}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(255,255,255,0.12)"
                      />
                      <text
                        x={lx}
                        y={ly}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {sk.label}
                      </text>
                    </g>
                  );
                })}

                {/* User Skill Polygon */}
                <polygon
                  points={radarPolygonPoints}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10b981"
                  strokeWidth={2.2}
                />
              </svg>

              <div className="space-y-2.5 w-full sm:w-48">
                {radarSkills.map((sk) => (
                  <div key={sk.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{sk.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{sk.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-studio-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${sk.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timing Drift Histogram (Rushing vs Dragging) */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Micro-Timing Drift Histogram (Rushing vs. Dragging)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of <code className="text-cyan-300">delta_ms = actual_on - expected_beat</code> across your notes.
              </p>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-white/10">
              {histogramBuckets.map((b, idx) => {
                const heightPct = Math.max(8, Math.round((b.count / maxBucketCount) * 100));
                const isCenter = idx === 2;
                return (
                  <div
                    key={b.bucketLabel}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {b.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isCenter
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : idx === 1 || idx === 3
                          ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                          : 'bg-gradient-to-t from-amber-600 to-amber-400'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400 text-center pb-2">
                      {b.bucketLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 bg-studio-950 p-3 rounded-xl border border-white/5">
              <span>
                RH Avg Velocity:{' '}
                <strong className="text-emerald-400 font-mono">
                  {latestSession?.avgRhVelocity ?? 86}
                </strong>
              </span>
              <span>•</span>
              <span>
                LH Avg Velocity:{' '}
                <strong className="text-sky-400 font-mono">
                  {latestSession?.avgLhVelocity ?? 58}
                </strong>
              </span>
              <span>•</span>
              <span>
                Dynamic Balance:{' '}
                <strong className="text-amber-300 font-mono">
                  {latestSession?.dynamicControlScore ?? 90}%
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* 61-Key PSR-E373 Error Heatmap Overview */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>61-Key PSR-E373 Historical Error Heatmap (C1–C6 / MIDI 36–96)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Highlights specific pitches or scale degree crossings where pitch slips or hesitations occur most frequently.
              </p>
            </div>
            {topProblemKeys.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400">Focus Keys:</span>
                {topProblemKeys.map((pk) => (
                  <span
                    key={pk.midi}
                    className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold"
                  >
                    {getWesternName(pk.midi)} ({getSargamLabel(pk.midi, rootSaPitchClass).short}): {pk.errors} err
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-12 sm:grid-cols-20 md:grid-cols-31 gap-1 pt-1">
            {heatmapKeys.map((k) => {
              const black = isBlackKey(k.midi);
              const hasErr = k.errors > 0;
              return (
                <div
                  key={k.midi}
                  title={`${getWesternName(k.midi)} — Hits: ${k.hits}, Errors: ${k.errors}`}
                  className={`h-12 rounded flex flex-col items-center justify-end p-1 border text-[9px] font-mono ${
                    hasErr
                      ? 'bg-rose-500/30 border-rose-400 text-white font-bold'
                      : k.hits > 0
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                      : black
                      ? 'bg-studio-950 border-white/10 text-slate-500'
                      : 'bg-studio-900 border-white/10 text-slate-400'
                  }`}
                >
                  <span>{getWesternName(k.midi, k.midi % 12 === 0)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automated AI Coach Practice Prescriptions (Module F.4) */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Automated AI Coach Practice Prescriptions
              </h2>
              <p className="text-xs text-slate-400">
                Actionable loop drills generated directly from your latest session telemetry. Click any prescription to jump straight into a targeted A–B Speed Trainer loop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prescriptions.map((p, idx) => (
              <div
                key={idx}
                className="glass-card rounded-xl p-4 flex flex-col justify-between space-y-3 border border-white/10"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      Prescription #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      M{p.measureStart}–M{p.measureEnd} @ {p.targetBpm} BPM
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                </div>

                <button
                  onClick={() =>
                    launchPrescriptionDrill(
                      latestSession?.songId || currentSong.id,
                      p.measureStart,
                      p.measureEnd,
                      p.targetBpm
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Isolated Loop Drill</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Practice Log Table */}
        {sessionHistory.length > 0 && (
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Recent Practice Sessions ({sessionHistory.length})</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono">
                    <th className="py-2 pr-4">Piece / Lesson</th>
                    <th className="py-2 pr-4">Tier</th>
                    <th className="py-2 pr-4">Overall</th>
                    <th className="py-2 pr-4">Pitch %</th>
                    <th className="py-2 pr-4">Timing %</th>
                    <th className="py-2 pr-4">Dynamics</th>
                    <th className="py-2">Mean Drift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessionHistory.slice(0, 8).map((s, idx) => (
                    <tr key={s.id || idx} className="text-slate-200">
                      <td className="py-2.5 pr-4 font-semibold">{s.songTitle}</td>
                      <td className="py-2.5 pr-4 capitalize text-slate-400">{s.tier}</td>
                      <td className="py-2.5 pr-4 font-mono font-bold text-emerald-400">
                        {s.overallScore}%
                      </td>
                      <td className="py-2.5 pr-4 font-mono">{s.pitchAccuracy}%</td>
                      <td className="py-2.5 pr-4 font-mono">{s.timingPrecision}%</td>
                      <td className="py-2.5 pr-4 font-mono">{s.dynamicControlScore}%</td>
                      <td className="py-2.5 font-mono text-cyan-300">
                        {s.meanDeltaMs >= 0 ? `+${s.meanDeltaMs}` : s.meanDeltaMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
