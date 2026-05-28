import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type PreviewSpeedMultiplier,
  readStoredPreviewSpeed,
  writeStoredPreviewSpeed,
} from '../previewSpeed'
import {
  BUILD_TIME_SCALE,
  IS_PREVIEW_BUILD,
  buildTimingConfig,
  type TimingConfig,
} from '../timing'

interface TimingConfigContextValue {
  timing: TimingConfig
  previewSpeedMultiplier: PreviewSpeedMultiplier | null
  setPreviewSpeedMultiplier: (speed: PreviewSpeedMultiplier) => void
  showPreviewSpeedControl: boolean
}

const TimingConfigContext = createContext<TimingConfigContextValue | null>(null)

export function TimingConfigProvider({ children }: { children: ReactNode }) {
  const [previewSpeedMultiplier, setPreviewSpeedMultiplierState] = useState<PreviewSpeedMultiplier>(
    () => (IS_PREVIEW_BUILD ? readStoredPreviewSpeed(BUILD_TIME_SCALE) : 1),
  )

  const timing = useMemo(
    () => buildTimingConfig(IS_PREVIEW_BUILD ? previewSpeedMultiplier : undefined),
    [previewSpeedMultiplier],
  )

  const setPreviewSpeedMultiplier = useCallback((speed: PreviewSpeedMultiplier) => {
    setPreviewSpeedMultiplierState(speed)
    if (IS_PREVIEW_BUILD) {
      writeStoredPreviewSpeed(speed)
    }
  }, [])

  const value = useMemo(
    () => ({
      timing,
      previewSpeedMultiplier: IS_PREVIEW_BUILD ? previewSpeedMultiplier : null,
      setPreviewSpeedMultiplier,
      showPreviewSpeedControl: IS_PREVIEW_BUILD,
    }),
    [timing, previewSpeedMultiplier, setPreviewSpeedMultiplier],
  )

  return <TimingConfigContext.Provider value={value}>{children}</TimingConfigContext.Provider>
}

export function useTimingConfig(): TimingConfigContextValue {
  const context = useContext(TimingConfigContext)
  if (!context) {
    throw new Error('useTimingConfig must be used within TimingConfigProvider')
  }
  return context
}
