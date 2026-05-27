import {
  ATROPINE_CONSIDER_PROMPT,
  ATROPINE_MAX_DOSE_MESSAGE,
  PULSE_RATE_PROMPT,
} from '../roscMonitoring'

interface PulseRateReminderPanelProps {
  expanded: boolean
  showAtropineMaxMessage: boolean
  onYes: () => void
  onNo: () => void
  onAtropineAdministered: () => void
  onAtropineNotAdministered: () => void
  onAtropineMaxAcknowledge: () => void
  onBack: () => void
}

export function PulseRateReminderPanel({
  expanded,
  showAtropineMaxMessage,
  onYes,
  onNo,
  onAtropineAdministered,
  onAtropineNotAdministered,
  onAtropineMaxAcknowledge,
  onBack,
}: PulseRateReminderPanelProps) {
  return (
    <div className="pulse-rate-reminder-panel" role="status">
      <p>{PULSE_RATE_PROMPT}</p>
      {!expanded ? (
        <div className="sbp-reminder-actions">
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onYes}>
            Yes
          </button>
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onNo}>
            No
          </button>
        </div>
      ) : showAtropineMaxMessage ? (
        <div className="sbp-reminder-actions">
          <p className="pulse-rate-atropine-max">{ATROPINE_MAX_DOSE_MESSAGE}</p>
          <button
            type="button"
            className="btn btn-primary btn-lg btn-touch"
            onClick={onAtropineMaxAcknowledge}
          >
            Acknowledge
          </button>
          <button type="button" className="btn btn-secondary sbp-reminder-back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      ) : (
        <div className="sbp-reminder-actions">
          <p className="pulse-rate-atropine-prompt">{ATROPINE_CONSIDER_PROMPT}</p>
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onAtropineAdministered}>
            Administered
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg btn-touch"
            onClick={onAtropineNotAdministered}
          >
            Not administered
          </button>
          <button type="button" className="btn btn-secondary sbp-reminder-back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      )}
    </div>
  )
}
