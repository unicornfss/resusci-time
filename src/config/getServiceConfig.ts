import { defaultBrandBackgroundAsset, defaultFeatures } from './defaults'
import { emasTrust } from './trusts/emas'
import { standardTrust } from './trusts/standard'
import { wmasTrust } from './trusts/wmas'
import type { BuildChannel } from './trustIds'
import type { ServiceConfig, TrustId } from './types'

const TRUSTS = {
  wmas: wmasTrust,
  emas: emasTrust,
  standard: standardTrust,
} as const

export { isTrustId } from './trustIds'

export function getServiceConfig(trustId: TrustId, channel: BuildChannel = 'live'): ServiceConfig {
  const trust = TRUSTS[trustId]
  const isPreview = channel === 'preview'
  const versionSuffix = isPreview ? ' version (Preview)' : ' version'

  return {
    trustId: trust.trustId,
    trustLabel: trust.trustLabel,
    buildChannel: channel,
    isPreview,
    pageTitle: `Resusci-Time - ${trust.trustLabel}${versionSuffix}`,
    headerTitle: `Resusci-Time - ${trust.trustLabel}${versionSuffix}`,
    brandBackgroundAsset: trust.brandBackgroundAsset ?? defaultBrandBackgroundAsset,
    features: {
      ...(trust.features?.codeShock ? { codeShock: trust.features.codeShock } : {}),
      extraMedications: trust.features?.extraMedications ?? defaultFeatures.extraMedications,
    },
  }
}

export function buildWebManifest(config: ServiceConfig) {
  const iconPrefix = config.isPreview ? 'preview-icons/' : ''

  return {
    name: config.pageTitle,
    short_name: config.isPreview
      ? `Resusci-Time ${config.trustLabel} Preview`
      : `Resusci-Time ${config.trustLabel}`,
    description:
      'Guided adult cardiac arrest protocol timer and checklist for ambulance resources.',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#1f4f1f',
    background_color: '#dfe8df',
    icons: [
      { src: `${iconPrefix}favicon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${iconPrefix}apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
      { src: `${iconPrefix}favicon-512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${iconPrefix}favicon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
