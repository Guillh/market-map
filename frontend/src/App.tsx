import { useState } from 'react'
import { MarketDataProvider } from './app/MarketDataContext'
import { useMarketData } from './app/useMarketData'
import { AppNav } from './components/AppNav'
import { ConfigScreen } from './features/config/ConfigScreen'
import { InventoryScreen, type InventoryTab } from './features/inventory/InventoryScreen'
import { SearchScreen } from './features/search/SearchScreen'
import { TopBar } from './components/TopBar'
import './App.css'

function AppContent() {
  const { screen, message, setMessage } = useMarketData()
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>('items')

  return (
    <main className="app-shell">
      <TopBar />
      <div className="app-layout">
        <AppNav inventoryTab={inventoryTab} setInventoryTab={setInventoryTab} />
        <section className="app-content">
          {screen === 'config' ? <ConfigScreen /> : null}
          {screen === 'inventory' ? <InventoryScreen onMessage={setMessage} tab={inventoryTab} /> : null}
          {screen === 'search' ? <SearchScreen /> : null}
        </section>
        {message ? <p className="global-message">{message}</p> : null}
      </div>
    </main>
  )
}

function App() {
  return (
    <MarketDataProvider>
      <AppContent />
    </MarketDataProvider>
  )
}

export default App
