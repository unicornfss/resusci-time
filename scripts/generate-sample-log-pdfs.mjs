/**
 * Generate sample Resusci-Time event log PDFs for demos / QI materials.
 * Run: node scripts/generate-sample-log-pdfs.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { jsPDF } from 'jspdf'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'sample-logs')
const DOCUMENT_TITLE = 'Resusci-Time WMAS Preview — sample log'
const EXPORT_STAMP = '7 June 2026, 10:00:00'
const CASE_START = new Date(2026, 5, 7, 14, 2, 0)

/** @typedef {{ label: string; text: string; atEpochMs: number }} DisplayLogEntry */

/**
 * @param {readonly { text: string; plusSec?: number }[]} events
 * @returns {DisplayLogEntry[]}
 */
function buildEntries(events) {
  return events.map(({ text, plusSec = 0 }) => {
    const at = new Date(CASE_START.getTime() + plusSec * 1000)
    const h = at.getHours()
    const m = at.getMinutes().toString().padStart(2, '0')
    const s = at.getSeconds().toString().padStart(2, '0')
    return { label: `${h}:${m}:${s}`, text, atEpochMs: at.getTime() }
  })
}

/**
 * @param {readonly DisplayLogEntry[]} entries
 * @param {string} filename
 */
function writePdf(entries, filename) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 14
  const maxWidth = pageWidth - marginX * 2
  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(DOCUMENT_TITLE, marginX, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Exported ${EXPORT_STAMP}`, marginX, y)
  y += 10
  doc.setTextColor(0)

  doc.setFontSize(10)
  for (const entry of entries) {
    const line = `${entry.label}  ${entry.text}`
    const wrapped = doc.splitTextToSize(line, maxWidth)
    const blockHeight = wrapped.length * 5.5

    if (y + blockHeight > 285) {
      doc.addPage()
      y = 18
    }

    doc.text(wrapped, marginX, y)
    y += blockHeight + 2
  }

  const path = join(OUT_DIR, filename)
  writeFileSync(path, Buffer.from(doc.output('arraybuffer')))
  return path
}

const SCENARIOS = [
  {
    file: '01-vf-pvt-rosc-sustained-handover.pdf',
    description: 'VF/pVT initial rhythm — ROSC, sustained ROSC, patient handed over',
    events: [
      { text: 'Request additional resources (if required)', plusSec: 15 },
      { text: 'Minimise interruptions to chest compressions', plusSec: 28 },
      { text: 'Ensure optimal defibrillator pad placement', plusSec: 42 },
      { text: 'Give oxygen', plusSec: 55 },
      { text: 'Use waveform capnography', plusSec: 68 },
      { text: 'VF / pVT — 120J', plusSec: 95 },
      { text: 'CODE SHOCK notified to EOC', plusSec: 108 },
      { text: 'Vascular access — IO', plusSec: 125 },
      { text: 'Airway — SGA (i-gel)', plusSec: 148 },
      { text: 'Breathing — BVM', plusSec: 152 },
      { text: 'Oxygen', plusSec: 152 },
      { text: 'Continuous compressions if tracheal tube or SGA', plusSec: 165 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 198 },
      { text: 'VF / pVT — 150J', plusSec: 228 },
      { text: 'Reversible cause considered: Hypoxia', plusSec: 255 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 318 },
      { text: 'PEA', plusSec: 348 },
      { text: 'ROSC', plusSec: 372 },
      { text: 'Post ROSC care: ABCDE assessment', plusSec: 390 },
      { text: 'Post ROSC care: Aim for SpO2 94-98% and normal PaCO2', plusSec: 405 },
      { text: 'Post ROSC care: 12 lead ECG', plusSec: 420 },
      { text: 'Reversible cause considered: Thrombosis', plusSec: 445 },
      { text: 'Post ROSC care: Temperature control', plusSec: 460 },
      { text: 'Post ROSC care: 250ml sodium chloride', plusSec: 510 },
      { text: 'Post ROSC care: Pulse rate 60 bpm and above', plusSec: 540 },
      { text: 'Sustained ROSC achieved (more than 10 minutes with output)', plusSec: 1020 },
      { text: 'Patient handed over', plusSec: 1085 },
    ],
  },
  {
    file: '02-vf-pvt-tor-vod.pdf',
    description: 'VF/pVT initial rhythm — termination of resuscitation, then VoD',
    events: [
      { text: 'Minimise interruptions to chest compressions', plusSec: 20 },
      { text: 'Ensure optimal defibrillator pad placement', plusSec: 35 },
      { text: 'Give oxygen', plusSec: 48 },
      { text: 'VF / pVT — 120J', plusSec: 90 },
      { text: 'CODE SHOCK notified to EOC', plusSec: 102 },
      { text: 'Vascular access — IV 18g', plusSec: 130 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 195 },
      { text: 'VF / pVT — 150J', plusSec: 225 },
      { text: 'VF / pVT — 200J', plusSec: 285 },
      { text: 'Prolonged VF', plusSec: 288 },
      { text: 'Vector change — not changed', plusSec: 295 },
      { text: 'Amiodarone 300mg — dose 1', plusSec: 310 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 375 },
      { text: 'Early transfer to hospital — considered', plusSec: 420 },
      { text: 'Adrenaline 1:10,000 — dose 3', plusSec: 555 },
      { text: 'VF / pVT — 200J', plusSec: 585 },
      { text: 'Amiodarone 150mg — dose 2', plusSec: 600 },
      { text: 'Adrenaline 1:10,000 — dose 4', plusSec: 735 },
      { text: 'PEA', plusSec: 765 },
      { text: 'TOR — no special circumstances believed', plusSec: 2720 },
      { text: 'Termination of resuscitation — senior clinical advice sought', plusSec: 2725 },
      { text: 'Clinical discussion — continue resuscitation', plusSec: 2780 },
      { text: 'Adrenaline 1:10,000 — dose 5', plusSec: 2850 },
      { text: 'Asystole', plusSec: 2880 },
      { text: 'TOR — no special circumstances believed', plusSec: 2895 },
      { text: 'Termination of resuscitation — resuscitation ended', plusSec: 2910 },
      { text: 'Verification of death', plusSec: 3215 },
    ],
  },
  {
    file: '03-pea-rosc-handover.pdf',
    description: 'PEA initial rhythm — ROSC and patient handed over',
    events: [
      { text: 'Request additional resources (if required)', plusSec: 18 },
      { text: 'Minimise interruptions to chest compressions', plusSec: 32 },
      { text: 'Give oxygen', plusSec: 50 },
      { text: 'PEA', plusSec: 88 },
      { text: 'Vascular access — IV 20g', plusSec: 115 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 175 },
      { text: 'Reversible cause considered: Tension pneumothorax', plusSec: 200 },
      { text: 'Breathing — Needle decompression', plusSec: 215 },
      { text: 'Oxygen', plusSec: 215 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 295 },
      { text: 'PEA', plusSec: 325 },
      { text: 'ROSC — post-arrest care commenced', plusSec: 355 },
      { text: 'Post ROSC care: ABCDE assessment', plusSec: 370 },
      { text: 'Post ROSC care: Aim for SpO2 94-98% and normal PaCO2', plusSec: 385 },
      { text: 'Post ROSC care: 12 lead ECG', plusSec: 400 },
      { text: 'Post ROSC care: 500ml sodium chloride', plusSec: 455 },
      { text: 'Post ROSC care: Pulse rate 60 bpm and above', plusSec: 485 },
      { text: 'Patient handed over', plusSec: 620 },
    ],
  },
  {
    file: '04-pea-tor-vod.pdf',
    description: 'PEA initial rhythm — TOR and VoD (no ROSC)',
    events: [
      { text: 'Minimise interruptions to chest compressions', plusSec: 22 },
      { text: 'Give oxygen', plusSec: 40 },
      { text: 'PEA', plusSec: 75 },
      { text: 'Vascular access — IO', plusSec: 105 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 165 },
      { text: 'Reversible cause considered: Hypovolaemia', plusSec: 190 },
      { text: 'Medication — Sodium chloride (500ml)', plusSec: 210 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 285 },
      { text: 'PEA', plusSec: 315 },
      { text: 'Adrenaline 1:10,000 — dose 3', plusSec: 405 },
      { text: 'PEA', plusSec: 435 },
      { text: 'Adrenaline 1:10,000 — dose 4', plusSec: 525 },
      { text: 'PEA', plusSec: 555 },
      { text: 'TOR — no special circumstances believed', plusSec: 2680 },
      { text: 'Termination of resuscitation — resuscitation ended', plusSec: 2705 },
      { text: 'Verification of death', plusSec: 3010 },
    ],
  },
  {
    file: '05-asystole-tor-vod.pdf',
    description: 'Asystole initial rhythm — TOR and VoD (no ROSC)',
    events: [
      { text: 'Minimise interruptions to chest compressions', plusSec: 25 },
      { text: 'Give oxygen', plusSec: 42 },
      { text: 'Asystole', plusSec: 80 },
      { text: 'Vascular access — IV 18g', plusSec: 110 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 170 },
      { text: 'Asystole', plusSec: 200 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 290 },
      { text: 'Asystole', plusSec: 320 },
      { text: 'Adrenaline 1:10,000 — dose 3', plusSec: 410 },
      { text: 'Asystole', plusSec: 440 },
      { text: 'Early transfer to hospital — considered', plusSec: 480 },
      { text: 'Adrenaline 1:10,000 — dose 4', plusSec: 530 },
      { text: 'Asystole', plusSec: 560 },
      { text: 'TOR — no special circumstances believed', plusSec: 2710 },
      { text: 'Termination of resuscitation — resuscitation ended', plusSec: 2730 },
      { text: 'Verification of death', plusSec: 3035 },
    ],
  },
  {
    file: '06-vod-obviously-deceased-immediate.pdf',
    description: 'Initial assessment — obviously deceased (immediate criteria), no resuscitation',
    events: [
      { text: 'VOD: Massive cranial or cerebral destruction', plusSec: 45 },
      { text: 'VOD: Decomposition or incineration', plusSec: 45 },
      { text: 'Verification of death', plusSec: 52 },
    ],
  },
  {
    file: '07-vod-dnacpr.pdf',
    description: 'Initial assessment — DNACPR / ReSPECT, no resuscitation',
    events: [
      { text: 'VOD: ADRT / DNACPR / ReSPECT (Resuscitation Decision)', plusSec: 120 },
      { text: 'Verification of death', plusSec: 135 },
    ],
  },
  {
    file: '08-vod-asystole-observation.pdf',
    description: 'Initial assessment — obviously deceased (observation criteria), 5-minute asystole VoD',
    events: [
      { text: 'VOD: Hypostasis', plusSec: 90 },
      { text: 'VOD: Rigor mortis', plusSec: 90 },
      { text: 'VOD: Apnoea', plusSec: 95 },
      { text: 'VOD: Absent circulation at central pulse site', plusSec: 95 },
      { text: 'VOD: Unresponsive (GCS 3/15)', plusSec: 95 },
      { text: 'VOD: Asystole', plusSec: 95 },
      { text: 'Verification of death', plusSec: 405 },
    ],
  },
  {
    file: '09-vf-pvt-rosc-rearrest.pdf',
    description: 'VF/pVT — ROSC, re-arrest, continued resuscitation (bonus scenario)',
    events: [
      { text: 'VF / pVT — 120J', plusSec: 85 },
      { text: 'CODE SHOCK notified to EOC', plusSec: 98 },
      { text: 'Vascular access — IO', plusSec: 120 },
      { text: 'Adrenaline 1:10,000 — dose 1', plusSec: 185 },
      { text: 'VF / pVT — 150J', plusSec: 215 },
      { text: 'ROSC — post-arrest care commenced', plusSec: 280 },
      { text: 'Post ROSC care: ABCDE assessment', plusSec: 295 },
      { text: 'Post ROSC care: 12 lead ECG', plusSec: 320 },
      { text: 'Cardiac arrest', plusSec: 540 },
      { text: 'PEA', plusSec: 565 },
      { text: 'Adrenaline 1:10,000 — dose 2', plusSec: 625 },
      { text: 'PEA', plusSec: 655 },
      { text: 'ROSC', plusSec: 690 },
      { text: 'Patient handed over', plusSec: 820 },
    ],
  },
]

mkdirSync(OUT_DIR, { recursive: true })

console.log(`Writing sample PDFs to ${OUT_DIR}\n`)

for (const scenario of SCENARIOS) {
  const entries = buildEntries(scenario.events)
  const path = writePdf(entries, scenario.file)
  console.log(`  ${scenario.file}`)
  console.log(`    ${scenario.description} (${entries.length} events)\n`)
}

console.log(`Done — ${SCENARIOS.length} PDFs created.`)
