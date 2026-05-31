# Resusci-Time — version comparison

**App version:** 1.1.1 (see `package.json`)

This document compares **preview (test) builds** vs **live (production) builds**, and **WMAS** vs **Standard** trust variants. All four combinations use the same React codebase; differences come from build-time trust config and the `live` vs `preview` channel.

---

## Quick reference

| Variant | Channel | Typical use | Public URL path |
|--------|---------|-------------|-----------------|
| Standard | Live | General / public deployment | `/standard/` |
| Standard | Preview | Internal testing only | `/standard-preview/` |
| WMAS | Live | West Midlands crews (production) | `/7kpm3xnq/` (unlisted) |
| WMAS | Preview | WMAS internal / dev testing | `/w2ht9vrl/` (unlisted) |

Production base: [https://resusci-time.adminforge.co.uk/](https://resusci-time.adminforge.co.uk/)

Slugs are defined in `src/config/trust-manifest.json`. Run `npm run trust:paths` to print full URLs after slug changes.

---

## Preview (test) vs live (production)

Preview and live builds for the **same trust** share the same clinical rules and trust-specific features. Preview is for training and internal validation **only** — not for patient contact.

### Preview-only (all trusts)

| Feature | Description |
|--------|-------------|
| **Startup warning modal** | On first open per browser tab: states this is the development preview, not for field use, may contain errors. Must acknowledge to continue. |
| **“DEMO” app icons** | Distinct favicon / PWA icons (`preview-icons/`) so preview installs are visually different from live. |
| **Page title suffix** | Header shows e.g. `Resusci-Time - WMAS version (Preview)`. |
| **Preview speed control** | Header dropdown: 1×, 2×, 4×, 5×, 10× protocol speed (default **4×**). Persisted in `localStorage`. Changing mid-case prompts to reset the case. Elapsed timer still shows **real protocol time** (e.g. 2:00 at 4× = 8 minutes protocol). |
| **Jump to 44:00** | Dev shortcut in header to jump near the 45-minute TOR point. |
| **Separate PWA install** | Install prompt / storage key includes `-preview` so preview and live can coexist on one device. |
| **Unlisted preview URL** | Deployed under the trust’s `previewSlug` (or `standard-preview`), not linked from the public home page. |
| **Preview changelog** | About → *What's new in this preview* (from `TESTING-CHANGELOG.md`). |

### Live-only (all trusts)

| Feature | Description |
|--------|-------------|
| **Real-time protocol** | Rhythm checks, drug intervals, 45-minute review, VOD wait, etc. run at **1×** speed only. |
| **Production icons & branding** | Standard favicon / PWA icons (no DEMO badge). |
| **No preview speed or jump controls** | Header test controls hidden. |
| **No startup preview warning** | — |

### Same on preview and live (for a given trust)

- Full resuscitation protocol, timer, Rx, interventions, event log, TOR flow, ROSC monitoring, initial assessment / VOD paths, saved logs, share/export, metronome, etc.
- All **trust-specific** features for that trust (see below) — e.g. WMAS CODE SHOCK and WMAS prolonged-VF TOR rules apply on **both** WMAS live and WMAS preview.

---

## Trust comparison (WMAS vs Standard)

### Branding & deployment

| | Standard | WMAS |
|---|----------|------|
| **Header label** | `Resusci-Time - Standard version` | `Resusci-Time - WMAS version` |
| **Background crest** | Generic Resusci-Time logo | WMAS crest |
| **Listed on public home page** | Yes | No (unlisted slug) |
| **Blog link** | `?trust=standard` | `?trust=wmas` |

### Trust-specific clinical / UI features

| Feature | Standard | WMAS |
|--------|:--------:|:----:|
| **CODE SHOCK reminder** | No | **Yes** — after **1st shock**, panel + log `CODE SHOCK notified to EOC` |
| **Prolonged VF — in-case reminder** | Yes (3 consecutive shockable rhythms) | Yes |
| **Prolonged VF — TOR impact** | No — normal TOR questionnaire | **Yes** — if prolonged VF logged, TOR shows **senior clinical discussion only** (skips special circumstances, rhythm, PEA questions) |
| **WMAS ToR criteria document** | No | **Yes** — in Documents |

Config source: `src/config/trusts/wmas.ts`, `standard.ts`.

---

## Shared across all builds (all trusts, live and preview)

These behaviours are **not** trust-specific unless noted above.

### Resuscitation core

- Initial assessment (DNACPR, obviously deceased, futility, etc.) with 5-minute asystole observation (hypostasis / rigor mortis) — grey countdown timer, checklist, VOD
- Quality checklist including **Request additional resources (if required)**
- Rhythm checks every 2 minutes, shock logging, vector-change reminder every 3rd consecutive shock
- Adrenaline / amiodarone Rx panel with interval countdown
- **First adrenaline dose** → prompts to **establish vascular access** if IV/IO not yet logged
- Interventions (vascular access, airway, breathing incl. **needle decompression**, circulation, medications)
- Early transfer reminder (VF/pVT or PEA paths)
- ROSC mode, post-ROSC checklist and monitoring reminders
- Metronome (100 bpm), wake lock during active case

### Termination of resuscitation (TOR)

- **Manual TOR** (timer bar): requires initial rhythm logged; runs **initial assessment re-visit** first, then termination review
- **45-minute TOR**: goes straight to termination review (no re-assessment)
- **Special circumstances** (all trusts): hypothermia, overdose/poisoning, pregnancy — before rhythm selection at TOR
- Rhythm-based guidance, PEA cessation criteria, end / continue / seek senior advice
- **Senior clinical discussion** panel in timer bar after “Seek senior clinical advice” (continue vs terminate)
- Post-TOR **5-minute VOD wait** → then **“Resuscitation not appropriate”** + VOD button; criteria timestamps aligned right in summary

### Prolonged VF (all trusts during resuscitation)

- Triggers at **≥3 consecutive shockable rhythms**
- Logs `Prolonged VF` and shows amber acknowledgement panel  
- **Only WMAS** additionally gates TOR (see trust table)

### Logging & tools

- Event log with autosave, device saved logs, PDF/share, QR share (trust-tagged)
- About modal, day/night theme, Documents

---

## Local development vs deployed builds

| Command | Trust | Channel | Timing |
|---------|-------|---------|--------|
| `npm run dev:standard` | Standard | live config | Real-time (`VITE_TIME_SCALE=1`) |
| `npm run dev:wmas` | WMAS | live config | Real-time |
| `npm run dev:*-preview` | As named | **preview** | Preview speed UI; build default scale 0.25 until user picks speed |
| `npm run dev` (default) | WMAS | live | Accelerated (`.env.development` uses 0.25 scale) — **not** identical to production WMAS live |

Use **`dev:*-preview`** or a built preview URL to match deployed preview behaviour. Use **`dev:wmas`** / **`dev:standard`** to match each trust’s **live** production build.

---

## What is *not* in this matrix

- **`standalone/index.html`** — legacy single-file prototype; partially maintained, not the primary deploy target for trust builds.

---

## Summary

| Question | Answer |
|----------|--------|
| Is preview “different protocol”? | Same rules as live for that trust; preview adds speed tools, DEMO icons, warnings, and preview changelog. |
| Which build for field use? | **Live** only (`/standard/`, `/7kpm3xnq/`). |
| Main WMAS vs Standard? | CODE SHOCK, prolonged-VF TOR gate, WMAS ToR criteria document. |
| Public vs trust builds? | **Standard live** is the public listing; WMAS live URL is unlisted. |

For deploy URLs and local commands, see [LOCAL-DEV.md](./LOCAL-DEV.md).
