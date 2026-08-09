import { useEffect, useState } from 'react'

function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined') return false
  // Phones / tablets: primary input is coarse touch, typically no fine hover.
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return true
  // Fallback for some tablets that still report hover.
  return navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches
}

function isLandscape(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(orientation: landscape)').matches
}

/**
 * True when a touch-primary device is in landscape and the user has not
 * dismissed the rotate hint for this landscape spell.
 */
export function useLandscapeRotateHint(): {
  visible: boolean
  dismiss: () => void
} {
  const [shouldAdvise, setShouldAdvise] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const update = () => {
      const landscape = isLandscape()
      const touch = isTouchPrimaryDevice()
      if (!landscape) {
        setDismissed(false)
        setShouldAdvise(false)
        return
      }
      setShouldAdvise(touch)
    }

    update()

    const landscapeMq = window.matchMedia('(orientation: landscape)')
    const touchMq = window.matchMedia('(hover: none) and (pointer: coarse)')
    landscapeMq.addEventListener('change', update)
    touchMq.addEventListener('change', update)
    window.addEventListener('orientationchange', update)
    window.addEventListener('resize', update)

    return () => {
      landscapeMq.removeEventListener('change', update)
      touchMq.removeEventListener('change', update)
      window.removeEventListener('orientationchange', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return {
    visible: shouldAdvise && !dismissed,
    dismiss: () => setDismissed(true),
  }
}
