# Securing the Resusci-Time preview (testing builds)

Approved / live URLs stay lightly gated (placeholder pages). **Preview** (`/w2ht9vrl/`) must not ship the app JS to the public internet without real authentication.

The old in-app username/password form was only a deterrent: usernames and password hashes are inside the downloaded JavaScript and can be bypassed. **Do not rely on it.**

## Recommended: Cloudflare Access (Zero Trust)

This blocks the request **before** HTML/JS is served. Users sign in with email one-time codes (or Google / Microsoft). You control the allow-list. Approved paths stay public.

### Prerequisites

1. A [Cloudflare](https://dash.cloudflare.com/) account (free tier is enough to start).
2. DNS for `resusci-time.adminforge.co.uk` (or the parent `adminforge.co.uk` zone) managed by Cloudflare, with the record **proxied** (orange cloud).

### Create an Access application for preview only

1. Open **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**.
2. Name: `Resusci-Time preview`.
3. Public hostname:
   - Domain: `resusci-time.adminforge.co.uk`
   - Path: `w2ht9vrl*`  
     (covers `/w2ht9vrl/` and all assets under it — see [Application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/))
4. Identity providers: enable **One-time PIN** (email) at minimum. Add Google/Microsoft if your group uses them.
5. Policy example:
   - Action: **Allow**
   - Include: emails of working-group members (or an email domain you control)
6. Save.

Do **not** put Access on `/`, `/standard/`, `/7kpm3xnq/`, or other non-preview paths unless you intentionally want those locked too. Approved placeholders can stay open. The public blog is currently not published.

### Requesting preview access

A public form is on the site at `/request-access/`. It emails `jon.ostrowski@wmas.nhs.uk` (via FormSubmit). Requests are reviewed before anyone is added to Cloudflare Access — the form does not grant access automatically.

**First use:** FormSubmit sends an activation email to that address. Confirm it once, then further requests arrive as normal. Check junk if the activation mail is missing.

### After Access is live

1. Open https://resusci-time.adminforge.co.uk/w2ht9vrl/ in a private window — you should hit Cloudflare’s login, not the old in-app form.
2. Tell the group they will get an email code (or IdP login), not the old `ACCESS-CREDENTIALS.local.md` passwords.
3. Once confirmed, turn off the temporary client-side gate if it is still enabled (`VITE_CLIENT_ACCESS_GATE=0`) and redeploy `testing`.

### Optional: protect only a subdomain

Alternatively create `preview.resusci-time.adminforge.co.uk` → same GitHub Pages site, put Access on that whole host, and point the home page CTA there. Path-based Access on the existing URL is usually simpler.

---

## Alternative: Cloudflare Worker (HTTP login + HttpOnly cookie)

Use this if you cannot use Zero Trust Access yet. Passwords live in **Cloudflare secrets** (never in the browser bundle). See `cloudflare/preview-gate/`.

```bash
cd cloudflare/preview-gate
npx wrangler login
npx wrangler secret put SESSION_SECRET    # long random string
npx wrangler secret put PREVIEW_USERS     # JSON array, see README there
npx wrangler deploy
```

Then attach a **Worker route** in the Cloudflare dashboard:

`resusci-time.adminforge.co.uk/w2ht9vrl*` → this Worker  

Set `ORIGIN_BASE` to your GitHub Pages origin (see `wrangler.toml`) so the Worker does not loop on the custom domain.

---

## Optional client-side gate (off by default)

With Cloudflare Access live, preview builds set `VITE_CLIENT_ACCESS_GATE=0` so there is **only** the Cloudflare login.

To force the old in-app form (e.g. local Vite without Access), set `VITE_CLIENT_ACCESS_GATE=1`. That mode still ships password hashes in JS — use only as a temporary deterrent. Credentials file: `ACCESS-CREDENTIALS.local.md` (gitignored).

---

## Approved builds

No Access required on approved/live placeholders. When a governance-approved app is published to those URLs later, keep them open (or use separate Trust SSO if WMAS requires it then).
