import LZString from 'lz-string'
import type { CaseSnapshot } from './caseSnapshot'
import { isCaseSnapshot } from './caseSnapshot'
import { formatActualTime } from './protocol'
import type { TrustId } from './config/types'
import type { DisplayLogEntry } from './types'
import { createSavedLogId } from './logStorage'

export const HANDOFF_SESSION_KEY = 'resusci-time-case-handed-off'
export const HANDOFF_HASH_PREFIX = 'h'

/** Conservative limit — QR scanners struggle above ~2.5 KB of URL data. */
export const HANDOFF_QR_MAX_URL_LENGTH = 2500

export interface CaseHandoffPayload {
  v: 1
  trust: TrustId
  handoffId: string
  handoffAt: number
  permanentLogId: string
  snapshot: CaseSnapshot
  entries: DisplayLogEntry[]
}

interface CaseHandoffWire {
  v: 1
  t: 'w' | 's'
  i: string
  a: number
  p: string
  s: CaseSnapshot
  e: [number, string][]
}

function trustToWire(trust: TrustId): 'w' | 's' {
  return trust === 'standard' ? 's' : 'w'
}

function trustFromWire(trust: 'w' | 's'): TrustId {
  return trust === 's' ? 'standard' : 'wmas'
}

function toWire(payload: CaseHandoffPayload): CaseHandoffWire {
  return {
    v: 1,
    t: trustToWire(payload.trust),
    i: payload.handoffId,
    a: payload.handoffAt,
    p: payload.permanentLogId,
    s: payload.snapshot,
    e: payload.entries.map((entry) => [entry.atEpochMs, entry.text]),
  }
}

function fromWire(wire: CaseHandoffWire): CaseHandoffPayload | null {
  if (wire.v !== 1 || !isCaseSnapshot(wire.s) || !Array.isArray(wire.e)) return null
  return {
    v: 1,
    trust: trustFromWire(wire.t),
    handoffId: wire.i,
    handoffAt: wire.a,
    permanentLogId: wire.p,
    snapshot: wire.s,
    entries: wire.e.map(([atEpochMs, text]) => ({
      atEpochMs,
      label: formatActualTime(new Date(atEpochMs)),
      text,
    })),
  }
}

export function encodeCaseHandoff(payload: CaseHandoffPayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(toWire(payload)))
}

export function decodeCaseHandoff(encoded: string): CaseHandoffPayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return fromWire(JSON.parse(json) as CaseHandoffWire)
  } catch {
    return null
  }
}

export function buildCaseHandoffPayload(input: {
  trustId: TrustId
  snapshot: CaseSnapshot
  entries: readonly DisplayLogEntry[]
  handoffAt?: number
}): CaseHandoffPayload {
  const handoffAt = input.handoffAt ?? Date.now()
  return {
    v: 1,
    trust: input.trustId,
    handoffId: createSavedLogId(),
    handoffAt,
    permanentLogId: input.snapshot.permanentLogId,
    snapshot: input.snapshot,
    entries: input.entries.map((entry) => ({ ...entry })),
  }
}

export function buildCaseHandoffUrl(payload: CaseHandoffPayload): string {
  const encoded = encodeCaseHandoff(payload)
  return `${window.location.origin}${window.location.pathname}#${HANDOFF_HASH_PREFIX}=${encoded}`
}

export function parseCaseHandoffFromLocation(location: Location = window.location): CaseHandoffPayload | null {
  const match = location.hash.match(new RegExp(`^#${HANDOFF_HASH_PREFIX}=(.+)$`))
  if (!match) return null
  return decodeCaseHandoff(match[1])
}

export function clearCaseHandoffHash(): void {
  const url = new URL(window.location.href)
  if (!url.hash.match(new RegExp(`^#${HANDOFF_HASH_PREFIX}=`))) return
  url.hash = ''
  window.history.replaceState(null, '', url.toString())
}

export function isHandoffUrlTooLargeForQr(url: string): boolean {
  return url.length > HANDOFF_QR_MAX_URL_LENGTH
}

