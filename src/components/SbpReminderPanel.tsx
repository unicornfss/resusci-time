import {
  SBP_ADEQUATE_LABEL,
  SBP_ADRENALINE_50_LABEL,
  SBP_ADRENALINE_100_LABEL,
  SBP_FLUID_250_LABEL,
  SBP_FLUID_500_LABEL,
  SBP_LOW_LABEL,
  SBP_NOTHING_ADMINISTERED_LABEL,
  SBP_REMINDER_PROMPT,
} from '../sbpReminder'

interface SbpReminderPanelProps {
  expanded: boolean
  showAdrenaline50: boolean
  showAdrenaline100: boolean
  onAdequate: () => void
  onLow: () => void
  onFluid250: () => void
  onFluid500: () => void
  onAdrenaline50: () => void
  onAdrenaline100: () => void
  onNothingAdministered: () => void
  onBack: () => void
}

export function SbpReminderPanel({
  expanded,
  showAdrenaline50,
  showAdrenaline100,
  onAdequate,
  onLow,
  onFluid250,
  onFluid500,
  onAdrenaline50,
  onAdrenaline100,
  onNothingAdministered,
  onBack,
}: SbpReminderPanelProps) {
  return (
    <div className="sbp-reminder-panel" role="status">
      <p>{SBP_REMINDER_PROMPT}</p>
      {!expanded ? (
        <div className="sbp-reminder-actions">
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onAdequate}>
            {SBP_ADEQUATE_LABEL}
          </button>
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onLow}>
            {SBP_LOW_LABEL}
          </button>
        </div>
      ) : (
        <div className="sbp-reminder-actions">
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onFluid250}>
            {SBP_FLUID_250_LABEL}
          </button>
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onFluid500}>
            {SBP_FLUID_500_LABEL}
          </button>
          {showAdrenaline50 && (
            <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onAdrenaline50}>
              {SBP_ADRENALINE_50_LABEL}
            </button>
          )}
          {showAdrenaline100 && (
            <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={onAdrenaline100}>
              {SBP_ADRENALINE_100_LABEL}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-lg btn-touch"
            onClick={onNothingAdministered}
          >
            {SBP_NOTHING_ADMINISTERED_LABEL}
          </button>
          <button type="button" className="btn btn-secondary sbp-reminder-back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      )}
    </div>
  )
}
