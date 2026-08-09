/** Preview / development access accounts — password hashes only (SHA-256 hex). */
export interface AccessAccount {
  username: string
  /** Lowercase hex SHA-256 of the password (UTF-8). */
  passwordSha256: string
}

/**
 * Client-side gate for preview builds on static hosting.
 * This deters casual access; it is not a substitute for server-side authentication.
 */
export const ACCESS_ACCOUNTS: readonly AccessAccount[] = [
  {
    username: 'jon',
    passwordSha256: '025042d2858b68c681c03f7795e128bfa1cc0fe3c6dcad7f6e6173ad2953aaff',
  },
  {
    username: 'laurence',
    passwordSha256: '798f091f1af8ff36fe1677629433a6389f4c9af766a81973bf75cd8aef34a73f',
  },
  {
    username: 'reviewer',
    passwordSha256: 'd9bbe6884e7a4676ae9abbabe05d0504d39b36e84ab0845e1ca20ca16581c05e',
  },
  {
    username: 'workinggroup',
    passwordSha256: '161df85829eb17fdb227efa172d25a20e5479a8d95a4cf1edc6356cbc824c381',
  },
]

export const ACCESS_SESSION_KEY = 'resusci-time-access-v1'

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyAccessCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const normalised = username.trim().toLowerCase()
  const account = ACCESS_ACCOUNTS.find((entry) => entry.username.toLowerCase() === normalised)
  if (!account) return false
  const hash = await sha256Hex(password)
  return hash === account.passwordSha256
}

export function readAccessSession(): string | null {
  try {
    const raw = sessionStorage.getItem(ACCESS_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { username?: string }
    return typeof parsed.username === 'string' && parsed.username ? parsed.username : null
  } catch {
    return null
  }
}

export function writeAccessSession(username: string) {
  sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ username, at: Date.now() }))
}

export function clearAccessSession() {
  sessionStorage.removeItem(ACCESS_SESSION_KEY)
}
