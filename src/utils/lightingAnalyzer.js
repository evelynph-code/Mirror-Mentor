export function analyzeLighting(videoElement) {
  if (!videoElement || videoElement.videoWidth === 0) return null

  // Create a temporary canvas to read raw video pixels
  const tempCanvas = document.createElement('canvas')
  const ctx        = tempCanvas.getContext('2d')
  tempCanvas.width  = videoElement.videoWidth
  tempCanvas.height = videoElement.videoHeight

  // Draw current video frame onto temp canvas
  ctx.drawImage(videoElement, 0, 0)

  const w = tempCanvas.width
  const h = tempCanvas.height

  // Sample a region and return average brightness
  function sampleRegion(xRatio, yRatio, size = 15) {
    const x = Math.floor(xRatio * w)
    const y = Math.floor(yRatio * h)
    const sx = Math.max(0, x - size)
    const sy = Math.max(0, y - size)
    const sw = Math.min(size * 2, w - sx)
    const sh = Math.min(size * 2, h - sy)

    const data = ctx.getImageData(sx, sy, sw, sh).data
    let brightness = 0
    let count = 0

    for (let i = 0; i < data.length; i += 4) {
      // Luminance formula — accounts for human eye sensitivity
      brightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      count++
    }

    return count > 0 ? brightness / count : 0
  }

  // Sample 5 key face zones based on typical face position in frame
  const samples = {
    forehead:   sampleRegion(0.5,  0.25),
    leftCheek:  sampleRegion(0.32, 0.55),
    rightCheek: sampleRegion(0.68, 0.55),
    nose:       sampleRegion(0.5,  0.5),
    chin:       sampleRegion(0.5,  0.75),
  }

  const values        = Object.values(samples)
  const avgBrightness = values.reduce((a, b) => a + b, 0) / values.length
  const maxBrightness = Math.max(...values)
  const minBrightness = Math.min(...values)
  const unevenness    = maxBrightness - minBrightness
  const sideImbalance = Math.abs(samples.leftCheek - samples.rightCheek)

  const issues = []

  // Too dark
  if (avgBrightness < 60) {
    issues.push({ type: 'dark', message: 'Too dark — move closer to a light source', severity: 'poor' })
  } else if (avgBrightness < 100) {
    issues.push({ type: 'dim', message: 'A bit dim — try brighter lighting', severity: 'warning' })  // ✅ fixed oush + typo
  }

  // Too bright — ✅ fixed order, check stricter condition first
  if (avgBrightness > 220) {
    issues.push({ type: 'overexposed', message: 'Too bright — move away from the light', severity: 'poor' })
  } else if (avgBrightness > 190) {
    issues.push({ type: 'bright', message: 'Slightly overexposed — reduce light intensity', severity: 'warning' })
  }

  // Side imbalance
  if (sideImbalance > 60) {
    issues.push({ type: 'uneven', message: 'Strong shadow on one side — face the light directly', severity: 'poor' })
  } else if (sideImbalance > 35) {
    issues.push({ type: 'slight_shadow', message: 'Slight shadow — try to even out the light', severity: 'warning' })
  }

  // Harsh lighting
  if (unevenness > 80) {
    issues.push({ type: 'harsh', message: 'Harsh lighting — try softer diffused light', severity: 'warning' })
  }

  // Calculate score
  let score = 100
  issues.forEach(issue => {
    score -= issue.severity === 'poor' ? 30 : 15  // ✅ fixed issues → issue
  })
  score = Math.max(0, Math.min(100, score))

  const status = score >= 75 ? 'good' : score >= 50 ? 'warning' : 'poor'

  const confidence =
    status === 'good'
      ? 'Lighting is good and even. Skin tone colors are reliable.'
      : status === 'warning'
      ? `Lighting is suboptimal (score: ${score}/100). Issues: ${issues.map(i => i.message).join(', ')}. Adjust skin tone reading slightly.`  // ✅ fixed Ussues
      : `Poor lighting (score: ${score}/100). Issues: ${issues.map(i => i.message).join(', ')}. Be conservative with skin tone.`

  return { score, status, issues, confidence, avgBrightness }
}