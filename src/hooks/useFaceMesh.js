import { useEffect, useRef, useState } from "react"

export function useFaceMesh(videoRef, canvasRef, activeStep, onLandmarks) {
  const faceMeshRef = useRef(null)
  const cameraRef   = useRef(null)
  const [faceDetected, setFaceDetected] = useState(false)

  // Store activeStep and onLandmarks in refs so we can access
  // the latest values without restarting the entire effect
  const activeStepRef  = useRef(activeStep)
  const onLandmarksRef = useRef(onLandmarks)

  // Keep refs updated whenever props change
  useEffect(() => {
    activeStepRef.current  = activeStep
    onLandmarksRef.current = onLandmarks
  }, [activeStep, onLandmarks])

  // Main effect — runs ONCE when camera mounts, never restarts
  useEffect(() => {
    if (!videoRef?.current || !canvasRef?.current) return

    const FaceMesh = window.FaceMesh
    const Camera   = window.Camera

    if (!FaceMesh || !Camera) {
      console.error('MediaPipe not loaded — check index.html CDN scripts')
      return
    }

    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results) => {
      canvas.width  = videoRef.current?.videoWidth  || 640
      canvas.height = videoRef.current?.videoHeight || 480

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!results.multiFaceLandmarks?.length) {
        setFaceDetected(false)
        return
      }

      setFaceDetected(true)
      const lm = results.multiFaceLandmarks[0]

      // Use refs — always latest value, no effect restart needed
      if (onLandmarksRef.current) onLandmarksRef.current(lm, canvas)

      const p = (index) => ({
        x: lm[index].x * canvas.width,
        y: lm[index].y * canvas.height,
      })

      // Draw overlay using latest activeStep from ref
      if (activeStepRef.current) {
        drawZone(
          ctx, p,
          activeStepRef.current.zone,
          activeStepRef.current.shadeHex,
          activeStepRef.current.opacity,
          canvas
        )
      }
    })

    faceMeshRef.current = faceMesh

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current })
        }
      },
      width: 640,
      height: 480,
    })

    camera.start()
    cameraRef.current = camera

    // Cleanup — runs when component unmounts
    return () => {
      camera.stop()
      faceMesh.close()
    }
  }, []) // ✅ empty array — camera starts once, never restarts

  return { faceDetected }
}

