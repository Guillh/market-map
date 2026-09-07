import { ShelfEditorScreen } from './ShelfEditorScreen'
import { StoreShapeEditor } from './StoreShapeEditor'
import { NavigationSettings } from '../navigation/NavigationSettings'
import { useMarketData } from '../../app/useMarketData'
import { ContextToolbar } from '../../components/ContextToolbar'
import { StoreMap } from '../../components/StoreMap'

export function ConfigScreen() {
  const {
    configTab,
    selectedProductId,
    selectedSectionId,
    sections,
    products,
    productForm,
    setSelectedSectionId,
    setSelectedProductId,
    setProductForm,
    createProduct,
    linkProductToSection,
  } = useMarketData()

  return (
    <>
      <ContextToolbar />
      <section className="screen-grid">{configTab === 'navigation' ? <NavigationSettings /> : null}
        {configTab === 'store' ? <StoreShapeEditor /> : null}
        {configTab === 'shelves' ? <ShelfEditorScreen /> : null}
        {configTab === 'link-products' ? <section className="workspace wide"><header className="topbar"><h2>Vincular produtos</h2><button className="primary-action" onClick={() => void linkProductToSection()} disabled={!selectedProductId || !selectedSectionId} type="button">Vincular</button></header><div className="editor-panel split-panel"><section><span className="section-label">Produto</span><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}><option value="">Selecione</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></section><section><span className="section-label">Secao</span><div className="readonly-map"><StoreMap /></div><div className="section-list">{sections.map((section) => <button className={section.id === selectedSectionId ? 'active-chip' : ''} key={section.id} onClick={() => setSelectedSectionId(section.id)} type="button">{section.name}</button>)}</div></section></div></section> : null}
        {configTab === 'products' ? <section className="workspace wide"><header className="topbar"><h2>Produtos</h2><button className="primary-action" onClick={() => void createProduct()} disabled={!productForm.name.trim()} type="button">Adicionar produto</button></header><div className="editor-panel split-panel"><section><div className="form-grid"><label>Nome<input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label><label>SKU<input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} /></label><label>Marca<input value={productForm.brand} onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))} /></label></div></section><section><span className="section-label">Cadastrados</span><div className="product-list">{products.map((product) => <article key={product.id}><strong>{product.name}</strong><span>{product.brand ?? 'Sem marca'} · {product.sku ?? 'Sem SKU'}</span></article>)}</div></section></div></section> : null}
      </section>
    </>
  )
}
