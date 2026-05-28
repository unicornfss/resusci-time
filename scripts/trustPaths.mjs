/** Shared trust path helpers for Node build scripts (keep in sync with src/config/trustIds.ts). */

import manifest from '../src/config/trust-manifest.json' with { type: 'json' }

function requireTrust(trustId) {
  const entry = manifest.find((trust) => trust.id === trustId)
  if (!entry) {
    throw new Error(`Unknown trust: ${trustId}`)
  }
  return entry
}

export function liveOutputFolder(trustId) {
  if (trustId === 'standard') return 'standard'
  const slug = requireTrust(trustId).liveSlug
  if (!slug) {
    throw new Error(`Missing liveSlug for trust: ${trustId}`)
  }
  return slug
}

export function previewOutputFolder(trustId) {
  if (trustId === 'standard') return 'standard-preview'
  const slug = requireTrust(trustId).previewSlug
  if (!slug) {
    throw new Error(`Missing previewSlug for trust: ${trustId}`)
  }
  return slug
}
