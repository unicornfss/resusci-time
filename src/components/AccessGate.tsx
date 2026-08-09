import { useState, type FormEvent } from 'react'
import { verifyAccessCredentials, writeAccessSession } from '../accessControl'

interface AccessGateProps {
  onAuthenticated: (username: string) => void
}

export function AccessGate({ onAuthenticated }: AccessGateProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const ok = await verifyAccessCredentials(username, password)
      if (!ok) {
        setError('Incorrect username or password.')
        return
      }
      const normalised = username.trim().toLowerCase()
      writeAccessSession(normalised)
      onAuthenticated(normalised)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app access-gate">
      <div className="access-gate-card card">
        <h1>Resusci-Time</h1>
        <p className="access-gate-lead">
          This preview is access-controlled for simulation and internal review only. Sign in with
          the credentials issued to you.
        </p>
        <form className="access-gate-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="access-gate-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="access-gate-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={busy}
            />
          </label>
          {error ? <p className="access-gate-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
        <p className="access-gate-note">
          Not for patient contact. Passwords are for authorised working-group use only — do not
          share outside the group.
        </p>
      </div>
    </div>
  )
}
