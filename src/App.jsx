import { useEffect, useState } from "react";
import {supabase} from './services/supabase';
import Sidebar from "./components/Sidebar";
import MakeupGuide from "./pages/MakeupGuide";
import ProductFinder from "./pages/ProductFinder";
import Auth from "./pages/Auth";


function App() {
  const [activePage, setActivePage] = useState('guide')
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

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
      minHeight: '100vh',
      backgroundColor: '#FFF0F5',
    }}>
      
      {/* Left sidebar - always visible */}
      <Sidebar activePage={activePage} 
      setActivePage={setActivePage} 
      user={user}
      onLogout={handleLogout} />

      {/* Right content area - canges based on activePage */}
      <div style={{ flex: 1, backgroundColor: '#FFFAFC'}}>
        {activePage === 'guide' && <MakeupGuide user={user} />}
        {activePage === 'products' && <ProductFinder user={user} />}
      </div>
    </div>
  )
}

export default App