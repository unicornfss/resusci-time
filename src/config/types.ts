export type TrustId = 'wmas' | 'emas' | 'standard'

export interface CodeShockFeature {
  enabled: boolean
  minShocks: number
  prompt: string
  logLabel: string
}

export interface ServiceFeatures {
  codeShock: CodeShockFeature
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

export type TrustOverrides = Pick<
  ServiceConfig,
  'trustId' | 'trustLabel' | 'features'
> & {
  brandBackgroundAsset?: string
}
