import { useState, type MouseEvent } from 'react'
import { getAppVersionSummary } from '../appVersion'
import { getAboutSections, SUPPORT_EMAIL } from '../aboutContent'
import { serviceConfig } from '../config'
import { PreviewChangelogModal } from './PreviewChangelogModal'

interface AboutModalProps {
  onClose: () => void
  onOpenAcknowledgements?: () => void
}

export function AboutModal({ onClose, onOpenAcknowledgements }: AboutModalProps) {
  const { isPreview, features } = serviceConfig
  const aboutSections = getAboutSections(features)
  const [previewChangelogOpen, setPreviewChangelogOpen] = useState(false)

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="about-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="about-title">About Resusci-Time</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p className="about-version">{getAppVersionSummary()}</p>

          {aboutSections.map((section) => (
            <section key={section.heading} className="about-section">
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          <section className="about-section">
            <h3>Updates</h3>
            {isPreview ? (
              <p>
                <button
                  type="button"
                  className="about-inline-link"
                  onClick={() => setPreviewChangelogOpen(true)}
                >
                  What&apos;s new in this preview
                </button>
                {' '}
                — changes on this preview build that are not yet on a governance-approved release.
              </p>
            ) : (
              <p>Release notes will be shared through Trust channels when a governance-approved build is published.</p>
            )}
          </section>

          <p className="about-contact">
            <a className="about-email-link" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </p>

          {onOpenAcknowledgements && (
            <p className="about-note">
              <button
                type="button"
                className="about-inline-link"
                onClick={() => {
                  onClose()
                  onOpenAcknowledgements()
                }}
              >
                Acknowledgements
              </button>
            </p>
          )}

        </div>
      </div>

      {previewChangelogOpen && (
        <PreviewChangelogModal onClose={() => setPreviewChangelogOpen(false)} />
      )}
    </div>
  )
}
