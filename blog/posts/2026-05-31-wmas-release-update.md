---
title: WMAS release update — Documents, TOR, and CODE SHOCK
date: 2026-05-31
category: news
audience: wmas
summary: What’s new in the WMAS live build — Documents tab, TOR improvements, CODE SHOCK after the first shock, prolonged VF rules, and VOD updates.
---

This update is now rolling out on the **WMAS live** build of Resusci-Time (version **1.1.1**). It brings shared improvements for all builds, plus **WMAS-specific** reminders and reference documents.

If you use the **preview** URL for training, you will also see DEMO icons and speed controls — those are **not** on the live field build.

> **Looking for the CODE SHOCK article?** This page is the general release summary. The dedicated CODE SHOCK post — with the banner graphic and step-by-step walkthrough — is **[CODE SHOCK reminder for WMAS crews](./2026-05-31-wmas-code-shock-reminder.html)** (also listed below on this blog).

## Documents (new)

The ALS algorithm link under the page subtitle has been replaced by a **Documents** button in the header (next to About and Saved logs).

Tap **Documents** to open protocol reference images in a modal:

- **Advanced Life Support (ALS) algorithm**
- **WMAS ToR criteria** — the ALS bag termination aide memoire (WMAS build only)

Documents open large enough to read on a phone or tablet. If a **rhythm check** is due while a document is open, the rhythm alert still appears **on top** so you can log the rhythm without closing the document first.

## CODE SHOCK — now after the first shock

The **CODE SHOCK** reminder still prompts you to notify EOC, but it now appears after the **first logged shock** (previously after the third).

When it appears:

1. An amber panel shows **CODE SHOCK notified to EOC**.
2. After you have notified EOC, tap **Acknowledge** — the event log records `CODE SHOCK notified to EOC`.

See also: [CODE SHOCK reminder for WMAS crews](./2026-05-31-wmas-code-shock-reminder.html).

## Prolonged VF

**During resuscitation**

- After **three consecutive shockable rhythms**, an amber panel reminds you the patient has had an episode of **prolonged VF**.
- Tap **Acknowledge** — `Prolonged VF` is logged with a timestamp.

**At termination of resuscitation (TOR)**

- If **Prolonged VF** was logged during the case, the TOR review shows the **senior clinical discussion** message first.
- Special-circumstances, rhythm, and PEA questions are deferred until you have used **Seek senior clinical advice** in the timer bar and completed that discussion flow.

## Termination of resuscitation (TOR)

- **Manual TOR** (from the timer bar): you must have logged an **initial rhythm** first. The app then runs a **short initial assessment re-visit** before termination review (fixes a blank-screen issue if TOR was opened too early). The log records `TOR reassessment started`.
- **45-minute TOR**: unchanged — goes straight to termination review.
- **Special circumstances**: at TOR you are asked whether **hypothermia, overdose/poisoning, or pregnancy** may apply, before rhythm-based questions. Yes or No is logged.
- **Senior clinical discussion**: timer-bar panel and continue vs terminate flows have been refined.

## Initial assessment and verification of death (VoD)

- **5-minute asystole observation** (hypostasis / rigor mortis): a grey countdown with progress bar; the assessment menu is hidden until the timer finishes; the checklist is visible but not tappable until then.
- **Criteria times** are logged when the **5-minute observation starts**.
- **VoD time** is logged when you press **VOD**.
- VoD summary times are aligned to the **right**, consistent with criteria rows.
- After TOR, when the post-TOR wait reaches **0:00**, the display shows **Resuscitation not appropriate** (instead of a continuing countdown). The **VOD** button remains available.

## Interventions and medications

- Logging the **first adrenaline dose** prompts you to **establish vascular access** if IV/IO has not yet been recorded (even if other medications were logged earlier).
- **Needle decompression** is now listed under **Interventions → Breathing**.

## Other polish

- Reminder panels (early transfer, CODE SHOCK, prolonged VF, vascular access) **scroll into view** when they appear, sitting below the sticky timer bar.
- App icons have been refreshed. If you installed Resusci-Time as an app, **refresh once** or reinstall to pick up the latest version.

## Training tip

Open the **WMAS preview** build to walk through CODE SHOCK after one shock, prolonged VF, and the new Documents list without using real-time protocol speed on a live case.

## Feedback

If any wording or timing should better match WMAS practice, pass feedback to your clinical lead or the project maintainer.
