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

/** SHA-256 that works on HTTP LAN previews (crypto.subtle needs a secure context). */
function sha256HexSync(message: string): string {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])

  const bytes = new TextEncoder().encode(message)
  const bitLen = bytes.length * 8
  const withPad = new Uint8Array(((bytes.length + 9 + 63) & ~63))
  withPad.set(bytes)
  withPad[bytes.length] = 0x80
  const view = new DataView(withPad.buffer)
  view.setUint32(withPad.length - 4, bitLen >>> 0, false)
  view.setUint32(withPad.length - 8, Math.floor(bitLen / 0x100000000), false)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  const w = new Uint32Array(64)
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n))

  for (let i = 0; i < withPad.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false)
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3)
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10)
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7

    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((n) => n.toString(16).padStart(8, '0'))
    .join('')
}

export async function sha256Hex(value: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(value)
      const digest = await crypto.subtle.digest('SHA-256', data)
      return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fall through — e.g. non-secure HTTP contexts.
    }
  }
  return sha256HexSync(value)
}

export async function verifyAccessCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const normalised = username.trim().toLowerCase()
  const account = ACCESS_ACCOUNTS.find((entry) => entry.username.toLowerCase() === normalised)
  if (!account) return false
  const hash = await sha256Hex(password.trim())
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
