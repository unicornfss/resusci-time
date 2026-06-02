import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react'
import { hasVodDeclared } from '../caseLog'
import {
  deleteSavedLog,
  deleteSavedLogs,
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

function formatLogListTitle(record: SavedLogRecord): string {
  return formatSavedLogLabel(record.caseStartedAt ?? record.savedAt)
}

function SavedLogListItem({
  record,
  onView,
  onDelete,
  inProgress = false,
  selected = false,
  selectable = false,
  onToggleSelect,
}: {
  record: SavedLogRecord
  onView: () => void
  onDelete?: () => void
  inProgress?: boolean
  selected?: boolean
  selectable?: boolean
  onToggleSelect?: () => void
}) {
  const closed = hasVodDeclared(record.entries)

  return (
    <li
      className={`saved-logs-item${inProgress ? ' saved-logs-item-autosave' : ''}${selected ? ' saved-logs-item-selected' : ''}`}
    >
      {selectable && onToggleSelect && (
        <label className="saved-logs-item-select">
          <input type="checkbox" checked={selected} onChange={onToggleSelect} />
          <span className="visually-hidden">Select log from {formatLogListTitle(record)}</span>
        </label>
      )}
      <div className="saved-logs-item-body">
        <strong>
          {formatLogListTitle(record)}
          {inProgress ? ' (in progress)' : closed ? ' (closed)' : ''}
        </strong>
        <span className="saved-logs-item-meta">
          {record.entries.length} events · {record.documentTitle}
          {inProgress ? ` · updated ${formatSavedLogLabel(record.savedAt)}` : ''}
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [items, autosaved] = await Promise.all([listSavedLogs(), getAutosaveLog()])
        if (!cancelled) {
          setRecords(items)
          setAutosave(autosaved && autosaved.entries.length > 0 ? autosaved : null)
          setSelectedIds(new Set())
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

  const inProgressLogId = autosave?.permanentLogId ?? null

  const orphanAutosave = useMemo(() => {
    if (!autosave) return null
    if (!inProgressLogId) return autosave
    return records.some((record) => record.id === inProgressLogId) ? null : autosave
  }, [autosave, inProgressLogId, records])

  const selectableRecords = useMemo(
    () => records.filter((record) => record.id !== inProgressLogId),
    [records, inProgressLogId],
  )

  const allSelectableSelected =
    selectableRecords.length > 0 && selectableRecords.every((record) => selectedIds.has(record.id))

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAllChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      setSelectedIds(new Set(selectableRecords.map((record) => record.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  async function handleDelete(id: string) {
    await deleteSavedLog(id)
    setRecords((prev) => prev.filter((record) => record.id !== id))
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (selected?.id === id) setSelected(null)
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    await deleteSavedLogs(ids)
    setRecords((prev) => prev.filter((record) => !selectedIds.has(record.id)))
    if (selected && selectedIds.has(selected.id)) setSelected(null)
    setSelectedIds(new Set())
  }

  if (selected) {
    return <SavedLogDetailModal record={selected} onClose={() => setSelected(null)} />
  }

  const hasAnyLogs = orphanAutosave != null || records.length > 0

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
            Logs are stored on this device only — nothing is uploaded. Each case is saved
            automatically as you work. Use the checkboxes to delete multiple logs at once.
          </p>

          {loading && <p className="saved-log-meta-line">Loading…</p>}
          {error && <p className="share-log-warning">{error}</p>}

          {!loading && !error && !hasAnyLogs && (
            <p className="saved-log-meta-line">No saved logs yet.</p>
          )}

          {!loading && hasAnyLogs && (
            <>
              {selectableRecords.length > 0 && (
                <div className="saved-logs-bulk-actions">
                  <label className="saved-logs-select-all">
                    <input
                      type="checkbox"
                      checked={allSelectableSelected}
                      onChange={handleSelectAllChange}
                    />
                    Select all
                  </label>
                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => void handleDeleteSelected()}
                    >
                      Delete selected ({selectedIds.size})
                    </button>
                  )}
                </div>
              )}

              <ul className="saved-logs-list">
                {orphanAutosave && (
                  <SavedLogListItem
                    record={orphanAutosave}
                    inProgress
                    onView={() => setSelected(orphanAutosave)}
                  />
                )}
                {records.map((record) => {
                  const inProgress = record.id === inProgressLogId
                  return (
                    <SavedLogListItem
                      key={record.id}
                      record={record}
                      inProgress={inProgress}
                      selectable={!inProgress}
                      selected={selectedIds.has(record.id)}
                      onToggleSelect={() => toggleSelected(record.id)}
                      onView={() => setSelected(record)}
                      onDelete={inProgress ? undefined : () => void handleDelete(record.id)}
                    />
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
