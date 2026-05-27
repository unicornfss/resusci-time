import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FORTY_FIVE_MINUTES_SECONDS,
  RHYTHM_CHECK_INTERVAL,
} from '../timing'

interface UseTimerOptions {
  onRhythmCheckDue?: () => void
  onFortyFiveMinutes?: () => void
}

export { RHYTHM_CHECK_INTERVAL } from '../timing'

export function useTimer({ onRhythmCheckDue, onFortyFiveMinutes }: UseTimerOptions = {}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const nextCheckAt = useRef(RHYTHM_CHECK_INTERVAL)
  const fortyFiveFired = useRef(false)
  const checkDueFired = useRef(false)

  const start = useCallback(() => {
    nextCheckAt.current = RHYTHM_CHECK_INTERVAL
    fortyFiveFired.current = false
    checkDueFired.current = false
    setElapsedSeconds(0)
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => setIsRunning(true), [])

  const reset = useCallback(() => {
    setElapsedSeconds(0)
    setIsRunning(false)
    nextCheckAt.current = RHYTHM_CHECK_INTERVAL
    fortyFiveFired.current = false
    checkDueFired.current = false
  }, [])

  const recordRhythmEntry = useCallback((atElapsed: number) => {
    nextCheckAt.current = atElapsed + RHYTHM_CHECK_INTERVAL
    checkDueFired.current = false
  }, [])

  const jumpToElapsed = useCallback(
    (actualSeconds: number) => {
      setElapsedSeconds(actualSeconds)
      if (actualSeconds >= FORTY_FIVE_MINUTES_SECONDS) {
        if (!fortyFiveFired.current) {
          fortyFiveFired.current = true
          onFortyFiveMinutes?.()
        }
      } else {
        fortyFiveFired.current = false
      }
    },
    [onFortyFiveMinutes],
  )

  useEffect(() => {
    if (!isRunning) return

    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    if (
      elapsedSeconds >= nextCheckAt.current &&
      elapsedSeconds <= FORTY_FIVE_MINUTES_SECONDS &&
      !checkDueFired.current
    ) {
      checkDueFired.current = true
      onRhythmCheckDue?.()
    }
    if (elapsedSeconds >= FORTY_FIVE_MINUTES_SECONDS && !fortyFiveFired.current) {
      fortyFiveFired.current = true
      onFortyFiveMinutes?.()
    }
  }, [elapsedSeconds, onRhythmCheckDue, onFortyFiveMinutes])

  const minutes = Math.floor(elapsedSeconds / 60)
  const atFortyFiveMinutes = elapsedSeconds >= FORTY_FIVE_MINUTES_SECONDS
  const secondsToNextCheck = Math.max(0, nextCheckAt.current - elapsedSeconds)

  return {
    elapsedSeconds,
    minutes,
    isRunning,
    atFortyFiveMinutes,
    secondsToNextCheck,
    start,
    pause,
    resume,
    reset,
    recordRhythmEntry,
    jumpToElapsed,
  }
}
