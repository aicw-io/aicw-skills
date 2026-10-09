import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { VERSION } from '../src/version.mjs';

test('every standalone skill works with spaces, Unicode paths, and an unrelated working directory', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aicw portable '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const site = path.join(root, 'website café'), other = path.join(root, 'unrelated');
  await mkdir(site); await mkdir(other);
  const html = '<title>A guide</title><main><h1>A guide</h1><p>Follow these steps.</p></main>';
  await writeFile(path.join(site, 'index.html'), html);
  for (const name of (await readdir('skills')).filter(x => x.startsWith('aicw-'))) {
    const install = path.join(root, 'installed skills', name);
    await cp(path.join('skills', name), install, { recursive: true });
    const result = spawnSync(process.execPath, [path.join(install, 'scripts/audit.mjs'), 'audit', '--root', site], { cwd: other, encoding: 'utf8' });
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
    const report = JSON.parse(result.stdout);
    assert.equal(report.toolVersion, VERSION);
    assert.equal(report.coverage.inspected, 1);
    assert.equal(report.book.url, 'https://aicw.io/books/ai-seo-guide/');
    assert.equal(report.bookChecklist.length, 25);
  }
  assert.equal(await readFile(path.join(site, 'index.html'), 'utf8'), html);
});
