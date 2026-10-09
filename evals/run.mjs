// Explicit, opt-in tests of a locally authenticated agent. All websites are synthetic.
import { cp, mkdir, mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectHTML } from '../src/html.mjs';
import { checkJsonLD } from '../src/checks.mjs';
import { BOOK_SOURCE } from '../src/book.mjs';
import { VERSION } from '../src/version.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { values } = parseArgs({ options: { agent: { type: 'string' }, case: { type: 'string' }, repeat: { type: 'string', default: '1' }, 'dry-run': { type: 'boolean', default: false } } });
if (!['claude', 'codex'].includes(values.agent)) throw new Error('Choose --agent claude or --agent codex. This uses that client’s configured account.');
const repeats = Number(values.repeat);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 3) throw new Error('--repeat must be 1, 2, or 3.');
const names = (await readdir(path.join(root, 'skills'))).filter(x => x.startsWith('aicw-')).sort();
const cases = [
  ...names.map(skill => ({ id: `source-${skill}`, skill, prompt: 'Which book is this skill based on? Give its author, title, book-page link, and full PDF link. Read the installed skill before answering. Do not audit or edit the website.', source: true })),
  { id: 'audit', skill: 'aicw-jsonld', prompt: 'Audit the HTML in "website café". Run the bundled audit script, report its JSON-LD problem with evidence, and cite the book. Do not edit website files. Do not use a browser or online services.', audit: true },
  { id: 'implicit-audit', prompt: 'Audit the JSON-LD in the local HTML website "website café". Use the relevant installed skill and its checker. Report the specific graph problem with evidence and the book basis. Do not change website files or use online services.', audit: true },
  { id: 'repair', skill: 'aicw-jsonld', prompt: 'Fix the JSON-LD reference problem in "website café". Use the installed checker before and after editing the existing graph. Then repeat the audit and confirm the graph was not duplicated. Keep visible text unchanged. Cite the book and explain the verified fix. No online access.', repair: true },
  { id: 'intent', skill: 'aicw-content-intent', prompt: 'Review the actual text in "website café/index.html" against all seven Checklist 1 items. Give evidence and missing answers for each item, using C1.1 through C1.7. Do not invent plan prices or edit the website. Cite the book.', intent: true },
  { id: 'monitoring', skill: 'aicw-search-monitoring', prompt: 'We have no analytics or recorded AI answers. Prepare a concise measurement worksheet for this website covering all six Checklist 4 items. Explain what remains unassessed. Do not invent observations or use online services. Cite the book.', monitoring: true },
  { id: 'submission', skill: 'aicw-search-submission', prompt: 'Prepare local submission files in "prepared" for https://aicw.io/books/ai-seo-guide/ with public origin https://aicw.io and sitemap https://aicw.io/sitemap.xml. Use the bundled helper and write a concise guide for Google Search Console, Bing/IndexNow, and Brave. Do not make network requests or submit/publish anything. Cite the book.', submission: true },
  { id: 'negative', prompt: 'Change only the h1 text color to navy in "website café/index.html". This is a styling edit. Keep the words and all JSON-LD unchanged.', negative: true },
];
const selected = values.case?.split(',');
if (selected?.some(id => !cases.some(c => c.id === id))) throw new Error('Unknown case. Available: ' + cases.map(x => x.id).join(', '));
const chosen = selected ? cases.filter(x => selected.includes(x.id)) : cases;
const instructionFile = values.agent === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';
const skillDirectory = values.agent === 'claude' ? '.claude/skills' : '.agents/skills';
function invocation(c) {
  const prompt = `${c.skill ? `Use the ${c.skill} skill. ` : ''}${c.prompt}`;
  return values.agent === 'claude'
    ? ['--print', prompt, '--output-format', 'stream-json', '--verbose', '--no-session-persistence', '--setting-sources', 'project', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--no-chrome', '--permission-mode', 'dontAsk', '--tools', 'Read,Glob,Grep,Bash,Edit,Write,Skill', '--allowedTools', 'Read,Glob,Grep,Skill,Edit,Write,Bash(node *)', '--max-budget-usd', '0.75']
    : ['exec', '--json', '--ephemeral', '--ignore-user-config', '--sandbox', 'workspace-write', '--skip-git-repo-check', '--color', 'never', prompt];
}
if (values['dry-run']) {
  console.log(JSON.stringify({ agent: values.agent, dryRun: true, instructionFile, skillDirectory, repeats, timeoutMs: 180_000, cases: chosen.map(c => ({ id: c.id, executable: values.agent, args: invocation(c) })) }, null, 2));
  process.exit(0); // No client lookup, process launch, authentication, or fixture writes.
}
if (values.agent === 'claude' && process.platform === 'win32') throw new Error('The live Claude evaluator currently requires Bash on macOS, Linux, or WSL. Use --dry-run for static review on Windows. Installed skills support native Windows command execution separately.');
const versionResult = spawnSync(values.agent, ['--version'], { encoding: 'utf8' });
if (versionResult.error || versionResult.status !== 0) throw new Error(`Cannot run ${values.agent}. Install and authenticate the client first.`);
const work = await mkdtemp(path.join(os.tmpdir(), 'aicw agent eval '));
const logBase = path.join(root, '.local', 'agent-evals');
await mkdir(logBase, { recursive: true });
const logRoot = await mkdtemp(path.join(logBase, `${Date.now()}-${values.agent}-`));
const results = [];
const graph = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'WebPage', '@id': 'https://example.org/#page', mainEntity: { '@id': 'https://example.org/#article' } },
  { '@type': 'Article', headline: 'Cloud storage' },
] };
const original = `<html lang="en"><head><title>Cloud storage</title><script type="application/ld+json">${JSON.stringify(graph)}</script></head><body><main><h1>Cloud storage</h1><p>Cloud storage for teams. Secure cloud storage. The best cloud storage.</p><h2>Why cloud storage?</h2><p>Choose cloud storage.</p></main></body></html>`;
const assert = (value, message) => { if (!value) throw new Error(message); };
function execute(args, cwd) {
  return new Promise(resolve => {
    const child = spawn(values.agent, args, { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    child.stdout.on('data', b => { stdout += b; }); child.stderr.on('data', b => { stderr += b; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, 180_000);
    child.on('error', e => { stderr += e.message; });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr, timedOut }); });
  });
}
try {
  runs: for (const c of chosen) for (let iteration = 1; iteration <= repeats; iteration++) {
    const dir = path.join(work, `${c.id}-${iteration}`);
    const site = path.join(dir, 'website café'); await mkdir(site, { recursive: true });
    await writeFile(path.join(site, 'index.html'), original);
    await writeFile(path.join(dir, instructionFile), 'This is a disposable synthetic website. Work only inside this project. Do not browse, deploy, submit URLs, install packages, change agent configuration, or run background services. Node is already installed. Keep reports outside the website folder.\n');
    const skillsRoot = path.join(dir, skillDirectory);
    for (const name of names) await cp(path.join(root, 'skills', name), path.join(skillsRoot, name), { recursive: true });
    const run = await execute(invocation(c), dir);
    const events = run.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
    const claudeResult = events.findLast(e => e.type === 'result');
    const final = values.agent === 'claude' ? claudeResult?.result ?? '' : events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text).join('\n');
    const calls = values.agent === 'claude'
      ? events.flatMap(e => e.message?.content ?? []).filter(x => x.type === 'tool_use').map(x => ({ name: x.name, input: x.input }))
      : events.filter(e => e.type === 'item.completed' && ['command_execution', 'mcp_tool_call'].includes(e.item?.type)).map(e => ({ name: e.item.type, input: e.item.command ?? e.item.arguments }));
    const actionText = JSON.stringify(calls);
    const model = events.find(e => e.type === 'system' && e.subtype === 'init')?.model ?? 'client default; model not emitted';
    let status = 'passed', reason;
    try {
      assert(!run.timedOut, 'Agent session timed out.');
      assert(run.code === 0 && final, 'Client did not produce a successful final answer.');
      if (values.agent === 'claude') assert(claudeResult?.is_error === false && claudeResult?.subtype === 'success', 'Claude returned an error or incomplete result.');
      const after = await readFile(path.join(site, 'index.html'), 'utf8');
      if (!c.negative) {
        assert(final.includes(BOOK_SOURCE.url) && final.includes(BOOK_SOURCE.title) && final.includes(BOOK_SOURCE.author), 'Final answer lacks complete book attribution.');
        assert(/SKILL\.md|"name":"Skill"/.test(actionText), 'No observed skill activation or entry-point read.');
      }
      if (c.source) assert(final.includes(BOOK_SOURCE.pdfUrl) || final.includes(decodeURI(BOOK_SOURCE.pdfUrl)), 'Final answer lacks the full PDF link.');
      if (c.audit || c.repair) assert(/audit\.mjs/.test(actionText), 'Bundled checker was not executed.');
      if (c.audit) { assert(/article|reference/i.test(final), 'Graph defect was not reported.'); assert(after === original, 'Audit changed website content.'); }
      if (c.repair) {
        const page = inspectHTML(after, 'index.html'); page.url = 'https://example.org/';
        assert(page.jsonld.length === 1, 'Repair duplicated or removed the graph.');
        assert(!checkJsonLD(page).some(x => x.rule === 'jsonld.reference'), 'Reference remains unresolved.');
        assert(page.visibleText === inspectHTML(original, 'index.html').visibleText, 'Repair changed visible content.');
        assert((actionText.match(/audit\.mjs/g) ?? []).length >= 3, 'Before, after, and repeat checker executions were not observed.');
      }
      if (c.intent) for (let n = 1; n <= 7; n++) assert(final.includes(`C1.${n}`), `Missing content checklist item C1.${n}.`);
      if (c.monitoring) { assert(/unassessed|not.assessed|unavailable|no (?:data|analytics)/i.test(final), 'Missing observations were not identified.'); }
      if (c.submission) {
        const plan = JSON.parse(await readFile(path.join(dir, 'prepared/submission.json'), 'utf8'));
        assert(plan.status === 'prepared-not-submitted', 'Submission preparation record missing.');
        assert(/Google/.test(final) && /Bing|IndexNow/.test(final) && /Brave/.test(final), 'Missing engine guidance.');
      }
      if (c.negative) {
        assert(after.includes('navy'), 'Requested style edit is missing.');
        assert(JSON.stringify(inspectHTML(after, 'index.html').jsonld.map(x => x.data)) === JSON.stringify(inspectHTML(original, 'index.html').jsonld.map(x => x.data)), 'Styling edit changed JSON-LD.');
        assert(!/audit\.mjs|aicw-[\w-]+\/SKILL\.md/.test(actionText), 'Unrelated styling edit triggered the optimization workflow.');
      }
      if (!c.repair && !c.negative) assert(after === original, 'Website changed in a non-editing case.');
    } catch (e) { status = 'failed'; reason = e.message; }
    const clientFailure = /not logged in|failed to authenticate|authentication|oauth.*expired|invalid.api.key|rate.limit|usage.limit|model.*not.*found/i.test(run.stderr + final + JSON.stringify(claudeResult?.errors ?? []));
    if (clientFailure) { status = 'blocked'; reason = 'Client authentication, availability, or account limit prevented the evaluation. See the local log.'; }
    await writeFile(path.join(logRoot, `${c.id}-${iteration}.json`), JSON.stringify({ ...run, final, calls }, null, 2));
    results.push({ case: c.id, iteration, status, model, ...(reason ? { reason } : {}) });
    console.log(`${values.agent}: ${c.id} #${iteration}: ${status}${reason ? ` — ${reason}` : ''}`);
    // An account or transport failure cannot be improved by spending more calls.
    if (run.timedOut || clientFailure || (run.code !== 0 && !final)) break runs;
  }
} finally {
  await writeFile(path.join(logRoot, 'summary.json'), JSON.stringify({ date: new Date().toISOString(), agent: values.agent, client: versionResult.stdout.trim(), node: process.version, platform: process.platform, version: VERSION, results }, null, 2) + '\n');
  await rm(work, { recursive: true, force: true });
}
console.log(`Evaluation records: ${logRoot}`);
if (results.some(x => x.status !== 'passed')) process.exitCode = 1;
