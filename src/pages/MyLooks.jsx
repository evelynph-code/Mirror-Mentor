import { useEffect } from "react";
import { useLooks } from "../hooks/useLooks";


function MyLooks({user, onReplayLook}) {
    const {looks, loadingLooks, loadLooks, deleteLook} = useLooks(user)

    useEffect(() => {
        loadLooks()
    }, [user])

    if (loadingLooks) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                height: '100%', color: '#c4a9b4', fontSize: '14px',
            }}>
                Loading your looks...
            </div>
        )
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>

            {/* Topbar */}
            <div style={{
                padding: '18px 28px', borderBottom: '1px solid #f0d9e6',
                backgroundColor: '#fffafc', flexShrink: 0,
            }}>
                <h2 style={{fontSize:'20px', fontWeight: '500', color: '#6b3050'}}>
                    My looks
                </h2>
                <p style={{fontSize: '13px', color: '#c4a0b4', marginTop: '2px'}}>
                    {looks.length > 0
                    ? `${looks.length} saved look${looks.length > 1 ? 's' : ''}`
                    : 'No saved looks yet'}
                </p>
            </div>

            {/* Content */}
            <div style={{flex: 1, padding: '24px 28px', overflowY: 'auto'}}>

                {/* Empty state */}
                {looks.length === 0 && (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        height: '60%', gap: '12px', color: '#c4a0b4',
                    }}>
                        <div style={{fontSize: '48px'}}>👀</div>
                        <p style={{fontSize: '15px', fontWeight: '500', color: '#9b6b80'}}>
                            No saved looks yet
                        </p>
                        <p style={{fontSize: '13px', textAlign: 'center', lineHeight: '1.7'}}>
                            Complete a makeup guide and click <br />
                            "Save this look" to see it here
                        </p>
                    </div>
                )}

                {/* Looks grid */}
                {looks.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px',
                    }}>
                        {looks.map(look => (
                            <LookCard
                            key={look.id}
                            look={look}
                            onReplay={() => onReplayLook?.(look)}
                            onDelete={() => deleteLook(look.id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function LookCard({look, onReplay, onDelete}) {
    const steps = look.steps ?? []
    const faceData = look.face_data ?? {}
    const date = new Date(look.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })

    //Style color map
    const styleColors = {
        'Natural':       '#F5E6D0',
        'Glam':          '#E8A0B0',
        'Korean / Soft': '#FFAAC0',
        'Douyin':        '#FF8FAF',
        'Clean girl':    '#EDE0D4',
        'Baddie':        '#7A4060',
    }

    const styleColor = styleColors[look.style_name] ?? '#fbdce8'

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #f0d9e6',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>

            {/* Card header */}
            <div style={{
                backgroundColor: styleColor,
                padding: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                }}>
                    🌸
                </div>
                <div>
                    <div style={{fontSize: '16px', fontWeight: '500', color: '#6b3050'}}>
                        {look.style_name}
                    </div>
                    <div style={{fontSize: '11px', color: '#9b6070', marginTop: '2px'}}>
                        Saved {date}
                    </div>
                </div>
            </div>

            {/* Face profile */}
            <div style={{padding: '14px 16px', borderBottom: '1px solid #f0d9e6'}}>
                <p style={{fontSize: '10px', color: '#c4a0b4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'}}>
                    Face profile
                </p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {[
                        { label: faceData.faceShape + ' face', color: '#A0C4B8' },
                        { label: faceData.skinTone,            color: '#C4956A' },
                        { label: faceData.eyeShape + ' eyes',  color: '#E8A0BC' },
                    ].filter(c => c.label && c.label.startsWith('undefined')).map(chip => (
                        <div key={chip.label} style={{
                            display:'flex', alignItems: 'center', gap: '4px',
                            fontSize: '10px', padding: '3px 8px',
                            borderRadius: '20px', border: '1px solid #e0c0d0',
                            color: '#9b6070', backgroundColor: '#fff5f8',
                        }}>
                            <div style={{width: '5px', height: '5px', borderRadius: '50%', backgroundColor: chip.color}} />
                            {chip.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Steps preview */}
            <div style={{padding: '14px 16px', borderBottom: '1px solid #f0d9e6'}}>
                <p style={{fontSize: '10px', color: '#c4a0b4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px'}}>
                    {steps.length} steps
                </p>
                {steps.slice(0,4).map(step => (
                    <div key={step.step} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '5px',
                    }}>
                        {/* Shade color dot */}
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: step.shadeHex ?? '#fbdce8',
                            border: '1px solid #e0c0d0',
                        }} />
                        <span style={{fontSize: '11px', color: '#9b6070'}}>
                            {step.title}
                        </span>
                    </div>
                ))}
                {steps.length > 4 && (
                    <p style={{fontSize: '10px', color: '#c4a0b4', marginTop: '4px'}}>
                        +{steps.length - 4} more steps
                    </p>
                )}
            </div>

            {/* Action buttons */}
            <div style={{padding: '12px 16px', display: 'flex', gap: '8px'}}>
                <button 
                onClick={onReplay}
                style={{
                    flex: 1, padding: '9px',
                    borderRadius: '12px', border: 'none',
                    backgroundColor: '#8b3060', color: 'white',
                    fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                }}>
                    ▸ Replay look
                </button>
                <button
                onClick={onDelete}
                style={{
                    padding: '9px 12px',
                    borderRadius: '12px',
                    border: '1px solid #f0d9e6',
                    backgroundColor: 'transparent',
                    color: '#c4a0b4', fontSize: '12px', cursor: 'pointer',
                }}>
                    🗑️
                </button>
            </div>
        </div>
    )
}

export default MyLooks