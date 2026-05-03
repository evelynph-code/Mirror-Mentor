import { useEffect, useState } from "react"
import { useProfile } from "../hooks/useProfile"
import {supabase} from '../services/supabase'
import LoadingSkeleton from "../components/LoadingSkeleton"

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
  { id: 'budget',   label: 'Budget friendly', desc: 'Under $20 per product', emoji: '💰' },
  { id: 'midrange', label: 'Mid range',       desc: '$20 – $60 per product', emoji: '💰💰' },
  { id: 'luxury',   label: 'Luxury',          desc: '$60+ per product',      emoji: '💰💰💰' },
]

const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond']
const EYE_SHAPES  = ['almond', 'round', 'monolid', 'hooded', 'upturned', 'downturned']
const LIP_TYPES   = ['thin', 'medium', 'full']
const SKIN_TONES  = [
  { label: 'Fair cool',    hex: '#F5E6E0' },
  { label: 'Fair neutral', hex: '#F5E3D6' },
  { label: 'Fair warm',    hex: '#F5E0D0' },

  { label: 'Light cool',   hex: '#EDD5C0' },
  { label: 'Light neutral',hex: '#EBCFB4' },
  { label: 'Light warm',   hex: '#E8C9A8' },

  { label: 'Medium cool',  hex: '#D4A882' },
  { label: 'Medium neutral',hex:'#CD9A6B' },
  { label: 'Medium warm',  hex: '#C68642' },

  { label: 'Tan cool',     hex: '#B5783A' },
  { label: 'Tan neutral',  hex: '#AA6C32' },
  { label: 'Tan warm',     hex: '#A0622A' },

  { label: 'Deep cool',    hex: '#7A4520' },
  { label: 'Deep neutral', hex: '#6B3B18' },
  { label: 'Deep warm',    hex: '#5C3010' },
]

