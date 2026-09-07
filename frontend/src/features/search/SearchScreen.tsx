import { useEffect, useState } from 'react'
import { useMarketData } from '../../app/useMarketData'
import { bindTerminal, navigationApi, readTerminalId, type NavigationElement } from '../navigation/navigationApi'
import { searchSuggestions, type ProductSuggestion } from './searchApi'
import { ProductLocationView } from './ProductLocationView'

export function SearchScreen() {
  const { setScreen, setConfigTab } = useMarketData()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductSuggestion[]>([])
  const [selected, setSelected] = useState<ProductSuggestion | null>(null)
  const [terminals, setTerminals] = useState<NavigationElement[]>([])
  const [terminal, setTerminal] = useState<NavigationElement>()
  const [terminalLoaded, setTerminalLoaded] = useState(false)
  const [terminalError, setTerminalError] = useState('')
  const [completedQuery, setCompletedQuery] = useState('')
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const term = query.trim()
  const searching = !!term && (!terminalLoaded || completedQuery !== term)

  useEffect(() => {
    let active = true
    navigationApi.elements().then(elements => {
      if (!active) return
      setTerminals(elements.filter(e => e.kind === 'TERMINAL'))
      setTerminal(elements.find(e => e.kind === 'TERMINAL' && e.id === readTerminalId()))
      setTerminalLoaded(true)
    }).catch((e: Error) => { if (active) { setTerminalError(e.message); setTerminalLoaded(true) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!term || !terminalLoaded) return
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      searchSuggestions(term, terminal?.layoutId, controller.signal).then(data => {
        if (!controller.signal.aborted) { setProducts(data); setError(''); setCompletedQuery(term) }
      }).catch((e: Error) => {
        if (!controller.signal.aborted) { setProducts([]); setError(e.message); setCompletedQuery(term) }
      })
    }, 300)
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [term, terminal?.layoutId, terminalLoaded, requestVersion])

  return <section className="search-home">
    <header className={selected ? 'search-hero compact-search-hero' : 'search-hero'}>
      <span className="hero-eyebrow">SUA LOJA, MAIS PERTO</span>
      <h2>Encontre o que você procura.</h2>
      <p>Do produto à prateleira. Tudo no lugar certo.</p>
      <form className="home-search-form" role="search" onSubmit={event => { event.preventDefault(); setSelected(null); setCompletedQuery(''); setRequestVersion(n => n + 1) }}>
        <label className="visually-hidden" htmlFor="product-search">Nome, SKU ou marca do produto</label>
        <input id="product-search" placeholder="Busque por nome, SKU ou marca" value={query} onChange={event => { setQuery(event.target.value); setSelected(null); if (event.target.value.trim() !== term) setCompletedQuery('') }} aria-controls="product-results" />
        <button className="primary-action" disabled={!term}>Buscar produto</button>
      </form>
      <span className="search-hint">{terminal ? `Buscando no layout do terminal: ${terminal.name}` : 'Busque um produto para consultar sua localização.'}</span>
    </header>

    {terminalLoaded && terminals.length > 0 && <label className="search-terminal-picker">Computador de origem
      <select value={terminal?.id ?? ''} onChange={event => {
        try {
          bindTerminal(event.target.value)
          setTerminal(terminals.find(t => t.id === event.target.value))
          setSelected(null); setCompletedQuery(''); setTerminalError('')
        } catch { setTerminalError('O navegador não permitiu salvar a associação do computador.') }
      }}>
        <option value="">Selecione este computador para traçar o caminho</option>
        {terminals.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </label>}
    {terminalError && terminal && <p role="alert">{terminalError}</p>}
    {terminalLoaded && !terminal && <div className="terminal-notice"><p>{terminalError || 'Este navegador ainda não está associado a um computador no mapa.'}</p><button className="secondary-action" onClick={() => { setConfigTab('navigation'); setScreen('config') }}>Configurar terminal</button></div>}

    {selected ? <ProductLocationView key={selected.productId} product={selected} terminal={terminal} onBack={() => setSelected(null)} /> :
      <section className="home-results" id="product-results" aria-label="Resultados da busca" aria-busy={searching}>
        <div className="results-heading"><h3>{term ? 'Produtos encontrados' : 'Tudo começa com uma busca'}</h3><span>{term ? 'SELECIONE PARA VER NO MAPA' : 'SIMPLES. RÁPIDO. ORGANIZADO.'}</span></div>
        {searching ? <p role="status">Buscando produtos…</p> : term && error ? <p role="alert">{error}</p> : term ? <>
          <p className="search-count" role="status">{products.length ? `${products.length} produto(s). Mostrando até 30 resultados; refine a busca se necessário.` : 'Nenhum produto encontrado. Tente outro nome, SKU ou marca.'}</p>
          <div className="home-result-grid">{products.map(product => <button className="home-product-card product-result-button" key={product.productId} onClick={() => setSelected(product)}>
            <span className="product-card-label">PRODUTO</span><h3>{product.productName}</h3><p>{product.brand ?? 'Sem marca'} · {product.sku ?? 'Sem SKU'}</p>
            <div className="product-location"><strong>{product.locations.length ? 'Ver localização no mapa →' : 'Sem localização cadastrada'}</strong><span>{product.locations.length ? `${product.locations.length} localização(ões)` : 'Aguardando vínculo com uma seção'}</span></div>
          </button>)}</div>
        </> : <div className="search-guide-grid">
          <article><span className="guide-number">01</span><h3>Busque um produto</h3><p>Pesquise pelo nome, marca ou SKU e selecione o produto nos resultados.</p></article>
          <article><span className="guide-number">02</span><h3>Siga o caminho</h3><p>Veja o percurso do computador até a prateleira no mapa da loja.</p></article>
          <article><span className="guide-number">03</span><h3>Encontre a seção</h3><p>A vista frontal destaca o nível e a posição do produto na prateleira.</p></article>
        </div>}
      </section>}
    <footer className="home-footer"><span>Market Map</span><span>Cada produto em seu lugar.</span></footer>
  </section>
}