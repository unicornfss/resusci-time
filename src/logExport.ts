import type { DisplayLogEntry } from './types'

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildExportFilename(extension: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `resusci-time-log-${stamp}.${extension}`
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function buildLogCsvBlob(
  entries: readonly DisplayLogEntry[],
  documentTitle: string,
): { blob: Blob; filename: string } {
  const lines = [
    escapeCsvField(documentTitle),
    'Time,Event',
    ...entries.map((entry) => `${escapeCsvField(entry.label)},${escapeCsvField(entry.text)}`),
  ]
  return {
    blob: new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }),
    filename: buildExportFilename('csv'),
  }
}

export function downloadLogCsv(entries: readonly DisplayLogEntry[], documentTitle: string): void {
  const { blob, filename } = buildLogCsvBlob(entries, documentTitle)
  downloadBlob(blob, filename)
}

export async function buildLogPdfBlob(
  entries: readonly DisplayLogEntry[],
  documentTitle: string,
): Promise<{ blob: Blob; filename: string }> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 14
  const maxWidth = pageWidth - marginX * 2
  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(documentTitle, marginX, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Exported ${new Date().toLocaleString()}`, marginX, y)
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

  const filename = buildExportFilename('pdf')
  return { blob: doc.output('blob'), filename }
}

export async function downloadLogPdf(
  entries: readonly DisplayLogEntry[],
  documentTitle: string,
): Promise<void> {
  const { blob, filename } = await buildLogPdfBlob(entries, documentTitle)
  downloadBlob(blob, filename)
}

function buildEmailDraft(documentTitle: string): { subject: string; body: string } {
  return {
    subject: `${documentTitle} — event log`,
    body: [
      'Resusci-Time cardiac arrest event log attached.',
      '',
      'Only send to recipients who need this for clinical handover or record-keeping, and follow your organisation’s policy on patient-identifiable information.',
    ].join('\r\n'),
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function wrapBase64(base64: string, lineLength = 76): string {
  const chunks: string[] = []
  for (let i = 0; i < base64.length; i += lineLength) {
    chunks.push(base64.slice(i, i + lineLength))
  }
  return chunks.join('\r\n')
}

async function buildEmlWithCsvAttachment(
  csvBlob: Blob,
  csvFilename: string,
  subject: string,
  body: string,
): Promise<Blob> {
  const base64 = wrapBase64(await blobToBase64(csvBlob))
  const boundary = `----=_ResusciTime_${Date.now()}`
  const eml = [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    '',
    `--${boundary}`,
    `Content-Type: text/csv; charset=utf-8; name="${csvFilename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${csvFilename}"`,
    '',
    base64,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n')

  return new Blob([eml], { type: 'message/rfc822' })
}

function buildEmlFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `resusci-time-log-${stamp}.eml`
}

export type EmailShareResult = 'shared-csv' | 'shared-pdf' | 'eml-csv' | 'cancelled'

/** Share log as an email attachment where the device supports it; otherwise download + open mail draft. */
export async function shareLogViaEmail(
  entries: readonly DisplayLogEntry[],
  documentTitle: string,
): Promise<EmailShareResult> {
  const { blob: csvBlob, filename: csvFilename } = buildLogCsvBlob(entries, documentTitle)
  const csvFile = new File([csvBlob], csvFilename, { type: 'text/csv' })
  const draft = buildEmailDraft(documentTitle)

  if (navigator.share) {
    const shareTargets: File[] = [csvFile]

    if (navigator.canShare?.({ files: shareTargets })) {
      try {
        await navigator.share({
          files: shareTargets,
          title: draft.subject,
          text: 'Resusci-Time event log',
        })
        return 'shared-csv'
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return 'cancelled'
        }
      }
    }

    try {
      const { blob: pdfBlob, filename: pdfFilename } = await buildLogPdfBlob(entries, documentTitle)
      const pdfFile = new File([pdfBlob], pdfFilename, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: draft.subject,
            text: 'Resusci-Time event log',
          })
          return 'shared-pdf'
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return 'cancelled'
          }
        }
      }
    } catch {
      /* PDF generation failed — fall through to .eml download */
    }
  }

  const emlBlob = await buildEmlWithCsvAttachment(csvBlob, csvFilename, draft.subject, draft.body)
  downloadBlob(emlBlob, buildEmlFilename())
  return 'eml-csv'
}
