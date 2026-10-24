import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync(new URL('./unwoven.helpers.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { module: mod, exports: mod.exports, URL });
const { emptyDraft, validate, toDraft, payload, uncertainWrite } = mod.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const valid = () => ({ ...emptyDraft(), key: 'watchkeeper', name: 'Watchkeeper', statline: { hp: 12, defenseTN: 10, harm: 'Light (3)', armor: 0, actions: 1, move: '', tags: [] } });

test('requires identity, valid stats and complete added attacks/abilities before saving', () => {
  assert.equal(validate(valid()).length, 0);
  assert.ok(validate(emptyDraft()).some(i => i.field === 'name'));
  for (const value of ['', 0, -1, NaN, Infinity]) {
    const draft = valid(); draft.statline.hp = value;
    assert.ok(validate(draft).some(i => i.field === 'hp'));
  }
  const draft = valid(); draft.attacks = [{ name: 'Strike', harm: ' ', range: '', notes: '' }]; draft.abilities = [{ name: '', text: '', cooldown: '' }];
  assert.deepEqual(plain(validate(draft).map(i => i.field)), ['attack-0-harm', 'ability-0-name', 'ability-0-text']);
});
test('editing preserves every supported field and excludes database metadata', () => {
  const record = { ...valid(), _id: '1', updatedAt: 'date', __v: 2, settingKeys: ['everpine'], perks: ['Hidden'],
    attacks: [{ name: 'Strike', harm: 'Light (3)', range: 'Melee', notes: 'Careful' }], abilities: [{ name: 'Fade', text: 'Vanishes', cooldown: 'Once' }],
    loreCheck: { skill: 'Wit', tn: 14, villagers: ['A'], priests: ['B'], scholars: ['C'], soldiers: ['D'] },
    backgroundBehavior: 'Watchful', whereFound: ['Road'], tactics: ['Hide'], hooks: ['Lost oath'], notes: { public: 'Known', gm: 'Hidden' },
    media: { portraitUrl: 'https://example.test/portrait.png', tokenUrl: '', bannerUrl: '' }, loreNodeId: '111111111111111111111111' };
  const expected = { ...record }; for (const key of ['_id', 'updatedAt', '__v']) delete expected[key];
  assert.deepEqual(plain(payload(toDraft(record))), plain(expected));
  assert.equal(record.__v, 2);
});
test('serialization normalizes key and lines without changing the working draft', () => {
  const draft = valid(); draft.key = ' WATCHKEEPER '; draft.tactics = [' Hide ', '', ' Wait ']; draft.loreNodeId = '';
  const body = payload(draft);
  assert.equal(body.key, 'watchkeeper'); assert.equal(body.loreNodeId, null); assert.deepEqual(plain(body.tactics), ['Hide', 'Wait']);
  assert.equal(draft.key, ' WATCHKEEPER '); assert.equal(draft.tactics.length, 3);
});
test('optional media and lore references validate without requiring them', () => {
  const draft = valid(); draft.media.tokenUrl = 'javascript:alert(1)'; draft.loreNodeId = 'not-an-id';
  assert.ok(validate(draft).some(i => i.field === 'tokenUrl')); assert.ok(validate(draft).some(i => i.field === 'loreNodeId'));
});
test('uncertain write outcomes block blind retries while rejected validation remains correctable', () => {
  assert.equal(uncertainWrite(new Error('disconnected')), true);
  assert.equal(uncertainWrite({ response: { status: 503 } }), true);
  assert.equal(uncertainWrite({ response: { status: 400 } }), false);
  assert.equal(uncertainWrite({ response: { status: 404 } }), false);
});


test('attack harm supplies new summaries while legacy summaries and origins survive edits', () => {
  const draft = valid(); draft.statline.harm = ''; draft.attacks = [{ name: 'Strike', harm: 'Heavy (8)', range: '', notes: '' }];
  assert.equal(validate(draft).length, 0); assert.equal(payload(draft).statline.harm, 'Heavy (8)');
  draft.statline.harm = 'Moderate (4)'; assert.equal(payload(draft).statline.harm, 'Moderate (4)');
  draft.attacks[0].harm = 'Brutal ()'; assert.ok(validate(draft).some(i => i.field === 'attack-0-harm'));
  draft.attacks[0].harm = 'Heavy (10)'; assert.ok(validate(draft).some(i => i.field === 'attack-0-harm'));
  assert.deepEqual(plain(toDraft({ ...valid(), origin: 'Shadow', origins: undefined }).origins), ['Shadow']);
  assert.deepEqual(plain(toDraft({ ...valid(), origin: 'Mortal', origins: ['Shadow'] }).origins), ['Mortal']);
  assert.deepEqual(plain(toDraft({ ...valid(), origin: 'Shadow / Beast', origins: ['Shadow', 'Beast'] }).origins), ['Shadow', 'Beast']);
});


test('origin choices merge guide and catalog values without rewriting saved spelling', () => {
  const rules = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('./unwoven.rules.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: rules, exports: rules.exports });
  const { addOrigin, originChoices } = rules.exports;
  const saved = ['shadow', 'Custom Name'];
  assert.equal(addOrigin(saved, ' SHADOW '), saved);
  assert.deepEqual(plain(addOrigin(saved, '  Twilight-born  ')), ['shadow', 'Custom Name', 'Twilight-born']);
  const choices = plain(originChoices(saved, ['Shadow', 'Beast', 'Custom Name']));
  assert.ok(choices.includes('shadow')); assert.ok(!choices.includes('Shadow')); assert.ok(choices.includes('Entity')); assert.ok(choices.includes('Beast'));
  const draft = valid(); draft.origins = ['Shadow', 'Twilight-born']; draft.origin = draft.origins.join(' / ');
  assert.deepEqual(plain(toDraft(payload(draft)).origins), draft.origins); assert.equal(payload(draft).origin, 'Shadow / Twilight-born');
});
