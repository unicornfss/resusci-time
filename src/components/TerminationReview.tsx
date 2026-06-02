import {
  getProlongedVfTorMessage,
  getSustainedRoscTorMessage,
  getTerminationGuidance,
  needsPeaTorCriteriaQuestion,
  PEA_TOR_CRITERIA_QUESTION,
  RHYTHM_OPTIONS,
  rhythmCssClass,
  TOR_SPECIAL_CIRCUMSTANCES_ADVICE_MESSAGE,
  TOR_SPECIAL_CIRCUMSTANCES_ITEMS,
  TOR_SPECIAL_CIRCUMSTANCES_QUESTION,
} from '../protocol'
import type { Rhythm } from '../types'

interface TerminationReviewProps {
  initialRhythm: Rhythm
  currentRhythm: Rhythm | null
  torProlongedVfGate: boolean
  torSustainedRoscGate: boolean
  specialCircumstancesBelieved: boolean | null
  peaTorCriteriaMet: boolean | null
  sustainedRoscEverAchieved: boolean
  onSpecialCircumstancesAnswer: (believed: boolean) => void
  onSelectRhythm: (rhythm: Rhythm) => void
  onResetRhythm: () => void
  onPeaCriteriaAnswer: (meetsCriteria: boolean) => void
  onEndResuscitation: () => void
  onContinueResuscitation: () => void
  onSeekSeniorAdvice: () => void
}

function guidanceClass(kind: 'end-or-continue' | 'seek-advice' | 'asystole-initial'): string {
  if (kind === 'end-or-continue') return 'guidance-cease'
  if (kind === 'seek-advice') return 'guidance-seek-advice'
  return 'guidance-continue-unless-reason'
}

export function TerminationReview({
  initialRhythm,
  currentRhythm,
  torProlongedVfGate,
  torSustainedRoscGate,
  specialCircumstancesBelieved,
  peaTorCriteriaMet,
  sustainedRoscEverAchieved,
  onSpecialCircumstancesAnswer,
  onSelectRhythm,
  onResetRhythm,
  onPeaCriteriaAnswer,
  onEndResuscitation,
  onContinueResuscitation,
  onSeekSeniorAdvice,
}: TerminationReviewProps) {
  if (torProlongedVfGate) {
    return (
      <>
        <div className="guidance guidance-seek-advice tor-prolonged-vf-gate">
          <p>{getProlongedVfTorMessage()}</p>
        </div>
        <div className="tor-actions">
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onSeekSeniorAdvice}>
            Seek senior clinical advice
          </button>
        </div>
      </>
    )
  }

  if (torSustainedRoscGate) {
    return (
      <>
        <div className="guidance guidance-seek-advice tor-sustained-rosc-gate">
          <p>{getSustainedRoscTorMessage()}</p>
        </div>
        <div className="tor-actions">
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onSeekSeniorAdvice}>
            Seek senior clinical advice
          </button>
        </div>
      </>
    )
  }

  if (specialCircumstancesBelieved === null) {
    return (
      <div className="tor-special-circumstances" role="group" aria-label="Special circumstances">
        <p className="tor-special-circumstances-question">{TOR_SPECIAL_CIRCUMSTANCES_QUESTION}</p>
        <ul className="tor-special-circumstances-list">
          {TOR_SPECIAL_CIRCUMSTANCES_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="tor-actions">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-touch"
            onClick={() => onSpecialCircumstancesAnswer(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg btn-touch"
            onClick={() => onSpecialCircumstancesAnswer(false)}
          >
            No
          </button>
        </div>
      </div>
    )
  }

  if (specialCircumstancesBelieved) {
    return (
      <>
        <div className="guidance guidance-seek-advice">
          <p>{TOR_SPECIAL_CIRCUMSTANCES_ADVICE_MESSAGE}</p>
        </div>
        <div className="tor-actions">
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onSeekSeniorAdvice}>
            Seek senior clinical advice
          </button>
        </div>
      </>
    )
  }

  const showPeaQuestion =
    !sustainedRoscEverAchieved &&
    needsPeaTorCriteriaQuestion(initialRhythm, currentRhythm) &&
    peaTorCriteriaMet === null
  const guidance =
    currentRhythm != null
      ? getTerminationGuidance(initialRhythm, currentRhythm, peaTorCriteriaMet, sustainedRoscEverAchieved)
      : null

  return (
    <>
      <p>
        Initial rhythm: <strong>{initialRhythm}</strong>. Select the <em>current</em> monitored rhythm.
      </p>

      {!currentRhythm ? (
        <div className="rhythm-grid">
          {RHYTHM_OPTIONS.map((rhythm) => (
            <button
              key={rhythm}
              type="button"
              className={`rhythm-btn ${rhythmCssClass(rhythm)}`}
              onClick={() => onSelectRhythm(rhythm)}
            >
              {rhythm}
            </button>
          ))}
        </div>
      ) : (
        <p className="tor-current-rhythm">
          Current rhythm: <strong>{currentRhythm}</strong>
          <button type="button" className="btn btn-sm btn-secondary tor-change-rhythm-btn" onClick={onResetRhythm}>
            Change
          </button>
        </p>
      )}

      {showPeaQuestion && (
        <div className="tor-pea-criteria" role="group" aria-label="PEA cessation criteria">
          <p className="tor-pea-criteria-question">{PEA_TOR_CRITERIA_QUESTION}</p>
          <div className="tor-actions">
            <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={() => onPeaCriteriaAnswer(true)}>
              Yes
            </button>
            <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={() => onPeaCriteriaAnswer(false)}>
              No
            </button>
          </div>
        </div>
      )}

      {guidance && (
        <>
          <div className={`guidance ${guidanceClass(guidance.kind)}`}>
            <p>{guidance.message}</p>
          </div>
          <div className="tor-actions">
            {guidance.kind === 'end-or-continue' && (
              <>
                <button type="button" className="btn btn-danger btn-lg btn-touch" onClick={onEndResuscitation}>
                  End resuscitation efforts
                </button>
                <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onContinueResuscitation}>
                  Continue resuscitation
                </button>
              </>
            )}
            {guidance.kind === 'asystole-initial' && (
              <>
                <button type="button" className="btn btn-danger btn-lg btn-touch" onClick={onEndResuscitation}>
                  End resuscitation efforts
                </button>
                <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onContinueResuscitation}>
                  Continue resuscitation
                </button>
                <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onSeekSeniorAdvice}>
                  Seek senior clinical advice (not required unless concerned)
                </button>
              </>
            )}
            {guidance.kind === 'seek-advice' && (
              <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onSeekSeniorAdvice}>
                Seek senior clinical advice
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
