import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { serviceConfig } from './config'
import { parseShareFromLocation, type SharedLogPayload } from './logShare'
import {
  autosaveLog,
  clearAutosaveLog,
  formatSavedLogLabel,
  getAutosaveLog,
  isLogStorageAvailable,
  type SavedLogMeta,
  type SavedLogRecord,
} from './logStorage'
import { useTimer } from './hooks/useTimer'
import { MetronomeToggle } from './components/MetronomeToggle'
import { useMetronome } from './hooks/useMetronome'
import { useWakeLock } from './hooks/useWakeLock'
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
  getProlongedVfPrompt,
  hasProlongedVfLogged,
  isProlongedVfTorGateEnabled,
  PROLONGED_VF_LOG_LABEL,
  shouldTriggerProlongedVf,
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
  TOR_REASSESSMENT_CONTINUE_LOG,
  TOR_REASSESSMENT_STARTED_LOG,
  TOR_SENIOR_ADVICE_LABEL,
  TOR_SPECIAL_CIRCUMSTANCES_NO_LOG,
  TOR_SPECIAL_CIRCUMSTANCES_YES_LOG,
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
import { DocumentsModal } from './components/DocumentsModal'
import {
  dismissPreviewWarningSession,
  isPreviewWarningDismissed,
  PreviewDevelopmentWarningModal,
} from './components/PreviewDevelopmentWarningModal'
import { AppVersionInfo } from './components/AppVersionInfo'
import { getBlogUrl } from './blogUrl'
import { InstallAppButton } from './components/InstallAppButton'
import { RoscChecklist } from './components/RoscChecklist'
import { TimerRxSection } from './components/TimerRxSection'
import { TimerRoscRxSection } from './components/TimerRoscRxSection'
import { ClinicalDiscussionTimerSection } from './components/ClinicalDiscussionTimerSection'
import { EventLogPanel } from './components/EventLogPanel'
import { SharedLogViewer } from './components/SharedLogViewer'
import { SavedLogsModal } from './components/SavedLogsModal'
import { TimerVodCompleteStamp, TimerVodSection } from './components/TimerVodSection'
import { VodTimestampsSummary } from './components/VodTimestampsSummary'
import { PulseRateReminderPanel } from './components/PulseRateReminderPanel'
import { SbpReminderPanel } from './components/SbpReminderPanel'
import { TerminationReview } from './components/TerminationReview'
import { ThemeToggle } from './components/ThemeToggle'
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
  getReversibleCauseUncheckedLogLabel,
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
  CIRCULATION_OPTIONS,
  getAirwayLogLabel,
  getBreathingLogEntries,
  getCirculationLogLabel,
  getMedicationLogLabel,
  getOtherInterventionLogLabel,
  getSodiumChlorideLogLabel,
  hasVascularAccessLogged,
  isContinuousCompressionsAirwayOption,
  shouldPromptVascularAccessAfterFirstAdrenaline,
  SODIUM_CHLORIDE_OPTIONS,
} from './interventions'
import type { DisplayLogEntry, ProtocolStep, Rhythm, RoscStatus } from './types'
import { PreviewSpeedControl } from './components/PreviewSpeedControl'
import { useTimingConfig } from './context/TimingConfigContext'
import { IS_PREVIEW_BUILD, getRhythmCheckRemainingFraction, getTestModeBannerText, toDisplaySeconds } from './timing'
import type { PreviewSpeedMultiplier } from './previewSpeed'
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

