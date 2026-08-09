# Securing the Resusci-Time preview (testing builds)

Approved / live URLs stay lightly gated (placeholder pages). **Preview** (`/w2ht9vrl/`) must not ship the app JS to the public internet without real authentication.

There is **no** in-app username/password gate. Preview protection is edge-only (Cloudflare Access before HTML/JS is served).

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

Use `/request-access/` on the site. It embeds the Microsoft Form
[https://forms.cloud.microsoft/e/R54hJjwT9m](https://forms.cloud.microsoft/e/R54hJjwT9m)
(with a link fallback). Requests are reviewed before anyone is added to Cloudflare Access.

Built-in Forms email alerts are usually only a short “new response” notice with a link — not the full answers. To get the whole submission in email, use **Power Automate** (When a new response is submitted → Get response details → Send an email with the fields in the body).

### After Access is live

1. Open https://resusci-time.adminforge.co.uk/w2ht9vrl/ in a private window — you should hit Cloudflare’s login.
2. Tell the group they will get an email code (or IdP login). They do not need a Cloudflare account.

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

## Approved builds

No Access required on approved/live placeholders. When a governance-approved app is published to those URLs later, keep them open (or use separate Trust SSO if WMAS requires it then).
