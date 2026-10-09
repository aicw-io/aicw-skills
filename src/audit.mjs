import { VERSION } from './version.mjs';
import path from 'node:path';
import { BOOK_SOURCE, checklistEvidence } from './book.mjs';
import { readFile } from 'node:fs/promises';
import { inspectHTML } from './html.mjs';
import { checkPage, checkRobots, parseSitemap, finding } from './checks.mjs';
import { checkTarget, discover, fetchCapture, fileRoute, htmlFiles, safeRead } from './io.mjs';

export async function audit(options = {}) {
  const maxPages = options.maxPages ?? 200;
  const project = await discover(options.root, options.htmlRoot);
  const target = options.url ? await checkTarget(options.url, options.online) : null;
  if (!target && !project.htmlRoot) throw new Error('No rendered HTML found. Build the project, set --html-root, or supply a preview --url or a public --url with --online. WordPress PHP files are not rendered HTML.');
  const publicOrigin = options.publicOrigin ? new URL(options.publicOrigin).origin : null;
  const identity = publicOrigin ?? target?.origin ?? 'https://local-audit.invalid';
  const report = { version: 2, book: BOOK_SOURCE, toolVersion: VERSION, createdAt: new Date().toISOString(), project,
    mode: target ? 'http' : 'files', publicOrigin, target: target?.href ?? null,
    coverage: { maxPages, inspected: 0, truncated: false, sitemapLimit: 30 }, pages: [], findings: [],
    limitations: ['File and preview checks do not establish production access. Public HTTP checks observe only the selected responses; they do not prove search indexing, AI citations, or ranking.', 'Intent, factual accuracy, and schema suitability require agent review. Complete Checklist 2 validation needs Schema Markup Validator or Google Rich Results Test evidence.'] };
  const add = (rule, status, severity, source, evidence, recommendation) => report.findings.push(finding(rule, 'technical', status, severity, source, evidence, recommendation));
  const allowedOrigins = new Set([identity, ...(target ? [target.origin] : [])]);
  const queue = [], queued = new Set(), inspected = new Map();
  function enqueue(p) {
    if (!queued.has(p)) { queued.add(p); queue.push(p); }
  }
  function internalRoute(href, base = identity) {
    try {
      const u = new URL(href, base);
      if (!['http:', 'https:'].includes(u.protocol) || !allowedOrigins.has(u.origin) || u.username || u.password) return null;
      return u.pathname + u.search;
    } catch { return null; }
  }
  async function capture(route) {
    if (target) return fetchCapture(new URL(route, target.origin), { origin: target.origin, timeout: options.timeout });
    const found = await safeRead(project.htmlRoot, new URL(route, identity).pathname);
    return found ? { status: 200, text: found.text, file: found.file, headers: {}, bytes: Buffer.byteLength(found.text) } : { status: 404, text: '', headers: {} };
  }
  const explicitPages = options.pages?.length ? options.pages : null;
  if (explicitPages) {
    for (const p of explicitPages) { const route = internalRoute(p); if (!route) throw new Error(`Page is outside the target origin: ${p}`); enqueue(route); }
  } else if (target) enqueue(target.pathname + target.search);
  else {
    const files = await htmlFiles(project.htmlRoot, maxPages + 1);
    report.coverage.truncated = files.length > maxPages;
    for (const file of files) enqueue(fileRoute(file, project.htmlRoot));
  }
  let sitemaps = ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml'];
  try {
    const robot = await capture('/robots.txt');
    if (robot.status === 200 && !/^\s*<!doctype html|^\s*<html/i.test(robot.text)) {
      report.robots = { text: robot.text, status: 200 };
      const result = checkRobots(robot.text, identity, []);
      for (const s of result.sitemaps) { const route = internalRoute(s); if (route) sitemaps.unshift(route); else add('sitemap.external', 'skipped', 'info', s, 'Sitemap is outside the configured origin.', 'Audit this sitemap separately if it belongs to this site.'); }
    } else if (robot.status === 404) add('robots.missing', 'review', 'info', '/robots.txt', 'No robots.txt found.', 'Absence gives no robots exclusion rules. It does not establish access or indexing.');
    else add('robots.response', 'unknown', 'warning', '/robots.txt', `HTTP ${robot.status}; response is not usable robots text.`, 'Inspect the selected route or server response.');
  } catch (e) { add('robots.fetch', 'unknown', 'warning', '/robots.txt', e.message, 'Resolve the fetch failure and repeat the audit.'); }
  const seenSitemaps = new Set(), sitemapURLs = new Set();
  while (sitemaps.length && seenSitemaps.size < 30) {
    const route = sitemaps.shift();
    if (seenSitemaps.has(route)) continue;
    seenSitemaps.add(route);
    try {
      const data = await capture(route);
      if (data.status === 404) continue;
      if (data.status !== 200) { add('sitemap.response', 'unknown', 'warning', route, `HTTP ${data.status}`, 'Inspect the sitemap endpoint.'); continue; }
      const sitemap = parseSitemap(data.text);
      add('sitemap.parse', 'pass', 'info', route, `${sitemap.entries.length} entries in ${sitemap.index ? 'index' : 'urlset'}.`, 'Compare listed URLs with the pages intended for discovery and check their routes on the selected target.');
      for (const entry of sitemap.entries) {
        const mapped = internalRoute(entry.url);
        if (!mapped) { add('sitemap.external', 'skipped', 'info', route, entry.url, 'Confirm the sitemap host matches the intended public origin.'); continue; }
        if (sitemap.index) sitemaps.push(mapped);
        else {
          sitemapURLs.add(mapped);
          if (!explicitPages && !/\.(pdf|png|jpe?g|gif|webp|zip|mp4|xml)$/i.test(new URL(entry.url).pathname)) enqueue(mapped);
          if (entry.lastmod && (Number.isNaN(Date.parse(entry.lastmod)) || Date.parse(entry.lastmod) > Date.now())) add('sitemap.lastmod', 'review', 'warning', route, `${entry.url}: ${entry.lastmod}`, 'Use the date of a real significant update, not every build time.');
        }
      }
    } catch (e) { add('sitemap.invalid', 'unknown', 'warning', route, e.message, 'Inspect XML and response evidence, then fix the source generator.'); }
  }
  if (sitemaps.length) { report.coverage.truncated = true; add('sitemap.limit', 'skipped', 'info', identity, 'Sitemap traversal reached 30 documents.', 'Audit additional sitemap branches explicitly.'); }
  if (!sitemapURLs.size) add('sitemap.none', 'review', 'info', identity, 'No page URLs discovered from inspected sitemaps.', 'Inspect robots declarations and the CMS sitemap endpoint. Small linked sites can be discovered without a sitemap.');
  for (let i = 0; i < queue.length && i < maxPages; i++) {
    const route = queue[i];
    try {
      const result = await capture(route);
      inspected.set(route, result.status);
      if (result.status !== 200) { add('page.response', 'fail', 'error', route, `HTTP ${result.status}`, 'Repair the route or update links and sitemap entries.'); continue; }
      if (!target && !/\.html?$/i.test(result.file ?? '')) { add('page.source-not-html', 'skipped', 'warning', route, 'The selected file is not rendered HTML.', 'Use a local preview for PHP or other dynamic source files.'); continue; }
      if (target && !/html/i.test(result.headers['content-type'] ?? '')) { add('page.content-type', 'skipped', 'info', route, result.headers['content-type'] ?? '(none)', 'Use an HTML page for content and JSON-LD checks.'); continue; }
      const page = inspectHTML(result.text, result.file ?? new URL(route, target.origin).href);
      page.url = new URL(route, identity).href;
      page.route = route;
      if (target) {
        page.response = { status: result.status, finalURL: result.url, ttfbMs: result.ttfbMs, contentType: result.headers['content-type'], xRobotsTag: result.headers['x-robots-tag'] };
        add('http.timing', 'review', 'info', page.source, `One response: ${result.ttfbMs} ms to headers; ${result.bytes} bytes.`, 'Single-request timings are diagnostic only. Use repeated production measurements for speed or Core Web Vitals conclusions.');
        if (result.headers['x-robots-tag']) add('http.robots', 'review', 'warning', page.source, result.headers['x-robots-tag'], 'Preserve intentional preview restrictions and inspect production configuration separately.');
      }
      report.pages.push(page);
      report.findings.push(...checkPage(page));
      if (!explicitPages) for (const link of page.links) {
        const route = internalRoute(link.href, page.url);
        if (route && !/\.[a-z0-9]+$/i.test(new URL(route, identity).pathname.replace(/\.html?$/i, '')) && !/\/(wp-admin|wp-login\.php|logout|cart|checkout)(\/|$)/i.test(route)) enqueue(route);
      }
    } catch (e) { inspected.set(route, null); add('page.fetch', 'unknown', 'warning', route, e.message, 'Resolve the runtime or fetch failure.'); }
  }
  if (inspected.size < queue.length) report.coverage.truncated = true;
  report.coverage.inspected = report.pages.length;
  report.coverage.discovered = queued.size;
  if (report.robots) report.findings.push(...checkRobots(report.robots.text, identity, report.pages.map(p => p.url)).findings);
  if (!target) add('http.unavailable', 'skipped', 'info', project.htmlRoot, 'File audit has no HTTP headers or server status evidence.', 'Supply the selected preview or public URL to inspect HTTP behavior.');
  if (options.browser) {
    if (!target) add('rendering.unavailable', 'skipped', 'info', identity, 'Browser comparison requires a preview or public URL.', 'Supply --url for the selected target, with --online for a public URL.');
    else {
      const { compareBrowser } = await import('./browser.mjs');
      report.findings.push(...await compareBrowser(report.pages, target, options));
    }
  } else add('rendering.unavailable', 'skipped', 'info', identity, 'Browser comparison was not requested.', 'Use --browser with --url when JavaScript visibility needs testing.');
  report.bookChecklist = checklistEvidence(report.findings);
  report.summary = report.findings.reduce((a, f) => ({ ...a, [f.status]: (a[f.status] ?? 0) + 1 }), {});
  return report;
}
