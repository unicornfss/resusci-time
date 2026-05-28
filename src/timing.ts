function readTimeScale(): number {
  const raw = import.meta.env.VITE_TIME_SCALE
  const parsed = raw ? Number(raw) : 1
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

/** Set via VITE_TIME_SCALE at build time. Live builds use 1; preview builds use a lower value. */
export const TIME_SCALE: number = readTimeScale()

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
export const IS_PREVIEW_BUILD = import.meta.env.VITE_BUILD_CHANNEL === 'preview'

/** Human-readable scale for the test-mode banner, e.g. 0.25 → "25%". */
export function getTimeScalePercentLabel(): string {
  const percent = TIME_SCALE * 100
  const rounded = Math.round(percent * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded}%`
}

export function getTestModeBannerText(): string {
  if (IS_PREVIEW_BUILD) {
    return `Preview build — for testing only. Not for live clinical use. Protocol times at ${getTimeScalePercentLabel()} (elapsed shows real protocol time).`
  }

  return `Test mode — protocol times at ${getTimeScalePercentLabel()} (elapsed shows real protocol time)`
}

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
