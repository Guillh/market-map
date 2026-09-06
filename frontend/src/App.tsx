import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  api,
  type Layout,
  type Product,
  type ProductSearchResult,
  type Shelf,
  type ShelfSection,
  type Store,
} from './api'
import './App.css'

type HealthStatus = { status: string; timestamp: string }
type Screen = 'config' | 'search'
type ConfigTab = 'store' | 'shelves' | 'link-products' | 'products'
type ShelfForm = { name: string; positionXCm: number; positionYCm: number; widthCm: number; heightCm: number }
type SectionForm = { name: string; levelIndex: number; positionIndex: number }
type ProductForm = { name: string; sku: string; brand: string }
type LayoutForm = { name: string; widthCm: number; heightCm: number }

const defaultShelfForm: ShelfForm = { name: 'Nova prateleira', positionXCm: 48, positionYCm: 48, widthCm: 280, heightCm: 88 }
const defaultSectionForm: SectionForm = { name: 'Secao 1', levelIndex: 0, positionIndex: 0 }
const defaultProductForm: ProductForm = { name: '', sku: '', brand: '' }
const defaultLayoutForm: LayoutForm = { name: 'Layout principal', widthCm: 720, heightCm: 480 }


function groupSectionsByLevel(sections: ShelfSection[]) {
  const groups = new Map<number, ShelfSection[]>()

  for (const section of sections) {
    const current = groups.get(section.levelIndex) ?? []
    current.push(section)
    groups.set(section.levelIndex, current)
  }

  return Array.from(groups.entries())
    .sort(([levelA], [levelB]) => levelB - levelA)
    .map(([levelIndex, levelSections]) => ({
      levelIndex,
      sections: levelSections.sort((sectionA, sectionB) => sectionA.positionIndex - sectionB.positionIndex),
    }))
}
function App() {
  const [screen, setScreen] = useState<Screen>('config')
  const [configTab, setConfigTab] = useState<ConfigTab>('store')
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [sections, setSections] = useState<ShelfSection[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [selectedLayoutId, setSelectedLayoutId] = useState('')
  const [selectedShelfId, setSelectedShelfId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [shelfForm, setShelfForm] = useState<ShelfForm>(defaultShelfForm)
  const [sectionForm, setSectionForm] = useState<SectionForm>(defaultSectionForm)
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm)
  const [layoutForm, setLayoutForm] = useState<LayoutForm>(defaultLayoutForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [draggingShelfId, setDraggingShelfId] = useState('')
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, shelfX: 0, shelfY: 0 })

  const selectedStore = stores.find((store) => store.id === selectedStoreId)
  const selectedLayout = layouts.find((layout) => layout.id === selectedLayoutId)
  const selectedShelf = shelves.find((shelf) => shelf.id === selectedShelfId)
  const selectedSection = sections.find((section) => section.id === selectedSectionId)
  const selectedShelfSections = useMemo(
    () => sections.filter((section) => section.shelfId === selectedShelfId),
    [sections, selectedShelfId],
  )

  function showError(error: unknown) {
    setMessage(error instanceof Error ? error.message : 'Erro inesperado')
  }

  const refreshProducts = useCallback(async () => {
    try {
      const data = await api.products()
      setProducts(data)
      setSelectedProductId((current) => (data.some((product) => product.id === current) ? current : data[0]?.id ?? ''))
    } catch (error) { showError(error) }
  }, [])

  const refreshStores = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.stores()
      setStores(data)
      setSelectedStoreId((current) => (data.some((store) => store.id === current) ? current : data[0]?.id ?? ''))
    } catch (error) { showError(error) }
    finally { setLoading(false) }
  }, [])

  const refreshShelves = useCallback(async (layoutId: string) => {
    try {
      const [shelfData, sectionData] = await Promise.all([api.shelves(layoutId), api.sections()])
      setShelves(shelfData)
      setSections(sectionData)
      setSelectedShelfId((current) => (shelfData.some((shelf) => shelf.id === current) ? current : shelfData[0]?.id ?? ''))
    } catch (error) { showError(error) }
  }, [])

  useEffect(() => {
    api.health().then((data) => {
      setHealth(data)
      setHealthError(null)
    }).catch((error: unknown) => {
      setHealth(null)
      setHealthError(error instanceof Error ? error.message : 'Erro desconhecido')
    })
    refreshStores()
    refreshProducts()
  }, [refreshProducts, refreshStores])

  useEffect(() => {
    if (!selectedStoreId) {
      setLayouts([])
      setSelectedLayoutId('')
      return
    }
    api.layouts(selectedStoreId).then((data) => {
      setLayouts(data)
      setSelectedLayoutId((current) => (data.some((layout) => layout.id === current) ? current : data[0]?.id ?? ''))
    }).catch(showError)
  }, [selectedStoreId])

  useEffect(() => {
    if (!selectedLayoutId) {
      setShelves([])
      setSections([])
      setSelectedShelfId('')
      return
    }
    refreshShelves(selectedLayoutId)
  }, [refreshShelves, selectedLayoutId])

  useEffect(() => {
    if (!selectedLayout) {
      setLayoutForm(defaultLayoutForm)
      return
    }
    setLayoutForm({ name: selectedLayout.name, widthCm: selectedLayout.widthCm, heightCm: selectedLayout.heightCm })
  }, [selectedLayout])

  useEffect(() => {
    if (!selectedShelf) {
      setShelfForm(defaultShelfForm)
      setSelectedSectionId('')
      return
    }
    setShelfForm({
      name: selectedShelf.name,
      positionXCm: selectedShelf.positionXCm,
      positionYCm: selectedShelf.positionYCm,
      widthCm: selectedShelf.widthCm,
      heightCm: selectedShelf.heightCm,
    })
  }, [selectedShelf])

  useEffect(() => {
    if (!selectedSection) {
      setSectionForm({ ...defaultSectionForm, positionIndex: selectedShelfSections.length })
      return
    }
    setSectionForm({ name: selectedSection.name, levelIndex: selectedSection.levelIndex, positionIndex: selectedSection.positionIndex })
  }, [selectedSection, selectedShelfSections.length])

  async function createStarterData() {
    try {
      const store = await api.createStore({ name: 'Mercado Central', description: 'Unidade principal' })
      const layout = await api.createLayout({ storeId: store.id, ...defaultLayoutForm })
      await api.createShelf({ layoutId: layout.id, ...defaultShelfForm })
      setMessage('Dados iniciais criados.')
      await refreshStores()
    } catch (error) { showError(error) }
  }

  async function saveLayoutSize() {
    if (!selectedStoreId || !selectedLayout) return
    try {
      await api.updateLayout(selectedLayout.id, { storeId: selectedStoreId, ...layoutForm })
      const data = await api.layouts(selectedStoreId)
      setLayouts(data)
      setMessage('Tamanho da loja salvo.')
    } catch (error) { showError(error) }
  }

  async function createShelf() {
    if (!selectedLayoutId) return
    try {
      const shelf = await api.createShelf({ layoutId: selectedLayoutId, ...defaultShelfForm })
      setSelectedShelfId(shelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira criada.')
    } catch (error) { showError(error) }
  }

  async function saveShelf() {
    if (!selectedLayoutId || !selectedShelf) return
    try {
      const shelf = await api.updateShelf(selectedShelf.id, { layoutId: selectedLayoutId, ...shelfForm })
      setSelectedShelfId(shelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira salva.')
    } catch (error) { showError(error) }
  }

  async function deleteShelf() {
    if (!selectedLayoutId || !selectedShelf) return
    try {
      await api.deleteShelf(selectedShelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira removida.')
    } catch (error) { showError(error) }
  }

  async function saveSection() {
    if (!selectedShelf) return
    try {
      const body = { shelfId: selectedShelf.id, ...sectionForm }
      const section = selectedSection ? await api.updateSection(selectedSection.id, body) : await api.createSection(body)
      setSelectedSectionId(section.id)
      await refreshShelves(selectedLayoutId)
      setMessage(selectedSection ? 'Secao salva.' : 'Secao criada.')
    } catch (error) { showError(error) }
  }

  async function deleteSection() {
    if (!selectedSection) return
    try {
      await api.deleteSection(selectedSection.id)
      setSelectedSectionId('')
      await refreshShelves(selectedLayoutId)
      setMessage('Secao removida.')
    } catch (error) { showError(error) }
  }

  async function createProduct() {
    if (!productForm.name.trim()) return
    try {
      const product = await api.createProduct({
        name: productForm.name.trim(),
        sku: productForm.sku.trim() || undefined,
        brand: productForm.brand.trim() || undefined,
      })
      setProductForm(defaultProductForm)
      await refreshProducts()
      setSelectedProductId(product.id)
      setMessage('Produto criado.')
    } catch (error) { showError(error) }
  }

  async function linkProductToSection() {
    if (!selectedProductId || !selectedSectionId) return
    try {
      await api.createProductLocation({ productId: selectedProductId, shelfSectionId: selectedSectionId })
      setMessage('Produto vinculado a secao.')
    } catch (error) { showError(error) }
  }

  async function searchProduct() {
    if (!searchQuery.trim()) return
    try {
      const results = await api.searchProducts(searchQuery.trim())
      setSearchResults(results)
      setMessage(results.length ? 'Busca concluida.' : 'Nenhum produto encontrado.')
    } catch (error) { showError(error) }
  }

  function startShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (configTab !== 'shelves') return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedShelfId(shelf.id)
    setDraggingShelfId(shelf.id)
    dragStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, shelfX: shelf.positionXCm, shelfY: shelf.positionYCm }
  }

  function moveShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (draggingShelfId !== shelf.id) return
    const deltaX = Math.round(event.clientX - dragStartRef.current.pointerX)
    const deltaY = Math.round(event.clientY - dragStartRef.current.pointerY)
    setShelfForm((current) => ({ ...current, positionXCm: Math.max(0, dragStartRef.current.shelfX + deltaX), positionYCm: Math.max(0, dragStartRef.current.shelfY + deltaY) }))
  }

  async function finishShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (draggingShelfId !== shelf.id) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDraggingShelfId('')
    const deltaX = Math.round(event.clientX - dragStartRef.current.pointerX)
    const deltaY = Math.round(event.clientY - dragStartRef.current.pointerY)
    try {
      await api.updateShelf(shelf.id, { layoutId: shelf.layoutId, name: shelf.name, positionXCm: Math.max(0, dragStartRef.current.shelfX + deltaX), positionYCm: Math.max(0, dragStartRef.current.shelfY + deltaY), widthCm: shelf.widthCm, heightCm: shelf.heightCm })
      await refreshShelves(selectedLayoutId)
      setMessage('Posicao salva.')
    } catch (error) { showError(error) }
  }

  function updateShelfField(field: keyof ShelfForm, value: string) {
    setShelfForm((current) => ({ ...current, [field]: field === 'name' ? value : Number(value) }))
  }

  function updateSectionField(field: keyof SectionForm, value: string) {
    setSectionForm((current) => ({ ...current, [field]: field === 'name' ? value : Number(value) }))
  }

  function renderContextPanel(readOnly = false) {
    return <aside className="sidebar"><div className="brand-block"><span className="brand-mark">MM</span><div><h1>Market Map</h1><p>{screen === 'config' ? 'Configuracao' : 'Busca'}</p></div></div><section className="panel-section"><span className="section-label">Loja</span><select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} disabled={readOnly}><option value="">Selecione</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></section><section className="panel-section"><span className="section-label">Layout</span><select value={selectedLayoutId} onChange={(event) => setSelectedLayoutId(event.target.value)} disabled={readOnly}><option value="">Selecione</option>{layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></section>{screen === 'config' ? <button className="secondary-action" onClick={createStarterData} type="button">Criar dados iniciais</button> : null}</aside>
  }

  function renderMap() {
    if (loading) return <p className="empty-state">Carregando editor...</p>
    if (!selectedLayout) return <p className="empty-state">Crie ou selecione uma loja e um layout.</p>
    return <div className="map-grid" style={{ width: selectedLayout.widthCm, height: selectedLayout.heightCm }}>{shelves.map((shelf) => <button className={shelf.id === selectedShelfId ? 'map-shelf selected' : 'map-shelf'} key={shelf.id} onClick={() => setSelectedShelfId(shelf.id)} onPointerDown={(event) => startShelfDrag(event, shelf)} onPointerMove={(event) => moveShelfDrag(event, shelf)} onPointerUp={(event) => finishShelfDrag(event, shelf)} style={{ left: shelf.id === selectedShelfId ? shelfForm.positionXCm : shelf.positionXCm, top: shelf.id === selectedShelfId ? shelfForm.positionYCm : shelf.positionYCm, width: shelf.id === selectedShelfId ? shelfForm.widthCm : shelf.widthCm, height: shelf.id === selectedShelfId ? shelfForm.heightCm : shelf.heightCm }} type="button"><span>{shelf.name}</span><div className="section-levels">{groupSectionsByLevel(sections.filter((section) => section.shelfId === shelf.id)).map((level) => <div className="section-level" key={level.levelIndex}>{level.sections.map((section) => <i className={section.id === selectedSectionId ? 'section-active' : ''} key={section.id}>{section.name}</i>)}</div>)}</div></button>)}</div>
  }

  return <main className="app-shell"><nav className="app-nav"><button className={screen === 'config' ? 'nav-active' : ''} onClick={() => setScreen('config')} type="button">Configuracao</button><button className={screen === 'search' ? 'nav-active' : ''} onClick={() => setScreen('search')} type="button">Busca</button><span className={health ? 'api-status online' : 'api-status offline'}>{health ? `Backend ${health.status}` : `Backend indisponivel${healthError ? `: ${healthError}` : ''}`}</span></nav>{screen === 'config' ? <><div className="tabs"><button className={configTab === 'store' ? 'tab-active' : ''} onClick={() => setConfigTab('store')} type="button">Loja</button><button className={configTab === 'shelves' ? 'tab-active' : ''} onClick={() => setConfigTab('shelves')} type="button">Prateleiras</button><button className={configTab === 'link-products' ? 'tab-active' : ''} onClick={() => setConfigTab('link-products')} type="button">Vincular Produtos</button><button className={configTab === 'products' ? 'tab-active' : ''} onClick={() => setConfigTab('products')} type="button">Produtos</button></div><section className="screen-grid">{renderContextPanel()}{configTab === 'store' ? <section className="workspace"><header className="topbar"><div><span className="section-label">Tamanho da loja</span><h2>{selectedLayout?.name ?? 'Nenhum layout'}</h2></div><button className="primary-action" onClick={saveLayoutSize} disabled={!selectedLayout} type="button">Salvar tamanho</button></header><div className="editor-panel"><div className="form-grid"><label>Nome do layout<input value={layoutForm.name} onChange={(event) => setLayoutForm((current) => ({ ...current, name: event.target.value }))} /></label><label>Largura<input min="1" type="number" value={layoutForm.widthCm} onChange={(event) => setLayoutForm((current) => ({ ...current, widthCm: Number(event.target.value) }))} /></label><label>Altura<input min="1" type="number" value={layoutForm.heightCm} onChange={(event) => setLayoutForm((current) => ({ ...current, heightCm: Number(event.target.value) }))} /></label></div><p>{selectedStore ? `Configurando ${selectedStore.name}.` : 'Selecione uma loja.'}</p></div></section> : null}{configTab === 'shelves' ? <><section className="workspace"><header className="topbar"><h2>Prateleiras</h2><button className="primary-action" onClick={createShelf} disabled={!selectedLayoutId} type="button">Adicionar prateleira</button></header><div className="map-stage">{renderMap()}</div></section><aside className="properties"><span className="section-label">Prateleira</span><h2>{selectedShelf?.name ?? 'Nenhuma'}</h2>{selectedShelf ? <><div className="form-grid"><label>Nome<input value={shelfForm.name} onChange={(event) => updateShelfField('name', event.target.value)} /></label><label>X<input min="0" type="number" value={shelfForm.positionXCm} onChange={(event) => updateShelfField('positionXCm', event.target.value)} /></label><label>Y<input min="0" type="number" value={shelfForm.positionYCm} onChange={(event) => updateShelfField('positionYCm', event.target.value)} /></label><label>Largura<input min="1" type="number" value={shelfForm.widthCm} onChange={(event) => updateShelfField('widthCm', event.target.value)} /></label><label>Altura<input min="1" type="number" value={shelfForm.heightCm} onChange={(event) => updateShelfField('heightCm', event.target.value)} /></label></div><div className="button-row"><button className="primary-action" onClick={saveShelf} type="button">Salvar</button><button className="danger-action" onClick={deleteShelf} type="button">Remover</button></div><section className="panel-section"><span className="section-label">Secoes</span><div className="section-list">{selectedShelfSections.map((section) => <button className={section.id === selectedSectionId ? 'active-chip' : ''} key={section.id} onClick={() => setSelectedSectionId(section.id)} type="button">{section.name}</button>)}</div><div className="form-grid compact-form"><label>Nome<input value={sectionForm.name} onChange={(event) => updateSectionField('name', event.target.value)} /></label><label>Nivel<input min="0" type="number" value={sectionForm.levelIndex} onChange={(event) => updateSectionField('levelIndex', event.target.value)} /></label><label>Posicao<input min="0" type="number" value={sectionForm.positionIndex} onChange={(event) => updateSectionField('positionIndex', event.target.value)} /></label></div><div className="button-row"><button className="secondary-action" onClick={() => { setSelectedSectionId(''); setSectionForm({ ...defaultSectionForm, positionIndex: selectedShelfSections.length }) }} type="button">Nova secao</button><button className="primary-action" onClick={saveSection} type="button">Salvar secao</button><button className="danger-action" onClick={deleteSection} disabled={!selectedSection} type="button">Remover</button></div></section></> : <p className="empty-state compact">Selecione uma prateleira.</p>}</aside></> : null}{configTab === 'link-products' ? <section className="workspace wide"><header className="topbar"><h2>Vincular produtos</h2><button className="primary-action" onClick={linkProductToSection} disabled={!selectedProductId || !selectedSectionId} type="button">Vincular</button></header><div className="editor-panel split-panel"><section><span className="section-label">Produto</span><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}><option value="">Selecione</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></section><section><span className="section-label">Secao</span><div className="readonly-map">{renderMap()}</div><div className="section-list">{sections.map((section) => <button className={section.id === selectedSectionId ? 'active-chip' : ''} key={section.id} onClick={() => setSelectedSectionId(section.id)} type="button">{section.name}</button>)}</div></section></div></section> : null}{configTab === 'products' ? <section className="workspace wide"><header className="topbar"><h2>Produtos</h2><button className="primary-action" onClick={createProduct} disabled={!productForm.name.trim()} type="button">Adicionar produto</button></header><div className="editor-panel split-panel"><section><div className="form-grid"><label>Nome<input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label><label>SKU<input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} /></label><label>Marca<input value={productForm.brand} onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))} /></label></div></section><section><span className="section-label">Cadastrados</span><div className="product-list">{products.map((product) => <article key={product.id}><strong>{product.name}</strong><span>{product.brand ?? 'Sem marca'} · {product.sku ?? 'Sem SKU'}</span></article>)}</div></section></div></section> : null}</section></> : <><section className="screen-grid search-screen">{renderContextPanel(true)}<section className="workspace wide"><header className="topbar"><div><span className="section-label">Busca</span><h2>Localizar produto</h2></div><div className="search-box"><input placeholder="Nome, SKU ou marca" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void searchProduct() }} /><button className="primary-action" onClick={searchProduct} type="button">Buscar</button></div></header><div className="search-results-list">{searchResults.map((result) => <article key={`${result.productId}-${result.location.shelfSectionId}`}><strong>{result.productName}</strong><span>{result.brand ?? 'Sem marca'} · {result.sku ?? 'Sem SKU'}</span><p>{result.location.storeName} / {result.location.layoutName} / {result.location.shelfName} / {result.location.shelfSectionName}</p><small>Nivel {result.location.levelIndex}, posicao {result.location.positionIndex}</small></article>)}{!searchResults.length ? <p className="empty-state">Digite um termo para buscar produtos. O mapa entra aqui em uma etapa futura.</p> : null}</div></section></section></>}{message ? <p className="global-message">{message}</p> : null}</main>
}

export default App


