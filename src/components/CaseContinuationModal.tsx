import type { MouseEvent } from 'react'
import { formatSavedLogLabel } from '../logStorage'

interface CaseContinuationModalProps {
  savedAt: number
  eventCount: number
  onContinue: () => void
  onNewCase: () => void
}

export function CaseContinuationModal({
  savedAt,
  eventCount,
  onContinue,
  onNewCase,
}: CaseContinuationModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onNewCase()
  }

  return (
    <div
      className="about-modal case-continuation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-continuation-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="case-continuation-title">Recent case found</h2>
        </div>
        <div className="about-body">
          <p>
            An autosaved case from {formatSavedLogLabel(savedAt)} ({eventCount} events) was active
            less than 10 minutes ago. Is this a new case or a continuation of that case?
          </p>
          <div className="case-continuation-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onContinue}>
              Continue previous case
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onNewCase}>
              New case
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
