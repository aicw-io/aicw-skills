import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BOOK_SOURCE, BOOK_CHECKLIST, ruleProvenance } from '../src/book.mjs';
import { inspectHTML } from '../src/html.mjs';
import { checkPage, checkJsonLD } from '../src/checks.mjs';
import { audit } from '../src/audit.mjs';
import { markdownReport } from '../src/report.mjs';

test('book scope preserves all four printed checklists and rejects unreviewed audit rules', () => {
  assert.deepEqual([1, 2, 3, 4].map(n => BOOK_CHECKLIST.filter(x => x.checklist === n).length), [7, 4, 8, 6]);
  assert.deepEqual([...new Set(BOOK_CHECKLIST.map(x => x.page))], [45, 64, 71, 79]);
  assert.throws(() => ruleProvenance('html.keyword-density'), /no reviewed book basis/);
});

test('keyword-heavy and task-focused pages both require all seven semantic judgments', () => {
  const weak = inspectHTML('<title>Cloud storage</title><main><h1>Cloud storage</h1><p>Cloud storage for teams. Secure cloud storage. The best cloud storage.</p><h2>Why cloud storage?</h2><p>Choose cloud storage.</p></main>', 'before.html');
  const useful = inspectHTML('<title>Choose storage for a two-person team</title><main><h1>Which plan fits a two-person team?</h1><p>In this fictional example, Duo includes two members and 100 GB of shared storage. Team includes five members and 500 GB. Choose Duo if both limits cover your needs.</p><h2>What if we need a third member?</h2><p>Choose Team. Its member limit is five.</p></main>', 'after.html');
  for (const page of [weak, useful]) {
    const rows = checkPage(page).filter(x => x.category === 'content');
    assert.deepEqual(rows.map(x => x.book.checklistItems[0]), ['C1.1', 'C1.2', 'C1.3', 'C1.4', 'C1.5', 'C1.6', 'C1.7']);
    assert.ok(rows.every(x => x.status === 'review'));
  }
  assert.match(checkPage(useful).find(x => x.rule === 'content.title-intent').evidence, /two-person/);
});

test('general SEO extras do not become book recommendations', () => {
  const p = inspectHTML('<main><h1>One</h1><h1>Two</h1><img src="x.png"><p>Useful answer.</p></main>', 'index.html');
  const rules = checkPage(p).map(x => x.rule);
  assert.ok(!rules.some(x => /^html\.(description|language|h1|canonical|image-alt)/.test(x)));
});

test('full report exposes attribution and unfinished book coverage instead of claiming all items passed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aicw-book-'));
  try {
    await writeFile(path.join(root, 'index.html'), '<title>A guide</title><main><h1>A guide</h1><p>Read the steps.</p></main>');
    const report = await audit({ root });
    assert.equal(report.book.url, BOOK_SOURCE.url);
    assert.equal(report.bookChecklist.length, 25);
    assert.ok(report.bookChecklist.every(x => x.status === 'not-assessed'));
    assert.equal(report.bookChecklist.find(x => x.id === 'C4.3').findingIndexes.length, 0);
    assert.ok(report.findings.every(x => x.book.checklistItems.length && x.kind));
    const md = markdownReport(report);
    assert.ok(md.includes(`[${BOOK_SOURCE.title}](${BOOK_SOURCE.url})`));
    assert.ok(md.includes(BOOK_SOURCE.author));
    assert.ok(md.includes('C1.7') && md.includes('C4.6'));
    assert.match(md, /not-assessed/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('printed media correction identifies both its book example and technical definition', () => {
  const p = inspectHTML('<script type="application/ld+json">{"@context":"https://schema.org","@type":"VideoObject","transcript":{"@type":"Text","text":"Hello"}}</script>', 'index.html');
  const f = checkJsonLD(p).find(x => x.rule === 'jsonld.transcript');
  assert.equal(f.kind, 'current-correction');
  assert.match(f.correctionOf, /page 62/);
  assert.deepEqual(f.implementationSources, ['https://schema.org/transcript']);
});

test('JSON arrays containing primitive roots do not pass as valid node arrays', () => {
  for (const value of ['[42]', '[null]', '["schema"]', '[[{}]]']) {
    const p = inspectHTML(`<script type="application/ld+json">${value}</script>`, 'index.html');
    assert.ok(checkJsonLD(p).some(x => x.rule === 'jsonld.root' && x.status === 'fail'));
  }
});
