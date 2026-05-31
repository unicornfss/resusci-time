import type { TrustOverrides } from '../types'

export const wmasTrust: TrustOverrides = {
  trustId: 'wmas',
  trustLabel: 'WMAS',
  brandBackgroundAsset: 'backgrounds/wmas-crest.png',
  features: {
    codeShock: {
      minShocks: 1,
      prompt: 'CODE SHOCK notified to EOC',
      logLabel: 'CODE SHOCK notified to EOC',
    },
    prolongedVfTorGate: { enabled: true },
  },
}
