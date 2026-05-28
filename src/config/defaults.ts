import type { ServiceFeatures } from './types'

export const defaultBrandBackgroundAsset = 'backgrounds/resusci-time-logo.png'

export const defaultFeatures: ServiceFeatures = {
  codeShock: {
    enabled: false,
    minShocks: 3,
    prompt: 'CODE SHOCK notified to EOC',
    logLabel: 'CODE SHOCK notified to EOC',
  },
}
