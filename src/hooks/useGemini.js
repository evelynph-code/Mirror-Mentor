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
            if (err.message.includes('429')) {
                setError('Too many requests - please wait 30 seconds and try again.')
            } else if (err.message.includes('503')) {
                setError('AI is temporarily busy - please try again in a moment.')
            } else if (err.message.includes('Face not clearly visible')) {
                setError('Face not clearly visible - make sure your face is centered and well lit.')
            } else {
                setError('Something went wrong - please try again.')
            }
        } finally {
            setAnalyzing(false)
        }
    } 

    function loadSavedLook(look) {
        setFaceData(look.face_data)
        setSteps(look.steps)
    }

    return {analyze, analyzing, faceData, steps, error, loadSavedLook}
}