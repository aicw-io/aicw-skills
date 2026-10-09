import { VERSION } from './version.mjs';
import { parseArgs } from 'node:util';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { audit } from './audit.mjs';
import { writeReport, compareReports } from './report.mjs';
import { prepareSubmission, publicURL } from './submission.mjs';
import { fetchCapture } from './io.mjs';
import { BOOK_SOURCE } from './book.mjs';

const help = `AICW Skills ${VERSION} (Node.js 22+)
Based on ${BOOK_SOURCE.author}'s ${BOOK_SOURCE.title}
${BOOK_SOURCE.url}

audit --root DIR [--html-root DIR] [--url http://localhost:PORT]
      [--public-origin https://site.tld] [--pages /,/pricing/]
      [--max-pages 200] [--output DIR] [--online]
      [--browser] [--browser-module RUNTIME_DIR] [--browser-executable FILE]
      [--timeout 10000] [--fail-on-error]
compare --before audit.json --after audit.json
prepare-submission --origin https://site.tld --urls FILE [--sitemap URL]
                   [--key KEY] [--output DIR]
presence --origin https://site.tld --online

Audit is read-only except for an explicitly requested report directory.
Without --output, JSON goes to stdout. No command edits website sources.
--public-origin maps URL identity without enabling any network request.
--online permits the chosen external target. Crawl redirects stay on-origin.
--browser-module is a directory containing node_modules/puppeteer-core.
prepare-submission creates files only. There is no submit command.
presence checks one recent Common Crawl index; it is not proof of AI training.
`;
export async function main(argv = process.argv.slice(2)) {
  const { values: v, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
    root: { type: 'string' }, 'html-root': { type: 'string' }, url: { type: 'string' },
    'public-origin': { type: 'string' }, pages: { type: 'string' }, 'max-pages': { type: 'string' },
    output: { type: 'string' }, online: { type: 'boolean' }, browser: { type: 'boolean' },
    'browser-module': { type: 'string' }, 'browser-executable': { type: 'string' }, timeout: { type: 'string' },
    before: { type: 'string' }, after: { type: 'string' }, origin: { type: 'string' }, urls: { type: 'string' },
    sitemap: { type: 'string' }, key: { type: 'string' }, help: { type: 'boolean', short: 'h' }, 'fail-on-error': { type: 'boolean' },
  } });
  if (v.help || !positionals.length) { console.log(help); return; }
  if (positionals.length !== 1) throw new Error('Supply one command and named options.');
  const command = positionals[0];
  if (command === 'audit') {
    const number = (key, fallback) => { const n = Number(v[key] ?? fallback); if (!Number.isSafeInteger(n) || n < 1) throw new Error(`--${key} must be a positive integer.`); return n; };
    const report = await audit({ root: v.root, htmlRoot: v['html-root'], url: v.url, publicOrigin: v['public-origin'], pages: v.pages?.split(',').map(x => x.trim()).filter(Boolean), maxPages: number('max-pages', 200), timeout: number('timeout', 10000), online: v.online, browser: v.browser, browserModule: v['browser-module'], browserExecutable: v['browser-executable'] });
    if (v.output) { await writeReport(report, v.output); console.log(JSON.stringify({ output: path.resolve(v.output), coverage: report.coverage, summary: report.summary })); }
    else console.log(JSON.stringify(report, null, 2));
    if (v['fail-on-error'] && report.findings.some(f => f.status === 'fail' && f.severity === 'error')) process.exitCode = 1;
  } else if (command === 'compare') {
    if (!v.before || !v.after) throw new Error('compare requires --before and --after.');
    console.log(JSON.stringify(compareReports(JSON.parse(await readFile(v.before, 'utf8')), JSON.parse(await readFile(v.after, 'utf8'))), null, 2));
  } else if (command === 'prepare-submission') {
    if (!v.origin || !v.urls) throw new Error('Supply --origin and --urls (a text file with one URL per line).');
    const urls = (await readFile(v.urls, 'utf8')).split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
    const prepared = prepareSubmission({ origin: v.origin, urls, sitemap: v.sitemap, key: v.key });
    if (v.output) {
      await mkdir(v.output, { recursive: true });
      for (const [name, value] of [['submission.json', JSON.stringify(prepared, null, 2)], ['indexnow.json', JSON.stringify(prepared.indexnow.payload, null, 2)], [prepared.keyFile.name, prepared.keyFile.content]]) await writeFile(path.join(v.output, name), value + '\n', { flag: 'wx' });
      console.log(JSON.stringify({ status: prepared.status, output: path.resolve(v.output) }));
    } else console.log(JSON.stringify(prepared, null, 2));
  } else if (command === 'presence') {
    if (!v.online || !v.origin) throw new Error('presence requires --origin and explicit --online.');
    const site = publicURL(v.origin);
    const origin = 'https://index.commoncrawl.org';
    const indexes = await fetchCapture(origin + '/collinfo.json', { origin });
    if (indexes.status !== 200) throw new Error(`Index list returned HTTP ${indexes.status}.`);
    const latest = JSON.parse(indexes.text)[0];
    const endpoint = new URL(latest['cdx-api']);
    if (endpoint.origin !== origin) throw new Error('Unexpected Common Crawl index origin.');
    endpoint.search = new URLSearchParams({ url: `${site.hostname}/*`, output: 'json', pageSize: '1', filter: 'status:200' }).toString();
    const response = await fetchCapture(endpoint, { origin });
    console.log(JSON.stringify({ book: BOOK_SOURCE, bookPages: '32-37', status: response.status === 200 ? 'observed' : response.status === 404 ? 'not-found-in-this-index' : 'unknown', index: latest.id, httpStatus: response.status, sample: response.status === 200 ? response.text.split('\n').filter(Boolean).slice(0, 5).map(x => JSON.parse(x)) : [], limitation: 'One index and a bounded sample only. Presence does not prove training use, indexing elsewhere, or AI citation.' }, null, 2));
  } else throw new Error(`Unknown command: ${command}`);
}
main().catch(e => { console.error(`AICW: ${e.message}`); process.exitCode = 2; });
