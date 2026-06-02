import sharp from 'sharp'
import QRCode from 'qrcode'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'blog/images')

const CANVAS_W = 1200
const CANVAS_H = 520
const PHONE_LEFT_X = 80
const PHONE_RIGHT_X = 780
const PHONE_W = 340
const PHONE_Y = 85
const PHONE_H = 395
const SCREEN_INSET = 14
const leftScreenX = PHONE_LEFT_X + SCREEN_INSET
const rightScreenX = PHONE_RIGHT_X + SCREEN_INSET
const screenY = PHONE_Y + 56
const screenW = PHONE_W - SCREEN_INSET * 2
const screenH = PHONE_H - 68
const modalW = screenW - 28
const leftModalX = leftScreenX + 14
const rightModalX = rightScreenX + 14
const modalY = screenY + 52
const modalH = screenH - 62
const QR_SIZE = 168
const QR_X = PHONE_LEFT_X + (PHONE_W - QR_SIZE) / 2
const QR_Y = modalY + 58
const ARROW_Y = QR_Y + QR_SIZE / 2
const GAP_LEFT = PHONE_LEFT_X + PHONE_W
const GAP_RIGHT = PHONE_RIGHT_X
const ARROW_INSET = 24
const ARROW_X1 = GAP_LEFT + ARROW_INSET
const ARROW_X2 = GAP_RIGHT - ARROW_INSET
const ARROW_MID_X = (GAP_LEFT + GAP_RIGHT) / 2
const rightPhoneCenterX = PHONE_RIGHT_X + PHONE_W / 2
const leftPhoneCenterX = PHONE_LEFT_X + PHONE_W / 2

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="420" viewBox="0 0 1200 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f4f1f"/>
      <stop offset="100%" stop-color="#2d6a2d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="420" fill="url(#bg)" rx="16"/>
  <text x="600" y="148" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" opacity="0.9">Resusci-Time release</text>
  <text x="600" y="218" text-anchor="middle" fill="#ffffff" font-family="Arial Black, Arial, sans-serif" font-size="72" font-weight="900">Version 1.2.1</text>
  <text x="600" y="278" text-anchor="middle" fill="#d0e0d0" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600">Case transfer · Post-ROSC · Clinical fixes</text>
  <rect x="320" y="310" width="560" height="56" rx="28" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <text x="600" y="346" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600">Standard and WMAS live builds</text>
</svg>`

const transferFlowBaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
  <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#ebf2eb" rx="16"/>
  <text x="${CANVAS_W / 2}" y="48" text-anchor="middle" fill="#1f4f1f" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">Transfer case — scan the QR on the other device</text>

  <!-- Left phone: Resusci-Time transfer modal -->
  <rect x="${PHONE_LEFT_X}" y="${PHONE_Y}" width="${PHONE_W}" height="${PHONE_H}" rx="24" fill="#163816"/>
  <rect x="${leftScreenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="14" fill="#dfe8df"/>
  <rect x="${PHONE_LEFT_X + 20}" y="${PHONE_Y + 28}" width="${PHONE_W - 40}" height="36" rx="8" fill="#2d6a2d"/>
  <text x="${leftPhoneCenterX}" y="${PHONE_Y + 52}" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="700">Sending device · Resusci-Time</text>
  <!-- timer bar (paused) -->
  <rect x="${leftScreenX + 8}" y="${screenY + 8}" width="${screenW - 16}" height="36" rx="8" fill="#1f4f1f"/>
  <text x="${leftScreenX + 18}" y="${screenY + 22}" fill="#fff" font-family="Arial, sans-serif" font-size="9" opacity="0.85">ELAPSED</text>
  <text x="${leftScreenX + 18}" y="${screenY + 36}" fill="#fff" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900">18:42</text>
  <text x="${leftScreenX + screenW - 18}" y="${screenY + 32}" text-anchor="end" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="700">Paused</text>
  <!-- transfer modal -->
  <rect x="${leftModalX}" y="${modalY}" width="${modalW}" height="${modalH}" rx="10" fill="#ebf2eb" stroke="#b0c4b0" stroke-width="2"/>
  <text x="${leftPhoneCenterX}" y="${modalY + 26}" text-anchor="middle" fill="#1f4f1f" font-family="Arial, sans-serif" font-size="15" font-weight="800">Transfer case</text>
  <text x="${leftPhoneCenterX}" y="${modalY + 48}" text-anchor="middle" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="10">Timer paused · scan QR on other device</text>
  <rect x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" rx="6" fill="#fff" stroke="#b0c4b0" stroke-width="1"/>
  <rect x="${leftModalX + 16}" y="${modalY + modalH - 44}" width="${modalW - 32}" height="30" rx="8" fill="#1f4f1f"/>
  <text x="${leftPhoneCenterX}" y="${modalY + modalH - 25}" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="700">Case transferred</text>

  <!-- Right phone: Resusci-Time receive handoff -->
  <rect x="${PHONE_RIGHT_X}" y="${PHONE_Y}" width="${PHONE_W}" height="${PHONE_H}" rx="24" fill="#163816"/>
  <rect x="${rightScreenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="14" fill="#dfe8df"/>
  <rect x="${PHONE_RIGHT_X + 20}" y="${PHONE_Y + 28}" width="${PHONE_W - 40}" height="36" rx="8" fill="#2d6a2d"/>
  <text x="${rightPhoneCenterX}" y="${PHONE_Y + 52}" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="700">Receiving device · Resusci-Time</text>
  <!-- timer bar -->
  <rect x="${rightScreenX + 8}" y="${screenY + 8}" width="${screenW - 16}" height="36" rx="8" fill="#1f4f1f"/>
  <text x="${rightScreenX + 18}" y="${screenY + 22}" fill="#fff" font-family="Arial, sans-serif" font-size="9" opacity="0.85">ELAPSED</text>
  <text x="${rightScreenX + 18}" y="${screenY + 36}" fill="#fff" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900">18:42</text>
  <rect x="${rightScreenX + 8}" y="${screenY + 50}" width="${screenW - 16}" height="${screenH - 58}" rx="8" fill="rgba(26,46,26,0.28)"/>
  <!-- receive modal -->
  <rect x="${rightModalX}" y="${modalY + 8}" width="${modalW}" height="${modalH - 8}" rx="10" fill="#ebf2eb" stroke="#b0c4b0" stroke-width="2"/>
  <text x="${rightModalX + 14}" y="${modalY + 34}" fill="#1f4f1f" font-family="Arial, sans-serif" font-size="14" font-weight="800">Receive transferred case</text>
  <text x="${rightModalX + modalW - 14}" y="${modalY + 34}" text-anchor="end" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="10">Cancel</text>
  <text x="${rightPhoneCenterX}" y="${modalY + 58}" text-anchor="middle" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="10">Case from another device</text>
  <text x="${rightPhoneCenterX}" y="${modalY + 74}" text-anchor="middle" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="10">(18 events · handoff just now)</text>
  <rect x="${rightModalX + 16}" y="${modalY + modalH - 78}" width="${modalW - 32}" height="34" rx="8" fill="#1f4f1f"/>
  <text x="${rightPhoneCenterX}" y="${modalY + modalH - 57}" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="700">Take over case</text>
  <rect x="${rightModalX + 16}" y="${modalY + modalH - 38}" width="${modalW - 32}" height="28" rx="8" fill="#e2ebe2" stroke="#b0c4b0" stroke-width="1"/>
  <text x="${rightPhoneCenterX}" y="${modalY + modalH - 20}" text-anchor="middle" fill="#1f4f1f" font-family="Arial, sans-serif" font-size="11" font-weight="600">Cancel</text>
  <text x="${rightPhoneCenterX}" y="${PHONE_Y + PHONE_H - 16}" text-anchor="middle" fill="#d0e0d0" font-family="Arial, sans-serif" font-size="11">Timer resumes after take over</text>

  <text x="${CANVAS_W / 2}" y="${CANVAS_H - 18}" text-anchor="middle" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="14" font-weight="600">Nothing stored on a server — case data is in the QR only</text>
</svg>`

function transferFlowArrowSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
  <text x="${ARROW_MID_X}" y="${ARROW_Y - 28}" text-anchor="middle" fill="#2d6a2d" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700">Scan QR → opens app</text>
  <line x1="${ARROW_X1}" y1="${ARROW_Y}" x2="${ARROW_X2}" y2="${ARROW_Y}" stroke="#2d6a2d" stroke-width="7" stroke-linecap="round"/>
  <polygon points="${ARROW_X2},${ARROW_Y} ${ARROW_X2 - 22},${ARROW_Y - 13} ${ARROW_X2 - 22},${ARROW_Y + 13}" fill="#2d6a2d"/>
</svg>`
}

async function buildTransferFlowImage() {
  const qrBuffer = await QRCode.toBuffer(
    'https://resusci-time.example/handoff?demo=case-transfer-blog',
    {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: QR_SIZE,
      color: { dark: '#1f4f1f', light: '#ffffff' },
    },
  )

  const base = await sharp(Buffer.from(transferFlowBaseSvg)).png().toBuffer()
  const arrow = Buffer.from(transferFlowArrowSvg())

  await sharp(base)
    .composite([
      { input: qrBuffer, top: Math.round(QR_Y), left: Math.round(QR_X) },
      { input: arrow, top: 0, left: 0 },
    ])
    .png()
    .toFile(join(outDir, 'case-transfer-flow.png'))

  console.log(`Wrote ${join(outDir, 'case-transfer-flow.png')}`)
}

const imminentWarningSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520">
  <rect width="1200" height="520" fill="rgba(26,46,26,0.55)" rx="16"/>
  <rect x="250" y="70" width="700" height="380" rx="14" fill="#ebf2eb" stroke="#b0c4b0" stroke-width="2"/>
  <text x="600" y="130" text-anchor="middle" fill="#1f4f1f" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800">Checks or drugs due soon</text>
  <text x="600" y="175" text-anchor="middle" fill="#4a5f4a" font-family="Arial, Helvetica, sans-serif" font-size="17">Wait until after these before transferring if you can.</text>
  <circle cx="320" cy="230" r="6" fill="#d97706"/>
  <text x="345" y="236" fill="#1a2e1a" font-family="Arial, sans-serif" font-size="18">Rhythm check in less than a minute (0:42 remaining)</text>
  <circle cx="320" cy="278" r="6" fill="#d97706"/>
  <text x="345" y="284" fill="#1a2e1a" font-family="Arial, sans-serif" font-size="18">Adrenaline in less than a minute (0:38 remaining)</text>
  <rect x="290" y="330" width="620" height="52" rx="10" fill="#1f4f1f"/>
  <text x="600" y="363" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="17" font-weight="700">Stay on this case — finish checks first</text>
  <rect x="290" y="395" width="620" height="44" rx="10" fill="#e2ebe2" stroke="#b0c4b0" stroke-width="2"/>
  <text x="600" y="424" text-anchor="middle" fill="#1f4f1f" font-family="Arial, sans-serif" font-size="16" font-weight="600">Transfer anyway</text>
</svg>`

const roscButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320">
  <rect width="1200" height="320" fill="#dfe8df" rx="16"/>
  <text x="600" y="42" text-anchor="middle" fill="#1f4f1f" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">Post-ROSC — return to cardiac arrest</text>
  <rect x="80" y="70" width="1040" height="210" rx="12" fill="#1f4f1f"/>
  <text x="130" y="118" fill="#fff" font-family="Arial, sans-serif" font-size="13" opacity="0.85">ROSC</text>
  <text x="130" y="158" fill="#fff" font-family="Arial Black, Arial, sans-serif" font-size="36" font-weight="900">12:04</text>
  <text x="130" y="188" fill="#fff" font-family="Arial, sans-serif" font-size="14" opacity="0.9">Sustained ROSC</text>
  <rect x="880" y="120" width="180" height="44" rx="8" fill="#b91c1c" stroke="#fecaca" stroke-width="2"/>
  <text x="970" y="149" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="800">Cardiac arrest</text>
  <text x="600" y="268" text-anchor="middle" fill="#4a5f4a" font-family="Arial, sans-serif" font-size="16">Logs the event · immediate rhythm check · 2-minute timer restarts after rhythm logged</text>
</svg>`

const sustainedRoscSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360">
  <rect width="1200" height="360" fill="#ebf2eb" rx="16"/>
  <rect x="150" y="60" width="900" height="240" rx="12" fill="#f5eacd" stroke="#d97706" stroke-width="3"/>
  <text x="600" y="110" text-anchor="middle" fill="#7c2d12" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800">Sustained ROSC</text>
  <text x="600" y="150" text-anchor="middle" fill="#1a2e1a" font-family="Arial, sans-serif" font-size="17">More than 10 minutes with output — recorded in the log.</text>
  <text x="600" y="195" text-anchor="middle" fill="#1a2e1a" font-family="Arial, sans-serif" font-size="16" font-weight="600">Senior clinical discussion would be required should the patient</text>
  <text x="600" y="222" text-anchor="middle" fill="#1a2e1a" font-family="Arial, sans-serif" font-size="16" font-weight="600">return to cardiac arrest before any cessation of resuscitation.</text>
  <rect x="470" y="250" width="260" height="40" rx="8" fill="#1f4f1f"/>
  <text x="600" y="277" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="16" font-weight="700">Acknowledge</text>
</svg>`

const images = [
  ['release-1-2-hero.png', heroSvg],
  ['transfer-imminent-warning.png', imminentWarningSvg],
  ['rosc-cardiac-arrest-button.png', roscButtonSvg],
  ['sustained-rosc-alert.png', sustainedRoscSvg],
]

await buildTransferFlowImage()

for (const [filename, svg] of images) {
  const outPath = join(outDir, filename)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`Wrote ${outPath}`)
}
