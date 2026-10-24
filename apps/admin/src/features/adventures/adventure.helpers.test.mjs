import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('./adventure.helpers.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { exports: mod.exports, module: mod, TextEncoder, crypto: globalThis.crypto });
const { moveSection, writeContent, removeEntry, validateContent, uncertainWrite } = mod.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
function fixture() {
  return {
    title: 'The Lantern Road',
    summary: '',
    sections: [
      {
        id: 'gate',
        title: 'At the gate',
        storyText: 'Listen.',
        storyweaverNotes: 'Secret A',
        context: '',
        sortOrder: 0,
        resourceIds: ['map'],
        encounterIds: ['guards'],
        links: [{ sectionId: 'bridge', label: 'Follow the river', context: 'At dusk' }],
      },
      {
        id: 'bridge',
        title: 'The bridge',
        storyText: 'The lights flicker.',
        storyweaverNotes: 'Secret B',
        context: 'A crossing',
        sortOrder: 1,
        resourceIds: ['map'],
        encounterIds: ['guards'],
        links: [{ sectionId: 'gate', label: 'Return', context: '' }],
      },
    ],
    resources: [
      { id: 'map', title: 'River map', kind: 'map', visibility: 'storyweaver', text: '', tags: ['river'], hasAsset: true, asset: { bytes: 42, contentType: 'image/png' } },
    ],
    encounters: [{ id: 'guards', title: 'Watchkeepers', notes: 'Negotiate first.', combatants: [{ combatantId: '123456789012345678901234', quantity: 2 }] }],
  };
}
test('moving a dirty second section first preserves all identities, incoming/outgoing links and associations', () => {
  const before = fixture();
  before.sections[1].storyText = 'Unsaved story edit';
  const result = moveSection(before, 'bridge', -1);
  assert.deepEqual(plain(result.sections.map((s) => [s.id, s.sortOrder])), [
    ['bridge', 0],
    ['gate', 1],
  ]);
  for (const original of before.sections) {
    const changed = result.sections.find((s) => s.id === original.id);
    assert.deepEqual(plain({ ...changed, sortOrder: original.sortOrder }), original);
  }
  assert.deepEqual(
    before.sections.map((s) => s.id),
    ['gate', 'bridge']
  );
  const roundTrip = plain(writeContent(result));
  assert.equal(roundTrip.sections[0].storyText, 'Unsaved story edit');
  assert.equal(roundTrip.sections[1].links[0].sectionId, 'bridge');
  assert.deepEqual(plain(validateContent(roundTrip)), []);
});
test('write serialization strips all protected attachment metadata without mutating the draft', () => {
  const draft = fixture();
  const payload = plain(writeContent(draft));
  assert.equal('asset' in payload.resources[0], false);
  assert.equal('hasAsset' in payload.resources[0], false);
  assert.equal(draft.resources[0].hasAsset, true);
});
test('removing a section removes incoming links only; removing a material cleans associations', () => {
  const withoutSection = removeEntry(fixture(), 'sections', 'bridge');
  assert.deepEqual(plain(withoutSection.sections[0].links), []);
  assert.equal(withoutSection.resources.length, 1);
  assert.equal(withoutSection.encounters.length, 1);
  const withoutMap = removeEntry(fixture(), 'resources', 'map');
  assert.ok(withoutMap.sections.every((s) => s.resourceIds.length === 0));
  assert.equal(withoutMap.sections[0].links[0].sectionId, 'bridge');
});
test('empty optional collections are valid; dangling links and fractional quantities are not', () => {
  assert.equal(validateContent({ title: 'Beginning', summary: '', sections: [], resources: [], encounters: [] }).length, 0);
  const draft = fixture();
  draft.sections[0].links[0].sectionId = 'missing';
  draft.encounters[0].combatants[0].quantity = 1.5;
  assert.ok(validateContent(draft).some((i) => i.area === 'story'));
  assert.ok(validateContent(draft).some((i) => i.area === 'encounters'));
});
test('private note visibility and UTF-8 byte limit are enforced', () => {
  const draft = fixture();
  draft.resources[0].kind = 'storyweaver_note';
  draft.resources[0].visibility = 'players';
  assert.ok(validateContent(draft).some((i) => /private/.test(i.message)));
  draft.sections[0].storyText = '🌲'.repeat(500001);
  assert.ok(validateContent(draft).some((i) => /2 MB/.test(i.message)));
});
test('unknown outcomes and stale revisions block blind retries; validation errors remain correctable', () => {
  assert.equal(uncertainWrite(new Error('connection lost')), true);
  assert.equal(uncertainWrite({ response: { status: 409 } }), true);
  assert.equal(uncertainWrite({ response: { status: 503 } }), true);
  assert.equal(uncertainWrite({ response: { status: 400 } }), false);
});
