import { useEffect, useRef, type RefObject } from 'react'

const SCROLL_GAP_PX = 16

function getStickyHeaderClearance(): number {
  const timerBar = document.querySelector('.timer-bar')
  if (timerBar instanceof HTMLElement && timerBar.offsetParent !== null) {
    return Math.ceil(timerBar.getBoundingClientRect().bottom)
  }

  const cssOffset = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--timer-bar-offset'),
    10,
  )
  return Number.isNaN(cssOffset) ? 0 : cssOffset
}

export function scrollReminderIntoView(element: HTMLElement | null) {
  if (!element) return

  const scroll = () => {
    const clearance = getStickyHeaderClearance()
    const top = element.getBoundingClientRect().top + window.scrollY - clearance - SCROLL_GAP_PX
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  // Wait for layout after timer bar content changes (e.g. entering ROSC mode).
  requestAnimationFrame(() => {
    requestAnimationFrame(scroll)
  })
}

export function useScrollWhenShown(visible: boolean, ref: RefObject<HTMLElement | null>) {
  const prevVisibleRef = useRef(false)

  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      scrollReminderIntoView(ref.current)
    }
    prevVisibleRef.current = visible
  }, [visible, ref])
}