function displayElapsed(actualSeconds: number, timeScale: number) {
  return formatElapsed(toDisplaySeconds(actualSeconds, timeScale))
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
  const {
    timing,
    previewSpeedMultiplier,
    setPreviewSpeedMultiplier,
    showPreviewSpeedControl,
  } = useTimingConfig()

  const [step, setStep] = useState<ProtocolStep>('start')
  const [initialRhythm, setInitialRhythm] = useState<Rhythm | null>(null)
  const [currentRhythm, setCurrentRhythm] = useState<Rhythm | null>(null)
  const [, setHeartRate] = useState('')
  const [, setQrsWidthMs] = useState('')
  const [roscStatus, setRoscStatus] = useState<RoscStatus | null>(null)
  const [fortyFiveAcknowledged, setFortyFiveAcknowledged] = useState(false)
  const [earlyTransferAcknowledged, setEarlyTransferAcknowledged] = useState(false)
  const [codeShockAcknowledged, setCodeShockAcknowledged] = useState(false)
  const [prolongedVfAcknowledged, setProlongedVfAcknowledged] = useState(false)
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
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [previewWarningOpen, setPreviewWarningOpen] = useState(
    () => IS_PREVIEW_BUILD && !isPreviewWarningDismissed(),
  )
  const [savedLogsOpen, setSavedLogsOpen] = useState(false)
  const [autosaveOffer, setAutosaveOffer] = useState<SavedLogRecord | null>(null)
  const [sharedLog, setSharedLog] = useState<SharedLogPayload | null>(() => parseShareFromLocation())
  const preRhythmModalsRef = useRef<PreRhythmModalState | null>(null)
  const prevRhythmCheckAlertOpenRef = useRef(false)
  const pendingContinuousCompressionsFromChecklistRef = useRef(false)
  const timerBarRef = useRef<HTMLDivElement>(null)
  const vectorChangeReminderRef = useRef<HTMLDivElement>(null)
  const earlyTransferReminderRef = useRef<HTMLDivElement>(null)
  const codeShockReminderRef = useRef<HTMLDivElement>(null)
  const prolongedVfAlertRef = useRef<HTMLDivElement>(null)
  const vascularAccessReminderRef = useRef<HTMLDivElement>(null)
  const roscMonitoringReminderRef = useRef<HTMLDivElement>(null)
  const roscNextReminderAtRef = useRef(timing.roscMonitoringReminderIntervalSeconds)
  const sbpAdrenaline50AwaitingNextReminderRef = useRef(false)
  const prolongedVfLoggedRef = useRef(false)
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
  const [torSpecialCircumstancesBelieved, setTorSpecialCircumstancesBelieved] = useState<boolean | null>(null)
  const [torEndedAtLabel, setTorEndedAtLabel] = useState<string | null>(null)
  const [vodCountdownRemaining, setVodCountdownRemaining] = useState(timing.vodCountdownActualSeconds)
  const [vodAtLabel, setVodAtLabel] = useState<string | null>(null)
  const [sustainedRoscEverAchieved, setSustainedRoscEverAchieved] = useState(false)
  const [clinicalDiscussionPending, setClinicalDiscussionPending] = useState(false)
  const [clinicalDiscussionOpen, setClinicalDiscussionOpen] = useState(false)
  const [clinicalDiscussionContinued, setClinicalDiscussionContinued] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [completedRoscTaskIds, setCompletedRoscTaskIds] = useState<Set<RoscTaskId>>(() => new Set())

  const atropineMaxReached = isAtropineMaxReached(atropineTotalMg)

  const totalShocks = rhythmChecks.filter((c) => c.shockJoules != null).length
  const vfvtShockCount = totalShocks
  const hasNonShockableRhythm = hasNonShockableRhythmLogged(rhythmChecks.map((c) => c.rhythm))

  const formatProtocolElapsed = useCallback(
    (actualSeconds: number) => displayElapsed(actualSeconds, timing.timeScale),
    [timing.timeScale],
  )

  const openShockForm = (context: ShockContext) => {
    setShockFormContext(context)
  }

  const closeShockForm = () => setShockFormContext(null)

  const timer = useTimer({
    timing,
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
    if (roscElapsedSeconds >= timing.roscSustainedThresholdActualSeconds) {
      sustainedRoscLoggedRef.current = true
      pushLogEntry(getSustainedRoscAchievedLogLabel())
      setSustainedRoscEverAchieved(true)
    }
  }, [roscElapsedSeconds, timerView])

  useEffect(() => {
    if (timerView !== 'rosc') return
    if (roscElapsedSeconds > 0 && roscElapsedSeconds >= roscNextReminderAtRef.current) {
      showRoscMonitoringReminders()
      roscNextReminderAtRef.current = roscElapsedSeconds + timing.roscMonitoringReminderIntervalSeconds
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
    roscNextReminderAtRef.current = timing.roscMonitoringReminderIntervalSeconds
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
    roscNextReminderAtRef.current = timing.roscMonitoringReminderIntervalSeconds
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
    if (timer.elapsedSeconds >= timing.fortyFiveMinutesSeconds && !fortyFiveAcknowledged) {
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
  useWakeLock(timerActive)

  function handleNewCase() {
    if (logEntries.length > 0 && !window.confirm('Start a new case? The current log will be cleared.')) {
      return
    }
    resetAll()
  }

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
    setProlongedVfAcknowledged(false)
    prolongedVfLoggedRef.current = false
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
    setTorSpecialCircumstancesBelieved(null)
    setTorEndedAtLabel(null)
    setVodCountdownRemaining(timing.vodCountdownActualSeconds)
    setVodAtLabel(null)
    setSustainedRoscEverAchieved(false)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    setClinicalDiscussionContinued(false)
    sustainedRoscLoggedRef.current = false
    setAutosaveOffer(null)
    void clearAutosaveLog()
    roscNextReminderAtRef.current = timing.roscMonitoringReminderIntervalSeconds
    timer.reset()
  }

  function handlePreviewSpeedChange(speed: PreviewSpeedMultiplier) {
    if (speed === previewSpeedMultiplier) return
    const caseInProgress =
      step !== 'start' &&
      step !== 'initial-assessment' &&
      step !== 'do-not-resuscitate' &&
      (logEntries.length > 0 || timer.isRunning || step !== 'complete')
    if (caseInProgress) {
      const ok = window.confirm('Change preview speed? This will reset the current case.')
      if (!ok) return
      resetAll()
    }
    setPreviewSpeedMultiplier(speed)
  }

  function pushLogEntry(text: string, at?: Date): number {
    const entry = createDisplayLogEntry(text, at ?? new Date())
    setLogEntries((prev) => [...prev, entry])
    return entry.atEpochMs
  }

  function maybePromptVascularAccessIfNotEstablished(atEpochMs: number, entries: readonly DisplayLogEntry[]) {
    if (hasVascularAccessLogged(entries)) return
    pendingVascularAccessAtRef.current = atEpochMs
    setShowVascularAccessReminder(true)
    setVascularAccessReminderStep('prompt')
  }

  function logInitialRhythm(rhythm: Rhythm, joules?: number) {
    const elapsed = timer.elapsedSeconds
    const label = formatProtocolElapsed(elapsed)
    const entry: RhythmCheckEntry = {
      minute: Math.floor(toDisplaySeconds(elapsed, timing.timeScale) / 60),
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

  function logVodCriteria(labels: string[], at?: Date) {
    const when = at ?? new Date()
    for (const label of labels) {
      pushLogEntry(getVodCriteriaLogLabel(label), when)
    }
  }

  function finishInitialAssessmentVod(criteriaLabels: string[] = []) {
    const now = new Date()
    logVodCriteria(criteriaLabels, now)
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
    const label = REVERSIBLE_CAUSES.find((item) => item.id === id)?.label
    if (!label) return

    if (completedReversibleCauseIds.has(id)) {
      pushLogEntry(getReversibleCauseUncheckedLogLabel(label))
      setCompletedReversibleCauseIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setCompletedQualityPromptIds((quality) => {
        if (!quality.has('reversible-causes')) return quality
        const next = new Set(quality)
        next.delete('reversible-causes')
        return next
      })
      return
    }

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

  function logCirculation(option: (typeof CIRCULATION_OPTIONS)[number]) {
    pushLogEntry(getCirculationLogLabel(option))
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
    const needsVascularPrompt = shouldPromptVascularAccessAfterFirstAdrenaline(
      adrenalineDoseCount,
      logEntries,
    )
    const dose = adrenalineDoseCount + 1
    setAdrenalineDoseCount(dose)
    const atEpochMs = pushLogEntry(getAdrenalineLogLabel(dose))
    setNextAdrenalineAt(timer.elapsedSeconds + timing.adrenalineIntervalSeconds)
    if (needsVascularPrompt) maybePromptVascularAccessIfNotEstablished(atEpochMs, logEntries)
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
    if (needsVascularPrompt) maybePromptVascularAccessIfNotEstablished(atEpochMs, logEntries)
  }

  function afterRhythmLogged(rhythm: Rhythm, joules?: number) {
    const nextCount = nextConsecutiveShockCount(consecutiveShockCount, rhythm, joules)
    setConsecutiveShockCount(nextCount)
    if (nextCount === 0) {
      prolongedVfLoggedRef.current = false
      setProlongedVfAcknowledged(false)
    }
    if (shouldShowVectorChangeReminder(nextCount)) {
      setShowVectorChangeReminder(true)
    }
    if (shouldTriggerProlongedVf(nextCount) && !prolongedVfLoggedRef.current) {
      prolongedVfLoggedRef.current = true
      pushLogEntry(PROLONGED_VF_LOG_LABEL)
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
    const label = formatProtocolElapsed(timer.elapsedSeconds)
    setRhythmChecks((prev) => {
      const entry: RhythmCheckEntry = {
        minute: Math.floor(toDisplaySeconds(timer.elapsedSeconds, timing.timeScale) / 60),
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

  function beginTorReview(source: 'manual' | 'scheduled' = 'scheduled') {
    if (timerView === 'rosc' || initialRhythm == null) return
    setFortyFiveAcknowledged(true)
    setShowFortyFiveAlert(false)
    setCurrentRhythm(null)
    setPeaTorCriteriaMet(null)
    setTorSpecialCircumstancesBelieved(null)
    if (source === 'manual') {
      pushLogEntry(TOR_REASSESSMENT_STARTED_LOG)
      setStep('tor-reassessment')
    } else {
      setStep('forty-five-minute-check')
    }
    requestAnimationFrame(() => {
      document.querySelector('.main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function completeTorReassessment() {
    pushLogEntry(TOR_REASSESSMENT_CONTINUE_LOG)
    setStep('forty-five-minute-check')
    requestAnimationFrame(() => {
      document.querySelector('.main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function finishTorReassessmentVod(criteriaLabels: string[] = []) {
    const now = new Date()
    timer.pause()
    setMetronomeEnabled(false)
    logVodCriteria(criteriaLabels, now)
    pushLogEntry(VOD_LOG_LABEL, now)
    setVodAtLabel(formatActualTime(now))
    setStep('complete')
  }

  function cancelTorReview() {
    setCurrentRhythm(null)
    setPeaTorCriteriaMet(null)
    setTorSpecialCircumstancesBelieved(null)
    setStep(initialRhythm != null ? 'active-resuscitation' : 'select-rhythm')
  }

  function handleTorSpecialCircumstancesAnswer(believed: boolean) {
    pushLogEntry(believed ? TOR_SPECIAL_CIRCUMSTANCES_YES_LOG : TOR_SPECIAL_CIRCUMSTANCES_NO_LOG)
    setTorSpecialCircumstancesBelieved(believed)
    if (believed) {
      setCurrentRhythm(null)
      setPeaTorCriteriaMet(null)
    }
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
    setClinicalDiscussionContinued(false)
    pushLogEntry(TOR_END_LABEL, now)
    setTorEndedAtLabel(formatActualTime(now))
    setVodCountdownRemaining(timing.vodCountdownActualSeconds)
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
    setClinicalDiscussionContinued(false)
    setStep('active-resuscitation')
  }

  function handleClinicalDiscussionContinue() {
    pushLogEntry(CLINICAL_DISCUSSION_CONTINUE_LABEL)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    setClinicalDiscussionContinued(true)
    if (!timer.isRunning && step !== 'post-tor') {
      timer.resume()
    }
  }

  function handleClinicalDiscussionTerminate() {
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    setClinicalDiscussionContinued(false)
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

  const showProlongedVf =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldTriggerProlongedVf(consecutiveShockCount) &&
    !prolongedVfAcknowledged

  const torProlongedVfGate =
    isProlongedVfTorGateEnabled() &&
    hasProlongedVfLogged(logEntries.map((entry) => entry.text))

  const canBeginTorReview =
    initialRhythm != null &&
    timerView !== 'rosc' &&
    step !== 'tor-reassessment' &&
    step !== 'forty-five-minute-check'

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
  useScrollWhenShown(showProlongedVf, prolongedVfAlertRef)
  useScrollWhenShown(showVascularAccessPanel, vascularAccessReminderRef)
  useScrollWhenShown(showRoscMonitoringArea, roscMonitoringReminderRef)

  const hasLog = logEntries.length > 0
  const sortedLogEntries = sortDisplayLogEntries(logEntries)
  const logDocumentTitle = serviceConfig.headerTitle
  const logSaveMeta: SavedLogMeta = {
    ...(initialRhythm ? { initialRhythm } : {}),
    ...(hasLog ? { elapsed: formatProtocolElapsed(timer.elapsedSeconds) } : {}),
    ...(torEndedAtLabel ? { torAt: torEndedAtLabel } : {}),
    ...(vodAtLabel ? { vodAt: vodAtLabel } : {}),
  }

  useEffect(() => {
    function syncShareFromHash() {
      setSharedLog(parseShareFromLocation())
    }
    window.addEventListener('hashchange', syncShareFromHash)
    return () => window.removeEventListener('hashchange', syncShareFromHash)
  }, [])

  useEffect(() => {
    if (sharedLog) return
    void getAutosaveLog().then((record) => {
      if (record && record.entries.length > 0) {
        setAutosaveOffer(record)
      }
    })
  }, [sharedLog])

  useEffect(() => {
    if (!isLogStorageAvailable() || logEntries.length === 0) return

    const timer = window.setTimeout(() => {
      void autosaveLog({
        trustId: serviceConfig.trustId,
        documentTitle: logDocumentTitle,
        entries: sortedLogEntries,
        meta: logSaveMeta,
      })
    }, 800)

    return () => window.clearTimeout(timer)
  }, [
    logEntries,
    logDocumentTitle,
    sortedLogEntries,
    initialRhythm,
    torEndedAtLabel,
    vodAtLabel,
    timer.elapsedSeconds,
  ])

  useEffect(() => {
    if (logEntries.length > 0 || step !== 'start') {
      setAutosaveOffer(null)
    }
  }, [logEntries.length, step])

  const showRxSection =
    timerView === 'arrest' &&
    shouldShowRxSection(initialRhythm) &&
    initialRhythm != null &&
    (step === 'active-resuscitation' ||
      step === 'tor-reassessment' ||
      step === 'forty-five-minute-check' ||
      step === 'rosc-assessment')

  const displayTimerSeconds = timerView === 'rosc' ? roscElapsedSeconds : timer.elapsedSeconds
  const roscPhaseLabel = timerView === 'rosc' ? getRoscPhaseLabel(roscElapsedSeconds, timing.timeScale) : null

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
    clinicalDiscussionContinued,
  ])

  const showInterventionsButton = step === 'select-rhythm' || step === 'active-resuscitation'
  const postTorActive = step === 'post-tor'
  const vodCompleteActive = step === 'complete' && vodAtLabel != null
  const vodReady = vodCountdownRemaining <= 0
  const showResuscitationTimerControls = !postTorActive && !vodCompleteActive
  const resuscitationOngoing =
    step === 'active-resuscitation' ||
    step === 'tor-reassessment' ||
    step === 'forty-five-minute-check'
  const showClinicalDiscussionTimer =
    clinicalDiscussionPending &&
    showResuscitationTimerControls &&
    step === 'active-resuscitation' &&
    timerView === 'arrest'
  const clinicalDiscussionStatus = clinicalDiscussionOpen ? 'open' : 'collapsed'
  const timerBarTone =
    postTorActive || vodCompleteActive
      ? 'post-tor'
      : clinicalDiscussionPending && timerView === 'arrest'
        ? 'amber'
        : timer.atFortyFiveMinutes &&
            !clinicalDiscussionContinued &&
            timerView !== 'rosc' &&
            showResuscitationTimerControls
          ? 'critical'
          : 'default'

  function getTimerBarStyle(): CSSProperties | undefined {
    if (timerBarTone === 'amber') {
      return { background: '#d97706' }
    }
    return undefined
  }

  function getTimerBarClassName(): string {
    const classes = ['timer-bar']
    if (timerBarTone === 'post-tor') classes.push('timer-bar-post-tor')
    if (timerBarTone === 'critical') classes.push('timer-critical')
    if (timerBarTone === 'amber') classes.push('timer-clinical-discussion-active')
    return classes.join(' ')
  }

  function handleJumpToTestFortyFour() {
    timer.jumpToElapsed(timing.testJumpToActualSeconds)
  }

  function acknowledgeEarlyTransfer() {
    setEarlyTransferAcknowledged(true)
    pushLogEntry(getEarlyTransferLogLabel())
  }

  function acknowledgeCodeShock() {
    setCodeShockAcknowledged(true)
    pushLogEntry(getCodeShockLogLabel())
  }

  function acknowledgeProlongedVf() {
    setProlongedVfAcknowledged(true)
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
      onLogCirculation={logCirculation}
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
          <div className="header-toolbar-start">
            <button type="button" className="header-link-btn" onClick={() => setAboutOpen(true)}>
              About
            </button>
            <button type="button" className="header-link-btn" onClick={() => setDocumentsOpen(true)}>
              Documents
            </button>
            <button type="button" className="header-link-btn" onClick={() => setSavedLogsOpen(true)}>
              Saved logs
            </button>
            <InstallAppButton />
          </div>
          <ThemeToggle />
        </div>
        <h1>{serviceConfig.headerTitle}</h1>
        <p className="subtitle">Adult Cardiac Arrest · Ambulance Resource Protocol</p>
        {(IS_PREVIEW_BUILD || timing.isTestTiming) && (
          <div className="test-mode-controls">
            {timing.isTestTiming && !IS_PREVIEW_BUILD && (
              <p className="test-banner">{getTestModeBannerText(timing)}</p>
            )}
            {showPreviewSpeedControl && previewSpeedMultiplier != null && (
              <PreviewSpeedControl value={previewSpeedMultiplier} onChange={handlePreviewSpeedChange} />
            )}
            {timerActive && showResuscitationTimerControls && timerView === 'arrest' && (
              <button type="button" className="btn btn-sm test-timer-jump-btn" onClick={handleJumpToTestFortyFour}>
                Jump to 44:00
              </button>
            )}
          </div>
        )}
      </header>

      {autosaveOffer && step === 'start' && logEntries.length === 0 && !sharedLog && (
        <div className="autosave-restore-banner card" role="status">
          <p>
            Autosaved log from {formatSavedLogLabel(autosaveOffer.savedAt)} (
            {autosaveOffer.entries.length} events). Restore log entries or discard?
          </p>
          <div className="autosave-restore-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setLogEntries(autosaveOffer.entries.map((entry) => ({ ...entry })))
                setShowRhythmLog(true)
                setAutosaveOffer(null)
              }}
            >
              Restore log
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                void clearAutosaveLog()
                setAutosaveOffer(null)
              }}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSavedLogsOpen(true)}
            >
              Saved logs
            </button>
          </div>
        </div>
      )}

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
          className={getTimerBarClassName()}
          style={getTimerBarStyle()}
        >
          <div className="timer-bar-top">
            <div className="timer-display">
              <span className="timer-label">
                {postTorActive || vodCompleteActive ? 'Resuscitation ended' : timerView === 'rosc' ? 'ROSC' : 'Elapsed'}
              </span>
              <span className="timer-value">{formatProtocolElapsed(displayTimerSeconds)}</span>
              {!postTorActive && !vodCompleteActive && (
              <span className="timer-mins">
                {timerView === 'rosc' && roscPhaseLabel ? (
                  <span className="timer-rosc-phase">{roscPhaseLabel}</span>
                ) : (
                  `${Math.floor(toDisplaySeconds(timer.elapsedSeconds, timing.timeScale) / 60)} min`
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
                title={canBeginTorReview ? undefined : 'Log the initial rhythm before opening TOR review'}
                disabled={!canBeginTorReview}
                onClick={() => beginTorReview('manual')}
              >
                TOR
              </button>
            </div>
            )}
            </>
            )}
          </div>
          {postTorActive && torEndedAtLabel && (
            <TimerVodSection
              torEndedAtLabel={torEndedAtLabel}
              vodCountdownRemaining={vodCountdownRemaining}
              vodReady={vodReady}
              onVod={handleVod}
              formatRemaining={formatProtocolElapsed}
            />
          )}
          {vodCompleteActive && vodAtLabel && (
            <TimerVodCompleteStamp vodAtLabel={vodAtLabel} logEntries={sortedLogEntries} />
          )}
          {showResuscitationTimerControls && resuscitationOngoing && (
            <div className="timer-next-check">
              {!showRhythmCheckAlert ? (
                <>
                  <span className="timer-next-check-label">
                    Next rhythm check: {formatProtocolElapsed(timer.secondsToNextCheck)}
                  </span>
                  <div
                    className="rhythm-check-progress-track"
                    role="progressbar"
                    aria-label="Time until next rhythm check"
                    aria-valuemin={0}
                    aria-valuemax={timing.rhythmCheckInterval}
                    aria-valuenow={timer.secondsToNextCheck}
                  >
                    <div
                      className="rhythm-check-progress-fill"
                      style={{
                        width: `${getRhythmCheckRemainingFraction(timer.secondsToNextCheck, timing.rhythmCheckInterval) * 100}%`,
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
              formatRemaining={formatProtocolElapsed}
            />
          )}
          {timerView === 'rosc' && step === 'active-resuscitation' && (
            <TimerRoscRxSection atropineTotalMg={atropineTotalMg} />
          )}
          {showClinicalDiscussionTimer && (
            <ClinicalDiscussionTimerSection
              status={clinicalDiscussionStatus}
              onOpen={() => setClinicalDiscussionOpen(true)}
              onContinueResuscitation={handleClinicalDiscussionContinue}
              onTerminateResuscitation={handleClinicalDiscussionTerminate}
            />
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

      {showProlongedVf && (
        <div ref={prolongedVfAlertRef} className="prolonged-vf-panel" role="status">
          <p>{getProlongedVfPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeProlongedVf}>
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
            onLogObservationCriteria={logVodCriteria}
            formatCountdown={formatProtocolElapsed}
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
                  <EventLogPanel
                    entries={sortedLogEntries}
                    documentTitle={logDocumentTitle}
                    saveMeta={logSaveMeta}
                  />
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

        {step === 'tor-reassessment' && (
          <InitialAssessmentPanel
            mode="tor-reassessment"
            onCommenceResuscitation={completeTorReassessment}
            onCompleteVod={finishTorReassessmentVod}
            onLogObservationCriteria={logVodCriteria}
            formatCountdown={formatProtocolElapsed}
            onCancel={cancelTorReview}
          />
        )}

        {step === 'forty-five-minute-check' && (
          <section className="card">
            <div className="card-badge critical">TOR</div>
            <h2>Termination of resuscitation</h2>
            {initialRhythm ? (
              <TerminationReview
                initialRhythm={initialRhythm}
                currentRhythm={currentRhythm}
                torProlongedVfGate={torProlongedVfGate}
                specialCircumstancesBelieved={torSpecialCircumstancesBelieved}
                peaTorCriteriaMet={peaTorCriteriaMet}
                sustainedRoscEverAchieved={sustainedRoscEverAchieved}
                onSpecialCircumstancesAnswer={handleTorSpecialCircumstancesAnswer}
                onSelectRhythm={handleTorRhythmSelect}
                onResetRhythm={resetTorRhythmSelection}
                onPeaCriteriaAnswer={setPeaTorCriteriaMet}
                onEndResuscitation={handleTorEndResuscitation}
                onContinueResuscitation={handleTorContinueResuscitation}
                onSeekSeniorAdvice={handleTorSeekSeniorAdvice}
              />
            ) : (
              <>
                <p className="lead">
                  Log the initial monitored rhythm before reviewing termination of resuscitation.
                </p>
                <button type="button" className="btn btn-primary btn-lg" onClick={cancelTorReview}>
                  Back to rhythm selection
                </button>
              </>
            )}
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
            <EventLogPanel
              entries={sortedLogEntries}
              documentTitle={logDocumentTitle}
              saveMeta={logSaveMeta}
            />
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
            <p className="elapsed-summary">Total elapsed: {formatProtocolElapsed(timer.elapsedSeconds)}</p>
            {vodAtLabel && hasLog && (
              <EventLogPanel
                entries={sortedLogEntries}
                documentTitle={logDocumentTitle}
                saveMeta={logSaveMeta}
              />
            )}
            <button type="button" className="btn btn-primary btn-lg" onClick={handleNewCase}>
              New case
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Refer to guideline for details. This tool supports clinical decision-making — it does not replace local protocols or senior clinical judgement.</p>
        <p className="footer-actions">
          <a className="footer-link-btn" href={getBlogUrl(serviceConfig.trustId)}>
            Blog — updates &amp; guides
          </a>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <button type="button" className="footer-link-btn" onClick={() => setAboutOpen(true)}>
            About &amp; contact
          </button>
        </p>
        <AppVersionInfo />
      </footer>

      {previewWarningOpen && (
        <PreviewDevelopmentWarningModal
          onAcknowledge={() => {
            dismissPreviewWarningSession()
            setPreviewWarningOpen(false)
          }}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      {documentsOpen && <DocumentsModal onClose={() => setDocumentsOpen(false)} />}

      {savedLogsOpen && <SavedLogsModal onClose={() => setSavedLogsOpen(false)} />}

      {sharedLog && (
        <SharedLogViewer payload={sharedLog} onClose={() => setSharedLog(null)} />
      )}

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

      {showRhythmCheckAlert && resuscitationOngoing && (
        <div
          className="rhythm-check-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rhythm-check-title"
        >
          <div className="alert alert-warning rhythm-check-modal-panel">
            <strong id="rhythm-check-title">
              Rhythm assessment due — {formatProtocolElapsed(timer.elapsedSeconds)}
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
