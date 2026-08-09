/**
 * Edge gate for Resusci-Time preview paths.
 * Secrets: SESSION_SECRET, PREVIEW_USERS (JSON: [{username,password}, ...])
 */

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

async function signPayload(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function parseCookies(header) {
  const out = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    out[k] = decodeURIComponent(v)
  }
  return out
}

function loginPage(errorMessage) {
  const err = errorMessage
    ? `<p style="color:#b91c1c;font-weight:600">${errorMessage}</p>`
    : ''
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Resusci-Time preview — sign in</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:system-ui,sans-serif;background:#dfe8df;color:#1a2e1a;padding:1rem}
.card{width:min(100%,24rem);background:#f4f8f4;border:1px solid #b8c9b8;border-radius:12px;padding:1.5rem}
h1{margin:0 0 .75rem;font-size:1.35rem;text-align:center}
p{font-size:.95rem;color:#4a5f4a}
label{display:block;margin:.75rem 0 .35rem;font-weight:600;font-size:.85rem}
input{width:100%;box-sizing:border-box;min-height:2.75rem;padding:.65rem .75rem;border-radius:10px;border:2px solid #b8c9b8}
button{margin-top:1rem;width:100%;min-height:3rem;border:none;border-radius:12px;background:#2d6a2d;color:#fff;font-weight:700;cursor:pointer}
</style></head><body><div class="card">
<h1>Resusci-Time preview</h1>
<p>Sign in to continue. This build is for simulation and internal review only.</p>
${err}
<form method="POST" action="">
<label>Username</label><input name="username" autocomplete="username" required/>
<label>Password</label><input type="password" name="password" autocomplete="current-password" required/>
<button type="submit">Sign in</button>
</form>
</div></body></html>`
}

async function readUsers(env) {
  const raw = env.PREVIEW_USERS
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function verifyUser(env, username, password) {
  const users = await readUsers(env)
  const normalised = username.trim().toLowerCase()
  const entry = users.find((u) => String(u.username || '').toLowerCase() === normalised)
  if (!entry || typeof entry.password !== 'string') return false
  return timingSafeEqual(entry.password, password)
}

async function createSessionCookie(env, username) {
  const ttl = Number(env.SESSION_TTL_SECONDS || 43200)
  const exp = Math.floor(Date.now() / 1000) + ttl
  const payload = `${username.toLowerCase()}|${exp}`
  const sig = await signPayload(env.SESSION_SECRET, payload)
  const value = encodeURIComponent(`${payload}|${sig}`)
  const name = env.SESSION_COOKIE || 'rt_preview_session'
  return `${name}=${value}; Path=${env.PROTECTED_PREFIX || '/w2ht9vrl'}; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttl}`
}

async function readSession(env, request) {
  if (!env.SESSION_SECRET) return null
  const cookies = parseCookies(request.headers.get('Cookie') || '')
  const name = env.SESSION_COOKIE || 'rt_preview_session'
  const raw = cookies[name]
  if (!raw) return null
  const parts = raw.split('|')
  if (parts.length !== 3) return null
  const [username, expStr, sig] = parts
  const exp = Number(expStr)
  if (!username || !Number.isFinite(exp) || exp * 1000 < Date.now()) return null
  const payload = `${username}|${exp}`
  const expected = await signPayload(env.SESSION_SECRET, payload)
  if (!timingSafeEqual(expected, sig)) return null
  return username
}

function isProtectedPath(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

async function proxyToOrigin(request, env) {
  const incoming = new URL(request.url)
  const originBase = env.ORIGIN_BASE
  if (!originBase) {
    return new Response('ORIGIN_BASE is not configured on the Worker.', { status: 500 })
  }
  const target = new URL(incoming.pathname + incoming.search, originBase)
  const headers = new Headers(request.headers)
  headers.delete('cookie')
  headers.set('Host', new URL(originBase).host)
  return fetch(target.toString(), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const prefix = env.PROTECTED_PREFIX || '/w2ht9vrl'

    if (!isProtectedPath(url.pathname, prefix)) {
      return fetch(request)
    }

    if (!env.SESSION_SECRET || !env.PREVIEW_USERS) {
      return new Response(
        'Preview gate is not configured (missing SESSION_SECRET or PREVIEW_USERS).',
        { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      )
    }

    if (request.method === 'POST') {
      const form = await request.formData()
      const username = String(form.get('username') || '')
      const password = String(form.get('password') || '')
      const ok = await verifyUser(env, username, password)
      if (!ok) {
        return new Response(loginPage('Incorrect username or password.'), {
          status: 401,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        })
      }
      const cookie = await createSessionCookie(env, username)
      return new Response(null, {
        status: 303,
        headers: {
          Location: prefix.endsWith('/') ? prefix : `${prefix}/`,
          'Set-Cookie': cookie,
        },
      })
    }

    const sessionUser = await readSession(env, request)
    if (!sessionUser) {
      return new Response(loginPage(''), {
        status: 401,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    }

    return proxyToOrigin(request, env)
  },
}
