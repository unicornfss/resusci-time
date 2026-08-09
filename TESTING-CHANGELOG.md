# Preview build — what’s new

Features below are on the **WMAS preview** (DEMO icons, speed controls, startup warning, signed-in access). They are **not** on a governance-approved staff release. A public blog is not published; use this list and **About → What’s new in this preview**.

**Focus:** Resusci-Time is being developed for **West Midlands Ambulance Service** only at this time. Builds or configuration for other trusts, and a public Standard channel, are **not under active consideration**.

**App version:** 1.3.0 (preview) · **Last updated:** 9 August 2026

---

## Version 1.3.0 · 9 August 2026

### Governance posture (WMAS)

- Public site is **WMAS-focused**. The only working app is the **WMAS preview** (simulation / internal testing).
- Addresses reserved for an **approved** live build show a **placeholder** only — they do not run a clinical app yet.
- Product chrome uses **Resusci-Time** / **Resusci-Time (Preview)** (no separate “WMAS version” label in the header).

### Access control (preview)

- **Cloudflare Access** (email one-time PIN to allow-listed addresses, typically `@wmas.nhs.uk`) protects `/w2ht9vrl*` before the app loads. There is no in-app login. Setup notes: `docs/PREVIEW-ACCESS.md`.
- Public **Request preview access** page at `/request-access/` embeds a Microsoft Form (does not grant access automatically).
- Contact email in About: **jon.ostrowski@wmas.nhs.uk**.
- **Acknowledgements** page is prepared but **hidden** from the site until approved (flip `SHOW_ACKNOWLEDGEMENTS` in `src/acknowledgementsContent.ts`).

### Blog

- Public **blog** is **not shown**. Preview changes are listed here and in-app under About.

### Earlier preview work retained (from 1.2.8)

- Timer bar: next rhythm check prominent; ROSC confirmation and 2-minute reset; Continuing ROSC option; menu above timer; mobile ROSC layout; Cardiac Arrest Checklist document.
- Touch phones/tablets in landscape show a **rotate to portrait** hint (dismissible; hides when upright).

---

## Version 1.2.8 · 21 July 2026

### Timer bar — rhythm check first

- **Next rhythm check** (countdown and progress bar) sits at the **top** of the timer bar during resuscitation; **elapsed time** and **total shocks** move below in a smaller size.
- The progress bar sits **under** the “Next rhythm check” label and countdown, spanning their combined width.
- **Mobile / ROSC:** timer-bar action buttons stack full-width on phones so they no longer crush into half the screen during post-ROSC care.

### ROSC

- Tapping the green **ROSC** button asks for **confirmation** before switching to post-ROSC care.
- Entering ROSC **resets the next rhythm check timer to 2 minutes** (instead of continuing the previous countdown).
- During post-ROSC care, the rhythm assessment modal lists **Continuing ROSC** as the **top** option (cardiac arrest views still show **ROSC** at the bottom).

### Menu and alerts

- The header **Menu** panel appears **above** the sticky timer bar so all items stay tappable.
- If a clinical alert (for example rhythm check) appears while the menu is open, the **menu closes** so the alert is not blocked.

### Documents

- **Cardiac Arrest Checklist** added under **Menu → Documents** (PDF).

---

## Version 1.2.7 · 10 June 2026

### Mobile and small screens

- **Timer bar** reflows on phones: elapsed time, rhythm-check countdown, then action buttons — no overlap on narrow screens.
- **Scroll for checklist** hint at the bottom of the screen when the quality checklist is below the fold (phones only; iPad-sized layouts unchanged).

### Case continuation

- Continue-case prompt only if the **last log entry** was within **10 protocol minutes** (preview speed is taken into account).
- No continuation offer after **patient handed over**; start-screen and modal text refer to last log entry time, not autosave time.

### Configuration

- WMAS features include CODE SHOCK and prolonged VF at TOR; **Transfer case** (QR handoff) is available in this preview.

---

## Version 1.2.6 · 9 June 2026

### Case transfer

