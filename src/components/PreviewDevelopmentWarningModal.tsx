interface PreviewDevelopmentWarningModalProps {
  onAcknowledge: () => void
}

export function PreviewDevelopmentWarningModal({ onAcknowledge }: PreviewDevelopmentWarningModalProps) {
  return (
    <div
      className="preview-warning-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="preview-warning-title"
      aria-describedby="preview-warning-body"
    >
      <div className="preview-warning-panel card">
        <div className="preview-warning-badge">Development preview</div>
        <h2 id="preview-warning-title">Not for clinical use</h2>
        <div id="preview-warning-body" className="preview-warning-body">
          <p>
            This is the <strong>preview</strong> of Resusci-Time. It is for{' '}
            <strong>simulation and internal testing only</strong> and must{' '}
            <strong>not</strong> be used for real patient contact.
          </p>
          <p>
            This build may contain <strong>unapproved</strong> changes, experimental features, and
            errors. The live / approved address is reserved for a future{' '}
            <strong>governance-approved</strong> release — that build is not available yet.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-lg preview-warning-ack-btn" onClick={onAcknowledge}>
          I understand — continue to preview
        </button>
      </div>
    </div>
  )
}
