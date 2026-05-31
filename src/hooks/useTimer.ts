import { useCallback, useEffect, useRef, useState } from 'react'
import type { TimingConfig } from '../timing'

interface UseTimerOptions {
  timing: TimingConfig
  onRhythmCheckDue?: () => void
  onFortyFiveMinutes?: () => void
}

export function useTimer({ timing, onRhythmCheckDue, onFortyFiveMinutes }: UseTimerOptions) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const nextCheckAt = useRef(timing.rhythmCheckInterval)
  const fortyFiveFired = useRef(false)
  const checkDueFired = useRef(false)
  const timingRef = useRef(timing)

  timingRef.current = timing

  const start = useCallback(() => {
    nextCheckAt.current = timingRef.current.rhythmCheckInterval
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
    nextCheckAt.current = timingRef.current.rhythmCheckInterval
    fortyFiveFired.current = false
    checkDueFired.current = false
  }, [])

  const recordRhythmEntry = useCallback((atElapsed: number) => {
    nextCheckAt.current = atElapsed + timingRef.current.rhythmCheckInterval
    checkDueFired.current = false
  }, [])

  const jumpToElapsed = useCallback(
    (actualSeconds: number) => {
      const { fortyFiveMinutesSeconds } = timingRef.current
      setElapsedSeconds(actualSeconds)
      if (actualSeconds >= fortyFiveMinutesSeconds) {
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
    const { fortyFiveMinutesSeconds } = timingRef.current

    if (elapsedSeconds >= nextCheckAt.current && !checkDueFired.current) {
      checkDueFired.current = true
      onRhythmCheckDue?.()
    }
    if (elapsedSeconds >= fortyFiveMinutesSeconds && !fortyFiveFired.current) {
      fortyFiveFired.current = true
      onFortyFiveMinutes?.()
    }
  }, [elapsedSeconds, onRhythmCheckDue, onFortyFiveMinutes])

  const minutes = Math.floor(elapsedSeconds / 60)
  const atFortyFiveMinutes = elapsedSeconds >= timing.fortyFiveMinutesSeconds
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
