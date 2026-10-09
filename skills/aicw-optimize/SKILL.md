---
name: aicw-optimize
description: Audit and improve a local website for AI search using the AICW book. Use for a whole-site optimization across content intent, JSON-LD, crawler access, rendering, and measurement. Supports HTML, Astro, WordPress, and other local projects.
license: AGPL-3.0-only
compatibility: Requires local file and command access and Node.js 22+ for audit scripts. Browser and WordPress checks need the corresponding local runtime.
metadata:
  author: aicw-io
  version: 0.2.0
---

# Optimize a website for AI search

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Runtime: Node.js 22+ for bundled audit tools. Optional local browser and WordPress runtime.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review the source directly and mark executable checks unverified.

Turn the book's four checklists into evidence, useful edits, and verified outcomes. Work on the website the user selected.

Read [workflow](references/workflow.md), then the relevant section of [platforms](references/platforms.md). These define source discovery, local boundaries, and the fix loop. Read [audit tools](references/tools.md) before running a command.

## Workflow

1. Identify the authoritative source, local output or preview, audience, languages, important page types, and existing SEO generators. Read project instructions first.
2. Run the bundled `scripts/audit.mjs audit` against existing HTML or a local preview. Keep reports outside the website's source and public directories. Record scope, failures, and skipped checks.
3. Read [content intent](references/content-intent.md). For each selected page, map its audience, task, primary intent, supporting questions, evidence, and next step. Read the actual text, not only metadata.
4. Read [JSON-LD](references/jsonld.md) and inspect the actual blocks plus the rendered page. Read [technical checks](references/technical.md) for crawl, sitemap, and rendering findings.
5. Prioritize access failures and broken output, factual inconsistencies, unmet page intent, and then useful refinements. Group repeated defects by their source component or CMS generator.
6. If the request is an audit, deliver findings. If the request asks for optimization or fixes, edit the correct local sources. Preserve the site's facts, language, voice, and intended crawler policy.
7. Build or render through the project's existing workflow. Repeat affected checks and inspect the diff. Use `compare` for evidence, then review every claimed fix.
8. Complete the applicable rows in [the book checklist worksheet](references/book-checklist.md). Explicitly mark unassessed items. Deliver a concise change summary, remaining decisions, test results, and coverage limits. If relevant, prepare the [submission checklist](references/submission.md) and [measurement baseline](references/monitoring.md).

The focused skills can handle individual areas when installed. This skill contains all references and the audit runtime needed to work alone.

## Decision rules

Do not turn every page into an article, FAQ, or tutorial. A pricing page must support a buying decision. A support page must resolve a problem. Choose structured data for the real entities.

Separate deterministic errors from semantic judgments and current search-provider rules. Do not offer a universal AI visibility score or a promised ranking improvement. Use [book coverage](references/book.md) when translating a book recommendation into a check.

When a claim lacks evidence, record the missing information. Do not invent statistics, reviews, prices, credentials, authorship, or features. A request to optimize local sources does not authorize deployment or external submissions.
