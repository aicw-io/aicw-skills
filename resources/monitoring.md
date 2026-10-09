# Measure AI search outcomes

Book basis: Chapters 3-5 and Chapter 8, pages 77-79. The recording fields and comparison methods below implement Checklist 4; the book does not prescribe a fixed query mix or experiment format.

## Establish a baseline

Choose queries from real tasks: learning, comparing, buying, navigating, or solving a problem. Choose branded or unbranded queries according to the measurement question. Keep the exact query text stable when comparing observations.

Record the engine, time, region, language, model or mode when available, and whether the answer used web search. Record the answer, mentioned brands, cited URLs, and supporting screenshots or exported results. Treat a login or access failure as missing data.

Use separate measures:

| Measure | Evidence |
| --- | --- |
| Brand mention | The answer names the brand. A link is not required. |
| Citation | The answer includes a source link to the site. |
| Search indexing | Provider inspection or another explicit observation, with its limits. |
| Referral traffic | Observed visits attributed to a source, subject to referrer loss. |
| Conversion | A defined business action and the attribution method used. |
| Public crawl presence | A record in a specified archive and crawl date. |

Common Crawl presence does not prove that a current model trained on that page. Absence from one index does not prove absence from all datasets. A search result query is a partial observation, not a complete index audit.

## Use available evidence

Compare before and after audit JSON with the bundled `compare` command. Its output identifies findings that changed. It does not prove causality or account for every change in audit coverage.

For supplied exports, connected analytics, or AI mention reports, match the website property and inspect fields and timestamps before analysis. Retain dates, sample sizes, and collection conditions. Do not assume that a specific AI tool's export format is installed or stable.

If no observations exist, produce a collection worksheet and query list. Do not invent baseline numbers. A useful worksheet contains: query, intent, engine, mode, locale, observed_at, brand_mentioned, cited_urls, evidence_path, and notes.

## Review experiments

Keep a change log with the edited pages, reason, deployment date if known, and observation window. Compare similar periods and query conditions. Account for changes in model behavior, seasonality, demand, publication, and attribution.

Separate improvements in technical quality from changes in search outcomes. Choose the next edit from demonstrated missing answers or defects. Keep [submission state](submission.md) separate from observed indexing and citations.


## Complete Checklist 4

For frequently cited sources (page 79), record the query, observed cited URL, source type (competitor, Reddit, Quora, or another actual source), what question it answers, evidence quality, and a gap on the audited site. Use observations, not a fabricated competitor list. This is content analysis, not an instruction to post or build backlinks.

For trusted news (page 79), keep a dated source link, the announced change, the affected book recommendation, and whether an implementation correction is needed. Prefer the provider's own announcement when verifying a changed interface or rule. Do not expand the optimization scope with unrelated trends.

Complete all six rows in [the review worksheet](book-checklist.md). When analytics or AI observations are unavailable, deliver a collection plan and mark the outcome rows unassessed.
