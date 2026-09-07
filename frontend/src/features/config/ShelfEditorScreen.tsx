import { useState } from 'react'
import { useMarketData } from '../../app/useMarketData'
import { StoreMap } from '../../components/StoreMap'
import { ShelfPropertiesForm } from './ShelfPropertiesForm'
import { ShelfSectionsEditor } from './ShelfSectionsEditor'
import './shelfEditor.css'

export function ShelfEditorScreen() {
  const { selectedLayoutId, selectedLayout, selectedShelf, shelves, selectedShelfSections, createShelf, setSelectedShelfId } = useMarketData()
  const [creating, setCreating] = useState(false)
  const availableShelves = shelves.filter(shelf => shelf.layoutId === selectedLayoutId)

  return <section className="workspace wide shelf-editor-screen">
    <header className="shelf-editor-header">
      <div><span className="section-label">Organização da loja</span><h2>Prateleiras e seções</h2><p>Defina o espaço de cada produto, do mapa ao nível da prateleira.</p></div>
      <button className="primary-action" disabled={!selectedLayoutId || creating} onClick={async () => { setCreating(true); try { await createShelf() } finally { setCreating(false) } }} type="button"><span aria-hidden="true">＋</span> {creating ? 'Adicionando…' : 'Adicionar prateleira'}</button>
    </header>
    <div className="shelf-editor-layout">
      <section className="shelf-map-card">
        <header><div><span className="shelf-map-dot" aria-hidden="true" /><strong>Mapa da loja</strong><span className="shelf-count">{availableShelves.length} prateleira(s)</span></div><p>{selectedLayout?.name ?? 'Selecione um layout'}</p></header>
        <div className="shelf-map-toolbar">
          <label htmlFor="shelf-picker">Prateleira selecionada</label>
          <select id="shelf-picker" value={selectedShelf?.id ?? ''} onChange={event => setSelectedShelfId(event.target.value)} disabled={!availableShelves.length}>
            <option value="">Selecione no mapa ou na lista</option>
            {availableShelves.map((shelf, index) => <option key={shelf.id} value={shelf.id}>{index + 1}. {shelf.name}</option>)}
          </select>
        </div>
        <div className="shelf-map-viewport"><StoreMap /></div>
        <footer><span className="shelf-selection-key" aria-hidden="true" /> Clique para selecionar · Arraste para posicionar</footer>
      </section>
      {selectedShelf ? <ShelfInspector key={selectedShelf.id} sectionCount={selectedShelfSections.length} /> :
        <aside className="shelf-inspector shelf-inspector-empty">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="8" y="8" width="32" height="32" rx="5" /><path d="M8 20h32M8 31h32M19 8v12M29 20v11" /></svg>
          <h3>Escolha uma prateleira</h3><p>Selecione no mapa para editar as medidas e organizar suas seções.</p>
        </aside>}
    </div>
  </section>
}

function ShelfInspector({ sectionCount }: { sectionCount: number }) {
  const { selectedShelf, selectedShelfSections } = useMarketData()
  const [tab, setTab] = useState<'shelf' | 'sections'>('shelf')
  const levelCount = new Set(selectedShelfSections.map(section => section.levelIndex)).size
  return <aside className="shelf-inspector">
    <header className="shelf-inspector-heading">
      <div className="shelf-inspector-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 10h18M3 16h18M10 3v7M15 10v6" /></svg></div>
      <div><span className="section-label">Selecionada</span><h3>{selectedShelf?.name}</h3><p>{sectionCount} seções · {levelCount} níveis</p></div>
    </header>
    <div className="shelf-inspector-tabs" role="tablist" aria-label="Configuração da prateleira" onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const next = event.key === 'Home' ? 'shelf' : event.key === 'End' ? 'sections' : tab === 'shelf' ? 'sections' : 'shelf'
      setTab(next)
      event.currentTarget.querySelector<HTMLButtonElement>(next === 'shelf' ? '#shelf-properties-tab' : '#shelf-sections-tab')?.focus()
    }}>
      <button id="shelf-properties-tab" role="tab" tabIndex={tab === 'shelf' ? 0 : -1} aria-selected={tab === 'shelf'} aria-controls="shelf-properties-panel" onClick={() => setTab('shelf')} type="button">Prateleira</button>
      <button id="shelf-sections-tab" role="tab" tabIndex={tab === 'sections' ? 0 : -1} aria-selected={tab === 'sections'} aria-controls="shelf-sections-panel" onClick={() => setTab('sections')} type="button">Seções <span>{sectionCount}</span></button>
    </div>
    <section id="shelf-properties-panel" role="tabpanel" aria-labelledby="shelf-properties-tab" hidden={tab !== 'shelf'}><ShelfPropertiesForm /></section>
    <section id="shelf-sections-panel" role="tabpanel" aria-labelledby="shelf-sections-tab" hidden={tab !== 'sections'}><ShelfSectionsEditor /></section>
  </aside>
}