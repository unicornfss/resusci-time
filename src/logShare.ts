import LZString from 'lz-string'
import type { TrustId } from './config/types'
import { formatActualTime } from './protocol'
import type { DisplayLogEntry } from './types'

export interface SharedLogPayload {
  v: 1
  trust: TrustId
  exportedAt: number
  entries: DisplayLogEntry[]
}

/** Compact on-the-wire format — shorter URLs; times stored once, labels rebuilt on import. */
interface CompactShareWire {
  v: 2
  t: 'w' | 'e' | 's'
  a: number
  e: [number, string][]
}

/** Conservative limit — QR scanners struggle above ~2.5 KB of URL data. */
export const QR_SHARE_MAX_URL_LENGTH = 2500

function trustToWire(trust: TrustId): 'w' | 'e' | 's' {
  if (trust === 'emas') return 'e'
  if (trust === 'standard') return 's'
  return 'w'
}

function trustFromWire(trust: 'w' | 'e' | 's'): TrustId {
  if (trust === 'e') return 'emas'
  if (trust === 's') return 'standard'
  return 'wmas'
}

function toCompactWire(payload: SharedLogPayload): CompactShareWire {
  return {
    v: 2,
    t: trustToWire(payload.trust),
    a: payload.exportedAt,
    e: payload.entries.map((entry) => [entry.atEpochMs, entry.text]),
  }
}

function fromCompactWire(wire: CompactShareWire): SharedLogPayload {
  return {
    v: 1,
    trust: trustFromWire(wire.t),
    exportedAt: wire.a,
    entries: wire.e.map(([atEpochMs, text]) => ({
      atEpochMs,
      label: formatActualTime(new Date(atEpochMs)),
      text,
    })),
  }
}

function normalizeDecodedPayload(data: SharedLogPayload | CompactShareWire): SharedLogPayload | null {
  if (data.v === 2 && Array.isArray((data as CompactShareWire).e)) {
    return fromCompactWire(data as CompactShareWire)
  }
  if (data.v === 1 && Array.isArray((data as SharedLogPayload).entries)) {
    return data as SharedLogPayload
  }
  return null
}

export function encodeSharePayload(payload: SharedLogPayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(toCompactWire(payload)))
}

export function decodeSharePayload(encoded: string): SharedLogPayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return normalizeDecodedPayload(JSON.parse(json) as SharedLogPayload | CompactShareWire)
  } catch {
    return null
  }
}

export function buildSharePayload(
  entries: readonly DisplayLogEntry[],
  trustId: TrustId,
): SharedLogPayload {
  return {
    v: 1,
    trust: trustId,
    exportedAt: Date.now(),
    entries: entries.map((entry) => ({ ...entry })),
  }
}

export function buildShareUrl(payload: SharedLogPayload): string {
  const encoded = encodeSharePayload(payload)
  return `${window.location.origin}${window.location.pathname}#l=${encoded}`
}

export function parseShareFromLocation(location: Location = window.location): SharedLogPayload | null {
  const match = location.hash.match(/^#(?:l|s)=(.+)$/)
  if (!match) return null
  return decodeSharePayload(match[1])
}

export function clearShareHash(): void {
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState(null, '', url.toString())
}

export function isShareUrlTooLargeForQr(url: string): boolean {
  return url.length > QR_SHARE_MAX_URL_LENGTH
}

/** Human-readable note for the share dialog — sets expectations on privacy vs opacity. */
export const SHARE_LINK_PRIVACY_NOTE =
  'The link uses compressed encoding (not plain text), but it still contains the full log. Anyone with the link can open it. For a short opaque link, a server-side share store would be needed — email or CSV/PDF avoid putting data in the URL.'
