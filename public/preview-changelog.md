# Preview build — what’s new

Features below are on **preview URLs only** (DEMO icons, speed controls, startup warning, sign-in). They are **not** on live field builds until merged to production. Published announcements appear on the [blog](/blog/) after release.

**App version:** 1.3.0 (preview) · **Last updated:** 9 August 2026

---

## Version 1.3.0 · 9 August 2026

### Governance posture (WMAS-only for now)

- **Standard** and **custom / multi-organisation** supply are **closed** on the public site. Resusci-Time is treated as a **West Midlands Ambulance Service** tool while Trust governance and the medical-device route are decided.
- This does **not** permanently rule out a Standard or other-trust build later if the WMAS path proves successful — it means they are **not actively considered** for the foreseeable future.
- **Approved** URLs (`/standard/`, WMAS live slug) now show a **placeholder**: reserved for a future governance-approved release. The working app is the **preview** channel only.
- Product chrome no longer says “WMAS version” in the page header/title (single product naming: **Resusci-Time** / **Resusci-Time (Preview)**).

### Access control (preview)

- Preview builds require **username and password** before use (session lasts until the browser tab is closed).
- Intended for working-group simulation and internal review — not a substitute for full server-side authentication on static hosting.

### Earlier preview work retained (from 1.2.8)

- Timer bar: next rhythm check prominent; ROSC confirmation and 2-minute reset; Continuing ROSC option; menu above timer; mobile ROSC layout; Cardiac Arrest Checklist document.

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

### WMAS documents

- **WMAS only:** **Cardiac Arrest Checklist** added under **Menu → Documents** (PDF). Not shown on Standard.

---

## Version 1.2.7 · 10 June 2026

### Mobile and small screens

- **Timer bar** reflows on phones: elapsed time, rhythm-check countdown, then action buttons — no overlap on narrow screens.
- **Scroll for checklist** hint at the bottom of the screen when the quality checklist is below the fold (phones only; iPad-sized layouts unchanged).

### Case continuation

- Continue-case prompt only if the **last log entry** was within **10 protocol minutes** (preview speed is taken into account).
- No continuation offer after **patient handed over**; start-screen and modal text refer to last log entry time, not autosave time.

### Trust builds

- **Standard** patient handover modal no longer mentions Resusci-Time transfer (that note remains on custom builds with case transfer).
- WMAS trust config simplified (`codeShock: true`, `prolongedVfTorGate: true`); case transfer enabled for non-Standard builds by default.

---

## Version 1.2.6 · 9 June 2026

### Trust builds — case transfer

- **Transfer case** (header button, QR handoff to another Resusci-Time device, receive-via-scan) is **enabled on WMAS** and other custom trust builds only.
- **Standard** build keeps **Patient handed over** on the timer bar; it no longer offers QR case transfer between devices.
- Custom trust builds get case transfer by default; set `caseTransfer: false` in trust config to disable.

---

## Version 1.2.5 · 9 June 2026

### Metronome — ROSC and re-arrest

- Metronome **stops immediately** when the patient ROSCs (timer bar or rhythm check).
- **Toggle state is remembered** — if metronome was on at ROSC, it **starts again automatically** when the patient returns to cardiac arrest.
- Turning metronome off during post-ROSC care keeps it off after re-arrest.

### Build / deploy

- **What’s new** changelog is synced before preview builds (fixes stale 1.2.4 text when the app footer already shows a newer version).
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
- **Acknowledgements** (menu and footer) — thanks to clinical reviewers and to RCUK, JRCALC, and AACE as published guidance sources (independent app; not endorsed by those bodies).

---

## Version 1.2.2 · 4 June 2026

### WMAS — CODE SHOCK (WMAS guidance)

- Reminder rules updated to match **WMAS** guidance: after the **first shock**, only when **initial rhythm was VF / pVT** (the reminder will now **not** appear when a shock is delivered where the initial rhythm **was not** VF / pVT).

### Bug fixes

- **WMAS:** CODE SHOCK blog banner — subtitle lines centred with the “CODE SHOCK” headline.

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

#### CODE SHOCK — after first shock (VF / pVT initial rhythm)

- Reminder appears after the **first logged shock** when **initial rhythm was VF / pVT** (was third shock on older live builds; see **1.2.2** for the initial-rhythm rule).
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
