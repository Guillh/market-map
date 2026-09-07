import test from 'node:test'
import assert from 'node:assert/strict'
import { initialShelfPlacement, layoutBoundary, polygonArea, presetShape, navigationPositionError } from '../src/lib/layoutGeometry.ts'

test('existing rectangular layouts retain the original area', () => {
  assert.equal(polygonArea(layoutBoundary({ widthCm: 720, heightCm: 480 })), 345600)
})

test('L and U templates subtract the recessed area', () => {
  assert.equal(polygonArea(presetShape('L', 600, 600)), 200000)
  assert.equal(polygonArea(presetShape('U', 600, 600)), 280000)
})

test('initial shelf fits in the arm of a U instead of spanning the recess', () => {
  const placement = initialShelfPlacement({ widthCm: 600, heightCm: 600, boundary: presetShape('U', 600, 600) })
  assert.ok(placement)
  assert.ok(placement.positionYCm >= 400 || placement.positionXCm + placement.widthCm <= 200 || placement.positionXCm >= 400)
})

test('shifted store outline does not place the shelf in the exterior origin', () => {
  const placement = initialShelfPlacement({ widthCm: 800, heightCm: 800, boundary: [{ x: 400, y: 400 }, { x: 800, y: 400 }, { x: 800, y: 800 }, { x: 400, y: 800 }] })
  assert.ok(placement)
  assert.ok(placement.positionXCm >= 400 && placement.positionYCm >= 400)
})

test('very small layouts report that an initial shelf does not fit', () => {
  assert.equal(initialShelfPlacement({ widthCm: 20, heightCm: 20 }), null)
})
test('terminal preview and save validation reject the cutout of a U', () => {
  const layout = { widthCm: 600, heightCm: 600, boundary: presetShape('U', 600, 600) }
  const terminal = { kind: 'TERMINAL', xCm: 300, yCm: 100, widthCm: 0, heightCm: 0 }
  assert.match(navigationPositionError(layout, [], [], terminal), /Posição inválida/)
  assert.equal(navigationPositionError(layout, [], [], { ...terminal, xCm: 100 }), '')
})

test('terminal validation respects inclined walls and shelf clearance', () => {
  const layout = { widthCm: 600, heightCm: 600, boundary: [{ x: 0, y: 0 }, { x: 600, y: 0 }, { x: 400, y: 600 }, { x: 0, y: 600 }] }
  const terminal = { kind: 'TERMINAL', xCm: 430, yCm: 500, widthCm: 0, heightCm: 0 }
  assert.match(navigationPositionError(layout, [], [], terminal), /Posição inválida/)
  assert.match(navigationPositionError(layout, [{ positionXCm: 90, positionYCm: 90, widthCm: 100, heightCm: 100 }], [], { ...terminal, xCm: 100, yCm: 100 }), /prateleiras/)
})

test('obstacle cannot bridge the outside of a concave store', () => {
  const layout = { widthCm: 600, heightCm: 600, boundary: presetShape('U', 600, 600) }
  assert.match(navigationPositionError(layout, [], [], { kind: 'OBSTACLE', xCm: 100, yCm: 100, widthCm: 400, heightCm: 400 }), /contorno/)
})