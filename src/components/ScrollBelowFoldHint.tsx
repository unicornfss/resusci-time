import type { RefObject } from 'react'
import { scrollReminderIntoView } from '../hooks/useScrollWhenShown'

interface ScrollBelowFoldHintProps {
  visible: boolean
  label: string
  targetRef: RefObject<HTMLElement | null>
}

export function ScrollBelowFoldHint({ visible, label, targetRef }: ScrollBelowFoldHintProps) {
  if (!visible) return null

  function handleScrollToContent() {
    scrollReminderIntoView(targetRef.current)
  }

  return (
    <div className="scroll-below-fold-hint" role="status" aria-live="polite">
      <button type="button" className="scroll-below-fold-hint-btn" onClick={handleScrollToContent}>
        <span className="scroll-below-fold-hint-label">{label}</span>
        <span className="scroll-below-fold-hint-chevron" aria-hidden>
          ↓
        </span>
      </button>
    </div>
  )
}
