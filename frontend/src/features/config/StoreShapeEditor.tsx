import { useRef, useState } from 'react'
import { useMarketData } from '../../app/useMarketData'
import { api, type Layout, type LayoutVertex } from '../../services/api'
import { layoutBoundary, polygonArea, polygonPoints, presetShape, rectangleFits } from '../../lib/layoutGeometry'

export function StoreShapeEditor() {
  const { selectedLayout } = useMarketData()
  if (!selectedLayout) return <section className="workspace wide shape-workspace"><p className="editor-panel">Selecione uma loja e um layout.</p></section>
  return <ShapeEditor key={selectedLayout.id} layout={selectedLayout} />
}

function ShapeEditor({ layout }: { layout: Layout }) {
  const { shelves, acceptSavedLayout } = useMarketData()
  const [name, setName] = useState(layout.name)
  const [width, setWidth] = useState(layout.widthCm)
  const [height, setHeight] = useState(layout.heightCm)
  const [vertices, setVertices] = useState<LayoutVertex[]>(() => layoutBoundary(layout))
  const [selected, setSelected] = useState<number | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const dirty = name !== layout.name || width !== layout.widthCm || height !== layout.heightCm || JSON.stringify(vertices) !== JSON.stringify(layoutBoundary(layout))
  const outsideShelves = vertices.length >= 3 ? shelves.filter(s => s.layoutId === layout.id && !rectangleFits(vertices, s.positionXCm, s.positionYCm, s.widthCm, s.heightCm)) : []
  const dragging = useRef<number | null>(null)
  const ignoreClick = useRef(false)
  const canvasWidth = Math.max(1, width), canvasHeight = Math.max(1, height)
  const markerRadius = Math.max(5, Math.min(canvasWidth, canvasHeight) / 65)

  function position(event: React.PointerEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>) {
    const matrix = event.currentTarget.getScreenCTM()
    if (!matrix) return null
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return { x: Math.max(0, Math.min(width, Math.round(point.x))), y: Math.max(0, Math.min(height, Math.round(point.y))) }
  }

  function moveVertex(index: number, point: LayoutVertex) {
    setVertices(current => current.map((v, i) => i === index ? point : v))
    setMessage('')
  }

  function reset() {
    setName(layout.name); setWidth(layout.widthCm); setHeight(layout.heightCm)
    setVertices(layoutBoundary(layout)); setSelected(null); setDrawing(false); setMessage('')
  }

  async function save() {
    setBusy(true); setMessage('')
    try {
      const saved = await api.updateLayout(layout.id, { storeId: layout.storeId, name, widthCm: width, heightCm: height, boundary: vertices })
      acceptSavedLayout(saved)
      setMessage('Formato da loja salvo. Os mapas e caminhos já usam este contorno.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o contorno.') }
    finally { setBusy(false) }
  }

  return <section className="workspace wide shape-workspace">
    <header className="topbar"><div><span className="section-label">Loja</span><h2>Formato e dimensões</h2></div><button className="primary-action" type="submit" form="store-shape-form" disabled={busy || drawing || vertices.length < 3}>Salvar formato da loja</button></header>
    {dirty && <p className="shape-save-notice">Prévia não salva: as outras telas ainda usam o contorno salvo anteriormente. Salve o formato para aplicá-lo.</p>}
    {outsideShelves.length > 0 && <p className="shape-save-notice validation-error">O desenho deixa {outsideShelves.length} prateleira(s) fora da loja. Ajuste o contorno ou reposicione as prateleiras antes de salvar.</p>}
    {message && <p className="shape-save-notice" role="status">{message}</p>}
    <form id="store-shape-form" className="store-shape-editor editor-panel" onSubmit={event => { event.preventDefault(); void save() }}>
      <section className="shape-preview">
        <div className="shape-presets"><span>Começar com:</span>{(['rectangle', 'L', 'U'] as const).map(shape => <button className="secondary-action" type="button" key={shape} disabled={busy || width < 3 || height < 3} onClick={() => { setVertices(presetShape(shape, width, height)); setSelected(null); setDrawing(false); setMessage('Prévia alterada. Salve para aplicar.') }}>{shape === 'rectangle' ? 'Retângulo' : `Formato ${shape}`}</button>)}</div>
        <p className="navigation-help">Arraste os pontos para ajustar as paredes ou edite suas coordenadas. Para um formato livre, desenhe os cantos em sequência e feche o contorno. A área escura fica fora da loja.</p>
        <svg className="shape-canvas" viewBox={`-20 -20 ${canvasWidth + 40} ${canvasHeight + 40}`} role="img" aria-label="Editor do contorno da loja. As coordenadas também podem ser editadas no formulário."
          onPointerDown={event => {
            if (busy) return
            const index = (event.target as SVGElement).getAttribute('data-vertex')
            if (index === null) return
            dragging.current = Number(index); setSelected(Number(index))
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={event => { if (dragging.current !== null) { const p = position(event); if (p) moveVertex(dragging.current, p) } }}
          onPointerUp={event => { if (dragging.current !== null) { dragging.current = null; ignoreClick.current = true; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) } }}
          onPointerCancel={() => { dragging.current = null }}
          onClick={event => {
            if (ignoreClick.current) { ignoreClick.current = false; return }
            if (busy) return
            const point = position(event)
            if (!point) return
            if (drawing && vertices.length < 60) setVertices(current => [...current, point])
            else if (selected !== null) moveVertex(selected, point)
          }}>
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#141618" stroke="#555b61" strokeDasharray="6 4" />
          {vertices.length >= 3 && <polygon points={polygonPoints(vertices)} fill="#364036" stroke="var(--primary)" strokeWidth="2" fillOpacity={drawing ? .35 : 1} />}
          {drawing && <polyline points={polygonPoints(vertices)} fill="none" stroke="var(--primary)" strokeWidth="3" />}
          {shelves.filter(s => s.layoutId === layout.id).map(s => <g key={s.id}><rect x={s.positionXCm} y={s.positionYCm} width={s.widthCm} height={s.heightCm} fill="#8a9399" opacity=".35" /><title>{s.name}</title></g>)}
          {vertices.map((v, index) => <g key={index}>
            <circle data-vertex={index} cx={v.x} cy={v.y} r={markerRadius} fill={selected === index ? '#fff' : '#b0df55'} stroke="#202224" strokeWidth="2" />
            <text x={v.x + markerRadius + 2} y={v.y + markerRadius + 2} fill="#fff" fontSize={markerRadius * 1.8} pointerEvents="none">{index + 1}</text>
          </g>)}
        </svg>
        <div className="shape-actions">
          <button className="secondary-action" type="button" disabled={busy} onClick={() => { setVertices([]); setSelected(null); setDrawing(true); setMessage('Clique em cada canto, na ordem do contorno.') }}>Desenhar do zero</button>
          {drawing && <button className="primary-action" type="button" disabled={vertices.length < 3 || busy} onClick={() => { setDrawing(false); setSelected(null) }}>Fechar contorno</button>}
          <button className="secondary-action" type="button" disabled={busy} onClick={reset}>Restaurar salvo</button>
        </div>
        <p className="shape-area">Área da prévia: {(polygonArea(vertices) / 10000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m² · {vertices.length}/60 vértices</p>
        <p className="navigation-help">As dimensões definem o espaço máximo do desenho. Prateleiras aparecem em cinza para ajudar a ajustar o contorno sem deixá-las fora da loja.</p>
      </section>
      <section className="shape-properties">
        <div className="form-grid">
          <label>Nome do layout<input required maxLength={120} value={name} disabled={busy} onChange={event => setName(event.target.value)} /></label>
          <label>Largura máxima (cm)<input required min="1" step="1" type="number" disabled={busy} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
          <label>Profundidade máxima (cm)<input required min="1" step="1" type="number" disabled={busy} value={height} onChange={event => setHeight(Number(event.target.value))} /></label>
        </div>
        <h3>Cantos da loja</h3>
        <p className="navigation-help">Coordenadas em centímetros. O último ponto se conecta ao primeiro.</p>
        <div className="shape-vertex-list">
          {vertices.map((vertex, index) => <fieldset key={index} className={selected === index ? 'shape-vertex active-vertex' : 'shape-vertex'}>
            <legend>Ponto {index + 1}</legend>
            <label>X<input aria-label={`X do ponto ${index + 1}`} required type="number" min="0" max={width} step="1" disabled={busy} value={vertex.x} onFocus={() => setSelected(index)} onChange={event => moveVertex(index, { ...vertex, x: Number(event.target.value) })} /></label>
            <label>Y<input aria-label={`Y do ponto ${index + 1}`} required type="number" min="0" max={height} step="1" disabled={busy} value={vertex.y} onFocus={() => setSelected(index)} onChange={event => moveVertex(index, { ...vertex, y: Number(event.target.value) })} /></label>
            <button className="secondary-action" type="button" aria-label={`Inserir ponto depois do ponto ${index + 1}`} disabled={busy || vertices.length >= 60} onClick={() => {
              const next = vertices[(index + 1) % vertices.length]
              const midpoint = { x: Math.round((vertex.x + next.x) / 2), y: Math.round((vertex.y + next.y) / 2) }
              setVertices(current => [...current.slice(0, index + 1), midpoint, ...current.slice(index + 1)]); setSelected(index + 1)
              setMessage('Ponto inserido. Arraste-o para criar um novo canto.')
            }}>+</button>
            <button className="danger-action" type="button" aria-label={`Remover ponto ${index + 1}`} disabled={busy || (!drawing && vertices.length <= 3)} onClick={() => { setVertices(current => current.filter((_, i) => i !== index)); setSelected(null) }}>×</button>
          </fieldset>)}
        </div>
        <button className="primary-action shape-save" type="submit" disabled={busy || drawing || vertices.length < 3}>{busy ? 'Salvando…' : 'Salvar formato da loja'}</button>
        <p className="shape-feedback" role="status">{message}</p>
      </section>
    </form>
  </section>
}