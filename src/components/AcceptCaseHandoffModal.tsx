import type { MouseEvent } from 'react'
import { getServiceConfig } from '../config/getServiceConfig'
import { CASE_HANDOFF_PRIVACY_NOTE, type CaseHandoffPayload } from '../caseHandoff'

interface AcceptCaseHandoffModalProps {
  payload: CaseHandoffPayload
  replaceActiveCase: boolean
  onAccept: () => void
  onDecline: () => void
}

export function AcceptCaseHandoffModal({
  payload,
  replaceActiveCase,
  onAccept,
  onDecline,
}: AcceptCaseHandoffModalProps) {
  const trustLabel = getServiceConfig(payload.trust).trustLabel
  const handoffLabel = new Date(payload.handoffAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onDecline()
  }

  return (
    <div
      className="about-modal accept-handoff-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accept-handoff-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="accept-handoff-title">Receive transferred case</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onDecline}>
            Cancel
          </button>
        </div>

        <div className="about-body">
          <p className="share-log-intro">
            A case was transferred from another device ({trustLabel}, {payload.entries.length} events,
            handoff {handoffLabel}).
          </p>

          {replaceActiveCase && (
            <p className="share-log-warning" role="status">
              You already have a case in progress. Accepting will replace it with the transferred
              case.
            </p>
          )}

          <p className="about-note">{CASE_HANDOFF_PRIVACY_NOTE}</p>

          <div className="case-continuation-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onAccept}>
              Take over case
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onDecline}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
