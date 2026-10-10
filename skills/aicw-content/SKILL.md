---
name: aicw-content
description: Audit and improve page text for user intent and AI search understanding. Use for unanswered questions, weak task coverage, titles, headings, semantic context, conversational queries, FAQs, and evidence-based rewrites on the selected website.
license: MIT
compatibility: Use available file, web, or CMS connector access for the selected website. Bundled scripts require command access and Node.js 22+. Browser checks need a browser runtime. Connectors are not included.
metadata:
  author: aicw-io
  version: 0.3.0
---

# Match content to the reader's task

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Select the website before site-specific work. Questions about the book or the skill itself need no website target. Use the user’s URL, project, or connected site when the target is clear. Otherwise ask: “Which website should I work on: a URL, local project, or connected CMS?” Follow [target and access selection](references/workflow.md#select-the-website-and-access). A URL permits inspection; edits need access to the selected source or CMS. Ask only for missing information, not for details already supplied.

Runtime: Node.js 22+ for optional HTML extraction with the bundled helper.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review available page content or connector data and mark executable checks unverified.

Read [content intent](references/content-intent.md), [workflow](references/workflow.md), and the relevant [platform](references/platforms.md). The book basis is Chapter 3 and Chapter 6, especially Checklist 1 on page 45.

Read page text, headings, and metadata through the available access. Use the audit command in [tools](references/tools.md) when suitable. If only Markdown, MDX, or CMS content is available, read it directly and label rendered-output checks as unverified.

For each page, produce an intent brief with the intended audience, primary task, supporting questions, quoted evidence, missing answers, and next action. Distinguish the intended task from the task the current page actually serves. Label inferred intent and explain uncertainty. Ask about the audience only when the source cannot resolve a material ambiguity.

Assess each meaningful question as answered, partly answered, absent, or outside the page's purpose. Cite the section or passage behind that assessment. Check the title, opening, headings, examples, limitations, and call to action against the same task.

If editing is requested, address useful gaps in the authoritative source. Preserve supported claims, language, voice, links, and valuable detail. The book recommends general and embedded FAQs. Implement useful FAQ answers from real questions; record a gap or an explicit applicability decision when this is not done. Keep visible answers and existing FAQ JSON-LD synchronized.

Re-read the changed page as the intended reader. State which questions it now answers and what remains uncertain. Do not treat keyword density, question punctuation, word counts, or model-generated search volumes as evidence of intent satisfaction.

Complete all seven Checklist 1 rows in [the review worksheet](references/book-checklist.md) for each selected page, with evidence and a before/after assessment. A title or keyword present in the HTML is not a passed intent check.
