import { useState, useEffect } from "react"
import { useProfile } from "../hooks/useProfile"
import { useCart } from "../hooks/useCart"
import { generateProducts } from "../services/gemini"

const MAKEUP_STYLES = [
  { id: 'natural',   label: 'Natural',       color: '#F5E6D0' },
  { id: 'glam',      label: 'Glam',          color: '#E8A0B0' },
  { id: 'korean',    label: 'Korean / Soft', color: '#FFAAC0' },
  { id: 'douyin',    label: 'Douyin',        color: '#FF8FAF' },
  { id: 'cleangirl', label: 'Clean girl',    color: '#EDE0D4' },
  { id: 'baddie',    label: 'Baddie',        color: '#7A4060' },
]

function ProductFinder({user}) {
    const {profile, loadingProfile} = useProfile(user)
    const {cart, loadCart, addToCart, removeFromCart, isInCart} = useCart(user)
    
    const [selectedStyle, setSelectedStyle] = useState('korean')
    const [products, setProducts] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [error,setError] = useState(null)
    const [totalCost, setTotalCost] = useState(0)
    const [customStyle, setCustomStyle] = useState('')

    useEffect(() => {
        if (user) loadCart()
    }, [user])

    //Calculate total cost whenever products change
    useEffect(() => {
        if (!products) return
        const total = products.reduce((sum, p) => sum + (p.price ?? 0), 0)
        setTotalCost(total.toFixed(2))
    }, [products])

    async function handleGenerate() {
        if (!profile) return
        setGenerating(true)
        setError(null)
        setProducts(null)

        const styleToUse = customStyle.trim() ||
        MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label ||
        'natural'

        try {
            const result = await generateProducts(profile, styleToUse)
            setProducts(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const profileIncomplete = !profile?.skin_type

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>

            {/* Topbar */}
            <div style={{
                padding: '18px 28px', borderBottom: '1px solid #f0d9e6',
                backgroundColor: '#fffafc', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <h2 style={{fontSize: '20px', fontWeight: '500', color: '#6b3050'}}>
                        Product Finder
                    </h2>
                    <p style={{fontSize: '13px', color: '#c4a0b4', marginTop: '2px'}}>
                        AI picks the best products for your skin
                    </p>
                </div>

                {/* Cart summary */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '20px',
                    backgroundColor: '#fbdce8', color: '#8b3060',
                    fontSize: '13px', fontWeight: '500'
                }}>
                    🛍️ {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </div>
            </div>

            {/* Body */}
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>

                {/* Left - controls */}
                <div style={{
                    width: '280px', borderRight: '1px solid #f0d9e6',
                    padding: '24px 18px', display: 'flex',
                    flexDirection: 'column', gap: '20px',
                    overflowY: 'auto', flexShrink: 0,
                    backgroundColor: '#fffafc'
                }}>

                    {/* Profile summary */}
                    <div>
                        <p style={{fontSize: '11px', color: '#c4a0b4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'}}>
                            Your skin profile
                        </p>

                        {loadingProfile ? (
                            <p style={{fontSize: '12px', color: '#c4a0b4'}}>Loading...</p>
                        ) : profileIncomplete ? (
                            <div style={{
                                padding: '12px', borderRadius: '10px',
                                backgroundColor: '#fff8e6', border: '1px solid #e8d880',
                                fontSize: '12px', color: '#8b7020', lineHeight: '1.6',
                            }}>
                                ⚠️ Complete your skin profile first so we can personalize recommendations.
                                <br />
                                Go to <strong>Skin profile</strong> in the sidebar.
                            </div>
                        ) : (
                            <div style={{display: 'flex', flexDirecion: 'column', gap: '6px'}}>
                                {[
                                    { label: 'Skin type',   value: profile.skin_type },
                                    { label: 'Skin tone',   value: profile.skin_tone },
                                    { label: 'Face shape',  value: profile.face_shape },
                                    { label: 'Budget',      value: profile.budget },
                                    { label: 'Total',       value: `$${profile.total_budget ?? '100'}` },
                                ].filter(r => r.value).map(row => (
                                    <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
                                        <span style={{color: '#c4a0b4'}}>{row.label}</span>
                                        <span style={{color: '#6b3050', fontWeight: '500',textTransform: 'capitalize'}}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}

                                {/* Skin concerns */}
                                {profile.skin_concerns?.length > 0 && (
                                    <div style={{marginTop: '4px'}}>
                                        <p style={{fontSize: '11px', color: '#c4a0b4', marginBottom: '5px'}}>Concerns</p>
                                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                                            {profile.skin_concerns.map(c => (
                                                <span key={c} style={{
                                                    fontSize: '10px', padding: '2px 8px',
                                                    borderRadius: '10px', backgroundColor: '#fff0f6',
                                                    border: '1px solid #f0d9e6', color: '#8b3060',
                                                }}>
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{height: '1px', backgroundColor: '#f0d9e6'}} />

                    {/* Style picker */}
                    <div>
                        <p style={{fontSize: '11px', color: '#c4a0b4', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'}}>
                            Makeup style
                        </p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            {MAKEUP_STYLES.map(style => (
                                <div
                                key={style.id}
                                onClick={() => {
                                    setSelectedStyle(style.id)
                                    setCustomStyle('')
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                    border: selectedStyle === style.id && !customStyle
                                    ? '1.5px solid #d4a0bc' : '1px solid #f0d9e6',
                                    backgroundColor: selectedStyle === style.id && !customStyle
                                    ? '#fff0f6' : 'white',
                                }}>
                                    <div style={{width: '20px', height: '20px', borderRadius: '50%', backgroundColor: style.color, flexShrink: 0}} />
                                    <span style={{fontSize: '13px', color: '#6b3050', fontWeight: selectedStyle === style.id && !customStyle ? '500' : '400'}}>
                                        {style.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Custom Style input */}
                        <div style={{marginTop: '10px', display: 'flex', gap: '6px'}}>
                            <input
                            type="text"
                            value={customStyle}
                            onChange={e => {
                                setCustomStyle(e.target.value)
                                if (e.target.value) setSelectedStyle(null)
                            }}
                        placeholder="Custom style..."
                        style={{
                            flex: 1, padding: '9px 12px',
                            borderRadius: '10px',
                            border: customStyle ? '1.5px solid #d4a0bc' : '1px slid #f0d9e6',
                            fontSize: '12px', color: '#6b3050',
                            outline: 'none', backgroundColor: '#fffafc',
                        }} />
                        {customStyle && (
                            <button
                            onClick={() => {setCustomStyle(''); setSelectedStyle('korean')}}
                            style={{
                                padding: '9px 10px', borderRadius: '10px',
                                border: '1px solid #f0d9e6', backgroundColor: 'white',
                                color: '#c4a0b4', fontSize: '12px', cursor: 'pointer',
                            }}>
                                ˟
                            </button>
                        )}
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                    onClick={handleGenerate}
                    disabled={generating || profileIncomplete || loadingProfile}
                    style={{
                        width: '100%', padding: '14px',
                        borderRadius: '20px', border: 'none',
                        backgroundColor: generating || profileIncomplete ? '#f0d9e6' : '#8b3060',
                        color: generating || profileIncomplete ? '#c4a0b4' : 'white',
                        fontSize: '14px', fontWeight: '500',
                        cursor: generating || profileIncomplete ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                    }}>
                        {generating ? '✨ Finding products...' : '✨ Find my products'}
                    </button>

                    {error && (
                        <p style={{fontSize: '12px', color: '#c47090', textAlign: 'center'}}>
                            ⚠️ {error}
                        </p>
                    )}
                </div>

                {/* Right - product list */}
                <div style={{flex: 1, padding: '24px 28px', overflowY: 'auto'}}>

                    {/* Empty state */}
                    {!products && !generating && (
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            height: '100%', gap: '12px', color: '#c4a0b4',
                        }}>
                            <div style={{fontSize: '48px'}}>🛍️</div>
                            <p style={{fontSize: '15px', fontWeight: '500', color: '#9b6b80'}}>
                                Your product list will appear here
                            </p>
                            <p style={{fontSize: '13px', textAlign: 'center', lineHeight: '1.7'}}>
                                Select a makeup style and click<br />
                                <strong style={{color: '#8b3060'}}>Find my products</strong>
                            </p>
                        </div>
                    )}

                    {/* Loading state */}
                    {generating && (
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            height: '100%', gap: '12px', color: '#c4a0b4',
                        }}>
                            <div style={{fontSize: '48px'}}>✨</div>
                            <p style={{fontSize: '15px', color: '#9b6b80'}}>
                                Finding the perfect products for you...
                            </p>
                        </div>
                    )}

                    {/* Product list */}
                    {products && (
                        <>
                            {/* Budget tracker */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 18px', borderRadius: '12px',
                                backgroundColor: '#fff0f6', border: '1px solid #f0d9e6',
                                marginBottom: '20px',
                            }}>
                                <div>
                                    <p style={{fontSize: '12px', color: '#c4a0b4', marginBottom: '2px'}}>
                                        Total cost
                                    </p>
                                    <p style={{fontSize: '20px', fontWeight: '500', color: '#6b3050'}}>
                                        ${totalCost}
                                        <span style={{fontSize: '12px', color: '#c4a0b4', marginLeft: '6px'}}>
                                            of ${profile?.total_budget ?? '100'} budget
                                        </span>
                                    </p>
                                </div>

                                {/* Budget bar */}
                                <div style={{width: '160px'}}>
                                    <div style={{height: '6px', backgroundColor: '#f0d9e6', borderRadius: '10px'}}>
                                        <div style={{
                                            height: '100%', borderRadius: '10px',
                                            backgroundColor: totalCost > (profile?.total_budget ?? 100)
                                            ? '#e88080' : '#8b3060',
                                            width: `${Math.min(100, (totalCost / (profile?.total_budget ?? 100)) * 100)}%`,
                                            transition: 'width 0.4s ease',
                                        }} />
                                    </div>
                                    <p style={{fontSize: '10px', color: '#c4a0b4', marginTop: '4px', textAlign: 'right'}}>
                                        {totalCost > (profile?.total_budget ?? 100)
                                        ? `$${(totalCost = (profile?.total_budget ?? 100)).toFixed(2)} over budget`
                                        : `$${((profile?.total_budget ?? 100) - totalCost).toFixed(2)} remaining`}
                                    </p>
                                </div>
                            </div>

                            {/* Products grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumn: 'repeat(auto-full, minmax(260px, 1fr))',
                                gap: '14px',
                            }}>
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={index}
                                        product={product}
                                        inCart={isInCart(product.product, product.shade)}
                                        onAddToCart={() => addToCart({
                                            product: product.product,
                                            branad: product.brand,
                                            shade: product.shade,
                                            shadeHex: product.shadeHex,
                                            price: product.price?.toString(),
                                            zone: product.zone,
                                            styleName: MAKEUP_STYLES.find(s => s.id === selectedStyle)?.label,
                                        })}
                                        onRemoveFromCart={() => {
                                            const cartItem = cart.find(i =>
                                                i.product_name === product.product && i.shade === product.shade
                                            )
                                            if (cartItem) removeFromCart(cartItem.id)
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

//Product card
function ProductCard({product, inCart, onAddToCart, onRemoveFromCart}) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #f0d9e6',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
        }}>

            {/* Category badge */}
            <div style={{
                display: 'inline-block', fontSize: '10px',
                padding: '3px 10px', borderRadius: '10px',
                backgroundColor: '#fff0f6', color: '#8b3060',
                fontWeight: '500', alignSelf: 'flex-start',
            }}>
                {product.category}
            </div>

            {/* Product info */}
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                {/* Shade swatch */}
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    backgroundCOlor: product.shadeHex ?? '#fbdce8',
                    border: '2px solid #f0d9e6',
                }} />
                <div style={{flex: 1}}>
                    <p style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '2px'}}>
                        {product.product}
                    </p>
                    <p style={{fontSize: '11px', color: '#c4a0b4'}}>
                        {product.brand}
                    </p>
                    {product.shade && product.shade !== 'N/A' && (
                        <p style={{fontSize: '11px', color: '#9b6070', marginTop: '2px'}}>
                            Shade: {product.shade}
                        </p>
                    )}
                </div>
                <p style={{fontSize: '15px', fontWeight: '500', color: '#8b3060', flexShrink: 0}}>
                    ${product.price}
                </p>
            </div>

            {/* Why it works */}
            {product.whyItWorks && (
                <p style={{
                    fontSize: '11px', color: '#9b6070',
                    lineHeight: '1.6', padding: '8px 10px',
                    backgroundColor: '#fff5f8', borderRadius: '8px',
                }}>
                    💡 {product.whyItWorks}
                </p>
            )}

            {/* Add/Remove cart button */}
            <button
            onClick={inCart ? onRemoveFromCart : onAddToCart}
            style={{
                width: '100%', padding: '9px',
                borderRadius: '10px', border: 'none',
                backgroundColor: inCart ? '#d4ead0' : '#fbdce8',
                color: inCart ? '#3a7850' : '#8b3060',
                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}>
                {inCart ? '✅ In cart - remove' : '+ Add to cart'}
            </button>
        </div>
    )
}

export default ProductFinder
