import type { DisplayLogEntry } from '../types'
import type { SavedLogMeta } from '../logStorage'
import { LogExportBar } from './LogExportBar'

interface EventLogPanelProps {
  entries: readonly DisplayLogEntry[]
  documentTitle: string
  showExportActions?: boolean
  saveMeta?: SavedLogMeta
}

export function EventLogPanel({
  entries,
  documentTitle,
  showExportActions = true,
  saveMeta,
}: EventLogPanelProps) {
  if (entries.length === 0) return null

  return (
    <div className="event-log-panel">
      <div className="event-log-header">
        <p className="check-log-label">Log</p>
        {showExportActions && (
          <LogExportBar entries={entries} documentTitle={documentTitle} saveMeta={saveMeta} />
        )}
      </div>
      <ul className="check-log">
        {entries.map((entry, i) => (
          <li key={`${entry.atEpochMs}-${entry.text}-${i}`}>
            <span className="check-time">{entry.label}</span>
            <span>{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
