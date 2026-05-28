import type { TrustId } from './config/types'

/** Site-root blog URL, filtered for the current trust build. */
export function getBlogUrl(trustId: TrustId): string {
  return `/blog/?trust=${trustId}`
}