export function adjustSnapshotForHandoffReceive(
  snapshot: CaseSnapshot,
  handoffAt: number,
  now = Date.now(),
): CaseSnapshot {
  const deltaSec = Math.max(0, Math.floor((now - handoffAt) / 1000))
  if (deltaSec === 0) return snapshot

  const adjusted: CaseSnapshot = {
    ...snapshot,
    timerElapsedSeconds: snapshot.timerElapsedSeconds + deltaSec,
  }

  if (snapshot.timerIsRunning) {
    adjusted.timerNextCheckAt = snapshot.timerNextCheckAt + deltaSec
    if (snapshot.timerView === 'rosc') {
      adjusted.roscElapsedSeconds = snapshot.roscElapsedSeconds + deltaSec
    }
    if (snapshot.step === 'post-tor' && snapshot.vodCountdownRemaining > 0) {
      adjusted.vodCountdownRemaining = Math.max(0, snapshot.vodCountdownRemaining - deltaSec)
    }
  }

  return adjusted
}

export function isCaseHandedOffThisSession(): boolean {
  try {
    return sessionStorage.getItem(HANDOFF_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markCaseHandedOffThisSession(): void {
  try {
    sessionStorage.setItem(HANDOFF_SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function clearCaseHandedOffSession(): void {
  try {
    sessionStorage.removeItem(HANDOFF_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export const CASE_HANDOFF_PRIVACY_NOTE =
  'The QR code or link contains the full active case (log and timer state). Nothing is stored on a server. Open on the device that should take over. After transfer, confirm on the sending device with Case transferred — do not add entries on both devices.'

export function createHandoffShareFile(payload: CaseHandoffPayload): File {
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  return new File([blob], `resusci-time-handoff-${payload.handoffId.slice(0, 8)}.json`, {
    type: 'application/json',
  })
}

export const HANDOFF_NEEDS_HTTPS_HINT =
  'Share is not available on this connection. Open the app via HTTPS (or install to your home screen), or use the QR code / Copy link below.'

export const HANDOFF_SHARE_UNSUPPORTED_HINT =
  'This browser does not support system Share. Use the QR code or Copy link below.'

export function isWebShareAvailable(): boolean {
  if (typeof navigator === 'undefined') return false
  return typeof navigator.share === 'function'
}

/** Prefer at click time — some mobile browsers only expose share in secure/document context. */
export function canInvokeWebShare(): boolean {
  return isWebShareAvailable()
}

export function getHandoffShareBlockReason(): 'needs-https' | 'unsupported' | null {
  if (isWebShareAvailable()) return null
  if (typeof window !== 'undefined' && !window.isSecureContext) return 'needs-https'
  return 'unsupported'
}

export type HandoffShareMode = 'url' | 'file' | 'text' | 'none'

/** Best-effort hint for UI; shareHandoff tries all strategies on click. */
export function detectHandoffShareMode(handoffUrl: string, file: File): HandoffShareMode {
  if (!isWebShareAvailable()) return 'none'
  try {
    if (navigator.canShare?.({ files: [file] })) return 'file'
  } catch {
    /* ignore */
  }
  try {
    if (navigator.canShare?.({ url: handoffUrl })) return 'url'
  } catch {
    /* ignore */
  }
  return 'text'
}

export type HandoffShareResult = 'shared-url' | 'shared-file' | 'cancelled' | 'unavailable' | 'failed'

export async function shareHandoff(
  handoffUrl: string,
  file: File,
): Promise<HandoffShareResult> {
  if (!isWebShareAvailable()) return 'unavailable'

  const attempts: Array<() => Promise<HandoffShareResult>> = [
    async () => {
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        throw new Error('skip')
      }
      await navigator.share({
        files: [file],
        title: 'Resusci-Time case transfer',
        text: 'Open this handoff file in Resusci-Time on the other device.',
      })
      return 'shared-file'
    },
    async () => {
      await navigator.share({
        title: 'Resusci-Time case transfer',
        text: 'Open this link to take over the active case.',
        url: handoffUrl,
      })
      return 'shared-url'
    },
    async () => {
      await navigator.share({
        title: 'Resusci-Time case transfer',
        text: `Open this link to take over the active case:\n${handoffUrl}`,
      })
      return 'shared-url'
    },
  ]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      return await attempt()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      lastError = error
    }
  }

  console.warn('Handoff share failed', lastError)
  return 'failed'
}

export async function parseCaseHandoffFile(file: File): Promise<CaseHandoffPayload | null> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as CaseHandoffPayload
    if (data.v !== 1 || !isCaseSnapshot(data.snapshot) || !Array.isArray(data.entries)) return null
    return data
  } catch {
    return null
  }
}
