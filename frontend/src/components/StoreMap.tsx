import { useMarketData } from '../app/useMarketData'
import { groupSectionsByLevel } from '../lib/sections'

export function StoreMap() {
  const {
    loading,
    selectedLayout,
    shelves,
    sections,
    selectedShelfId,
    selectedSectionId,
    shelfForm,
    setSelectedShelfId,
    startShelfDrag,
    moveShelfDrag,
    finishShelfDrag,
  } = useMarketData()

  if (loading) return <p className="empty-state">Carregando editor...</p>
  if (!selectedLayout) return <p className="empty-state">Crie ou selecione uma loja e um layout.</p>

  return (
    <div className="map-grid" style={{ width: selectedLayout.widthCm, height: selectedLayout.heightCm }}>
      {shelves.map((shelf) => (
        <button
          className={shelf.id === selectedShelfId ? 'map-shelf selected' : 'map-shelf'}
          key={shelf.id}
          onClick={() => setSelectedShelfId(shelf.id)}
          onPointerDown={(event) => startShelfDrag(event, shelf)}
          onPointerMove={(event) => moveShelfDrag(event, shelf)}
          onPointerUp={(event) => void finishShelfDrag(event, shelf)}
          style={{
            left: shelf.id === selectedShelfId ? shelfForm.positionXCm : shelf.positionXCm,
            top: shelf.id === selectedShelfId ? shelfForm.positionYCm : shelf.positionYCm,
            width: shelf.id === selectedShelfId ? shelfForm.widthCm : shelf.widthCm,
            height: shelf.id === selectedShelfId ? shelfForm.heightCm : shelf.heightCm,
          }}
          type="button"
        >
          <span>{shelf.name}</span>
          <div className="section-levels">
            {groupSectionsByLevel(sections.filter((section) => section.shelfId === shelf.id)).map((level) => (
              <div className="section-level" key={level.levelIndex}>
                {level.sections.map((section) => <i className={section.id === selectedSectionId ? 'section-active' : ''} key={section.id}>{section.name}</i>)}
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
}
