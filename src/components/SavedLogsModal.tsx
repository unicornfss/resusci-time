import { useEffect, useState, type MouseEvent } from 'react'
import {
  deleteSavedLog,
  formatSavedLogLabel,
  getAutosaveLog,
  isLogStorageAvailable,
  listSavedLogs,
  type SavedLogRecord,
} from '../logStorage'
import { SavedLogDetailModal } from './SavedLogDetailModal'

interface SavedLogsModalProps {
  onClose: () => void
}

function SavedLogListItem({
  record,
  onView,
  onDelete,
  autosave = false,
}: {
  record: SavedLogRecord
  onView: () => void
  onDelete?: () => void
  autosave?: boolean
}) {
  return (
    <li className={`saved-logs-item${autosave ? ' saved-logs-item-autosave' : ''}`}>
      <div className="saved-logs-item-body">
        <strong>
          {autosave ? 'Current case (autosaved)' : formatSavedLogLabel(record.savedAt)}
        </strong>
        <span className="saved-logs-item-meta">
          {record.entries.length} events · {record.documentTitle}
          {autosave ? ` · updated ${formatSavedLogLabel(record.savedAt)}` : ''}
        </span>
      </div>
      <div className="saved-logs-item-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onView}>
          View
        </button>
        {onDelete && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </li>
  )
}

export function SavedLogsModal({ onClose }: SavedLogsModalProps) {
  const [records, setRecords] = useState<SavedLogRecord[]>([])
  const [autosave, setAutosave] = useState<SavedLogRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SavedLogRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [items, autosaved] = await Promise.all([listSavedLogs(), getAutosaveLog()])
        if (!cancelled) {
          setRecords(items)
          setAutosave(autosaved && autosaved.entries.length > 0 ? autosaved : null)
        }
      } catch {
        if (!cancelled) setError('Could not load saved logs from this device.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  async function handleDelete(id: string) {
    await deleteSavedLog(id)
    setRecords((prev) => prev.filter((record) => record.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  if (selected) {
    return <SavedLogDetailModal record={selected} onClose={() => setSelected(null)} />
  }

  const hasAnyLogs = autosave != null || records.length > 0

  return (
    <div
      className="about-modal saved-logs-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-logs-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="saved-logs-title">Saved logs</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="about-body">
          {!isLogStorageAvailable() && (
            <p className="share-log-warning" role="status">
              This browser does not support on-device storage for saved logs.
            </p>
          )}

          <p className="share-log-intro">
            Logs are stored on this device only — nothing is uploaded. The current case is autosaved
            as you go. Use Save to keep a permanent copy you can delete separately.
          </p>

          {loading && <p className="saved-log-meta-line">Loading…</p>}
          {error && <p className="share-log-warning">{error}</p>}

          {!loading && !error && !hasAnyLogs && (
            <p className="saved-log-meta-line">No saved logs yet.</p>
          )}

          {!loading && hasAnyLogs && (
            <ul className="saved-logs-list">
              {autosave && (
                <SavedLogListItem record={autosave} autosave onView={() => setSelected(autosave)} />
              )}
              {records.map((record) => (
                <SavedLogListItem
                  key={record.id}
                  record={record}
                  onView={() => setSelected(record)}
                  onDelete={() => void handleDelete(record.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
