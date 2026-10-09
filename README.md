# AICW Skills

Six skills to help your coding agent audit and improve a local website for AI search.
Based on the [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/) by Eugene Mironichev.

Works with HTML, Astro, and local WordPress projects. Requires Node.js 22 or newer.

## Install

In a terminal, open your website's folder and run:

```sh
npx skills add aicw-io/aicw-skills
```

Choose the skills you need, your coding agent, and where to install them.
If you select `aicw-optimize`, open a new agent session in your website folder and ask:

> Use aicw-optimize to audit this website for AI search. Show the findings and proposed fixes before editing.

See [agent setup](docs/compatibility.md) for Claude Code, Codex, Cursor, Copilot, and Gemini CLI.

## Included skills

| Skill | What it does |
| --- | --- |
| `aicw-optimize` | Runs the full audit and optimization workflow |
| `aicw-content` | Finds missing answers to readers' questions |
| `aicw-jsonld` | Inspects page JSON-LD and compares it with visible content |
| `aicw-audit` | Audits crawl access, sitemaps, rendering, and speed |
| `aicw-monitor` | Compares reports and tracks AI search observations |
| `aicw-submit` | Guides manual Google, Bing/IndexNow, and Brave submissions |

The skills follow the book's [25 checklist items](resources/book-checklist.md). Each skill and audit report credits the book.

[Usage examples](docs/book-companion.md) · [Audit commands](resources/tools.md) · [Development and testing](docs/releasing.md)

Code: [AGPL-3.0-only](LICENSE). See [attribution](NOTICE.md). The book retains its original copyright.
