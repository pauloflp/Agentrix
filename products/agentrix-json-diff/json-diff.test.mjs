import test from 'node:test';
import assert from 'node:assert/strict';
import {compare, main} from './json-diff.mjs';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('ignores object property order, including nested objects', () => {
  assert.deepEqual(compare({a: {x: 1, y: 2}, b: 3}, {b: 3, a: {y: 2, x: 1}}), []);
});
test('reports nested additions, removals and changed values', () => {
  const changes = compare({a: {x: 1, y: 2}}, {a: {x: 3, z: 4}});
  assert.deepEqual(changes.map(({type, path}) => [type, path]), [
    ['changed', '$["a"]["x"]'],
    ['removed', '$["a"]["y"]'],
    ['added', '$["a"]["z"]']
  ]);
});
test('compares arrays positionally and reports additions', () => {
  assert.deepEqual(compare([1, 2], [1, 3, 4]).map(({type, path}) => [type, path]), [
    ['changed', '$[1]'], ['added', '$[2]']
  ]);
});
test('reports removed array elements', () => {
  assert.deepEqual(compare([1, 2], [1]).map(({type, path}) => [type, path]), [['removed', '$[1]']]);
});
test('distinguishes primitives, type changes and null', () => {
  assert.deepEqual(compare(null, null), []);
  assert.deepEqual(compare(true, false).map(c => c.type), ['changed']);
  assert.deepEqual(compare([], {}).map(c => c.type), ['changed']);
  assert.equal(compare(null, {}).length, 1);
  assert.equal(compare(0, false).length, 1);
});
test('uses unambiguous paths for property names', () => {
  assert.equal(compare({'a.b': 1}, {'a.b': 2})[0].path, '$["a.b"]');
  assert.equal(compare({'quote"': 1}, {'quote"': 2})[0].path, '$["quote\\""]');
});
test('CLI exit codes: equal 0, changed 1, malformed JSON 2, invalid args 2', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentrix-json-'));
  try {
    const a = join(dir, 'a.json'), b = join(dir, 'b.json');
    await writeFile(a, '{"x":1}');
    await writeFile(b, '{"x":1}');
    assert.equal(await main([a, b]), 0);
    await writeFile(b, '{"x":2}');
    assert.equal(await main([a, b]), 1);
    assert.equal(await main(['--json', a, b]), 1);
    await writeFile(b, '{bad');
    assert.equal(await main([a, b]), 2);
    assert.equal(await main([a]), 2);
    assert.equal(await main([a, a, a]), 2);
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
