import { defaultFeatures } from '../defaults'
import type { TrustOverrides } from '../types'

export const standardTrust: TrustOverrides = {
  trustId: 'standard',
  trustLabel: 'Standard',
  features: {
    codeShock: { ...defaultFeatures.codeShock },
  },
}
