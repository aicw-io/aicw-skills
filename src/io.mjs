import { VERSION } from './version.mjs';
// Fetch retry/capture behavior adapted from AICW Visibility.
// Copyright (c) 2026 AICW. AGPL-3.0-only. See NOTICE.md.
import { lookup } from 'node:dns/promises';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

export async function exists(p) { try { await stat(p); return true; } catch { return false; } }
export function isPrivateIP(ip) {
  return ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}
export async function checkTarget(input, online = false) {
  const u = new URL(input);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new Error('Use an HTTP(S) URL without embedded credentials.');
  if (!online) {
    const hostname = u.hostname.replace(/^\[|\]$/g, '');
    const addresses = await lookup(hostname, { all: true });
    if (!addresses.length || !addresses.every(a => isPrivateIP(a.address))) throw new Error('External target requires --online. --public-origin alone never enables requests.');
  }
  return u;
}
export async function fetchCapture(input, { origin, timeout = 10000, retries = 1, maxBytes = 5_000_000, fetcher = fetch } = {}) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const start = performance.now();
    try {
      let url = new URL(input), response;
      for (let hop = 0; hop < 6; hop++) {
        if (url.origin !== origin) throw new Error(`Cross-origin request blocked: ${url.origin}`);
        response = await fetcher(url, { redirect: 'manual', signal: controller.signal, headers: { 'User-Agent': `AICW-Skills/${VERSION} (local website audit)` } });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          await response.body?.cancel();
          if (!response.headers.get('location')) throw new Error('Redirect has no Location header.');
          url = new URL(response.headers.get('location'), url);
          if (hop === 5) throw new Error('Redirect limit exceeded.');
          continue;
        }
        break;
      }
      const ttfbMs = Math.round(performance.now() - start);
      const chunks = [];
      let bytes = 0;
      if (response.body) for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) { controller.abort(); throw new Error(`Response exceeds ${maxBytes} bytes.`); }
        chunks.push(chunk);
      }
      return { url: url.href, status: response.status, headers: Object.fromEntries(response.headers), text: Buffer.concat(chunks).toString('utf8'), bytes, ttfbMs };
    } catch (e) { last = e; }
    finally { clearTimeout(timer); }
  }
  throw last;
}
const IGNORE = new Set(['node_modules', '.git', '.tmp', '.astro', '.cache', 'vendor', 'wp-admin', 'wp-includes', 'backups', 'reports']);
export async function htmlFiles(root, limit = 201) {
  const result = [];
  async function visit(dir) {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (result.length >= limit) return;
      if (entry.isSymbolicLink() || entry.name.startsWith('.') || IGNORE.has(entry.name)) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) await visit(p);
      else if (/\.html?$/i.test(entry.name)) result.push(p);
    }
  }
  await visit(root);
  return result;
}
export async function discover(root, htmlRoot) {
  if (!root) return { stack: 'preview', root: null, htmlRoot: null };
  root = await realpath(root);
  let pkg = {};
  try { pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')); } catch {}
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  let stack = deps.astro ? 'astro' : await exists(path.join(root, 'wp-config.php')) || await exists(path.join(root, 'wp-content')) ? 'wordpress' : Object.keys(deps).length ? 'other' : 'html';
  let output = htmlRoot ? await realpath(path.resolve(root, htmlRoot)) : null;
  if (!output && stack !== 'wordpress') {
    for (const dir of ['dist', 'out', 'build', 'public', '.']) {
      const candidate = path.resolve(root, dir);
      if (await exists(candidate) && (await htmlFiles(candidate, 1)).length) { output = candidate; break; }
    }
  }
  return { stack, root, htmlRoot: output, scripts: pkg.scripts ?? {} };
}
export async function safeRead(root, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const candidate = path.resolve(root, '.' + (decoded.startsWith('/') ? decoded : '/' + decoded));
  const rootReal = await realpath(root);
  for (const p of [candidate, path.join(candidate, 'index.html'), candidate + '.html']) {
    try {
      const resolved = await realpath(p);
      if (resolved !== rootReal && !resolved.startsWith(rootReal + path.sep)) return null;
      if ((await stat(resolved)).isFile()) return { file: resolved, text: await readFile(resolved, 'utf8') };
    } catch {}
  }
  return null;
}
export function fileRoute(file, root) {
  const rel = path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/');
  return '/' + rel.replace(/(?:^|\/)index\.html?$/, m => m.startsWith('/') ? '/' : '');
}
