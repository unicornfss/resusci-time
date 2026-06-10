import {
  defaultBrandBackgroundAsset,
  defaultCodeShock,
  defaultFeatures,
  defaultProlongedVfTorGate,
} from './defaults'
import { standardTrust } from './trusts/standard'
import { wmasTrust } from './trusts/wmas'
import type { BuildChannel } from './trustIds'
import type { CodeShockFeature, ProlongedVfTorFeature, ServiceConfig, TrustId, TrustOverrides } from './types'

function resolveCodeShock(
  feature: true | CodeShockFeature | undefined,
): CodeShockFeature | undefined {
  if (feature === true) return defaultCodeShock
  if (feature) return feature
  return undefined
}

function resolveCaseTransfer(trust: TrustOverrides): boolean {
  if (trust.features?.caseTransfer === true) return true
  if (trust.features?.caseTransfer === false) return false
  return trust.trustId !== 'standard'
}

function resolveProlongedVfTorGate(
  feature: true | ProlongedVfTorFeature | undefined,
): ProlongedVfTorFeature | undefined {
  if (feature === true) return defaultProlongedVfTorGate
  if (feature) return feature
  return undefined
}

const TRUSTS = {
  wmas: wmasTrust,
  standard: standardTrust,
} as const

export { isTrustId } from './trustIds'

export function getServiceConfig(trustId: TrustId, channel: BuildChannel = 'live'): ServiceConfig {
  const trust = TRUSTS[trustId]
  const isPreview = channel === 'preview'
  const versionSuffix = isPreview ? ' version (Preview)' : ' version'
  const codeShock = resolveCodeShock(trust.features?.codeShock)
  const prolongedVfTorGate = resolveProlongedVfTorGate(trust.features?.prolongedVfTorGate)

  return {
    trustId: trust.trustId,
    trustLabel: trust.trustLabel,
    buildChannel: channel,
    isPreview,
    pageTitle: `Resusci-Time - ${trust.trustLabel}${versionSuffix}`,
    headerTitle: `Resusci-Time - ${trust.trustLabel}${versionSuffix}`,
    brandBackgroundAsset: trust.brandBackgroundAsset ?? defaultBrandBackgroundAsset,
    features: {
      ...(codeShock ? { codeShock } : {}),
      ...(prolongedVfTorGate ? { prolongedVfTorGate } : {}),
      caseTransfer: resolveCaseTransfer(trust),
      extraMedications: trust.features?.extraMedications ?? defaultFeatures.extraMedications,
    },
  }
}

export function getIconAssetPrefix(config: ServiceConfig): string {
  if (config.isPreview) return 'preview-icons/'
  if (config.trustId === 'wmas') return 'wmas-icons/'
  return ''
}

export function buildWebManifest(config: ServiceConfig) {
  const iconPrefix = getIconAssetPrefix(config)

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
