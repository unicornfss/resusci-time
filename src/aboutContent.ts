import type { ServiceFeatures } from './config/types'

export const SUPPORT_EMAIL = 'jon@ostroforge.co.uk'

const PRIVACY_BODY_BASE =
  'Resusci-Time runs entirely in your browser. It does not send patient data to a server. Event logs are saved automatically on this device as you work (Saved logs) and can be exported as CSV or PDF.'

const PRIVACY_BODY_WITH_TRANSFER =
  `${PRIVACY_BODY_BASE} You can transfer an active case to another device by QR code — still with no server. Theme preference may persist in browser storage.`

const PRIVACY_BODY_WITHOUT_TRANSFER =
  `${PRIVACY_BODY_BASE} Theme preference may persist in browser storage.`

export const ABOUT_SECTIONS = [
  {
    heading: 'What is Resusci-Time?',
    body:
      'Resusci-Time is a guided timer and checklist for adult cardiac arrest resuscitation by ambulance resources. It prompts rhythm checks, drug intervals, quality reminders, verification of death (VOD), termination of resuscitation (TOR), and return of spontaneous circulation (ROSC) monitoring in line with common UK ambulance practice.',
  },
  {
    heading: 'Important',
    body:
      'This tool supports clinical decision-making during an arrest. It does not replace your trust protocol, JRCALC guidance, senior clinical judgement, or local policy. Always follow the authoritative sources for your service.',
  },
  {
    heading: 'Clinical basis',
    body:
      'Timing, prompts, and checklists follow common UK ambulance practice and the Spring 2026 JRCALC / AACE clinical guidelines. Reference algorithms and aide-memoires are available under Documents where your build includes them.',
  },
  {
    heading: 'Development',
    body:
      'Resusci-Time is developed and maintained by Jon Ostrowski (Paramedic / Clinical Team Mentor, WMAS). Custom builds can include service branding, protocol variations, offline installation for tablets and phones, and other features agreed with your organisation.',
  },
  {
    heading: 'Privacy',
    body: PRIVACY_BODY_WITH_TRANSFER,
  },
  {
    heading: 'During a case',
    body:
      'While a case is running, the app tries to keep your screen awake so the timer stays visible. Allow this if your browser prompts you. For best results on shift, install the app, turn brightness up, and use Do Not Disturb if possible.',
  },
  {
    heading: 'Install on your device',
    body:
      'Add Resusci-Time to your home screen for quick access and offline use. On iPhone or iPad (Safari): tap Share, then Add to Home Screen — your Resusci-Time icon will appear on the home screen. On Android (Chrome): open the menu and choose Install app or Add to Home screen.',
  },
  {
    heading: 'Contact',
    body:
      'For support, to report errors, suggest improvements, or to discuss a custom version for your ambulance or NHS service, please get in touch.',
  },
]

export function getAboutSections(features: Pick<ServiceFeatures, 'caseTransfer'>) {
  const privacyBody = features.caseTransfer ? PRIVACY_BODY_WITH_TRANSFER : PRIVACY_BODY_WITHOUT_TRANSFER
  return ABOUT_SECTIONS.map((section) =>
    section.heading === 'Privacy' ? { ...section, body: privacyBody } : section,
  )
}
