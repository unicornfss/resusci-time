# Testing → main merge summary

**App version:** 1.1.0  
**Branches:** `testing` → `main`  
**Commits included:** 2 (`d1af346`, `295cedf`)

This document describes **what crews and deployers will notice** after merging `testing` into `main` and deploying production (**live**) builds. Preview-only changes are listed separately at the end.

For ongoing trust/build comparisons, see [VERSION-COMPARISON.md](./VERSION-COMPARISON.md).

---

## All live builds (Standard & WMAS)

### Documents (new)

- The inline **Advanced Life Support (ALS) algorithm** link under the page subtitle has been **removed**.
- A **Documents** button now sits in the header toolbar (with About and Saved logs).
- Tapping **Documents** opens a modal listing protocol reference images.
- **All trusts** see: *Advanced Life Support (ALS) algorithm*.
- Documents open in a wide modal viewer; the **rhythm-check alert still appears above** an open document if a check is due.

### Prolonged VF — in-case reminder (new)

- If **three consecutive shockable rhythms** are logged during resuscitation, an amber panel appears:
  - *This patient has experienced at least one episode of prolonged VF…*
- Crew must **Acknowledge**; `Prolonged VF` is added to the event log.
- The panel auto-scrolls into view below the sticky timer bar (same behaviour as other reminders).

### Termination of resuscitation (TOR) — changes

| Area | Before (main) | After (testing) |
|------|---------------|-----------------|
| **Manual TOR** (timer bar) | Went straight to termination review | Requires **initial rhythm** to be logged first (fixes blank screen). Runs **initial assessment re-visit**, then termination review. Logs `TOR reassessment started`. |
| **45-minute TOR** | Straight to termination review | Unchanged — still goes directly to review (no re-assessment). |
| **Special circumstances** | Not asked | At TOR, crews are asked whether **hypothermia, overdose/poisoning, or pregnancy** may apply, before rhythm-based questions. Yes/No is logged. |
| **Senior clinical discussion** | Panel existed | Timer-bar **Clinical discussion** section refined; continue vs terminate flows and styling updated. |

### Initial assessment & verification of death (VOD)

- **5-minute asystole observation** (hypostasis / rigor mortis): grey countdown box with progress bar (matches main timer styling). Assessment menu hidden during countdown; checklist visible but **not tappable** until the timer expires.
- **Criteria timestamps:** logged when the **5-minute observation starts** (not when it finishes).
- **VOD timestamp:** logged when the **VOD button** is pressed.
- **VOD summary layout:** criterion and VOD times aligned to the **right**, consistent with criteria rows.

### Post-TOR VOD wait

- When the 5-minute post-TOR countdown reaches **0:00**, the display shows **“Resuscitation not appropriate”** instead of a continuing countdown. The **VOD** button remains available.

### Medications & interventions

- **Vascular access prompt:** appears when the **first adrenaline dose** is logged if IV/IO access has not yet been recorded (previously only triggered on the first medication of any type).
- **Needle decompression** added to **Interventions → Breathing** options.

### Reminders & UI polish

- Early transfer, CODE SHOCK (WMAS), prolonged VF, and vascular-access reminders **auto-scroll** into view when they appear, with scroll margin so they sit below the sticky timer bar.
- **Live app icons** refreshed (favicon / PWA sizes regenerated).
- Service worker cache bumped (`resusci-time-v4`) and preview icon paths added to precache list.

---

## WMAS live only

### CODE SHOCK — timing change

| | Before (main) | After (testing) |
|---|---------------|-----------------|
| **When it appears** | After the **3rd** logged shock | After the **1st** logged shock |
| **Message** | `CODE SHOCK notified to EOC` | Unchanged |
| **Acknowledge** | Logs same line to event log | Unchanged |

### Prolonged VF — TOR gate (new)

- If **Prolonged VF** was logged during the case, **termination review** shows only the **senior clinical discussion** message.
- Skips special-circumstances, rhythm selection, and PEA cessation questions until senior advice has been sought via the timer-bar flow.

### Documents — WMAS ToR criteria (new)

- WMAS builds also list **WMAS ToR criteria** in Documents (reference JPG from the ALS bag aide memoire).
- **Not shown** on Standard builds.

---

## Standard live

- No trust-specific clinical rules beyond the **shared** changes above.
- Standard uses the generic logo.

---

## Preview builds only (not on live production URLs)

These apply to `*-preview` deployments and `npm run dev:*-preview`. **Live field builds are unaffected.**

| Feature | Description |
|--------|-------------|
| **Startup warning modal** | First open per browser tab: states this is a development preview, not for field use. Must acknowledge to continue (session dismiss). |
| **DEMO app icons** | Separate favicon / PWA icon set under `preview-icons/` so installed preview apps look different from live. |
| **Preview speed control** | Header dropdown 1×–10× (default 4×); changing mid-case prompts reset. |
| **Jump to 44:00** | Dev shortcut near the 45-minute TOR point. |
| **TOR button guard** | Manual TOR disabled until initial rhythm is logged (same rule as live, but paired with preview tooling). |

---

## Blog & project documentation

- WMAS blog post updated: [CODE SHOCK reminder for WMAS crews](./blog/posts/2026-05-26-wmas-code-shock-reminder.md) — now documents **first shock** trigger and new banner image.
- **[VERSION-COMPARISON.md](./VERSION-COMPARISON.md)** — preview vs live and WMAS / Standard matrix.
- Script added: `scripts/compose-code-shock-image.mjs` (blog graphic maintenance; not used at runtime).

---

## Deploy checklist (after merge)

1. Merge `testing` → `main` and push.
2. Run production build/deploy pipeline (live trust builds).
3. Crews on **installed PWAs** may need to refresh or reinstall once to pick up the service worker and icon updates.
4. Confirm WMAS live URL shows **Documents** with both ALS algorithm and **WMAS ToR criteria**.
5. Confirm **CODE SHOCK** appears after **one** shock on WMAS (not three).

---

## Quick “what changed for me?”

| Role / build | Headline changes |
|--------------|------------------|
| **Any live crew** | Documents button; prolonged VF reminder; richer TOR flow; VOD/observation UX; first-adrenaline vascular prompt; needle decompression |
| **WMAS live crew** | Above + CODE SHOCK after **1st** shock; prolonged VF gates TOR; WMAS ToR criteria document |
| **Standard live** | Shared changes only; no CODE SHOCK, no WMAS ToR doc |
| **Preview / training** | Above trust rules + preview warning, DEMO icons, speed controls |

---

*Generated for the testing → main merge. For local commands and URLs, see [LOCAL-DEV.md](./LOCAL-DEV.md).*
