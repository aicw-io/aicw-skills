# Validation record

Validated on 2026-10-09 with Node.js 22.22.3. Core users need Node.js 22 or newer. The development suite uses the exact dependencies in `package-lock.json`.

## Version 0.2 name update

After shortening the skill names, all 34 core tests and the HTML, Astro, browser, and WordPress integration scenarios passed again. Build consistency, portable package checks, and the Agent Skills reference validator passed for all six skills. The installer discovered all six renamed skills from the release candidate. The live agent evaluations recorded below were completed before this rename and were not repeated for version 0.2.

The [version 0.2 CI run](https://github.com/aicw-io/aicw-skills/actions/runs/37962712799) passed all eight jobs for commit `3767c037c0d9d78ba0797f19702ffd8ba0b2f622`. A terminal smoke test of `npx skills add aicw-io/aicw-skills` displayed all six new names in the skill chooser. The test stopped at that prompt without installing. A separate test in an agent context installed all six into an isolated project, which was then removed. The installer automatically skips prompts when it detects an agent; the README's instructions are for the user's terminal.

## Automated checks

The suite contains 34 tests. It covers object, array, nested, and multi-type JSON-LD; malformed blocks; connected and unresolved references; conflicting definitions; media field corrections; FAQ visibility; hidden headings; attribute order; and decorative image alternatives.

It also covers robots rule precedence, empty Disallow, sitemap indexes, malformed XML, local origin mapping, bounded requests, blocked cross-origin redirects, missing HTTP evidence, symlink containment, explicit page selection, source-only WordPress detection, relocated skill execution, and missing browser dependencies.

Skill validation covers standard frontmatter fields, runtime compatibility, version consistency, all six frontmatter records, UI metadata, local reference links, portable bundles, and license files. It also requires direct book credits, source-answer instructions, the full PDF link, all 25 checklist rows, and exact agreement between bundled references and their maintained originals. These checks inspect the instructions; they do not simulate a future assistant conversation. The package build copies one maintained runtime and reference set into each installable skill.

The standard `skills` installer, version 1.7.1, discovered all six skills from the clean release candidate in separate temporary projects for Claude Code and Codex. Every installed bundle completed an audit in both locations. No global agent installation was changed.

The Agent Skills reference validator (`skills-ref` 0.1.0, source commit `69ef37e9424c0a7ea9dd2293b559e43ec8176379`) passed for all six skills, including the standard `compatibility` field.

A portability test copies every skill outside the repository and runs it from an unrelated working directory using paths with spaces and Unicode. Generated-file checks verify source agreement, removal of obsolete references, and identical results from repeated builds.

The Claude evaluation configuration has a static dry run. Its regression test runs with an empty command path, succeeds without a Claude executable or account, and creates no fixture files. It checks project instruction selection, skill paths, JSON-stream options, and preservation of skill discovery. Unknown case names fail before a client can be invoked.

## End-to-end scenarios

| Scenario | Result |
| --- | --- |
| Plain HTML | Detected an unresolved JSON-LD reference, edited the authoritative source, confirmed the correction, and repeated the audit without changing the source. |
| Astro 7.3.8 | Built a page with the defect, edited its `.astro` source, rebuilt, and confirmed the corrected output. |
| Chrome with puppeteer-core | Detected a heading and answer absent from initial HTML but present after JavaScript execution. |
| WordPress 6.8 and PHP 8.3 in Playground | Audited emitted JSON-LD, updated a local option through the WordPress API, confirmed the output, backed up SQLite through its API, stopped the runtime, restored the database, and confirmed the original value. |

WordPress testing used an isolated installation. No production database or account was accessed. MySQL WP-CLI backup commands are documented but were not executed against a MySQL server in this environment.

## Agent behavior and static compatibility

Codex CLI 0.162.0 completed the 13 evaluation case types in disposable projects on macOS with Node.js 22.22.3. The client used its configured default model; the event stream did not emit a model identifier, so none is inferred.

| Cases | Observed result |
| --- | --- |
| Source question for each of six skills | Each loaded its installed instructions and returned the book title, author, book-page link, and full PDF link. |
| Explicit and natural-language JSON-LD audit | Executed the installed checker, identified the broken graph reference, and left website files unchanged. |
| JSON-LD repair | Corrected the existing graph, preserved visible text, and executed before, after, and repeat audits without duplicating the graph. |
| Content intent | Supplied evidence and missing answers for all seven Checklist 1 items without inventing prices. An editorial read confirmed the reasoning used the actual weak page text. |
| Monitoring | Produced a worksheet for all six Checklist 4 items and kept unavailable outcomes unassessed. An editorial read confirmed it did not invent observations. |
| Submission preparation | Created the local IndexNow files and guidance for Google, Bing/IndexNow, and Brave; retained prepared-not-submitted status. |
| Unrelated styling request | Changed the requested color without altering JSON-LD or invoking the optimization workflow. |

The first submission case omitted the full book title and link from its final answer, although its saved guide had the credit. The skill now explicitly requires the final answer credit as well. Three fresh submission sessions passed after that correction. Explicit audit and repair each passed in three fresh sessions. These small synthetic evaluations establish observed behavior for these tasks, not universal reliability or improvements in search results.

Claude received a static review of frontmatter, installation paths, instructions, command arguments, and permissions against its official documentation. The runner now writes `CLAUDE.md`, keeps skill discovery enabled, and rejects error or incomplete result events. Shell examples use quoted paths and single-line commands. The dry-run test requires no Claude process, login, or account usage.

An earlier Claude Code 2.1.270 attempt stopped at expired OAuth authentication before performing the task. It is recorded as unavailable, not a skill pass or failure. After live testing was deferred, no further Claude CLI process was launched. Live Claude behavior remains unverified. Cursor, Copilot, and Gemini were reviewed through their documented skill locations but were not exercised in live sessions. The [compatibility guide](compatibility.md) links the current official references and records platform limits.

## Limits

The audit helper is a scoped linter. It does not fully validate every Schema.org type, expand remote JSON-LD contexts, measure real-user Core Web Vitals, or determine semantic intent satisfaction automatically.

The agent instructions supply those review steps. Local results do not prove production reachability, indexing, or AI citations. No submission API or public account was changed during testing.

See [agent compatibility](compatibility.md) for installation paths and [the release procedure](releasing.md) for repeatable packaging. Detailed development history and raw runtime artifacts stay outside the public release.

## Public packaging

The candidate is built from an explicit file allowlist and contains source, maintained references, independently installable skills, tests, and notices. It excludes dependencies, local history, raw evaluation records, databases, and extracted book text. The source archive includes a per-file SHA-256 manifest and has a separate archive checksum. Packaging disables macOS metadata sidecars and requires the archive's file list to match the manifest exactly. Its extracted files were verified against the manifest.

The first [hosted CI run](https://github.com/aicw-io/aicw-skills/actions/runs/37953471514) passed on 2026-10-09 for commit `102d587c4cbb0d191427019a7ce053768da05da8`. All six core jobs passed on Linux, macOS, and Windows with Node.js 22 and 24. The macOS integration job and clean packaging job also passed. These checks do not invoke a live agent. See the repository's [Actions runs](https://github.com/aicw-io/aicw-skills/actions) for later results and tested commits.
