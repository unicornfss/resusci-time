import type { TrustId } from './config/types'

export interface AcknowledgementSection {
  heading: string
  paragraphs?: readonly string[]
  items?: readonly string[]
}

const REVIEW_AND_TESTING_SECTION: AcknowledgementSection = {
  heading: 'Review and testing',
  paragraphs: [
    'Thank you to the following clinicians for reviewing and testing Resusci-Time during development:',
  ],
  items: [
    'Steve Jeffries — Consultant Paramedic (WMAS)',
    'Rich Price — Paramedic / Clinical Team Mentor (WMAS)',
    'Kerri Richards — Paramedic (WMAS)',
    'Sam Simpson — Paramedic / Clinical Team Mentor (WMMAS)',
    'Chris Stevens — Paramedic / Clinical Team Mentor (WMAS)',
  ],
}

const SHARED_SECTIONS: readonly AcknowledgementSection[] = [
  REVIEW_AND_TESTING_SECTION,
  {
    heading: 'Clinical sources',
    paragraphs: [
      'Thank you to Resuscitation Council UK, the Joint Royal Colleges Ambulance Liaison Committee (JRCALC), and the Association of Ambulance Chief Executives (AACE). The core clinical information, timing, and prompts in Resusci-Time are based on their published UK guidance.',
      'Resusci-Time is an independent application developed by Ostroforge. It is not affiliated with, endorsed by, or approved by RCUK, JRCALC, or AACE.',
    ],
    items: [
      'The Advanced Life Support (ALS) algorithm available under Documents originates from Resuscitation Council UK materials.',
    ],
  },
]

const WMAS_SECTIONS: readonly AcknowledgementSection[] = [
  {
    heading: 'West Midlands Ambulance Service',
    paragraphs: [
      'Thank you to West Midlands Ambulance Service for supporting WMAS-specific reminders, reference documents, and termination flows in this build.',
    ],
  },
]

export function getAcknowledgementsSections(trustId: TrustId): readonly AcknowledgementSection[] {
  const trustSections = trustId === 'wmas' ? WMAS_SECTIONS : []
  return [...trustSections, ...SHARED_SECTIONS]
}
