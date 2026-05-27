interface ClinicalDiscussionTimerSectionProps {
  open: boolean
  onOpen: () => void
  onContinueResuscitation: () => void
  onTerminateResuscitation: () => void
}

export function ClinicalDiscussionTimerSection({
  open,
  onOpen,
  onContinueResuscitation,
  onTerminateResuscitation,
}: ClinicalDiscussionTimerSectionProps) {
  return (
    <div className="timer-clinical-discussion">
      {!open ? (
        <button type="button" className="timer-action-box timer-clinical-discussion-btn on" onClick={onOpen}>
          Clinical discussion decision
        </button>
      ) : (
        <div className="timer-clinical-discussion-options" role="group" aria-label="Clinical discussion decision">
          <button
            type="button"
            className="btn btn-sm timer-clinical-discussion-option-btn"
            onClick={onContinueResuscitation}
          >
            Continue resuscitation
          </button>
          <button
            type="button"
            className="btn btn-sm timer-clinical-discussion-option-btn timer-clinical-discussion-terminate-btn"
            onClick={onTerminateResuscitation}
          >
            Terminate resuscitation
          </button>
        </div>
      )}
    </div>
  )
}
