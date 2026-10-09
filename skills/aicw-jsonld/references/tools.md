# Bundled audit tools

Each skill includes `scripts/audit.mjs`. Resolve its absolute path from the location of the loaded SKILL.md. For file audits, keep the website as a separate `--root` argument; the command working directory does not select the skill or website. Quote paths, including those containing spaces. Check `node --version`; Node.js 22 or newer is required. If unavailable, review available content through the agent’s tools and state that bundled checks were not run. Core commands need no package installation, API key, MCP server, or internet connection. The commands below use one line so they work in POSIX shells and PowerShell. Replace the sample paths with native absolute paths on your system, such as `C:\Sites\example` on Windows. If Node is invoked by a quoted executable path in PowerShell, prefix it with `&`.

Select the website using [workflow](workflow.md#select-the-website-and-access) before choosing a command. Example addresses are placeholders, not default targets.

## Inspect local files

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --root "/absolute/path/to/website" --public-origin https://your-real-domain.tld --output "/absolute/private/reports/before"
```

The example domain is a value to replace. `--public-origin` only supplies URL identity. It does not enable network access. Without `--output`, the command writes JSON to stdout. The helper never edits website sources.

Use `--html-root dist` or another path when the output directory is known. Automatic discovery checks common output directories. Read the report's selected root before interpreting findings. Build the project first if its output is missing or stale.

## Inspect a local preview

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --root "/absolute/path/to/website" --url http://127.0.0.1:4321 --public-origin https://your-real-domain.tld --pages "/,/pricing/" --output "/absolute/private/reports/preview"
```

Use a loopback or private-network preview. Custom hostnames must resolve to local addresses. `--pages` selects a comma-separated list of routes. Explicit pages disable link-based page expansion. Sitemap inspection still runs.

The default page limit is 200 fetch attempts or file reads. Change it with `--max-pages`. Sitemap traversal stops after 30 documents. Responses have a 5 MB limit. Redirects and crawl links stay within the selected origin. Reported limits do not establish complete website coverage.

Use `--online` only for an explicitly requested public-site audit. A public origin in a sitemap is mapped to the selected local target, not fetched automatically. The default request timeout is 10 seconds, with one retry. Set milliseconds through `--timeout`.

## Inspect a public website

After the user selects the website, replace the example URL with its actual address:

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --url https://your-real-domain.tld --online --output "/absolute/private/reports/public"
```

No `--root` is needed for a URL-only audit. To inspect specific routes, add `--pages`. The helper uses unauthenticated HTTP requests; it does not use a CMS login or connector session. Use the agent’s available connector for authenticated content and edits. Exported content can be reviewed locally, but an export does not establish live HTTP behavior.

## Compare raw and browser output

The browser step is optional. Install `puppeteer-core` into a separate runtime directory if it is not already available. Use an installed Chrome browser. This does not require downloading a browser through the skill.

```sh
npm install --prefix "/absolute/path/to/browser-runtime" puppeteer-core
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --url http://127.0.0.1:4321 --browser --browser-module "/absolute/path/to/browser-runtime" --browser-executable "/absolute/path/to/chrome" --output "/absolute/private/reports/browser"
```

Installation needs network access. Once installed, local browser checks can run without external requests. The helper uses a temporary browser profile and blocks other origins. Missing packages, missing browsers, and blocked external resources appear explicitly in findings.

## Read reports and compare runs

`audit.json` contains project discovery, page evidence, coverage, findings, limitations, book attribution, and all 25 checklist items. Each finding records its checklist IDs and whether it is a book application, an implementation check, or a current correction. `bookChecklist` leaves semantic and overall checklist assessments as `not-assessed`; the agent completes the relevant [worksheet](book-checklist.md) using the linked findings and actual page content. `audit.md` presents the same findings for review. Status values are described in [workflow](workflow.md). The report includes page text and can contain unpublished content. Keep it private when appropriate.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" compare --before "/absolute/private/reports/before/audit.json" --after "/absolute/private/reports/after/audit.json"
```

By default, an audit exits 0 when it completes, even if it finds defects. `--fail-on-error` returns 1 for deterministic error findings. Command or setup failures return 2. Review, unknown, and skipped states remain visible in JSON and must not be treated as passes.

## Prepare submissions without sending them

Ask for the public address if it is not known. Identify the actual sitemap and changed public URLs; do not infer them from this example. Create a text file containing one changed public URL per line. Then run:

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" prepare-submission --origin https://your-real-domain.tld --urls "/absolute/private/changed-urls.txt" --sitemap https://your-real-domain.tld/sitemap.xml --output "/absolute/private/submission"
```

Omit `--sitemap` when its location is unknown; the record leaves it unset for follow-up. Use `--key` to reuse an existing IndexNow key. The output contains a verification text file, `indexnow.json`, and `submission.json`. Existing output files are not overwritten. There is no bundled submit command. Follow [submission](submission.md) for the manual steps.

## Observe Common Crawl when requested

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" presence --origin https://your-real-domain.tld --online
```

This contacts Common Crawl's index service and reads a bounded sample from its most recent listed index. It does not query Google, Bing, or AI chats. A missing result describes only that observation.
