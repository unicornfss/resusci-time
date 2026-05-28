import { defaultFeatures } from './defaults'
import { emasTrust } from './trusts/emas'
import { wmasTrust } from './trusts/wmas'
import type { ServiceConfig, TrustId } from './types'

const TRUSTS = {
  wmas: wmasTrust,
  emas: emasTrust,
} as const

export function isTrustId(value: string): value is TrustId {
  return value === 'wmas' || value === 'emas'
}

export function getServiceConfig(trustId: TrustId): ServiceConfig {
  const trust = TRUSTS[trustId]
  return {
    trustId: trust.trustId,
    trustLabel: trust.trustLabel,
    pageTitle: `Resusci-Time - ${trust.trustLabel} version`,
    headerTitle: `Resusci-Time - ${trust.trustLabel} version`,
    features: {
      codeShock: {
        ...defaultFeatures.codeShock,
        ...trust.features.codeShock,
      },
    },
  }
}

export function buildWebManifest(config: ServiceConfig) {
  return {
    name: config.pageTitle,
    short_name: `Resusci-Time ${config.trustLabel}`,
    description:
      'Guided adult cardiac arrest protocol timer and checklist for ambulance resources.',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#1f4f1f',
    background_color: '#dfe8df',
    icons: [
      { src: 'favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: 'favicon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
