import { useState, type MouseEvent } from 'react'
import { getAppVersionSummary } from '../appVersion'
import { ABOUT_SECTIONS, SUPPORT_EMAIL } from '../aboutContent'
import { serviceConfig } from '../config'
import { getBlogUrl } from '../blogUrl'
import { PreviewChangelogModal } from './PreviewChangelogModal'

interface AboutModalProps {
  onClose: () => void
  onOpenAcknowledgements?: () => void
}

export function AboutModal({ onClose, onOpenAcknowledgements }: AboutModalProps) {
  const { trustId, isPreview } = serviceConfig
  const blogUrl = getBlogUrl(trustId)
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

          {ABOUT_SECTIONS.map((section) => (
            <section key={section.heading} className="about-section">
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          <section className="about-section">
            <h3>Updates &amp; guides</h3>
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
                — unreleased changes on the preview build (not on live field URLs yet).
              </p>
            ) : null}
            <p>
              <a className="about-email-link" href={blogUrl}>
                Open the blog
              </a>
              {' '}
              for published release notes and how-to guides.
            </p>
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
