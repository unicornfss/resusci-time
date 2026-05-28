import manifest from './trust-manifest.json'
import type { TrustId } from './types'

export type BuildChannel = 'live' | 'preview'

export const TRUST_MANIFEST = manifest as ReadonlyArray<{ id: TrustId; label: string }>

export const TRUST_IDS = TRUST_MANIFEST.map((entry) => entry.id)

export function isTrustId(value: string): value is TrustId {
  return TRUST_IDS.includes(value as TrustId)
}

export function parseViteMode(mode: string): { trustId: TrustId | null; channel: BuildChannel } {
  if (mode.endsWith('-preview')) {
    const trustId = mode.slice(0, -'-preview'.length)
    if (isTrustId(trustId)) {
      return { trustId, channel: 'preview' }
    }
  }

  if (isTrustId(mode)) {
    return { trustId: mode, channel: 'live' }
  }

  return { trustId: null, channel: 'live' }
}

export function previewOutputFolder(trustId: TrustId): string {
  return `${trustId}-preview`
}