// ─── Hex helpers ───────────────────────────────────────────────────────────
function hexToRgba(hex, opacity) {
  if (!hex) return `rgba(200, 160, 180, ${opacity ?? 0.3})`
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity ?? 0.3})`
}

function hexToRgbaDarker(hex, opacity) {
  if (!hex) return `rgba(160, 120, 140, ${opacity ?? 0.5})`
  const clean = hex.replace('#', '')
  const r = Math.max(0, parseInt(clean.substring(0, 2), 16) - 30)
  const g = Math.max(0, parseInt(clean.substring(2, 4), 16) - 30)
  const b = Math.max(0, parseInt(clean.substring(4, 6), 16) - 30)
  return `rgba(${r}, ${g}, ${b}, ${opacity ?? 0.5})`
}

// ─── Draw zone ─────────────────────────────────────────────────────────────
function drawZone(ctx, p, zone, shadeHex, opacity, canvas) {
  if (!zone) return
  const z      = zone.toLowerCase()
  const fill   = hexToRgba(shadeHex, opacity ?? 0.3)
  const stroke = hexToRgbaDarker(shadeHex, (opacity ?? 0.3) + 0.15)
  const has    = (...keywords) => keywords.some(k => z.includes(k))

  ctx.save()

  if (has('full face', 'foundation', 'primer', 'moisturizer',
          'spf', 'base', 'setting', 'powder', 'spray', 'tinted')) {
    const top    = p(10)
    const bottom = p(152)
    const left   = p(234)
    const right  = p(454)
    const cx     = (left.x + right.x) / 2
    const cy     = (top.y + bottom.y) / 2
    const rx     = (right.x - left.x) / 2
    const ry     = (bottom.y - top.y) / 2
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle   = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth   = 2
    ctx.fill()
    ctx.stroke()
  }

  if (has('concealer', 'under eye', 'under-eye', 'dark circle', 'blemish')) {
    drawEllipseFromPoints(ctx, p(33),  p(133), fill, stroke, 26, 10)
    drawEllipseFromPoints(ctx, p(362), p(263), fill, stroke, 26, 10)
  }

  if (has('contour', 'cheekbone', 'jaw', 'shadow', 'sculpt', 'slim', 'bronzer')) {
    drawStroke(ctx, [p(234), p(172)], fill, 16)
    drawStroke(ctx, [p(454), p(397)], fill, 16)
    drawStroke(ctx, [p(172), p(136), p(150), p(149), p(176), p(148), p(152)], fill, 10)
    drawStroke(ctx, [p(397), p(365), p(379), p(378), p(400), p(377), p(152)], fill, 10)
  }

  if (has('blush', 'cheek apple', 'cheeks', 'flush', 'rouge', 'blusher')) {
    drawEllipseFromPoints(ctx, p(50),  p(205), fill, stroke, 30, 18)
    drawEllipseFromPoints(ctx, p(280), p(425), fill, stroke, 30, 18)
  }

  if (has('highlight', 'highlighter', 'nose bridge', 'bridge',
          'glow', 'strobe', 'cupid', 'inner corner')) {
    drawStroke(ctx, [p(168), p(6), p(4)], fill, 12)
    drawEllipseFromPoints(ctx, p(0),   p(17),  fill, stroke, 12, 7)
    drawEllipseFromPoints(ctx, p(70),  p(63),  fill, stroke, 14, 6)
    drawEllipseFromPoints(ctx, p(300), p(293), fill, stroke, 14, 6)
    drawEllipseFromPoints(ctx, p(133), p(173), fill, stroke, 7,  5)
    drawEllipseFromPoints(ctx, p(362), p(398), fill, stroke, 7,  5)
  }

  if (has('brow', 'eyebrow', 'arch', 'brow bone')) {
    drawStroke(ctx, [p(70),  p(63),  p(105), p(66),  p(107)], fill, 7)
    drawStroke(ctx, [p(300), p(293), p(334), p(296), p(336)], fill, 7)
  }

  if (has('eyeshadow', 'eyelid', 'lid', 'crease', 'smoky', 'cut crease', 'shadow')) {
    drawEllipseFromPoints(ctx, p(33),  p(133), fill, stroke, 22, 12)
    drawEllipseFromPoints(ctx, p(362), p(263), fill, stroke, 22, 12)
    drawStroke(ctx, [p(33),  p(157), p(158), p(159), p(160), p(133)], fill, 6)
    drawStroke(ctx, [p(263), p(384), p(385), p(386), p(387), p(362)], fill, 6)
  }

  if (has('liner', 'eyeliner', 'lash line', 'lash', 'kohl', 'puppy', 'wing', 'cat eye')) {
    drawStroke(ctx, [p(33),  p(246), p(161), p(160), p(159), p(158), p(157), p(173), p(133)], fill, 3)
    drawStroke(ctx, [p(362), p(398), p(384), p(385), p(386), p(387), p(388), p(466), p(263)], fill, 3)
    drawStroke(ctx, [p(33),  p(7),   p(163), p(144), p(153), p(154), p(155), p(133)],          fill, 2)
    drawStroke(ctx, [p(362), p(382), p(381), p(380), p(374), p(373), p(390), p(249), p(263)],  fill, 2)
  }

  if (has('mascara', 'lashes')) {
    drawStroke(ctx, [p(33),  p(246), p(161), p(160), p(159), p(158), p(157), p(173), p(133)], fill, 4)
    drawStroke(ctx, [p(362), p(398), p(384), p(385), p(386), p(387), p(388), p(466), p(263)], fill, 4)
  }

  if (has('lip', 'mouth', 'lipstick', 'gloss', 'tint', 'ombre', 'balm')) {
    ctx.beginPath()
    ctx.moveTo(p(61).x,  p(61).y)
    ctx.quadraticCurveTo(p(13).x, p(13).y - 6, p(291).x, p(291).y)
    ctx.quadraticCurveTo(p(14).x, p(14).y + 6, p(61).x,  p(61).y)
    ctx.fillStyle   = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth   = 1.5
    ctx.fill()
    ctx.stroke()
  }

  ctx.restore()
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function drawEllipseFromPoints(ctx, p1, p2, fill, stroke, rx, ry) {
  const cx = (p1.x + p2.x) / 2
  const cy = (p1.y + p2.y) / 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle   = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth   = 1.5
  ctx.fill()
  ctx.stroke()
}

function drawStroke(ctx, points, color, width) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y))
  ctx.strokeStyle = color
  ctx.lineWidth   = width
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.stroke()
}