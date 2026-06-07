import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { InstallHelpModal } from './InstallHelpModal'

interface HeaderAppMenuProps {
  onAbout: () => void
  onDocuments: () => void
  onSavedLogs: () => void
  onAcknowledgements: () => void
  onExportDebugReport?: () => void
  testControls?: ReactNode
}

export function HeaderAppMenu({
  onAbout,
  onDocuments,
  onSavedLogs,
  onAcknowledgements,
  onExportDebugReport,
  testControls,
}: HeaderAppMenuProps) {
  const [open, setOpen] = useState(false)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const { visible: installVisible, canNativeInstall, needsIosInstructions, helpVariant, promptInstall } =
    usePwaInstall()

  function closeMenu() {
    setOpen(false)
  }

  function runAction(action: () => void) {
    action()
    closeMenu()
  }

  async function handleInstallClick() {
    if (canNativeInstall) {
      await promptInstall()
      closeMenu()
      return
    }
    if (needsIosInstructions) {
      setInstallHelpOpen(true)
      closeMenu()
    }
  }

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="header-app-menu" ref={menuRef}>
      <button
        type="button"
        className="header-menu-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="header-menu-btn-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="header-menu-btn-label">Menu</span>
      </button>
      {open && (
        <div className="header-menu-panel" id={menuId} role="menu">
          <button type="button" className="header-menu-item" role="menuitem" onClick={() => runAction(onAbout)}>
            About
          </button>
          <button
            type="button"
            className="header-menu-item"
            role="menuitem"
            onClick={() => runAction(onDocuments)}
          >
            Documents
          </button>
          <button
            type="button"
            className="header-menu-item"
            role="menuitem"
            onClick={() => runAction(onSavedLogs)}
          >
            Saved logs
          </button>
          <button
            type="button"
            className="header-menu-item"
            role="menuitem"
            onClick={() => runAction(onAcknowledgements)}
          >
            Acknowledgements
          </button>
          {installVisible && (
            <button
              type="button"
              className="header-menu-item header-menu-item--install"
              role="menuitem"
              onClick={() => void handleInstallClick()}
            >
              Install app
            </button>
          )}
          {onExportDebugReport && (
            <button
              type="button"
              className="header-menu-item header-menu-item--debug"
              role="menuitem"
              onClick={() => runAction(onExportDebugReport)}
            >
              Export debug report
            </button>
          )}
          {testControls && <div className="header-menu-test-controls">{testControls}</div>}
        </div>
      )}
      {installHelpOpen && (
        <InstallHelpModal variant={helpVariant} onClose={() => setInstallHelpOpen(false)} />
      )}
    </div>
  )
}
