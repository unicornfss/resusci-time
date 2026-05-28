import { useCallback, useEffect, useState } from 'react'
import { serviceConfig } from '../config'
import { getInstallHelpVariant, type InstallHelpVariant } from '../installContent'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_PREFIX = 'resusci-time-pwa-installed-'

function installedStorageKey(): string {
  const channel = serviceConfig.isPreview ? '-preview' : ''
  return `${STORAGE_PREFIX}${serviceConfig.trustId}${channel}`
}

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isMarkedInstalled(): boolean {
  try {
    return localStorage.getItem(installedStorageKey()) === '1'
  } catch {
    return false
  }
}

function markInstalled(): void {
  try {
    localStorage.setItem(installedStorageKey(), '1')
  } catch {
    /* storage unavailable */
  }
}

function readInstalledState(): boolean {
  return isStandaloneDisplay() || isMarkedInstalled()
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(readInstalledState)

  useEffect(() => {
    if (isStandaloneDisplay()) {
      markInstalled()
      setInstalled(true)
    }
  }, [])

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      markInstalled()
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const canNativeInstall = deferredPrompt != null
  const needsIosInstructions = getInstallHelpVariant() === 'ios'

  // Only show when the browser is offering install, or on iOS where install is manual.
  // Hide once installed (standalone app, appinstalled event, or flag set opening the installed app).
  const visible =
    !import.meta.env.DEV &&
    !installed &&
    (canNativeInstall || needsIosInstructions)

  const helpVariant: InstallHelpVariant = needsIosInstructions ? 'ios' : 'desktop'

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      markInstalled()
      setInstalled(true)
    }
    return outcome === 'accepted'
  }, [deferredPrompt])

  return {
    visible,
    canNativeInstall,
    needsIosInstructions,
    helpVariant,
    promptInstall,
  }
}
