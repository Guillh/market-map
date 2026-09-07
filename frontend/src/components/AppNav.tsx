import type { InventoryTab } from '../features/inventory/InventoryScreen'
import { useMarketData } from '../app/useMarketData'

export function AppNav({ inventoryTab, setInventoryTab }: { inventoryTab: InventoryTab; setInventoryTab: (tab: InventoryTab) => void }) {
  const { screen, setScreen, configTab, setConfigTab } = useMarketData()

  function openConfig(tab: typeof configTab) {
    setScreen('config')
    setConfigTab(tab)
  }

  function openInventory(tab: InventoryTab) {
    setScreen('inventory')
    setInventoryTab(tab)
  }

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav" aria-label="Navegação principal">
        <section className="nav-group">
          <button className={screen === 'config' ? 'nav-parent active' : 'nav-parent'} onClick={() => openConfig(configTab)} type="button">
            <span>Configuração</span><small>Loja e mapa</small>
          </button>
          {screen === 'config' ? <div className="nav-subitems"><button className={configTab === 'store' ? 'active' : ''} onClick={() => openConfig('store')} type="button">Loja</button><button className={configTab === 'shelves' ? 'active' : ''} onClick={() => openConfig('shelves')} type="button">Prateleiras</button><button className={configTab === 'link-products' ? 'active' : ''} onClick={() => openConfig('link-products')} type="button">Vincular Produtos</button><button className={configTab === 'products' ? 'active' : ''} onClick={() => openConfig('products')} type="button">Produtos</button><button className={configTab === 'navigation' ? 'active' : ''} onClick={() => openConfig('navigation')} type="button">Terminais e caminhos</button></div> : null}
        </section>

        <section className="nav-group">
          <button className={screen === 'inventory' ? 'nav-parent active' : 'nav-parent'} onClick={() => openInventory(inventoryTab)} type="button">
            <span>Estoque</span><small>Saldos e lotes</small>
          </button>
          {screen === 'inventory' ? <div className="nav-subitems"><button className={inventoryTab === 'items' ? 'active' : ''} onClick={() => openInventory('items')} type="button">Saldos</button><button className={inventoryTab === 'lots' ? 'active' : ''} onClick={() => openInventory('lots')} type="button">Lotes</button><button className={inventoryTab === 'movements' ? 'active' : ''} onClick={() => openInventory('movements')} type="button">Movimentações</button><button className={inventoryTab === 'alerts' ? 'active' : ''} onClick={() => openInventory('alerts')} type="button">Alertas</button></div> : null}
        </section>

        <section className="nav-group">
          <button className={screen === 'search' ? 'nav-parent active' : 'nav-parent'} onClick={() => setScreen('search')} type="button">
            <span>Busca</span><small>Localizar produto</small>
          </button>
        </section>
      </nav>
    </aside>
  )
}
