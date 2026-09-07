import { useMarketData } from '../app/useMarketData'

export function TopBar() {
  const { health, healthError } = useMarketData()

  return (
    <header className="app-topbar">
      <div className="brand-block topbar-brand">
        <span className="brand-mark">MM</span>
        <div><h1>Market Map</h1><p>Administração da loja</p></div>
      </div>
      <div className="user-actions-placeholder">
        <span className={health ? 'api-status online' : 'api-status offline'}>
          {health ? `Backend ${health.status}` : `Backend indisponível${healthError ? `: ${healthError}` : ''}`}
        </span>
        <button className="user-settings-button" type="button" disabled>Usuário</button>
      </div>
    </header>
  )
}
