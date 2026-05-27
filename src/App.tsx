import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer } from './hooks/useTimer'
import { MetronomeToggle } from './components/MetronomeToggle'
import { useMetronome } from './hooks/useMetronome'
import { useScrollWhenShown } from './hooks/useScrollWhenShown'
import {
  createDisplayLogEntry,
  formatActualTime,
  formatElapsed,
  getEarlyTransferLogLabel,
  getEarlyTransferPrompt,
  getCodeShockLogLabel,
  getCodeShockPrompt,
  shouldShowCodeShockReminder,
  getPathSpecificActions,
  getQualityPromptLogLabel,
  getRoscGuidance,
  getVectorChangeLogLabel,
  getVectorChangePrompt,
  getVodCriteriaLogLabel,
  RHYTHM_OPTIONS,
  RHYTHM_VF_PVT,
  RESUSCITATION_QUALITY_ITEMS,
  rhythmCssClass,
  shouldShowEarlyTransferReminder,
  shouldShowVectorChangeReminder,
  nextConsecutiveShockCount,
  sortDisplayLogEntries,
  TOR_CONTINUE_LABEL,
  TOR_END_LABEL,
  TOR_SENIOR_ADVICE_LABEL,
  CLINICAL_DISCUSSION_CONTINUE_LABEL,
  VOD_LOG_LABEL,
  type ResuscitationQualityPromptId,
} from './protocol'
import { ShockForm, formatRhythmLogLabel } from './components/ShockForm'
import { InterventionsPanel } from './components/InterventionsPanel'
import { VascularAccessFlow } from './components/VascularAccessFlow'
import { ResuscitationQualityChecklist } from './components/ResuscitationQualityChecklist'
import { InitialAssessmentPanel } from './components/InitialAssessmentPanel'
import { ReversibleCausesModal } from './components/ReversibleCausesModal'
import { AboutModal } from './components/AboutModal'
import { RoscChecklist } from './components/RoscChecklist'
import { TimerRxSection } from './components/TimerRxSection'
import { TimerRoscRxSection } from './components/TimerRoscRxSection'
import { ClinicalDiscussionTimerSection } from './components/ClinicalDiscussionTimerSection'
import { EventLogPanel } from './components/EventLogPanel'
import { TimerVodCompleteStamp, TimerVodSection } from './components/TimerVodSection'
import { VodTimestampsSummary } from './components/VodTimestampsSummary'
import { PulseRateReminderPanel } from './components/PulseRateReminderPanel'
import { SbpReminderPanel } from './components/SbpReminderPanel'
import { TerminationReview } from './components/TerminationReview'
import { ThemeToggle } from './components/ThemeToggle'
import { publicAssetUrl } from './publicAssetUrl'
import {
  getRoscCommencedLogLabel,
  getRoscPhaseLabel,
  getRoscRhythmCheckLogLabel,
  getSustainedRoscAchievedLogLabel,
  getRoscTaskLogLabel,
  type RoscTaskId,
  type TimerView,
} from './roscTasks'
import {
  allReversibleCausesComplete,
  getReversibleCauseLogLabel,
  REVERSIBLE_CAUSES,
  type ReversibleCauseId,
} from './reversibleCauses'
import {
  shouldShowRxSection,
  getAdrenalineLogLabel,
  getAmiodaroneLogLabel,
  canLogAdrenaline,
  canLogAmiodarone,
  hasNonShockableRhythmLogged,
  shouldShowAmiodarone,
} from './drugs'
import type {
  InterventionId,
  InterventionSubStep,
  OtherInterventionCategory,
  SavedOtherIntervention,
  VascularAccessStep,
} from './interventions'
import {
  BREATHING_OPTIONS,
  getAirwayLogLabel,
  getBreathingLogEntries,
  getMedicationLogLabel,
  getOtherInterventionLogLabel,
  getSodiumChlorideLogLabel,
  hasVascularAccessLogged,
  isContinuousCompressionsAirwayOption,
  SODIUM_CHLORIDE_OPTIONS,
} from './interventions'
import type { DisplayLogEntry, ProtocolStep, Rhythm, RoscStatus } from './types'
import { FORTY_FIVE_MINUTES_SECONDS, ADRENALINE_INTERVAL_SECONDS, IS_TEST_TIMING, RHYTHM_CHECK_INTERVAL, ROSC_MONITORING_REMINDER_INTERVAL_SECONDS, ROSC_SUSTAINED_THRESHOLD_ACTUAL_SECONDS, TEST_JUMP_TO_ACTUAL_SECONDS, VOD_COUNTDOWN_ACTUAL_SECONDS, getRhythmCheckRemainingFraction, toDisplaySeconds } from './timing'
import {
  ATROPINE_DOSE_MG,
  ATROPINE_MAX_MG,
  getAtropineAdministeredLogLabel,
  getAtropineNotAdministeredLogLabel,
  getPulseRateAbove60LogLabel,
  getRoscSbpAdrenaline50LogLabel,
  getRoscSbpAdrenaline100LogLabel,
  getRoscSbpFluidLogLabel,
  isAtropineMaxReached,
} from './roscMonitoring'
import './App.css'

type ShockContext = 'initial' | 'check'
type RhythmCheckEntry = { minute: number; label: string; rhythm: Rhythm; shockJoules?: number }

function displayElapsed(actualSeconds: number) {
  return formatElapsed(toDisplaySeconds(actualSeconds))
}

type PreRhythmModalState = {
  showInterventions: boolean
  interventionStep: 'list' | InterventionId
  interventionSubStep: InterventionSubStep
  interventionOtherDraft: string
  interventionVascularStep: VascularAccessStep
  showReversibleCausesModal: boolean
}

