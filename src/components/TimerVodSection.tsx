import { VOD_READY_MESSAGE } from '../protocol'
import { VodTimestampsSummary } from './VodTimestampsSummary'
import { getVodCountdownRemainingFraction, VOD_COUNTDOWN_ACTUAL_SECONDS } from '../timing'
import type { DisplayLogEntry } from '../types'

interface TimerVodSectionProps {
  torEndedAtLabel: string
  vodCountdownRemaining: number
  vodReady: boolean
  onVod: () => void
  formatRemaining: (actualSeconds: number) => string
}

export function TimerVodSection({
  torEndedAtLabel,
  vodCountdownRemaining,
  vodReady,
  onVod,
  formatRemaining,
}: TimerVodSectionProps) {
  return (
    <div className="timer-vod-section">
      <div className="timer-tor-stamp" role="status">
        <span className="timer-label">TOR occurred</span>
        <span className="timer-tor-time">{torEndedAtLabel}</span>
      </div>
      <div className="timer-vod-countdown">
        <div className="timer-vod-countdown-header">
          <span className="timer-next-check-label">
            {vodReady
              ? 'Verification of death wait complete'
              : `Verification of death in: ${formatRemaining(vodCountdownRemaining)}`}
          </span>
          <button
            type="button"
            className={`timer-action-box timer-vod-btn${vodReady ? ' on' : ''}`}
            disabled={!vodReady}
            aria-label="Record verification of death"
            onClick={onVod}
          >
            VOD
          </button>
        </div>
        <div
          className="rhythm-check-progress-track"
          role="progressbar"
          aria-label="Time until verification of death"
          aria-valuemin={0}
          aria-valuemax={VOD_COUNTDOWN_ACTUAL_SECONDS}
          aria-valuenow={vodCountdownRemaining}
        >
          <div
            className="rhythm-check-progress-fill"
            style={{
              width: `${getVodCountdownRemainingFraction(vodCountdownRemaining) * 100}%`,
            }}
          />
        </div>
        {vodReady && <p className="timer-vod-ready-message">{VOD_READY_MESSAGE}</p>}
      </div>
    </div>
  )
}

export function TimerVodCompleteStamp({
  vodAtLabel,
  logEntries = [],
}: {
  vodAtLabel: string
  logEntries?: readonly DisplayLogEntry[]
}) {
  return (
    <div className="timer-vod-section">
      <VodTimestampsSummary entries={logEntries} vodAtLabel={vodAtLabel} compact />
    </div>
  )
}
