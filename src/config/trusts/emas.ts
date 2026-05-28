import type { TrustOverrides } from '../types'

export const emasTrust: TrustOverrides = {
  trustId: 'emas',
  trustLabel: 'EMAS',
  features: {
    codeShock: {
      enabled: false,
      minShocks: 3,
      prompt: 'CODE SHOCK notified to EOC',
      logLabel: 'CODE SHOCK notified to EOC',
    },
  },
}
