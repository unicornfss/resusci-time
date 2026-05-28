import { getAppVersionSummary } from '../appVersion'

interface AppVersionInfoProps {
  className?: string
}

export function AppVersionInfo({ className = 'app-version-info' }: AppVersionInfoProps) {
  return <p className={className}>{getAppVersionSummary()}</p>
}
