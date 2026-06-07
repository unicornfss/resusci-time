import { APP_BUILD_ISO, APP_VERSION } from './appVersion'
import { serviceConfig } from './config'
import { IS_PREVIEW_BUILD } from './timing'

export type PreviewDebugCategory =
  | 'app'
  | 'navigation'
  | 'timer'
  | 'log'
  | 'alert'
  | 'modal'
  | 'transfer'
  | 'action'
  | 'error'

export interface PreviewDebugEvent {
  atIso: string
  atMs: number
  category: PreviewDebugCategory
  action: string
  detail?: Record<string, unknown>
}

export interface PreviewDebugReportState {
  step: string
  timerView: string
  canModifyCase: boolean
  patientHandedOver: boolean
  caseHandedOff: boolean
  transferActive: boolean
  timerElapsedSeconds: number
  timerIsRunning: boolean
  logEntryCount: number
  activeClinicalAlerts: readonly string[]
  currentClinicalAlert: string | null
  snapshot: Record<string, unknown>
  logEntries: readonly { label: string; text: string; atEpochMs: number }[]
}

const MAX_EVENTS = 500
const STORAGE_KEY = 'resusci-time-preview-debug-log-v1'

function debugLogEnabled(): boolean {
  return IS_PREVIEW_BUILD || import.meta.env.DEV
}

let sessionStartedAt = new Date().toISOString()
let events: PreviewDebugEvent[] = hydrateFromStorage()

function hydrateFromStorage(): PreviewDebugEvent[] {
  if (!debugLogEnabled()) return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { sessionStartedAt?: string; events?: PreviewDebugEvent[] }
    if (parsed.sessionStartedAt) sessionStartedAt = parsed.sessionStartedAt
    return Array.isArray(parsed.events) ? parsed.events.slice(-MAX_EVENTS) : []
  } catch {
    return []
  }
}

function persistEvents(): void {
  if (!debugLogEnabled()) return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionStartedAt,
        events,
      }),
    )
  } catch {
    /* storage full or unavailable */
  }
}

export function isPreviewDebugLogEnabled(): boolean {
  return debugLogEnabled()
}

/** Preview/dev only: enter "crashme" on Medications → Other to test error capture in debug reports. */
export const PREVIEW_TEST_CRASH_TOKEN = 'crashme'

function isPreviewCrashTestAllowed(): boolean {
  return debugLogEnabled()
}

export function maybeTriggerPreviewTestCrash(category: string, label: string): boolean {
  if (!isPreviewCrashTestAllowed()) return false
  if (category !== 'medications') return false
  if (label.trim().toLowerCase() !== PREVIEW_TEST_CRASH_TOKEN) return false
  recordPreviewDebugEvent('action', 'preview_test_crash_triggered', { category, label })
  window.setTimeout(() => {
    throw new Error('Resusci-Time preview test crash (Medications → Other → "crashme")')
  }, 100)
  return true
}

export function recordPreviewDebugEvent(
  category: PreviewDebugCategory,
  action: string,
  detail?: Record<string, unknown>,
): void {
  if (!debugLogEnabled()) return
  const event: PreviewDebugEvent = {
    atIso: new Date().toISOString(),
    atMs: Date.now(),
    category,
    action,
    ...(detail && Object.keys(detail).length > 0 ? { detail } : {}),
  }
  events = [...events, event].slice(-MAX_EVENTS)
  persistEvents()
}

export function recordPreviewDebugStateChange(
  action: string,
  detail: Record<string, unknown>,
): void {
  recordPreviewDebugEvent('navigation', action, detail)
}

export function clearPreviewDebugLog(): void {
  if (!debugLogEnabled()) return
  sessionStartedAt = new Date().toISOString()
  events = []
  persistEvents()
}

function buildReportFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `resusci-time-debug-report-${stamp}.json`
}

export function downloadPreviewDebugReport(state: PreviewDebugReportState): void {
  if (!debugLogEnabled()) return

  recordPreviewDebugEvent('action', 'debug_report_exported')

  const report = {
    warning:
      'Preview debug report — may contain simulated clinical test data from training scenarios. Do not share if it could identify a real patient.',
    generatedAt: new Date().toISOString(),
    meta: {
      appVersion: APP_VERSION,
      appBuildIso: APP_BUILD_ISO,
      trustId: serviceConfig.trustId,
      trustLabel: serviceConfig.trustLabel,
      buildChannel: serviceConfig.buildChannel,
      isPreview: serviceConfig.isPreview,
      sessionStartedAt,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      url: window.location.href,
    },
    events: [...events],
    state,
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = buildReportFilename()
  anchor.click()
  URL.revokeObjectURL(url)
}

let globalHandlersInstalled = false

export function installPreviewDebugGlobalHandlers(): void {
  if (!debugLogEnabled() || globalHandlersInstalled) return
  globalHandlersInstalled = true

  recordPreviewDebugEvent('app', 'session_started', {
    trustId: serviceConfig.trustId,
    buildChannel: serviceConfig.buildChannel,
  })

  window.addEventListener('error', (event) => {
    recordPreviewDebugEvent('error', 'window_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    recordPreviewDebugEvent('error', 'unhandled_rejection', {
      message: reason instanceof Error ? reason.message : String(reason),
    })
  })
}
