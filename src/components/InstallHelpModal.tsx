import type { MouseEvent } from 'react'
import { INSTALL_HELP, type InstallHelpVariant } from '../installContent'

interface InstallHelpModalProps {
  variant: InstallHelpVariant
  onClose: () => void
}

export function InstallHelpModal({ variant, onClose }: InstallHelpModalProps) {
  const help = INSTALL_HELP[variant]

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="about-modal install-help-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-help-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="install-help-title">Install Resusci-Time</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p>{help.intro}</p>
          <ol className="install-help-steps">
            {help.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="about-note">{help.note}</p>
        </div>
      </div>
    </div>
  )
}
