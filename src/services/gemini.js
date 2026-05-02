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

//Makeup Guide generation
export async function analyzeAndGenerate(base64Image, makeupStyle, lightingConfidence) {
    const lightingContext = lightingConfidence
    ? `LIGHTING NOTE: ${lightingConfidence}`
    : `Lighting quality is unknown - be conservative with skin tone.`

    const prompt = `
      You are a professional makeup artist and beauty educator.

      ${lightingContext}

      Analyze this face and create a detailed personalized ${makeupStyle} makeup tutorial.

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
            "description": "Apply a pea-sized amount of moisturizer in upward circular motions starting from the center of your face outward. Pay extra attention to dry patches around the nose and cheeks.",
            "technique": "Press gently with fingertips — never drag or pull the skin.",
            "zone": "full face",
            "tip": "Wait 60 seconds before applying primer so it fully absorbs",
            "shadeHex": "#F5E6D8",
            "opacity": 0.15
          }
        ]
      }

      Rules for faceData:
      - faceShape: oval, round, square, heart, oblong, or diamond
      - skinTone: descriptive e.g. "medium warm", "deep cool", "fair neutral"
      - skinToneHex: best estimate of their actual skin hex color
      - skinToneConfidence: "high", "medium", or "low" based on lighting
      - eyeShape: almond, round, monolid, hooded, upturned, or downturned
      - lipFullness: thin, medium, or full

      Rules for steps:
      - Generate 7 to 9 steps in correct makeup application order
      - NO product names — technique and placement only
      - description: 2-3 sentences with SPECIFIC technique instruction.
        Include exact motions (stipple, blend, swipe, tap, press),
        tools to use (brush, sponge, fingers), and direction of application
      - technique: one sentence with the most important pro tip for this step
      - Address the user's face shape specifically:
        e.g. for round face — contour temples and jawline to elongate,
        for heart face — focus blush on lower cheeks,
        for hooded eyes — apply shadow above the crease not on the lid
      - For contour: explain exactly where to place based on their face shape,
        how to blend, and what angle to hold the brush
      - For highlighter: name exact points to apply (brow bone, inner corner,
        cupid's bow, tip of nose, tops of cheekbones)
      - For eyeshadow: explain the crease, lid, and blending technique
      - For concealer: explain how to color correct and cover specific concerns
      - shadeHex: color that should be applied — match to step purpose
        (foundation matches skin tone, blush is soft pink,
        contour is 2 shades darker, highlight is champagne/gold)
      - opacity: 0.15 to 0.45
      - zone: one of: full face, under eyes, cheekbones, cheek apples,
        nose bridge, eyebrows, eyelids, lash line, lips, cupid's bow
      - tip is optional but encouraged — make it genuinely useful

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

//Product finder generation
export async function generateProducts(profile, makeupStyle) {
  const concerns = profile.skin_concerns?.length > 0
  ? profile.skin_concerns.join(', ')
  : 'none specified'

  const budgetInstructions = {
    budget: {
      label: 'budget-friendly',
      perProduct: 'strictly under $20 per product',
      brands: 'Maybelline, L\'Oréal, NYX, e.l.f., Wet n Wild, Revlon, CoverGirl, Essence',
      avoid: 'Do NOT suggest any luxury, high-end or mid-range brands.',
    },
    midrange: {
      label: 'mid-range',
      perProduct: 'between $20 and $60 per product',
      brands: 'Urban Decay, Too Faced, NARS, Benefit, MAC, Tarte, Laura Mercier, Clinique',
      avoid: 'Do NOT suggest drugstore or luxury brands.',
    },
    luxury: {
      label: 'luxury / high-end',
      perProduct: 'strictly $60 or above per product — do not go below this',
      brands: 'Charlotte Tilbury, La Mer, Chanel, Dior, YSL, Giorgio Armani, Tom Ford, Hourglass, Pat McGrath, Clé de Peau',
      avoid: 'Do NOT suggest any drugstore or mid-range brands. Every product must be premium luxury.',
    },
  }

  const tier = budgetInstructions[profile.budget] ?? budgetInstructions.budget

  const prompt = `
    You are a professional makeup artist and luxury beauty product expert.

    Generate a personalized makeup product shopping list for this person:
    - Face shape: ${profile.face_shape ?? 'unknown'}
    - Skin tone: ${profile.skin_tone ?? 'medium'}
    - Skin tone hex: ${profile.skin_tone_hex ?? '#C68642'}
    - Skin type: ${profile.skin_type ?? 'normal'}
    - Skin concerns: ${concerns}
    - Makeup style: ${makeupStyle}
    - Budget tier: ${tier.label}
    - Price per product: ${tier.perProduct}
    - Total budget: $${profile.total_budget ?? '100'}
    - Recommended brands: ${tier.brands}

    CRITICAL PRICING RULE: ${tier.avoid}
    Every single product MUST be priced ${tier.perProduct}.
    If you suggest a product outside this price range, the recommendation is wrong.

    Return ONLY a JSON array with no extra text, markdown or code blocks:
    [
      {
        "category": "Foundation",
        "product": "Charlotte Tilbury Airbrush Flawless Foundation",
        "brand": "Charlotte Tilbury",
        "shade": "3 Neutral",
        "shadeHex": "#C68450",
        "price": 68,
        "whyItWorks": "Buildable coverage with a flawless finish, perfect for medium warm skin",
        "zone": "full face"
      }
    ]

    Rules:
    - Recommend exactly one product per category
    - Categories in application order:
      Moisturizer, Primer, Foundation, Concealer,
      Setting powder, Contour, Blush, Highlighter,
      Eyeshadow, Eyeliner, Mascara, Lip product
    - Only include categories relevant to ${makeupStyle} style
    - Stay within $${profile.total_budget ?? '100'} total budget
    - Match shade to their exact skin tone hex ${profile.skin_tone_hex ?? '#C68642'}
    - Address their skin concerns: ${concerns}
    - price must be a realistic number matching ${tier.perProduct}
    - whyItWorks must mention their specific skin type or concern
    - shadeHex must match the actual product shade color
  `

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{parts: [{text: prompt}]}],
      generationConfig: {
        temperature: 0.3,
      }
    })
  })

  if (!response.ok) {
    const errBody = await response.json()
    if (response.status === 429) {
      throw new Error('Too many requests - please wait a moment and try again.')
    }
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text.trim()
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}