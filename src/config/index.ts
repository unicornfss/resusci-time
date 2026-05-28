import { getServiceConfig, isTrustId } from './getServiceConfig'

const configuredTrust = import.meta.env.VITE_TRUST

if (!isTrustId(configuredTrust)) {
  throw new Error(
    `Invalid or missing VITE_TRUST "${configuredTrust}". Expected "wmas" or "emas".`,
  )
}

export const serviceConfig = getServiceConfig(configuredTrust)
