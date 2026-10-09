# Book checklist review worksheet

Based on Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/), full 84-page PDF. The items below are paraphrases of its four checklists.

For each relevant item, record: page or site scope, status, quoted or measured evidence with its location, proposed action, authoritative source to edit, and verification after the edit. Use satisfied, partial, gap, not-assessed, or not-applicable. Explain not-applicable decisions. Keep before and after assessments separate.

The automatic audit leaves all checklist assessments as not-assessed and links available findings as evidence. Parsing JSON, finding a title, or counting keywords cannot complete a book checklist. The agent must read the page and finish the relevant rows. A focused skill may leave unrelated checklists unassessed.

| Item | PDF page | Book principle | Evidence and review required |
| --- | --- | --- | --- |
| C1.1 | 45 | Identify the primary reader intent | State the concrete informational, transactional, navigational, or problem-solving task with text evidence. |
| C1.2 | 45 | Make the title signal that intent | Explain how the title identifies the task; a nonempty title does not establish this. |
| C1.3 | 45 | Address specific situations through long-tail language | Find a meaningful audience constraint or situation and the answer it needs. |
| C1.4 | 45 | Use conversational language and natural questions | Read the actual wording and answers; question marks alone are not evidence. |
| C1.5 | 45 | Include relevant related terms and entities | Explain how the related concepts clarify the answer; do not count keywords. |
| C1.6 | 45 | Organize useful questions and answers | Match headings to the reader’s questions and inspect the answers underneath. |
| C1.7 | 45 | Implement FAQ or PAA sections | Assess general and embedded FAQs; implement useful answers, or record a gap or explicit applicability decision. |
| C2.1 | 64 | Choose primary and secondary schema types | Match types to real page entities and explain the selection. |
| C2.2 | 64 | Implement JSON-LD through the existing source or CMS | Locate the generator and inspect its emitted HTML. |
| C2.3 | 64 | Validate the emitted JSON-LD | Record Schema Markup Validator or Google Rich Results Test evidence; local checks alone leave this item incomplete. |
| C2.4 | 64 | Monitor indexing after structured-data changes | Record dated search-console or analytics observations, or mark evidence unavailable. |
| C3.1 | 71 | Review and test robots.txt | Compare path rules with the intended crawler policy. |
| C3.2 | 71 | Review and test the sitemap | Check XML, listed routes, scope, and generator output. |
| C3.3 | 71 | Review frequency and priority tags for large sites | Record the book’s suggestion and the current Google exception; do not require tags Google ignores. |
| C3.4 | 71 | Make essential content available in response HTML | Check actual main content in raw and rendered HTML; static HTML can satisfy the book’s SSR objective. |
| C3.5 | 71 | Review load speed and its causes | Use measured image, code, and page-performance evidence; local timing is not Core Web Vitals. |
| C3.6 | 71 | Describe the main content with JSON-LD | Check the emitted graph against the visible primary content. |
| C3.7 | 71 | Describe FAQ content with JSON-LD | When a FAQ exists, compare its visible questions and answers with its markup. |
| C3.8 | 71 | Submit the website and sitemap to engines | Use Google, Bing/IndexNow, and Brave guidance; distinguish prepared from submitted and indexed. |
| C4.1 | 79 | Observe visibility in AI answers | Record actual answers and citations with query, engine, date, and mode. |
| C4.2 | 79 | Study frequently cited sources in the niche | Compare cited competitors, Reddit, or Quora using observed answers; record what they answer better. |
| C4.3 | 79 | Track traffic, click-through rate, and conversions | Use supplied or collected measurements and state attribution limits. |
| C4.4 | 79 | Refresh content using observed performance | Connect each proposed update to a finding or missing answer. |
| C4.5 | 79 | Follow reliable AI search updates | Record dated official changes that affect a book recommendation; do not introduce unrelated tactics. |
| C4.6 | 79 | Experiment with content formats and technical changes | Define one hypothesis, changed pages, observation window, and comparison evidence. |

## Record application decisions explicitly

Checklist 1 recommends FAQs, and pages 42-44 discuss both general FAQ pages and embedded sections. Assess both. If no useful recurring questions fit a selected page, explain the applicability decision. An absent FAQ is not a satisfied implementation item.

Checklist 3 recommends SSR. Existing static HTML can already deliver the essential content in the initial response; this does not require migrating an HTML or Astro site to a server framework. Record the raw content evidence.

Checklist 3 suggests frequency and priority tags on large sites. Keep the item visible, but label the current Google exception from [implementation notes](implementation-notes.md). Do not silently replace that item with a different SEO rule.

Chapter 7 also discusses media JSON-LD and C2PA (pages 61-63), optional llms.txt (pages 64-66), and engine submissions (pages 66-70). Chapter 5 discusses Common Crawl (pages 32-37). Apply these when relevant, cite those pages, and mark unavailable evidence explicitly.
