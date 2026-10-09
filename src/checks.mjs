import robotsParser from 'robots-parser';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { compact } from './html.mjs';

import { ruleProvenance } from './book.mjs';

export function finding(rule, category, status, severity, source, evidence, recommendation, extra = {}) {
  return { rule, category, status, severity, source, evidence, recommendation, ...extra, ...ruleProvenance(rule) };
}
const list = v => Array.isArray(v) ? v : v === undefined ? [] : [v];
const typeName = s => typeof s === 'string' ? s.replace(/^https?:\/\/schema\.org\//, '') : '';
export function jsonNodes(value, path = '$', result = []) {
  if (Array.isArray(value)) value.forEach((x, i) => jsonNodes(x, `${path}[${i}]`, result));
  else if (value && typeof value === 'object') {
    result.push({ value, path });
    for (const [key, child] of Object.entries(value)) if (key !== '@context') jsonNodes(child, `${path}.${key}`, result);
  }
  return result;
}
export function checkJsonLD(page) {
  const findings = [];
  const emit = (rule, status, severity, evidence, recommendation, extra = {}) => findings.push(finding(rule, 'jsonld', status, severity, page.source, evidence, recommendation, extra));
  if (!page.jsonld.length) {
    emit('jsonld.missing', 'review', 'info', 'No application/ld+json block in the inspected HTML.', 'Identify the page’s real entities and implement relevant JSON-LD through its existing source, following Checklist 2. Absence alone is not an indexing failure.');
    return findings;
  }
  const nodes = [];
  for (const block of page.jsonld) {
    const position = { block: block.index, line: block.line };
    if (block.error) { emit('jsonld.syntax', 'fail', 'error', block.error, 'Fix JSON syntax at the source that generates this block.', position); continue; }
    if (!block.data || typeof block.data !== 'object' || (Array.isArray(block.data) && block.data.some(x => !x || typeof x !== 'object' || Array.isArray(x)))) {
      emit('jsonld.root', 'fail', 'error', 'Block is not a node object or an array of node objects.', 'Emit a JSON-LD object or an array of objects; remove primitive root entries.', position); continue;
    }
    emit('jsonld.syntax', 'pass', 'info', 'Block parses as JSON.', 'Continue with graph and visible-content checks.', position);
    const roots = list(block.data);
    if (roots.some(n => !n?.['@context'])) emit('jsonld.context', 'review', 'warning', 'A top-level object has no @context.', 'Make sure that the vocabulary is declared for each independent root.', position);
    if (roots.some(n => n?.['@context'] && !/^https?:\/\/schema\.org\/?$/.test(String(n['@context'])))) emit('jsonld.context-custom', 'review', 'info', 'Custom or compound context detected.', 'Inspect context aliases manually. The local checker does not expand remote JSON-LD contexts.', position);
    for (const node of jsonNodes(block.data)) nodes.push({ ...node, ...position });
  }
  const definitions = new Map();
  for (const n of nodes) {
    const v = n.value;
    if (typeof v['@id'] === 'string' && Object.keys(v).some(k => k !== '@id' && k !== '@context')) {
      const id = resolveId(v['@id'], page.url);
      const prev = definitions.get(id) ?? [];
      for (const other of prev) {
        const conflicts = Object.keys(v).filter(k => !k.startsWith('@') && other.value[k] !== undefined && JSON.stringify(v[k]) !== JSON.stringify(other.value[k]));
        if (conflicts.length) emit('jsonld.conflict', 'review', 'warning', `${id}: repeated definitions differ in ${conflicts.join(', ')}.`, 'Reconcile conflicting facts in the existing generator. Repeated @id nodes can legitimately extend one entity.', { block: n.block, path: n.path });
      }
      definitions.set(id, [...prev, n]);
    }
  }
  const visible = normalize(page.visibleText);
  for (const n of nodes) {
    const v = n.value, position = { block: n.block, path: n.path, line: n.line };
    const types = list(v['@type']).map(typeName);
    if (v['@type'] !== undefined && (!types.length || types.some(t => !t))) emit('jsonld.type', 'fail', 'error', '@type contains a non-string value.', 'Use a type name or an array of type names.', position);
    if (typeof v['@id'] === 'string' && Object.keys(v).length === 1) {
      const id = resolveId(v['@id'], page.url);
      if (id.includes('#') && id.split('#')[0] === page.url?.split('#')[0] && !definitions.has(id)) emit('jsonld.reference', 'review', 'warning', `Page-local reference has no definition in inspected blocks: ${id}`, 'Connect the reference to the correct entity or add its existing missing identifier. External references are not required to be defined on this page.', position);
    }
    for (const key of ['datePublished', 'dateModified', 'uploadDate']) {
      if (v[key] !== undefined && (typeof v[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v[key]) || Number.isNaN(Date.parse(v[key])))) emit('jsonld.date', 'review', 'warning', `${key}: ${JSON.stringify(v[key])}`, 'Use the truthful ISO date or date-time for this fact.', position);
    }
    if (types.includes('Clip')) for (const key of ['startOffset', 'endOffset']) {
      if (v[key] !== undefined && (typeof v[key] !== 'number' || v[key] < 0)) emit('jsonld.clip-offset', 'fail', 'error', `${key} is not a nonnegative number of seconds.`, 'Use numeric seconds, for example 0 and 150. Do not use duration strings.', position);
    }
    if (types.includes('Clip') && typeof v.startOffset === 'number' && typeof v.endOffset === 'number' && v.endOffset <= v.startOffset) emit('jsonld.clip-order', 'fail', 'error', 'Clip end is not after its start.', 'Use the actual clip start and end times.', position);
    if (v.transcript !== undefined && typeof v.transcript !== 'string') emit('jsonld.transcript', 'fail', 'error', 'transcript is not text.', 'Use a plain string containing the actual transcript.', position);
    if (types.includes('FAQPage')) for (const q of list(v.mainEntity)) {
      if (!q?.name || !q.acceptedAnswer?.text) emit('jsonld.faq-shape', 'review', 'warning', 'FAQ item lacks a question name or answer text.', 'Describe the visible question and its actual answer.', position);
      for (const phrase of [q?.name, q?.acceptedAnswer?.text]) if (typeof phrase === 'string' && normalize(phrase) && !visible.includes(normalize(phrase))) emit('jsonld.visible-faq', 'review', 'warning', `FAQ text not matched in visible HTML: ${compact(phrase).slice(0, 180)}`, 'Compare the rendered FAQ and structured data. Update the existing source of truth; do not add hidden answers.', position);
    }
    if (types.some(t => ['Review', 'AggregateRating', 'Product', 'Offer', 'Person', 'Article', 'Book', 'Chapter', 'HowTo', 'VideoObject', 'QAPage'].includes(t))) emit('jsonld.content-match', 'review', 'info', `${types.join(', ')} at ${n.path}`, 'Compare the entity, authorship, prices, dates, steps, media, and claims with visible content and known facts. Apply current type-specific guidance.', position);
  }
  const types = [...new Set(nodes.flatMap(n => list(n.value['@type']).map(typeName)).filter(Boolean))];
  emit('jsonld.inventory', 'pass', 'info', `Detected types: ${types.join(', ') || '(none)'}`, 'Choose types for the actual entities. More types do not imply better visibility.');
  return findings;
}
function resolveId(id, base) { try { return new URL(id, base).href; } catch { return id; } }
function normalize(text) { return compact(String(text).replace(/<[^>]*>/g, ' ')).toLocaleLowerCase(); }

export function checkPage(page) {
  const out = checkJsonLD(page);
  const emit = (rule, status, severity, evidence, recommendation, category = 'technical') => out.push(finding(rule, category, status, severity, page.source, evidence, recommendation));
  if (!page.text) emit('html.empty', 'fail', 'error', 'No main text found in the response HTML.', 'Inspect the page response and render essential content in the server response.');
  for (const meta of page.meta.filter(m => /^(robots|googlebot|bingbot)$/i.test(m.name))) {
    if (/\b(noindex|none|nosnippet)\b/i.test(meta.content)) emit('html.robots', 'review', 'warning', `${meta.name}: ${meta.content}`, 'Check whether the restriction is intentional, especially on local staging sites. Keep deliberate restrictions.');
  }
  const headings = page.headings.map(x => x.text).join(' | ');
  const excerpt = page.text.slice(0, 600);
  for (const [rule, evidence, task] of [
    ['intent', `Title: ${page.title}; opening: ${excerpt}`, 'State the primary informational, transactional, navigational, or problem-solving task. Quote evidence and identify unanswered supporting questions.'],
    ['title-intent', `Title: ${page.title || '(missing)'}`, 'Does this title signal the same task that the page actually answers? Explain using text evidence.'],
    ['specific-situations', `Opening: ${excerpt}`, 'Read the full extracted text for specific situations, constraints, and long-tail phrases. Explain which nuanced needs they answer or leave open.'],
    ['conversational', `Headings: ${headings}`, 'Read the full text for natural language questions and direct answers. Do not infer coverage from question punctuation.'],
    ['semantic-context', `Opening: ${excerpt}`, 'Identify related terms and entities that clarify the topic. Explain needed concepts without keyword stuffing.'],
    ['question-answers', `Headings: ${headings}`, 'Match meaningful reader questions to headings and actual answers. Mark each answered, partial, missing, or outside the page’s purpose.'],
    ['faq-usefulness', `Headings: ${headings}`, 'Review existing embedded and general FAQs, plus real unanswered questions. Record usefulness and gaps; do not add filler to satisfy a count.'],
  ]) emit(`content.${rule}`, 'review', 'info', evidence, task + ' Requires semantic review of the full page.', 'content');
  return out;
}

// Bot categories adapted from AICW Visibility's ai-user-agents.ts.
// Keep crawler policy separate from claimed product visibility.
export const BOTS = [
  ['Googlebot', 'search'], ['bingbot', 'search'], ['OAI-SearchBot', 'search'],
  ['Claude-SearchBot', 'search'], ['PerplexityBot', 'search'], ['Bravebot', 'search'],
  ['GPTBot', 'training'], ['ClaudeBot', 'training'], ['CCBot', 'training'],
  ['ChatGPT-User', 'user-fetch'], ['Claude-User', 'user-fetch'], ['Perplexity-User', 'user-fetch'],
];
export function checkRobots(text, baseURL, urls) {
  const robotsURL = new URL('/robots.txt', baseURL).href;
  const parser = robotsParser(robotsURL, text);
  const rules = [];
  for (const url of urls) for (const [agent, role] of BOTS) {
    const allowed = parser.isAllowed(url, agent);
    rules.push(finding('robots.policy', 'technical', allowed === undefined ? 'unknown' : 'review', allowed === false ? 'warning' : 'info', robotsURL,
      `${agent} (${role}): ${allowed === undefined ? 'unknown' : allowed ? 'allowed' : 'disallowed'} for ${url}`,
      'Compare this policy with the owner’s goals. A robots rule does not prove crawler access, indexing, or model training.', { agent, role, url, allowed, line: parser.getMatchingLineNumber(url, agent) }));
  }
  return { findings: rules, sitemaps: parser.getSitemaps() };
}
export function parseSitemap(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('DTD/entity declarations are not accepted in sitemaps.');
  const valid = XMLValidator.validate(xml);
  if (valid !== true) throw new Error(valid.err.msg);
  const parsed = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, parseTagValue: false }).parse(xml);
  const index = parsed.sitemapindex;
  const root = index ?? parsed.urlset;
  if (!root || typeof root !== 'object') throw new Error('Expected urlset or sitemapindex.');
  const namespace = root['@_xmlns'];
  if (namespace && namespace !== 'http://www.sitemaps.org/schemas/sitemap/0.9') throw new Error('Unexpected sitemap namespace.');
  const entries = list(index ? root.sitemap : root.url);
  for (const entry of entries) {
    if (typeof entry?.loc !== 'string') throw new Error('Entry lacks a text loc.');
    const url = new URL(entry.loc);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('loc must use HTTP or HTTPS.');
  }
  return { index: Boolean(index), entries: entries.map(e => ({ url: e.loc, lastmod: e.lastmod })) };
}
