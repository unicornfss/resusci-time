import { getServiceConfig, isTrustId } from './getServiceConfig'
import type { BuildChannel } from './trustIds'
import { TRUST_IDS } from './trustIds'

const configuredTrust = import.meta.env.VITE_TRUST
const configuredChannel: BuildChannel =
  import.meta.env.VITE_BUILD_CHANNEL === 'preview' ? 'preview' : 'live'

if (!isTrustId(configuredTrust)) {
  throw new Error(
    `Invalid or missing VITE_TRUST "${configuredTrust}". Expected one of: ${TRUST_IDS.join(', ')}.`,
  )
}

export const serviceConfig = getServiceConfig(configuredTrust, configuredChannel)
