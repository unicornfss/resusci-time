import type { PreviewSpeedMultiplier } from './previewSpeed'

function readBuildTimeScale(): number {
  const raw = import.meta.env.VITE_TIME_SCALE
  const parsed = raw ? Number(raw) : 1
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export const BUILD_TIME_SCALE = readBuildTimeScale()
export const IS_PREVIEW_BUILD = import.meta.env.VITE_BUILD_CHANNEL === 'preview'

export const VOD_COUNTDOWN_DISPLAY_SECONDS = 300
export const ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS = 600
export const TEST_JUMP_TO_DISPLAY_SECONDS = 44 * 60

export interface TimingConfig {
  timeScale: number
  speedMultiplier: number
  rhythmCheckInterval: number
  adrenalineIntervalSeconds: number
  sbpReminderIntervalSeconds: number
  roscMonitoringReminderIntervalSeconds: number
  fortyFiveMinutesSeconds: number
  vodCountdownActualSeconds: number
  roscSustainedThresholdActualSeconds: number
  testJumpToActualSeconds: number
  isTestTiming: boolean
}

export function buildTimingConfig(previewSpeedMultiplier?: PreviewSpeedMultiplier): TimingConfig {
  const timeScale =
    IS_PREVIEW_BUILD && previewSpeedMultiplier != null
      ? 1 / previewSpeedMultiplier
      : BUILD_TIME_SCALE

  const rhythmCheckInterval = Math.round(120 * timeScale)
  const adrenalineIntervalSeconds = Math.round(240 * timeScale)
  const sbpReminderIntervalSeconds = Math.round(240 * timeScale)

  return {
    timeScale,
    speedMultiplier: timeScale >= 1 ? 1 : Math.round(1 / timeScale),
    rhythmCheckInterval,
    adrenalineIntervalSeconds,
    sbpReminderIntervalSeconds,
    roscMonitoringReminderIntervalSeconds: sbpReminderIntervalSeconds,
    fortyFiveMinutesSeconds: Math.round(2700 * timeScale),
    vodCountdownActualSeconds: Math.round(VOD_COUNTDOWN_DISPLAY_SECONDS * timeScale),
    roscSustainedThresholdActualSeconds: Math.round(ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS * timeScale),
    testJumpToActualSeconds: Math.round(TEST_JUMP_TO_DISPLAY_SECONDS * timeScale),
    isTestTiming: timeScale !== 1,
  }
}

/** Default config at module load (build-time scale; preview uses stored speed via context). */
export const defaultTimingConfig = buildTimingConfig()

export const IS_TEST_TIMING = defaultTimingConfig.isTestTiming

export function getTestModeBannerText(timing: TimingConfig = defaultTimingConfig): string {
  if (IS_PREVIEW_BUILD) {
    return ''
  }

  if (timing.isTestTiming) {
    const percent = Math.round(timing.timeScale * 1000) / 10
    return `Test mode — protocol times at ${percent}% (elapsed shows real protocol time)`
  }

  return ''
}

export function getRhythmCheckRemainingFraction(
  secondsRemaining: number,
  rhythmCheckInterval: number,
): number {
  if (rhythmCheckInterval <= 0) return 0
  return Math.min(1, Math.max(0, secondsRemaining / rhythmCheckInterval))
}

export function getVodCountdownRemainingFraction(
  secondsRemaining: number,
  vodCountdownActualSeconds: number,
): number {
  if (vodCountdownActualSeconds <= 0) return 0
  return Math.min(1, Math.max(0, secondsRemaining / vodCountdownActualSeconds))
}

/** Map wall-clock seconds to protocol elapsed time shown in the UI. */
export function toDisplaySeconds(actualSeconds: number, timeScale = defaultTimingConfig.timeScale): number {
  if (timeScale === 1) return actualSeconds
  return Math.floor(actualSeconds / timeScale)
}
