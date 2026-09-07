import { MarketDataProvider } from './app/MarketDataContext'
import { useMarketData } from './app/useMarketData'
import { AppNav } from './components/AppNav'
import { ConfigScreen } from './features/config/ConfigScreen'
import { InventoryScreen } from './features/inventory/InventoryScreen'
import { SearchScreen } from './features/search/SearchScreen'
import './App.css'

function AppContent() {
  const { screen, message, setMessage } = useMarketData()

  return (
    <main className="app-shell">
      <AppNav />
      {screen === 'config' ? <ConfigScreen /> : null}
      {screen === 'inventory' ? <InventoryScreen onMessage={setMessage} /> : null}
      {screen === 'search' ? <SearchScreen /> : null}
      {message ? <p className="global-message">{message}</p> : null}
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
