---
title: Getting started with Resusci-Time
date: 2025-05-28
category: guide
audience: all
summary: Standard build capabilities and day-to-day use on shift.
---

This guide covers the basics for crews using Resusci-Time on a phone or tablet.

![Resusci-Time logo](../images/resusci-time-logo.png)

Resusci-Time is based on the **Spring 2026 JRCALC / AACE adult resuscitation and verification of death guidelines**. It is **not intended to replace clinical knowledge and skill** — it is a support tool only. Mistakes may be present; any identified errors will be corrected as soon as possible.

## 1. Open the Standard build

The **Standard** version is what we are publishing for general use. Open [Resusci-Time](../../standard/) from the [home page](../../) and bookmark the URL so you can open it quickly from the home screen.

**Custom versions** catering for individual ambulance services or NHS trusts can be provided on request — for example service crest or logo, trust-specific reminders, additional medication buttons, or other protocol-aligned options agreed with your clinical team. Contact the project maintainer if you would like to discuss a tailored build.

## 2. What the Standard build includes

The Standard version provides the full core arrest workflow:

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

## 3. Install on your device (optional)

On **Chrome** or **Edge**, use **Install app** (or **Add to Home screen** on mobile). The timer then opens full-screen like a native app. You need **HTTPS** — the live site or a local preview build, not plain HTTP on a LAN address for some features.

## 4. Start a case

1. Confirm **patient details** if prompted.
2. Select the **initial rhythm** (VF/pVT, PEA, or Asystole).
3. The **timer bar** shows elapsed time and upcoming actions (rhythm check, adrenaline, etc.).

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

- Run through a **training case** before first live use.
- Keep screen brightness up and **Do Not Disturb** on if possible — the app also tries to keep the screen awake during an active case.
- The app supports **day/night** theme from the header toggle.

More guides will be added here as features grow. If you spot a bug, need a custom service build, or have a feature idea, contact your local clinical lead or the project maintainer.
