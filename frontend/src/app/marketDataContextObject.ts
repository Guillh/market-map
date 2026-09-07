import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Layout, Product, ProductSearchResult, Shelf, ShelfSection, Store } from '../services/api'
import type { ConfigTab, HealthStatus, LayoutForm, ProductForm, Screen, SectionForm, ShelfForm } from './types'

export type MarketDataContextValue = {
  screen: Screen
  setScreen: Dispatch<SetStateAction<Screen>>
  configTab: ConfigTab
  setConfigTab: Dispatch<SetStateAction<ConfigTab>>
  health: HealthStatus | null
  healthError: string | null
  stores: Store[]
  layouts: Layout[]
  shelves: Shelf[]
  sections: ShelfSection[]
  products: Product[]
  selectedStoreId: string
  setSelectedStoreId: Dispatch<SetStateAction<string>>
  selectedLayoutId: string
  setSelectedLayoutId: Dispatch<SetStateAction<string>>
  selectedShelfId: string
  setSelectedShelfId: Dispatch<SetStateAction<string>>
  selectedSectionId: string
  setSelectedSectionId: Dispatch<SetStateAction<string>>
  selectedProductId: string
  setSelectedProductId: Dispatch<SetStateAction<string>>
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  searchResults: ProductSearchResult[]
  shelfForm: ShelfForm
  setShelfForm: Dispatch<SetStateAction<ShelfForm>>
  sectionForm: SectionForm
  setSectionForm: Dispatch<SetStateAction<SectionForm>>
  productForm: ProductForm
  setProductForm: Dispatch<SetStateAction<ProductForm>>
  layoutForm: LayoutForm
  setLayoutForm: Dispatch<SetStateAction<LayoutForm>>
  message: string
  setMessage: Dispatch<SetStateAction<string>>
  loading: boolean
  selectedStore: Store | undefined
  selectedLayout: Layout | undefined
  selectedShelf: Shelf | undefined
  selectedSection: ShelfSection | undefined
  selectedShelfSections: ShelfSection[]
  refreshProducts: () => Promise<void>
  refreshStores: () => Promise<void>
  refreshShelves: (layoutId: string) => Promise<void>
  createStarterData: () => Promise<void>
  saveLayoutSize: () => Promise<void>
  createShelf: () => Promise<void>
  saveShelf: () => Promise<void>
  deleteShelf: () => Promise<void>
  saveSection: () => Promise<void>
  deleteSection: () => Promise<void>
  createProduct: () => Promise<void>
  linkProductToSection: () => Promise<void>
  searchProduct: () => Promise<void>
  startShelfDrag: (event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => void
  moveShelfDrag: (event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => void
  finishShelfDrag: (event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => Promise<void>
  updateShelfField: (field: keyof ShelfForm, value: string) => void
  updateSectionField: (field: keyof SectionForm, value: string) => void
}

export const MarketDataContext = createContext<MarketDataContextValue | null>(null)

