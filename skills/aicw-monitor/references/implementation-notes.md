# Current implementation notes — separate from the book

| Book guidance or example | Toolkit treatment and current reference |
| --- | --- |
| JSON-LD described as essential to AI visibility | Use it for truthful structured facts. Do not claim it is mandatory for AI inclusion or that it guarantees citations. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) |
| More specific schema types presented as an optimization | Choose the actual entity type. Distinguish vocabulary validity from provider feature support. [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) |
| FAQ and HowTo examples imply search benefits | Keep useful content and valid markup without a rich-result promise. Google removed FAQ rich results starting May 7, 2026. [Google updates](https://developers.google.com/search/updates) |
| Sitemap priority and change frequency in Checklist 3 | Do not require these tags. Google ignores them. Treat modification-date checks as implementation diagnostics, not a replacement book checklist item. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) |
| Media example uses duration strings for clip offsets | Use numeric seconds for clips. [startOffset](https://schema.org/startOffset) and [endOffset](https://schema.org/endOffset) |
| Media example represents transcript as a Text object | Use plain transcript text. [transcript](https://schema.org/transcript) |
| Rendering heuristics based on scripts or navigation | Inspect response HTML and browser output. Script presence does not establish missing content. [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) |
| Broad advice to use Google's Indexing API for real-time updates | Restrict that API to its documented eligible job and livestream types. Use sitemaps and URL Inspection for normal pages. [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/using-api) |
| Optional llms.txt proposal | Keep it optional. Do not treat it as a permission mechanism or a ranking requirement. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) |
| Dataset composition, product providers, traffic, and timing examples | Treat them as historical evidence from the stated edition. Recheck official sources before asserting current relationships or deadlines. |
| Submission and indexing language | Separate preparation, receipt, crawl, indexing, and citation. [IndexNow documentation](https://www.indexnow.org/documentation) |

Checked on 2026-10-09. These corrections preserve the book's practical intent while avoiding outdated automated requirements. Recheck current provider guidance when it materially affects an edit or submission.


## How to label engineering details

Local HTML, Astro, and WordPress workflows implement the user's requested environments. JSON parsing, graph paths, identifier checks, retries, file boundaries, and robots precedence are engineering methods for inspecting the book's topics; they are not extra ranking factors. The local browser comparison uses a small word-difference threshold to select review candidates, not to grade content quality or prove crawler behavior. Raw headers and meta restrictions are supporting access diagnostics, not separate book recommendations.

The book discusses C2PA media provenance on page 63. Preserve truthful provenance when present and report unknown metadata as unknown. Do not invent provenance or claim a required C2PA ranking signal. The bundled audit does not inspect C2PA manifests.

The book describes Brave Web Discovery Project and Perplexity Pages on page 70. Keep those as historical observations until their current availability is verified. Do not promise the printed 48-hour indexing time or treat a hosted Perplexity page as a direct index submission.
