import {
  IV_CANNULA_GAUGES,
  getVascularAccessLogLabel,
  getVascularAccessPrompt,
  type VascularAccessStep,
} from '../interventions'

interface VascularAccessFlowProps {
  step: VascularAccessStep
  onStepChange: (step: VascularAccessStep) => void
  onComplete: (logText: string) => void
  onCancel?: () => void
  showPrompt?: boolean
}

export function VascularAccessFlow({
  step,
  onStepChange,
  onComplete,
  onCancel,
  showPrompt = true,
}: VascularAccessFlowProps) {
  function logIo() {
    onComplete(getVascularAccessLogLabel({ type: 'IO' }))
  }

  function logIv(gauge: string) {
    onComplete(getVascularAccessLogLabel({ type: 'IV', gauge }))
  }

  if (step === 'prompt' && showPrompt) {
    return (
      <>
        <p>{getVascularAccessPrompt()}</p>
        <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={() => onStepChange('route')}>
          Established
        </button>
      </>
    )
  }

  if (step === 'route' || (step === 'prompt' && !showPrompt)) {
    return (
      <>
        <p className="vascular-access-subtitle">Select access route</p>
        <div className="vascular-route-actions">
          <button type="button" className="btn btn-primary btn-lg btn-touch" onClick={() => onStepChange('iv-gauge')}>
            IV
          </button>
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={logIo}>
            IO
          </button>
        </div>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-touch vascular-back-btn" onClick={onCancel}>
            Back
          </button>
        )}
      </>
    )
  }

  return (
    <>
      <p className="vascular-access-subtitle">Select cannula size</p>
      <div className="cannula-grid">
        {IV_CANNULA_GAUGES.map(({ gauge, colorClass }) => (
          <button
            key={gauge}
            type="button"
            className={`cannula-btn ${colorClass}`}
            onClick={() => logIv(gauge)}
          >
            {gauge}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-secondary btn-touch vascular-back-btn" onClick={() => onStepChange('route')}>
        Back
      </button>
    </>
  )
}
