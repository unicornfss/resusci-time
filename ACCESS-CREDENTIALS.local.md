# Resusci-Time preview access (LOCAL ONLY — do not commit)

## Live preview (public URL)

Protected by **Cloudflare Access** (email one-time PIN). Same link as before:

https://resusci-time.adminforge.co.uk/w2ht9vrl/

Users do **not** need a Cloudflare account. Add/remove emails in Zero Trust →
Access controls → Applications → resusci-time → Working group policy.

Session length is set in that Cloudflare policy (currently **24 hours** unless you changed it).

The in-app username/password screen is disabled.

## Optional local-only in-app gate

Only if you set `VITE_CLIENT_ACCESS_GATE=1` for local Vite without Access.
Hashes live in `src/accessControl.ts` (weak — do not rely on for the public URL).

| Username       | Password     | Intended use                          |
| -------------- | ------------ | ------------------------------------- |
| jon            | Rt-cysGl4c   | Developer (Jon Ostrowski)             |
| laurence       | Rt-Ks2TRME   | Service lead / working group          |
| reviewer       | Rt-efZ5GKs   | Clinical reviewer                     |
| workinggroup   | Rt-FhKkFRc   | Shared working-group account          |
