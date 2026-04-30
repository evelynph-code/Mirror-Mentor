import { useEffect, useState } from "react"
import { useProfile } from "../hooks/useProfile"


const SKIN_TYPES = [
    { id: 'oily',        label: 'Oily',        emoji: '💧', desc: 'Shiny, enlarged pores' },
    { id: 'dry',         label: 'Dry',         emoji: '🏜️', desc: 'Tight, flaky, dull' },
    { id: 'combination', label: 'Combination', emoji: '☯️', desc: 'Oily T-zone, dry cheeks' },
    { id: 'sensitive',   label: 'Sensitive',   emoji: '🌸', desc: 'Easily irritated, reactive' },
    { id: 'normal',      label: 'Normal',      emoji: '✨', desc: 'Balanced, few issues' },
]

const SKIN_CONCERNS = [
    'Acne', 'Dark spots', 'Redness', 'Dryness',
    'Oiliness', 'Large pores', 'Fine lines', 'Uneven skin tone',
    'Dark circles', 'Sensitivity', 'Dullness', 'Hyperpigmentation',
]

const BUDGET_TIERS = [
    { id: 'budget',    label: 'Budget friendly', desc: 'Under $20 per product', emoji: '💰' },
    { id: 'midrange',  label: 'Mid range',       desc: '$20 – $60 per product', emoji: '💰💰' },
    { id: 'luxury',    label: 'Luxury',          desc: '$60+ per product',      emoji: '💰💰💰' },
]

