import { useMarketData } from '../app/useMarketData'

export function AppNav() {
  const { screen, setScreen, health, healthError } = useMarketData()

  return (
    <nav className="app-nav">
      <button className={screen === 'config' ? 'nav-active' : ''} onClick={() => setScreen('config')} type="button">Configuracao</button>
      <button className={screen === 'inventory' ? 'nav-active' : ''} onClick={() => setScreen('inventory')} type="button">Estoque</button>
      <button className={screen === 'search' ? 'nav-active' : ''} onClick={() => setScreen('search')} type="button">Busca</button>
      <span className={health ? 'api-status online' : 'api-status offline'}>
        {health ? `Backend ${health.status}` : `Backend indisponivel${healthError ? `: ${healthError}` : ''}`}
      </span>
    </nav>
  )
}
