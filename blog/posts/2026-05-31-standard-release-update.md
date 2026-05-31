---
title: Standard build release update — Documents, TOR, and VoD
date: 2026-05-31
category: news
audience: standard
summary: What’s new in the Standard live build — Documents tab, prolonged VF reminder, TOR and VoD improvements, and intervention updates (version 1.1.1).
---

This update is rolling out on the **Standard live** build of Resusci-Time (version **1.1.1**). It focuses on reference documents, clearer termination and VoD flows, and small clinical prompts — without trust-specific features such as CODE SHOCK (those exist only on custom service builds such as WMAS).

## Documents (new)

The ALS algorithm link under the page subtitle has been replaced by a **Documents** button in the header (next to About and Saved logs).

Tap **Documents** to open the **Advanced Life Support (ALS) algorithm** in a wide modal viewer on your phone or tablet.

If a **rhythm check** is due while a document is open, the rhythm alert still appears **on top** so you can log the rhythm without closing the document first.

## Prolonged VF reminder (new)

If **three consecutive shockable rhythms** are logged during resuscitation, an amber panel appears to flag an episode of **prolonged VF**.

Tap **Acknowledge** — `Prolonged VF` is added to the event log with a timestamp. On the Standard build this is a **reminder and log entry only**; it does not change the TOR questionnaire (custom trust builds may handle prolonged VF differently at termination).

## Termination of resuscitation (TOR)

- **Manual TOR** (from the timer bar): you must have logged an **initial rhythm** first. The app then runs a **short initial assessment re-visit** before termination review. The log records `TOR reassessment started`.
- **45-minute TOR**: unchanged — goes straight to termination review.
- **Special circumstances**: at TOR you are asked whether **hypothermia, overdose/poisoning, or pregnancy** may apply, before rhythm-based questions. Yes or No is logged.
- **Senior clinical discussion**: the timer-bar panel for continue vs terminate after senior advice has been refined.

## Initial assessment and verification of death (VoD)

- **5-minute asystole observation** (hypostasis / rigor mortis): grey countdown with progress bar; assessment menu hidden until the timer finishes; checklist visible but not tappable until then.
- **Criteria times** logged when the **5-minute observation starts**.
- **VoD time** logged when you press **VOD**.
- VoD summary times aligned to the **right**, matching criteria rows.
- After TOR, when the post-TOR wait reaches **0:00**, the display shows **Resuscitation not appropriate**. The **VOD** button remains available.

## Interventions and medications

- Logging the **first adrenaline dose** prompts **establish vascular access** if IV/IO has not yet been recorded.
- **Needle decompression** added under **Interventions → Breathing**.

## Other polish

- Reminder panels auto-**scroll into view** below the sticky timer bar when they appear.
- App icons refreshed — if you use an installed copy of the app, refresh once to pick up the update.

## Custom trust builds

Ambulance services and NHS trusts can request tailored builds (crest, trust-specific reminders, extra documents, and protocol-aligned options). The **WMAS** build, for example, includes CODE SHOCK and a WMAS ToR criteria document — those are **not** part of the Standard release described here.

Contact the project maintainer if you would like to discuss a custom version for your service.

## Feedback

Spot a bug or have a suggestion? Contact your clinical lead or the project maintainer.
