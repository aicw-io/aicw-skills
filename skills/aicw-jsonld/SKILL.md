---
name: aicw-jsonld
description: Inspect, validate, and repair application/ld+json blocks in website pages. Use for JSON-LD syntax, nested graphs, entity types, identifiers, references, duplicate generators, media fields, and agreement with visible content.
license: AGPL-3.0-only
compatibility: Use available file, web, or CMS connector access for the selected website. Bundled scripts require command access and Node.js 22+. Browser checks need a browser runtime. Connectors are not included.
metadata:
  author: aicw-io
  version: 0.3.0
---

# Inspect and repair page JSON-LD

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Select the website before site-specific work. Questions about the book or the skill itself need no website target. Use the user’s URL, project, or connected site when the target is clear. Otherwise ask: “Which website should I work on: a URL, local project, or connected CMS?” Follow [target and access selection](references/workflow.md#select-the-website-and-access). A URL permits inspection; edits need access to the selected source or CMS. Ask only for missing information, not for details already supplied.

Runtime: Node.js 22+ for bundled checks. Dynamic pages need response HTML or browser evidence from a preview or public URL.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review available page content or connector data and mark executable checks unverified.

Read [JSON-LD](references/jsonld.md), [workflow](references/workflow.md), and the relevant [platform](references/platforms.md). Read [tools](references/tools.md) to run the bundled audit. The book basis is Chapter 7, pages 53-64.

Inventory every `application/ld+json` block in the response HTML. Include arrays, `@graph`, nested entities, multiple types, and references between blocks. For JavaScript-dependent sites, compare the initial response with browser output. Source code or a CMS content record alone does not prove what the page emits.

Run deterministic checks first. Then inspect the content and decide whether each entity and property is truthful, relevant, and appropriately connected. The helper is a scoped linter, not a complete JSON-LD processor, Schema.org validator, or Google eligibility test.

Locate the existing generator before editing. Reconcile overlapping SEO plugins or components through their supported interfaces. Do not append a second generic graph to hide defects in the first one. Keep useful unknown properties and extensions.

If repair is requested, update the authoritative source or supported CMS field. Use the framework's safe JSON serialization and inspect the final script block. Preserve the intended production identity when testing on localhost. Do not replace canonical URLs with preview URLs.

Verify the final raw HTML, graph connections, and visible facts after rebuilding or refreshing the selected preview or public page. Run or record the named external validation from Checklist 2 when access and disclosure scope permit. Otherwise leave that part incomplete with the next step. Report exact block/path locations and any remaining validation. Use [current implementation notes](references/implementation-notes.md) for examples that require updates, including numeric clip offsets and plain-text transcripts.
