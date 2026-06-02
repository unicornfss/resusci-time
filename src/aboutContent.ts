export const SUPPORT_EMAIL = 'jon@ostroforge.co.uk'

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
    heading: 'Privacy',
    body:
      'Resusci-Time runs entirely in your browser. It does not send patient data to a server. Event logs are saved automatically on this device as you work (Saved logs) and can be exported as CSV or PDF. You can transfer an active case to another device by QR code — still with no server. Theme preference may persist in browser storage.',
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
    heading: 'Contact & custom versions',
    body:
      'For support, to report errors, suggest improvements, or discuss custom versions tailored to an individual ambulance or NHS service, please get in touch.',
  },
] as const
