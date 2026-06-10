export type TrustId = 'wmas' | 'standard'

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
  /** QR case transfer between Resusci-Time devices (custom / trust builds). */
  caseTransfer: boolean
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
    /** `true` uses default CODE SHOCK settings for the trust. */
    codeShock?: true | CodeShockFeature
    /** `true` enables the prolonged-VF TOR senior-discussion gate. */
    prolongedVfTorGate?: true | ProlongedVfTorFeature
    /** Omit on custom trusts to enable case transfer; set `false` to disable explicitly. */
    caseTransfer?: true | false
    extraMedications?: readonly MedicationOption[]
  }
}
