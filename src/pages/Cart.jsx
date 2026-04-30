import { useEffect } from "react";
import { useCart } from "../hooks/useCart";


function Cart({user}) {
    const {cart, loadingCart, loadCart, removeFromCart} = useCart(user)

    useEffect(() => {
        loadCart()
    }, [user])

    //Group cart items by style
    const grouped = cart.reduce((acc, item) => {
        const key = item.style_name ?? 'Other'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }, {})

    //Total cost
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price ?? 0)
        return sum + (isNaN(price) ? 0 : price)
    }, 0)

    if (loadingCart) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <p style={{fontSize: '14px', color: '#c4a0b4'}}>Loading your cart...</p>
            </div>
        )
    }

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
                        My cart
                    </h2>
                    <p style={{fontSize: '13px', color: '#c4a0b4', marginTop: '2px'}}>
                        {cart.length > 0
                        ? `${cart.length} product${cart.length !== 1 ? 's' : ''} saved`
                        : 'No products yet'}
                    </p>
                </div>

                {/* Total */}
                {cart.length > 0 && (
                    <div style={{
                        padding: '10px 20px', borderRadius: '20px',
                        backgroundColor: '#fff0f6', border: '1px solid #f0d9e6',
                        textAlign: 'center',
                    }}>
                        <p style={{fontSize: '11px', color: '#c4a0b4', marginBottom: '2px'}}>Total</p>
                        <p style={{fontSize: '18px', fontWeight: '500', color: '#8b3060'}}>
                            ${total.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{flex: 1, overflowY: 'auto', padding: '24px 28px'}}>

                {/* Empty state */}
                {cart.length === 0 && (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        height: '70%', gap: '12px', color: '#c4a0b4',
                    }}>
                        <div style={{fontSize:'48px'}}>🛍️</div>
                        <p style={{fontSize: '15px', fontWeight: '500', color: '#9b6b80'}}>
                            Your cart is empty
                        </p>
                        <p style={{fontSize: '13px', textAlign: 'center', lineHeight: '1.7'}}>
                            Add products from the<br />
                            <strong style={{color: '#8b3060'}}>Makeup guide</strong> or{' '}
                            <strong style={{color: '#8b3060'}}>Product finder</strong>
                        </p>
                    </div>
                )} 

                {/* Grouped by style */}
                {cart.length > 0 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px'}}>
                        {Object.entries(grouped).map(([styleName, items]) => (
                            <div key={styleName}>

                                {/* Style group header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    marginBottom: '12px',
                                }}>
                                    <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b3050'}}>
                                        {styleName}
                                    </h3>
                                    <div style={{flex: 1, height: '1px', backgroundColor: '#f0d9e6'}} />
                                    <span style={{fontSize: '12px', color: '#c4a0b4'}}>
                                        {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
                                        ${items.reduce((s,i) => s + parseFloat(i.price ?? 0),0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Items in this group */}
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    {items.map(item => (
                                        <CartItem
                                        key={item.id}
                                        item={item}
                                        onRemove={() => removeFromCart(item.id)} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Total summary */}
                        <div style={{
                            padding: '20px 24px', borderRadius: '16px',
                            backgroundColor: '#fff0f6', border: '1px solid #f0d9e6',
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <p style={{fontSize: '13px', color: '#c4a0b4', marginBottom: '4px'}}>
                                        {cart.length} products total
                                    </p>
                                    <p style={{fontSize: '22px', fontWeight: '500', color: '#6b3050'}}>
                                        ${total.toFixed(2)}
                                    </p>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <p style={{fontSize: '11px', color: '#c4a0b4', marginBottom: '6px'}}>
                                        Ready to shop?
                                    </p>
                                    <p style={{fontSize: '12px', color: '#9b6b80', lineHeight: '1.6'}}>
                                        Search each product on<br />
                                        Amazon, Sephora or Ulta
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

//Cart Item
function CartItem({item, onRemove}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 16px', borderRadius: '12px',
            backgroundColor: 'white', border: '1px solid #f0d9e6',
        }}>

            {/* Shade swatch */}
            <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: item.shade_hex ?? '#fbdce8',
                border: '2px solid #f0d9e6',
            }} />

            {/* Product info */}
            <div style={{flex: 1}}>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#6b3050', marginBottom: '2px'}}>
                    {item.product_name}
                </p>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {item.brand && (
                        <span style={{fontSize: '11px', color: '#c4a0b4'}}>
                            {item.brand}
                        </span>
                    )}
                    {item.shade && item.shade !== 'N/A' && (
                        <span style={{fontSize: '11px', color: '#9b6070'}}>
                            · {item.shade}
                        </span>
                    )}
                    {item.zone && (
                        <span style={{fontSize: '11px', color: '#c4a0b4'}}>
                            · {item.zone}
                        </span>
                    )}
                </div>
            </div>

            {/* Price */}
            {item.price && (
                <p style={{fontSize: '15px', fontWeight: '500', color: '#8b3060', flexShrink: 0}}>
                    ${parseFloat(item.price).toFixed(2)}
                </p>
            )}

            {/* Remove button */}
            <button 
            onClick={onRemove}
            style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '1px solid #f0d9e6', backgroundColor: 'white',
                color: '#c4a0b4', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
            }}>
                x
            </button>
        </div>
    )
}

export default Cart