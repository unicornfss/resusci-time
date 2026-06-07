import { useEffect, useRef } from 'react'
import {
  installPreviewDebugGlobalHandlers,
  recordPreviewDebugEvent,
  recordPreviewDebugStateChange,
} from '../previewDebugLog'

export interface PreviewDebugInstrumentationInput {
  step: string
  timerView: string
  canModifyCase: boolean
  patientHandedOver: boolean
  caseHandedOff: boolean
  transferHandoffPayloadPresent: boolean
  timerElapsedSeconds: number
  timerIsRunning: boolean
  showRhythmCheckAlert: boolean
  metronomeEnabled: boolean
  activeClinicalAlerts: readonly string[]
  currentClinicalAlert: string | null
  previewSpeedMultiplier: number | null
}

export function usePreviewDebugInstrumentation(input: PreviewDebugInstrumentationInput): void {
  const prevRef = useRef<Partial<PreviewDebugInstrumentationInput>>({})

  useEffect(() => {
    installPreviewDebugGlobalHandlers()
  }, [])

  useEffect(() => {
    const prev = prevRef.current
    const changes: Record<string, { from: unknown; to: unknown }> = {}

    const track = <K extends keyof PreviewDebugInstrumentationInput>(key: K) => {
      if (prev[key] !== undefined && prev[key] !== input[key]) {
        changes[key as string] = { from: prev[key], to: input[key] }
      }
    }

    track('step')
    track('timerView')
    track('canModifyCase')
    track('patientHandedOver')
    track('caseHandedOff')
    track('transferHandoffPayloadPresent')
    track('timerIsRunning')
    track('showRhythmCheckAlert')
    track('metronomeEnabled')
    track('currentClinicalAlert')
    track('previewSpeedMultiplier')

    if (Object.keys(changes).length > 0) {
      recordPreviewDebugStateChange('state_changed', changes)
    }

    if (
      prev.timerElapsedSeconds !== undefined &&
      Math.abs((prev.timerElapsedSeconds ?? 0) - input.timerElapsedSeconds) >= 60 &&
      input.timerIsRunning
    ) {
      recordPreviewDebugEvent('timer', 'elapsed_milestone', {
        elapsedSeconds: input.timerElapsedSeconds,
      })
    }

    if (
      prev.activeClinicalAlerts !== undefined &&
      JSON.stringify(prev.activeClinicalAlerts) !== JSON.stringify(input.activeClinicalAlerts)
    ) {
      recordPreviewDebugEvent('alert', 'active_alerts_changed', {
        from: prev.activeClinicalAlerts,
        to: input.activeClinicalAlerts,
      })
    }

    prevRef.current = { ...input }
  }, [
    input.step,
    input.timerView,
    input.canModifyCase,
    input.patientHandedOver,
    input.caseHandedOff,
    input.transferHandoffPayloadPresent,
    input.timerElapsedSeconds,
    input.timerIsRunning,
    input.showRhythmCheckAlert,
    input.metronomeEnabled,
    input.currentClinicalAlert,
    input.previewSpeedMultiplier,
    input.activeClinicalAlerts,
  ])
}
