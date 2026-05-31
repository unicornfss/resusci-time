# Preview build — what’s new

Features below are on **preview URLs only** (DEMO icons, speed controls, startup warning). They are **not** on live field builds until merged to production. Published announcements appear on the [blog](/blog/) after release.

**App version:** 1.1.1 (preview) · **Last updated:** 31 May 2026

---

## For maintainers

Update this file on the **`testing`** branch as features land. When merging to **`main`**, publish crew-facing **blog posts** and trim or reset this list for the next preview cycle.

---

## All preview builds (Standard & WMAS)

### Documents

- **Documents** button in the header (replaces the old ALS link under the subtitle).
- Opens protocol reference images in a modal. Rhythm-check alerts still appear **above** an open document.
- All trusts: **Advanced Life Support (ALS) algorithm**.

### Prolonged VF reminder

- After **three consecutive shockable rhythms**, an amber panel appears; acknowledge to log `Prolonged VF`.

### Termination of resuscitation (TOR)

- **Manual TOR** requires initial rhythm logged; runs initial assessment re-visit first, then termination review.
- **Special circumstances** question at TOR (hypothermia, overdose/poisoning, pregnancy).
- Refined **senior clinical discussion** flow in the timer bar.

### Initial assessment & VoD

- 5-minute asystole observation: grey countdown, checklist locked until timer ends.
- Criteria logged when observation **starts**; VoD time when **VOD** is pressed.
- Post-TOR wait at 0:00 shows **Resuscitation not appropriate**; VOD button remains.

### Interventions

- **First adrenaline dose** prompts vascular access if IV/IO not logged.
- **Needle decompression** under Interventions → Breathing.

### Preview-only UI

- Startup warning modal (not for field use).
- DEMO favicon / PWA icons.
- Preview speed control (1×–10×) and jump to 44:00 shortcut.

---

## WMAS preview only

### CODE SHOCK — after first shock

- Reminder appears after the **first logged shock** (was third on older live builds).
- Message: **CODE SHOCK notified to EOC** — acknowledge to log.

### Prolonged VF at TOR

- If prolonged VF was logged, TOR shows **senior clinical discussion** first (skips special-circumstances / rhythm / PEA until senior advice flow completed).

### Documents — WMAS ToR criteria

- Extra document in **Documents**: **WMAS ToR criteria** (ALS bag aide memoire).

---

## Standard preview only

- Shared changes above only — no CODE SHOCK, no WMAS ToR document.
