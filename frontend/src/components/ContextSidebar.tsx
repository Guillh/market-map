import { useMarketData } from '../app/useMarketData'

export function ContextSidebar({ readOnly = false }: { readOnly?: boolean }) {
  const { screen, stores, layouts, selectedStoreId, selectedLayoutId, setSelectedStoreId, setSelectedLayoutId, createStarterData } = useMarketData()
  const label = screen === 'config' ? 'Configuracao' : screen === 'inventory' ? 'Estoque' : 'Busca'

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark">MM</span>
        <div><h1>Market Map</h1><p>{label}</p></div>
      </div>
      <section className="panel-section">
        <span className="section-label">Loja</span>
        <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} disabled={readOnly}>
          <option value="">Selecione</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
      </section>
      <section className="panel-section">
        <span className="section-label">Layout</span>
        <select value={selectedLayoutId} onChange={(event) => setSelectedLayoutId(event.target.value)} disabled={readOnly}>
          <option value="">Selecione</option>
          {layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}
        </select>
      </section>
      {screen === 'config' ? <button className="secondary-action" onClick={createStarterData} type="button">Criar dados iniciais</button> : null}
    </aside>
  )
}
