# AICW skills

Audit and improve a local website for AI search with a coding agent. These six skills accompany Eugene Mironichev's [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/).

The toolkit supports HTML, Astro, and local WordPress sites. Other frameworks use the same rendered-HTML workflow and their own source conventions. It includes executable audit tools, editing guidance, and manual search-submission instructions.

The optimization scope comes strictly from the book. [All 25 checklist items](resources/book-checklist.md) have explicit evidence requirements. Engineering checks and current corrections to printed examples are labeled separately. Each skill credits the book and must show its title, author, and aicw.io link when asked. Audit reports include the same attribution.

## Install

Install from [aicw-io/aicw-skills](https://github.com/aicw-io/aicw-skills) with an Agent Skills installer:

```sh
npx skills add aicw-io/aicw-skills --skill '*'
```

The installer lets you choose your agent and installation scope. For Claude Code, select `claude-code`; for Codex, select `codex`. You can also copy a complete folder from `skills/` into your agent's skill directory. Each skill includes its own references, scripts, and license files.

To install from a local checkout instead:

```sh
npx skills add "/absolute/path/to/aicw-skills" --skill '*'
```

Node.js 22+ is required for the audit scripts. Core audits need no additional installation, paid service, or MCP connection. An optional browser comparison uses an installed Chrome browser and `puppeteer-core`.

## Choose a skill

| Skill | Use it for |
| --- | --- |
| `aicw-website-optimize` | A complete audit and local optimization workflow |
| `aicw-content-intent` | Intent coverage, useful answers, and supported content improvements |
| `aicw-jsonld` | Actual JSON-LD blocks, graphs, properties, and visible-content consistency |
| `aicw-technical-audit` | The book’s crawl access, sitemap, rendering, and speed checklist |
| `aicw-search-monitoring` | Comparable observations, local reports, and measurement plans |
| `aicw-search-submission` | Google, Bing/IndexNow, and Brave submission guidance |

For example, ask your agent:

> Use aicw-website-optimize on this local Astro project. Audit it, fix supported content and JSON-LD issues, build it, and show the verified changes.

For an audit without edits:

> Use aicw-jsonld to inspect these local pages. Explain broken blocks, conflicting facts, and missing evidence. Do not change the website.

Read the [book companion](docs/book-companion.md) for HTML, Astro, and WordPress examples. See [agent compatibility](docs/compatibility.md) for Claude Code, Codex, Cursor, Copilot, and Gemini installation paths and test limits.

## Run the audit directly

```sh
node "skills/aicw-technical-audit/scripts/audit.mjs" audit --root "/absolute/path/to/site" --output "/absolute/private/reports/before"
```

Use `--url http://127.0.0.1:4321` for a running local preview and `--public-origin` for the intended public URL identity. Without `--output`, the command prints JSON. See the [tool reference](resources/tools.md) for browser checks, report comparison, and submission preparation.

The helper is an audit tool. The coding agent reads its evidence, applies authorized source edits, and verifies them. Intent satisfaction, factual accuracy, and full Schema.org validity require review. A completed audit does not establish indexing or AI citations.

## Develop and test

```sh
npm ci
npm run build
npm test
npm run validate
npm run check:build
npm run test:integration
```

Development dependencies support bundling and isolated HTML, Astro, browser, and WordPress tests. Integration tests can download WordPress runtime assets. They do not submit a website or access a production database.

Edit shared audit code in `src/` and shared guidance in `resources/`. Edit skill entry points under `skills/`. Run the build to refresh portable scripts and references before distribution. Include the generated skill files with their source and lockfile. The build replaces generated folders so obsolete files do not remain. Follow [the release procedure](docs/releasing.md) to prepare a clean, allowlisted source archive with checksums.

Read [validation notes](docs/validation.md), [book coverage](resources/book.md), [current implementation notes](resources/implementation-notes.md), and [attribution](NOTICE.md). The toolkit uses AGPL-3.0-only. The book retains its original copyright.
