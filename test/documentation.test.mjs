import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Case 001 publication record preserves evidence boundary', async () => {
  const text = await readFile(new URL('../docs/case-studies/CASE-001-THE-BAG-THAT-DISAPPEARED.md', import.meta.url), 'utf8');
  for (const heading of ['Executive summary', 'Incident chronology', 'Known facts', 'Unverified details', 'Evidence inventory', 'Proposed RailRecover intervention', 'Current unresolved status', 'Privacy and publication considerations']) {
    assert.match(text, new RegExp(`## ${heading}`));
  }
  assert.match(text, /same physical train/i);
  assert.match(text, /No verified recovery event is recorded/i);
  assert.doesNotMatch(text, /Blue spiral notebook/i);
});

test('interactive study includes all five synthetic scenarios', async () => {
  const text = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  for (const label of ['Case 001', 'Medication needed within hours', 'Passport before international travel', 'Found-item handover', 'Competing ownership claims']) {
    assert.match(text, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
