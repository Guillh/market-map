export type Store = {
  id: string
  name: string
  description: string | null
  createdAt: string
}

export type LayoutVertex = { x: number; y: number }

export type Layout = {
  id: string
  storeId: string
  name: string
  widthCm: number
  heightCm: number
  boundary?: LayoutVertex[]
  createdAt: string
}

export type Shelf = {
  id: string
  layoutId: string
  name: string
  positionXCm: number
  positionYCm: number
  widthCm: number
  heightCm: number
  createdAt: string
}

export type ShelfSection = {
  id: string
  shelfId: string
  name: string
  levelIndex: number
  positionIndex: number
  createdAt: string
}

export type Product = {
  id: string
  name: string
  sku: string | null
  brand: string | null
  createdAt: string
}

export type ProductLocation = {
  id: string
  productId: string
  shelfSectionId: string
  createdAt: string
}

export type InventoryItem = {
  id: string
  productLocationId: string
  productId: string
  productName: string
  productSku: string | null
  shelfSectionId: string
  quantity: number
  minimumQuantity: number
  belowMinimum: boolean
  createdAt: string
  updatedAt: string
}

export type InventoryLot = {
  id: string
  inventoryItemId: string
  productLocationId: string
  productId: string
  productName: string
  lotCode: string
  expirationDate: string | null
  quantity: number
  createdAt: string
  updatedAt: string
}

export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export type InventoryMovement = {
  id: string
  productLocationId: string
  productId: string
  productName: string
  type: InventoryMovementType
  quantity: number
  reason: string | null
  createdAt: string
}

export type ProductSearchResult = {
  productId: string
  productName: string
  sku: string | null
  brand: string | null
  location: {
    storeId: string
    storeName: string
    layoutId: string
    layoutName: string
    layoutWidthCm: number
    layoutHeightCm: number
    shelfId: string
    shelfName: string
    shelfPositionXCm: number
    shelfPositionYCm: number
    shelfWidthCm: number
    shelfHeightCm: number
    shelfSectionId: string
    shelfSectionName: string
    levelIndex: number
    positionIndex: number
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(detail?.message ?? detail?.detail ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>('/api/health'),
  stores: () => request<Store[]>('/api/stores'),
  createStore: (body: { name: string; description?: string }) =>
    request<Store>('/api/stores', { method: 'POST', body }),
  layouts: (storeId?: string) =>
    request<Layout[]>(storeId ? `/api/layouts?storeId=${storeId}` : '/api/layouts'),
  createLayout: (body: { storeId: string; name: string; widthCm: number; heightCm: number; boundary?: LayoutVertex[] }) =>
    request<Layout>('/api/layouts', { method: 'POST', body }),
  updateLayout: (id: string, body: { storeId: string; name: string; widthCm: number; heightCm: number; boundary?: LayoutVertex[] }) =>
    request<Layout>(`/api/layouts/${id}`, { method: 'PUT', body }),
  shelves: (layoutId?: string) =>
    request<Shelf[]>(layoutId ? `/api/shelves?layoutId=${layoutId}` : '/api/shelves'),
  createShelf: (body: Omit<Shelf, 'id' | 'createdAt'>) =>
    request<Shelf>('/api/shelves', { method: 'POST', body }),
  updateShelf: (id: string, body: Omit<Shelf, 'id' | 'createdAt'>) =>
    request<Shelf>(`/api/shelves/${id}`, { method: 'PUT', body }),
  deleteShelf: (id: string) => request<void>(`/api/shelves/${id}`, { method: 'DELETE' }),
  sections: (shelfId?: string) =>
    request<ShelfSection[]>(shelfId ? `/api/shelf-sections?shelfId=${shelfId}` : '/api/shelf-sections'),
  createSection: (body: { shelfId: string; name: string; levelIndex: number; positionIndex: number }) =>
    request<ShelfSection>('/api/shelf-sections', { method: 'POST', body }),
  updateSection: (id: string, body: { shelfId: string; name: string; levelIndex: number; positionIndex: number }) =>
    request<ShelfSection>(`/api/shelf-sections/${id}`, { method: 'PUT', body }),
  deleteSection: (id: string) => request<void>(`/api/shelf-sections/${id}`, { method: 'DELETE' }),
  products: () => request<Product[]>('/api/products'),
  createProduct: (body: { name: string; sku?: string; brand?: string }) =>
    request<Product>('/api/products', { method: 'POST', body }),
  productLocations: () => request<ProductLocation[]>('/api/product-locations'),
  createProductLocation: (body: { productId: string; shelfSectionId: string }) =>
    request<ProductLocation>('/api/product-locations', { method: 'POST', body }),
  inventoryItems: () => request<InventoryItem[]>('/api/inventory/items'),
  createInventoryItem: (body: { productLocationId: string; quantity: number; minimumQuantity: number }) =>
    request<InventoryItem>('/api/inventory/items', { method: 'POST', body }),
  updateInventoryItem: (id: string, body: { productLocationId: string; quantity: number; minimumQuantity: number }) =>
    request<InventoryItem>(`/api/inventory/items/${id}`, { method: 'PUT', body }),
  inventoryLots: (inventoryItemId?: string) =>
    request<InventoryLot[]>(inventoryItemId ? `/api/inventory/lots?inventoryItemId=${inventoryItemId}` : '/api/inventory/lots'),
  expiringInventoryLots: (days = 30) => request<InventoryLot[]>(`/api/inventory/lots/expiring?days=${days}`),
  createInventoryLot: (body: { inventoryItemId: string; lotCode: string; expirationDate?: string; quantity: number }) =>
    request<InventoryLot>('/api/inventory/lots', { method: 'POST', body }),
  updateInventoryLot: (id: string, body: { inventoryItemId: string; lotCode: string; expirationDate?: string; quantity: number }) =>
    request<InventoryLot>(`/api/inventory/lots/${id}`, { method: 'PUT', body }),
  inventoryMovements: (productLocationId?: string) =>
    request<InventoryMovement[]>(productLocationId ? `/api/inventory/movements?productLocationId=${productLocationId}` : '/api/inventory/movements'),
  createInventoryMovement: (body: { productLocationId: string; type: InventoryMovementType; quantity: number; reason?: string }) =>
    request<InventoryMovement>('/api/inventory/movements', { method: 'POST', body }),
  searchProducts: (query: string) =>
    request<ProductSearchResult[]>(`/api/search/products?query=${encodeURIComponent(query)}`),
}
