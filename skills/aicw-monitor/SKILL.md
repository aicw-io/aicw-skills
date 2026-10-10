---
name: aicw-monitor
description: Build and compare an AI search measurement baseline using audit reports, available analytics, and recorded search observations. Use to distinguish brand mentions, citations, indexing, referral traffic, conversions, and content-refresh experiments.
license: MIT
compatibility: Use available file, web, or CMS connector access for the selected website. Bundled scripts require command access and Node.js 22+. Browser checks need a browser runtime. Connectors are not included.
metadata:
  author: aicw-io
  version: 0.3.0
---

# Measure outcomes and choose the next change

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Select the website before site-specific work. Questions about the book or the skill itself need no website target. Use the user’s URL, project, or connected site when the target is clear. Otherwise ask: “Which website should I work on: a URL, local project, or connected CMS?” Follow [target and access selection](references/workflow.md#select-the-website-and-access). A URL permits inspection; edits need access to the selected source or CMS. Ask only for missing information, not for details already supplied.

Runtime: Node.js 22+ for report comparison. Online presence checks are optional and explicit.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review available page content or connector data and mark executable checks unverified.

Read [monitoring](references/monitoring.md) and [workflow](references/workflow.md). The book basis is Chapters 3-5 and Checklist 4 on page 79. Use [tools](references/tools.md) for local report comparison or an explicitly requested Common Crawl observation.

Build a query set from real audience tasks. Record the engine, exact query, date, language, region, model or mode when visible, and whether web search was used. Keep brand mentions separate from linked citations. Record missing observations rather than inventing results.

Read supplied exports or the selected site’s analytics, search console, server-log, or AI mention data through available authorized tools. Match the account property and date range to the selected website. Inspect their actual fields first. Keep observed facts separate from attribution assumptions. Do not require a paid service, an account, or an API key for the local workflow.

Compare like-for-like observations before and after a change. Use a change log and a defined observation window. State sample size, coverage, and confounders. A citation change is not proof that a particular edit caused it.

Recommend the next experiment from the evidence: a missing answer, unclear entity, technical failure, stale fact, or overlooked audience task. Do not automatically create scheduled jobs, run paid scans, scrape authenticated AI chats, or publish content.

Cover all six Checklist 4 items in [the review worksheet](references/book-checklist.md), including analysis of actually cited competitors or community sources and a dated record of relevant industry changes.
