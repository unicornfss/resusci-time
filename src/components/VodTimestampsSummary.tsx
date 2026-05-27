import {
  filterVodCriteriaLogEntries,
  getVodCriteriaDisplayName,
  sortDisplayLogEntries,
} from '../protocol'
import type { DisplayLogEntry } from '../types'

interface VodTimestampsSummaryProps {
  entries: readonly DisplayLogEntry[]
  vodAtLabel: string
  compact?: boolean
}

export function VodTimestampsSummary({ entries, vodAtLabel, compact = false }: VodTimestampsSummaryProps) {
  const criteriaEntries = filterVodCriteriaLogEntries(sortDisplayLogEntries(entries))

  return (
    <div className={`vod-timestamps-summary${compact ? ' vod-timestamps-summary-compact' : ''}`}>
      {criteriaEntries.length > 0 && (
        <>
          <p className="vod-summary-heading">Criteria for not commencing resuscitation</p>
          <ul className="vod-criteria-stamps">
            {criteriaEntries.map((entry, i) => (
              <li key={`${entry.atEpochMs}-${entry.text}-${i}`} className="vod-criteria-stamp">
                <span className="vod-criteria-name">{getVodCriteriaDisplayName(entry.text)}</span>
                <span className="vod-criteria-time">{entry.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="vod-death-stamp">Verification of death recorded at {vodAtLabel}</p>
    </div>
  )
}
