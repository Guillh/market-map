import { ContextSidebar } from '../../components/ContextSidebar'
import { useMarketData } from '../../app/useMarketData'

export function SearchScreen() {
  const { searchQuery, setSearchQuery, searchProduct, searchResults } = useMarketData()

  return (
    <section className="screen-grid search-screen">
      <ContextSidebar readOnly />
      <section className="workspace wide">
        <header className="topbar">
          <div><span className="section-label">Busca</span><h2>Localizar produto</h2></div>
          <div className="search-box">
            <input placeholder="Nome, SKU ou marca" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void searchProduct() }} />
            <button className="primary-action" onClick={() => void searchProduct()} type="button">Buscar</button>
          </div>
        </header>
        <div className="search-results-list">
          {searchResults.map((result) => <article key={`${result.productId}-${result.location.shelfSectionId}`}><strong>{result.productName}</strong><span>{result.brand ?? 'Sem marca'} · {result.sku ?? 'Sem SKU'}</span><p>{result.location.storeName} / {result.location.layoutName} / {result.location.shelfName} / {result.location.shelfSectionName}</p><small>Nivel {result.location.levelIndex}, posicao {result.location.positionIndex}</small></article>)}
          {!searchResults.length ? <p className="empty-state">Digite um termo para buscar produtos. O mapa entra aqui em uma etapa futura.</p> : null}
        </div>
      </section>
    </section>
  )
}
