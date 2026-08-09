import type { ServiceFeatures } from './config/types'

export const SUPPORT_EMAIL = 'jon.ostrowski@wmas.nhs.uk'

const PRIVACY_BODY_BASE =
  'Resusci-Time runs entirely in your browser. It does not send patient data to a server. Event logs are saved automatically on this device as you work (Saved logs) and can be exported as CSV or PDF.'

const PRIVACY_BODY_WITH_TRANSFER =
  `${PRIVACY_BODY_BASE} You can transfer an active case to another device by QR code — still with no server. Theme preference may persist in browser storage.`

const PRIVACY_BODY_WITHOUT_TRANSFER =
  `${PRIVACY_BODY_BASE} Theme preference may persist in browser storage.`

type AboutSection = { heading: string; body: string }

function buildAboutSections(isPreview: boolean, caseTransfer: boolean): AboutSection[] {
  const privacyBody = caseTransfer ? PRIVACY_BODY_WITH_TRANSFER : PRIVACY_BODY_WITHOUT_TRANSFER

  const importantBody = isPreview
    ? 'This preview is for simulation and internal testing only. It must not be used for real patient contact. It may include unapproved changes. A governance-approved staff build is not published yet — reserved web addresses show a placeholder only. This tool does not replace your trust protocol, JRCALC guidance, senior clinical judgement, or local policy.'
    : 'This tool supports clinical decision-making during an arrest. It does not replace your trust protocol, JRCALC guidance, senior clinical judgement, or local policy. Always follow the authoritative sources for your service.'

  const developmentBody = isPreview
    ? 'Resusci-Time is developed and maintained by Jon Ostrowski (Paramedic / Clinical Team Mentor, WMAS). It is configured for West Midlands Ambulance Service while Trust governance and the medical-device route are worked through. Builds for other trusts, and a public Standard channel, are not under active consideration. Ownership remains with Jon unless a separate agreement says otherwise.'
    : 'Resusci-Time is developed and maintained by Jon Ostrowski (Paramedic / Clinical Team Mentor, WMAS) for West Midlands Ambulance Service.'

  const accessBody = isPreview
    ? 'The public preview is limited to approved people. Sign-in uses an email one-time code (Cloudflare Access); your work email must be on the allow-list. If you are not approved, you will not be able to open the app — request access from the site home page or via a working-group member. There is no separate in-app password.'
    : 'Access for the approved staff build will follow Trust arrangements (for example Microsoft work-account sign-in) when that release is published.'

  return [
    {
      heading: 'Important',
      body: importantBody,
    },
    {
      heading: 'What is Resusci-Time?',
      body:
        'Resusci-Time is a guided timer and checklist for adult cardiac arrest resuscitation by ambulance resources. It prompts rhythm checks, drug intervals, quality reminders, verification of death (VOD), termination of resuscitation (TOR), and return of spontaneous circulation (ROSC) monitoring, configured for WMAS practice.',
    },
    {
      heading: 'Current focus',
      body:
        'Development and public testing are for West Midlands Ambulance Service only. The working public app is the WMAS preview channel. Other trusts and a Standard build are not under active consideration. On phones and tablets, portrait orientation gives the clearest layout.',
    },
    {
      heading: 'Access',
      body: accessBody,
    },
    {
      heading: 'Clinical basis',
      body:
        'Timing, prompts, and checklists follow WMAS-aligned adult arrest practice and common UK ambulance guidance, including Spring 2026 JRCALC / AACE clinical guidelines where relevant. Reference algorithms and aide-memoires are available under Documents where your build includes them.',
    },
    {
      heading: 'Development',
      body: developmentBody,
    },
    {
      heading: 'Privacy',
      body: privacyBody,
    },
    {
      heading: 'During a case',
      body:
        'While a case is running, the app tries to keep your screen awake so the timer stays visible. Allow this if your browser prompts you. For best results, install the app, turn brightness up, use portrait on a phone or tablet, and use Do Not Disturb if possible.',
    },
    {
      heading: 'Install on your device',
      body:
        'Add Resusci-Time to your home screen for quick access and offline use after the first online open. On iPhone or iPad (Safari): tap Share, then Add to Home Screen. On Android (Chrome): open the menu and choose Install app or Add to Home screen. On Trust-managed devices, a home-screen icon may later be pushed via Company Portal / Intune.',
    },
    {
      heading: 'Contact',
      body:
        'For support, to report errors, to request preview access, or to suggest improvements, please get in touch.',
    },
  ]
}

export function getAboutSections(
  features: Pick<ServiceFeatures, 'caseTransfer'>,
  isPreview = true,
) {
  return buildAboutSections(isPreview, features.caseTransfer)
}
