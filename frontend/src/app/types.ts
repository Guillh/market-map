export type HealthStatus = { status: string; timestamp: string }
export type Screen = 'config' | 'search' | 'inventory'
export type ConfigTab = 'store' | 'shelves' | 'link-products' | 'products'
export type ShelfForm = { name: string; positionXCm: number; positionYCm: number; widthCm: number; heightCm: number }
export type SectionForm = { name: string; levelIndex: number; positionIndex: number }
export type ProductForm = { name: string; sku: string; brand: string }
export type LayoutForm = { name: string; widthCm: number; heightCm: number }

export const defaultShelfForm: ShelfForm = { name: 'Nova prateleira', positionXCm: 48, positionYCm: 48, widthCm: 280, heightCm: 88 }
export const defaultSectionForm: SectionForm = { name: 'Secao 1', levelIndex: 0, positionIndex: 0 }
export const defaultProductForm: ProductForm = { name: '', sku: '', brand: '' }
export const defaultLayoutForm: LayoutForm = { name: 'Layout principal', widthCm: 720, heightCm: 480 }
