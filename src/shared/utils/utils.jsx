import { API_URL } from "../constants"
// Lấy link của Bàn ăn khi quét QR
export const getTableLink = (tableId, code) => {
  return `${API_URL}/tables/${tableId}/?code=${code}`
}

// Tải canvas image về với tên file tùy chỉnh
export const downloadCanvasImage = (canvas, filename = 'download.png') => {
  if (!canvas) return false
  try {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = filename
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  } catch (err) {
    console.error('downloadCanvasImage error', err)
    return false
  }
}

// Compose a new canvas that contains the QR canvas centered with a title and subtitle below
export const composeQRCodeWithText = (
  qrCanvas,
  title = '',
  subtitle = '',
  opts = { padding: 16, titleFont: '18px sans-serif', subtitleFont: '12px sans-serif', bg: '#ffffff' }
) => {
  if (!qrCanvas) return null
  const padding = opts.padding ?? 16
  const titleFont = opts.titleFont || '18px sans-serif'
  const subtitleFont = opts.subtitleFont || '12px sans-serif'
  const bg = opts.bg || '#ffffff'

  const qrWidth = qrCanvas.width
  const qrHeight = qrCanvas.height

  // create temp canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // measure text
  ctx.font = titleFont
  const titleHeight = parseInt((titleFont.match(/(\d+)px/) || [0, 18])[1], 10)
  ctx.font = subtitleFont
  const subtitleHeight = parseInt((subtitleFont.match(/(\d+)px/) || [0, 12])[1], 10)

  const totalWidth = qrWidth + padding * 2
  const totalHeight = qrHeight + padding + titleHeight + 8 + subtitleHeight + padding

  canvas.width = totalWidth
  canvas.height = totalHeight

  // background
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // draw QR centered horizontally at top
  const qrX = (canvas.width - qrWidth) / 2
  const qrY = padding
  ctx.drawImage(qrCanvas, qrX, qrY, qrWidth, qrHeight)

  // draw title
  ctx.fillStyle = '#111827'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = titleFont
  ctx.fillText(title, canvas.width / 2, qrY + qrHeight + 8)

  // draw subtitle
  ctx.fillStyle = '#6b7280'
  ctx.font = subtitleFont
  ctx.fillText(subtitle, canvas.width / 2, qrY + qrHeight + 8 + titleHeight)

  return canvas
}