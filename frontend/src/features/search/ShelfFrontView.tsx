import type { ShelfSection } from '../../services/api'
import { groupSectionsByLevel } from '../../lib/sections'

export function ShelfFrontView({ sections, selectedId, name }: { sections: ShelfSection[]; selectedId: string; name: string }) {
  return <aside className="shelf-front">
    <span className="section-label">Vista frontal</span>
    <h3>{name}</h3>
    <p>Olhe de frente para a prateleira, a partir do ponto de acesso.</p>
    <div className="shelf-front-levels">
      {groupSectionsByLevel(sections).map(level => <div className="shelf-front-level" key={level.levelIndex}>
        <span>Nível {level.levelIndex}</span>
        <div>{level.sections.map(section => <div key={section.id} style={{ gridColumn: section.positionIndex + 1 }} className={section.id === selectedId ? 'shelf-front-section target-section' : 'shelf-front-section'}>
          <strong>{section.name}</strong><small>Posição {section.positionIndex}</small>
          {section.id === selectedId && <b>Produto aqui</b>}
        </div>)}</div>
      </div>)}
    </div>
    {!sections.length && <p>Nenhuma seção disponível.</p>}
  </aside>
}