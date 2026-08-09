interface LandscapeRotateHintProps {
  visible: boolean
  onDismiss: () => void
}

export function LandscapeRotateHint({ visible, onDismiss }: LandscapeRotateHintProps) {
  if (!visible) return null

  return (
    <div className="landscape-rotate-hint" role="status" aria-live="polite">
      <div className="landscape-rotate-hint-panel card">
        <p className="landscape-rotate-hint-title">Rotate for best view</p>
        <p className="landscape-rotate-hint-body">
          Resusci-Time works best in <strong>portrait</strong> on phones and tablets. Turn your
          device upright for the clearest layout.
        </p>
        <button type="button" className="btn btn-secondary landscape-rotate-hint-dismiss" onClick={onDismiss}>
          Continue in landscape
        </button>
      </div>
    </div>
  )
}
