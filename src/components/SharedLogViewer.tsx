import type { MouseEvent } from 'react'
import { getServiceConfig } from '../config/getServiceConfig'
import { clearShareHash, type SharedLogPayload } from '../logShare'
import { EventLogPanel } from './EventLogPanel'

interface SharedLogViewerProps {
  payload: SharedLogPayload
  onClose: () => void
}

export function SharedLogViewer({ payload, onClose }: SharedLogViewerProps) {
  const trustConfig = getServiceConfig(payload.trust)
  const exportedLabel = new Date(payload.exportedAt).toLocaleString()

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeViewer()
  }

  function closeViewer() {
    clearShareHash()
    onClose()
  }

  return (
    <div
      className="about-modal shared-log-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shared-log-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="shared-log-title">Shared log</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={closeViewer}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p className="shared-log-meta">
            {trustConfig.headerTitle} · shared {exportedLabel}
          </p>
          <EventLogPanel
            entries={payload.entries}
            documentTitle={trustConfig.headerTitle}
            showExportActions
          />
        </div>
      </div>
    </div>
  )
}