- **Transfer case** (header button, QR handoff to another Resusci-Time device, receive-via-scan) is available in this WMAS preview.
- **Patient handed over** remains on the timer bar for handover when the receiving crew is **not** continuing on Resusci-Time.

---

## Version 1.2.5 · 9 June 2026

### Metronome — ROSC and re-arrest

- Metronome **stops immediately** when the patient ROSCs (timer bar or rhythm check).
- **Toggle state is remembered** — if metronome was on at ROSC, it **starts again automatically** when the patient returns to cardiac arrest.
- Turning metronome off during post-ROSC care keeps it off after re-arrest.

### Build / deploy

- **What’s new** changelog is synced before preview builds.
- Public home page version label uses the **live (`main`) version** when deploying from `testing` — preview can be ahead without changing the landing-page number.

---

## Version 1.2.4 · 7 June 2026

### Preview debug logging

- **Menu → Export debug report** (preview builds and local dev) downloads a JSON file with app version, session timeline, active alerts, case snapshot, and event log entries.
- Automatic capture of step changes, log entries, major actions, and JavaScript errors during the session.
- Hidden test trigger for reviewers: **Interventions → Medications → Other** → enter `crashme` and tap **Log** (records a test error in the debug report; does not add to the event log).

---

## Version 1.2.3 · 6 June 2026

### Patient handed over

- **Patient handed over** button on the cardiac arrest and post-ROSC timer bars.
- Confirmation modal: for handover to hospital or another provider **not** using Resusci-Time; confirms that all timers stop and logging ends on this device.
- Reminds crews to use **Transfer case** instead when handing to another Resusci-Time crew; **Transfer case** button in the modal when a case is active.
- After confirmation, opens the **event log** directly; case becomes read-only with a banner to start a new case.

### Timer bar

- Top row: **ROSC** / **Cardiac arrest**, **TOR**, **Patient handed over**; second row: rhythm check, **Interventions**, **Metronome**.
- Distinct colour per timer-bar action; metronome label **Turn on metronome** / **Turn off metronome**.
- Post-ROSC: **Transient ROSC** / **Sustained ROSC** shown in the timer label (not a separate line that shifts layout).
- Post-ROSC **Atropine Rx** section only after the first atropine dose is logged.
- Removed redundant **minutes** count beside elapsed time on cardiac arrest (fixed overlap with **Total shocks**).

### Header

- **Menu** (hamburger) holds About, Documents, Saved logs, Acknowledgements, and Install app.
- During an active case, only **Transfer case** and **Night mode** stay visible in the header; preview test controls move into the menu.

### About & acknowledgements

- **About** — developer credit, clinical basis, and contact details refined.
- **Acknowledgements** (menu and footer) — clinical reviewers named; clinical content based on published RCUK / JRCALC / AACE guidance (independent app; not endorsed by those bodies).

---

## Version 1.2.2 · 4 June 2026

### CODE SHOCK (WMAS guidance)

- Reminder rules updated to match **WMAS** guidance: after the **first shock**, only when **initial rhythm was VF / pVT** (the reminder will now **not** appear when a shock is delivered where the initial rhythm **was not** VF / pVT).

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

- Preview builds use **DEMO** favicon and PWA icons (distinct from any future approved build).

### Preview startup warning

- **Not for clinical use** warning modal appears on every preview page load.

---

## Version 1.1.1 · 31 May 2026

### Documents

- **Documents** button in the header (replaces the old ALS link under the subtitle).
- Opens protocol reference images in a modal. Rhythm-check alerts still appear **above** an open document.
- Includes **Advanced Life Support (ALS) algorithm** and **WMAS ToR criteria** (ALS bag aide memoire).

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

### CODE SHOCK — after first shock (VF / pVT initial rhythm)

- Reminder appears after the **first logged shock** when **initial rhythm was VF / pVT** (was third shock on older builds; see **1.2.2** for the initial-rhythm rule).
- Message: **CODE SHOCK notified to EOC** — acknowledge to log.

### Prolonged VF at TOR

- If prolonged VF was logged, TOR shows **senior clinical discussion** first (skips special-circumstances / rhythm / PEA until senior advice flow completed).

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
