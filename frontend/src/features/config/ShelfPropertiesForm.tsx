import { useState } from 'react'
import { useMarketData } from '../../app/useMarketData'

export function ShelfPropertiesForm() {
  const { shelfForm, updateShelfField, saveShelf, deleteShelf } = useMarketData()
  const [busy, setBusy] = useState(false)
  async function run(action: () => Promise<void>) {
    setBusy(true)
    try { await action() } finally { setBusy(false) }
  }
  return <form className="shelf-properties-form" onSubmit={event => { event.preventDefault(); void run(saveShelf) }}>
    <fieldset disabled={busy}>
      <label className="shelf-field">Nome da prateleira<input required maxLength={120} placeholder="Ex.: Mercearia" value={shelfForm.name} onChange={event => updateShelfField('name', event.target.value)} /></label>
      <div className="shelf-field-group-heading"><h4>Posição no mapa</h4><span>cm</span></div>
      <div className="shelf-field-pair">
        <label className="shelf-field">Horizontal · X<input required type="number" min="0" step="1" value={shelfForm.positionXCm} onChange={event => updateShelfField('positionXCm', event.target.value)} /></label>
        <label className="shelf-field">Vertical · Y<input required type="number" min="0" step="1" value={shelfForm.positionYCm} onChange={event => updateShelfField('positionYCm', event.target.value)} /></label>
      </div>
      <div className="shelf-field-group-heading"><h4>Dimensões da base</h4><span>cm</span></div>
      <div className="shelf-field-pair">
        <label className="shelf-field">Largura<input required type="number" min="1" step="1" value={shelfForm.widthCm} onChange={event => updateShelfField('widthCm', event.target.value)} /></label>
        <label className="shelf-field">Profundidade<input required type="number" min="1" step="1" value={shelfForm.heightCm} onChange={event => updateShelfField('heightCm', event.target.value)} /></label>
      </div>
      <p className="shelf-field-hint">Medidas vistas de cima. Os níveis de altura são organizados na aba Seções.</p>
      <button className="primary-action shelf-save-button" type="submit">{busy ? 'Salvando…' : 'Salvar prateleira'}</button>
      <div className="shelf-delete-row"><span>Remover do layout</span><button className="shelf-delete-action" type="button" onClick={() => void run(deleteShelf)}>Excluir prateleira</button></div>
    </fieldset>
  </form>
}