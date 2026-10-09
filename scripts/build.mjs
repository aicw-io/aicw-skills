import { build } from 'esbuild';
import { mkdir, readdir, readFile, writeFile, cp, mkdtemp, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOK_SOURCE, BOOK_CHECKLIST } from '../src/book.mjs';
import { parse, stringify } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const skills = (await readdir(path.join(root, 'skills'))).filter(x => x.startsWith('aicw-')).sort();
const worksheet = [
  '# Book checklist review worksheet', '',
  `Based on ${BOOK_SOURCE.author}’s [${BOOK_SOURCE.title}](${BOOK_SOURCE.url}), full 84-page PDF. The items below are paraphrases of its four checklists.`, '',
  'For each relevant item, record: page or site scope, status, quoted or measured evidence with its location, proposed action, authoritative source to edit, and verification after the edit. Use satisfied, partial, gap, not-assessed, or not-applicable. Explain not-applicable decisions. Keep before and after assessments separate.', '',
  'The automatic audit leaves all checklist assessments as not-assessed and links available findings as evidence. Parsing JSON, finding a title, or counting keywords cannot complete a book checklist. The agent must read the page and finish the relevant rows. A focused skill may leave unrelated checklists unassessed.', '',
  '| Item | PDF page | Book principle | Evidence and review required |',
  '| --- | --- | --- | --- |',
  ...BOOK_CHECKLIST.map(x => `| ${x.id} | ${x.page} | ${x.principle} | ${x.review} |`), '',
  '## Record application decisions explicitly', '',
  'Checklist 1 recommends FAQs, and pages 42-44 discuss both general FAQ pages and embedded sections. Assess both. If no useful recurring questions fit a selected page, explain the applicability decision. An absent FAQ is not a satisfied implementation item.', '',
  'Checklist 3 recommends SSR. Existing static HTML can already deliver the essential content in the initial response; this does not require migrating an HTML or Astro site to a server framework. Record the raw content evidence.', '',
  'Checklist 3 suggests frequency and priority tags on large sites. Keep the item visible, but label the current Google exception from [implementation notes](implementation-notes.md). Do not silently replace that item with a different SEO rule.', '',
  'Chapter 7 also discusses media JSON-LD and C2PA (pages 61-63), optional llms.txt (pages 64-66), and engine submissions (pages 66-70). Chapter 5 discusses Common Crawl (pages 32-37). Apply these when relevant, cite those pages, and mark unavailable evidence explicitly.', '',
].join('\n');
await writeFile(path.join(root, 'resources/book-checklist.md'), worksheet);
const result = await build({ absWorkingDir: root, entryPoints: ['src/cli.mjs'], bundle: true, write: false,
  format: 'esm', platform: 'node', target: 'node22', minify: false, legalComments: 'inline',
  external: ['puppeteer-core'], banner: { js: '#!/usr/bin/env node\n// Generated from src/. AGPL-3.0-only. See LICENSE, NOTICE.md, and licenses/.\nimport { createRequire as _createRequire } from "node:module"; const require = _createRequire(import.meta.url);' },
});
const licenses = [];
const seen = new Set();
async function dependencyLicenses(name, parent = root) {
  let dir = path.join(parent, 'node_modules', name);
  try { await readFile(path.join(dir, 'package.json')); } catch { dir = path.join(root, 'node_modules', name); }
  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
  if (seen.has(`${pkg.name}@${pkg.version}`)) return;
  seen.add(`${pkg.name}@${pkg.version}`);
  const names = (await readdir(dir)).filter(x => /^(license|licence|copying|notice)(\.|$)/i.test(x));
  if (!names.length && name === '@nodable/entities') licenses.push({ name: '@nodable__entities--LICENSE', text: await readFile(path.join(root, 'third-party/licenses/nodable-entities-LICENSE'), 'utf8') });
  else if (!names.length) throw new Error(`Missing license for bundled dependency ${name}`);
  for (const filename of names) licenses.push({ name: `${name.replaceAll('/', '__')}--${filename}`, text: await readFile(path.join(dir, filename), 'utf8') });
  for (const child of Object.keys(pkg.dependencies ?? {})) await dependencyLicenses(child, dir);
}
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
for (const name of Object.keys(pkg.dependencies)) await dependencyLicenses(name);
await mkdir(path.join(root, '.tmp'), { recursive: true });
const staging = await mkdtemp(path.join(root, '.tmp', 'skill-build-'));
try {
for (const name of skills) {
  const skill = path.join(root, 'skills', name);
  const staged = path.join(staging, name);
  await mkdir(path.join(staged, 'scripts'), { recursive: true });
  await mkdir(path.join(staged, 'licenses'), { recursive: true });
  await writeFile(path.join(staged, 'scripts/audit.mjs'), result.outputFiles[0].text, { mode: 0o755 });
  await cp(path.join(root, 'resources'), path.join(staged, 'references'), { recursive: true });
  for (const l of licenses) await writeFile(path.join(staged, 'licenses', l.name), l.text);
  // These three folders are build-owned; replace them instead of merging stale files.
  for (const dir of ['scripts', 'references', 'licenses']) {
    await rm(path.join(skill, dir), { recursive: true, force: true });
    await rename(path.join(staged, dir), path.join(skill, dir));
  }
  await cp(path.join(root, 'LICENSE'), path.join(skill, 'LICENSE'));
  await writeFile(path.join(skill, 'NOTICE.md'), (await readFile(path.join(root, 'NOTICE.md'), 'utf8')).replace('`resources/book.md`', '`references/book.md`'));
  const source = await readFile(path.join(skill, 'SKILL.md'), 'utf8');
  const front = source.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = parse(front[1]);
  meta.metadata = { ...meta.metadata, version: pkg.version };
  await writeFile(path.join(skill, 'SKILL.md'), `---\n${stringify(meta, { lineWidth: 0 })}---\n${source.slice(front[0].length)}`);
  await mkdir(path.join(skill, 'agents'), { recursive: true });
  const title = 'AICW ' + name.slice(5).split('-').map(x => x === 'jsonld' ? 'JSON-LD' : x[0].toUpperCase() + x.slice(1)).join(' ');
  const short = {
    'aicw-optimize': 'Audit and improve a website for AI search',
    'aicw-content': 'Find missing answers and improve content intent',
    'aicw-jsonld': 'Inspect and repair page JSON-LD markup',
    'aicw-audit': 'Audit crawl access, sitemaps, rendering, and speed',
    'aicw-monitor': 'Track AI search observations and compare reports',
    'aicw-submit': 'Guide Google, Bing, and Brave search submissions',
  }[name];
  await writeFile(path.join(skill, 'agents/openai.yaml'), `interface:\n  display_name: ${JSON.stringify(title)}\n  short_description: ${JSON.stringify(short)}\n  default_prompt: ${JSON.stringify(`Use $${name} for my selected website. Ask which website if it is unclear.`)}\n`);
}
} finally { await rm(staging, { recursive: true, force: true }); }
console.log(`Built ${skills.length} portable skills with ${licenses.length} dependency license files each.`);
