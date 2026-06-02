import { getSustainedRoscAdvisoryNotice } from '../protocol'

interface SustainedRoscAlertPanelProps {
  onAcknowledge: () => void
}

export function SustainedRoscAlertPanel({ onAcknowledge }: SustainedRoscAlertPanelProps) {
  return (
    <div className="alert alert-warning sustained-rosc-alert" role="alert">
      <strong>Sustained ROSC</strong>
      <p>More than 10 minutes with output — recorded in the log.</p>
      <p className="sustained-rosc-advisory">{getSustainedRoscAdvisoryNotice()}</p>
      <button type="button" className="btn btn-adequate btn-lg btn-touch" onClick={onAcknowledge}>
        Acknowledge
      </button>
    </div>
  )
}
