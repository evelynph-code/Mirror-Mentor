import { useState } from "react"
import CameraFeed from "../components/CameraFeed"
import PhotoUpload from "../components/PhotoUpload"

const MAKEUP_STYLES = [
    {id: 'natural', label: 'Natural', color: '#F5E6D0'},
    {id: 'glam', label: 'Glam', color: '#e8a0b0'},
    {id: 'korean', label: 'Korean / Soft', color: '#FF8FAF'},
    {id: 'douyin', label: 'Douyin', color: '#ff8faf'},
    {id: 'cleangirl', label: 'Clean girl', color:'#ede0d4'},
    {id: 'baddie', label: 'Baddie', color: '#7a4060'},
]

function MakeupGuide() {
    const [inputMode, setInputMode] = useState('camera')
    const [selectedStyle, setSelectedStyle] = useState('douyin')
    const [cameraOn, setCameraOn] = useState(true)
    const [photoReady, setPhotoReady] = useState(false)

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>

            {/* Topbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 28px',
                borderBottom: '1px solid #f0d9e6',
                backgroundColor: '#fffafc',
                flexShrink: 0,
            }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#6b3050'}}>
                        Makeup guide
                    </h2>
                    <p style={{ fontSize:'13px', color:'#c4a0b4', marginTop: '2px'}}>
                        Pick a style · Our virtual assistant will adapt it to your face
                    </p>
                </div>

                {/* Camera / Upload toggle */}
                <div style={{display: 'flex', gap: '8px'}}>
                    {['camera', 'upload'].map(mode => (
                        <button
                        key={mode}
                        onClick={() => setInputMode(mode)}
                        style={{
                            fontSize:'13px',
                            padding:'7px 18px',
                            borderRadius: '20px',
                            border: '1px solid #e8c0d4',
                            backgroundColor: inputMode === mode ? "#fbdce8" : 'transparent',
                            color: inputMode === mode ? '#8b3060' : '#b07090',
                            cursor: 'pointer',
                            fontWeight: inputMode === mode ? '500' : '400',
                        }}>
                            {mode === 'camera' ? '📷 Live camera' : '🖼️ Upload photo'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body - 2 column layout */}
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>

                {/* Left panel */}
                <div style={{
                    flex: 1,
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    overflowY: 'auto',
                }}>

                    {/* Camera / Upload frame */}
                    <div style={{
                        backgroundColor:' #fff5f8',
                        border: '1px solid #f0d9e6',
                        borderRadius: '16px',
                        height: '480px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>

                        {/* Show live camera or upload prompt based on mode */}
                        {inputMode === 'camera' ? (
                            <CameraFeed onStreamReady={(video) => console.log('Camera ready!', video)}
                            onCameraToggle={(status) => setCameraOn(status)} />
                        ) : (
                            <PhotoUpload
                            onPhotoReady={(url) => {
                                setPhotoReady(!!url)
                                console.log('Photo ready:', url)
                            }} />
                        )}

                        {/* Face oval outline - placeholder for real camera late */}
                        {(inputMode === 'camera' && cameraOn) || (inputMode === 'upload' && photoReady) ? (
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: '140px', height:'185px',
                                    border: '2px dashed rgba(242, 169, 196, 0.8)',
                                    borderRadius: '50% 50% 45% 45%',
                                    position: 'relative',
                                }}>
                                    {/* Blush overlay */}
                                    <div style={{position: 'absolute', width: '40px', height: '18px', backgroundColor: 'rgba(240, 140, 170, 0.30)', borderRadius: '50%', left: '-20px', top:'75px'}} />
                                    <div style={{position: 'absolute', width: '40px', height: '18px', backgroundColor: 'rgba(240, 140, 170, 0.30)', borderRadius: '50%', right: '-20px', top:'75px'}} />

                                    {/* Contour overlay */}
                                    <div style={{position: 'absolute', width: '13px', height: '60px', backgroundColor: 'rgba(160, 100, 120, 0.16)', borderRadius: '8px', left: '8px', top:'55px'}} />
                                    <div style={{position: 'absolute', width: '13px', height: '60px', backgroundColor: 'rgba(160, 100, 120, 0.16)', borderRadius: '8px', right: '8px', top:'55px'}} />

                                    {/* Highlight overlay */}
                                    <div style={{position: 'absolute', width: '13px', height: '32px', backgroundColor: 'rgba(255, 235, 210, 0.75)', borderRadius: '8px',top:'20px'}} />
                                </div>
                            </div>
                        ) : null}

                        {/* Overlay legend */}
                        {(inputMode === 'camera' && cameraOn) || (inputMode === 'upload' && photoReady) ? (
                            <div style={{position: 'absolute', bottom: '14px', right: '16px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                {[
                                    {color: 'rgba(240,140,170,0.45)', label: 'Blush'},
                                    {color: 'rgba(160, 100, 120, 0.30)', label: 'Contour'},
                                    {color: 'rgba(255,230, 200,0.80)', label: 'Highlight'},
                                ].map(item => (
                                    <div key={item.label} style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#9b6070'}}>
                                        <div style={{width: '10px', height: '10px', borderRadius: '3px', backgroundColor: item.color}} />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {/* Face analysis chips - will be populated by gemini */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap:'wrap'}}>
                        {[
                            {label: 'Oval face', color: '#a0c4b8'},
                            {label: 'Medium warm', color:'#c4956a'},
                            {label: 'Almond eyes', color: '#e8a0bc'},
                            {label: 'Full lips', color: '#e8a0bc'},
                        ].map(chip => (
                            <div key={chip.label} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '12px', padding: '5px 13px',
                                borderRadius: '20px', border: '1px solid #e0c0d0',
                                color: '#9b6070', backgroundColor: '#fff5f8',
                            }}>
                                <div style={{width: '7px', height: '7px', borderRadius: '50%', backgroundColor: chip.color}} />
                                {chip.label}
                                </div>
                        ))}
                    </div>

                    {/* Style picker */}
                    <div>
                        <p style={{ fontSize: '13px', color: '#c4a0b4', marginBottom: '10px'}}>
                            Choose your style
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px'}}>
                            {MAKEUP_STYLES.map(style => (
                                <div
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                style={{border:selectedStyle === style.id ? '2px solid #d4a0bc' : '1px solid #f0d9e6',
                                    borderRadius: '12px',
                                    padding: '12px 8px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: selectedStyle === style.id ? '#fff0f6' : 'white',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: style.color,
                                        margin: '0 auto 8px',
                                    }} />

                                    <div style={{fontSize: '12px', color: '#9b5b80', lineHeight:'1.3'}}>
                                    {style.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right panel - guide */}
                <div style={{
                    width: '300px',
                    borderLeft: '1px solid #f0d9e6',
                    backgroundColor: '#fffafc',
                    padding: '24px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    overflowY: 'auto',
                    flexShrink: 0,
                }}>
                    <div>
                        <h3 style={{fontSize: '16px', fontWeight: '500', color: '#6b3050'}}>
                            {MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label}
                        </h3>
                        <p style={{fontSize: '12px', color: '#c4a0b4', marginTop: '3px'}}>
                            Adapted for oval face · medium warm tone
                        </p>
                    </div>

                    <div style={{height: '1px', backgroundColor: '#f0d9e6'}} />

                    {/* Steps - will be generated by Gemini */}
                    {[
                        { num: 1, done: true,  title: 'Moisturizer + SPF',   desc: 'Apply lightweight moisturizer all over. Wait 1 min before next step.', zone: 'Full face' },
                        { num: 2, done: true,  title: 'Dewy foundation',      desc: 'Use damp beauty sponge for a skin-like finish. Build lightly.', zone: 'Full face · blend into neck' },
                        { num: 3, done: false, title: 'Gradient blush',       desc: 'Tap rosy pink on nose bridge, sweep lightly across cheeks.', zone: 'Nose bridge + cheeks' },
                        { num: 4, done: false, title: 'Puppy eye liner',      desc: 'Thin line along lower lash, extend slightly down at outer corner.', zone: 'Lower lash line' },
                        { num: 5, done: false, title: 'Glossy tint lip',      desc: 'Dab tint on center of lips, blend out. Top with clear gloss.', zone: 'Center of lips outward' },
                    ].map(step => (
                        <div key={step.num} style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                            {/* Step number circle */}
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, 
                                backgroundColor: step.done ? '#d4ead0' : '#fbdce8',
                                color: step.done ? '#3a7850' : '#8b3060',
                                fontSize: '11px', fontWeight: '500',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {step.done ? '✓' : step.num}
                            </div>
                            <div>
                                <div style={{fontSize: '14px', fontWeight: '500', color: '#6b3050'}}>{step.title}</div>
                                <div style={{fontSize: '12px', color: '#b09090', marginTop: '3px', lineHeight: '1.6'}}>{step.desc}</div>
                                <div style={{
                                    display: 'inline-block', fontSize: '11px',
                                    padding: '3px 10px', borderRadius: '10px',
                                    backgroundColor: '#fbdce8', color: '#8b3060', marginTop: '5px', 
                                }}>
                                    {step.zone}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div style={{ height: '1px', backgroundColor: '#f0d9e6'}} />

                    {/* Action buttons */}
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button style={{
                            flex: 1, fontSize: '13px', padding: '10px',
                            borderRadius: '20px', border: 'none',
                            backgroundColor: '#fbdce8', color: '#8b3060', cursor: 'pointer',
                        }}>
                            Save look
                        </button>
                        <button style={{
                            flex: 1, fontSize: '13px', padding: '10px',
                            borderRadius: '20px', border: '1px solid #e0c0d0',
                            backgroundColor: 'transparent', color: '#b07090', cursor: 'pointer',
                        }}>
                            Find products
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MakeupGuide