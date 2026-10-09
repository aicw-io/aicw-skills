import { execFileSync } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { manifest } from './files.mjs';

const before = await manifest('skills');
// Deliberately plant a stale build-owned file and check that generation removes it.
const stale = 'skills/aicw-jsonld/references/stale-build-check.txt';
await writeFile(stale, 'Generated-file cleanup check.');
let first;
try {
  execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'pipe' });
  first = await manifest('skills');
  assert.ok(!Object.hasOwn(first, 'aicw-jsonld/references/stale-build-check.txt'), 'Build retained a stale reference.');
}
finally { await rm(stale, { force: true }); }
assert.deepEqual(first, before, 'Generated skills differ from maintained sources. Run npm run build and include the changes.');
execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'pipe' });
assert.deepEqual(await manifest('skills'), first, 'Build output is not repeatable.');
console.log('Generated files match sources; repeated builds are identical.');
