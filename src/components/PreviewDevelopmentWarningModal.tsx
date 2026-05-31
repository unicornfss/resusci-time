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
            This is the <strong>development (preview) version</strong> of Resusci-Time. It must{' '}
            <strong>not</strong> be used in the field under any circumstances.
          </p>
          <p>
            This build may contain unapproved changes, experimental features, and errors. Use it
            only for internal testing and training in a controlled environment.
          </p>
          <p>
            The live, approved version should be used for any real patient contact.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-lg preview-warning-ack-btn" onClick={onAcknowledge}>
          I understand — continue to preview
        </button>
      </div>
    </div>
  )
}
