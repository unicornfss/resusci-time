import {
  getTerminationGuidance,
  needsPeaTorCriteriaQuestion,
  PEA_TOR_CRITERIA_QUESTION,
  RHYTHM_OPTIONS,
  rhythmCssClass,
} from '../protocol'
import type { Rhythm } from '../types'

interface TerminationReviewProps {
  initialRhythm: Rhythm
  currentRhythm: Rhythm | null
  peaTorCriteriaMet: boolean | null
  sustainedRoscEverAchieved: boolean
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
  peaTorCriteriaMet,
  sustainedRoscEverAchieved,
  onSelectRhythm,
  onResetRhythm,
  onPeaCriteriaAnswer,
  onEndResuscitation,
  onContinueResuscitation,
  onSeekSeniorAdvice,
}: TerminationReviewProps) {
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
