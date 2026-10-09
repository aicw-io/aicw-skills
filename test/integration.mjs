import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { build } from 'astro';
import { runCLI } from '@wp-playground/cli';
import { audit } from '../src/audit.mjs';
import { compareReports } from '../src/report.mjs';
import { inspectHTML } from '../src/html.mjs';
import { checkJsonLD } from '../src/checks.mjs';

const root = path.resolve('.tmp'); await mkdir(root, { recursive: true });
const work = await mkdtemp(path.join(root, 'integration-'));
const results = [];
const bad = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage', '@id': 'https://sample.tld/#page', mainEntity: { '@id': 'https://sample.tld/#article' } }, { '@type': 'Article', headline: 'Choose cloud storage' }] };
const good = structuredClone(bad); good['@graph'][1]['@id'] = 'https://sample.tld/#article';
const body = '<main><h1>Choose cloud storage for a small team</h1><p>Compare storage capacity, sharing controls, and export support before selecting a plan.</p></main>';
const html = data => `<html lang="en"><head><title>Choose cloud storage for a small team</title><meta name="description" content="Compare capacity, sharing, and export support."><link rel="canonical" href="https://sample.tld/"><script type="application/ld+json">${JSON.stringify(data)}</script></head><body>${body}</body></html>`;
const refCount = r => r.findings.filter(f => f.rule === 'jsonld.reference').length;
let wp;
try {
  const staticRoot = path.join(work, 'html'); await mkdir(staticRoot);
  await writeFile(path.join(staticRoot, 'index.html'), html(bad));
  const before = await audit({ root: staticRoot, publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(before), 1);
  await writeFile(path.join(staticRoot, 'index.html'), html(good));
  const after = await audit({ root: staticRoot, publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(after), 0);
  assert.ok(compareReports(before, after).noLongerReported.some(x => x.rule === 'jsonld.reference'));
  const stable = await readFile(path.join(staticRoot, 'index.html'), 'utf8');
  const repeated = await audit({ root: staticRoot, publicOrigin: 'https://sample.tld' });
  assert.equal(repeated.pages[0].jsonld.length, 1);
  assert.equal(await readFile(path.join(staticRoot, 'index.html'), 'utf8'), stable);
  results.push({ scenario: 'HTML source repair and repeat audit', status: 'passed' });
  console.log('HTML integration passed');

  const astroRoot = path.join(work, 'astro'); await mkdir(path.join(astroRoot, 'src/pages'), { recursive: true });
  await writeFile(path.join(astroRoot, 'package.json'), JSON.stringify({ name: 'aicw-test-site', version: '1.0.0', type: 'module', dependencies: { astro: '7.3.8' } }));
  const source = data => `---\nconst graph = ${JSON.stringify(data)};\nconst serialized = JSON.stringify(graph).replace(/</g, '\\\\u003c');\n---\n<html lang="en"><head><title>Choose cloud storage</title><script type="application/ld+json" set:html={serialized}/></head><body>${body}</body></html>`;
  await writeFile(path.join(astroRoot, 'src/pages/index.astro'), source(bad));
  await build({ root: pathToFileURL(astroRoot + '/'), logLevel: 'silent' });
  const astroBefore = await audit({ root: astroRoot, htmlRoot: 'dist', publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(astroBefore), 1);
  await writeFile(path.join(astroRoot, 'src/pages/index.astro'), source(good));
  await build({ root: pathToFileURL(astroRoot + '/'), logLevel: 'silent' });
  const astroAfter = await audit({ root: astroRoot, htmlRoot: 'dist', publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(astroAfter), 0);
  assert.equal(astroAfter.project.stack, 'astro');
  results.push({ scenario: 'Astro source repair, build, and generated output audit', status: 'passed' });
  console.log('Astro integration passed');

  const dynamic = http.createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('content-type', 'text/html');
      res.end('<html><head><title>Dynamic answer</title></head><body><main id="answer"></main><script>document.getElementById("answer").innerHTML="<h1>How to export your data</h1><p>Open account settings and choose Export. Download the archive after processing finishes.</p>";</script></body></html>');
    } else { res.statusCode = 404; res.end(); }
  });
  await new Promise(r => dynamic.listen(0, '127.0.0.1', r));
  try {
    const browser = await audit({ url: `http://127.0.0.1:${dynamic.address().port}`, pages: ['/'], browser: true, browserModule: path.resolve('.'), timeout: 15000 });
    const result = browser.findings.find(f => f.rule === 'rendering.compare' && f.missingHeadings?.length);
    assert.ok(result, JSON.stringify(browser.findings.filter(f => f.rule === 'rendering.compare')));
    assert.equal(result.status, 'review');
    assert.ok(result.missingHeadings.includes('How to export your data'));
    results.push({ scenario: 'Real Chrome detects main answer missing from raw HTML', status: 'passed' });
    console.log('Browser integration passed');
  } finally { await new Promise(r => dynamic.close(r)); }

  console.log('Starting isolated WordPress; first run can download runtime assets.');
  // The generated runtime and database are mounted entirely inside the ignored test directory.
  const wordpressRoot = path.join(work, 'wordpress'); await mkdir(wordpressRoot);
  wp = await runCLI({ command: 'server', port: 0, wp: '6.8', php: '8.3', quiet: true,
    'mount-before-install': [{ hostPath: wordpressRoot, vfsPath: '/wordpress' }],
    blueprint: { steps: [{ step: 'runPHP', code: '<?php require "/wordpress/wp-load.php"; update_option("blog_public", 1);' }] },
  });
  async function php(code) {
    const result = await wp.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` });
    if (result.errors) throw new Error(result.errors);
    return result.text;
  }
  const jsonPhp = data => JSON.stringify(JSON.stringify(data));
  await wp.playground.mkdir('/wordpress/wp-content/mu-plugins');
  await wp.playground.writeFile('/wordpress/wp-content/mu-plugins/aicw-integration.php', `<?php
add_action('wp_head', function() { $data = get_option('aicw_test_graph'); if ($data) echo '<script type="application/ld+json">' . $data . '</script>'; });
`);
  await php(`update_option('aicw_test_graph', ${jsonPhp(bad)});`);
  const beforeText = await php(`echo get_option('aicw_test_graph');`);
  assert.equal(JSON.parse(beforeText)['@graph'][1]['@id'], undefined);
  const wpBefore = await audit({ url: wp.serverUrl, pages: ['/'], publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(wpBefore), 1);
  // SQLite's VACUUM INTO makes a consistent database backup through its API.
  await php(`$db = new SQLite3(FQDB); $db->exec("VACUUM INTO '/tmp/aicw-backup.sqlite'"); $db->close();`);
  const backup = await wp.playground.readFileAsBuffer('/tmp/aicw-backup.sqlite');
  const backupPath = path.join(work, 'wordpress-backup.sqlite'); await writeFile(backupPath, backup);
  assert.ok(backup.length > 1000);
  await php(`update_option('aicw_test_graph', ${jsonPhp(good)});`);
  const wpAfter = await audit({ url: wp.serverUrl, pages: ['/'], publicOrigin: 'https://sample.tld' });
  assert.equal(refCount(wpAfter), 0);
  const dbPath = await php('echo FQDB;');
  await wp[Symbol.asyncDispose](); wp = null;
  const nativeDb = path.join(wordpressRoot, path.relative('/wordpress', dbPath));
  await cp(backupPath, nativeDb);
  // Remove only test database sidecars after stopping PHP, before restoring.
  await rm(nativeDb + '-wal', { force: true }); await rm(nativeDb + '-shm', { force: true });
  wp = await runCLI({ command: 'server', port: 0, wp: '6.8', php: '8.3', quiet: true,
    wordpressInstallMode: 'do-not-attempt-installing',
    'mount-before-install': [{ hostPath: wordpressRoot, vfsPath: '/wordpress' }],
  });
  const restored = await php(`echo get_option('aicw_test_graph');`);
  assert.equal(restored, beforeText);
  results.push({ scenario: 'WordPress API update, rendered audit, SQLite backup and restoration', status: 'passed' });
  console.log('WordPress integration passed');
} finally {
  if (wp) await wp[Symbol.asyncDispose]();
  await writeFile(path.join(root, 'integration-results.json'), JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify({ results, workspace: work }, null, 2));
}
