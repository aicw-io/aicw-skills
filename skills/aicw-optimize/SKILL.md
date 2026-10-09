---
name: aicw-optimize
description: Audit and improve a selected website for AI search using the AICW book. Use for a whole-site optimization across content intent, JSON-LD, crawler access, rendering, and measurement. Works through available local files, public URLs, or CMS connectors.
license: AGPL-3.0-only
compatibility: Use available file, web, or CMS connector access for the selected website. Bundled scripts require command access and Node.js 22+. Browser checks need a browser runtime. Connectors are not included.
metadata:
  author: aicw-io
  version: 0.3.0
---

# Optimize a website for AI search

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Select the website before site-specific work. Questions about the book or the skill itself need no website target. Use the user’s URL, project, or connected site when the target is clear. Otherwise ask: “Which website should I work on: a URL, local project, or connected CMS?” Follow [target and access selection](references/workflow.md#select-the-website-and-access). A URL permits inspection; edits need access to the selected source or CMS. Ask only for missing information, not for details already supplied.

Runtime: Node.js 22+ for bundled audit tools. Browser checks need a browser runtime. CMS access uses the agent’s available connector or site tools.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review available page content or connector data and mark executable checks unverified.

Turn the book's four checklists into evidence, useful edits, and verified outcomes. Work on the website the user selected.

Read [workflow](references/workflow.md), then the relevant section of [platforms](references/platforms.md). These are execution instructions for selecting the site, finding its source, and verifying changes; they are not additional book recommendations. Read [audit tools](references/tools.md) before running a command.

## Workflow

1. Identify the selected site, available access, audience, important page types, and existing SEO generators. Read project or connected-site instructions where available.
2. Collect evidence from the selected files, URL, or connector. When command access is available, run `scripts/audit.mjs audit` against HTML, a preview, or the public URL with `--online`. Keep reports outside the website's source and public directories. Record scope, failures, and skipped checks.
3. Read [content intent](references/content-intent.md). For each selected page, map its audience, task, primary intent, supporting questions, evidence, and next step. Read the actual text, not only metadata.
4. Read [JSON-LD](references/jsonld.md) and inspect the actual blocks plus the rendered page. Read [technical checks](references/technical.md) for crawl, sitemap, and rendering findings.
5. Choose fixes from the book checklist evidence and the user’s priorities. Resolve access problems that prevent the requested inspection. Group repeated defects by their source component or CMS generator.
6. If the request is an audit, deliver findings. If the request asks for optimization or fixes, edit the selected source or CMS through the available tools, within the requested scope. Preserve the site's facts, language, voice, and intended crawler policy.
7. Build or refresh through the site’s existing workflow. For connector edits, read back the saved record and inspect the relevant preview or public output. Repeat affected checks; use `compare` when reports exist. State which changes are saved, published, or unverified.
8. Complete the applicable rows in [the book checklist worksheet](references/book-checklist.md). Explicitly mark unassessed items. Deliver a concise change summary, remaining decisions, test results, and coverage limits. If relevant, prepare the [submission checklist](references/submission.md) and [measurement baseline](references/monitoring.md).

The focused skills can handle individual areas when installed. This skill contains all references and the audit runtime needed to work alone.

## Decision rules

Do not turn every page into an article, FAQ, or tutorial. A pricing page must support a buying decision. A support page must resolve a problem. Choose structured data for the real entities.

Separate deterministic errors from semantic judgments and current search-provider rules. Do not offer a universal AI visibility score or a promised ranking improvement. Use [book coverage](references/book.md) when translating a book recommendation into a check.

When a claim lacks evidence, record the missing information. Do not invent statistics, reviews, prices, credentials, authorship, or features. Follow the requested edit and publication scope. Reuse existing authorization; an audit alone does not authorize changes or external submissions.
