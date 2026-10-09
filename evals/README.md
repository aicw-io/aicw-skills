# Agent evaluations

These are opt-in tests of installed, authenticated Claude Code and Codex clients. They use the client's default model and can consume account usage. They do not run in the ordinary unit-test command or CI.

For static review, `--dry-run` prints the selected cases, argument arrays, instruction filename, and skill installation directory. It does not look up the executable, launch a client, check authentication, or create a fixture:

```sh
npm run test:agents -- --agent claude --case audit,repair --dry-run
```

```sh
npm run test:agents -- --agent codex
npm run test:agents -- --agent claude
```

The runner copies the six skills into a temporary synthetic project, creates a deliberately weak page and broken JSON-LD reference, and asks the client to perform a task. It writes `CLAUDE.md` for Claude and `AGENTS.md` for Codex. It leaves existing agent installations and website projects alone. Sessions are bounded to three minutes; Claude sessions request a $0.75 estimated API budget cap, which is not a billing guarantee. Model overrides are not selected by the runner.

The live Claude runner currently uses Bash on macOS, Linux, or WSL. It keeps skill discovery enabled, selects project settings, and requests an empty strict MCP configuration. Its command permissions are not an operating-system sandbox; Node can execute arbitrary JavaScript. Native Windows live evaluation is not implemented, but static review works there. See [compatibility](../docs/compatibility.md) for the parameter review and the separate portability status of the installed skills.

Select a case, or repeat critical cases in fresh sessions:

```sh
npm run test:agents -- --agent codex --case audit,repair --repeat 3
npm run test:agents -- --agent claude --case source-aicw-jsonld
```

Cases include `source-SKILL-NAME` for every skill, `audit`, `implicit-audit`, `repair`, `intent`, `monitoring`, `submission`, and `negative`. The negative case is a styling request that should not trigger an optimization audit.

Checks inspect skill activation, checker execution, unchanged files in audits, repaired graph references, duplicate graphs, before/after/repeat checks, checklist coverage, book attribution, and prepared submission files. Intent and monitoring answers still need an editorial read: a matching phrase is not sufficient evidence of useful reasoning. The tests do not measure search rankings or real citations.

Raw event streams and summaries are written to ignored `.local/agent-evals/`. The synthetic project is removed when a run ends. Record client/model versions and failures in the public validation summary without publishing private paths, account metadata, or raw conversations. An authentication failure blocks a test and is never a pass. The existing deterministic integration suite separately tests Astro and WordPress; these lightweight live cases do not claim that an agent completed those full platform workflows.
