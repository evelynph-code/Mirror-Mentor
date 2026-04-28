const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'


//Helper: convert image to base64
export async function imageToBase64(source) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (source instanceof HTMLVideoElement) {
        //For live camera - capture current frame from video
        canvas.width = source.videoWidth
        canvas.height = source.videoHeight
        ctx.drawImage(source, 0, 0)
    } else if (typeof source === 'string') {
        //For uploaded photoURl - load into an image element first
        await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                ctx.drawImage(img,0,0)
                resolve()
            }
            img.onerror = reject
            img.src = source
        })
    }

    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
}

export async function analyzeAndGenerate(base64Image, makeupStyle, lightingConfidence) {
    const lightingContext = lightingConfidence
    ? `LIGHTING NOTE: ${lightingConfidence}`
    : `Lighting quality is unknown - be conservative with skin tone.`

    const prompt = `
    You are a professional makeup artist AI and color analyst.

    ${lightingContext}

    Analyze this face and generate a complete personalized ${makeupStyle} 
    makeup guide with real product recommendations.

    Return ONLY this exact JSON with no extra text, markdown, or code blocks:

    {
      "faceData": {
        "faceShape": "oval",
        "skinTone": "medium warm",
        "skinToneHex": "#C68642",
        "skinToneConfidence": "high",
        "eyeShape": "almond",
        "lipFullness": "full"
      },
      "steps": [
        {
          "step": 1,
          "title": "Moisturizer + SPF",
          "description": "Apply lightweight moisturizer all over before any makeup.",
          "zone": "full face",
          "tip": "Wait 1 minute before next step",
          "product": "Neutrogena Hydro Boost",
          "shade": "N/A",
          "shadeHex": "#F5E6D8",
          "opacity": 0.15
        },
        {
          "step": 2,
          "title": "Foundation",
          "description": "Apply with damp sponge using light dabbing motions.",
          "zone": "full face",
          "tip": "Build thin layers for a natural finish",
          "product": "Maybelline Fit Me Matte",
          "shade": "220 Natural Beige",
          "shadeHex": "#C68450",
          "opacity": 0.30
        }
      ]
    }

    Rules for faceData:
    - faceShape: oval, round, square, heart, oblong, or diamond
    - skinTone: descriptive name e.g. "medium warm", "deep cool", "fair neutral"
    - skinToneHex: your best estimate of their actual skin hex color
    - skinToneConfidence: "high", "medium", or "low" based on lighting
    - eyeShape: almond, round, monolid, hooded, upturned, or downturned
    - lipFullness: thin, medium, or full

    Rules for steps:
    - Generate 6 to 8 steps in correct makeup application order
    - Every step MUST have a real drugstore or mid-range product name
    - shadeHex must be the closest hex color to that actual product shade
    - opacity: 0.15 to 0.45 — lighter for base products, stronger for color products
    - Personalize shades to their exact skin tone — this is critical
    - zone must be one of: full face, under eyes, cheekbones, cheek apples,
      nose bridge, eyebrows, eyelids, lash line, lips, cupid's bow
    - Keep descriptions beginner friendly and concise

    If face is not clearly visible return:
    { "error": "Face not clearly visible" }
  `
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{
            parts: [
                {inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                }},
                {text: prompt}
            ]
        }],
        generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json'
        }
    })
  })

  if (!response.ok) {
    const errBody = await response.json()
    console.error('Gemini error:', errBody)
    if (response.status === 429) {
        throw new Error('Too many requests - please wait a moment and try again.')
    }
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text.trim()
  const cleaned = text.replace(/```json|```/g, '').trim()
    
  if (!cleaned.endsWith("}") && !cleaned.endsWith("]")) {
    console.error("Truncated JSON:", cleaned)
    throw new Error("Incomplete JSON from Gemini")
  }
  
  const result = JSON.parse(cleaned)

  if (result.error) throw new Error(result.error)

  return result
}