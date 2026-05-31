export type ClinicalDiscussionStatus = 'collapsed' | 'open'

interface ClinicalDiscussionTimerSectionProps {
  status: ClinicalDiscussionStatus
  onOpen: () => void
  onContinueResuscitation: () => void
  onTerminateResuscitation: () => void
}

export function ClinicalDiscussionTimerSection({
  status,
  onOpen,
  onContinueResuscitation,
  onTerminateResuscitation,
}: ClinicalDiscussionTimerSectionProps) {
  return (
    <div className="timer-clinical-discussion-panel" role="status">
      {status === 'collapsed' ? (
        <>
          <p className="timer-clinical-discussion-heading">Senior clinical discussion required</p>
          <button
            type="button"
            className="timer-clinical-discussion-btn"
            onClick={onOpen}
          >
            Record clinical discussion decision
          </button>
        </>
      ) : (
        <div className="timer-clinical-discussion-options" role="group" aria-label="Clinical discussion decision">
          <p className="timer-clinical-discussion-heading">Record clinical discussion decision</p>
          <button
            type="button"
            className="btn btn-lg timer-clinical-discussion-option-btn"
            onClick={onContinueResuscitation}
          >
            Continue resuscitation
          </button>
          <button
            type="button"
            className="btn btn-lg timer-clinical-discussion-option-btn timer-clinical-discussion-terminate-btn"
            onClick={onTerminateResuscitation}
          >
            Terminate resuscitation
          </button>
        </div>
      )}
    </div>
  )
}
