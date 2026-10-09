import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import assert from 'node:assert/strict';
import { BOOK_SOURCE, BOOK_CHECKLIST } from '../src/book.mjs';

const dirs = (await readdir('skills')).filter(x => x.startsWith('aicw-'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.equal(dirs.length, 6);
let checked = 0;
for (const name of dirs) {
  const root = path.resolve('skills', name);
  const skill = await readFile(path.join(root, 'SKILL.md'), 'utf8');
  const front = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(front, `${name}: missing frontmatter`);
  const data = parse(front[1]);
  assert.equal(data.name, name);
  assert.ok(name.length <= 64);
  assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const standardFields = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];
  assert.ok(Object.keys(data).every(k => standardFields.includes(k)), `${name}: nonstandard frontmatter`);
  assert.ok(typeof data.compatibility === 'string' && data.compatibility.length <= 500);
  assert.equal(data.metadata.version, pkg.version);
  assert.ok(Object.values(data.metadata).every(x => typeof x === 'string'));
  assert.ok(skill.split('\n').length < 500);
  assert.ok(data.description.length > 20 && data.description.length <= 1024);
  assert.ok(skill.includes(`[${BOOK_SOURCE.title}](${BOOK_SOURCE.url})`), `${name}: missing direct book link`);
  assert.ok(skill.includes(BOOK_SOURCE.author), `${name}: missing book author`);
  assert.match(skill, /When asked about the source or to show the book/);
  assert.match(skill, /Include the book credit and relevant PDF pages in the final deliverable/);
  const worksheet = await readFile(path.join(root, 'references/book-checklist.md'), 'utf8');
  for (const item of BOOK_CHECKLIST) assert.ok(worksheet.includes(`| ${item.id} | ${item.page} |`), `${name}: missing book item ${item.id}`);
  const bookReference = await readFile(path.join(root, 'references/book.md'), 'utf8');
  assert.ok(bookReference.includes(BOOK_SOURCE.pdfUrl), `${name}: missing full PDF link`);
  assert.deepEqual((await readdir(path.join(root, 'references'))).sort(), (await readdir('resources')).sort(), `${name}: stale reference files`);
  for (const reference of await readdir('resources')) assert.equal(await readFile(path.join(root, 'references', reference), 'utf8'), await readFile(path.join('resources', reference), 'utf8'), `${name}: stale ${reference}`);
  const ui = parse(await readFile(path.join(root, 'agents/openai.yaml'), 'utf8'));
  assert.ok(ui.interface.default_prompt.includes('$' + name));
  assert.ok(ui.interface.short_description.length >= 25 && ui.interface.short_description.length <= 64);
  for (const filename of ['scripts/audit.mjs', 'LICENSE', 'NOTICE.md']) assert.ok((await stat(path.join(root, filename))).size > 0);
  for (const file of ['SKILL.md', ...((await readdir(path.join(root, 'references'))).map(x => `references/${x}`))]) {
    const text = await readFile(path.join(root, file), 'utf8');
    assert.ok(!/\b(?:TODO|TBD|INSERT_HERE)\b/.test(text), `${file}: unfinished scaffold`);
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(m[1])) continue;
      const target = path.resolve(path.dirname(path.join(root, file)), m[1].split('#')[0]);
      assert.ok(target.startsWith(root + path.sep), `${name}: reference escapes installable skill`);
      await stat(target);
    }
    checked++;
  }
}
console.log(`Validated ${dirs.length} skills and ${checked} instruction/reference files.`);
