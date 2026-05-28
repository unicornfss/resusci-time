import type { TrustOverrides } from '../types'

export const wmasTrust: TrustOverrides = {
  trustId: 'wmas',
  trustLabel: 'WMAS',
  features: {
    codeShock: {
      enabled: true,
      minShocks: 3,
      prompt: 'CODE SHOCK notified to EOC',
      logLabel: 'CODE SHOCK notified to EOC',
    },
  },
}
