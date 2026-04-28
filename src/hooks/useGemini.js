import { useState } from "react";
import {analyzeAndGenerate, imageToBase64} from '../services/gemini'


export function useGemini() {
    const [analyzing, setAnalyzing] = useState(false)
    const [faceData, setFaceData] = useState(null)
    const [steps, setSteps] = useState(null)
    const [error, setError] = useState(null)

    async function analyze(imageSource, makeupStyle, lightingConfidence) {
        setAnalyzing(true)
        setError(null)
        setFaceData(null)
        setSteps(null)

        try {
            const base64 = await imageToBase64(imageSource)
            const result = await analyzeAndGenerate(base64, makeupStyle, lightingConfidence)
            setFaceData(result.faceData)
            setSteps(result.steps)
        } catch (err) {
            console.error('Gemini error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    } 

    return {analyze, analyzing, faceData, steps, error}
}