export type NavigationElement = {
  id: string
  layoutId: string
  kind: 'TERMINAL' | 'OBSTACLE' | 'ACCESS'
  name: string
  xCm: number
  yCm: number
  widthCm: number
  heightCm: number
  shelfId: string | null
}
export type Point = { x: number; y: number }
export type Route = { points: Point[]; distanceCm: number; automaticAccess?: boolean }

export async function navigationRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch('/api/navigation' + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(error?.message ?? error?.detail ?? 'Não foi possível acessar a navegação. Confira se o backend está atualizado.')
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export const navigationApi = {
  elements: () => navigationRequest<NavigationElement[]>('/elements'),
  save: (element: Omit<NavigationElement, 'id'>, id?: string) =>
    navigationRequest<NavigationElement>('/elements' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', element),
  remove: (id: string) => navigationRequest<void>('/elements/' + id, 'DELETE'),
  route: (terminalId: string, shelfId: string) =>
    navigationRequest<Route>(`/route?terminalId=${encodeURIComponent(terminalId)}&shelfId=${encodeURIComponent(shelfId)}`),
}

const terminalKey = 'market-map.terminal'
export function readTerminalId() {
  try { return localStorage.getItem(terminalKey) ?? '' } catch { return '' }
}
export function bindTerminal(id: string) {
  localStorage.setItem(terminalKey, id)
}