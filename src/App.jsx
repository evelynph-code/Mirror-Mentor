import { useEffect, useState } from "react";
import {supabase} from './services/supabase';
import Sidebar from "./components/Sidebar";
import MakeupGuide from "./pages/MakeupGuide";
import ProductFinder from "./pages/ProductFinder";
import Auth from "./pages/Auth";
import MyLooks from "./pages/myLooks";
import SkinProfile from "./pages/SkinProfile";
import Cart from "./pages/Cart";
import { useWindowSize } from "./hooks/useWindowSize";

function App() {
  const [activePage, setActivePage] = useState('guide')
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [replayLook, setReplayLook] = useState(null)

  const {width} = useWindowSize()
  const isMobile = width < 768

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)
    })

    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loadingAuth) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#fff0f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{fontSize: '14px', color: '#c4a0b4'}}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={(u) => setUser(u)} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      backgroundColor: '#FFF0F5',
    }}>
      
      {/* Left sidebar - always visible */}
      {!isMobile && (
        <Sidebar activePage={activePage} 
        setActivePage={setActivePage} 
        user={user}
        onLogout={handleLogout} />
      )}

      {/* Right content area - canges based on activePage */}
      <div style={{ flex: 1, backgroundColor: '#FFFAFC', paddingBottom: isMobile ? '70px' : '0', overflowY: 'auto'}}>
        {activePage === 'guide' && (
          <MakeupGuide user={user}
          replayLook={replayLook}
          onReplayConsumed={() => setReplayLook(null)} />
        )}
        {activePage === 'skinprofile' && <SkinProfile user={user} isMobile={isMobile} />}
        {activePage === 'cart' && <Cart user={user} isMobile={isMobile}/>}
        {activePage === 'products' && <ProductFinder user={user} isMobile={isMobile}/>}
        {activePage === 'mylooks' && (
          <MyLooks
          user={user}
          isMobile={isMobile}
          onReplayLook={(look) => {
            setReplayLook(look)
            setActivePage('guide')
          }} />
        )}
      </div>

      {/* Bottom tab bar - mobile only */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '65px',
          backgroundColor: 'white',
          borderTop: '1px solid #f0d9e6',
          display: 'flex', alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 -2px 12px rgba(180, 100, 140, 0.08)'
        }}>
          {[
            { id: 'guide',       icon: '💄', label: 'Guide' },
            { id: 'products',    icon: '🛍️', label: 'Products' },
            { id: 'mylooks',     icon: '🌸', label: 'My looks' },
            { id: 'cart',        icon: '🛒', label: 'Cart' },
            { id: 'skinprofile', icon: '✨', label: 'Profile' },
          ].map(tab => (
            <div
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', cursor: 'pointer',
                padding: '8px 0',
              }}>
                <span style={{fontSize: '20px'}}>{tab.icon}</span>
                <span style={{
                  fontSize: '10px', fontWeight: activePage === tab.id ? '600' : '400',
                  color: activePage === tab.id ? '#8b3060' : '#c4a0b4',
                }}>
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {activePage === tab.id && (
                  <div style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    backgroundColor: '#8b3060', marginTop: '1px',
                  }} />
                )}
              </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App