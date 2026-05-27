/** Set to 1 for production protocol times. 0.1 = 10% for testing. */
export const TIME_SCALE: number = 0.1

export const RHYTHM_CHECK_INTERVAL = Math.round(120 * TIME_SCALE)
export const ADRENALINE_INTERVAL_SECONDS = Math.round(240 * TIME_SCALE)
export const SBP_REMINDER_INTERVAL_SECONDS = Math.round(240 * TIME_SCALE)
/** SBP and pulse-rate ROSC reminders share this interval. */
export const ROSC_MONITORING_REMINDER_INTERVAL_SECONDS = SBP_REMINDER_INTERVAL_SECONDS
export const FORTY_FIVE_MINUTES_SECONDS = Math.round(2700 * TIME_SCALE)
/** Display-time VOD wait (5:00). Actual wall-clock duration respects TIME_SCALE. */
export const VOD_COUNTDOWN_DISPLAY_SECONDS = 300
export const VOD_COUNTDOWN_ACTUAL_SECONDS = Math.round(VOD_COUNTDOWN_DISPLAY_SECONDS * TIME_SCALE)
/** Display-time threshold (10:00) for sustained vs transient ROSC. */
export const ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS = 600
export const ROSC_SUSTAINED_THRESHOLD_ACTUAL_SECONDS = Math.round(
  ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS * TIME_SCALE,
)

export const IS_TEST_TIMING = TIME_SCALE !== 1

/** Test helper: jump arrest timer to 44:00 display time (1 min before 45:00 TOR). */
export const TEST_JUMP_TO_DISPLAY_SECONDS = 44 * 60
export const TEST_JUMP_TO_ACTUAL_SECONDS = Math.round(TEST_JUMP_TO_DISPLAY_SECONDS * TIME_SCALE)

export function getRhythmCheckRemainingFraction(secondsRemaining: number): number {
  if (RHYTHM_CHECK_INTERVAL <= 0) return 0
  return Math.min(1, Math.max(0, secondsRemaining / RHYTHM_CHECK_INTERVAL))
}

export function getVodCountdownRemainingFraction(secondsRemaining: number): number {
  if (VOD_COUNTDOWN_ACTUAL_SECONDS <= 0) return 0
  return Math.min(1, Math.max(0, secondsRemaining / VOD_COUNTDOWN_ACTUAL_SECONDS))
}

/** Map wall-clock seconds to protocol elapsed time shown in the UI. */
export function toDisplaySeconds(actualSeconds: number): number {
  if (TIME_SCALE === 1) return actualSeconds
  return Math.floor(actualSeconds / TIME_SCALE)
}
