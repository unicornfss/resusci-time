import { useState, type ReactNode } from 'react'
import { serviceConfig } from '../config'
import { readAccessSession } from '../accessControl'
import { AccessGate } from './AccessGate'

interface AccessGateProviderProps {
  children: ReactNode
}

/** Requires sign-in on preview builds. Live/approved builds skip the gate. */
export function AccessGateProvider({ children }: AccessGateProviderProps) {
  const requiresAccess = serviceConfig.isPreview
  const [username, setUsername] = useState<string | null>(() =>
    requiresAccess ? readAccessSession() : 'live',
  )

  if (!requiresAccess) return children
  if (!username) {
    return <AccessGate onAuthenticated={setUsername} />
  }
  return children
}
