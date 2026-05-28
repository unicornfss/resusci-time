export type TrustId = 'wmas' | 'emas' | 'standard'

export interface CodeShockFeature {
  minShocks: number
  prompt: string
  logLabel: string
}

export interface MedicationOption {
  id: string
  label: string
}

export interface ServiceFeatures {
  codeShock?: CodeShockFeature
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
    extraMedications?: readonly MedicationOption[]
  }
}
