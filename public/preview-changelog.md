# Preview build — what’s new

Features below are on **preview URLs only** (DEMO icons, speed controls, startup warning). They are **not** on live field builds until merged to production. Published announcements appear on the [blog](/blog/) after release.

**App version:** 1.2.1 (preview) · **Last updated:** 2 June 2026

---

## Version 1.2.1 · 2 June 2026

### Transfer case — checks due soon

- Tapping **Transfer case** when a **rhythm check** or **repeat adrenaline** is due within a minute shows a warning listing what is imminent. Choose **Stay on this case — finish checks first** or **Transfer anyway**.

### Post-ROSC — return to cardiac arrest

- During post-ROSC care, a red **Cardiac arrest** button in the timer bar logs the event, returns to arrest mode, and opens an immediate rhythm check. The 2-minute rhythm check timer restarts after the rhythm is logged.

### Bug fixes

- Post-ROSC **SBP** and **pulse** reminders: correct labels, colours, and logging (adequate vs inadequate were reversed); pulse waits until SBP is answered.
- **Sustained ROSC** (more than 10 minutes): timer and log entry during post-ROSC care; on-screen alert with senior-discussion notice; termination requires senior clinical discussion before proceeding (same pattern as prolonged VF/pVT).
- **Early transfer** reminder suppressed after ROSC and re-arrest.
- UI copy uses plain words instead of `<` / `>` symbols.

---

## Version 1.2.0 · 2 June 2026

### Transfer case to another device

- **Transfer case** (header, during active resuscitation) **pauses the timer** and shows a **QR code** for the other device to scan.
- The receiving device opens the handoff and prompts **Take over case** (with a warning if a case is already in progress).
- Tap **Case transferred** once the other device has taken over — the sending device becomes **read-only** and the log closes.
- Tap **Resume case** to cancel the transfer and resume the timer on this device.
- **Case transferred** banner clears when you start a new case or return to the start screen; **Start new case on this device** on the banner clears read-only state locally.
- Case data is encoded in the QR only — **nothing is stored on a server**.
- Very long cases may exceed QR capacity; the modal warns you to continue on this device instead.

---

## Version 1.1.2 · 2 June 2026

### Clinical alerts

- Panel alerts are shown **one at a time** in priority order (rhythm check and shockable-rhythm prompts first).
- Drug-related prompts (e.g. adrenaline due) stay in the **timer bar**, not the alert panel.
- **Vascular access** reminder is prioritised when adrenaline is logged without IV/IO established.

### Saved logs & case recovery

- Logs are **saved automatically** to this device as you work — no manual Save button.
- If you return after a refresh or close, the autosaved case offers **View log** (read-only) rather than loading an old log for editing.
- **Start protocol** within **10 minutes** of the last log entry: choose **New case** or **Continue previous case**.
- After **Verification of death** is recorded, **no further log entries** can be added.
- **Saved logs**: delete individual logs, or use checkboxes to **delete multiple** at once.

### Icons

- Preview builds use **DEMO** favicon and PWA icons (distinct from live field builds).
- WMAS live builds use trust-specific icons when deployed to production; WMAS preview still uses DEMO icons.

### Preview startup warning

- **Not for clinical use** warning modal appears on every preview page load.

---

## Version 1.1.1 · 31 May 2026

### Documents

- **Documents** button in the header (replaces the old ALS link under the subtitle).
- Opens protocol reference images in a modal. Rhythm-check alerts still appear **above** an open document.
- All trusts: **Advanced Life Support (ALS) algorithm**.

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

### WMAS preview only

#### CODE SHOCK — after first shock

- Reminder appears after the **first logged shock** (was third on older live builds).
- Message: **CODE SHOCK notified to EOC** — acknowledge to log.

#### Prolonged VF at TOR

- If prolonged VF was logged, TOR shows **senior clinical discussion** first (skips special-circumstances / rhythm / PEA until senior advice flow completed).

#### Documents — WMAS ToR criteria

- Extra document in **Documents**: **WMAS ToR criteria** (ALS bag aide memoire).

### Standard preview only

- Shared changes above only — no CODE SHOCK, no WMAS ToR document.

---

## Version 1.1.1 · 30 May 2026

### Prolonged VF reminder

- After **three consecutive shockable rhythms**, an amber panel appears; acknowledge to log `Prolonged VF`.

### DEMO favicon / PWA icons

- Preview builds generate distinct DEMO icons for the home screen and browser tab.

---

## Version 1.1.1 · 28 May 2026

### Preview speed controls

- Preview speed control (1×–10×) and **Jump to 44:00** shortcut in the header during an active case.
