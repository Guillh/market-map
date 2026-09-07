import { layoutBoundary, polygonPoints } from '../../lib/layoutGeometry'
import type { Layout, Shelf } from '../../services/api'
import type { NavigationElement, Point, Route } from './navigationApi'

type Props = {
  layout: Layout
  shelves: Shelf[]
  elements: NavigationElement[]
  terminalId?: string
  shelfId?: string
  route?: Route | null
  draft?: Point
  onPosition?: (point: Point) => void
}

export function NavigationMap({ layout, shelves, elements, terminalId, shelfId, route, draft, onPosition }: Props) {
  const fontSize = Math.max(10, Math.min(layout.widthCm, layout.heightCm) / 45)
  const radius = fontSize * .65
  return (
    <div className="navigation-map">
      <svg viewBox={`0 0 ${layout.widthCm} ${layout.heightCm}`} role="img" aria-label={onPosition ? 'Mapa da loja. Clique para posicionar; também é possível digitar X e Y no formulário.' : 'Mapa da loja com prateleiras e caminho até o produto'}
        onClick={onPosition ? (event) => {
          const matrix = event.currentTarget.getScreenCTM()
          if (!matrix) return
          const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
          onPosition({ x: Math.round(point.x), y: Math.round(point.y) })
        } : undefined}>
        <rect width={layout.widthCm} height={layout.heightCm} fill="#101214" /><polygon points={polygonPoints(layoutBoundary(layout))} fill="var(--surface-muted)" stroke="var(--border-strong)" strokeWidth="3" />
        {elements.filter(e => e.kind === 'OBSTACLE').map(e => <g key={e.id}><rect x={e.xCm} y={e.yCm} width={e.widthCm} height={e.heightCm} fill="#666b71" /><title>{e.name}</title></g>)}
        {shelves.map(shelf => <g key={shelf.id}>
          <rect x={shelf.positionXCm} y={shelf.positionYCm} width={shelf.widthCm} height={shelf.heightCm} rx={4} fill={shelf.id === shelfId ? '#688a35' : '#41474c'} stroke={shelf.id === shelfId ? '#b0df55' : '#697077'} strokeWidth={2} />
          <text x={shelf.positionXCm + shelf.widthCm / 2} y={shelf.positionYCm + shelf.heightCm / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={Math.min(fontSize,shelf.widthCm / Math.max(shelf.name.length,1)*1.5)}>{shelf.name}</text>
        </g>)}
        {route && <polyline points={route.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#b0df55" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />}
        {elements.filter(e => e.kind !== 'OBSTACLE').map(e => <g key={e.id}>
          <circle cx={e.xCm} cy={e.yCm} r={radius} fill={e.kind === 'ACCESS' ? '#d8c38c' : '#70bee8'} stroke="#202224" strokeWidth={2} />
          <title>{e.name}</title>
          {(e.id === terminalId || onPosition) && <text x={e.xCm} y={e.yCm - radius - 5} textAnchor="middle" fill="#f3f4f5" fontSize={fontSize}>{e.id === terminalId ? 'Você está aqui' : e.name}</text>}
        </g>)}
        {route && route.points.length > 0 && <g>
          <circle cx={route.points[route.points.length - 1].x} cy={route.points[route.points.length - 1].y} r={radius} fill="#d8c38c" stroke="#202224" strokeWidth={2} />
          <text x={route.points[route.points.length - 1].x} y={route.points[route.points.length - 1].y - radius - 5} textAnchor="middle" fill="#fff" fontSize={fontSize}>Chegada</text>
        </g>}
        {draft && <circle cx={draft.x} cy={draft.y} r={radius + 3} fill="none" stroke="#fff" strokeWidth={3} />}
      </svg>
      <p className="map-legend">Azul: computador · Bege: acesso · Verde: destino e caminho · Cinza: prateleiras e obstáculos</p>
    </div>
  )
}