function SkinProfile({ user, isMobile }) {
  const { profile, loadingProfile, saveProfile } = useProfile(user)

  const [skinType, setSkinType]           = useState('')
  const [concerns, setConcerns]           = useState([])
  const [customConcern, setCustomConcern] = useState('')
  const [budget, setBudget]               = useState('budget')
  const [totalBudget, setTotalBudget]     = useState('100')
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [faceShape, setFaceShape]         = useState('')
  const [eyeShape, setEyeShape]           = useState('')
  const [lipFullness, setLipFullness]     = useState('')
  const [skinTone, setSkinTone]           = useState('')
  const [skinToneHex, setSkinToneHex]     = useState('')
  const [editingFace, setEditingFace]     = useState(false)

  useEffect(() => {
    if (!profile) return
    if (profile.skin_type)     setSkinType(profile.skin_type)
    if (profile.skin_concerns) setConcerns(profile.skin_concerns)
    if (profile.budget)        setBudget(profile.budget)
    if (profile.total_budget)  setTotalBudget(profile.total_budget)
    if (profile.face_shape)    setFaceShape(profile.face_shape)
    if (profile.eye_shape)     setEyeShape(profile.eye_shape)
    if (profile.lip_fullness)  setLipFullness(profile.lip_fullness)
    if (profile.skin_tone)     setSkinTone(profile.skin_tone)
    if (profile.skin_tone_hex) setSkinToneHex(profile.skin_tone_hex)
  }, [profile])

  function toggleConcern(concern) {
    setConcerns(prev =>
      prev.includes(concern)
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    )
  }

  function addCustomConcern() {
    const trimmed = customConcern.trim()
    if (!trimmed || concerns.includes(trimmed)) return
    setConcerns(prev => [...prev, trimmed])
    setCustomConcern('')
  }

  function removeConcern(concern) {
    setConcerns(prev => prev.filter(c => c !== concern))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveProfile(
        {
          skinTone:    skinTone    || profile?.skin_tone     || '',
          skinToneHex: skinToneHex || profile?.skin_tone_hex || '',
          faceShape:   faceShape   || profile?.face_shape    || '',
          eyeShape:    eyeShape    || profile?.eye_shape     || '',
          lipFullness: lipFullness || profile?.lip_fullness  || '',
        },
        skinType,
        concerns,
        budget,
        totalBudget,
      )
      setSaved(true)
      setEditingFace(false)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfile) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '18px 28px', borderBottom: '1px solid #F0D9E6', backgroundColor: '#FFFAFC' }}>
            <LoadingSkeleton width="120px" height="24px" style={{ marginBottom: '6px' }} />
            <LoadingSkeleton width="200px" height="14px" />
        </div>
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
            <LoadingSkeleton height="120px" borderRadius="12px" />
            <LoadingSkeleton height="160px" borderRadius="12px" />
            <LoadingSkeleton height="200px" borderRadius="12px" />
        </div>
        </div>
    )
    }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Topbar */}
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid #F0D9E6',
        backgroundColor: '#FFFAFC', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#6B3050' }}>
            Skin profile
          </h2>
          <p style={{ fontSize: '13px', color: '#C4A0B4', marginTop: '2px' }}>
            Tell us about your skin so we can personalize your recommendations
          </p>
        </div>

        {/* Right side of topbar - logout button - mobile only */}
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            {isMobile && (
                <button
                onClick={() => supabase.auth.signOut()}
                style={{
                    fontSize: '13px', padding: '7px 16px',
                    borderRadius: '20px', border: '1px solid #f0d9e6',
                    backgroundColor: 'white', color: '#9b6b80', cursor: 'pointer',
                }}>
                    Log out
                </button>
            )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !skinType}
          style={{
            padding: '10px 24px', borderRadius: '20px', border: 'none',
            backgroundColor: saved ? '#D4EAD0' : saving || !skinType ? '#F0D9E6' : '#8B3060',
            color: saved ? '#3A7850' : saving || !skinType ? '#C4A0B4' : 'white',
            fontSize: '14px', fontWeight: '500',
            cursor: saving || !skinType ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* ── Face data section ── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B3050' }}>
                Face analysis
                <span style={{ fontSize: '11px', color: '#C4A0B4', fontWeight: '400', marginLeft: '8px' }}>
                  {profile?.face_shape ? 'auto-filled · click Edit to correct' : 'not analyzed yet'}
                </span>
              </h3>
              <button
                onClick={() => setEditingFace(prev => !prev)}
                style={{
                  fontSize: '12px', padding: '5px 14px',
                  borderRadius: '20px', border: '1px solid #F0D9E6',
                  backgroundColor: editingFace ? '#FBDCE8' : 'white',
                  color: editingFace ? '#8B3060' : '#9B6B80',
                  cursor: 'pointer',
                }}
              >
                {editingFace ? '✕ Cancel' : '✏️ Edit'}
              </button>
            </div>

            {/* No profile yet */}
            {!profile?.face_shape && !editingFace && (
              <div style={{
                padding: '16px', borderRadius: '12px',
                backgroundColor: '#FFF8E6', border: '1px solid #E8D880',
                fontSize: '13px', color: '#8B7020',
              }}>
                ℹ️ Run the makeup guide first to auto-fill, or click <strong>Edit</strong> to enter manually.
              </div>
            )}

            {/* Read only chips */}
            {(profile?.face_shape || faceShape) && !editingFace && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: (faceShape || profile?.face_shape) + ' face',   color: '#A0C4B8' },
                  { label: skinTone   || profile?.skin_tone,                color: '#C4956A' },
                  { label: (eyeShape  || profile?.eye_shape) + ' eyes',     color: '#E8A0BC' },
                  { label: (lipFullness || profile?.lip_fullness) + ' lips', color: '#E8A0BC' },
                ].filter(c => c.label && !c.label.startsWith('undefined') && !c.label.startsWith('null')).map(chip => (
                  <div key={chip.label} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', padding: '5px 13px',
                    borderRadius: '20px', border: '1px solid #E0C0D0',
                    color: '#9B6070', backgroundColor: '#FFF5F8',
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: chip.color }} />
                    {chip.label}
                  </div>
                ))}
              </div>
            )}

            {/* Editable dropdowns */}
            {editingFace && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Face shape */}
                <div>
                  <label style={{ fontSize: '12px', color: '#C4A0B4', display: 'block', marginBottom: '6px' }}>
                    Face shape
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {FACE_SHAPES.map(shape => (
                      <div
                        key={shape}
                        onClick={() => setFaceShape(shape)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '12px', textTransform: 'capitalize',
                          border: faceShape === shape ? '1.5px solid #D4A0BC' : '1px solid #F0D9E6',
                          backgroundColor: faceShape === shape ? '#FFF0F6' : 'white',
                          color: faceShape === shape ? '#8B3060' : '#9B6B80',
                        }}
                      >
                        {faceShape === shape ? '✓ ' : ''}{shape}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eye shape */}
                <div>
                  <label style={{ fontSize: '12px', color: '#C4A0B4', display: 'block', marginBottom: '6px' }}>
                    Eye shape
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EYE_SHAPES.map(shape => (
                      <div
                        key={shape}
                        onClick={() => setEyeShape(shape)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '12px', textTransform: 'capitalize',
                          border: eyeShape === shape ? '1.5px solid #D4A0BC' : '1px solid #F0D9E6',
                          backgroundColor: eyeShape === shape ? '#FFF0F6' : 'white',
                          color: eyeShape === shape ? '#8B3060' : '#9B6B80',
                        }}
                      >
                        {eyeShape === shape ? '✓ ' : ''}{shape}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lip fullness */}
                <div>
                  <label style={{ fontSize: '12px', color: '#C4A0B4', display: 'block', marginBottom: '6px' }}>
                    Lip fullness
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {LIP_TYPES.map(type => (
                      <div
                        key={type}
                        onClick={() => setLipFullness(type)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '12px', textTransform: 'capitalize',
                          border: lipFullness === type ? '1.5px solid #D4A0BC' : '1px solid #F0D9E6',
                          backgroundColor: lipFullness === type ? '#FFF0F6' : 'white',
                          color: lipFullness === type ? '#8B3060' : '#9B6B80',
                        }}
                      >
                        {lipFullness === type ? '✓ ' : ''}{type}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin tone */}
                <div>
                  <label style={{ fontSize: '12px', color: '#C4A0B4', display: 'block', marginBottom: '6px' }}>
                    Skin tone
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SKIN_TONES.map(tone => (
                      <div
                        key={tone.label}
                        onClick={() => { setSkinTone(tone.label); setSkinToneHex(tone.hex) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '12px',
                          border: skinTone === tone.label ? '1.5px solid #D4A0BC' : '1px solid #F0D9E6',
                          backgroundColor: skinTone === tone.label ? '#FFF0F6' : 'white',
                          color: skinTone === tone.label ? '#8B3060' : '#9B6B80',
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          backgroundColor: tone.hex, border: '1px solid #E0C0D0', flexShrink: 0,
                        }} />
                        {tone.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <div style={{
                  padding: '12px 14px', borderRadius: '12px',
                  backgroundColor: '#FFF8E6', border: '1px solid #E8D880',
                  fontSize: '12px', color: '#8B7020',
                  display: 'flex', gap: '8px',
                }}>
                  <span>💡</span>
                  <span>
                    Not sure? Go to <strong>Makeup guide</strong> and run a face analysis —
                    it will auto-fill everything here accurately.
                  </span>
                </div>

              </div>
            )}
          </section>

          <div style={{ height: '1px', backgroundColor: '#F0D9E6' }} />

          {/* ── Skin type ── */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B3050', marginBottom: '12px' }}>
              Skin type <span style={{ color: '#E88080' }}>*</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {SKIN_TYPES.map(type => (
                <div
                  key={type.id}
                  onClick={() => setSkinType(type.id)}
                  style={{
                    padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                    textAlign: 'center',
                    border: skinType === type.id ? '2px solid #D4A0BC' : '1px solid #F0D9E6',
                    backgroundColor: skinType === type.id ? '#FFF0F6' : 'white',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{type.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#6B3050', marginBottom: '3px' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#C4A0B4', lineHeight: '1.4' }}>
                    {type.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: '1px', backgroundColor: '#F0D9E6' }} />

          {/* ── Skin concerns ── */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B3050', marginBottom: '4px' }}>
              Skin concerns
            </h3>
            <p style={{ fontSize: '12px', color: '#C4A0B4', marginBottom: '12px' }}>
              Select all that apply
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {SKIN_CONCERNS.map(concern => (
                <div
                  key={concern}
                  onClick={() => toggleConcern(concern)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '12px',
                    border: concerns.includes(concern) ? '1.5px solid #D4A0BC' : '1px solid #F0D9E6',
                    backgroundColor: concerns.includes(concern) ? '#FFF0F6' : 'white',
                    color: concerns.includes(concern) ? '#8B3060' : '#9B6B80',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {concerns.includes(concern) ? '✓ ' : ''}{concern}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customConcern}
                onChange={e => setCustomConcern(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomConcern()}
                placeholder="Add custom concern..."
                style={{
                  flex: 1, padding: '10px 14px',
                  borderRadius: '12px', border: '1px solid #F0D9E6',
                  fontSize: '13px', color: '#6B3050',
                  outline: 'none', backgroundColor: '#FFFAFC',
                }}
              />
              <button
                onClick={addCustomConcern}
                style={{
                  padding: '10px 16px', borderRadius: '12px', border: 'none',
                  backgroundColor: '#FBDCE8', color: '#8B3060',
                  fontSize: '13px', cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>

            {concerns.filter(c => !SKIN_CONCERNS.includes(c)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {concerns.filter(c => !SKIN_CONCERNS.includes(c)).map(c => (
                  <div key={c} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px', borderRadius: '20px',
                    backgroundColor: '#FFF0F6', border: '1.5px solid #D4A0BC',
                    fontSize: '12px', color: '#8B3060',
                  }}>
                    {c}
                    <span
                      onClick={() => removeConcern(c)}
                      style={{ cursor: 'pointer', opacity: 0.6, fontSize: '14px', lineHeight: 1 }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ height: '1px', backgroundColor: '#F0D9E6' }} />

          {/* ── Budget ── */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B3050', marginBottom: '12px' }}>
              Budget preference
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {BUDGET_TIERS.map(tier => (
                <div
                  key={tier.id}
                  onClick={() => setBudget(tier.id)}
                  style={{
                    padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                    textAlign: 'center',
                    border: budget === tier.id ? '2px solid #D4A0BC' : '1px solid #F0D9E6',
                    backgroundColor: budget === tier.id ? '#FFF0F6' : 'white',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '6px' }}>{tier.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#6B3050', marginBottom: '3px' }}>
                    {tier.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#C4A0B4' }}>{tier.desc}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#C4A0B4' }}>Total makeup budget</label>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#8B3060' }}>${totalBudget}</span>
              </div>
              <input
                type="range"
                min="20" max="1000" step="10"
                value={totalBudget}
                onChange={e => setTotalBudget(e.target.value)}
                style={{ width: '100%', accentColor: '#8B3060' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: '#C4A0B4' }}>$20</span>
                <span style={{ fontSize: '10px', color: '#C4A0B4' }}>$1000</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default SkinProfile