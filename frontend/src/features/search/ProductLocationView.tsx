import { useEffect, useState } from 'react'
import { api, type Layout, type Shelf, type ShelfSection } from '../../services/api'
import { NavigationMap } from '../navigation/NavigationMap'
import { navigationApi, type NavigationElement, type Route } from '../navigation/navigationApi'
import type { ProductSuggestion } from './searchApi'
import { ShelfFrontView } from './ShelfFrontView'

type Scene = { layout: Layout; shelves: Shelf[]; sections: ShelfSection[]; elements: NavigationElement[]; route: Route | null; warning: string }

export function ProductLocationView({ product, terminal, onBack }: { product: ProductSuggestion; terminal?: NavigationElement; onBack: () => void }) {
  const [index, setIndex] = useState(0)
  const [scene, setScene] = useState<Scene | null>(null)
  const [error, setError] = useState('')
  const [loadedKey, setLoadedKey] = useState('')
  const [revision, setRevision] = useState(0)
  const location = product.locations[index]
  const key = `${location?.shelfSectionId ?? ''}-${revision}`

  useEffect(() => {
    if (!location) return
    let active = true
    async function load() {
      const selected = location!
      try {
        const [layouts, shelves, sections, elements, routeResult] = await Promise.all([
          api.layouts(selected.storeId), api.shelves(selected.layoutId), api.sections(selected.shelfId), navigationApi.elements(),
          terminal ? navigationApi.route(terminal.id, selected.shelfId).then(route => ({ route, warning: '' })).catch((e: Error) => ({ route: null, warning: e.message }))
            : Promise.resolve({ route: null, warning: 'Configure o terminal deste navegador para visualizar o caminho.' }),
        ])
        const layout = layouts.find(l => l.id === selected.layoutId)
        if (!layout || !shelves.some(s => s.id === selected.shelfId) || !sections.some(s => s.id === selected.shelfSectionId)) throw new Error('A localização mudou. Busque o produto novamente.')
        if (active) {
          setScene({ layout, shelves, sections, elements: elements.filter(e => e.layoutId === layout.id), ...routeResult })
          setError('')
          setLoadedKey(key)
        }
      } catch (e) {
        if (active) { setError(e instanceof Error ? e.message : 'Erro ao carregar o mapa.'); setLoadedKey(key); setScene(null) }
      }
    }
    void load()
    return () => { active = false }
  }, [location, terminal, key])

  return <section className="product-location-view">
    <header className="results-heading"><div><span className="section-label">Localizar produto</span><h2>{product.productName}</h2><p>{product.brand ?? 'Sem marca'} · {product.sku ?? 'Sem SKU'}</p></div><button className="secondary-action" onClick={onBack}>Voltar aos resultados</button></header>
    {!location ? <p className="navigation-notice">Produto sem localização cadastrada.</p> : <>
      <div className="location-actions">
        <label>Localização<select value={index} onChange={event => setIndex(Number(event.target.value))}>{product.locations.map((l, i) => <option key={l.shelfSectionId} value={i}>{l.storeName} / {l.shelfName} / {l.shelfSectionName}</option>)}</select></label>
        <button className="secondary-action" onClick={() => setRevision(r => r + 1)}>Atualizar caminho</button>
      </div>
      {loadedKey !== key ? <p role="status">Carregando mapa e calculando caminho…</p> : error ? <p role="alert">{error}</p> : scene && <>
        {scene.warning && <p className="navigation-notice" role="status">{scene.warning}</p>}
        {scene.route && <p className="route-summary">De {terminal?.name} até {location.shelfName} · Distância aproximada: {(scene.route.distanceCm / 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m</p>}
        {scene.route?.automaticAccess && <p className="navigation-help">Chegada calculada na lateral acessível mais próxima. Você pode definir a face de chegada em Terminais e caminhos.</p>}
        <div className="location-map-grid">
          <NavigationMap layout={scene.layout} shelves={scene.shelves} elements={scene.elements} route={scene.route} terminalId={terminal?.id} shelfId={location.shelfId} />
          <ShelfFrontView sections={scene.sections} selectedId={location.shelfSectionId} name={location.shelfName} />
        </div>
      </>}
    </>}
  </section>
}