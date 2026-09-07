import type { Layout, LayoutVertex } from '../services/api'

export function rectangle(width: number, height: number): LayoutVertex[] {
  return [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }]
}

export function layoutBoundary(layout: Pick<Layout, 'widthCm' | 'heightCm' | 'boundary'>) {
  return layout.boundary?.length ? layout.boundary : rectangle(layout.widthCm, layout.heightCm)
}

export function polygonPoints(points: LayoutVertex[]) {
  return points.map(p => `${p.x},${p.y}`).join(' ')
}

export function polygonArea(points: LayoutVertex[]) {
  return Math.abs(points.reduce((area, a, index) => {
    const b = points[(index + 1) % points.length]
    return area + a.x * b.y - b.x * a.y
  }, 0)) / 2
}

export function presetShape(shape: 'rectangle' | 'L' | 'U', width: number, height: number): LayoutVertex[] {
  const thirdX = Math.round(width / 3), thirdY = Math.round(height / 3)
  if (shape === 'L') return [{ x: 0, y: 0 }, { x: thirdX, y: 0 }, { x: thirdX, y: height - thirdY }, { x: width, y: height - thirdY }, { x: width, y: height }, { x: 0, y: height }]
  if (shape === 'U') return [{ x: 0, y: 0 }, { x: thirdX, y: 0 }, { x: thirdX, y: height - thirdY }, { x: width - thirdX, y: height - thirdY }, { x: width - thirdX, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }]
  return rectangle(width, height)
}
function cross(a: LayoutVertex, b: LayoutVertex, c: LayoutVertex) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function contains(polygon: LayoutVertex[], p: LayoutVertex) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i]
    if (cross(a, b, p) === 0 && p.x >= Math.min(a.x, b.x) && p.x <= Math.max(a.x, b.x) && p.y >= Math.min(a.y, b.y) && p.y <= Math.max(a.y, b.y)) return true
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export function rectangleFits(polygon: LayoutVertex[], x: number, y: number, width: number, height: number) {
  const corners = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }]
  if (corners.some(p => !contains(polygon, p))) return false
  return polygon.every((a, i) => {
    const b = polygon[(i + 1) % polygon.length]
    if (a.x > x && a.x < x + width && a.y > y && a.y < y + height) return false
    return corners.every((c, j) => {
      const d = corners[(j + 1) % corners.length]
      return !(cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0)
    })
  })
}

/** Find an initial footprint inside an irregular floor; dimensions remain editable. */
export function initialShelfPlacement(layout: Layout) {
  const polygon = layoutBoundary(layout)
  for (const [widthCm, heightCm] of [[280, 88], [120, 60], [40, 40]]) {
    const xs = new Set([48, 20, Math.round((layout.widthCm - widthCm) / 2)])
    const ys = new Set([48, 20, Math.round((layout.heightCm - heightCm) / 2)])
    polygon.forEach(p => {
      xs.add(p.x + 20); xs.add(p.x - widthCm - 20)
      ys.add(p.y + 20); ys.add(p.y - heightCm - 20)
    })
    for (let i = 1; i < 20; i++) {
      xs.add(Math.round(layout.widthCm * i / 20))
      ys.add(Math.round(layout.heightCm * i / 20))
    }
    for (const positionYCm of ys) for (const positionXCm of xs) {
      if (positionXCm < 0 || positionYCm < 0 || positionXCm + widthCm > layout.widthCm || positionYCm + heightCm > layout.heightCm) continue
      if (rectangleFits(polygon, positionXCm, positionYCm, widthCm, heightCm)) return { positionXCm, positionYCm, widthCm, heightCm }
    }
  }
  return null
}

export function pointHasClearance(polygon: LayoutVertex[], point: LayoutVertex, margin = 20) {
  if (!contains(polygon, point)) return false
  return polygon.every((a, index) => {
    const b = polygon[(index + 1) % polygon.length]
    const dx = b.x - a.x, dy = b.y - a.y
    const t = dx || dy ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy))) : 0
    return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy) >= margin - 1e-7
  })
}

type Footprint = { positionXCm: number; positionYCm: number; widthCm: number; heightCm: number }
type NavigationPosition = { kind: string; xCm: number; yCm: number; widthCm: number; heightCm: number; id?: string }

export function navigationPositionError(layout: Layout, shelves: Footprint[], elements: NavigationPosition[], draft: NavigationPosition, editing = '') {
  const polygon = layoutBoundary(layout)
  if (![draft.xCm, draft.yCm, draft.widthCm, draft.heightCm].every(Number.isSafeInteger)) return 'Informe coordenadas e dimensões inteiras.'
  if (draft.kind === 'OBSTACLE') {
    if (draft.widthCm <= 0 || draft.heightCm <= 0 || !rectangleFits(polygon, draft.xCm, draft.yCm, draft.widthCm, draft.heightCm))
      return 'O obstáculo precisa ficar inteiramente dentro do contorno salvo da loja.'
    const blocked = elements.some(e => e.id !== editing && e.kind !== 'OBSTACLE' &&
      e.xCm > draft.xCm - 20 && e.xCm < draft.xCm + draft.widthCm + 20 && e.yCm > draft.yCm - 20 && e.yCm < draft.yCm + draft.heightCm + 20)
    return blocked ? 'O obstáculo bloqueia um terminal ou ponto de acesso.' : ''
  }
  if (!pointHasClearance(polygon, { x: draft.xCm, y: draft.yCm }))
    return 'Posição inválida: o ponto deve ficar dentro do contorno salvo, a pelo menos 20 cm das paredes.'
  const blocks = [...shelves, ...elements.filter(e => e.kind === 'OBSTACLE' && e.id !== editing).map(e => ({
    positionXCm: e.xCm, positionYCm: e.yCm, widthCm: e.widthCm, heightCm: e.heightCm,
  }))]
  if (blocks.some(b => draft.xCm > b.positionXCm - 20 && draft.xCm < b.positionXCm + b.widthCm + 20 &&
    draft.yCm > b.positionYCm - 20 && draft.yCm < b.positionYCm + b.heightCm + 20))
    return 'Posição inválida: mantenha pelo menos 20 cm de distância das prateleiras e obstáculos.'
  return ''
}
