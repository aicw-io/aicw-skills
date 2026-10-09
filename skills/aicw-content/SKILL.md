---
name: aicw-content
description: Audit and improve page text for user intent and AI search understanding. Use for unanswered questions, weak task coverage, titles, headings, semantic context, conversational queries, FAQs, and evidence-based rewrites in a local website.
license: AGPL-3.0-only
compatibility: Requires local file and command access and Node.js 22+ for audit scripts. Browser and WordPress checks need the corresponding local runtime.
metadata:
  author: aicw-io
  version: 0.2.0
---

# Match content to the reader's task

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Runtime: Node.js 22+ for optional local HTML extraction.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path. For file audits, pass the selected website with `--root`; keep paths with spaces quoted. Check `node --version` before running it. If command access or Node.js 22+ is unavailable, review the source directly and mark executable checks unverified.

Read [content intent](references/content-intent.md), [workflow](references/workflow.md), and the relevant [platform](references/platforms.md). The book basis is Chapter 3 and Chapter 6, especially Checklist 1 on page 45.

Use the local audit command in [tools](references/tools.md) to extract page text, headings, and metadata. If only Markdown, MDX, or CMS content is available, read it directly and label rendered-output checks as unverified.

For each page, produce an intent brief with the intended audience, primary task, supporting questions, quoted evidence, missing answers, and next action. Distinguish the intended task from the task the current page actually serves. Label inferred intent and explain uncertainty. Ask about the audience only when the source cannot resolve a material ambiguity.

Assess each meaningful question as answered, partly answered, absent, or outside the page's purpose. Cite the section or passage behind that assessment. Check the title, opening, headings, examples, limitations, and call to action against the same task.

If editing is requested, address useful gaps in the authoritative source. Preserve supported claims, language, voice, links, and valuable detail. Add a FAQ only when real unanswered questions justify it. Keep visible answers and existing FAQ JSON-LD synchronized.

Re-read the changed page as the intended reader. State which questions it now answers and what remains uncertain. Do not treat keyword density, question punctuation, word counts, or model-generated search volumes as evidence of intent satisfaction.

Complete all seven Checklist 1 rows in [the review worksheet](references/book-checklist.md) for each selected page, with evidence and a before/after assessment. A title or keyword present in the HTML is not a passed intent check.
