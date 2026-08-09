# Cloudflare Worker — preview path gate

Protects `/w2ht9vrl/*` with a login form and an **HttpOnly** session cookie. Passwords are Cloudflare secrets, not in the app JS.

**Prefer [Cloudflare Access](../docs/PREVIEW-ACCESS.md) if you can** — email OTP / SSO is stronger and easier for the group. Use this Worker only if Access is not available yet.

## Setup

1. DNS for `resusci-time.adminforge.co.uk` must be on Cloudflare (**proxied**).
2. Find your GitHub Pages origin URL (often `https://unicornfss.github.io/resusci-time/`). Put it in `wrangler.toml` as `ORIGIN_BASE` (with trailing slash), **or** set it as a Worker variable in the dashboard.
3. From this folder:

```bash
npx wrangler login
npx wrangler secret put SESSION_SECRET
# paste a long random string (e.g. openssl rand -hex 32)

npx wrangler secret put PREVIEW_USERS
# paste JSON, for example:
# [{"username":"jon","password":"choose-a-long-password"},{"username":"laurence","password":"..."}]

npx wrangler deploy
```

4. Cloudflare dashboard → Workers → this worker → **Triggers** → **Add route**:
   - Route: `resusci-time.adminforge.co.uk/w2ht9vrl*`
   - Zone: your adminforge / resusci-time zone

5. Test in a private window. You should see the Worker login, then the app.

## Rotate users

Update the `PREVIEW_USERS` secret and save. No app redeploy required. Existing sessions expire after `SESSION_TTL_SECONDS` (default 12 hours).
