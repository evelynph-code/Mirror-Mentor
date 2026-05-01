import { useEffect, useState } from "react"
import PhotoUpload from "../components/PhotoUpload"
import { useGemini } from "../hooks/useGemini"
import CameraWithOverlay from "../components/CameraWithOverlay"
import { useProfile } from "../hooks/useProfile"
import { useLooks } from "../hooks/useLooks"
import { useCart } from "../hooks/useCart"

const MAKEUP_STYLES = [
  { id: 'natural',   label: 'Natural',       color: '#F5E6D0' },
  { id: 'glam',      label: 'Glam',          color: '#E8A0B0' },
  { id: 'korean',    label: 'Korean / Soft', color: '#FFAAC0' },
  { id: 'douyin',    label: 'Douyin',        color: '#FF8FAF' },
  { id: 'cleangirl', label: 'Clean girl',    color: '#EDE0D4' },
  { id: 'baddie',    label: 'Baddie',        color: '#7A4060' },
]

function MakeupGuide({user, replayLook, onReplayConsumed}) {
  const [inputMode, setInputMode]         = useState('camera')
  const [selectedStyle, setSelectedStyle] = useState('korean')
  const [cameraOn, setCameraOn]           = useState(false)
  const [photoReady, setPhotoReady]       = useState(false)
  const [imageSource, setImageSource]     = useState(null)
  const [lightingReport, setLightingReport] = useState(null)
  const [guideStarted, setGuideStarted]   = useState(false)
  const [completed, setCompleted]         = useState(false)
  const [currentStep, setCurrentStep]     = useState(0)
  const [lookSaved, setLookSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [customStyle, setCustomStyle] = useState('')

  const { analyze, analyzing, faceData, steps, error, loadSavedLook } = useGemini()
  const {profile, loadingProfile, saveProfile} = useProfile(user)
  const {saveLook, loadLooks, isLookSaved} = useLooks(user)
  const {cart, addToCart, isInCart, loadCart} = useCart(user)

  const activeStep = steps?.[currentStep]

  useEffect(() => {
    if (profile && !faceData) {
      console.log('Profile loaded from database:', profile)
    }
  }, [profile])

  useEffect(() => {
    if (faceData && user) {
      saveProfile(faceData)
    }
  }, [faceData])

  useEffect(() => {
    if (user) {
      loadCart()
      loadLooks()
    }
  }, [user])

  useEffect(() => {
    if (!replayLook) return
    loadSavedLook(replayLook)

    setSelectedStyle(
      MAKEUP_STYLES.find(s => s.label === replayLook.style_name)?.id ?? 'korean')
      setCurrentStep(0)
      setCompleted(false)
      setGuideStarted(true)
      setLookSaved(true)

      if (onReplayConsumed) onReplayConsumed()
  }, [replayLook])

  async function handleStart() {
    if (!imageSource) return
    setCurrentStep(0)
    setCompleted(false)
    setGuideStarted(false)
    const styleToUse = customStyle.trim() || 
      MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label ||
      'natural'

    await analyze(imageSource, styleToUse, lightingReport?.confidence)
    setGuideStarted(true)
  }

  function handleNextStep() {
    if (!steps) return
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setCompleted(true)
    }
  }

  function handleRestart() {
    setCurrentStep(0)
    setGuideStarted(false)
    setCompleted(false)
  }

  async function handleSaveLook() {
    if (!steps || !faceData) return
    setSaveError(null)

    const styleName = customStyle.trim() ||
    MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label
      
    if (isLookSaved(styleName, steps)) {
      setSaveError('This look is already saved!')
      return
    }

    const result = await saveLook(
      MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label,
        faceData, 
        steps
      )

    if (result?.error === 'already_saved') {
      setSaveError('This look is already saved!')
      return
    }

    if (result?.error) {
      setSaveError('Failed to save - please try again.')
      return
    }

    setLookSaved(true)
    setTimeout(() => setLookSaved(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px', borderBottom: '1px solid #F0D9E6',
        backgroundColor: '#FFFAFC', flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#6B3050' }}>
            Makeup guide
          </h2>
          <p style={{ fontSize: '13px', color: '#C4A0B4', marginTop: '2px' }}>
            {guideStarted
              ? `Step ${currentStep + 1} of ${steps?.length ?? '...'} · ${MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label}`
              : 'Pick a style · Our AI will adapt it to your face'}
          </p>
        </div>

        {/* Toggle — only before guide starts */}
        {!guideStarted && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {['camera', 'upload'].map(mode => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                style={{
                  fontSize: '13px', padding: '7px 18px',
                  borderRadius: '20px', border: '1px solid #E8C0D4',
                  backgroundColor: inputMode === mode ? '#FBDCE8' : 'transparent',
                  color: inputMode === mode ? '#8B3060' : '#B07090',
                  cursor: 'pointer',
                  fontWeight: inputMode === mode ? '500' : '400',
                }}
              >
                {mode === 'camera' ? '📷 Live camera' : '🖼️ Upload photo'}
              </button>
            ))}
          </div>
        )}

        {/* Restart button — only during guide */}
        {guideStarted && (
          <button
            onClick={handleRestart}
            style={{
              fontSize: '13px', padding: '7px 18px',
              borderRadius: '20px', border: '1px solid #E8C0D4',
              backgroundColor: 'transparent', color: '#B07090', cursor: 'pointer',
            }}
          >
            ↩ Start over
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{
          flex: 1, padding: '24px 28px',
          display: 'flex', flexDirection: 'column',
          gap: '20px', overflowY: 'auto',
        }}>

          {/* Camera / Upload frame */}
          <div style={{
            backgroundColor: '#FFF5F8',
            border: '1px solid #F0D9E6',
            borderRadius: '16px',
            height: '560px',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {inputMode === 'camera' ? (
              <CameraWithOverlay
                activeStep={guideStarted && !completed ? activeStep : null}
                onVideoReady={(video) => setImageSource(video)}
                onCameraToggle={(status) => setCameraOn(status)}
                onLightingUpdate={(report) => setLightingReport(report)}
              />
            ) : (
              <PhotoUpload
                onPhotoReady={(url) => {
                  setPhotoReady(!!url)
                  setImageSource(url)
                }}
              />
            )}

            {/* Static dashed oval — only before guide starts */}
            {!guideStarted && (
              (inputMode === 'camera' && cameraOn) ||
              (inputMode === 'upload' && photoReady)
            ) && (
              <div style={{
                position: 'absolute', inset: 0,
                pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '250px', height: '300px',
                  border: '2px dashed rgba(232, 168, 196, 0.7)',
                  borderRadius: '50% 50% 45% 45%',
                }} />
              </div>
            )}

            {/* Completion overlay */}
            {completed && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255,240,248,0.85)', gap: '12px',
              }}>
                <div style={{ fontSize: '52px' }}>🎉</div>
                <p style={{ fontSize: '20px', fontWeight: '500', color: '#6B3050' }}>
                  Look complete!
                </p>
                <p style={{ fontSize: '14px', color: '#C4A0B4' }}>
                  You just did your {MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label} makeup ✨
                </p>
              </div>
            )}
          </div>

          {/* Face analysis chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {faceData ? (
              [
                { label: faceData.faceShape + ' face', color: '#A0C4B8' },
                { label: faceData.skinTone,            color: '#C4956A' },
                { label: faceData.eyeShape + ' eyes',  color: '#E8A0BC' },
                { label: faceData.lipFullness + ' lips', color: '#E8A0BC' },
              ].map(chip => (
                <div key={chip.label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', padding: '5px 13px',
                  borderRadius: '20px', border: '1px solid #E0C0D0',
                  color: '#9B6070', backgroundColor: '#FFF5F8',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: chip.color }} />
                  {chip.label}
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: '#C4A0B4' }}>
                ✨ Analyze your face to see results here
              </p>
            )}
          </div>

          {/* BEFORE GUIDE: style picker + start button */}
          {!guideStarted && (
            <>
              {/* Style picker */}
              <div>
                <p style={{ fontSize: '13px', color: '#C4A0B4', marginBottom: '10px' }}>
                  Choose your style
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {MAKEUP_STYLES.map(style => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      style={{
                        border: selectedStyle === style.id ? '2px solid #D4A0BC' : '1px solid #F0D9E6',
                        borderRadius: '12px', padding: '12px 8px',
                        textAlign: 'center', cursor: 'pointer',
                        backgroundColor: selectedStyle === style.id ? '#FFF0F6' : 'white',
                      }}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: style.color, margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '12px', color: '#9B6B80', lineHeight: '1.3' }}>
                        {style.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom style input */}
              <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  value={customStyle}
                  onChange={e => {
                    setCustomStyle(e.target.value)
                    if (e.target.value) setSelectedStyle(null)
                  }}
                placeholder="Or type your own e.g. Y2K, Euphoria, Old Money..."
                style={{
                  flex: 1, padding: '10px 14px',
                  borderRadius: '12px',
                  border: customStyle ? '1.5px solid #d4a0bc' : '1px solid #f0d9e6',
                  fontSize: '13px', color: '#6b3050',
                  outline: 'none', backgroundColor: '#fffafc',
                }} />

                {customStyle && (
                  <button
                  onClick={() => {setCustomStyle(''); setSelectedStyle('douyin')}}
                  style={{
                    padding: '10px 12px', borderRadius: '12px',
                    border: '1px solid #f0d9e6', backgroundColor: 'white',
                    color: '#c4a0b4', fontSize: '13px', cursor: 'pointer',
                  }}>
                    x
                  </button>
                )}
              </div>

              {/* Lighting warning */}
              {lightingReport && lightingReport.status !== 'good' && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: lightingReport.status === 'warning' ? '#FFF8E6' : '#FFF0F0',
                  border: `1px solid ${lightingReport.status === 'warning' ? '#E8D880' : '#F0C0C0'}`,
                  fontSize: '12px',
                  color: lightingReport.status === 'warning' ? '#8B7020' : '#8B2020',
                }}>
                  ⚠️ {lightingReport.issues[0]?.message}
                  {lightingReport.status === 'poor' && ' — skin tone accuracy may be affected.'}
                </div>
              )}

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={analyzing || !imageSource}
                style={{
                  width: '100%', padding: '16px',
                  borderRadius: '20px', border: 'none',
                  backgroundColor: analyzing || !imageSource ? '#F0D9E6' : '#8B3060',
                  color: analyzing || !imageSource ? '#C4A0B4' : 'white',
                  fontSize: '16px', fontWeight: '500',
                  cursor: analyzing || !imageSource ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {analyzing ? '✨ Preparing your guide...' : '✨ Start makeup guide'}
              </button>

              {error && (
                <p style={{ fontSize: '13px', color: '#C47090', textAlign: 'center' }}>
                  ⚠️ {error}
                </p>
              )}
            </>
          )}

          {/* DURING GUIDE: next step button */}
          {guideStarted && !completed && (
            <button
              onClick={handleNextStep}
              style={{
                width: '100%', padding: '16px',
                borderRadius: '20px', border: 'none',
                backgroundColor: '#8B3060', color: 'white',
                fontSize: '16px', fontWeight: '500', cursor: 'pointer',
              }}
            >
              {currentStep < (steps?.length ?? 1) - 1
                ? 'Done · Next step →'
                : 'Done · Finish look 🎉'}
            </button>
          )}

          {/* COMPLETED: restart */}
          {completed && (
            <button
              onClick={handleRestart}
              style={{
                width: '100%', padding: '16px',
                borderRadius: '20px', border: 'none',
                backgroundColor: '#FBDCE8', color: '#8B3060',
                fontSize: '16px', fontWeight: '500', cursor: 'pointer',
              }}
            >
              Try another style ↩
            </button>
          )}

        </div>

        {/* Right panel */}
        <div style={{
          width: '300px', borderLeft: '1px solid #F0D9E6',
          backgroundColor: '#FFFAFC', padding: '24px 18px',
          display: 'flex', flexDirection: 'column',
          gap: '14px', overflowY: 'auto', flexShrink: 0,
        }}>

          {/* Before guide */}
          {!guideStarted && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#C4A0B4' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>👀</div>
              <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
                Pick a style and click<br />
                <strong style={{ color: '#8B3060' }}>Start makeup guide</strong><br />
                to begin your personalized tutorial
              </p>
            </div>
          )}

          {/* During guide */}
          {guideStarted && !completed && steps && (
            <>
              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#C4A0B4' }}>Progress</span>
                  <span style={{ fontSize: '12px', color: '#8B3060', fontWeight: '500' }}>
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F0D9E6', borderRadius: '10px' }}>
                  <div style={{
                    height: '100%', borderRadius: '10px',
                    backgroundColor: '#8B3060',
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#F0D9E6' }} />

              {/* Current step — highlighted card */}
              {activeStep && (
                <div style={{
                  backgroundColor: '#FFF0F6',
                  border: '1.5px solid #D4A0BC',
                  borderRadius: '14px', padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: '#8B3060', color: 'white',
                      fontSize: '13px', fontWeight: '500',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activeStep.step}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#6B3050' }}>
                      {activeStep.title}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#7A5060', lineHeight: '1.7' }}>
                    {activeStep.description}
                  </p>

                  {activeStep.tip && (
                    <div style={{
                      marginTop: '10px', padding: '8px 12px',
                      backgroundColor: '#FBDCE8', borderRadius: '8px',
                      fontSize: '12px', color: '#8B3060',
                    }}>
                      💡 {activeStep.tip}
                    </div>
                  )}

                  <div style={{
                    display: 'inline-block', marginTop: '10px',
                    fontSize: '11px', padding: '3px 10px', borderRadius: '10px',
                    backgroundColor: '#8B3060', color: 'white',
                  }}>
                    📍 {activeStep.zone}
                  </div>
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: '#F0D9E6' }} />

              {/* Save look button - available during guide */}
              <button
              onClick={handleSaveLook}
              disabled={!steps || lookSaved}
              style={{
                width: '100%', padding: '10px',
                borderRadius: '20px', border: 'none',
                backgroundColor: lookSaved ? '#d4ead0' : '#fbdce8',
                color: lookSaved ? '#3a7850' : '#8b3060',
                fontSize: '13px', cursor: !steps || lookSaved ? 'default' : 'pointer',
              }}>
                {lookSaved ? '✅ Look saved!' : '🌸 Save this look'}
              </button>

              {saveError && (
                <p style={{fontSize: '11px', color: '#c47090', textAlign: 'center', marginTop: '4px'}}>
                  ⚠️ {saveError}
                </p>
              )}

              {/* Upcoming steps */}
              <p style={{ fontSize: '11px', color: '#C4A0B4', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Coming up
              </p>
              {steps.slice(currentStep + 1).map(step => (
                <div key={step.step} style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.5 }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#F0D9E6', color: '#C4A0B4',
                    fontSize: '10px', fontWeight: '500',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.step}
                  </div>
                  <span style={{ fontSize: '13px', color: '#9B6B80' }}>{step.title}</span>
                </div>
              ))}
            </>
          )}

          {/* Completion panel */}
          {completed && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>✨</div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#6B3050', marginBottom: '8px' }}>
                You nailed it!
              </h3>
              <p style={{ fontSize: '13px', color: '#C4A0B4', lineHeight: '1.7' }}>
                You completed your {MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label} look. You're glowing! 🌸
              </p>

              {/* Save button again */}
              <button
              onClick={handleSaveLook}
              disabled={!steps || lookSaved}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '20px', border: 'none',
                marginTop: '16px',
                backgroundColor: lookSaved ? '#d4ead0' : '#8b3060',
                color: lookSaved ? '#3a7850' : 'white',
                fontSize: '14px', fontWeight: '500',
                cursor: !steps || lookSaved ? 'default' : 'pointer',
              }}>
                {lookSaved ? '✅ Look saved!' : '🌸 Save this look'}
              </button>

              {saveError && (
                <p style={{fontSize: '11px', color: '#c47090', textAlign: 'center', marginTop: '4px'}}>
                  ⚠️ {saveError}
                </p>
              )}

              {/* Face profile chips */}
              {faceData && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', color: '#C4A0B4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                    Your face profile
                  </p>
                  {[
                    { label: faceData.faceShape + ' face', color: '#A0C4B8' },
                    { label: faceData.skinTone,            color: '#C4956A' },
                    { label: faceData.eyeShape + ' eyes',  color: '#E8A0BC' },
                    { label: faceData.lipFullness + ' lips', color: '#E8A0BC' },
                  ].map(chip => (
                    <div key={chip.label} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', padding: '5px 13px', marginBottom: '6px',
                      borderRadius: '20px', border: '1px solid #E0C0D0',
                      color: '#9B6070', backgroundColor: '#FFF5F8',
                    }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: chip.color }} />
                      {chip.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default MakeupGuide