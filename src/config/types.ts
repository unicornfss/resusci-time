export type TrustId = 'wmas' | 'emas' | 'standard'

export interface CodeShockFeature {
  minShocks: number
  prompt: string
  logLabel: string
}

export interface ProlongedVfTorFeature {
  /** When true, TOR review requires senior clinical discussion if prolonged VF was logged. */
  enabled: true
}

export interface MedicationOption {
  id: string
  label: string
}

export interface ServiceFeatures {
  codeShock?: CodeShockFeature
  prolongedVfTorGate?: ProlongedVfTorFeature
  extraMedications: readonly MedicationOption[]
}

import type { BuildChannel } from './trustIds'

export interface ServiceConfig {
  trustId: TrustId
  trustLabel: string
  buildChannel: BuildChannel
  isPreview: boolean
  pageTitle: string
  headerTitle: string
  brandBackgroundAsset: string
  features: ServiceFeatures
}

export type TrustOverrides = Pick<ServiceConfig, 'trustId' | 'trustLabel'> & {
  brandBackgroundAsset?: string
  features?: {
    codeShock?: CodeShockFeature
    prolongedVfTorGate?: ProlongedVfTorFeature
    extraMedications?: readonly MedicationOption[]
  }
}
