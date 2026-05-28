import { useEffect } from 'react'

/**
 * Keeps the screen on while a case is active (Screen Wake Lock API).
 * Re-acquires after the tab becomes visible again, e.g. after switching apps.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        /* unsupported, low battery, or user denied — app still works */
      }
    }

    void acquire()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void lock?.release()
      lock = null
    }
  }, [active])
}
