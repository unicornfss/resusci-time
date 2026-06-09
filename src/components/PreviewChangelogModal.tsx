import { useEffect, useState, type MouseEvent } from 'react'
import { marked } from 'marked'
import { APP_VERSION } from '../appVersion'
import { publicAssetUrl } from '../publicAssetUrl'

interface PreviewChangelogModalProps {
  onClose: () => void
}

marked.setOptions({ gfm: true, breaks: false })

export function PreviewChangelogModal({ onClose }: PreviewChangelogModalProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const changelogUrl = `${publicAssetUrl('preview-changelog.md')}?v=${encodeURIComponent(APP_VERSION)}`
    fetch(changelogUrl)
      .then((response) => {
        if (!response.ok) throw new Error('not found')
        return response.text()
      })
      .then((markdown) => {
        if (!cancelled) setHtml(String(marked.parse(markdown)))
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="preview-changelog-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-changelog-title"
      onClick={handleBackdropClick}
    >
      <div className="preview-changelog-panel card">
        <div className="documents-header">
          <h2 id="preview-changelog-title">What&apos;s new in this preview</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {html != null && (
          <div
            className="preview-changelog-body prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {loadFailed && (
          <p className="preview-changelog-error">
            Preview changelog is not available. Run{' '}
            <code>node scripts/sync-preview-changelog.mjs</code> or deploy a preview build.
          </p>
        )}

        {html == null && !loadFailed && <p className="hint">Loading…</p>}
      </div>
    </div>
  )
}
