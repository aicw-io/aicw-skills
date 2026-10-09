import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { audit } from '../src/audit.mjs';
import { safeRead, checkTarget, fetchCapture } from '../src/io.mjs';

const tmp = path.resolve('.tmp'); await mkdir(tmp, { recursive: true });
const html = '<html lang="en"><head><title>Guide</title></head><body><main><h1>Guide</h1><p>A useful guide.</p></main></body></html>';
async function fixture(t) { const root = await mkdtemp(path.join(tmp, 'test-')); t.after(() => rm(root, { recursive: true, force: true })); return root; }
async function server(t, handler) {
  const s = http.createServer(handler); await new Promise(r => s.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => s.close(r))); return `http://127.0.0.1:${s.address().port}`;
}
test('file audit is read-only and reports absent HTTP evidence', async t => {
  const root = await fixture(t); await writeFile(path.join(root, 'index.html'), html);
  const before = createHash('sha256').update(await readFile(path.join(root, 'index.html'))).digest('hex');
  const report = await audit({ root });
  assert.equal(report.pages.length, 1);
  assert.ok(report.findings.some(x => x.rule === 'http.unavailable' && x.status === 'skipped'));
  assert.equal(before, createHash('sha256').update(await readFile(path.join(root, 'index.html'))).digest('hex'));
});
test('local nested sitemap routes use preview origin and alternate WP sitemap location', async t => {
  const hits = [];
  const url = await server(t, (req, res) => {
    hits.push(req.url);
    if (req.url === '/robots.txt') { res.end('Sitemap: https://aicw.io/wp-sitemap.xml'); return; }
    if (req.url === '/wp-sitemap.xml') { res.end('<sitemapindex><sitemap><loc>https://aicw.io/pages.xml</loc></sitemap></sitemapindex>'); return; }
    if (req.url === '/pages.xml') { res.end('<urlset><url><loc>https://aicw.io/guide/</loc></url></urlset>'); return; }
    if (['/', '/guide/'].includes(req.url)) { res.setHeader('content-type', 'text/html'); res.end(html); return; }
    res.statusCode = 404; res.end('missing');
  });
  const report = await audit({ url, publicOrigin: 'https://aicw.io' });
  assert.equal(report.pages.length, 2); assert.ok(hits.includes('/guide/'));
  assert.equal(report.pages[1].url, 'https://aicw.io/guide/');
});
test('network failures and robots errors never produce an access pass', async t => {
  const url = await server(t, (req, res) => {
    if (req.url === '/robots.txt') { res.statusCode = 503; res.end('temporary failure'); }
    else if (req.url === '/') { res.setHeader('content-type', 'text/html'); res.end(html); }
    else { res.statusCode = 404; res.end(); }
  });
  const report = await audit({ url });
  assert.ok(report.findings.some(f => f.rule === 'robots.response' && f.status === 'unknown'));
  assert.ok(!report.findings.some(f => f.rule.startsWith('robots.') && f.status === 'pass'));
});
test('cross-origin redirects are blocked before fetching the other origin', async t => {
  let destinationHits = 0;
  const dest = await server(t, (req, res) => { destinationHits++; res.end('never'); });
  const src = await server(t, (req, res) => { res.statusCode = 302; res.setHeader('location', dest); res.end(); });
  await assert.rejects(fetchCapture(src, { origin: src, retries: 0 }), /Cross-origin/);
  assert.equal(destinationHits, 0);
});
test('response size limit and timeout are bounded failures', async t => {
  const url = await server(t, (req, res) => res.end('x'.repeat(100)));
  await assert.rejects(fetchCapture(url, { origin: url, maxBytes: 10, retries: 0 }), /exceeds/);
  await assert.rejects(fetchCapture(url, { origin: url, timeout: 5, retries: 0, fetcher: async (url, opts) => new Promise((resolve, reject) => opts.signal.addEventListener('abort', () => reject(new Error('timeout')))) }), /timeout/);
});
test('public network target requires explicit online flag', async () => {
  await assert.rejects(checkTarget('https://1.1.1.1'), /requires --online/);
});
test('URL-only CLI audit keeps an unrelated working directory out of its evidence', async t => {
  const unrelated = await fixture(t), hits = [];
  await writeFile(path.join(unrelated, 'package.json'), JSON.stringify({ dependencies: { astro: '*' } }));
  await writeFile(path.join(unrelated, 'index.html'), '<title>Unrelated private website</title>');
  const url = await server(t, (req, res) => {
    hits.push(req.url);
    if (req.url === '/selected/') {
      res.setHeader('content-type', 'text/html');
      res.end(html.replace('</main>', '<a href="/other/">Other page</a></main>'));
    } else { res.statusCode = 404; res.end(); }
  });
  // Exercise online mode against a controlled server, without contacting a public site.
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve('src/cli.mjs'), 'audit', '--url', url, '--online', '--pages', '/selected/'], { cwd: unrelated });
    let stdout = '', stderr = '';
    child.stdout.on('data', x => { stdout += x; });
    child.stderr.on('data', x => { stderr += x; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(result.code, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.project.root, null);
  assert.equal(report.project.htmlRoot, null);
  assert.deepEqual(report.pages.map(p => p.url), [url + '/selected/']);
  assert.ok(!result.stdout.includes('Unrelated private website'));
  assert.ok(!hits.includes('/other/'));
});
test('safe file reader cannot follow symlinks out of the audit root', async t => {
  const root = await fixture(t), outside = await fixture(t);
  await writeFile(path.join(outside, 'private.txt'), 'private');
  await symlink(outside, path.join(root, 'linked'), 'junction');
  assert.equal(await safeRead(root, '/linked/private.txt'), null);
  assert.equal(await safeRead(root, '/../' + path.basename(outside) + '/private.txt'), null);
});
test('crawl page limit includes failed attempts and reports incomplete coverage', async t => {
  const url = await server(t, (req, res) => {
    if (req.url === '/') { res.setHeader('content-type', 'text/html'); res.end(html.replace('</main>', '<a href="/bad/">bad</a><a href="/other/">other</a></main>')); }
    else { res.statusCode = 404; res.end(); }
  });
  const report = await audit({ url, maxPages: 2 });
  assert.equal(report.coverage.inspected, 1); assert.equal(report.coverage.truncated, true);
});
test('explicit pages exclude unrelated local pages', async t => {
  const root = await fixture(t); await writeFile(path.join(root, 'index.html'), html); await writeFile(path.join(root, 'other.html'), html);
  const report = await audit({ root, pages: ['/other.html'] });
  assert.equal(report.pages.length, 1); assert.equal(report.pages[0].route, '/other.html');
});
test('WordPress source without runtime is not mistaken for rendered output', async t => {
  const root = await fixture(t); await writeFile(path.join(root, 'wp-config.php'), '<?php');
  await assert.rejects(audit({ root }), /WordPress PHP files/);
});
test('explicit file selection cannot mislabel PHP source as rendered HTML', async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'wp-config.php'), '<?php');
  await writeFile(path.join(root, 'index.php'), '<?php echo "<h1>A dynamic page</h1>";');
  const report = await audit({ root, htmlRoot: '.', pages: ['/index.php'] });
  assert.equal(report.pages.length, 0);
  assert.ok(report.findings.some(f => f.rule === 'page.source-not-html' && f.status === 'skipped'));
});
test('a copied skill runs without repo dependencies and reports missing browser module', async t => {
  const root = await fixture(t); const site = await fixture(t);
  await cp('skills/aicw-jsonld', path.join(root, 'skill'), { recursive: true });
  await writeFile(path.join(site, 'index.html'), html);
  const cli = spawnSync(process.execPath, [path.join(root, 'skill/scripts/audit.mjs'), 'audit', '--root', site], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr); assert.equal(JSON.parse(cli.stdout).pages.length, 1);
  const url = await server(t, (req, res) => { res.setHeader('content-type', 'text/html'); res.end(html); });
  const report = await audit({ url, pages: ['/'], browser: true, browserModule: path.join(root, 'absent') });
  assert.ok(report.findings.some(f => f.rule === 'rendering.compare' && f.status === 'skipped'));
  const missing = await audit({ url, pages: ['/'], browser: true, browserExecutable: path.join(root, 'missing-chrome') });
  assert.ok(missing.findings.some(f => f.rule === 'rendering.compare' && f.status === 'skipped'));
});
