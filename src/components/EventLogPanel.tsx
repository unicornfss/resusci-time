import type { DisplayLogEntry } from '../types'

interface EventLogPanelProps {
  entries: readonly DisplayLogEntry[]
}

export function EventLogPanel({ entries }: EventLogPanelProps) {
  if (entries.length === 0) return null

  return (
    <div className="event-log-panel">
      <p className="check-log-label">Log</p>
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
