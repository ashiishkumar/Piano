/**
 * Tunable constants for the real-time evaluation engine.
 * All times are in seconds of score time unless the name says Ms.
 */

/** Notes whose onsets are within this window are treated as one chord cluster. */
export const CHORD_CLUSTER_SEC = 0.045;

/** Rhythm-mode timing classes (absolute drift in ms). */
export const RHYTHM_PERFECT_MS = 25;
export const RHYTHM_GOOD_MS = 60;

/** Wait-mode timing classes (reaction time since the engine started waiting, ms). */
export const WAIT_PERFECT_MS = 180;
export const WAIT_GOOD_MS = 450;

/** Candidate window around currentTime when a key is pressed. */
export const MATCH_WINDOW_WAIT_SEC = 0.35;
export const MATCH_WINDOW_RHYTHM_SEC = 0.24;

/** In wait mode, if nothing is due, look this far ahead for the next cluster. */
export const WAIT_LOOKAHEAD_SEC = 1.5;

/** Wait mode: a note is "due" when currentTime is within this of its onset. */
export const WAIT_DUE_AHEAD_SEC = 0.025;
export const WAIT_DUE_BEHIND_SEC = 0.35;

/** Wait mode: a key already held this recently counts for a newly due note. */
export const WAIT_HELD_RECENT_MS = 350;

/** Rhythm mode: an unmatched note is missed once the timeline is this far past it (scaled by tempo). */
export const RHYTHM_MISS_SEC = 0.16;

/** Synthetic drift recorded for a missed note. */
export const MISSED_DELTA_MS = 180;

/** Wrong key within this many semitones of the target is a fat-finger slip. */
export const FAT_FINGER_MAX_SEMITONES = 2;

/** Loop accuracy needed for the speed trainer to raise the tempo. */
export const AUTO_RAMP_MIN_ACCURACY = 95;
export const AUTO_RAMP_STEP = 0.05;
export const AUTO_RAMP_MAX_MULTIPLIER = 1.35;

/** Session score weights. */
export const WEIGHT_PITCH = 0.45;
export const WEIGHT_TIMING = 0.35;
export const WEIGHT_DYNAMICS = 0.2;

/** A session at or above this overall score marks the tier completed. */
export const TIER_COMPLETE_SCORE = 80;
