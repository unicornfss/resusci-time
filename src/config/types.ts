export type TrustId = 'wmas' | 'emas'

export interface CodeShockFeature {
  enabled: boolean
  minShocks: number
  prompt: string
  logLabel: string
}

export interface ServiceFeatures {
  codeShock: CodeShockFeature
}

export interface ServiceConfig {
  trustId: TrustId
  trustLabel: string
  pageTitle: string
  headerTitle: string
  features: ServiceFeatures
}

export type TrustOverrides = Pick<ServiceConfig, 'trustId' | 'trustLabel' | 'features'>
