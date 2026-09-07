import type { ShelfSection } from '../services/api'

export function groupSectionsByLevel(sections: ShelfSection[]) {
  const groups = new Map<number, ShelfSection[]>()

  for (const section of sections) {
    const current = groups.get(section.levelIndex) ?? []
    current.push(section)
    groups.set(section.levelIndex, current)
  }

  return Array.from(groups.entries())
    .sort(([levelA], [levelB]) => levelB - levelA)
    .map(([levelIndex, levelSections]) => ({
      levelIndex,
      sections: levelSections.sort((sectionA, sectionB) => sectionA.positionIndex - sectionB.positionIndex),
    }))
}
