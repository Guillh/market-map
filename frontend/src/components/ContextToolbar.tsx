import { useMarketData } from '../app/useMarketData'

export function ContextToolbar({ readOnly = false }: { readOnly?: boolean }) {
  const { screen, stores, layouts, selectedStoreId, selectedLayoutId, setSelectedStoreId, setSelectedLayoutId, createStarterData } = useMarketData()

  return (
    <header className="context-topbar compact-context-topbar">
      <label>
        <span>Loja</span>
        <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} disabled={readOnly}>
          <option value="">Selecione</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
      </label>
      <label>
        <span>Layout</span>
        <select value={selectedLayoutId} onChange={(event) => setSelectedLayoutId(event.target.value)} disabled={readOnly}>
          <option value="">Selecione</option>
          {layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}
        </select>
      </label>
      {screen === 'config' ? <button className="secondary-action" onClick={createStarterData} type="button">Criar dados iniciais</button> : null}
    </header>
  )
}
