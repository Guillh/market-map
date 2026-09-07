import { initialShelfPlacement } from '../lib/layoutGeometry'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, type Layout, type Product, type ProductSearchResult, type Shelf, type ShelfSection, type Store } from '../services/api'
import { defaultLayoutForm, defaultProductForm, defaultSectionForm, defaultShelfForm, type ConfigTab, type HealthStatus, type LayoutForm, type ProductForm, type Screen, type SectionForm, type ShelfForm } from './types'

import { MarketDataContext } from './marketDataContextObject'

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('search')
  const [configTab, setConfigTab] = useState<ConfigTab>('store')
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [sections, setSections] = useState<ShelfSection[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [selectedLayoutId, setSelectedLayoutId] = useState('')
  const [selectedShelfId, setSelectedShelfId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [shelfForm, setShelfForm] = useState<ShelfForm>(defaultShelfForm)
  const [sectionForm, setSectionForm] = useState<SectionForm>(defaultSectionForm)
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm)
  const [layoutForm, setLayoutForm] = useState<LayoutForm>(defaultLayoutForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [draggingShelfId, setDraggingShelfId] = useState('')
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, shelfX: 0, shelfY: 0 })

  const selectedStore = stores.find((store) => store.id === selectedStoreId)
  const selectedLayout = layouts.find((layout) => layout.id === selectedLayoutId)
  const selectedShelf = shelves.find((shelf) => shelf.id === selectedShelfId)
  const selectedSection = sections.find((section) => section.id === selectedSectionId)
  const selectedShelfSections = useMemo(
    () => sections.filter((section) => section.shelfId === selectedShelfId),
    [sections, selectedShelfId],
  )

  const showError = useCallback((error: unknown) => {
    setMessage(error instanceof Error ? error.message : 'Erro inesperado')
  }, [])

  const refreshProducts = useCallback(async () => {
    try {
      const data = await api.products()
      setProducts(data)
      setSelectedProductId((current) => (data.some((product) => product.id === current) ? current : data[0]?.id ?? ''))
    } catch (error) {
      showError(error)
    }
  }, [showError])

  const refreshStores = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.stores()
      setStores(data)
      setSelectedStoreId((current) => (data.some((store) => store.id === current) ? current : data[0]?.id ?? ''))
    } catch (error) {
      showError(error)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const refreshShelves = useCallback(async (layoutId: string) => {
    try {
      const [shelfData, sectionData] = await Promise.all([api.shelves(layoutId), api.sections()])
      setShelves(shelfData)
      setSections(sectionData)
      setSelectedShelfId((current) => (shelfData.some((shelf) => shelf.id === current) ? current : shelfData[0]?.id ?? ''))
    } catch (error) {
      showError(error)
    }
  }, [showError])

  useEffect(() => {
    api.health().then((data) => {
      setHealth(data)
      setHealthError(null)
    }).catch((error: unknown) => {
      setHealth(null)
      setHealthError(error instanceof Error ? error.message : 'Erro desconhecido')
    })
    refreshStores()
    refreshProducts()
  }, [refreshProducts, refreshStores])

  useEffect(() => {
    if (!selectedStoreId) {
      setLayouts([])
      setSelectedLayoutId('')
      return
    }
    api.layouts(selectedStoreId).then((data) => {
      setLayouts(data)
      setSelectedLayoutId((current) => (data.some((layout) => layout.id === current) ? current : data[0]?.id ?? ''))
    }).catch(showError)
  }, [selectedStoreId, showError])

  useEffect(() => {
    if (!selectedLayoutId) {
      setShelves([])
      setSections([])
      setSelectedShelfId('')
      return
    }
    refreshShelves(selectedLayoutId)
  }, [refreshShelves, selectedLayoutId])

  useEffect(() => {
    if (!selectedLayout) {
      setLayoutForm(defaultLayoutForm)
      return
    }
    setLayoutForm({ name: selectedLayout.name, widthCm: selectedLayout.widthCm, heightCm: selectedLayout.heightCm })
  }, [selectedLayout])

  useEffect(() => {
    if (!selectedShelf) {
      setShelfForm(defaultShelfForm)
      setSelectedSectionId('')
      return
    }
    setShelfForm({ name: selectedShelf.name, positionXCm: selectedShelf.positionXCm, positionYCm: selectedShelf.positionYCm, widthCm: selectedShelf.widthCm, heightCm: selectedShelf.heightCm })
  }, [selectedShelf])

  useEffect(() => {
    if (!selectedSection) {
      setSectionForm({ ...defaultSectionForm, positionIndex: selectedShelfSections.length })
      return
    }
    setSectionForm({ name: selectedSection.name, levelIndex: selectedSection.levelIndex, positionIndex: selectedSection.positionIndex })
  }, [selectedSection, selectedShelfSections.length])

  async function createStarterData() {
    try {
      const store = await api.createStore({ name: 'Mercado Central', description: 'Unidade principal' })
      const layout = await api.createLayout({ storeId: store.id, ...defaultLayoutForm })
      await api.createShelf({ layoutId: layout.id, ...defaultShelfForm })
      setMessage('Dados iniciais criados.')
      await refreshStores()
    } catch (error) {
      showError(error)
    }
  }

  async function saveLayoutSize() {
    if (!selectedStoreId || !selectedLayout) return
    try {
      await api.updateLayout(selectedLayout.id, { storeId: selectedStoreId, ...layoutForm })
      const data = await api.layouts(selectedStoreId)
      setLayouts(data)
      setMessage('Tamanho da loja salvo.')
    } catch (error) {
      showError(error)
    }
  }

  async function createShelf() {
    if (!selectedLayoutId) return
    try {
      if (!selectedLayout) return
      const placement = initialShelfPlacement(selectedLayout)
      if (!placement) { setMessage('Não foi encontrado espaço para uma prateleira inicial de 40 × 40 cm. Confira as dimensões do contorno.'); return }
      const shelf = await api.createShelf({ layoutId: selectedLayoutId, ...defaultShelfForm, ...placement })
      setSelectedShelfId(shelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira criada.')
    } catch (error) {
      showError(error)
    }
  }

  async function saveShelf() {
    if (!selectedLayoutId || !selectedShelf) return
    try {
      const shelf = await api.updateShelf(selectedShelf.id, { layoutId: selectedLayoutId, ...shelfForm })
      setSelectedShelfId(shelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira salva.')
    } catch (error) {
      showError(error)
    }
  }

  async function deleteShelf() {
    if (!selectedLayoutId || !selectedShelf) return
    try {
      await api.deleteShelf(selectedShelf.id)
      await refreshShelves(selectedLayoutId)
      setMessage('Prateleira removida.')
    } catch (error) {
      showError(error)
    }
  }

  async function saveSection() {
    if (!selectedShelf) return
    try {
      const body = { shelfId: selectedShelf.id, ...sectionForm }
      const section = selectedSection ? await api.updateSection(selectedSection.id, body) : await api.createSection(body)
      setSelectedSectionId(section.id)
      await refreshShelves(selectedLayoutId)
      setMessage(selectedSection ? 'Secao salva.' : 'Secao criada.')
    } catch (error) {
      showError(error)
    }
  }

  async function deleteSection() {
    if (!selectedSection) return
    try {
      await api.deleteSection(selectedSection.id)
      setSelectedSectionId('')
      await refreshShelves(selectedLayoutId)
      setMessage('Secao removida.')
    } catch (error) {
      showError(error)
    }
  }

  async function createProduct() {
    if (!productForm.name.trim()) return
    try {
      const product = await api.createProduct({ name: productForm.name.trim(), sku: productForm.sku.trim() || undefined, brand: productForm.brand.trim() || undefined })
      setProductForm(defaultProductForm)
      await refreshProducts()
      setSelectedProductId(product.id)
      setMessage('Produto criado.')
    } catch (error) {
      showError(error)
    }
  }

  async function linkProductToSection() {
    if (!selectedProductId || !selectedSectionId) return
    try {
      await api.createProductLocation({ productId: selectedProductId, shelfSectionId: selectedSectionId })
      setMessage('Produto vinculado a secao.')
    } catch (error) {
      showError(error)
    }
  }

  async function searchProduct() {
    if (!searchQuery.trim()) return
    try {
      const results = await api.searchProducts(searchQuery.trim())
      setSearchResults(results)
      setMessage(results.length ? 'Busca concluida.' : 'Nenhum produto encontrado.')
    } catch (error) {
      showError(error)
    }
  }

  function startShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (configTab !== 'shelves') return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedShelfId(shelf.id)
    setDraggingShelfId(shelf.id)
    dragStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, shelfX: shelf.positionXCm, shelfY: shelf.positionYCm }
  }

  function moveShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (draggingShelfId !== shelf.id) return
    const deltaX = Math.round(event.clientX - dragStartRef.current.pointerX)
    const deltaY = Math.round(event.clientY - dragStartRef.current.pointerY)
    setShelfForm((current) => ({ ...current, positionXCm: Math.max(0, dragStartRef.current.shelfX + deltaX), positionYCm: Math.max(0, dragStartRef.current.shelfY + deltaY) }))
  }

  async function finishShelfDrag(event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) {
    if (draggingShelfId !== shelf.id) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDraggingShelfId('')
    const deltaX = Math.round(event.clientX - dragStartRef.current.pointerX)
    const deltaY = Math.round(event.clientY - dragStartRef.current.pointerY)
    try {
      await api.updateShelf(shelf.id, { layoutId: shelf.layoutId, name: shelf.name, positionXCm: Math.max(0, dragStartRef.current.shelfX + deltaX), positionYCm: Math.max(0, dragStartRef.current.shelfY + deltaY), widthCm: shelf.widthCm, heightCm: shelf.heightCm })
      await refreshShelves(selectedLayoutId)
      setMessage('Posicao salva.')
    } catch (error) {
      showError(error)
      setShelfForm({ name: shelf.name, positionXCm: shelf.positionXCm, positionYCm: shelf.positionYCm, widthCm: shelf.widthCm, heightCm: shelf.heightCm })
    }
  }

  function updateShelfField(field: keyof ShelfForm, value: string) {
    setShelfForm((current) => ({ ...current, [field]: field === 'name' ? value : Number(value) }))
  }

  function updateSectionField(field: keyof SectionForm, value: string) {
    setSectionForm((current) => ({ ...current, [field]: field === 'name' ? value : Number(value) }))
  }

  function acceptSavedLayout(layout: Layout) {
    setLayouts(current => current.map(item => item.id === layout.id ? layout : item))
  }

  const value = {
    acceptSavedLayout,
    screen, setScreen, configTab, setConfigTab, health, healthError, stores, layouts, shelves, sections, products,
    selectedStoreId, setSelectedStoreId, selectedLayoutId, setSelectedLayoutId, selectedShelfId, setSelectedShelfId,
    selectedSectionId, setSelectedSectionId, selectedProductId, setSelectedProductId, searchQuery, setSearchQuery,
    searchResults, shelfForm, setShelfForm, sectionForm, setSectionForm, productForm, setProductForm, layoutForm,
    setLayoutForm, message, setMessage, loading, selectedStore, selectedLayout, selectedShelf, selectedSection,
    selectedShelfSections, refreshProducts, refreshStores, refreshShelves, createStarterData, saveLayoutSize,
    createShelf, saveShelf, deleteShelf, saveSection, deleteSection, createProduct, linkProductToSection, searchProduct,
    startShelfDrag, moveShelfDrag, finishShelfDrag, updateShelfField, updateSectionField,
  }

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>
}
