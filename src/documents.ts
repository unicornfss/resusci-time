import type { TrustId } from './config/types'

export type ProtocolDocumentId = 'als-algorithm' | 'wmas-als-bag-tor-aide-memoire'

export interface ProtocolDocument {
  id: ProtocolDocumentId
  title: string
  asset: string
  type: 'image'
  /** When set, the document is only listed for these trusts. Omit to show in all builds. */
  trustIds?: readonly TrustId[]
}

export const PROTOCOL_DOCUMENTS: readonly ProtocolDocument[] = [
  {
    id: 'als-algorithm',
    title: 'Advanced Life Support (ALS) algorithm',
    asset: 'als-alogorhythm.png',
    type: 'image',
  },
  {
    id: 'wmas-als-bag-tor-aide-memoire',
    title: 'WMAS ToR criteria',
    asset: 'documents/wmas-als-bag-tor-aide-memoire-v1.jpg',
    type: 'image',
    trustIds: ['wmas'],
  },
]

export function getProtocolDocuments(trustId: TrustId): readonly ProtocolDocument[] {
  return PROTOCOL_DOCUMENTS.filter((doc) => !doc.trustIds || doc.trustIds.includes(trustId))
}

export function getProtocolDocument(
  id: ProtocolDocumentId,
  trustId: TrustId,
): ProtocolDocument | undefined {
  return getProtocolDocuments(trustId).find((doc) => doc.id === id)
}
