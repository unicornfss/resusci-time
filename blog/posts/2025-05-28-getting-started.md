---
title: Getting started with Resusci-Time
date: 2025-05-28
category: guide
audience: all
summary: Preview build — day-to-day use for simulation and internal testing.
---

This guide covers the basics for crews using Resusci-Time on a phone or tablet.

![Resusci-Time logo](../images/resusci-time-logo.png)

Resusci-Time is based on the **Spring 2026 JRCALC / AACE adult resuscitation and verification of death guidelines**. It is **not intended to replace clinical knowledge and skill** — it is a support tool only. Mistakes may be present; any identified errors will be corrected as soon as possible.

**Current status:** the public site offers the **WMAS preview** for **simulation and internal testing only**. A governance-approved live build is not published yet — the approved URL shows a placeholder until Trust governance signs off.

## 1. Open the WMAS preview

Open [Resusci-Time (preview)](../../w2ht9vrl/) from the [home page](../../) and bookmark the URL so you can open it quickly from the home screen.

Sign in with the credentials issued to you, then acknowledge the preview warning: this build may contain **unapproved** changes and must **not** be used for real patient contact.

## 2. What this build includes

The WMAS preview provides the full core arrest workflow, plus WMAS-specific reminders where configured (for example CODE SHOCK and prolonged VF TOR gating).

**Timer and protocol**

- Elapsed timer with rhythm-check, adrenaline, and amiodarone reminders
- Shockable rhythm flow with energy selection and shock logging
- Non-shockable rhythm support (PEA / asystole)
- Reversible causes checklist (4 Hs and 4 Ts)
- Early transfer and vector-change prompts where applicable

**Interventions menu**

| Section | Options |
| --- | --- |
| Vascular access | IO or IV (22g–14g) |
| Airway | Head tilt / jaw thrust, OPA, NPA, SGA (i-gel), ET, Needle cric., Suction, Tracheostomy |
| Breathing | BVM, Mechanical vent. (logs oxygen automatically) |
| Circulation | Thoracotomy, Mechanical compressions |
| Medications | Sodium chloride (flush / 250 ml / 500 ml), 10% glucose, Naloxone, plus free-text **Other** |

Saved “Other” entries reappear for quick re-use during the same case.

**End of case**

- **ROSC** — post-ROSC monitoring reminders
- **Termination of resuscitation (TOR)** — structured review
- **Verification of death (VoD)** — separate flow with observation criteria where applicable

**Event log**

- Timestamped log of actions
- **Export** to CSV or PDF
- **Share** via link or QR code
- **Save on device** for later review
- Autosave offers to restore an interrupted case

**App features**

- Install as an app (PWA) on supported phones and tablets
- **Screen stays awake during a case** — while the timer is running, the app tries to prevent the display sleeping (works best in Chrome / Edge; allow if prompted)
- Day / night theme
- Works offline after first load
- Preview-only: speed controls and DEMO icons for testing

## 3. Install on your device (optional)

On **Chrome** or **Edge**, use **Install app** (or **Add to Home screen** on mobile). The timer then opens full-screen like a native app. You need **HTTPS** — the published preview URL or a local preview build.

## 4. Start a case

1. Confirm **patient details** if prompted.
2. Select the **initial rhythm** (VF/pVT, PEA, or Asystole).
3. The **timer bar** shows next rhythm check, elapsed time, and upcoming actions.

Tap buttons on the timer bar when you complete actions — they are logged with a timestamp.

## 5. During the arrest

- **Rhythm checks** — log each check; the app tracks the 2-minute cycle.
- **Shocks** — for shockable rhythms, use the shock panel and energy selection.
- **Reversible causes** — open the 4 Hs and 4 Ts checklist; tick causes as you address them (you can untick if needed).
- **Interventions** — open the menu for vascular access, airway, breathing, circulation, and medications.

## 6. ROSC, termination, or VoD

See **End of case** above. Follow the on-screen flow that matches your clinical decision.

## 7. After the case

Use the **event log** panel to export, share, or save the record. Autosave keeps a draft on the device if you leave mid-case — you will be offered a restore when you return.

When you are finished, tap **New case** to clear the timer and log. If entries exist, the app asks you to confirm first so nothing is wiped by accident.

## Tips

- Run through a **training / simulation case** before relying on the tool in any operational discussion.
- Keep screen brightness up and **Do Not Disturb** on if possible — the app also tries to keep the screen awake during an active case.
- The app supports **day/night** theme from the header toggle.

More guides will be added here as features grow. If you spot a bug or have a feature idea, contact your local clinical lead or the project maintainer.
