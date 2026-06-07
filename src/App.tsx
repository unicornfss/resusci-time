import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { serviceConfig } from './config'
import { parseShareFromLocation, type SharedLogPayload } from './logShare'
import {
  adjustSnapshotForHandoffReceive,
  buildCaseHandoffPayload,
  clearCaseHandedOffSession,
  clearCaseHandoffHash,
  isCaseHandedOffThisSession,
  markCaseHandedOffThisSession,
  parseCaseHandoffFromLocation,
  type CaseHandoffPayload,
} from './caseHandoff'
import {
  getCaseTransferImminentWarnings,
} from './caseTransferWarning'
import {
  autosaveLog,
  clearAutosaveLog,
  createSavedLogId,
  formatSavedLogLabel,
  getAutosaveLog,
  isLogStorageAvailable,
  upsertSavedLog,
  type SavedLogMeta,
  type SavedLogRecord,
} from './logStorage'
import { useTimer } from './hooks/useTimer'
import { MetronomeToggle } from './components/MetronomeToggle'
import { TimerActionButton } from './components/TimerActionButton'
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
  PATIENT_HANDED_OVER_LOG_LABEL,
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
import { AcknowledgementsModal } from './components/AcknowledgementsModal'
import { DocumentsModal } from './components/DocumentsModal'
import { PreviewDevelopmentWarningModal } from './components/PreviewDevelopmentWarningModal'
import { AppVersionInfo } from './components/AppVersionInfo'
import { getBlogUrl } from './blogUrl'
import { HeaderAppMenu } from './components/HeaderAppMenu'
import { RoscChecklist } from './components/RoscChecklist'
import { TimerRxSection } from './components/TimerRxSection'
import { TimerRoscRxSection } from './components/TimerRoscRxSection'
import { ClinicalDiscussionTimerSection } from './components/ClinicalDiscussionTimerSection'
import { EventLogPanel } from './components/EventLogPanel'
import { SharedLogViewer } from './components/SharedLogViewer'
import { SavedLogsModal } from './components/SavedLogsModal'
import { SavedLogDetailModal } from './components/SavedLogDetailModal'
import { CaseContinuationModal } from './components/CaseContinuationModal'
import { TransferCaseModal } from './components/TransferCaseModal'
import { TransferCaseImminentWarningModal } from './components/TransferCaseImminentWarningModal'
import { PatientHandoverConfirmModal } from './components/PatientHandoverConfirmModal'
import { AcceptCaseHandoffModal } from './components/AcceptCaseHandoffModal'
import { TimerVodCompleteStamp, TimerVodSection } from './components/TimerVodSection'
import { VodTimestampsSummary } from './components/VodTimestampsSummary'
import { PulseRateReminderPanel } from './components/PulseRateReminderPanel'
import { SbpReminderPanel } from './components/SbpReminderPanel'
import { SustainedRoscAlertPanel } from './components/SustainedRoscAlertPanel'
import { TerminationReview } from './components/TerminationReview'
import { ThemeToggle } from './components/ThemeToggle'
import {
  getRoscCommencedLogLabel,
  getCardiacArrestLogLabel,
  getRoscPhaseLabel,
  getRoscRhythmCheckLogLabel,
  getSustainedRoscAchievedLogLabel,
  getRoscTaskLogLabel,
  isSustainedRoscReached,
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
import { usePreviewDebugInstrumentation } from './hooks/usePreviewDebugInstrumentation'
import {
  downloadPreviewDebugReport,
  isPreviewDebugLogEnabled,
  maybeTriggerPreviewTestCrash,
  recordPreviewDebugEvent,
} from './previewDebugLog'
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
import { deriveActiveClinicalAlerts } from './clinicalAlerts/deriveActiveAlerts'
import { useClinicalAlertQueue } from './clinicalAlerts/useClinicalAlertQueue'
import type { ClinicalAlertId } from './clinicalAlerts/types'
import {
  canOfferCaseContinuation,
  hasPatientHandedOverLogged,
  hasVodDeclared,
} from './caseLog'
import {
  isCaseSnapshot,
  timerRestoreFromSnapshot,
  type CaseSnapshot,
} from './caseSnapshot'
import './App.css'

type ShockContext = 'initial' | 'check'
type RhythmCheckEntry = { minute: number; label: string; rhythm: Rhythm; shockJoules?: number }

function getInitialAppRouting(): {
  pendingHandoff: CaseHandoffPayload | null
  sharedLog: SharedLogPayload | null
} {
  const pendingHandoff = parseCaseHandoffFromLocation()
  if (pendingHandoff) return { pendingHandoff, sharedLog: null }
  return { pendingHandoff: null, sharedLog: parseShareFromLocation() }
}

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
  const [acknowledgementsOpen, setAcknowledgementsOpen] = useState(false)
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [previewWarningOpen, setPreviewWarningOpen] = useState(IS_PREVIEW_BUILD)
  const [clinicalAlertBump, setClinicalAlertBump] = useState<ClinicalAlertId | null>(null)
  const [savedLogsOpen, setSavedLogsOpen] = useState(false)
  const [autosaveOffer, setAutosaveOffer] = useState<SavedLogRecord | null>(null)
  const [viewingSavedLog, setViewingSavedLog] = useState<SavedLogRecord | null>(null)
  const [caseContinuationOffer, setCaseContinuationOffer] = useState<SavedLogRecord | null>(null)
  const initialRouting = getInitialAppRouting()
  const [pendingHandoff, setPendingHandoff] = useState<CaseHandoffPayload | null>(
    initialRouting.pendingHandoff,
  )
  const [transferHandoffPayload, setTransferHandoffPayload] = useState<CaseHandoffPayload | null>(
    null,
  )
  const [transferImminentWarnings, setTransferImminentWarnings] = useState<string[] | null>(null)
  const [patientHandoverModalOpen, setPatientHandoverModalOpen] = useState(false)
  const [caseHandedOff, setCaseHandedOff] = useState(isCaseHandedOffThisSession)
  const [sharedLog, setSharedLog] = useState<SharedLogPayload | null>(initialRouting.sharedLog)
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
  const sustainedRoscAlertRef = useRef<HTMLDivElement>(null)
  const roscNextReminderAtRef = useRef(timing.roscMonitoringReminderIntervalSeconds)
  const sbpAdrenaline50AwaitingNextReminderRef = useRef(false)
  const prolongedVfLoggedRef = useRef(false)
  const sustainedRoscLoggedRef = useRef(false)
  const handoffTimerWasRunningRef = useRef(false)
  const activePermanentLogIdRef = useRef<string | null>(null)
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
  const [roscEverAchieved, setRoscEverAchieved] = useState(false)
  const [showSustainedRoscAlert, setShowSustainedRoscAlert] = useState(false)
  const [clinicalDiscussionPending, setClinicalDiscussionPending] = useState(false)
  const [clinicalDiscussionOpen, setClinicalDiscussionOpen] = useState(false)
  const [clinicalDiscussionContinued, setClinicalDiscussionContinued] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [completedRoscTaskIds, setCompletedRoscTaskIds] = useState<Set<RoscTaskId>>(() => new Set())

  const atropineMaxReached = isAtropineMaxReached(atropineTotalMg)

  const totalShocks = rhythmChecks.filter((c) => c.shockJoules != null).length
  const vfvtShockCount = totalShocks
  const hasNonShockableRhythm = hasNonShockableRhythmLogged(rhythmChecks.map((c) => c.rhythm))
  const logIsLocked = hasVodDeclared(logEntries)
  const patientHandedOver = hasPatientHandedOverLogged(logEntries)
  const canModifyCase =
    !logIsLocked && !caseHandedOff && transferHandoffPayload == null && !patientHandedOver
  const canAppendLog = canModifyCase

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
    if (!acknowledgementsOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAcknowledgementsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [acknowledgementsOpen])

  useEffect(() => {
    if (step !== 'post-tor' || vodCountdownRemaining <= 0) return
    const id = window.setInterval(() => {
      setVodCountdownRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [step, vodCountdownRemaining])

  useEffect(() => {
    if (timerView !== 'rosc' || step !== 'active-resuscitation' || patientHandedOver) return
    const id = window.setInterval(() => {
      setRoscElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [timerView, step, patientHandedOver])

  useEffect(() => {
    timerViewRef.current = timerView
  }, [timerView])

  useEffect(() => {
    if (timerView !== 'rosc' || sustainedRoscLoggedRef.current) return
    if (!isSustainedRoscReached(roscElapsedSeconds, timing.timeScale)) return
    sustainedRoscLoggedRef.current = true
    pushLogEntry(getSustainedRoscAchievedLogLabel())
    setSustainedRoscEverAchieved(true)
    setShowSustainedRoscAlert(true)
  }, [roscElapsedSeconds, timerView, timing.timeScale])

  useEffect(() => {
    if (timerView !== 'rosc' || patientHandedOver) return
    if (roscElapsedSeconds > 0 && roscElapsedSeconds >= roscNextReminderAtRef.current) {
      showRoscMonitoringReminders()
      roscNextReminderAtRef.current = roscElapsedSeconds + timing.roscMonitoringReminderIntervalSeconds
    }
  }, [roscElapsedSeconds, timerView, patientHandedOver])

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

  function acknowledgeSustainedRoscAlert() {
    setShowSustainedRoscAlert(false)
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
    setShowSustainedRoscAlert(false)
    sustainedRoscLoggedRef.current = false
    if (timer.elapsedSeconds >= timing.fortyFiveMinutesSeconds && !fortyFiveAcknowledged) {
      setShowFortyFiveAlert(true)
    }
  }

  function enterRoscMode(fromRhythmCheck = false) {
    setTimerView('rosc')
    setRoscEverAchieved(true)
    setRoscElapsedSeconds(0)
    sustainedRoscLoggedRef.current = false
    setShowSustainedRoscAlert(false)
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
      recordPreviewDebugEvent('action', 'new_case_cancelled')
      return
    }
    recordPreviewDebugEvent('action', 'new_case_confirmed')
    resetAll()
  }

  function resetAll() {
    recordPreviewDebugEvent('action', 'case_reset')
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
    setRoscEverAchieved(false)
    setShowSustainedRoscAlert(false)
    setClinicalDiscussionPending(false)
    setClinicalDiscussionOpen(false)
    setClinicalDiscussionContinued(false)
    sustainedRoscLoggedRef.current = false
    activePermanentLogIdRef.current = null
    setAutosaveOffer(null)
    clearCaseHandedOffSession()
    setCaseHandedOff(false)
    setTransferHandoffPayload(null)
    void clearAutosaveLog()
    roscNextReminderAtRef.current = timing.roscMonitoringReminderIntervalSeconds
    timer.reset()
  }

  function handlePreviewSpeedChange(speed: PreviewSpeedMultiplier) {
    if (speed === previewSpeedMultiplier) return
    recordPreviewDebugEvent('action', 'preview_speed_change_requested', { speed })
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
    if (!canAppendLog) {
      recordPreviewDebugEvent('log', 'log_entry_blocked', { text })
      return at?.getTime() ?? Date.now()
    }
    const entry = createDisplayLogEntry(text, at ?? new Date())
    setLogEntries((prev) => [...prev, entry])
    recordPreviewDebugEvent('log', 'log_entry_added', {
      text,
      label: entry.label,
      atEpochMs: entry.atEpochMs,
    })
    return entry.atEpochMs
  }

  function buildCaseSnapshot(): CaseSnapshot {
    if (!activePermanentLogIdRef.current) {
      activePermanentLogIdRef.current = createSavedLogId()
    }
    return {
      version: 1,
      permanentLogId: activePermanentLogIdRef.current,
      step,
      initialRhythm,
      currentRhythm,
      rhythmChecks: rhythmChecks.map((entry) => ({ ...entry })),
      timerElapsedSeconds: timer.elapsedSeconds,
      timerIsRunning: timer.isRunning,
      timerNextCheckAt: timer.elapsedSeconds + timer.secondsToNextCheck,
      timerFortyFiveFired: timer.atFortyFiveMinutes,
      timerCheckDueFired: showRhythmCheckAlert,
      timerView,
      roscElapsedSeconds,
      adrenalineDoseCount,
      amiodaroneDoseCount,
      nextAdrenalineAt,
      consecutiveShockCount,
      fortyFiveAcknowledged,
      earlyTransferAcknowledged,
      codeShockAcknowledged,
      prolongedVfAcknowledged,
      prolongedVfLogged: prolongedVfLoggedRef.current,
      completedQualityPromptIds: [...completedQualityPromptIds],
      completedReversibleCauseIds: [...completedReversibleCauseIds],
      completedRoscTaskIds: [...completedRoscTaskIds],
      atropineTotalMg,
      hasSbpFluidLogged,
      sustainedRoscEverAchieved,
      sustainedRoscLogged: sustainedRoscLoggedRef.current,
      roscEverAchieved,
      roscStatus,
      peaTorCriteriaMet,
      torSpecialCircumstancesBelieved,
      torEndedAtLabel,
      vodAtLabel,
      vodCountdownRemaining,
      clinicalDiscussionPending,
      clinicalDiscussionContinued,
      metronomeEnabled,
      showRhythmCheckAlert,
      showFortyFiveAlert,
    }
  }

  function applyCaseSnapshot(
    snapshot: CaseSnapshot,
    entries: DisplayLogEntry[],
    permanentLogIdOverride?: string,
  ) {
    activePermanentLogIdRef.current =
      permanentLogIdOverride ??
      (snapshot.permanentLogId && snapshot.permanentLogId.length > 0
        ? snapshot.permanentLogId
        : createSavedLogId())
    timer.restore(timerRestoreFromSnapshot(snapshot))
    setStep(snapshot.step)
    setInitialRhythm(snapshot.initialRhythm)
    setCurrentRhythm(snapshot.currentRhythm)
    setRhythmChecks(snapshot.rhythmChecks.map((entry) => ({ ...entry })))
    setLogEntries(entries.map((entry) => ({ ...entry })))
    setTimerView(snapshot.timerView)
    setRoscElapsedSeconds(snapshot.roscElapsedSeconds)
    setAdrenalineDoseCount(snapshot.adrenalineDoseCount)
    setAmiodaroneDoseCount(snapshot.amiodaroneDoseCount)
    setNextAdrenalineAt(snapshot.nextAdrenalineAt)
    setConsecutiveShockCount(snapshot.consecutiveShockCount)
    setFortyFiveAcknowledged(snapshot.fortyFiveAcknowledged)
    setEarlyTransferAcknowledged(snapshot.earlyTransferAcknowledged)
    setCodeShockAcknowledged(snapshot.codeShockAcknowledged)
    setProlongedVfAcknowledged(snapshot.prolongedVfAcknowledged)
    prolongedVfLoggedRef.current = snapshot.prolongedVfLogged
    setCompletedQualityPromptIds(new Set(snapshot.completedQualityPromptIds))
    setCompletedReversibleCauseIds(new Set(snapshot.completedReversibleCauseIds))
    setCompletedRoscTaskIds(new Set(snapshot.completedRoscTaskIds))
    setAtropineTotalMg(snapshot.atropineTotalMg)
    setHasSbpFluidLogged(snapshot.hasSbpFluidLogged)
    setSustainedRoscEverAchieved(snapshot.sustainedRoscEverAchieved)
    setRoscEverAchieved(
      snapshot.roscEverAchieved ??
        (snapshot.sustainedRoscEverAchieved ||
          snapshot.timerView === 'rosc' ||
          entries.some((entry) => entry.text.includes('ROSC'))),
    )
    sustainedRoscLoggedRef.current = snapshot.sustainedRoscLogged
    setShowSustainedRoscAlert(
      snapshot.timerView === 'rosc' &&
        !snapshot.sustainedRoscLogged &&
        isSustainedRoscReached(snapshot.roscElapsedSeconds, timing.timeScale),
    )
    setRoscStatus(snapshot.roscStatus)
    setPeaTorCriteriaMet(snapshot.peaTorCriteriaMet)
    setTorSpecialCircumstancesBelieved(snapshot.torSpecialCircumstancesBelieved)
    setTorEndedAtLabel(snapshot.torEndedAtLabel)
    setVodAtLabel(snapshot.vodAtLabel)
    setVodCountdownRemaining(snapshot.vodCountdownRemaining)
    setClinicalDiscussionPending(snapshot.clinicalDiscussionPending)
    setClinicalDiscussionContinued(snapshot.clinicalDiscussionContinued)
    setMetronomeEnabled(snapshot.metronomeEnabled)
    setShowRhythmCheckAlert(snapshot.showRhythmCheckAlert)
    setShowFortyFiveAlert(snapshot.showFortyFiveAlert)
    setShockFormContext(null)
    setShowRhythmLog(false)
    setAutosaveOffer(null)
    setCaseContinuationOffer(null)
  }

  async function handleStartProtocol() {
    const autosave = autosaveOffer ?? (await getAutosaveLog())
    if (autosave && canOfferCaseContinuation(autosave)) {
      setCaseContinuationOffer(autosave)
      return
    }
    if (autosave) {
      await clearAutosaveLog()
      setAutosaveOffer(null)
    }
    clearCaseHandedOffSession()
    setCaseHandedOff(false)
    setTransferHandoffPayload(null)
    activePermanentLogIdRef.current = null
    setStep('initial-assessment')
  }

  function continueCaseFromAutosave(record: SavedLogRecord) {
    if (!record.caseSnapshot || !isCaseSnapshot(record.caseSnapshot)) return
    applyCaseSnapshot(record.caseSnapshot, record.entries, record.permanentLogId)
  }

  async function startNewCaseFromPrompt() {
    setCaseContinuationOffer(null)
    activePermanentLogIdRef.current = null
    clearCaseHandedOffSession()
    setCaseHandedOff(false)
    await clearAutosaveLog()
    setAutosaveOffer(null)
    setStep('initial-assessment')
  }

  function acceptCaseHandoff(payload: CaseHandoffPayload) {
    if (payload.trust !== serviceConfig.trustId) {
      window.alert(
        `This handoff is for the ${payload.trust === 'wmas' ? 'WMAS' : 'Standard'} build. Open the matching trust URL on this device to take over.`,
      )
      return
    }
    clearCaseHandedOffSession()
    setCaseHandedOff(false)
    const snapshot = adjustSnapshotForHandoffReceive(payload.snapshot, payload.handoffAt)
    applyCaseSnapshot(snapshot, payload.entries, payload.permanentLogId)
    clearCaseHandoffHash()
    setPendingHandoff(null)
    setTransferHandoffPayload(null)
  }

  function declineCaseHandoff() {
    clearCaseHandoffHash()
    setPendingHandoff(null)
  }

  function resumeCaseAfterTransfer() {
    recordPreviewDebugEvent('transfer', 'transfer_resumed_on_sender')
    if (handoffTimerWasRunningRef.current) timer.resume()
    handoffTimerWasRunningRef.current = false
    setTransferHandoffPayload(null)
  }

  function confirmCaseTransferred() {
    recordPreviewDebugEvent('transfer', 'transfer_confirmed_on_sender')
    markCaseHandedOffThisSession()
    setCaseHandedOff(true)
    setTransferHandoffPayload(null)
    setShowRhythmLog(false)
    handoffTimerWasRunningRef.current = false
  }

  function collectTransferImminentWarnings(): string[] {
    const postTorActiveNow = step === 'post-tor'
    const vodCompleteActiveNow = step === 'complete' && vodAtLabel != null
    const resuscitationOngoingNow =
      step === 'active-resuscitation' ||
      step === 'tor-reassessment' ||
      step === 'forty-five-minute-check'
    const showResuscitationTimerControlsNow = !postTorActiveNow && !vodCompleteActiveNow
    const showRxSectionNow =
      timerView === 'arrest' &&
      shouldShowRxSection(initialRhythm) &&
      initialRhythm != null &&
      (step === 'active-resuscitation' ||
        step === 'tor-reassessment' ||
        step === 'forty-five-minute-check' ||
        step === 'rosc-assessment')

    return getCaseTransferImminentWarnings(
      {
        rhythmCheckApplies: showResuscitationTimerControlsNow && resuscitationOngoingNow,
        secondsToNextRhythmCheck: timer.secondsToNextCheck,
        rxParams: showRxSectionNow
          ? {
              initialRhythm: initialRhythm!,
              hasNonShockableRhythm,
              adrenalineDoseCount,
              amiodaroneDoseCount,
              shockCount: totalShocks,
              elapsedSeconds: timer.elapsedSeconds,
              nextAdrenalineAt,
            }
          : null,
        timeScale: timing.timeScale,
      },
      formatProtocolElapsed,
    )
  }

  function beginCaseTransfer() {
    recordPreviewDebugEvent('transfer', 'transfer_started')
    handoffTimerWasRunningRef.current = timer.isRunning
    if (timer.isRunning) timer.pause()
    const handoffAt = Date.now()
    const payload = buildCaseHandoffPayload({
      trustId: serviceConfig.trustId,
      snapshot: buildCaseSnapshot(),
      entries: sortedLogEntries,
      handoffAt,
    })
    setTransferHandoffPayload(payload)
  }

  function initiateCaseTransfer() {
    if (!canModifyCase || logEntries.length === 0) return

    const imminentWarnings = collectTransferImminentWarnings()
    if (imminentWarnings.length > 0) {
      setTransferImminentWarnings(imminentWarnings)
      return
    }

    beginCaseTransfer()
  }

  function dismissTransferImminentWarning() {
    setTransferImminentWarnings(null)
  }

  function confirmTransferDespiteImminentWarnings() {
    setTransferImminentWarnings(null)
    beginCaseTransfer()
  }

  const handoffReplaceActiveCase =
    logEntries.length > 0 || (step !== 'start' && step !== 'initial-assessment')

  function maybePromptVascularAccessIfNotEstablished(atEpochMs: number, entries: readonly DisplayLogEntry[]) {
    if (hasVascularAccessLogged(entries)) return
    pendingVascularAccessAtRef.current = atEpochMs
    setShowVascularAccessReminder(true)
    setVascularAccessReminderStep('prompt')
    setClinicalAlertBump('C-06')
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
    recordPreviewDebugEvent('action', 'commence_resuscitation')
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
    if (maybeTriggerPreviewTestCrash(category, label)) return
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
    recordPreviewDebugEvent('action', 'rhythm_check_logged', { rhythm, joules: joules ?? null })
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
    recordPreviewDebugEvent('action', 'tor_review_started', { source })
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
    recordPreviewDebugEvent('action', 'timer_bar_rosc')
    enterRoscMode(false)
  }

  function handleTimerBarCardiacArrest() {
    if (timerView !== 'rosc' || step !== 'active-resuscitation') return
    recordPreviewDebugEvent('action', 'timer_bar_cardiac_arrest')
    pushLogEntry(getCardiacArrestLogLabel())
    exitRoscMode()
    closeShockForm()
    setShowRhythmCheckAlert(true)
    setClinicalAlertBump('R-01')
  }

  function openPatientHandoverModal() {
    if (step !== 'active-resuscitation' || !canModifyCase) return
    recordPreviewDebugEvent('modal', 'patient_handover_modal_opened')
    setPatientHandoverModalOpen(true)
  }

  function dismissPatientHandoverModal() {
    setPatientHandoverModalOpen(false)
  }

  function transferCaseFromPatientHandoverModal() {
    setPatientHandoverModalOpen(false)
    initiateCaseTransfer()
  }

  function confirmPatientHandedOver() {
    if (step !== 'active-resuscitation' || !canModifyCase) return
    recordPreviewDebugEvent('action', 'patient_handed_over_confirmed')
    pushLogEntry(PATIENT_HANDED_OVER_LOG_LABEL)
    timer.pause()
    setMetronomeEnabled(false)
    dismissSbpReminder()
    dismissPulseReminder()
    setShowSustainedRoscAlert(false)
    closeInterventions()
    setPatientHandoverModalOpen(false)
    requestAnimationFrame(() => {
      document.querySelector('.main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function confirmCheckVfvt(joules: number) {
    appendRhythmCheck(RHYTHM_VF_PVT, joules)
  }

  const showEarlyTransfer =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldShowEarlyTransferReminder(
      initialRhythm,
      rhythmChecks.length,
      earlyTransferAcknowledged,
      roscEverAchieved,
    )

  const showCodeShock =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldShowCodeShockReminder(initialRhythm, totalShocks, codeShockAcknowledged)

  const showProlongedVf =
    step === 'active-resuscitation' &&
    timerView === 'arrest' &&
    shouldTriggerProlongedVf(consecutiveShockCount) &&
    !prolongedVfAcknowledged

  const torProlongedVfGate =
    isProlongedVfTorGateEnabled() &&
    hasProlongedVfLogged(logEntries.map((entry) => entry.text))

  const torSustainedRoscGate = sustainedRoscEverAchieved

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
    if (step === 'start' && logEntries.length === 0 && transferHandoffPayload == null) {
      clearCaseHandedOffSession()
      setCaseHandedOff(false)
    }
  }, [step, logEntries.length, transferHandoffPayload])

  const showCaseHandedOffBanner =
    caseHandedOff && !(step === 'start' && logEntries.length === 0)

  const showPatientHandedOverBanner =
    patientHandedOver && !caseHandedOff && !(step === 'start' && logEntries.length === 0)

  useEffect(() => {
    if (!isLogStorageAvailable() || logEntries.length === 0) return

    const saveTimer = window.setTimeout(() => {
      const caseSnapshot = buildCaseSnapshot()
      const permanentLogId = caseSnapshot.permanentLogId
      void autosaveLog({
        trustId: serviceConfig.trustId,
        documentTitle: logDocumentTitle,
        entries: sortedLogEntries,
        meta: logSaveMeta,
        caseSnapshot,
        permanentLogId,
      })
      void upsertSavedLog({
        id: permanentLogId,
        trustId: serviceConfig.trustId,
        documentTitle: logDocumentTitle,
        entries: sortedLogEntries,
        meta: logSaveMeta,
        caseSnapshot,
      })
    }, 800)

    return () => window.clearTimeout(saveTimer)
  }, [
    logEntries,
    logDocumentTitle,
    sortedLogEntries,
    initialRhythm,
    torEndedAtLabel,
    vodAtLabel,
    timer.elapsedSeconds,
    step,
    timerView,
    currentRhythm,
    rhythmChecks,
    adrenalineDoseCount,
    amiodaroneDoseCount,
    nextAdrenalineAt,
    consecutiveShockCount,
    fortyFiveAcknowledged,
    showRhythmCheckAlert,
    showFortyFiveAlert,
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

  const activeClinicalAlerts = deriveActiveClinicalAlerts({
    step,
    timerView,
    shockFormContext,
    showRhythmCheckAlert,
    resuscitationOngoing,
    showFortyFiveAlert,
    fortyFiveAcknowledged,
    showVectorChangeReminder,
    showEarlyTransfer,
    showCodeShock,
    showProlongedVf,
    showVascularAccessPanel,
    showClinicalDiscussionTimer,
    clinicalDiscussionOpen,
    sbpReminderVisible,
    sbpReminderExpanded,
    pulseReminderVisible,
    pulseReminderExpanded,
    pulseShowAtropineMaxMessage,
    showSustainedRoscAlert,
  })
  const currentClinicalAlert = useClinicalAlertQueue(activeClinicalAlerts, clinicalAlertBump)
  const isClinicalAlert = (id: ClinicalAlertId) => currentClinicalAlert === id

  usePreviewDebugInstrumentation({
    step,
    timerView,
    canModifyCase,
    patientHandedOver,
    caseHandedOff,
    transferHandoffPayloadPresent: transferHandoffPayload != null,
    timerElapsedSeconds: timer.elapsedSeconds,
    timerIsRunning: timer.isRunning,
    showRhythmCheckAlert,
    metronomeEnabled,
    activeClinicalAlerts,
    currentClinicalAlert,
    previewSpeedMultiplier,
  })

  function exportPreviewDebugReportFromApp() {
    downloadPreviewDebugReport({
      step,
      timerView,
      canModifyCase,
      patientHandedOver,
      caseHandedOff,
      transferActive: transferHandoffPayload != null,
      timerElapsedSeconds: timer.elapsedSeconds,
      timerIsRunning: timer.isRunning,
      logEntryCount: logEntries.length,
      activeClinicalAlerts,
      currentClinicalAlert,
      snapshot: buildCaseSnapshot() as unknown as Record<string, unknown>,
      logEntries: sortedLogEntries.map((entry) => ({
        label: entry.label,
        text: entry.text,
        atEpochMs: entry.atEpochMs,
      })),
    })
  }

  useEffect(() => {
    if (clinicalAlertBump && currentClinicalAlert === clinicalAlertBump) {
      setClinicalAlertBump(null)
    }
  }, [clinicalAlertBump, currentClinicalAlert])

  useEffect(() => {
    if (!showVascularAccessReminder) {
      setClinicalAlertBump((bump) => (bump === 'C-06' ? null : bump))
    }
  }, [showVascularAccessReminder])

  useScrollWhenShown(isClinicalAlert('C-02'), vectorChangeReminderRef)
  useScrollWhenShown(isClinicalAlert('C-03'), earlyTransferReminderRef)
  useScrollWhenShown(isClinicalAlert('C-04'), codeShockReminderRef)
  useScrollWhenShown(isClinicalAlert('C-05'), prolongedVfAlertRef)
  useScrollWhenShown(isClinicalAlert('C-06'), vascularAccessReminderRef)
  useScrollWhenShown(
    isClinicalAlert('P-01') ||
      isClinicalAlert('P-02') ||
      isClinicalAlert('P-03') ||
      isClinicalAlert('P-04') ||
      isClinicalAlert('P-05'),
    roscMonitoringReminderRef,
  )
  useScrollWhenShown(isClinicalAlert('P-06'), sustainedRoscAlertRef)

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
    if (timerView === 'rosc') classes.push('timer-bar--rosc')
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
          <HeaderAppMenu
            onAbout={() => setAboutOpen(true)}
            onDocuments={() => setDocumentsOpen(true)}
            onSavedLogs={() => setSavedLogsOpen(true)}
            onAcknowledgements={() => setAcknowledgementsOpen(true)}
            onExportDebugReport={
              isPreviewDebugLogEnabled() ? exportPreviewDebugReportFromApp : undefined
            }
            testControls={
              timerActive && (IS_PREVIEW_BUILD || timing.isTestTiming) ? (
                <>
                  {showPreviewSpeedControl && previewSpeedMultiplier != null && (
                    <PreviewSpeedControl
                      value={previewSpeedMultiplier}
                      onChange={handlePreviewSpeedChange}
                    />
                  )}
                  {showResuscitationTimerControls && timerView === 'arrest' && (
                    <button
                      type="button"
                      className="btn btn-sm test-timer-jump-btn"
                      onClick={handleJumpToTestFortyFour}
                    >
                      Jump to 44:00
                    </button>
                  )}
                </>
              ) : undefined
            }
          />
          <div className="header-toolbar-end">
            {canModifyCase && hasLog && timerActive && (
              <button type="button" className="header-link-btn" onClick={initiateCaseTransfer}>
                Transfer case
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
        <h1>{serviceConfig.headerTitle}</h1>
        <p className="subtitle">Adult Cardiac Arrest · Ambulance Resource Protocol</p>
        {(IS_PREVIEW_BUILD || timing.isTestTiming) && !timerActive && (
          <div className="test-mode-controls">
            {timing.isTestTiming && !IS_PREVIEW_BUILD && (
              <p className="test-banner">{getTestModeBannerText(timing)}</p>
            )}
            {showPreviewSpeedControl && previewSpeedMultiplier != null && (
              <PreviewSpeedControl value={previewSpeedMultiplier} onChange={handlePreviewSpeedChange} />
            )}
          </div>
        )}
      </header>

      {showCaseHandedOffBanner && (
        <div className="case-handed-off-banner card" role="status">
          <p>
            Case transferred — this device is read-only. Continue the case on the other device only.
          </p>
          <div className="autosave-restore-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleNewCase}>
              Start new case on this device
            </button>
          </div>
        </div>
      )}

      {showPatientHandedOverBanner && (
        <div className="patient-handed-over-banner card" role="status">
          <p>
            Patient handed over — all timers have stopped and this case is read-only. The event log
            remains available to view or export.
          </p>
          <div className="autosave-restore-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleNewCase}>
              Start new case on this device
            </button>
          </div>
        </div>
      )}

      {autosaveOffer && step === 'start' && logEntries.length === 0 && !sharedLog && (
        <div className="autosave-restore-banner card" role="status">
          <p>
            Autosaved log from {formatSavedLogLabel(autosaveOffer.savedAt)} (
            {autosaveOffer.entries.length} events).
            {hasVodDeclared(autosaveOffer.entries)
              ? ' Verification of death was recorded — this log is read-only.'
              : ' View the log read-only or discard before starting a new case.'}
          </p>
          <div className="autosave-restore-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setViewingSavedLog(autosaveOffer)}
            >
              View log
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

      {timerActive && (
        <>
        <div
          ref={timerBarRef}
          className={getTimerBarClassName()}
          style={getTimerBarStyle()}
        >
          <div className="timer-bar-top">
            <div className="timer-bar-top-leading">
              <div className="timer-bar-leading-primary">
                <div className="timer-display">
                  <span className="timer-label">
                    {postTorActive || vodCompleteActive
                      ? 'Resuscitation ended'
                      : timerView === 'rosc'
                        ? (roscPhaseLabel ?? 'ROSC')
                        : 'Elapsed'}
                  </span>
                  <span className="timer-value">{formatProtocolElapsed(displayTimerSeconds)}</span>
                </div>
                {showResuscitationTimerControls && (
                  <div className="timer-stat">
                    <span className="timer-label">Total shocks:</span>
                    <span className="timer-stat-value">{totalShocks}</span>
                  </div>
                )}
              </div>
            </div>
            {showResuscitationTimerControls && (
              <div
                className={`timer-bar-action-group${
                  timerView === 'rosc' || step !== 'active-resuscitation'
                    ? ' timer-bar-action-group--two'
                    : ''
                }`}
              >
                {timerView === 'rosc' ? (
                  <TimerActionButton
                    variant="cardiac-arrest"
                    disabled={!canModifyCase}
                    onClick={handleTimerBarCardiacArrest}
                  >
                    Cardiac arrest
                  </TimerActionButton>
                ) : (
                  <TimerActionButton
                    variant="rosc"
                    disabled={!canModifyCase}
                    onClick={handleTimerBarRosc}
                  >
                    ROSC
                  </TimerActionButton>
                )}
                {timerView !== 'rosc' && (
                  <TimerActionButton
                    variant="tor"
                    isOn={timer.atFortyFiveMinutes}
                    aria-label="Termination of resuscitation review"
                    title={canBeginTorReview ? undefined : 'Log the initial rhythm before opening TOR review'}
                    disabled={!canBeginTorReview || !canModifyCase}
                    onClick={() => beginTorReview('manual')}
                  >
                    TOR
                  </TimerActionButton>
                )}
                {step === 'active-resuscitation' && (
                  <TimerActionButton
                    variant="handover"
                    disabled={!canModifyCase}
                    onClick={openPatientHandoverModal}
                  >
                    Patient handed over
                  </TimerActionButton>
                )}
              </div>
            )}
          </div>
          {showResuscitationTimerControls &&
            (resuscitationOngoing ||
              showInterventionsButton ||
              (!postTorActive && !vodCompleteActive)) && (
            <div className="timer-bar-tools-row">
              {resuscitationOngoing && (
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
              {(showInterventionsButton || (!postTorActive && !vodCompleteActive)) && (
                <div
                  className={`timer-bar-secondary-group${
                    !showInterventionsButton ? ' timer-bar-secondary-group--metronome-only' : ''
                  }`}
                >
                  {showInterventionsButton && (
                    <TimerActionButton
                      variant="interventions"
                      isActive={showInterventions}
                      aria-pressed={showInterventions}
                      disabled={!canModifyCase}
                      onClick={toggleInterventions}
                    >
                      Interventions
                    </TimerActionButton>
                  )}
                  {!postTorActive && !vodCompleteActive && (
                    <MetronomeToggle
                      variant="timer-bar"
                      enabled={metronomeEnabled}
                      onToggle={() => setMetronomeEnabled((prev) => !prev)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
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
          {timerView === 'rosc' && step === 'active-resuscitation' && atropineTotalMg > 0 && (
            <TimerRoscRxSection atropineTotalMg={atropineTotalMg} />
          )}
          {showClinicalDiscussionTimer && (isClinicalAlert('S-01') || isClinicalAlert('S-02')) && (
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

      {(step === 'select-rhythm') && (isClinicalAlert('I-01') || isClinicalAlert('I-02')) && (
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

      {showVectorChangeReminder && isClinicalAlert('C-02') && (
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

      {showEarlyTransfer && isClinicalAlert('C-03') && (
        <div ref={earlyTransferReminderRef} className="early-transfer-panel" role="status">
          <p>{getEarlyTransferPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeEarlyTransfer}>
            Acknowledge
          </button>
        </div>
      )}

      {showCodeShock && isClinicalAlert('C-04') && (
        <div ref={codeShockReminderRef} className="code-shock-panel" role="status">
          <p>{getCodeShockPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeCodeShock}>
            Acknowledge
          </button>
        </div>
      )}

      {showProlongedVf && isClinicalAlert('C-05') && (
        <div ref={prolongedVfAlertRef} className="prolonged-vf-panel" role="status">
          <p>{getProlongedVfPrompt()}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={acknowledgeProlongedVf}>
            Acknowledge
          </button>
        </div>
      )}

      {showVascularAccessPanel && isClinicalAlert('C-06') && (
        <div ref={vascularAccessReminderRef} className="vascular-access-panel" role="status">
          <VascularAccessFlow
            step={vascularAccessReminderStep}
            onStepChange={setVascularAccessReminderStep}
            onComplete={logVascularAccess}
          />
        </div>
      )}

      {showSustainedRoscAlert &&
        timerView === 'rosc' &&
        step === 'active-resuscitation' &&
        isClinicalAlert('P-06') && (
          <div ref={sustainedRoscAlertRef}>
            <SustainedRoscAlertPanel onAcknowledge={acknowledgeSustainedRoscAlert} />
          </div>
        )}

      {showRoscMonitoringArea &&
        (isClinicalAlert('P-01') ||
          isClinicalAlert('P-02') ||
          isClinicalAlert('P-03') ||
          isClinicalAlert('P-04') ||
          isClinicalAlert('P-05')) && (
        <div ref={roscMonitoringReminderRef} className="rosc-monitoring-reminders">
          {sbpReminderVisible && (isClinicalAlert('P-01') || isClinicalAlert('P-02')) && (
            <div>
              <SbpReminderPanel
                expanded={sbpReminderExpanded}
                showAdrenaline50={hasSbpFluidLogged}
                showAdrenaline100={showSbpAdrenaline100}
                onInadequate={() => setSbpReminderExpanded(true)}
                onAdequate={dismissSbpReminder}
                onFluid250={() => logSbpFluid('250ml')}
                onFluid500={() => logSbpFluid('500ml')}
                onAdrenaline50={logSbpAdrenaline50}
                onAdrenaline100={logSbpAdrenaline100}
                onNothingAdministered={dismissSbpReminder}
                onBack={() => setSbpReminderExpanded(false)}
              />
            </div>
          )}
          {pulseReminderVisible &&
            !sbpReminderVisible &&
            (isClinicalAlert('P-03') || isClinicalAlert('P-04') || isClinicalAlert('P-05')) && (
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

      {showFortyFiveAlert && !fortyFiveAcknowledged && timerView !== 'rosc' && isClinicalAlert('C-01') && (
        <div className="alert alert-critical" role="alert">
          <strong>45 minutes — Termination review</strong>
          <p>Consider termination of resuscitation according to current rhythm.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => beginTorReview()}
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
            <button type="button" className="btn btn-primary btn-lg" onClick={() => void handleStartProtocol()}>
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
            {patientHandedOver ? (
              hasLog && (
                <EventLogPanel
                  entries={sortedLogEntries}
                  documentTitle={logDocumentTitle}
                />
              )
            ) : (
              <>
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
                      />
                    )}
                  </>
                )}
                {timer.atFortyFiveMinutes && fortyFiveAcknowledged && timerView !== 'rosc' && (
                  <button type="button" className="btn btn-primary" onClick={() => beginTorReview()}>
                    View 45-minute termination guidance
                  </button>
                )}
                <p className="hint">
                  Rhythm assessment every 2 minutes from last entry.
                  {(initialRhythm === RHYTHM_VF_PVT || initialRhythm === 'PEA') &&
                    !roscEverAchieved &&
                    ' Early transfer reminder after third rhythm check.'}
                  {timerView !== 'rosc' && ' Special review at 45 minutes.'}
                </p>
              </>
            )}
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
                torSustainedRoscGate={torSustainedRoscGate}
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
                  ['sustained', 'Sustained ROSC', 'More than 10 minutes with output'],
                  ['transient', 'Transient ROSC', 'Output lasting less than 10 minutes'],
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
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setAcknowledgementsOpen(true)}
          >
            Acknowledgements
          </button>
        </p>
        <AppVersionInfo />
      </footer>

      {previewWarningOpen && (
        <PreviewDevelopmentWarningModal onAcknowledge={() => setPreviewWarningOpen(false)} />
      )}

      {aboutOpen && (
        <AboutModal
          onClose={() => setAboutOpen(false)}
          onOpenAcknowledgements={() => setAcknowledgementsOpen(true)}
        />
      )}

      {acknowledgementsOpen && (
        <AcknowledgementsModal
          onClose={() => setAcknowledgementsOpen(false)}
          onOpenAbout={() => setAboutOpen(true)}
        />
      )}

      {documentsOpen && <DocumentsModal onClose={() => setDocumentsOpen(false)} />}

      {savedLogsOpen && <SavedLogsModal onClose={() => setSavedLogsOpen(false)} />}

      {viewingSavedLog && (
        <SavedLogDetailModal record={viewingSavedLog} onClose={() => setViewingSavedLog(null)} />
      )}

      {caseContinuationOffer && (
        <CaseContinuationModal
          savedAt={caseContinuationOffer.savedAt}
          eventCount={caseContinuationOffer.entries.length}
          onContinue={() => continueCaseFromAutosave(caseContinuationOffer)}
          onNewCase={() => void startNewCaseFromPrompt()}
        />
      )}

      {patientHandoverModalOpen && (
        <PatientHandoverConfirmModal
          showTransferCase={hasLog && timerActive}
          onCancel={dismissPatientHandoverModal}
          onConfirmHandover={confirmPatientHandedOver}
          onTransferCase={transferCaseFromPatientHandoverModal}
        />
      )}

      {transferImminentWarnings && (
        <TransferCaseImminentWarningModal
          warnings={transferImminentWarnings}
          onStayOnCase={dismissTransferImminentWarning}
          onTransferAnyway={confirmTransferDespiteImminentWarnings}
        />
      )}

      {transferHandoffPayload && (
        <TransferCaseModal
          payload={transferHandoffPayload}
          onResumeCase={resumeCaseAfterTransfer}
          onConfirmTransferred={confirmCaseTransferred}
        />
      )}

      {pendingHandoff && (
        <AcceptCaseHandoffModal
          payload={pendingHandoff}
          replaceActiveCase={handoffReplaceActiveCase}
          onAccept={() => acceptCaseHandoff(pendingHandoff)}
          onDecline={declineCaseHandoff}
        />
      )}

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

      {(isClinicalAlert('R-01') || isClinicalAlert('R-02')) && showRhythmCheckAlert && resuscitationOngoing && (
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
