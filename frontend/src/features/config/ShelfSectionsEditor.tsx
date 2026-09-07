import { useState } from 'react'
import { useMarketData } from '../../app/useMarketData'
import { defaultSectionForm } from '../../app/types'
import { groupSectionsByLevel } from '../../lib/sections'

export function ShelfSectionsEditor() {
  const { selectedShelfSections, selectedSectionId, selectedSection, sectionForm, setSelectedSectionId, setSectionForm, updateSectionField, saveSection, deleteSection } = useMarketData()
  const [busy, setBusy] = useState(false)
  async function run(action: () => Promise<void>) {
    setBusy(true)
    try { await action() } finally { setBusy(false) }
  }
  function newSection() {
    setSelectedSectionId('')
    setSectionForm({ ...defaultSectionForm, positionIndex: selectedShelfSections.length })
  }
  return <div className="shelf-sections-editor">
    <div className="shelf-section-list-heading"><h4>Organização por nível</h4><button className="shelf-add-section" type="button" disabled={busy} onClick={newSection}>＋ Nova seção</button></div>
    <p className="shelf-field-hint">Os níveis mais altos aparecem no topo. Selecione uma seção para editar.</p>
    <div className="shelf-level-picker">
      {groupSectionsByLevel(selectedShelfSections).map(level => <section className="shelf-level-group" key={level.levelIndex}>
        <header><span>Nível {level.levelIndex}</span><small>{level.sections.length} {level.sections.length === 1 ? 'seção' : 'seções'}</small></header>
        <div className="shelf-level-sections">{level.sections.map(section => <button className={selectedSectionId === section.id ? 'shelf-section-tile selected' : 'shelf-section-tile'} key={section.id} type="button" disabled={busy} aria-pressed={selectedSectionId === section.id} onClick={() => setSelectedSectionId(section.id)}>
          <strong>{section.name}</strong><span>Posição {section.positionIndex}</span>
        </button>)}</div>
      </section>)}
      {!selectedShelfSections.length && <p className="shelf-sections-empty">A prateleira está pronta para receber sua primeira seção.</p>}
    </div>
    <form className="shelf-section-form" onSubmit={event => { event.preventDefault(); void run(saveSection) }}>
      <fieldset disabled={busy}>
        <div className="shelf-section-edit-heading"><span className="shelf-edit-dot" aria-hidden="true" /><h4>{selectedSection ? 'Editar seção' : 'Nova seção'}</h4><span className="shelf-edit-badge">{selectedSection ? 'Selecionada' : 'Cadastro'}</span></div>
        <label className="shelf-field">Nome da seção<input required maxLength={120} placeholder="Ex.: Arroz e grãos" value={sectionForm.name} onChange={event => updateSectionField('name', event.target.value)} /></label>
        <div className="shelf-field-pair">
          <label className="shelf-field">Nível<input required min="0" step="1" type="number" value={sectionForm.levelIndex} onChange={event => updateSectionField('levelIndex', event.target.value)} /><small>0 é o nível inferior</small></label>
          <label className="shelf-field">Posição<input required min="0" step="1" type="number" value={sectionForm.positionIndex} onChange={event => updateSectionField('positionIndex', event.target.value)} /><small>0 começa à esquerda</small></label>
        </div>
        <button className="primary-action shelf-save-button" type="submit">{busy ? 'Salvando…' : selectedSection ? 'Salvar seção' : 'Adicionar seção'}</button>
        {selectedSection && <div className="shelf-delete-row"><span>Remover esta seção</span><button className="shelf-delete-action" type="button" onClick={() => void run(deleteSection)}>Excluir seção</button></div>}
      </fieldset>
    </form>
  </div>
}