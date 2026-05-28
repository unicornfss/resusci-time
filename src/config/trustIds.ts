import manifest from './trust-manifest.json'
import type { TrustId } from './types'

export type BuildChannel = 'live' | 'preview'

export type TrustManifestEntry = Readonly<{
  id: TrustId
  label: string
  liveSlug?: string
  previewSlug?: string
}>

export const TRUST_MANIFEST = manifest as ReadonlyArray<TrustManifestEntry>

export const TRUST_IDS = TRUST_MANIFEST.map((entry) => entry.id)

function requireTrust(trustId: TrustId): TrustManifestEntry {
  const entry = TRUST_MANIFEST.find((trust) => trust.id === trustId)
  if (!entry) {
    throw new Error(`Unknown trust: ${trustId}`)
  }
  return entry
}

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

export function liveOutputFolder(trustId: TrustId): string {
  if (trustId === 'standard') return 'standard'
  const slug = requireTrust(trustId).liveSlug
  if (!slug) {
    throw new Error(`Missing liveSlug for trust: ${trustId}`)
  }
  return slug
}

export function previewOutputFolder(trustId: TrustId): string {
  if (trustId === 'standard') return 'standard-preview'
  const slug = requireTrust(trustId).previewSlug
  if (!slug) {
    throw new Error(`Missing previewSlug for trust: ${trustId}`)
  }
  return slug
}
