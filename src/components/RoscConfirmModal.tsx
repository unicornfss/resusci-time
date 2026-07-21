import type { MouseEvent } from 'react'

interface RoscConfirmModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export function RoscConfirmModal({ onCancel, onConfirm }: RoscConfirmModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel()
  }

  return (
    <div
      className="about-modal rosc-confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rosc-confirm-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="rosc-confirm-title">Confirm ROSC</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p>
            Confirm the patient has <strong>return of spontaneous circulation (ROSC)</strong>.
          </p>
          <p>
            This will switch to post-ROSC care and reset the next rhythm check timer to 2 minutes.
          </p>

          <div className="case-continuation-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onConfirm}>
              Confirm ROSC
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
