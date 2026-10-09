# Review JSON-LD in the page

JSON-LD is machine-readable data inside an `application/ld+json` script element. Book basis: Chapter 7, pages 53-64.

## Parse and connect the graph

Collect all blocks, not only the first. Accept object roots, array roots, `@graph`, nested objects, and multiple `@type` values. Keep block indexes, source lines, and JSON paths in the evidence.

Inspect syntax errors, empty or primitive roots, vocabulary context, malformed types, repeated identifiers, and references between blocks. The same `@id` can describe one entity across multiple blocks. Do not treat every repeated identifier as a duplicate error.

Resolve relative identifiers against the intended public page URL. Review unresolved page-local references. A reference to an external entity does not need a definition on this page. Preserve legitimate custom contexts and properties. The bundled linter does not expand arbitrary remote contexts or validate the full Schema.org vocabulary.

## Select types from real content

| Content | Types to consider when the facts fit |
| --- | --- |
| Publisher identity | Organization (page 54) |
| Page and navigation | WebPage, BreadcrumbList, SiteNavigationElement (pages 58-60) |
| Editorial content | Article (page 58) |
| Products, events, and reviews | Product, Event, Review (page 58) |
| Instructions | HowTo with actual visible steps (pages 57-60) |
| Questions and answers | FAQPage or QAPage, chosen for the actual format (page 58) |
| Media | VideoObject and Clip (pages 61-62; corrected property formats below) |

These are the book’s examples, not a closed vocabulary. Page 59 directs readers to Schema.org for the most specific relevant type; look up the actual type when a page needs another one. Label that selection as an application of this principle, not as an example quoted from the book. Schema.org validity and Google feature eligibility are separate questions. A valid type can have no supported Google rich result. There is no universal requirement to add three types or prefer FAQPage over a more relevant type.

## Compare data with the visible page

Inspect names, descriptions, authors, publisher, dates, URLs, images, breadcrumb order, prices and currency, availability, ratings, steps, questions, answers, and media. Require evidence for factual values. Do not create reviews, credentials, offers, or dates to satisfy a validator.

A FAQ answer can contain permitted HTML, so a text mismatch is a review finding rather than proof of hidden content. Compare the rendered output too. Avoid unsupported rich-result promises when adding FAQ or HowTo markup.

For media, use plain text for `transcript`. Clip `startOffset` and `endOffset` use numeric seconds. Duration fields such as `duration` use their appropriate duration format. Keep transcripts and captions accessible to people where practical.

## Repair the source and validate output

Update the existing generator or CMS configuration. Use safe JSON serialization, then read the final script contents. Compare before and after and repeat the relevant checks. On localhost, preserve the intended public canonical and entity identities.

When full vocabulary or provider validation is needed, consult [Schema.org](https://schema.org/), [Schema Markup Validator](https://validator.schema.org/), and the relevant [Google structured-data documentation](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data). Uploading unpublished page content to an external validator is a separate external action. A local parser passing is not a claim that either service ran.

Complete the four Checklist 2 rows in [the review worksheet](book-checklist.md). Do not mark monitoring complete merely because markup parses.
