import { useState, type ReactNode } from 'react'
import { readAccessSession } from '../accessControl'
import { AccessGate } from './AccessGate'

interface LegacyClientAccessGateProps {
  children: ReactNode
}

/** Opt-in only via VITE_CLIENT_ACCESS_GATE=1 — prefer Cloudflare Access. */
export function LegacyClientAccessGate({ children }: LegacyClientAccessGateProps) {
  const [username, setUsername] = useState<string | null>(() => readAccessSession())

  if (!username) {
    return <AccessGate onAuthenticated={setUsername} />
  }
  return children
}
