import assert from 'node:assert/strict';
import { cameraShift, leafForPage, needsLeafTurn, nextReadingPage, nextSpread, previousReadingPage, previousSpread, spreadStart, visiblePages } from '../src/utils/bookGeometry.ts';
import { prepareLatest } from '../src/utils/prepareLatest.ts';

const expected = [[1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20]];
assert.deepEqual(expected.flat(), Array.from({ length: 20 }, (_, i) => i + 1));
expected.forEach((spread, index) => {
  for (const page of spread) {
    assert.deepEqual(visiblePages(page), spread);
    assert.equal(spreadStart(page), spread[0]);
    assert.equal(nextSpread(page), expected[Math.min(10, index + 1)][0]);
    assert.equal(previousSpread(page), expected[Math.max(0, index - 1)][0]);
  }
});
for (let leaf = 1; leaf <= 10; leaf++) {
  assert.deepEqual(leafForPage(leaf * 2 - 1), { leaf, face: 'front' });
  assert.deepEqual(leafForPage(leaf * 2), { leaf, face: 'back' });
}
assert.deepEqual(visiblePages(13), [12, 13]);
for (let page = 1; page <= 20; page++) {
  assert.equal(nextReadingPage(page), Math.min(20, page + 1));
  assert.equal(previousReadingPage(page), Math.max(1, page - 1));
}
assert.equal(needsLeafTurn(2, 3), false);
assert.equal(needsLeafTurn(3, 4), true);
assert.equal(needsLeafTurn(4, 3), true);
assert.equal(needsLeafTurn(3, 2), false);
assert.equal(cameraShift(2, 300), 150);
assert.equal(cameraShift(3, 300), -150);
assert.equal(cameraShift(4, 300), 150);
assert.equal(cameraShift(1, 300), -150);
assert.equal(cameraShift(20, 300), 150);
let selected = 7;
const prepared = [];
const final = await prepareLatest(() => selected, async page => { prepared.push(page); if (page === 7) selected = 1; });
assert.equal(final, 1);
assert.deepEqual(prepared, [7, 1]);
console.log('Livro: 20 faces / 10 folhas. Leitura esquerda → direita → virada, câmera e proteção contra imagens de uma seleção antiga verificadas.');
