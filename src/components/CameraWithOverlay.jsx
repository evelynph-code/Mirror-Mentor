import { useState, useRef, useEffect, useCallback} from "react";
import { useFaceMesh } from "../hooks/useFaceMesh";
import { analyzeLighting } from "../utils/lightingAnalyzer";



function CameraWithOverlay({ activeStep, onVideoReady, onCameraToggle, onLightingUpdate}) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const nullRef = useRef(null)

    const[isOn, setIsOn] = useState(false)
    const[loading, setLoading] = useState(false)
    const[error, setError] = useState(null)
    const[lightingReport, setLightingReport] = useState(null)

    const frameCountRef = useRef(0)

    const handleLandmarks = useCallback((landmarks, canvas) => {
        frameCountRef.current += 1
        if (frameCountRef.current % 30 !== 0) return
        const report = analyzeLighting(videoRef.current)
        if (report) {
            setLightingReport(report)
            if (onLightingUpdate) onLightingUpdate(report)
        }
    }, [onLightingUpdate])

    const {faceDetected} = useFaceMesh(
        isOn ? videoRef : nullRef,
        isOn ? canvasRef : nullRef,
        activeStep,
        handleLandmarks
    )

    async function startCamera() {
        setLoading(true)
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
            })
            streamRef.current = stream

            if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(() => {})  // silently ignore AbortError
            if (onVideoReady) onVideoReady(videoRef.current)
            }

            setLoading(false)
            setIsOn(true)
            if (onCameraToggle) onCameraToggle(true)

        } catch (err) {
            console.error('Camera error:', err)
            setError('Could not access camera. Please allow camera permission.')
            setLoading(false)
        }
    }

    function stopCamera() {
        if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
        }
        if (videoRef.current) videoRef.current.srcObject = null
        setIsOn(false)
        setLightingReport(null)
        if (onCameraToggle) onCameraToggle(false)
        setLoading(false)
    }

    useEffect(() => {
        return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
        }
        }
    }, [])

    // Lighting indicator color
    const lightColor =
        !lightingReport          ? '#E8D880' :
        lightingReport.status === 'good'    ? '#80E880' :
        lightingReport.status === 'warning' ? '#E8D880' : '#E88080'

    const lightLabel =
        !lightingReport          ? 'Checking lighting...' :
        lightingReport.status === 'good'    ? `Lighting good · ${lightingReport.score}/100` :
        lightingReport.issues[0]?.message  ?? 'Lighting issue detected'

    return (
        <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        backgroundColor: '#FFF5F8',
        borderRadius: '16px',
        overflow: 'hidden',
        }}>

        {/* Loading */}
        {loading && (
            <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
            <div style={{ fontSize: '28px' }}>📷</div>
            <p style={{ fontSize: '13px', color: '#C4A0B4' }}>Starting camera...</p>
            </div>
        )}

        {/* Error */}
        {error && (
            <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '20px', textAlign: 'center',
            }}>
            <div style={{ fontSize: '28px' }}>🚫</div>
            <p style={{ fontSize: '13px', color: '#C4A0B4' }}>{error}</p>
            <button onClick={startCamera} style={{
                fontSize: '13px', padding: '8px 20px', borderRadius: '20px',
                border: '1px solid #E8C0D4', backgroundColor: '#FBDCE8',
                color: '#8B3060', cursor: 'pointer',
            }}>
                Try again
            </button>
            </div>
        )}

        {/* Camera off */}
        {!isOn && !loading && !error && (
            <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '10px', backgroundColor: '#FFF5F8',
            }}>
            <div style={{ fontSize: '36px' }}>📷</div>
            <p style={{ fontSize: '13px', color: '#C4A0B4' }}>Camera is off</p>
            <button onClick={startCamera} style={{
                fontSize: '13px', padding: '8px 20px', borderRadius: '20px',
                border: 'none', backgroundColor: '#FBDCE8',
                color: '#8B3060', cursor: 'pointer',
            }}>
                Turn on camera
            </button>
            </div>
        )}

        {/* Video feed — mirrored */}
        <video
            ref={videoRef}
            style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            display: isOn && !loading && !error ? 'block' : 'none',
            }}
            playsInline muted
        />

        {/* Canvas — makeup overlays drawn here */}
        <canvas
            ref={canvasRef}
            style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            transform: 'scaleX(-1)',
            display: isOn && !loading && !error ? 'block' : 'none',
            pointerEvents: 'none',
            }}
        />

        {/* Face detected indicator */}
        {isOn && !loading && !error && (
            <div style={{
            position: 'absolute', top: '12px', left: '12px',
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(0,0,0,0.30)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px', borderRadius: '20px',
            }}>
            <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: faceDetected ? '#80E880' : '#E88080',
            }} />
            <span style={{ fontSize: '11px', color: 'white' }}>
                {faceDetected ? 'Face detected' : 'No face detected'}
            </span>
            </div>
        )}

        {/* Lighting indicator */}
        {isOn && !loading && !error && faceDetected && (
            <div style={{
            position: 'absolute', top: '44px', left: '12px',
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(0,0,0,0.30)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px', borderRadius: '20px',
            maxWidth: '260px',
            }}>
            <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: lightColor, flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: 'white', lineHeight: '1.4' }}>
                {lightLabel}
            </span>
            </div>
        )}

        {/* Stop camera button */}
        {isOn && !loading && !error && (
            <button
            onClick={stopCamera}
            style={{
                position: 'absolute', bottom: '14px', left: '14px',
                fontSize: '12px', padding: '6px 14px', borderRadius: '20px',
                border: 'none', backgroundColor: 'rgba(0,0,0,0.35)',
                color: 'white', cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', gap: '6px',
                zIndex: 50,
            }}
            >
            <span>⏹</span> Stop camera
            </button>
        )}

        </div>
    )
}

export default CameraWithOverlay