function App() {
  const [step, setStep] = useState<ProtocolStep>('start')
  const [initialRhythm, setInitialRhythm] = useState<Rhythm | null>(null)
  const [currentRhythm, setCurrentRhythm] = useState<Rhythm | null>(null)
  const [, setHeartRate] = useState('')
  const [, setQrsWidthMs] = useState('')
  const [roscStatus, setRoscStatus] = useState<RoscStatus | null>(null)
  const [fortyFiveAcknowledged, setFortyFiveAcknowledged] = useState(false)
  const [earlyTransferAcknowledged, setEarlyTransferAcknowledged] = useState(false)
  const [codeShockAcknowledged, setCodeShockAcknowledged] = useState(false)
  const [showFortyFiveAlert, setShowFortyFiveAlert] = useState(false)
  const [showRhythmCheckAlert, setShowRhythmCheckAlert] = useState(false)
  const [rhythmChecks, setRhythmChecks] = useState<RhythmCheckEntry[]>([])
  const [logEntries, setLogEntries] = useState<DisplayLogEntry[]>([])
  const [shockFormContext, setShockFormContext] = useState<ShockContext | null>(null)
  const [consecutiveShockCount, setConsecutiveShockCount] = useState(0)
  const [showVectorChangeReminder, setShowVectorChangeReminder] = useState(false)
  const [showRhythmLog, setShowRhythmLog] = useState(false)
  const [showInterventions, setShowInterventions] = useState(false)
  const [interventionStep, setInterventionStep] = useState<'list' | InterventionId>('list')
  const [interventionSubStep, setInterventionSubStep] = useState<InterventionSubStep>('options')
  const [interventionOtherDraft, setInterventionOtherDraft] = useState('')
  const [savedOtherInterventions, setSavedOtherInterventions] = useState<SavedOtherIntervention[]>([])
  const [interventionVascularStep, setInterventionVascularStep] = useState<VascularAccessStep>('route')
  const [showVascularAccessReminder, setShowVascularAccessReminder] = useState(false)
  const [vascularAccessReminderStep, setVascularAccessReminderStep] =
    useState<VascularAccessStep>('prompt')
  const pendingVascularAccessAtRef = useRef<number | null>(null)
  const [adrenalineDoseCount, setAdrenalineDoseCount] = useState(0)
  const [amiodaroneDoseCount, setAmiodaroneDoseCount] = useState(0)
  const [nextAdrenalineAt, setNextAdrenalineAt] = useState<number | null>(null)
  const [completedQualityPromptIds, setCompletedQualityPromptIds] = useState<
    Set<ResuscitationQualityPromptId>
  >(() => new Set())
  const [completedReversibleCauseIds, setCompletedReversibleCauseIds] = useState<
    Set<ReversibleCauseId>
  >(() => new Set())
  const [showReversibleCausesModal, setShowReversibleCausesModal] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const preRhythmModalsRef = useRef<PreRhythmModalState | null>(null)
  const prevRhythmCheckAlertOpenRef = useRef(false)
  const pendingContinuousCompressionsFromChecklistRef = useRef(false)
  const timerBarRef = useRef<HTMLDivElement>(null)
  const vectorChangeReminderRef = useRef<HTMLDivElement>(null)
  const earlyTransferReminderRef = useRef<HTMLDivElement>(null)
  const codeShockReminderRef = useRef<HTMLDivElement>(null)
  const vascularAccessReminderRef = useRef<HTMLDivElement>(null)
  const roscMonitoringReminderRef = useRef<HTMLDivElement>(null)
  const roscNextReminderAtRef = useRef(ROSC_MONITORING_REMINDER_INTERVAL_SECONDS)
  const sbpAdrenaline50AwaitingNextReminderRef = useRef(false)
  const sustainedRoscLoggedRef = useRef(false)
  const timerViewRef = useRef<TimerView>('arrest')
  const [timerView, setTimerView] = useState<TimerView>('arrest')
  const [roscElapsedSeconds, setRoscElapsedSeconds] = useState(0)
  const [sbpReminderVisible, setSbpReminderVisible] = useState(false)
  const [pulseReminderVisible, setPulseReminderVisible] = useState(false)
  const [sbpReminderExpanded, setSbpReminderExpanded] = useState(false)
  const [pulseReminderExpanded, setPulseReminderExpanded] = useState(false)
  const [pulseShowAtropineMaxMessage, setPulseShowAtropineMaxMessage] = useState(false)
  const [hasSbpFluidLogged, setHasSbpFluidLogged] = useState(false)
  const [showSbpAdrenaline100, setShowSbpAdrenaline100] = useState(false)
  const [atropineTotalMg, setAtropineTotalMg] = useState(0)
  const [peaTorCriteriaMet, setPeaTorCriteriaMet] = useState<boolean | null>(null)
  const [torEndedAtLabel, setTorEndedAtLabel] = useState<string | null>(null)
  const [vodCountdownRemaining, setVodCountdownRemaining] = useState(VOD_COUNTDOWN_ACTUAL_SECONDS)
  const [vodAtLabel, setVodAtLabel] = useState<string | null>(null)
  const [sustainedRoscEverAchieved, setSustainedRoscEverAchieved] = useState(false)
  const [clinicalDiscussionPending, setClinicalDiscussionPending] = useState(false)
  const [clinicalDiscussionOpen, setClinicalDiscussionOpen] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [completedRoscTaskIds, setCompletedRoscTaskIds] = useState<Set<RoscTaskId>>(() => new Set())

  const atropineMaxReached = isAtropineMaxReached(atropineTotalMg)

  const totalShocks = rhythmChecks.filter((c) => c.shockJoules != null).length
  const vfvtShockCount = totalShocks
  const hasNonShockableRhythm = hasNonShockableRhythmLogged(rhythmChecks.map((c) => c.rhythm))

  const openShockForm = (context: ShockContext) => {
    setShockFormContext(context)
  }

  const closeShockForm = () => setShockFormContext(null)

  const timer = useTimer({
    onRhythmCheckDue: useCallback(() => setShowRhythmCheckAlert(true), []),
    onFortyFiveMinutes: useCallback(() => {
      if (timerViewRef.current === 'rosc') return
      setShowFortyFiveAlert(true)
    }, []),
  })

  function restorePreRhythmModals() {
    const saved = preRhythmModalsRef.current
    if (!saved) return
    preRhythmModalsRef.current = null
    if (saved.showInterventions) {
      setShowInterventions(true)
      setInterventionStep(saved.interventionStep)
      setInterventionSubStep(saved.interventionSubStep)
      setInterventionOtherDraft(saved.interventionOtherDraft)
      setInterventionVascularStep(saved.interventionVascularStep)
    }
    if (saved.showReversibleCausesModal) {
      setShowReversibleCausesModal(true)
    }
  }

  function clearPreRhythmModals() {
    preRhythmModalsRef.current = null
  }

  useEffect(() => {
    const justOpened = showRhythmCheckAlert && !prevRhythmCheckAlertOpenRef.current
    const justClosed = !showRhythmCheckAlert && prevRhythmCheckAlertOpenRef.current
    prevRhythmCheckAlertOpenRef.current = showRhythmCheckAlert

    if (justOpened) {
      preRhythmModalsRef.current = {
        showInterventions,
        interventionStep,
        interventionSubStep,
        interventionOtherDraft,
        interventionVascularStep,
        showReversibleCausesModal,
      }
      pendingContinuousCompressionsFromChecklistRef.current = false
      setShowInterventions(false)
      setInterventionStep('list')
      setInterventionSubStep('options')
      setInterventionOtherDraft('')
      setInterventionVascularStep('route')
      setShowReversibleCausesModal(false)
      return
    }

    if (justClosed) {
      restorePreRhythmModals()
    }
  }, [
    showRhythmCheckAlert,
    showInterventions,
    interventionStep,
    interventionSubStep,
    interventionOtherDraft,
    interventionVascularStep,
    showReversibleCausesModal,
    timerView,
  ])

  useEffect(() => {
    if (!aboutOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAboutOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [aboutOpen])

  useEffect(() => {
    if (step !== 'post-tor' || vodCountdownRemaining <= 0) return
    const id = window.setInterval(() => {
      setVodCountdownRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [step, vodCountdownRemaining])

  useEffect(() => {
    if (timerView !== 'rosc' || !timer.isRunning) return
    const id = window.setInterval(() => {
      setRoscElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [timerView, timer.isRunning])

  useEffect(() => {
    timerViewRef.current = timerView
  }, [timerView])

  useEffect(() => {
    if (timerView !== 'rosc' || sustainedRoscLoggedRef.current) return
    if (roscElapsedSeconds >= ROSC_SUSTAINED_THRESHOLD_ACTUAL_SECONDS) {
      sustainedRoscLoggedRef.current = true
      pushLogEntry(getSustainedRoscAchievedLogLabel())
      setSustainedRoscEverAchieved(true)
    }
  }, [roscElapsedSeconds, timerView])

  useEffect(() => {
    if (timerView !== 'rosc') return
    if (roscElapsedSeconds > 0 && roscElapsedSeconds >= roscNextReminderAtRef.current) {
      showRoscMonitoringReminders()
      roscNextReminderAtRef.current = roscElapsedSeconds + ROSC_MONITORING_REMINDER_INTERVAL_SECONDS
    }
  }, [roscElapsedSeconds, timerView])

  function resetRoscMonitoringProgress() {
    setHasSbpFluidLogged(false)
    setShowSbpAdrenaline100(false)
    sbpAdrenaline50AwaitingNextReminderRef.current = false
    setAtropineTotalMg(0)
  }

  function resetRoscMonitoringOnArrest() {
    resetRoscMonitoringReminder()
    setAtropineTotalMg(0)
  }

  function resetRoscMonitoringReminder() {
    setSbpReminderVisible(false)
    setPulseReminderVisible(false)
    setSbpReminderExpanded(false)
    setPulseReminderExpanded(false)
    setPulseShowAtropineMaxMessage(false)
    roscNextReminderAtRef.current = ROSC_MONITORING_REMINDER_INTERVAL_SECONDS
  }

  function applyRoscMonitoringShownSideEffects() {
    if (sbpAdrenaline50AwaitingNextReminderRef.current) {
      setShowSbpAdrenaline100(true)
      sbpAdrenaline50AwaitingNextReminderRef.current = false
    }
  }

  function showRoscMonitoringReminders() {
    applyRoscMonitoringShownSideEffects()
    setSbpReminderVisible(true)
    setPulseReminderVisible(true)
    setSbpReminderExpanded(false)
    setPulseReminderExpanded(false)
    setPulseShowAtropineMaxMessage(false)
  }

  function startRoscMonitoringOnRoscEntry() {
    showRoscMonitoringReminders()
    roscNextReminderAtRef.current = ROSC_MONITORING_REMINDER_INTERVAL_SECONDS
  }

  function dismissSbpReminder() {
    setSbpReminderVisible(false)
    setSbpReminderExpanded(false)
  }

  function dismissPulseReminder() {
    setPulseReminderVisible(false)
    setPulseReminderExpanded(false)
    setPulseShowAtropineMaxMessage(false)
  }

  function logSbpFluid(ml: '250ml' | '500ml') {
    pushLogEntry(getRoscSbpFluidLogLabel(ml))
    setHasSbpFluidLogged(true)
    dismissSbpReminder()
  }

  function logSbpAdrenaline50() {
    pushLogEntry(getRoscSbpAdrenaline50LogLabel())
    sbpAdrenaline50AwaitingNextReminderRef.current = true
    dismissSbpReminder()
  }

  function logSbpAdrenaline100() {
    pushLogEntry(getRoscSbpAdrenaline100LogLabel())
    dismissSbpReminder()
  }

  function handlePulseYes() {
    pushLogEntry(getPulseRateAbove60LogLabel())
    dismissPulseReminder()
  }

  function handlePulseNo() {
    setPulseReminderExpanded(true)
    setPulseShowAtropineMaxMessage(atropineMaxReached)
  }

  function handleAtropineAdministered() {
    pushLogEntry(getAtropineAdministeredLogLabel())
    setAtropineTotalMg((prev) => Math.min(ATROPINE_MAX_MG, prev + ATROPINE_DOSE_MG))
    dismissPulseReminder()
  }

  function handleAtropineNotAdministered() {
    pushLogEntry(getAtropineNotAdministeredLogLabel())
    dismissPulseReminder()
  }

  function exitRoscMode() {
    setTimerView('arrest')
    resetRoscMonitoringOnArrest()
    sustainedRoscLoggedRef.current = false
    if (timer.elapsedSeconds >= FORTY_FIVE_MINUTES_SECONDS && !fortyFiveAcknowledged) {
      setShowFortyFiveAlert(true)
    }
  }

  function enterRoscMode(fromRhythmCheck = false) {
    setTimerView('rosc')
    setRoscElapsedSeconds(0)
    sustainedRoscLoggedRef.current = false
    setShowFortyFiveAlert(false)
    startRoscMonitoringOnRoscEntry()
    pushLogEntry(fromRhythmCheck ? getRoscRhythmCheckLogLabel() : getRoscCommencedLogLabel())
  }

  function completeRoscTask(id: RoscTaskId, label: string) {
    setCompletedRoscTaskIds((prev) => new Set([...prev, id]))
    pushLogEntry(getRoscTaskLogLabel(label))
  }

  function handleRhythmCheckRosc() {
    timer.recordRhythmEntry(timer.elapsedSeconds)
    setShowRhythmCheckAlert(false)
    closeShockForm()
    if (timerView === 'arrest') {
      clearPreRhythmModals()
      enterRoscMode(true)
      return
    }
    pushLogEntry(getRoscRhythmCheckLogLabel())
  }

  const timerActive =
    step !== 'start' &&
    step !== 'initial-assessment' &&
    step !== 'do-not-resuscitate' &&
    (step !== 'complete' || vodAtLabel != null)

  useMetronome(metronomeEnabled && timerActive)

  function resetAll() {
    setStep('start')
    setInitialRhythm(null)
    setCurrentRhythm(null)
    setHeartRate('')
    setQrsWidthMs('')
    setRoscStatus(null)
    setFortyFiveAcknowledged(false)
    setEarlyTransferAcknowledged(false)
    setCodeShockAcknowledged(false)
    setShowFortyFiveAlert(false)
    setShowRhythmCheckAlert(false)
    setRhythmChecks([])
    setLogEntries([])
    setShockFormContext(null)
    setConsecutiveShockCount(0)
    setShowVectorChangeReminder(false)
    setShowRhythmLog(false)
    setShowInterventions(false)
    setInterventionStep('list')
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
    setSavedOtherInterventions([])
    setInterventionVascularStep('route')
    setShowVascularAccessReminder(false)
    setVascularAccessReminderStep('prompt')
    pendingVascularAccessAtRef.current = null
    setAdrenalineDoseCount(0)
    setAmiodaroneDoseCount(0)
    setNextAdrenalineAt(null)
    setCompletedQualityPromptIds(new Set())
    setCompletedReversibleCauseIds(new Set())
    setShowReversibleCausesModal(false)
    preRhythmModalsRef.current = null
    prevRhythmCheckAlertOpenRef.current = false
    pendingContinuousCompressionsFromChecklistRef.current = false
    setTimerView('arrest')
    setRoscElapsedSeconds(0)
    setCompletedRoscTaskIds(new Set())
    resetRoscMonitoringReminder()
    resetRoscMonitoringProgress()
    setMetronomeEnabled(false)
    setPeaTorCriteriaMet(null)
    setTorEndedAtLabel(null)
    setVodCountdownRemaining(VOD_COUNTDOWN_ACTUAL_SECONDS)
    setVodAtLabel(null)
    setSustainedRoscEverAchieved(false)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    sustainedRoscLoggedRef.current = false
    timer.reset()
  }

  function pushLogEntry(text: string, at?: Date): number {
    const entry = createDisplayLogEntry(text, at ?? new Date())
    setLogEntries((prev) => [...prev, entry])
    return entry.atEpochMs
  }

  function maybePromptVascularAccessAfterFirstMedication(atEpochMs: number) {
    pendingVascularAccessAtRef.current = atEpochMs
    setShowVascularAccessReminder(true)
    setVascularAccessReminderStep('prompt')
  }

  function logInitialRhythm(rhythm: Rhythm, joules?: number) {
    const elapsed = timer.elapsedSeconds
    const label = displayElapsed(elapsed)
    const entry: RhythmCheckEntry = {
      minute: Math.floor(toDisplaySeconds(elapsed) / 60),
      label,
      rhythm,
    }
    if (rhythm === RHYTHM_VF_PVT && joules != null) entry.shockJoules = joules
    setRhythmChecks([entry])
    pushLogEntry(formatRhythmLogLabel(rhythm, joules))
    timer.recordRhythmEntry(elapsed)
  }

  function commenceResuscitation() {
    timer.start()
    setStep('select-rhythm')
  }

  function finishInitialAssessmentVod(criteriaLabels: string[] = []) {
    const now = new Date()
    for (const label of criteriaLabels) {
      pushLogEntry(getVodCriteriaLogLabel(label), now)
    }
    pushLogEntry(VOD_LOG_LABEL, now)
    setVodAtLabel(formatActualTime(now))
    setStep('complete')
  }

  function completeQualityPrompt(id: ResuscitationQualityPromptId, label: string) {
    setCompletedQualityPromptIds((prev) => {
      if (prev.has(id)) return prev
      pushLogEntry(getQualityPromptLogLabel(label))
      return new Set([...prev, id])
    })
  }

  function completeContinuousCompressionsPrompt() {
    setCompletedQualityPromptIds((prev) => {
      if (prev.has('continuous-compressions')) return prev
      const item = RESUSCITATION_QUALITY_ITEMS.find((entry) => entry.id === 'continuous-compressions')
      if (item) pushLogEntry(getQualityPromptLogLabel(item.label))
      return new Set([...prev, 'continuous-compressions'])
    })
  }

  function shouldCompleteContinuousCompressionsPrompt(airwayOption: string): boolean {
    return (
      pendingContinuousCompressionsFromChecklistRef.current ||
      isContinuousCompressionsAirwayOption(airwayOption)
    )
  }

  function finishAirwayIntervention(airwayOption: string) {
    if (shouldCompleteContinuousCompressionsPrompt(airwayOption)) {
      completeContinuousCompressionsPrompt()
    }
    pendingContinuousCompressionsFromChecklistRef.current = false
  }

  function openQualityVascularAccess() {
    setShowInterventions(true)
    setInterventionStep('vascular-access')
    setInterventionSubStep('options')
    setInterventionVascularStep('route')
  }

  function openQualityAirwayInterventions() {
    pendingContinuousCompressionsFromChecklistRef.current = true
    setShowInterventions(true)
    setInterventionStep('airway')
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
  }

  function openReversibleCausesModal() {
    setShowReversibleCausesModal(true)
  }

  function closeReversibleCausesModal() {
    setShowReversibleCausesModal(false)
  }

  function toggleReversibleCause(id: ReversibleCauseId) {
    if (completedReversibleCauseIds.has(id)) return
    const label = REVERSIBLE_CAUSES.find((item) => item.id === id)?.label
    if (!label) return
    pushLogEntry(getReversibleCauseLogLabel(label))
    setCompletedReversibleCauseIds((prev) => {
      const next = new Set([...prev, id])
      if (allReversibleCausesComplete(next)) {
        setCompletedQualityPromptIds((quality) => new Set([...quality, 'reversible-causes']))
      }
      return next
    })
  }

  function closeInterventions() {
    pendingContinuousCompressionsFromChecklistRef.current = false
    setShowInterventions(false)
    setInterventionStep('list')
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
    setInterventionVascularStep('route')
  }

  function rememberOtherIntervention(category: OtherInterventionCategory, label: string) {
    setSavedOtherInterventions((prev) => {
      if (prev.some((entry) => entry.category === category && entry.label === label)) return prev
      return [...prev, { category, label }]
    })
  }

  function logVascularAccess(logText: string) {
    const at =
      pendingVascularAccessAtRef.current != null
        ? new Date(pendingVascularAccessAtRef.current)
        : undefined
    pendingVascularAccessAtRef.current = null
    pushLogEntry(logText, at)
    setCompletedQualityPromptIds((prev) => new Set([...prev, 'vascular-access']))
    setShowVascularAccessReminder(false)
    setVascularAccessReminderStep('prompt')
    closeInterventions()
  }

  function openInterventions() {
    setShowInterventions(true)
    setInterventionStep('list')
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
    setInterventionVascularStep('route')
  }

  function toggleInterventions() {
    if (showInterventions) closeInterventions()
    else openInterventions()
  }

  function selectIntervention(id: InterventionId) {
    setInterventionStep(id)
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
    if (id === 'vascular-access') setInterventionVascularStep('route')
  }

  function logAirway(option: string) {
    pushLogEntry(getAirwayLogLabel(option))
    finishAirwayIntervention(option)
    closeInterventions()
  }

  function logBreathing(option: (typeof BREATHING_OPTIONS)[number]) {
    getBreathingLogEntries(option).forEach((entry) => pushLogEntry(entry))
    closeInterventions()
  }

  function logSodiumChloride(variant: (typeof SODIUM_CHLORIDE_OPTIONS)[number]) {
    pushLogEntry(getSodiumChlorideLogLabel(variant))
    closeInterventions()
  }

  function logMedication(label: string) {
    pushLogEntry(getMedicationLogLabel(label))
    closeInterventions()
  }

  function logOtherIntervention(category: OtherInterventionCategory, label: string) {
    rememberOtherIntervention(category, label)
    pushLogEntry(getOtherInterventionLogLabel(category, label))
    if (category === 'airway') finishAirwayIntervention(label)
    else pendingContinuousCompressionsFromChecklistRef.current = false
    setInterventionOtherDraft('')
    setInterventionSubStep('options')
    closeInterventions()
  }

  function interventionBack() {
    if (interventionSubStep !== 'options') {
      setInterventionSubStep('options')
      setInterventionOtherDraft('')
      return
    }
    setInterventionStep('list')
    setInterventionSubStep('options')
    setInterventionOtherDraft('')
    setInterventionVascularStep('route')
  }

  function logAdrenaline() {
    if (timerView !== 'arrest') return
    if (!initialRhythm) return
    if (!canLogAdrenaline(initialRhythm, adrenalineDoseCount, totalShocks, hasNonShockableRhythm)) return
    const isFirstMedication = adrenalineDoseCount + amiodaroneDoseCount === 0
    const needsVascularPrompt = isFirstMedication && !hasVascularAccessLogged(logEntries)
    const dose = adrenalineDoseCount + 1
    setAdrenalineDoseCount(dose)
    const atEpochMs = pushLogEntry(getAdrenalineLogLabel(dose))
    setNextAdrenalineAt(timer.elapsedSeconds + ADRENALINE_INTERVAL_SECONDS)
    if (needsVascularPrompt) maybePromptVascularAccessAfterFirstMedication(atEpochMs)
  }

  function logAmiodarone() {
    if (timerView !== 'arrest') return
    if (!initialRhythm) return
    if (!shouldShowAmiodarone(initialRhythm, totalShocks)) return
    if (!canLogAmiodarone(amiodaroneDoseCount, totalShocks)) return
    const isFirstMedication = adrenalineDoseCount + amiodaroneDoseCount === 0
    const needsVascularPrompt = isFirstMedication && !hasVascularAccessLogged(logEntries)
    const dose = amiodaroneDoseCount + 1
    setAmiodaroneDoseCount(dose)
    const atEpochMs = pushLogEntry(getAmiodaroneLogLabel(dose))
    if (needsVascularPrompt) maybePromptVascularAccessAfterFirstMedication(atEpochMs)
  }

  function afterRhythmLogged(rhythm: Rhythm, joules?: number) {
    const nextCount = nextConsecutiveShockCount(consecutiveShockCount, rhythm, joules)
    setConsecutiveShockCount(nextCount)
    if (shouldShowVectorChangeReminder(nextCount)) {
      setShowVectorChangeReminder(true)
    }
  }

  function dismissVectorChangeReminder(changed: boolean) {
    pushLogEntry(getVectorChangeLogLabel(changed))
    setShowVectorChangeReminder(false)
  }

  function beginInitialRhythm(rhythm: Rhythm) {
    if (rhythm === RHYTHM_VF_PVT) {
      openShockForm('initial')
      return
    }
    setInitialRhythm(rhythm)
    logInitialRhythm(rhythm)
    afterRhythmLogged(rhythm)
    setStep('active-resuscitation')
  }

  function confirmInitialVfvt(joules: number) {
    setInitialRhythm(RHYTHM_VF_PVT)
    logInitialRhythm(RHYTHM_VF_PVT, joules)
    setStep('active-resuscitation')
    closeShockForm()
    afterRhythmLogged(RHYTHM_VF_PVT, joules)
  }

  function appendRhythmCheck(rhythm: Rhythm, joules?: number) {
    const label = displayElapsed(timer.elapsedSeconds)
    setRhythmChecks((prev) => {
      const entry: RhythmCheckEntry = {
        minute: Math.floor(toDisplaySeconds(timer.elapsedSeconds) / 60),
        label,
        rhythm,
      }
      if (rhythm === RHYTHM_VF_PVT && joules != null) entry.shockJoules = joules
      return [...prev, entry]
    })
    pushLogEntry(formatRhythmLogLabel(rhythm, joules))
    afterRhythmLogged(rhythm, joules)
    timer.recordRhythmEntry(timer.elapsedSeconds)
    setShowRhythmCheckAlert(false)
    closeShockForm()
    exitRoscMode()
  }

  function handleCheckRhythm(rhythm: Rhythm) {
    if (rhythm === RHYTHM_VF_PVT) {
      openShockForm('check')
      return
    }
    appendRhythmCheck(rhythm)
  }

  function beginTorReview() {
    if (timerView === 'rosc') return
    setFortyFiveAcknowledged(true)
    setShowFortyFiveAlert(false)
    setCurrentRhythm(null)
    setPeaTorCriteriaMet(null)
    setStep('forty-five-minute-check')
  }

  function handleTorRhythmSelect(rhythm: Rhythm) {
    setCurrentRhythm(rhythm)
    setPeaTorCriteriaMet(null)
  }

  function resetTorRhythmSelection() {
    setCurrentRhythm(null)
    setPeaTorCriteriaMet(null)
  }

  function handleTorEndResuscitation() {
    const now = new Date()
    timer.pause()
    setMetronomeEnabled(false)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    pushLogEntry(TOR_END_LABEL, now)
    setTorEndedAtLabel(formatActualTime(now))
    setVodCountdownRemaining(VOD_COUNTDOWN_ACTUAL_SECONDS)
    setVodAtLabel(null)
    setStep('post-tor')
  }

  function handleVod() {
    if (vodCountdownRemaining > 0) return
    const now = new Date()
    pushLogEntry(VOD_LOG_LABEL, now)
    setVodAtLabel(formatActualTime(now))
    setStep('complete')
  }

  function handleTorContinueResuscitation() {
    pushLogEntry(TOR_CONTINUE_LABEL)
    setStep('active-resuscitation')
  }

  function handleTorSeekSeniorAdvice() {
    pushLogEntry(TOR_SENIOR_ADVICE_LABEL)
    setClinicalDiscussionPending(true)
    setClinicalDiscussionOpen(false)
    setStep('active-resuscitation')
  }

  function handleClinicalDiscussionContinue() {
    pushLogEntry(CLINICAL_DISCUSSION_CONTINUE_LABEL)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    if (!timer.isRunning && step !== 'post-tor') {
      timer.resume()
    }
  }

  function handleClinicalDiscussionTerminate() {
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    handleTorEndResuscitation()
  }

  function handleTimerBarRosc() {
    if (timerView === 'rosc') return
    enterRoscMode(false)
  }

  function confirmCheckVfvt(joules: number) {
    appendRhythmCheck(RHYTHM_VF_PVT, joules)
  }

  const showEarlyTransfer =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldShowEarlyTransferReminder(initialRhythm, rhythmChecks.length, earlyTransferAcknowledged)

  const showCodeShock =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldShowCodeShockReminder(totalShocks, codeShockAcknowledged)

  const showVascularAccessPanel =
    showVascularAccessReminder &&
    (step === 'select-rhythm' || step === 'active-resuscitation')

  const showRoscMonitoringArea =
    timerView === 'rosc' &&
    step === 'active-resuscitation' &&
    (sbpReminderVisible || pulseReminderVisible)

  useScrollWhenShown(showVectorChangeReminder, vectorChangeReminderRef)
  useScrollWhenShown(showEarlyTransfer, earlyTransferReminderRef)
  useScrollWhenShown(showCodeShock, codeShockReminderRef)
  useScrollWhenShown(showVascularAccessPanel, vascularAccessReminderRef)
  useScrollWhenShown(showRoscMonitoringArea, roscMonitoringReminderRef)

  const hasLog = logEntries.length > 0
  const sortedLogEntries = sortDisplayLogEntries(logEntries)

  const showRxSection =
    timerView === 'arrest' &&
    shouldShowRxSection(initialRhythm) &&
    initialRhythm != null &&
    (step === 'active-resuscitation' ||
      step === 'forty-five-minute-check' ||
      step === 'rosc-assessment')

  const displayTimerSeconds = timerView === 'rosc' ? roscElapsedSeconds : timer.elapsedSeconds
  const roscPhaseLabel = timerView === 'rosc' ? getRoscPhaseLabel(roscElapsedSeconds) : null

  useEffect(() => {
    function updateModalTopOffset() {
      const el = timerBarRef.current
      const offset =
        el && el.offsetParent !== null ? Math.ceil(el.getBoundingClientRect().bottom) : 0
      document.documentElement.style.setProperty('--timer-bar-offset', `${offset}px`)
    }

    updateModalTopOffset()
    const el = timerBarRef.current
    if (!el) return

    const ro = new ResizeObserver(updateModalTopOffset)
    ro.observe(el)
    window.addEventListener('resize', updateModalTopOffset)
    window.addEventListener('scroll', updateModalTopOffset, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateModalTopOffset)
      window.removeEventListener('scroll', updateModalTopOffset)
    }
  }, [
    step,
    timerView,
    showRxSection,
    adrenalineDoseCount,
    amiodaroneDoseCount,
    showRhythmCheckAlert,
    timer.elapsedSeconds,
    vodCountdownRemaining,
    torEndedAtLabel,
    vodAtLabel,
    clinicalDiscussionPending,
    clinicalDiscussionOpen,
  ])

  const showInterventionsButton = step === 'select-rhythm' || step === 'active-resuscitation'
  const postTorActive = step === 'post-tor'
  const vodCompleteActive = step === 'complete' && vodAtLabel != null
  const vodReady = vodCountdownRemaining <= 0
  const showResuscitationTimerControls = !postTorActive && !vodCompleteActive
  const showClinicalDiscussionTimer =
    clinicalDiscussionPending &&
    showResuscitationTimerControls &&
    step === 'active-resuscitation' &&
    timerView === 'arrest'

  function handleJumpToTestFortyFour() {
    timer.jumpToElapsed(TEST_JUMP_TO_ACTUAL_SECONDS)
  }

  function acknowledgeEarlyTransfer() {
    setEarlyTransferAcknowledged(true)
    pushLogEntry(getEarlyTransferLogLabel())
  }

  function acknowledgeCodeShock() {
    setCodeShockAcknowledged(true)
    pushLogEntry(getCodeShockLogLabel())
  }

  const interventionsPanel = showInterventions ? (
    <InterventionsPanel
      step={interventionStep}
      subStep={interventionSubStep}
      vascularAccessStep={interventionVascularStep}
      otherDraft={interventionOtherDraft}
      savedOthers={savedOtherInterventions}
      onSelectIntervention={selectIntervention}
      onSubStepChange={setInterventionSubStep}
      onOtherDraftChange={setInterventionOtherDraft}
      onVascularAccessStepChange={setInterventionVascularStep}
      onLogAirway={logAirway}
      onLogBreathing={logBreathing}
      onLogSodiumChloride={logSodiumChloride}
      onLogMedication={logMedication}
      onLogOther={logOtherIntervention}
      onVascularAccessComplete={logVascularAccess}
      onBack={() => {
        if (interventionStep === 'list') closeInterventions()
        else interventionBack()
      }}
    />
  ) : null

  return (
    <div className="app">
      <header className="header">
        <div className="header-toolbar">
          <button type="button" className="header-link-btn" onClick={() => setAboutOpen(true)}>
            About
          </button>
          <ThemeToggle />
        </div>
        <h1>Resusci-Time</h1>
        <p className="subtitle">Adult Cardiac Arrest · Ambulance Resource Protocol</p>
        <p className="als-guide-link-wrap">
          <a
            className="als-guide-link"
            href={publicAssetUrl('als-alogorhythm.png')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Advanced Life Support (ALS) alogorhythm
          </a>
        </p>
        {IS_TEST_TIMING && (
          <div className="test-mode-controls">
            <p className="test-banner">Test mode — protocol times at 10% (elapsed shows real protocol time)</p>
            {timerActive && showResuscitationTimerControls && timerView === 'arrest' && (
              <button type="button" className="btn btn-sm test-timer-jump-btn" onClick={handleJumpToTestFortyFour}>
                Jump to 44:00
              </button>
            )}
          </div>
        )}
      </header>

      {timerActive && !postTorActive && !vodCompleteActive && (
        <MetronomeToggle
          enabled={metronomeEnabled}
          onToggle={() => setMetronomeEnabled((prev) => !prev)}
        />
      )}

      {timerActive && (
        <>
        <div
          ref={timerBarRef}
          className={`timer-bar ${timer.atFortyFiveMinutes && timerView !== 'rosc' && showResuscitationTimerControls ? 'timer-critical' : ''}${postTorActive || vodCompleteActive ? ' timer-bar-post-tor' : ''}`}
        >
          <div className="timer-bar-top">
            <div className="timer-display">
              <span className="timer-label">
                {postTorActive || vodCompleteActive ? 'Resuscitation ended' : timerView === 'rosc' ? 'ROSC' : 'Elapsed'}
              </span>
              <span className="timer-value">{displayElapsed(displayTimerSeconds)}</span>
              {!postTorActive && !vodCompleteActive && (
              <span className="timer-mins">
                {timerView === 'rosc' && roscPhaseLabel ? (
                  <span className="timer-rosc-phase">{roscPhaseLabel}</span>
                ) : (
                  `${Math.floor(toDisplaySeconds(timer.elapsedSeconds) / 60)} min`
                )}
              </span>
              )}
            </div>
            {showResuscitationTimerControls && (
            <>
            <div className="timer-stat">
              <span className="timer-label">Total shocks:</span>
              <span className="timer-stat-value">{totalShocks}</span>
            </div>
            <div className="timer-controls">
              {showInterventionsButton && (
                <button
                  type="button"
                  className={`btn btn-sm timer-interventions-btn${showInterventions ? ' active' : ''}`}
                  aria-pressed={showInterventions}
                  onClick={toggleInterventions}
                >
                  Interventions
                </button>
              )}
              {timerView !== 'rosc' && (
                <button
                  type="button"
                  className="timer-action-box"
                  aria-pressed={false}
                  onClick={handleTimerBarRosc}
                >
                  ROSC
                </button>
              )}
            </div>
            {timerView !== 'rosc' && (
            <div className="timer-milestones">
              <button
                type="button"
                className={`timer-action-box${timer.atFortyFiveMinutes ? ' on' : ''}`}
                aria-label="Termination of resuscitation review"
                onClick={beginTorReview}
              >
                TOR
              </button>
            </div>
            )}
            </>
            )}
          </div>
          {showClinicalDiscussionTimer && (
            <ClinicalDiscussionTimerSection
              open={clinicalDiscussionOpen}
              onOpen={() => setClinicalDiscussionOpen(true)}
              onContinueResuscitation={handleClinicalDiscussionContinue}
              onTerminateResuscitation={handleClinicalDiscussionTerminate}
            />
          )}
          {postTorActive && torEndedAtLabel && (
            <TimerVodSection
              torEndedAtLabel={torEndedAtLabel}
              vodCountdownRemaining={vodCountdownRemaining}
              vodReady={vodReady}
              onVod={handleVod}
              formatRemaining={displayElapsed}
            />
          )}
          {vodCompleteActive && vodAtLabel && (
            <TimerVodCompleteStamp vodAtLabel={vodAtLabel} logEntries={sortedLogEntries} />
          )}
          {showResuscitationTimerControls && step === 'active-resuscitation' && timer.elapsedSeconds < FORTY_FIVE_MINUTES_SECONDS && (
            <div className="timer-next-check">
              {!showRhythmCheckAlert ? (
                <>
                  <span className="timer-next-check-label">
                    Next rhythm check: {displayElapsed(timer.secondsToNextCheck)}
                  </span>
                  <div
                    className="rhythm-check-progress-track"
                    role="progressbar"
                    aria-label="Time until next rhythm check"
                    aria-valuemin={0}
                    aria-valuemax={RHYTHM_CHECK_INTERVAL}
                    aria-valuenow={timer.secondsToNextCheck}
                  >
                    <div
                      className="rhythm-check-progress-fill"
                      style={{
                        width: `${getRhythmCheckRemainingFraction(timer.secondsToNextCheck) * 100}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                '\u00a0'
              )}
            </div>
          )}
          {showRxSection && initialRhythm && (
            <TimerRxSection
              initialRhythm={initialRhythm}
              hasNonShockableRhythm={hasNonShockableRhythm}
              adrenalineDoseCount={adrenalineDoseCount}
              amiodaroneDoseCount={amiodaroneDoseCount}
              shockCount={totalShocks}
              elapsedSeconds={timer.elapsedSeconds}
              nextAdrenalineAt={nextAdrenalineAt}
              onLogAdrenaline={logAdrenaline}
              onLogAmiodarone={logAmiodarone}
              formatRemaining={displayElapsed}
            />
          )}
          {timerView === 'rosc' && step === 'active-resuscitation' && (
            <TimerRoscRxSection atropineTotalMg={atropineTotalMg} />
          )}
        </div>
        </>
      )}

      {(step === 'select-rhythm') && (
      <div className="rhythm-prompts">
        {step === 'select-rhythm' && (
          <div className="alert alert-warning rhythm-prompt" role="region" aria-label="Initial rhythm">
            <strong>Analyse first monitored rhythm</strong>
            <p>Select the initial rhythm to follow the correct pathway.</p>
            {shockFormContext !== 'initial' ? (
              <div className="rhythm-grid alert-rhythm-grid">
                {RHYTHM_OPTIONS.map((rhythm) => (
                  <button
                    key={rhythm}
                    type="button"
                    className={`rhythm-btn ${rhythmCssClass(rhythm)}`}
                    onClick={() => beginInitialRhythm(rhythm)}
                  >
                    {rhythm}
                  </button>
                ))}
              </div>
            ) : (
              <ShockForm
                shockNumber={vfvtShockCount + 1}
                onSelect={confirmInitialVfvt}
                onCancel={closeShockForm}
              />
            )}
          </div>
        )}
      </div>
      )}

      {showVectorChangeReminder && (
        <div ref={vectorChangeReminderRef} className="vector-change-panel" role="status">
          <p>{getVectorChangePrompt()}</p>
          <div className="vector-change-actions">
            <button
              type="button"
              className="btn btn-secondary btn-lg btn-touch"
              onClick={() => dismissVectorChangeReminder(false)}
            >
              Vector NOT changed
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-touch"
              onClick={() => dismissVectorChangeReminder(true)}
            >
              Vector changed
            </button>
          </div>
        </div>
      )}

      {showEarlyTransfer && (
        <div ref={earlyTransferReminderRef} className="early-transfer-panel" role="status">
          <p>{getEarlyTransferPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeEarlyTransfer}>
            Acknowledge
          </button>
        </div>
      )}

      {showCodeShock && (
        <div ref={codeShockReminderRef} className="code-shock-panel" role="status">
          <p>{getCodeShockPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeCodeShock}>
            Acknowledge
          </button>
        </div>
      )}

      {showVascularAccessPanel && (
        <div ref={vascularAccessReminderRef} className="vascular-access-panel" role="status">
          <VascularAccessFlow
            step={vascularAccessReminderStep}
            onStepChange={setVascularAccessReminderStep}
            onComplete={logVascularAccess}
          />
        </div>
      )}

      {showRoscMonitoringArea && (
        <div ref={roscMonitoringReminderRef} className="rosc-monitoring-reminders">
          {sbpReminderVisible && (
            <div>
              <SbpReminderPanel
                expanded={sbpReminderExpanded}
                showAdrenaline50={hasSbpFluidLogged}
                showAdrenaline100={showSbpAdrenaline100}
                onAdequate={dismissSbpReminder}
                onLow={() => setSbpReminderExpanded(true)}
                onFluid250={() => logSbpFluid('250ml')}
                onFluid500={() => logSbpFluid('500ml')}
                onAdrenaline50={logSbpAdrenaline50}
                onAdrenaline100={logSbpAdrenaline100}
                onNothingAdministered={dismissSbpReminder}
                onBack={() => setSbpReminderExpanded(false)}
              />
            </div>
          )}
          {pulseReminderVisible && (
            <div>
              <PulseRateReminderPanel
                expanded={pulseReminderExpanded}
                showAtropineMaxMessage={pulseShowAtropineMaxMessage}
                onYes={handlePulseYes}
                onNo={handlePulseNo}
                onAtropineAdministered={handleAtropineAdministered}
                onAtropineNotAdministered={handleAtropineNotAdministered}
                onAtropineMaxAcknowledge={dismissPulseReminder}
                onBack={() => {
                  setPulseReminderExpanded(false)
                  setPulseShowAtropineMaxMessage(false)
                }}
              />
            </div>
          )}
        </div>
      )}

      {showFortyFiveAlert && !fortyFiveAcknowledged && timerView !== 'rosc' && (
        <div className="alert alert-critical" role="alert">
          <strong>45 minutes — Termination review</strong>
          <p>Consider termination of resuscitation according to current rhythm.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={beginTorReview}
          >
            Review termination guidance
          </button>
        </div>
      )}

      <main className="main">
        {step === 'start' && (
          <section className="card">
            <div className="card-badge">0 min</div>
            <h2>Adult cardiac arrest confirmed by ambulance resource</h2>
            <p className="lead">Begin protocol assessment.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep('initial-assessment')}>
              Start protocol
            </button>
          </section>
        )}

        {step === 'initial-assessment' && (
          <InitialAssessmentPanel
            onCommenceResuscitation={commenceResuscitation}
            onCompleteVod={finishInitialAssessmentVod}
            formatCountdown={displayElapsed}
          />
        )}

        {step === 'select-rhythm' && (
          <section className="card">
            <ResuscitationQualityChecklist
              completedIds={completedQualityPromptIds}
              completedReversibleCauseIds={completedReversibleCauseIds}
              onLogPrompt={completeQualityPrompt}
              onOpenVascularAccess={openQualityVascularAccess}
              onOpenAirwayInterventions={openQualityAirwayInterventions}
              onOpenReversibleCauses={openReversibleCausesModal}
              showCommenceLine
            />
          </section>
        )}

        {step === 'active-resuscitation' && initialRhythm && (
          <section className="card">
            <div className="card-badge">Path: {initialRhythm}</div>
            <h2>{timerView === 'rosc' ? 'Post-ROSC care' : 'Continue resuscitation'}</h2>
            {timerView === 'rosc' ? (
              <RoscChecklist
                completedTaskIds={completedRoscTaskIds}
                completedReversibleCauseIds={completedReversibleCauseIds}
                onLogTask={completeRoscTask}
                onOpenReversibleCauses={openReversibleCausesModal}
              />
            ) : (
              <>
                <ResuscitationQualityChecklist
                  completedIds={completedQualityPromptIds}
                  completedReversibleCauseIds={completedReversibleCauseIds}
                  onLogPrompt={completeQualityPrompt}
                  onOpenVascularAccess={openQualityVascularAccess}
                  onOpenAirwayInterventions={openQualityAirwayInterventions}
                  onOpenReversibleCauses={openReversibleCausesModal}
                />
                <ul className="action-list">
                  {getPathSpecificActions(initialRhythm).map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </>
            )}
            {hasLog && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary log-toggle-btn"
                  onClick={() => setShowRhythmLog((open) => !open)}
                >
                  {showRhythmLog ? 'Hide log' : 'View log'}
                </button>
                {showRhythmLog && (
                  <>
                    <p className="check-log-label">Log</p>
                    <ul className="check-log">
                      {sortedLogEntries.map((entry, i) => (
                        <li key={`${entry.atEpochMs}-${entry.text}-${i}`}>
                          <span className="check-time">{entry.label}</span>
                          <span>{entry.text}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
            {timer.atFortyFiveMinutes && fortyFiveAcknowledged && timerView !== 'rosc' && (
              <button type="button" className="btn btn-primary" onClick={beginTorReview}>
                View 45-minute termination guidance
              </button>
            )}
            <p className="hint">
              Rhythm assessment every 2 minutes from last entry.
              {(initialRhythm === RHYTHM_VF_PVT || initialRhythm === 'PEA') &&
                ' Early transfer reminder after third rhythm check.'}
              {timerView !== 'rosc' && ' Special review at 45 minutes.'}
            </p>
          </section>
        )}

        {step === 'forty-five-minute-check' && initialRhythm && (
          <section className="card">
            <div className="card-badge critical">TOR</div>
            <h2>Termination of resuscitation</h2>
            <TerminationReview
              initialRhythm={initialRhythm}
              currentRhythm={currentRhythm}
              peaTorCriteriaMet={peaTorCriteriaMet}
              sustainedRoscEverAchieved={sustainedRoscEverAchieved}
              onSelectRhythm={handleTorRhythmSelect}
              onResetRhythm={resetTorRhythmSelection}
              onPeaCriteriaAnswer={setPeaTorCriteriaMet}
              onEndResuscitation={handleTorEndResuscitation}
              onContinueResuscitation={handleTorContinueResuscitation}
              onSeekSeniorAdvice={handleTorSeekSeniorAdvice}
            />
          </section>
        )}

        {step === 'rosc-assessment' && (
          <section className="card">
            <div className="card-badge critical">45 min — ROSC?</div>
            <h2>Return of spontaneous circulation</h2>
            <div className="rosc-options">
              {(
                [
                  ['sustained', 'Sustained ROSC', '>10 minutes with output'],
                  ['transient', 'Transient ROSC', 'Output lasting <10 minutes'],
                  ['none', 'No ROSC', 'No return of circulation'],
                ] as const
              ).map(([value, label, desc]) => (
                <button
                  key={value}
                  type="button"
                  className={`rosc-btn ${roscStatus === value ? 'selected' : ''}`}
                  onClick={() => setRoscStatus(value)}
                >
                  <span className="rosc-label">{label}</span>
                  <span className="rosc-desc">{desc}</span>
                </button>
              ))}
            </div>

            {roscStatus && (
              <div className="guidance">
                <p>{getRoscGuidance(roscStatus)}</p>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep('complete')}>
                  Complete protocol
                </button>
              </div>
            )}
          </section>
        )}

        {step === 'post-tor' && (
          <section className="card card-terminal">
            <div className="card-badge critical">TOR</div>
            <h2>Resuscitation ended</h2>
            <p className="lead">
              Resuscitation has been terminated. Complete the verification-of-death wait shown in the timer bar,
              then record VOD when appropriate.
            </p>
            {torEndedAtLabel && <p className="tor-stamp-summary">TOR occurred at {torEndedAtLabel}</p>}
            <EventLogPanel entries={sortedLogEntries} />
          </section>
        )}

        {step === 'complete' && (
          <section className="card card-complete">
            <h2>Protocol complete</h2>
            {initialRhythm && <p>Initial rhythm: {initialRhythm}</p>}
            {currentRhythm && <p>Final rhythm: {currentRhythm}</p>}
            {roscStatus && <p>ROSC status: {roscStatus.replace('-', ' ')}</p>}
            {torEndedAtLabel && <p>TOR occurred at {torEndedAtLabel}</p>}
            {vodAtLabel && (
              <VodTimestampsSummary entries={sortedLogEntries} vodAtLabel={vodAtLabel} />
            )}
            <p className="elapsed-summary">Total elapsed: {displayElapsed(timer.elapsedSeconds)}</p>
            {vodAtLabel && hasLog && <EventLogPanel entries={sortedLogEntries} />}
            <button type="button" className="btn btn-primary btn-lg" onClick={resetAll}>
              New case
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Refer to guideline for details. This tool supports clinical decision-making — it does not replace local protocols or senior clinical judgement.</p>
        <p>
          <button type="button" className="footer-link-btn" onClick={() => setAboutOpen(true)}>
            About &amp; contact
          </button>
        </p>
      </footer>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      {showInterventions && (
        <div
          className="interventions-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Interventions"
        >
          {interventionsPanel}
        </div>
      )}

      {showReversibleCausesModal && (
        <ReversibleCausesModal
          completedIds={completedReversibleCauseIds}
          onToggle={toggleReversibleCause}
          onClose={closeReversibleCausesModal}
        />
      )}

      {showRhythmCheckAlert && step === 'active-resuscitation' && (
        <div
          className="rhythm-check-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rhythm-check-title"
        >
          <div className="alert alert-warning rhythm-check-modal-panel">
            <strong id="rhythm-check-title">
              Rhythm assessment due — {displayElapsed(timer.elapsedSeconds)}
            </strong>
            <p>Select the current monitored rhythm.</p>
            {shockFormContext !== 'check' && (
              <div className="rhythm-grid alert-rhythm-grid">
                {RHYTHM_OPTIONS.map((rhythm) => (
                  <button
                    key={rhythm}
                    type="button"
                    className={`rhythm-btn ${rhythmCssClass(rhythm)}`}
                    onClick={() => handleCheckRhythm(rhythm)}
                  >
                    {rhythm}
                  </button>
                ))}
                <button
                  type="button"
                  className="rhythm-btn rhythm-rosc"
                  onClick={handleRhythmCheckRosc}
                >
                  ROSC
                </button>
              </div>
            )}
            {shockFormContext === 'check' && (
              <ShockForm
                shockNumber={vfvtShockCount + 1}
                onSelect={confirmCheckVfvt}
                onCancel={closeShockForm}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
