import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";


function CameraFeed({onStreamReady, onCameraToggle}) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isOn, setIsOn] = useState(true)

    //Start the camera
    async function startCamera() {
        setLoading(true)
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: 'user'},
                audio: false,
            })
            streamRef.current = stream
            //Attach the stream to video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()

            if (onStreamReady) onStreamReady(videoRef.current)
            }
            setLoading(false)
            setIsOn(true)
            if (onCameraToggle) onCameraToggle(true)
        } catch (err) {
            setError('Could not access camera. Please allow camera permission.')
            setLoading(false)
        }
    }

    //Stop the camera
    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsOn(false)
        if (onCameraToggle) onCameraToggle(false)
        setLoading(false)
    }

    //Toggle between on and off
    function toggleCamera() {
        if (isOn) {
            stopCamera()
        } else {
            startCamera()
        }
    }

    useEffect(() => {
        startCamera()

        //Cleanup: stop the camera stream when component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    return (
        <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#fff5f8',
        }}>

            {/* Loading state */}
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap:'10px',
                }}>
                    <div style={{fontSize: '28px'}}>📷</div>
                    <p style={{ fontSize: '13px', color: '#c4a0b4'}}>Starting camera...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '10px', padding: '20px', textAlign:'center',
                }}>
                    <div style={{ fontSize: '28px'}}>🚫</div>
                    <p style={{fontSize: '13px', color: '#c4a0b4'}}>{error}</p>
                    <button
                    onClick={startCamera}
                    style={{
                        fontSize: '13px', padding: '8px 20px',
                        borderRadius: '20px', border: '1px solid #e8c0d4',
                        backgroundColor: '#fbdce8', color: '#8b3060', cursor: 'pointer',
                    }}>
                        Try again
                    </button>
                </div>
            )}

            {/* Camera off state */}
            {!isOn && !loading && !error && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '10px',
                    backgroundColor: '#fff5f8',
                }}>
                    <div style={{fontSize: '36px'}}>📷</div>
                    <p style={{fontSize: '13px', color: '#c4a0b4'}}>Camera is off</p>
                    <button
                    onClick={startCamera}
                    style={{
                        fontSize: '13px', padding: '8px 20px',
                        borderRadius: '20px', border: 'none',
                        backgroundColor: '#fbdce8', color: '#8b3060', cursor: 'pointer',
                    }}>
                        Turn on camera
                    </button>
                </div>
            )}

            {/* The actual camera feed (mirror horizontally) */}
            <video
            ref={videoRef}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: isOn && !loading && !error ? 'block' : 'none',
            }}
            playsInline
            muted
            />

            {/*Stop / Start button - only shows when camera is on */}
            {isOn && !loading && !error && (
                <button
                onClick={toggleCamera}
                style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '14px',
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 50,
                }}>
                    <span style={{fontSize: '10px'}}>▫️</span> Stop camera
                </button>
            )}

        </div>
    )
}

export default CameraFeed