import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const runner = fileURLToPath(new URL('../evals/run.mjs', import.meta.url));

test('Claude configuration can be reviewed without a client, account, or workspace writes', async t => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'aicw config review '));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [runner, '--agent', 'claude', '--case', 'audit,repair', '--dry-run'], { cwd, env: { PATH: '' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const config = JSON.parse(result.stdout);
  assert.equal(config.instructionFile, 'CLAUDE.md');
  assert.equal(config.skillDirectory, '.claude/skills');
  assert.deepEqual(config.cases.map(c => c.id), ['audit', 'repair']);
  for (const c of config.cases) {
    const args = c.args;
    const value = name => args[args.indexOf(name) + 1];
    assert.equal(c.executable, 'claude');
    assert.equal(value('--output-format'), 'stream-json');
    assert(args.includes('--verbose'));
    assert.equal(value('--permission-mode'), 'dontAsk');
    assert(args.includes('--strict-mcp-config'));
    assert.deepEqual(JSON.parse(value('--mcp-config')), { mcpServers: {} });
    assert(value('--tools').split(',').includes('Skill'));
    for (const incompatible of ['--bare', '--safe-mode', '--disable-slash-commands', '--dangerously-skip-permissions']) assert(!args.includes(incompatible));
  }
  assert.deepEqual(await readdir(cwd), []);
});

test('evaluation rejects a mistyped case before trying a client', () => {
  const result = spawnSync(process.execPath, [runner, '--agent', 'claude', '--case', 'audit,typo', '--dry-run'], { env: { PATH: '' }, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown case/);
});
