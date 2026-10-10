// Raw versus rendered capture adapted from AICW Visibility's rendering checks.
// Copyright (c) 2026 AICW. MIT.
import { exists } from './io.mjs';
import { finding } from './checks.mjs';
import { inspectHTML, compact } from './html.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function compareBrowser(pages, target, options) {
  const out = [];
  const add = (status, severity, source, evidence, recommendation, extra = {}) => out.push(finding('rendering.compare', 'technical', status, severity, source, evidence, recommendation, extra));
  let browser;
  try {
    let module;
    if (options.browserModule) {
      if (!await exists(path.resolve(options.browserModule, 'node_modules/puppeteer-core/package.json'))) throw new Error('The selected browser runtime has no node_modules/puppeteer-core package.');
      const require = createRequire(path.resolve(options.browserModule, 'package.json'));
      module = await import(pathToFileURL(require.resolve('puppeteer-core')));
    } else module = await import('puppeteer-core');
    let executablePath = options.browserExecutable ?? process.env.CHROME_PATH;
    const candidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
    if (process.platform === 'win32') for (const dir of [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['ProgramFiles(x86)']].filter(Boolean)) candidates.push(path.join(dir, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    if (!executablePath) for (const p of candidates) if (await exists(p)) { executablePath = p; break; }
    if (!executablePath) throw new Error('No Chrome executable found. Set --browser-executable.');
    browser = await module.default.launch({ executablePath, headless: true, args: ['--disable-background-networking', '--disable-component-update', '--no-first-run'] });
    for (const evidence of pages) {
      const page = await browser.newPage();
      const blocked = new Set();
      try {
        await page.setBypassServiceWorker(true);
        await page.setRequestInterception(true);
        page.on('request', request => {
          const u = new URL(request.url());
          if (u.origin === target.origin || ['data:', 'blob:', 'about:'].includes(u.protocol)) request.continue().catch(() => {});
          else { blocked.add(u.origin); request.abort().catch(() => {}); }
        });
        await page.goto(new URL(evidence.route, target.origin).href, { waitUntil: 'networkidle2', timeout: options.timeout ?? 10000 });
        const rendered = inspectHTML(await page.content(), evidence.source);
        const visible = compact(await page.evaluate(() => (document.querySelector('main') ?? document.querySelector('article') ?? document.body)?.innerText ?? ''));
        const rawWords = new Set(evidence.text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
        const renderedWords = new Set(visible.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
        const missingWords = [...renderedWords].filter(w => !rawWords.has(w));
        const missingHeadings = rendered.headings.filter(h => !evidence.headings.some(r => r.text === h.text)).map(h => h.text);
        const changed = missingHeadings.length > 0 || missingWords.length > Math.max(5, renderedWords.size * 0.1) || rendered.jsonld.length !== evidence.jsonld.length;
        add(changed ? 'review' : 'pass', changed ? 'warning' : 'info', evidence.source,
          `${evidence.text.length} raw text characters; ${visible.length} rendered; ${missingWords.length} rendered words absent from raw text.`,
          'Review missing main content and JSON-LD. This comparison does not simulate every crawler or prove indexing.',
          { rawCharacters: evidence.text.length, renderedCharacters: visible.length, missingHeadings, missingWords: missingWords.slice(0, 60), rawJsonldBlocks: evidence.jsonld.length, renderedJsonldBlocks: rendered.jsonld.length, blockedOrigins: [...blocked] });
        if (blocked.size) add('skipped', 'info', evidence.source, `External resources blocked: ${[...blocked].join(', ')}`, 'The capture is incomplete if essential scripts use these origins. Inspect them separately with authorization.');
      } catch (e) { add('unknown', 'warning', evidence.source, e.message, 'Resolve the local preview/browser problem, then repeat.'); }
      finally { await page.close(); }
    }
  } catch (e) { add('skipped', 'info', target.href, e.message, 'Install puppeteer-core in a separate runtime directory and supply --browser-module plus an installed Chrome executable.'); }
  finally { await browser?.close(); }
  return out;
}
