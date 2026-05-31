import { getServiceConfig, isTrustId } from './getServiceConfig'
import { parseViteMode, TRUST_IDS } from './trustIds'

const viteMode = parseViteMode(import.meta.env.MODE)
const configuredTrust = viteMode.trustId ?? import.meta.env.VITE_TRUST
const configuredChannel = viteMode.trustId ? viteMode.channel : 'live'

if (!isTrustId(configuredTrust)) {
  throw new Error(
    `Invalid or missing VITE_TRUST "${configuredTrust}". Expected one of: ${TRUST_IDS.join(', ')}.`,
  )
}

export const serviceConfig = getServiceConfig(configuredTrust, configuredChannel)
