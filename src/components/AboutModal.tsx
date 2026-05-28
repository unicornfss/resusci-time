import type { MouseEvent } from 'react'
import { getAppVersionSummary } from '../appVersion'
import { ABOUT_SECTIONS, SUPPORT_EMAIL } from '../aboutContent'
import { serviceConfig } from '../config'
import { getBlogUrl } from '../blogUrl'

interface AboutModalProps {
  onClose: () => void
}

export function AboutModal({ onClose }: AboutModalProps) {
  const blogUrl = getBlogUrl(serviceConfig.trustId)

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
            <p>
              <a className="about-email-link" href={blogUrl}>
                Open the blog
              </a>
              {' '}
              for release notes and how-to guides for this build.
            </p>
          </section>

          <p className="about-contact">
            <a className="about-email-link" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </p>

          <p className="about-note">
            Custom builds can include service branding, protocol variations, offline installation for
            tablets and phones, and other features agreed with your organisation.
          </p>
        </div>
      </div>
    </div>
  )
}
