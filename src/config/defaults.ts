import type { CodeShockFeature, ProlongedVfTorFeature, ServiceFeatures } from './types'

export const defaultBrandBackgroundAsset = 'backgrounds/resusci-time-logo.png'

export const defaultCodeShock: CodeShockFeature = {
  minShocks: 1,
  prompt: 'CODE SHOCK notified to EOC',
  logLabel: 'CODE SHOCK notified to EOC',
}

export const defaultProlongedVfTorGate: ProlongedVfTorFeature = { enabled: true }

export const defaultFeatures: ServiceFeatures = {
  caseTransfer: false,
  extraMedications: [],
}
