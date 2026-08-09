import { lazy, Suspense, type ReactNode } from 'react'
import { serviceConfig } from '../config'

interface AccessGateProviderProps {
  children: ReactNode
}

const LegacyClientAccessGate = lazy(() =>
  import('./LegacyClientAccessGate').then((m) => ({ default: m.LegacyClientAccessGate })),
)

/**
 * Optional in-app preview login. Disabled by default — Cloudflare Access
 * protects /w2ht9vrl*. Set VITE_CLIENT_ACCESS_GATE=1 only if you need the
 * old client-side form (e.g. local testing without Access).
 * See docs/PREVIEW-ACCESS.md.
 */
export function AccessGateProvider({ children }: AccessGateProviderProps) {
  const clientGateEnabled = import.meta.env.VITE_CLIENT_ACCESS_GATE === '1'
  const requiresAccess = serviceConfig.isPreview && clientGateEnabled

  if (!requiresAccess) return children

  return (
    <Suspense fallback={null}>
      <LegacyClientAccessGate>{children}</LegacyClientAccessGate>
    </Suspense>
  )
}
