import type { MouseEvent } from 'react'
import { hasVodDeclared } from '../caseLog'
import type { SavedLogRecord } from '../logStorage'
import { EventLogPanel } from './EventLogPanel'

interface SavedLogDetailModalProps {
  record: SavedLogRecord
  onClose: () => void
}

export function SavedLogDetailModal({ record, onClose }: SavedLogDetailModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="about-modal saved-log-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-log-detail-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="saved-log-detail-title">
            {record.isAutosave ? 'Autosaved log' : 'Saved log'}
          </h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Back
          </button>
        </div>

        <div className="about-body">
          <p className="shared-log-meta">
            {record.documentTitle} · saved{' '}
            {new Date(record.savedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          {record.meta.initialRhythm && (
            <p className="saved-log-meta-line">Initial rhythm: {record.meta.initialRhythm}</p>
          )}
          {record.meta.elapsed && (
            <p className="saved-log-meta-line">Elapsed: {record.meta.elapsed}</p>
          )}
          {record.meta.torAt && (
            <p className="saved-log-meta-line">TOR: {record.meta.torAt}</p>
          )}
          {record.meta.vodAt && (
            <p className="saved-log-meta-line">VOD: {record.meta.vodAt}</p>
          )}
          {hasVodDeclared(record.entries) && (
            <p className="share-log-warning" role="status">
              This log is closed — verification of death was recorded and no further entries can be
              added.
            </p>
          )}
          <EventLogPanel entries={record.entries} documentTitle={record.documentTitle} />
        </div>
      </div>
    </div>
  )
}
