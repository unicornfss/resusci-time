import { VOD_LOG_LABEL } from './protocol'
import type { SavedLogRecord } from './logStorage'
import type { DisplayLogEntry } from './types'

export const CASE_CONTINUATION_WINDOW_MS = 10 * 60 * 1000

export function hasVodDeclared(entries: readonly DisplayLogEntry[]): boolean {
  return entries.some((entry) => entry.text === VOD_LOG_LABEL)
}

export function getLastLogEntryAt(entries: readonly DisplayLogEntry[]): number | null {
  if (entries.length === 0) return null
  return Math.max(...entries.map((entry) => entry.atEpochMs))
}

export function isWithinContinuationWindow(entries: readonly DisplayLogEntry[]): boolean {
  const lastAt = getLastLogEntryAt(entries)
  if (lastAt == null) return false
  return Date.now() - lastAt < CASE_CONTINUATION_WINDOW_MS
}

export function canOfferCaseContinuation(record: SavedLogRecord): boolean {
  if (record.entries.length === 0) return false
  if (hasVodDeclared(record.entries)) return false
  if (!record.caseSnapshot) return false
  return isWithinContinuationWindow(record.entries)
}
