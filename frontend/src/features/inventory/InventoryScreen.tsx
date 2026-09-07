import { useCallback, useEffect, useState } from 'react'
import { api, type InventoryItem, type InventoryLot, type InventoryMovement, type InventoryMovementType, type Product, type ProductLocation, type Shelf, type ShelfSection } from '../../services/api'

export type InventoryTab = 'items' | 'lots' | 'movements' | 'alerts'
type InventoryItemForm = { productLocationId: string; quantity: number; minimumQuantity: number }
type InventoryLotForm = { inventoryItemId: string; lotCode: string; expirationDate: string; quantity: number }
type InventoryMovementForm = { productLocationId: string; type: InventoryMovementType; quantity: number; reason: string }

const defaultItemForm: InventoryItemForm = { productLocationId: '', quantity: 0, minimumQuantity: 0 }
const defaultLotForm: InventoryLotForm = { inventoryItemId: '', lotCode: '', expirationDate: '', quantity: 0 }
const defaultMovementForm: InventoryMovementForm = { productLocationId: '', type: 'IN', quantity: 1, reason: '' }

function formatDate(value: string | null) {
  if (!value) return 'Sem validade'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`))
}

export function InventoryScreen({ onMessage, tab }: { onMessage: (message: string) => void; tab: InventoryTab }) {
  const [products, setProducts] = useState<Product[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [sections, setSections] = useState<ShelfSection[]>([])
  const [locations, setLocations] = useState<ProductLocation[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [lots, setLots] = useState<InventoryLot[]>([])
  const [expiringLots, setExpiringLots] = useState<InventoryLot[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [itemForm, setItemForm] = useState<InventoryItemForm>(defaultItemForm)
  const [lotForm, setLotForm] = useState<InventoryLotForm>(defaultLotForm)
  const [movementForm, setMovementForm] = useState<InventoryMovementForm>(defaultMovementForm)

  const refresh = useCallback(async () => {
    const [productData, shelfData, sectionData, locationData, itemData, lotData, expiringData, movementData] = await Promise.all([
      api.products(),
      api.shelves(),
      api.sections(),
      api.productLocations(),
      api.inventoryItems(),
      api.inventoryLots(),
      api.expiringInventoryLots(30),
      api.inventoryMovements(),
    ])
    setProducts(productData)
    setShelves(shelfData)
    setSections(sectionData)
    setLocations(locationData)
    setItems(itemData)
    setLots(lotData)
    setExpiringLots(expiringData)
    setMovements(movementData)
    setItemForm((current) => ({ ...current, productLocationId: current.productLocationId || locationData[0]?.id || '' }))
    setLotForm((current) => ({ ...current, inventoryItemId: current.inventoryItemId || itemData[0]?.id || '' }))
    setMovementForm((current) => ({ ...current, productLocationId: current.productLocationId || locationData[0]?.id || '' }))
  }, [])

  useEffect(() => {
    refresh().catch((error: unknown) => onMessage(error instanceof Error ? error.message : 'Erro ao carregar estoque'))
  }, [onMessage, refresh])

  function locationLabel(location: ProductLocation) {
    const product = products.find((item) => item.id === location.productId)
    const section = sections.find((item) => item.id === location.shelfSectionId)
    const shelf = shelves.find((item) => item.id === section?.shelfId)
    return `${product?.name ?? 'Produto'} · ${shelf?.name ?? 'Prateleira'} / ${section?.name ?? 'Secao'}`
  }

  async function createItem() {
    if (!itemForm.productLocationId) return
    await api.createInventoryItem(itemForm)
    await refresh()
    onMessage('Saldo de estoque criado.')
  }

  async function createLot() {
    if (!lotForm.inventoryItemId || !lotForm.lotCode.trim()) return
    await api.createInventoryLot({ inventoryItemId: lotForm.inventoryItemId, lotCode: lotForm.lotCode.trim(), expirationDate: lotForm.expirationDate || undefined, quantity: lotForm.quantity })
    setLotForm((current) => ({ ...defaultLotForm, inventoryItemId: current.inventoryItemId }))
    await refresh()
    onMessage('Lote criado.')
  }

  async function createMovement() {
    if (!movementForm.productLocationId) return
    await api.createInventoryMovement({ productLocationId: movementForm.productLocationId, type: movementForm.type, quantity: movementForm.quantity, reason: movementForm.reason.trim() || undefined })
    setMovementForm((current) => ({ ...defaultMovementForm, productLocationId: current.productLocationId }))
    await refresh()
    onMessage('Movimentacao registrada.')
  }

  const lowStockItems = items.filter((item) => item.belowMinimum)

  return <><header className="context-topbar compact-context-topbar inventory-actions-topbar"><button className="secondary-action" onClick={() => void refresh()} type="button">Atualizar estoque</button></header><section className="screen-grid search-screen"><section className="workspace wide"><header className="topbar"><div><span className="section-label">Estoque</span><h2>Controle de estoque</h2></div></header>{tab === 'items' ? <div className="editor-panel split-panel"><section><span className="section-label">Criar saldo</span><div className="form-grid"><label>Produto/localizacao<select value={itemForm.productLocationId} onChange={(event) => setItemForm((current) => ({ ...current, productLocationId: event.target.value }))}><option value="">Selecione</option>{locations.map((location) => <option key={location.id} value={location.id}>{locationLabel(location)}</option>)}</select></label><label>Quantidade<input min="0" type="number" value={itemForm.quantity} onChange={(event) => setItemForm((current) => ({ ...current, quantity: Number(event.target.value) }))} /></label><label>Quantidade minima<input min="0" type="number" value={itemForm.minimumQuantity} onChange={(event) => setItemForm((current) => ({ ...current, minimumQuantity: Number(event.target.value) }))} /></label></div><button className="primary-action" onClick={() => void createItem()} disabled={!itemForm.productLocationId} type="button">Criar saldo</button></section><section><span className="section-label">Saldos atuais</span><div className="product-list">{items.map((item) => <article className={item.belowMinimum ? 'stock-warning' : ''} key={item.id}><strong>{item.productName}</strong><span>{item.productSku ?? 'Sem SKU'} · saldo {item.quantity} · minimo {item.minimumQuantity}</span><small>{item.belowMinimum ? 'Abaixo do minimo' : 'Saldo normal'}</small></article>)}</div></section></div> : null}{tab === 'lots' ? <div className="editor-panel split-panel"><section><span className="section-label">Criar lote</span><div className="form-grid"><label>Saldo<select value={lotForm.inventoryItemId} onChange={(event) => setLotForm((current) => ({ ...current, inventoryItemId: event.target.value }))}><option value="">Selecione</option>{items.map((item) => <option key={item.id} value={item.id}>{item.productName} · saldo {item.quantity}</option>)}</select></label><label>Codigo do lote<input value={lotForm.lotCode} onChange={(event) => setLotForm((current) => ({ ...current, lotCode: event.target.value }))} /></label><label>Validade<input type="date" value={lotForm.expirationDate} onChange={(event) => setLotForm((current) => ({ ...current, expirationDate: event.target.value }))} /></label><label>Quantidade<input min="0" type="number" value={lotForm.quantity} onChange={(event) => setLotForm((current) => ({ ...current, quantity: Number(event.target.value) }))} /></label></div><button className="primary-action" onClick={() => void createLot()} disabled={!lotForm.inventoryItemId || !lotForm.lotCode.trim()} type="button">Criar lote</button></section><section><span className="section-label">Lotes cadastrados</span><div className="product-list">{lots.map((lot) => <article key={lot.id}><strong>{lot.productName}</strong><span>Lote {lot.lotCode} · qtd. {lot.quantity}</span><small>Validade: {formatDate(lot.expirationDate)}</small></article>)}</div></section></div> : null}{tab === 'movements' ? <div className="editor-panel split-panel"><section><span className="section-label">Registrar movimentacao</span><div className="form-grid"><label>Produto/localizacao<select value={movementForm.productLocationId} onChange={(event) => setMovementForm((current) => ({ ...current, productLocationId: event.target.value }))}><option value="">Selecione</option>{locations.map((location) => <option key={location.id} value={location.id}>{locationLabel(location)}</option>)}</select></label><label>Tipo<select value={movementForm.type} onChange={(event) => setMovementForm((current) => ({ ...current, type: event.target.value as InventoryMovementType }))}><option value="IN">Entrada</option><option value="OUT">Saida</option><option value="ADJUSTMENT">Ajuste</option></select></label><label>Quantidade<input min="1" type="number" value={movementForm.quantity} onChange={(event) => setMovementForm((current) => ({ ...current, quantity: Number(event.target.value) }))} /></label><label>Motivo<input value={movementForm.reason} onChange={(event) => setMovementForm((current) => ({ ...current, reason: event.target.value }))} /></label></div><button className="primary-action" onClick={() => void createMovement()} disabled={!movementForm.productLocationId} type="button">Registrar</button></section><section><span className="section-label">Historico</span><div className="product-list">{movements.map((movement) => <article key={movement.id}><strong>{movement.productName}</strong><span>{movement.type} · qtd. {movement.quantity}</span><small>{movement.reason || 'Sem motivo informado'}</small></article>)}</div></section></div> : null}{tab === 'alerts' ? <div className="editor-panel split-panel"><section><span className="section-label">Baixo estoque</span><div className="product-list">{lowStockItems.map((item) => <article className="stock-warning" key={item.id}><strong>{item.productName}</strong><span>Saldo {item.quantity} abaixo do minimo {item.minimumQuantity}</span></article>)}{!lowStockItems.length ? <p className="empty-state">Nenhum produto abaixo do minimo.</p> : null}</div></section><section><span className="section-label">Vencendo em ate 30 dias</span><div className="product-list">{expiringLots.map((lot) => <article className="stock-warning" key={lot.id}><strong>{lot.productName}</strong><span>Lote {lot.lotCode} · qtd. {lot.quantity}</span><small>Validade: {formatDate(lot.expirationDate)}</small></article>)}{!expiringLots.length ? <p className="empty-state">Nenhum lote proximo do vencimento.</p> : null}</div></section></div> : null}</section></section></>
}
