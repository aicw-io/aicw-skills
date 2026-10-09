---
name: aicw-jsonld
description: Inspect, validate, and repair application/ld+json blocks in local website pages. Use for JSON-LD syntax, nested graphs, entity types, identifiers, references, duplicate generators, media fields, and agreement with visible content.
license: AGPL-3.0-only
compatibility: Requires local file and command access and Node.js 22+ for audit scripts. Browser and WordPress checks need the corresponding local runtime.
metadata:
  author: aicw-io
  version: 0.1.0
---

# Inspect and repair page JSON-LD

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Runtime: Node.js 22+ for bundled checks. A local preview is needed for dynamic pages.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review the source directly and mark executable checks unverified.

Read [JSON-LD](references/jsonld.md), [workflow](references/workflow.md), and the relevant [platform](references/platforms.md). Read [tools](references/tools.md) to run the bundled local audit. The book basis is Chapter 7, pages 53-64.

Inventory every `application/ld+json` block in the response HTML. Include arrays, `@graph`, nested entities, multiple types, and references between blocks. For JavaScript-dependent sites, compare the initial response with browser output. A WordPress or Astro source template alone does not prove what the page emits.

Run deterministic checks first. Then inspect the content and decide whether each entity and property is truthful, relevant, and appropriately connected. The helper is a scoped linter, not a complete JSON-LD processor, Schema.org validator, or Google eligibility test.

Locate the existing generator before editing. Reconcile overlapping SEO plugins or components through their supported interfaces. Do not append a second generic graph to hide defects in the first one. Keep useful unknown properties and extensions.

If repair is requested, update the authoritative local source. Use the framework's safe JSON serialization and inspect the final script block. Preserve the intended production identity when testing on localhost. Do not replace canonical URLs with preview URLs.

Verify the final raw HTML, graph connections, and visible facts after rebuilding or refreshing the local runtime. Report exact block/path locations and any remaining manual validation. Use [current implementation notes](references/implementation-notes.md) for examples that require updates, including numeric clip offsets and plain-text transcripts.
