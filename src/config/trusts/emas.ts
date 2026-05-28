import type { TrustOverrides } from '../types'

export const emasTrust: TrustOverrides = {
  trustId: 'emas',
  trustLabel: 'EMAS',
  brandBackgroundAsset: 'backgrounds/emas-crest.png',
  features: {
    extraMedications: [{ id: 'sodium-bicarbonate', label: 'Sodium bicarbonate' }],
  },
}
