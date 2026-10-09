// Paraphrased checklist items from the complete 84-page PDF. These are the
// optimization scope, not a claim that the book specifies our parser or CLI.
export const BOOK_SOURCE = Object.freeze({
  title: 'AI Search Engine Optimization Guide',
  author: 'Eugene Mironichev',
  url: 'https://aicw.io/books/ai-seo-guide/',
  pdfUrl: 'https://aicw.io/assets/book/ai-seo-guide/AI%20Search%20Engine%20Optimization%20Guide.pdf',
  edition: 'Full 84-page PDF; change history dated October 18, 2025',
  sha256: '4b7c348c897e62a7e2ca7015c16971cbbb488bdbd25d76ed27880c9659a43e2a',
});

const groups = [
  [1, 6, 45, [
    ['Identify the primary reader intent', 'State the concrete informational, transactional, navigational, or problem-solving task with text evidence.'],
    ['Make the title signal that intent', 'Explain how the title identifies the task; a nonempty title does not establish this.'],
    ['Address specific situations through long-tail language', 'Find a meaningful audience constraint or situation and the answer it needs.'],
    ['Use conversational language and natural questions', 'Read the actual wording and answers; question marks alone are not evidence.'],
    ['Include relevant related terms and entities', 'Explain how the related concepts clarify the answer; do not count keywords.'],
    ['Organize useful questions and answers', 'Match headings to the reader’s questions and inspect the answers underneath.'],
    ['Review FAQ or PAA coverage', 'Consider both a general FAQ page and embedded FAQs; record useful questions or explain why none fit.'],
  ]],
  [2, 7, 64, [
    ['Choose primary and secondary schema types', 'Match types to real page entities and explain the selection.'],
    ['Implement JSON-LD through the existing source or CMS', 'Locate the generator and inspect its emitted HTML.'],
    ['Validate the emitted JSON-LD', 'Run local checks; record full vocabulary and provider validation separately.'],
    ['Monitor indexing after structured-data changes', 'Record dated search-console or analytics observations, or mark evidence unavailable.'],
  ]],
  [3, 7, 71, [
    ['Review and test robots.txt', 'Compare path rules with the intended crawler policy.'],
    ['Review and test the sitemap', 'Check XML, listed routes, scope, and generator output.'],
    ['Review frequency and priority tags for large sites', 'Record the book’s suggestion and the current Google exception; do not require tags Google ignores.'],
    ['Make essential content available in response HTML', 'Check actual main content in raw and rendered HTML; static HTML can satisfy the book’s SSR objective.'],
    ['Review load speed and its causes', 'Use measured image, code, and page-performance evidence; local timing is not Core Web Vitals.'],
    ['Describe the main content with JSON-LD', 'Check the emitted graph against the visible primary content.'],
    ['Describe FAQ content with JSON-LD', 'When a FAQ exists, compare its visible questions and answers with its markup.'],
    ['Submit the website and sitemap to engines', 'Use Google, Bing/IndexNow, and Brave guidance; distinguish prepared from submitted and indexed.'],
  ]],
  [4, 8, 79, [
    ['Observe visibility in AI answers', 'Record actual answers and citations with query, engine, date, and mode.'],
    ['Study frequently cited sources in the niche', 'Compare cited competitors, Reddit, or Quora using observed answers; record what they answer better.'],
    ['Track traffic, click-through rate, and conversions', 'Use supplied or collected measurements and state attribution limits.'],
    ['Refresh content using observed performance', 'Connect each proposed update to a finding or missing answer.'],
    ['Follow reliable AI search updates', 'Record dated official changes that affect a book recommendation; do not introduce unrelated tactics.'],
    ['Experiment with content formats and technical changes', 'Define one hypothesis, changed pages, observation window, and comparison evidence.'],
  ]],
];
export const BOOK_CHECKLIST = groups.flatMap(([checklist, chapter, page, items]) => items.map(([principle, review], i) => ({
  id: `C${checklist}.${i + 1}`, checklist, chapter, page, principle, review,
})));

// Register exact rules. There is deliberately no category-level fallback that
// could make an unrelated future SEO rule appear to come from the book.
const rules = new Map();
function register(names, ids, kind = 'implementation-check', sources = []) {
  for (const rule of names.split(' ')) rules.set(rule, { ids, kind, sources });
}
register('content.intent', ['C1.1'], 'book-application');
register('content.title-intent', ['C1.2'], 'book-application');
register('content.specific-situations', ['C1.3'], 'book-application');
register('content.conversational', ['C1.4'], 'book-application');
register('content.semantic-context', ['C1.5'], 'book-application');
register('content.question-answers', ['C1.6'], 'book-application');
register('content.faq-usefulness', ['C1.7'], 'book-application');
register('jsonld.missing jsonld.inventory', ['C2.1', 'C2.2', 'C3.6']);
register('jsonld.syntax jsonld.root jsonld.context jsonld.context-custom jsonld.conflict jsonld.type jsonld.reference jsonld.date jsonld.clip-order', ['C2.3']);
register('jsonld.content-match', ['C2.1', 'C2.3', 'C3.6']);
register('jsonld.faq-shape jsonld.visible-faq', ['C2.3', 'C3.7']);
register('jsonld.clip-offset', ['C2.3'], 'current-correction', ['https://schema.org/startOffset', 'https://schema.org/endOffset']);
register('jsonld.transcript', ['C2.3'], 'current-correction', ['https://schema.org/transcript']);
register('robots.policy robots.missing robots.response robots.fetch html.robots http.robots', ['C3.1']);
register('sitemap.external sitemap.response sitemap.parse sitemap.lastmod sitemap.invalid sitemap.limit sitemap.none', ['C3.2']);
register('html.empty page.response page.source-not-html page.content-type page.fetch http.unavailable rendering.unavailable rendering.compare', ['C3.4']);
register('http.timing', ['C3.5']);

export function ruleProvenance(rule) {
  const record = rules.get(rule);
  if (!record) throw new Error(`Audit rule has no reviewed book basis: ${rule}`);
  const items = record.ids.map(id => BOOK_CHECKLIST.find(x => x.id === id));
  return {
    kind: record.kind,
    book: { ...BOOK_SOURCE, chapter: items[0].chapter, pages: [...new Set(items.map(x => x.page))].join(', '), checklistItems: record.ids },
    ...(record.sources.length ? { implementationSources: record.sources, correctionOf: 'PDF page 62 media example' } : {}),
  };
}

export function checklistEvidence(findings) {
  return BOOK_CHECKLIST.map(item => ({ ...item, status: 'not-assessed',
    findingIndexes: findings.flatMap((f, i) => f.book.checklistItems.includes(item.id) ? [i] : []),
  }));
}
