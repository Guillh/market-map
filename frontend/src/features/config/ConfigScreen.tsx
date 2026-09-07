import { defaultSectionForm } from '../../app/types'
import { useMarketData } from '../../app/useMarketData'
import { ContextSidebar } from '../../components/ContextSidebar'
import { StoreMap } from '../../components/StoreMap'

export function ConfigScreen() {
  const {
    configTab,
    setConfigTab,
    selectedLayout,
    selectedStore,
    selectedShelf,
    selectedSection,
    selectedLayoutId,
    selectedProductId,
    selectedSectionId,
    selectedShelfSections,
    sections,
    products,
    shelfForm,
    sectionForm,
    productForm,
    layoutForm,
    setSelectedSectionId,
    setSelectedProductId,
    setSectionForm,
    setProductForm,
    setLayoutForm,
    saveLayoutSize,
    createShelf,
    saveShelf,
    deleteShelf,
    saveSection,
    deleteSection,
    createProduct,
    linkProductToSection,
    updateShelfField,
    updateSectionField,
  } = useMarketData()

  return (
    <>
      <div className="tabs"><button className={configTab === 'store' ? 'tab-active' : ''} onClick={() => setConfigTab('store')} type="button">Loja</button><button className={configTab === 'shelves' ? 'tab-active' : ''} onClick={() => setConfigTab('shelves')} type="button">Prateleiras</button><button className={configTab === 'link-products' ? 'tab-active' : ''} onClick={() => setConfigTab('link-products')} type="button">Vincular Produtos</button><button className={configTab === 'products' ? 'tab-active' : ''} onClick={() => setConfigTab('products')} type="button">Produtos</button></div>
      <section className="screen-grid">
        <ContextSidebar />
        {configTab === 'store' ? <section className="workspace"><header className="topbar"><div><span className="section-label">Tamanho da loja</span><h2>{selectedLayout?.name ?? 'Nenhum layout'}</h2></div><button className="primary-action" onClick={() => void saveLayoutSize()} disabled={!selectedLayout} type="button">Salvar tamanho</button></header><div className="editor-panel"><div className="form-grid"><label>Nome do layout<input value={layoutForm.name} onChange={(event) => setLayoutForm((current) => ({ ...current, name: event.target.value }))} /></label><label>Largura<input min="1" type="number" value={layoutForm.widthCm} onChange={(event) => setLayoutForm((current) => ({ ...current, widthCm: Number(event.target.value) }))} /></label><label>Altura<input min="1" type="number" value={layoutForm.heightCm} onChange={(event) => setLayoutForm((current) => ({ ...current, heightCm: Number(event.target.value) }))} /></label></div><p>{selectedStore ? `Configurando ${selectedStore.name}.` : 'Selecione uma loja.'}</p></div></section> : null}
        {configTab === 'shelves' ? <><section className="workspace"><header className="topbar"><h2>Prateleiras</h2><button className="primary-action" onClick={() => void createShelf()} disabled={!selectedLayoutId} type="button">Adicionar prateleira</button></header><div className="map-stage"><StoreMap /></div></section><aside className="properties"><span className="section-label">Prateleira</span><h2>{selectedShelf?.name ?? 'Nenhuma'}</h2>{selectedShelf ? <><div className="form-grid"><label>Nome<input value={shelfForm.name} onChange={(event) => updateShelfField('name', event.target.value)} /></label><label>X<input min="0" type="number" value={shelfForm.positionXCm} onChange={(event) => updateShelfField('positionXCm', event.target.value)} /></label><label>Y<input min="0" type="number" value={shelfForm.positionYCm} onChange={(event) => updateShelfField('positionYCm', event.target.value)} /></label><label>Largura<input min="1" type="number" value={shelfForm.widthCm} onChange={(event) => updateShelfField('widthCm', event.target.value)} /></label><label>Altura<input min="1" type="number" value={shelfForm.heightCm} onChange={(event) => updateShelfField('heightCm', event.target.value)} /></label></div><div className="button-row"><button className="primary-action" onClick={() => void saveShelf()} type="button">Salvar</button><button className="danger-action" onClick={() => void deleteShelf()} type="button">Remover</button></div><section className="panel-section"><span className="section-label">Secoes</span><div className="section-list">{selectedShelfSections.map((section) => <button className={section.id === selectedSectionId ? 'active-chip' : ''} key={section.id} onClick={() => setSelectedSectionId(section.id)} type="button">{section.name}</button>)}</div><div className="form-grid compact-form"><label>Nome<input value={sectionForm.name} onChange={(event) => updateSectionField('name', event.target.value)} /></label><label>Nivel<input min="0" type="number" value={sectionForm.levelIndex} onChange={(event) => updateSectionField('levelIndex', event.target.value)} /></label><label>Posicao<input min="0" type="number" value={sectionForm.positionIndex} onChange={(event) => updateSectionField('positionIndex', event.target.value)} /></label></div><div className="button-row"><button className="secondary-action" onClick={() => { setSelectedSectionId(''); setSectionForm({ ...defaultSectionForm, positionIndex: selectedShelfSections.length }) }} type="button">Nova secao</button><button className="primary-action" onClick={() => void saveSection()} type="button">Salvar secao</button><button className="danger-action" onClick={() => void deleteSection()} disabled={!selectedSection} type="button">Remover</button></div></section></> : <p className="empty-state compact">Selecione uma prateleira.</p>}</aside></> : null}
        {configTab === 'link-products' ? <section className="workspace wide"><header className="topbar"><h2>Vincular produtos</h2><button className="primary-action" onClick={() => void linkProductToSection()} disabled={!selectedProductId || !selectedSectionId} type="button">Vincular</button></header><div className="editor-panel split-panel"><section><span className="section-label">Produto</span><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}><option value="">Selecione</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></section><section><span className="section-label">Secao</span><div className="readonly-map"><StoreMap /></div><div className="section-list">{sections.map((section) => <button className={section.id === selectedSectionId ? 'active-chip' : ''} key={section.id} onClick={() => setSelectedSectionId(section.id)} type="button">{section.name}</button>)}</div></section></div></section> : null}
        {configTab === 'products' ? <section className="workspace wide"><header className="topbar"><h2>Produtos</h2><button className="primary-action" onClick={() => void createProduct()} disabled={!productForm.name.trim()} type="button">Adicionar produto</button></header><div className="editor-panel split-panel"><section><div className="form-grid"><label>Nome<input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label><label>SKU<input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} /></label><label>Marca<input value={productForm.brand} onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))} /></label></div></section><section><span className="section-label">Cadastrados</span><div className="product-list">{products.map((product) => <article key={product.id}><strong>{product.name}</strong><span>{product.brand ?? 'Sem marca'} · {product.sku ?? 'Sem SKU'}</span></article>)}</div></section></div></section> : null}
      </section>
    </>
  )
}
