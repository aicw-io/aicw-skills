---
name: aicw-audit
description: Audit and fix local website access and rendering for search crawlers. Use for robots.txt, sitemap indexes, raw versus rendered HTML, load-speed evidence, and the technical checklist in the AICW book.
license: AGPL-3.0-only
compatibility: Requires local file and command access and Node.js 22+ for audit scripts. Browser and WordPress checks need the corresponding local runtime.
metadata:
  author: aicw-io
  version: 0.2.0
---

# Audit technical access

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Runtime: Node.js 22+. Optional puppeteer-core and installed Chrome for browser checks.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review the source directly and mark executable checks unverified.

Read [technical checks](references/technical.md), [workflow](references/workflow.md), and the relevant [platform](references/platforms.md). Use [tools](references/tools.md) to run `scripts/audit.mjs` against HTML files or a local preview.

First establish the intended audience and crawler policy. Training, search indexing, and user-triggered retrieval serve different purposes. Keep intentional exclusions, staging restrictions, authentication, and private pages intact.

Inspect the report's coverage before interpreting its findings. Files cannot establish HTTP behavior. Local HTTP cannot establish production CDN or firewall behavior. A browser comparison cannot reproduce every crawler. Missing evidence is unknown or skipped, not a pass.

For a requested fix, edit the source responsible for the defect: the HTML, framework component, CMS configuration, sitemap generator, or local server configuration. Use the existing build and preview commands. Repeat relevant checks and inspect the affected page.

Report measured timings as observations. Do not label a single local response time as Core Web Vitals or infer real-user performance. Use page-specific evidence to propose image, script, or rendering improvements.

The book basis is Checklist 3 on page 71. Read [current implementation notes](references/implementation-notes.md) before treating sitemap priority, FAQ markup, or llms.txt as a requirement. Public indexing checks and submissions belong to explicit follow-up requests.