function SkinProfile({user}) {
    const {profile, loadingProfile, saveProfile} = useProfile(user)

    //Local state for the form
    const [skinType, setSkinType] = useState('')
    const [concerns, setConcerns] = useState([])
    const [customConcern, setCustomConcern] = useState('')
    const [budget, setBudget] = useState('budget')
    const [totalBudget, setTotalBudget] = useState('100')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!profile) return
        if (profile.skin_type) setSkinType(profile.skin_type)
        if (profile.skin_concerns) setConcerns(profile.skin_concerns)
        if (profile.budget) setBudget(profile.budget)
        if (profile.total_budget) setTotalBudget(profile.total_budget)
    }, [profile])

    //Toggle a concern on/off
    function toggleConcern(concern) {
        setConcerns(prev => 
            prev.includes(concern)
            ? prev.filter(c => c !== concern)
            : [...prev, concern]
        )
    }

    //Add custom concern
    function addCustomConcern() {
        const trimmed = customConcern.trim()
        if (!trimmed || concerns.includes(trimmed)) return
        setConcerns(prev => [...prev, trimmed])
        setCustomConcern('')
    }

    //Remove any concern (including custom)
    function removeConcern(concern) {
        setConcerns(prev => prev.filter(c => c !== concern))
    }

    async function handleSave() {
        setSaving(true)
        setSaved(false)
        try {
            await saveProfile(
                {
                    skinTone: profile?.skin_tone ?? '',
                    skinToneHex: profile?.skin_tone_hex ?? '',
                    faceShape: profile?.face_shape ?? '',
                    eyeShape: profile?.eye_shape ?? '',
                    lipFullness: profile?.lip_fullness ?? '',
                },
                skinType,
                concerns, 
                budget, 
                totalBudget,
            )
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } finally {
            setSaving(false)
        }
    }

    if (loadingProfile) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <p style={{fontSize:'14px', color: '#c4a0b4'}}>Loading your profile...</p>
            </div>
        )
    }

    return(
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>

            {/*Topbar */}
            <div style={{
                padding: '18px 28px', borderBottom: '1px solid #f0d9e6',
                backgroundColor: '#fffafc', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <h2 style={{fontSize: '20px', fontWeight: '500', color: '#6b3050'}}>
                        Skin profile
                    </h2>
                    <p style={{fontSize: '13px', color: '#c4a0b4', marginTop: '2px'}}>
                        Tell us about your skin so we can personalize your recommendations
                    </p>
                </div>

                <button
                onClick={handleSave}
                disabled={saving || !skinType}
                style={{
                    padding: '10px 24px', borderRadius: '20px', border: 'none',
                    backgroundColor: saved ? '#d4e3d0' : saving || !skinType ? '#f0d9e6' : '#8b3060',
                    color: saved ? '#3a7850' : saving || !skinType ? '#c4a0b4' : 'white',
                    fontSize: '14px', fontWeight: '500',
                    cursor: saving || !skinType ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                }}>
                    {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save profile'}
                </button>
            </div>

            {/* Content */}
            <div style={{flex: 1, overflowY: 'auto', padding: '28px'}}>
                <div style={{maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '32px'}}>

                    {/* Face data - auto filled from analysis */}
                    {profile?.face_shape && (
                        <section>
                            <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '12px'}}>
                                Face analysis
                                <span style={{fontSize: '11px', color: '#c4a0b4', fontWeight: '400', marginLeft: '8px'}}>
                                    auto-filled from your last analysis
                                </span>
                            </h3>
                            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                {[
                                    { label: profile.face_shape + ' face', color: '#A0C4B8' },
                                    { label: profile.skin_tone,            color: '#C4956A' },
                                    { label: profile.eye_shape + ' eyes',  color: '#E8A0BC' },
                                    { label: profile.lip_fullness + ' lips', color: '#E8A0BC' },
                                ].filter(c => c.label && !c.label.startsWith('undefined')).map(chip => (
                                    <div key={chip.label} style={{
                                        display: 'flex', alignItems:'center', gap: '6px',
                                        fontSize: '12px', padding: '5px 13px',
                                        borderRadius: '20px', border: '1px solid #40c0d0',
                                        color: '#9b6070', backgroundColor: '#fff5f8',
                                    }}>
                                        <div style={{width: '7px', height: '7px', borderRadius: '50%', backgroundColor: chip.color}} />
                                        {chip.label}
                                    </div>
                                ))}

                                {/* Skin tone hex swatch */}
                                {profile.skin_tone_hex && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '12px', padding: '5px 13px',
                                        borderRadius: '20px', border: '1px solid #e0c0d0',
                                        color: '#9b6070', backgroundColor: '#fff5f8',
                                    }}>
                                        <div style={{
                                            width: '14px', height: '14px', borderRadius: '50%',
                                            backgroundColor: profile.skin_tone_hex,
                                            border: '1px solid #e0c0d0',
                                        }} />
                                        {profile.skin_tone_hex}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* No analysis yet */}
                    {!profile?.face_shape && (
                        <div style={{
                            padding: '16px', borderRadius: '12px',
                            backgroundColor: '#fff8e6', border: '1px solid #e8d880',
                            fontSize: '13px', color: '#8b7020',
                        }}>
                            ℹ️ Run the makeup guide first to auto-fill your face analysis data.
                        </div>
                    )}

                    <div style={{height: '1px', backgroundColor: '#f0d9e6'}} />

                    {/* Skin type */}
                    <section>
                        <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '12px'}}>
                            Skin type <span style={{color: '#e88080'}}>*</span>
                        </h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px'}}>
                            {SKIN_TYPES.map(type => (
                                <div
                                key={type.id}
                                onClick={() => setSkinType(type.id)}
                                style={{
                                    padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                                    textAlign: 'center',
                                    border: skinType === type.id ? '2px solid #d4a0bc' : '1px solid #f0d9e6',
                                    backgroundColor: skinType === type.id ? '#fff0f6' : 'white',
                                    transition: 'all 0.15s ease',
                                }}>
                                    <div style={{fontSize: '24px', marginBottom: '6px'}}>{type.emoji}</div>
                                    <div style={{fontSize: '13px', fontWeight: '500', color: '#6b3050', marginBottom: '3px'}}>
                                        {type.label}
                                    </div>
                                    <div style={{fontSize: '10px', color: '#c4a0b4', lineHeight: '1.4'}}>
                                        {type.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skin concerns */}
                    <section>
                        <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '4px'}}>
                            Skin concerns
                        </h3>
                        <p style={{fontSize: '12px', color: '#c4a0b4', marginBottom: '12px'}}>
                            Select all that apply
                        </p>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px'}}>
                            {SKIN_CONCERNS.map(concern => (
                                <div
                                key={concern}
                                onClick={() => toggleConcern(concern)}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', 
                                    fontSize: '12px',
                                    border: concerns.includes(concern) ? '1.5px solid #d4a0bc' : '1px solid #f0d9e6',
                                    backgroundColor: concerns.includes(concern) ? '#fff0f6' : 'white',
                                    color: concerns.includes(concern) ? '#8b3060' : '#9b6b80',
                                    transition: 'all 0.15s ease',
                                }}>
                                    {concerns.includes(concern) ? '✓' : ''}{concern}
                                </div>
                            ))}
                        </div>

                        {/* Custom concern input */}
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input 
                            type="text"
                            value={customConcern}
                            onChange={e => setCustomConcern(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCustomConcern()}
                            placeholder="Add custom concern..."
                            style={{
                                flex: 1, padding: '10px 14px',
                                borderRadius: '12px', border: '1px solid #f0d9e6',
                                fontSize: '13px', color: '#6b3050',
                                outline: 'none', backgroundColor: '#fffafc',
                            }} />
                            <button
                            onClick={addCustomConcern}
                            style={{
                                padding: '10px 16px', borderRadius: '12px', border: 'none',
                                backgroundColor: '#fbdce8', color: '#8b3060',
                                fontSize: '13px', cursor: 'pointer',
                            }}>
                                Add
                            </button>
                        </div>

                        {/* Show custom concerns that aren't in the preset list */}
                        {concerns.filter(c => !SKIN_CONCERNS.includes(c)).length > 0 && (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px'}}>
                                {concerns.filter(c => !SKIN_CONCERNS.includes(c)).map(c => (
                                    <div key={c} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '5px 10px', borderRadius: '20px',
                                        backgroundColor: '#fff0f6', border: '1.5px solid #d4a0bc',
                                        fontSize: '12px', color: '#8b3060',
                                    }}>
                                        {c}
                                        <span
                                        onClick={() => removeConcern(c)}
                                        style={{cursor: 'pointer', opacity: 0.6, fontSize: '14px', lineHeight: 1}}>
                                            ˟
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div style={{height: '1px', backgroundColor: '#f0d9e6'}} />

                    {/* Budget */}
                    <section>
                        <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '12px'}}>
                            Budget preference
                        </h3>

                        {/* Budget tier */}
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px'}}>
                            {BUDGET_TIERS.map(tier => (
                                <div
                                key={tier.id}
                                onClick={() => setBudget(tier.id)}
                                style={{
                                    padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                                    textAlign: 'center',
                                    border: budget === tier.id ? '2px solid #d4a0bc' : '1px solid #f0d9e6',
                                    backgroundColor: budget === tier.id ? '#fff0f6' : 'white',
                                    transition: 'all 0.15s ease',
                                }}>
                                    <div style={{fontSize: '18px', marginBottom: '6px'}}>{tier.emoji}</div>
                                    <div style={{fontSize: '13px', fontWeight: '500', color: '#6b3050', marginBottom: '3px'}}>
                                        {tier.label}
                                    </div>
                                    <div style={{fontSize:'10px', color: '#c4a0b4'}}>
                                        {tier.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total budget slider */}
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                <label style={{fontSize: '12px', color: '#c4a0b4'}}>
                                    Total makeup budget
                                </label>
                                <span style={{fontSize: '14px', fontWeight: '500', color: '#8b3060'}}>
                                    ${totalBudget}
                                </span>
                            </div>
                            <input 
                            type="range"
                            min="20" max="500" step="10"
                            value={totalBudget}
                            onChange={e => setTotalBudget(e.target.value)}
                            style={{width: '100%', accentColor: '#8b3060'}} />

                            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px'}}>
                                <span style={{fontSize: '10px', color: '#c4a0b4'}}>$20</span>
                                <span style={{fontSize: '10px', color: '#c4a0b4'}}>$500</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default SkinProfile