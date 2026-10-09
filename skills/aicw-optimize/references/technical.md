# Technical audit decisions

Book basis: Chapter 7, pages 46-71, and Checklist 3 on page 71. Complete its eight items in [the review worksheet](book-checklist.md). The protocol checks below implement these items; they are not additional book ranking factors.

## Access and discovery

Inspect `robots.txt` groups, path rules, longest-match precedence, and sitemap declarations. An empty `Disallow` is not a block. Separate search crawlers, training crawlers, and user-triggered fetchers. Keep the owner's intended policy. The bundled bot list is a dated starting point, not a complete registry.

A missing robots file means no exclusions from that file. A failed request is unknown. Neither result proves that an actual crawler can pass a production firewall. User-agent simulation does not verify a crawler's IP identity.

Inspect response headers and meta robots independently. `noindex`, `nosnippet`, and training opt-outs have different purposes and support. Local preview restrictions can be intentional. Authentication protects private content; robots directives do not.

Discover sitemaps from robots declarations and common CMS endpoints. Parse XML and follow sitemap indexes within the selected origin. Inspect listed page URLs, malformed or unreachable entries, and the CMS generator. URL identity and modification-date checks are implementation diagnostics. Record traversal limits and unresolved routes.

## Rendering and content

Compare response HTML with the browser-rendered main content. Look for missing answers, headings, links, media descriptions, and structured data. Prefer returning essential public content in HTML when the framework supports it. Static generation and server rendering can both accomplish this.

Script tags, minified code, client navigation, or hydration do not prove that a page is invisible. Look at the actual text. Conversely, a large raw HTML file can contain only navigation while the important answer needs JavaScript.

The browser helper blocks external origins and records them. If an external script supplies essential content, the comparison is incomplete. Missing browser access is a skipped check.

## Performance and media

Follow Checklist 3’s speed review: measure image sizes, compression opportunities, code size, and loading behavior before changing them. For media JSON-LD and transcripts, use Chapter 7, pages 61-63, and the [implementation notes](implementation-notes.md).

Record local timing observations without treating them as production or real-user metrics. Use an existing Lighthouse or browser-performance workflow when available. Report which pages and devices were measured and whether the results are laboratory or field measurements.

## Optional files and public evidence

Treat `llms.txt` as an optional document for systems that consume it. Its absence is not a ranking failure. Do not confuse it with crawler permission controls.

Local checks cannot establish search-index presence, Common Crawl inclusion, real-user speed, production access controls, or AI citations. Use explicit online checks or supplied exports for those questions. See [monitoring](monitoring.md) and [submission](submission.md).

The helper does not measure Core Web Vitals, test every sitemap priority policy, inspect media provenance, or submit URLs. Mark those rows unassessed unless separate evidence is available.
