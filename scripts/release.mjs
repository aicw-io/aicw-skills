import { cp, mkdir, readFile, writeFile, rm, mkdtemp, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesUnder, manifest } from './files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const output = path.join(root, 'release');
await mkdir(output, { recursive: true });
const staging = await mkdtemp(path.join(output, '.prepare-'));
const name = `aicw-skills-${pkg.version}`;
const candidate = path.join(staging, name);
const files = ['README.md', 'LICENSE', 'NOTICE.md', 'package.json', 'package-lock.json', '.nvmrc', '.gitignore', '.gitattributes'];
const dirs = ['skills', 'src', 'resources', 'scripts', 'test', 'evals', 'third-party', '.github'];
const docs = ['book-companion.md', 'compatibility.md', 'validation.md', 'releasing.md'];
try {
  execFileSync(process.execPath, ['scripts/check-build.mjs'], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, ['scripts/validate.mjs'], { cwd: root, stdio: 'inherit' });
  await mkdir(candidate);
  for (const dir of dirs) files.push(...(await filesUnder(path.join(root, dir))).map(f => `${dir}/${f}`));
  files.push(...docs.map(f => `docs/${f}`));
  for (const file of files.sort()) {
    if (/(^|\/)(node_modules|\.tmp|\.local|reports|release|\.env)(\/|$)|(^|\/)(?:\._|\.DS_Store)|\.(?:pdf|epub|sqlite|sql|log)$/i.test(file)) throw new Error(`Unexpected release file: ${file}`);
    const content = await readFile(path.join(root, file), 'utf8');
    if (/\/Users\/[\w.-]+\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) throw new Error(`Private content pattern in ${file}`);
    await mkdir(path.dirname(path.join(candidate, file)), { recursive: true });
    await cp(path.join(root, file), path.join(candidate, file));
  }
  const entries = await manifest(candidate);
  await writeFile(path.join(candidate, 'MANIFEST.json'), JSON.stringify({ version: pkg.version, files: entries }, null, 2) + '\n');
  // Prove that the candidate's bundles do not need repository dependencies.
  for (const skill of Object.keys(entries).filter(f => /^skills\/[^/]+\/scripts\/audit\.mjs$/.test(f))) {
    execFileSync(process.execPath, [path.join(candidate, skill), '--help'], { cwd: staging, stdio: 'pipe' });
  }
  const target = path.join(output, name);
  await rm(target, { recursive: true, force: true });
  await rename(candidate, target);
  const archive = path.join(output, `${name}.tar.gz`);
  const stagedArchive = path.join(staging, `${name}.tar.gz`);
  // macOS tar otherwise adds AppleDouble metadata outside the manifest.
  execFileSync('tar', ['-czf', stagedArchive, '-C', output, name], { stdio: 'pipe', env: { ...process.env, COPYFILE_DISABLE: '1' } });
  const members = execFileSync('tar', ['-tzf', stagedArchive], { encoding: 'utf8' }).trim().split('\n').filter(f => !f.endsWith('/')).sort();
  assert.deepEqual(members, [...Object.keys(entries), 'MANIFEST.json'].map(f => `${name}/${f}`).sort(), 'Archive differs from its file manifest.');
  await rename(stagedArchive, archive);
  const digest = await manifest(output, [`${name}.tar.gz`]);
  await writeFile(archive + '.sha256', `${digest[`${name}.tar.gz`].sha256}  ${name}.tar.gz\n`);
  console.log(JSON.stringify({ directory: target, archive, files: Object.keys(entries).length, bytes: Object.values(entries).reduce((n, x) => n + x.bytes, 0) }));
} finally { await rm(staging, { recursive: true, force: true }); }
