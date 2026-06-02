import type { MouseEvent } from 'react'

interface TransferCaseImminentWarningModalProps {
  warnings: readonly string[]
  onStayOnCase: () => void
  onTransferAnyway: () => void
}

export function TransferCaseImminentWarningModal({
  warnings,
  onStayOnCase,
  onTransferAnyway,
}: TransferCaseImminentWarningModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onStayOnCase()
  }

  return (
    <div
      className="about-modal transfer-case-imminent-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-case-imminent-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="transfer-case-imminent-title">Checks or drugs due soon</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onStayOnCase}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p className="share-log-intro">
            It would be best to wait until after these checks and administrations before
            transferring the case.
          </p>

          <ul className="transfer-case-imminent-list" role="list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>

          <div className="case-continuation-actions transfer-case-imminent-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onStayOnCase}>
              Stay on this case — finish checks first
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onTransferAnyway}>
              Transfer anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
