import { useEffect, useState, type RefObject } from 'react'

/** Phones and narrow devices — iPad portrait (768px+) is excluded. */
export const BELOW_FOLD_HINT_MAX_WIDTH_PX = 640

export function useBelowFoldHint(
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    let observer: IntersectionObserver | null = null
    let rafId = 0

    const update = () => {
      const target = targetRef.current
      const isNarrow = window.matchMedia(
        `(max-width: ${BELOW_FOLD_HINT_MAX_WIDTH_PX}px)`,
      ).matches

      observer?.disconnect()
      observer = null

      if (!target) {
        setVisible(false)
        return
      }

      if (!isNarrow) {
        setVisible(false)
        return
      }

      const pageScrollable =
        document.documentElement.scrollHeight > window.innerHeight + 80
      if (!pageScrollable) {
        setVisible(false)
        return
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry.isIntersecting || entry.intersectionRatio < 0.25)
        },
        { threshold: [0, 0.25, 0.5], rootMargin: '0px 0px -12% 0px' },
      )
      observer.observe(target)
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    scheduleUpdate()

    const mq = window.matchMedia(`(max-width: ${BELOW_FOLD_HINT_MAX_WIDTH_PX}px)`)
    mq.addEventListener('change', scheduleUpdate)
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      observer?.disconnect()
      mq.removeEventListener('change', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
    }
  }, [enabled, targetRef])

  return visible
}
