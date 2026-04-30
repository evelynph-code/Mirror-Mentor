function Sidebar({ activePage, setActivePage}) {
    return (
        <div style={{
            width: '240px',
            minHeight: '100vh',
            backgroundColor: '#FFF0F5',
            borderRight: '1px solid #F0D9E6',
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', padding: '0 4px'}}>
                <img 
                src="/Logo.png"
                alt="Mirror mentor logo"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover'}} />

                <div>
                    <div style={{ fonSize: '16px', fontWeight: '500', color: '#6B3050'}}>Mirror Mentor</div>
                    <div style={{ fontSize: '12px', color: '#C4A0B4', letterSpacing: '0.3px'}}>Your makeup coach</div>
                </div>
            </div>

            {/* Section label */}
            <div style={{fontSize: '11px', color: '#C4A0B4', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 10px 3px'}}>
                Tools
            </div>

            {/* Makeup Guide nav item */}
            <div 
            onClick={() => setActivePage('guide')}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer',
                backgroundColor: activePage === 'guide' ? '#FBDCE8' : 'transparent',
                color: activePage === 'guide' ? '#8B3060' : '#9B6B80',
                fontWeight: activePage === 'guide' ? '500' : '400',
            }}>
                <div style={{ width: '9px', heigh: '9px', borderRadius: '50%', backgroundColor: '#E8A0BC', flexShrink: 0}} />
                Makeup guide
            </div>

            {/* Product Finder nav item */}
            <div 
            onClick={() => setActivePage('products')}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer',
                backgroundColor: activePage === 'products' ? '#FBDCE8' : 'transparent',
                color: activePage === 'products' ? '#8B3060' : '#9B6B80',
                fontWeight: activePage === 'products' ? '500' : '400',
            }}>
                <div style={{ width: '9px', heigh: '9px', borderRadius: '50%', backgroundColor: '#C4A8D4', flexShrink: 0}} />
                Product finder
            </div>

            {/* My cart nav item */}
            <div
            onClick={() => setActivePage('cart')}
            style={{
                display:'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer',
                backgroundColor: activePage === 'cart' ? '#fbdce8' : 'transparent',
                color: activePage === 'cart' ? '#8b3060' : '#9b6b80',
                fontWeight: activePage === 'cart' ? '500' : '400',
            }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#c4a8d4', flexShrink: 0}} />
                    My cart
            </div>

            {/* Section label */}
            <div style={{ fontSize: '11px', color: '#C4A0B4', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px 10px 3px' }}>
                Me
            </div>

            {/* My Looks */}
            <div
            onClick={() => setActivePage('mylooks')}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer',
                backgroundColor: activePage === 'mylooks' ? '#FBDCE8' : 'transparent',
                color: activePage === 'mylooks' ? '#8B3060' : '#9B6B80',
                fontWeight: activePage === 'mylooks' ? '500' : '400',
            }}
            >
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#A8C4D4', flexShrink: 0 }} />
            My looks
            </div>

            {/* Skin Profile */}
            <div
            onClick={() => setActivePage('skinprofile')}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer',
                backgroundColor: activePage === 'skinprofile' ? '#FBDCE8' : 'transparent',
                color: activePage === 'skinprofile' ? '#8B3060' : '#9B6B80',
                fontWeight: activePage === 'skinprofile' ? '500' : '400',
            }}
            >
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#A8C4D4', flexShrink: 0 }} />
            Skin profile
            </div>

            {/* Profile summary card - pushed to bottom */}
            <div style={{ marginTop: 'auto', backgroundColor: '#FBDCE8', borderRadius: '12px', padding: '14px'}}>
                <div style={{ fontSize: '11px', color: '$B07890', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px'}}>
                    Your profile
                </div>
                <div style={{ fontSize: '13px', color: '#6B3050', marginBottom: '4px'}}>Skin type: Combination</div>
                <div style={{ fontSize: '13px', color: '#6B3050', marginBottom: '4px'}}>Tone: Medium warm</div>
                <div style={{ fontSize: '13px', color: '#6B3050'}}>Shape: Oval</div>
            </div>
        </div>
    )
}

export default Sidebar