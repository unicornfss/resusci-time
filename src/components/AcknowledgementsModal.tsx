import type { MouseEvent } from 'react'
import { getAcknowledgementsSections } from '../acknowledgementsContent'
import { serviceConfig } from '../config'

interface AcknowledgementsModalProps {
  onClose: () => void
  onOpenAbout?: () => void
}

export function AcknowledgementsModal({ onClose, onOpenAbout }: AcknowledgementsModalProps) {
  const sections = getAcknowledgementsSections(serviceConfig.trustId)

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleOpenAbout() {
    onClose()
    onOpenAbout?.()
  }

  return (
    <div
      className="about-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="acknowledgements-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="acknowledgements-title">Acknowledgements</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p className="about-intro">
            Thanks to the organisations and colleagues whose published guidance and feedback helped
            shape this app.
          </p>

          {sections.map((section) => (
            <section key={section.heading} className="about-section">
              <h3>{section.heading}</h3>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && section.items.length > 0 && (
                <ul className="about-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {onOpenAbout && (
            <p className="about-note">
              <button type="button" className="about-inline-link" onClick={handleOpenAbout}>
                About &amp; contact
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
