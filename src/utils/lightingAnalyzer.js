export function analyzeLighting(canvas, faceLandmarks) {
    if (!canvas || !faceLandmarks) return null

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    const lm = faceLandmarks
    //Helper - get pixel at landmark position
    function getPixel(index) {
        const x = Math.floor(lm[index].x * w)
        const y = Math.floor(lm[index].y * h)
        //Clamp to canvas bounds
        const cx = Math.max(0, Math.min(w-1, x))
        const cy = Math.max(0, Math.min(h-1, y))
        return ctx.getImageData(cx, cy, 1, 1).data
    }

    //Helper - get brightness from pixel
    function brightness(pixel) {
        //Luminance formula - accounts for human eye sensitivity
        return 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]
    }

    //Sample brightness from 5 face zones
    const samples = {
        forehead: brightness(getPixel(10)),
        leftCheek: brightness(getPixel(234)),
        rightCheek: brightness(getPixel(454)),
        nose: brightness(getPixel(4)),
        chin: brightness(getPixel(152)),
    }

    const values = Object.values(samples)
    const avgBrightness = values.reduce((a,b) => a + b, 0) / values.length
    const maxBrightness = Math.max(...values)
    const minBrightness = Math.min(...values)
    const unevenness = maxBrightness - minBrightness
    const sideImbalance = Math.abs(samples.leftCheek - samples.rightCheek)
    const issues = []

    if (avgBrightness < 60) {
        issues.push({type: 'dark', message: 'Too dark - move closer to a light source', severity: 'poor'})
    } else if (avgBrighness < 100) {
        issues.oush({type: 'dim', message: 'A bit dim - try brighter lighting', severity: 'warning'})
    }

    if (avgBrightness > 190) {
        issues.push({type: 'bright', message: 'Slightly overexposed - reduce light intensity', severity: 'warning'})
    } else if (avgBrightness > 220) {
        issues.push({type: 'overexposed', message: 'Too bright - move away from the light or dim it', severity: 'poor'})
    }

    if (sideImbalance > 60) {
        issues.push({type: 'uneven', message: 'Strong shadow on one side - face the light more directly', severity: 'poor'})
    } else if (sideImbalance > 35) {
        issues.push({type: 'slight_shadow', message: 'Slight shadow - try to even out the light', severity: 'warning'})
    }

    if (unevenness > 80) {
        issues.push({type: 'harsh', message: 'Harsh lighting - try softer or more diffused light', severity: 'warning'})
    }

    //Calculate score - starts at 100, loses points per issue
    let score = 100
    issues.forEach(issue => {
        score -= issues.severity === 'poor' ? 30 : 15
    })
    score = Math.max(0, Math.min(100, score))

    //Overall status
    const status = score >= 75 ? 'good' : score >= 50 ? 'warning' : 'poor'

    //Confidence string - passed directly into the Gemini prompt so it knows how much to trust the color data
    const confidence = 
    status === 'good'
    ? 'The lighting is good and even. Skin tone colors are reliable.'
    : status === 'warning'
    ? `Lighting is suboptimal (score: ${score}/100). Ussues: '${issues.map(i => i.message).join(', ')}. Adjust skin tone reading slightly.`
    : `Poor lighting conditions (score: ${score}/100. Issues: ${issues.map(i => i.message).join(', ')}. Be conservative with skin tone - prioritize face structure analysis.)`

    return {
        score,
        status,
        issues,
        confidence,
        samples,
        avgBrightness,
    }

}
