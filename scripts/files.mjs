import { readdir, readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function filesUnder(root, prefix = '') {
  const result = [];
  for (const name of (await readdir(path.join(root, prefix))).sort()) {
    const relative = prefix ? `${prefix}/${name}` : name;
    const info = await lstat(path.join(root, relative));
    if (info.isSymbolicLink()) throw new Error(`Unexpected symlink: ${relative}`);
    if (info.isDirectory()) result.push(...await filesUnder(root, relative));
    else if (info.isFile()) result.push(relative);
    else throw new Error(`Unsupported file: ${relative}`);
  }
  return result;
}
export async function manifest(root, files = null) {
  const result = {};
  for (const file of files ?? await filesUnder(root)) {
    const content = await readFile(path.join(root, file));
    result[file] = { bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') };
  }
  return result;
}
