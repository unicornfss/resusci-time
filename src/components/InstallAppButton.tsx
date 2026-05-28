import { useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { InstallHelpModal } from './InstallHelpModal'

export function InstallAppButton() {
  const { visible, canNativeInstall, needsIosInstructions, helpVariant, promptInstall } =
    usePwaInstall()
  const [helpOpen, setHelpOpen] = useState(false)

  if (!visible) return null

  async function handleClick() {
    if (canNativeInstall) {
      await promptInstall()
      return
    }
    if (needsIosInstructions) {
      setHelpOpen(true)
    }
  }

  return (
    <>
      <button
        type="button"
        className="header-link-btn header-link-btn--install"
        onClick={() => void handleClick()}
      >
        Install app
      </button>
      {helpOpen && (
        <InstallHelpModal variant={helpVariant} onClose={() => setHelpOpen(false)} />
      )}
    </>
  )
}
