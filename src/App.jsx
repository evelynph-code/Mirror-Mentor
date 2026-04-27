import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MakeupGuide from "./pages/MakeupGuide";
import ProductFinder from "./pages/ProductFinder";


function App() {
  const [activePage, setActivePage] = useState('guide')

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#FFF0F5',
    }}>
      
      {/* Left sidebar - always visible */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Right content area - canges based on activePage */}
      <div style={{ flex: 1, backgroundColor: '#FFFAFC'}}>
        {activePage === 'guide' && <MakeupGuide />}
        {activePage === 'products' && <ProductFinder />}
      </div>
    </div>
  )
}

export default App