import { api } from '../../services/api'
import { navigationPositionError } from '../../lib/layoutGeometry'
import { useEffect, useState } from 'react'
import { useMarketData } from '../../app/useMarketData'
import { NavigationMap } from './NavigationMap'
import { bindTerminal, navigationApi, readTerminalId, type NavigationElement } from './navigationApi'

type Draft = Omit<NavigationElement, 'id' | 'layoutId'>
const initial: Draft = { kind: 'TERMINAL', name: '', xCm: 30, yCm: 30, widthCm: 0, heightCm: 0, shelfId: null }
const coordinateLabels = { xCm: 'X (cm)', yCm: 'Y (cm)', widthCm: 'Largura (cm)', heightCm: 'Profundidade (cm)' }

export function NavigationSettings() {
  const { selectedLayout } = useMarketData()
  if (!selectedLayout) return <p className="editor-panel">Selecione uma loja e um layout.</p>
  return <SettingsEditor key={selectedLayout.id} />
}

function SettingsEditor() {
  const { selectedLayout, shelves } = useMarketData()
  const [mapLayout, setMapLayout] = useState(selectedLayout!)
  const [mapShelves, setMapShelves] = useState(shelves)
  const [elements, setElements] = useState<NavigationElement[]>([])
  const [draft, setDraft] = useState<Draft>(initial)
  const [editing, setEditing] = useState('')
  const [terminalId, setTerminalId] = useState(readTerminalId)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const layoutId = selectedLayout!.id
  const storeId = selectedLayout!.storeId
  const layoutShelves = mapShelves.filter(shelf => shelf.layoutId === layoutId)
  const visible = elements.filter(e => e.layoutId === layoutId)

  const positionError = navigationPositionError(mapLayout, layoutShelves, visible, draft, editing)
  const savedElement = elements.find(e => e.id === editing)
  const unsavedPosition = savedElement && (savedElement.xCm !== draft.xCm || savedElement.yCm !== draft.yCm)

  useEffect(() => {
    let active = true
    Promise.all([navigationApi.elements(), api.layouts(storeId), api.shelves(layoutId)])
      .then(([data, layouts, freshShelves]) => {
        if (!active) return
        const freshLayout = layouts.find(l => l.id === layoutId)
        if (!freshLayout) throw new Error('Layout não encontrado. Selecione a loja novamente.')
        setElements(data); setMapLayout(freshLayout); setMapShelves(freshShelves); setLoaded(true)
      })
      .catch((error: Error) => { if (active) setMessage(error.message) })
    return () => { active = false }
  }, [layoutId, storeId])

  async function save() {
    if (positionError || !loaded) { setMessage(positionError); return }
    setBusy(true)
    setMessage('')
    try {
      const result = await navigationApi.save({ ...draft, layoutId }, editing || undefined)
      setElements(current => [...current.filter(e => e.id !== result.id), result])
      setEditing(result.id)
      setMessage('Posição salva.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao salvar.') }
    finally { setBusy(false) }
  }

  async function remove() {
    setBusy(true)
    try {
      await navigationApi.remove(editing)
      setElements(current => current.filter(e => e.id !== editing))
      setEditing('')
      setDraft(initial)
      setMessage('Elemento removido.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao remover.') }
    finally { setBusy(false) }
  }

  return <section className="workspace wide">
    <header className="topbar"><div><span className="section-label">Navegação</span><h2>Terminais e caminhos</h2></div></header>
    <div className="navigation-settings editor-panel">
      <section>
        <p className="navigation-help">Cadastre o computador e associe este navegador. O caminho chega automaticamente a uma lateral livre da prateleira; cadastre um acesso se precisar escolher a face de chegada. Clique dentro da área da loja, mantendo 20 cm livres ao redor.</p>
        <p className="navigation-notice" role="status">{loaded ? (mapLayout.boundary?.length ? 'Contorno personalizado salvo carregado.' : 'O formato salvo ainda é retangular. Alterações de contorno só entram em vigor após salvar em Loja.') : 'Carregando mapa salvo…'}</p>
        {message && <p className="navigation-notice" role="status">{message}</p>}
        {loaded && positionError && <p className="navigation-notice validation-error" role="alert">{positionError}</p>}
        <NavigationMap layout={mapLayout} shelves={layoutShelves} elements={visible} terminalId={terminalId} draft={loaded && !positionError ? { x: draft.xCm, y: draft.yCm } : undefined} onPosition={busy || !loaded ? undefined : point => {
          const candidate = { ...draft, xCm: point.x, yCm: point.y }
          const problem = navigationPositionError(mapLayout, layoutShelves, visible, candidate, editing)
          if (problem) { setMessage(problem); return }
          setDraft(candidate); setMessage('Prévia da posição. Clique em Salvar elemento para aplicar.')
        }} />
        <div className="navigation-element-list">
          {visible.map(element => <button className={editing === element.id ? 'secondary-action selected-element' : 'secondary-action'} key={element.id} disabled={busy} onClick={() => { setEditing(element.id); setDraft(element); setMessage('') }}>
            {element.kind === 'TERMINAL' ? 'Computador' : element.kind === 'ACCESS' ? 'Acesso' : 'Obstáculo'}: {element.name}{terminalId === element.id ? ' · Este navegador' : ''}
          </button>)}
        </div>
      </section>
      <form className="form-grid navigation-form" onSubmit={event => { event.preventDefault(); void save() }}>
        <h3>{editing ? 'Editar elemento' : 'Novo elemento'}</h3>
        <label>Tipo<select value={draft.kind} disabled={!!editing || busy} onChange={event => setDraft({ ...initial, kind: event.target.value as Draft['kind'], widthCm: event.target.value === 'OBSTACLE' ? 50 : 0, heightCm: event.target.value === 'OBSTACLE' ? 50 : 0 })}><option value="TERMINAL">Computador de busca</option><option value="ACCESS">Acesso da prateleira</option><option value="OBSTACLE">Obstáculo</option></select></label>
        <label>Nome<input required maxLength={120} value={draft.name} disabled={busy} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
        {draft.kind === 'ACCESS' && <label>Prateleira<select required value={draft.shelfId ?? ''} disabled={busy} onChange={event => setDraft({ ...draft, shelfId: event.target.value })}><option value="">Selecione</option>{layoutShelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
        {(Object.keys(coordinateLabels) as (keyof typeof coordinateLabels)[]).filter(field => draft.kind === 'OBSTACLE' || field === 'xCm' || field === 'yCm').map(field => <label key={field}>{coordinateLabels[field]}<input type="number" min={field === 'xCm' || field === 'yCm' ? 0 : 1} step="1" required disabled={busy} value={draft[field]} onChange={event => setDraft({ ...draft, [field]: Number(event.target.value) })} /></label>)}
        <button className="primary-action" disabled={busy || !loaded || !!positionError}>{busy ? 'Salvando…' : 'Salvar elemento'}</button>
        {editing && draft.kind === 'TERMINAL' && <button className="secondary-action" type="button" disabled={busy || !!positionError || !!unsavedPosition} onClick={() => {
          try { bindTerminal(editing); setTerminalId(editing); setMessage('Este navegador está associado ao computador selecionado.') }
          catch { setMessage('O navegador não permitiu salvar a associação. Habilite o armazenamento local.') }
        }}>Usar este terminal neste navegador</button>}
        {terminalId && <button className="secondary-action" type="button" disabled={busy} onClick={() => {
          try { bindTerminal(''); setTerminalId(''); setMessage('Associação removida deste navegador.') }
          catch { setMessage('Não foi possível remover a associação.') }
        }}>Desvincular este navegador</button>}
        <div className="button-row"><button type="button" className="secondary-action" disabled={busy} onClick={() => { setEditing(''); setDraft(initial); setMessage('') }}>Novo</button>{editing && <button type="button" className="danger-action" disabled={busy} onClick={() => void remove()}>Remover</button>}</div>
        <p role="status">{message}</p>
      </form>
    </div>
  </section>
}