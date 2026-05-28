export type InstallHelpVariant = 'ios' | 'desktop' | 'android' | 'dev'

export const INSTALL_HELP: Record<
  InstallHelpVariant,
  { intro: string; steps: readonly string[]; note: string }
> = {
  ios: {
    intro:
      'Add Resusci-Time to your home screen for quick access and offline use:',
    steps: [
      'Open this page in Safari (not Chrome or another browser).',
      'Tap the Share button at the bottom of the screen.',
      'Scroll down and tap Add to Home Screen.',
      'Tap Add — the icon will appear on your home screen.',
    ],
    note: 'Each trust version (WMAS / EMAS) installs separately — bookmark the correct link before adding.',
  },
  android: {
    intro: 'Install Resusci-Time on your Android device:',
    steps: [
      'If a browser install prompt appeared, tap Install.',
      'Otherwise open the Chrome menu (⋮) at the top right.',
      'Tap Install app or Add to Home screen.',
      'Confirm — the icon will appear on your home screen.',
    ],
    note: 'Each trust version (WMAS / EMAS) installs separately — use the link for your service.',
  },
  desktop: {
    intro: 'Install Resusci-Time as a desktop app (Windows, Mac, or Linux):',
    steps: [
      'Use Chrome or Edge — Firefox does not support installing this app.',
      'Look for an install icon in the address bar (often a monitor with an arrow, or a ⊕).',
      'Click it and choose Install.',
      'If you do not see it, open the browser menu (⋮) and choose Install Resusci-Time or Apps → Install this site as an app.',
    ],
    note: 'The app opens in its own window and works offline after the first visit.',
  },
  dev: {
    intro: 'The Install app button is hidden during live dev mode because browsers only offer installation from a production build.',
    steps: [
      'Run: npm run build:all',
      'Then run: npm run preview:all',
      'Open http://localhost:4173/wmas/ or /emas/ in Chrome or Edge.',
      'The Install app button should appear in the header.',
    ],
    note: 'On the live site, the button works the same way in Chrome, Edge, and on Android.',
  },
}

export function getInstallHelpVariant(): InstallHelpVariant {
  const ua = navigator.userAgent
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (isIos) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}
