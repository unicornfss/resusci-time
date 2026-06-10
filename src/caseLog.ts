import { PATIENT_HANDED_OVER_LOG_LABEL, VOD_LOG_LABEL } from './protocol'
import type { SavedLogRecord } from './logStorage'
import type { DisplayLogEntry } from './types'

/** Protocol minutes after the last log entry within which a case may be continued. */
export const CASE_CONTINUATION_PROTOCOL_MINUTES = 10

export function getCaseContinuationWindowMs(timeScale = 1): number {
  const scale = timeScale > 0 ? timeScale : 1
  return CASE_CONTINUATION_PROTOCOL_MINUTES * 60 * 1000 * scale
}

export function hasVodDeclared(entries: readonly DisplayLogEntry[]): boolean {
  return entries.some((entry) => entry.text === VOD_LOG_LABEL)
}

export function hasPatientHandedOverLogged(entries: readonly DisplayLogEntry[]): boolean {
  return entries.some((entry) => entry.text === PATIENT_HANDED_OVER_LOG_LABEL)
}

export function getLastLogEntryAt(entries: readonly DisplayLogEntry[]): number | null {
  if (entries.length === 0) return null
  return Math.max(...entries.map((entry) => entry.atEpochMs))
}

export function isWithinContinuationWindow(
  entries: readonly DisplayLogEntry[],
  timeScale = 1,
): boolean {
  const lastAt = getLastLogEntryAt(entries)
  if (lastAt == null) return false
  return Date.now() - lastAt < getCaseContinuationWindowMs(timeScale)
}

export function canOfferCaseContinuation(
  record: SavedLogRecord,
  timeScale = 1,
): boolean {
  if (record.entries.length === 0) return false
  if (hasVodDeclared(record.entries)) return false
  if (hasPatientHandedOverLogged(record.entries)) return false
  if (!record.caseSnapshot) return false
  return isWithinContinuationWindow(record.entries, timeScale)
}
