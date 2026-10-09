# Apply the book to your website

These skills turn the book's checklists into a repeatable workflow. The agent uses your selected files, public URL, or connected CMS to gather evidence, make requested changes where access permits, and inspect the result.

JSON-LD is structured data embedded in a page. The JSON-LD skill inspects those actual blocks and compares their facts with the visible content. The content skill asks whether the page answers the reader's real task.

## Install and start

Install from `aicw-io/aicw-skills` through the instructions in the [README](../README.md). Select the agent you use to work on your website.

Tell the agent which website to use: a URL, project folder, or connected site. State whether you want an audit, proposed edits, draft changes, or live updates. It asks when the target is missing or ambiguous. A URL alone supports inspection; a third-party connector must expose the relevant write operations for CMS edits.

## Example requests

For a directly maintained HTML site:

> Use aicw-optimize on this HTML website. Improve the important pages for AI search. Check intent, JSON-LD, robots rules, sitemaps, and rendering. Keep the current design and factual claims. Verify the local output.

For an Astro site:

> Use aicw-jsonld and aicw-content on the pricing page and three product guides. Fix their source files, run the existing build, and compare the output with the original audit.

For a local WordPress site:

> Use aicw-optimize on this local WordPress installation. Inspect the active SEO plugin first. Back up the local database before updating posts or configuration. Verify the rendered pages and explain restoration.

For a connected CMS:

> Use aicw-content on the pricing page of the website I selected in my CMS connector. Read the current page and propose answers to missing reader questions. Save the changes as a draft if the connector supports drafts.

For a public website:

> Use aicw-audit on the public website URL I provide. Inspect reachable pages without a local checkout. Report evidence and any checks your tools cannot perform.

For an audit only:

> Use aicw-audit against this local preview. Show evidence, priorities, and missing runtime checks. Do not edit website files or the database.

When the website has not been identified:

> Use aicw-submit to help submit my website.

The agent asks for the public website address and the relevant URLs or sitemap before preparing site-specific files. If no public address exists yet, it provides a checklist.

For submission preparation:

> Use aicw-submit to prepare Google Search Console sitemap steps, Brave submission, and a Bing IndexNow payload for these changed public URLs. Keep the work local and do not send submissions.

For measurement:

> Use aicw-monitor to compare these before and after reports and my recorded AI search observations. Separate technical improvements, mentions, citations, traffic, and conversions.

## Read the result

The report distinguishes defects from items that need judgment. A JSON parsing error is deterministic. Whether a page answers a buyer's question requires the agent to read and explain the evidence.

Files alone cannot establish production server behavior. A local preview cannot establish whether a search engine indexed the public site. Submission receipt cannot establish indexing or a future AI citation.

The companion follows all four book checklists, with dated corrections for changed provider guidance. Read the [chapter map](../resources/book.md). Useful structured data and clear answers help machines and people understand a site, but they do not guarantee search results.
