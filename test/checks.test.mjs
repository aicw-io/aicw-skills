import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectHTML } from '../src/html.mjs';
import { checkJsonLD, checkPage, checkRobots, parseSitemap } from '../src/checks.mjs';
import { prepareSubmission } from '../src/submission.mjs';

test('submission preparation leaves an unknown sitemap unset and validates a supplied one', () => {
  const input = { origin: 'https://aicw.io', urls: ['https://aicw.io/guide/'], key: 'existing-key-123' };
  assert.equal(prepareSubmission(input).sitemap, null);
  assert.equal(prepareSubmission({ ...input, sitemap: 'https://aicw.io/wp-sitemap.xml' }).sitemap, 'https://aicw.io/wp-sitemap.xml');
  assert.throws(() => prepareSubmission({ ...input, sitemap: 'https://elsewhere.tld/sitemap.xml' }), /configured origin/);
  assert.throws(() => prepareSubmission({ ...input, origin: undefined }));
  assert.throws(() => prepareSubmission({ ...input, origin: 'https://example.com' }), /real public hostname/);
});

function page(data, body = '<h1>Guide</h1><p>Useful factual text.</p>') {
  const p = inspectHTML(`<html lang="en"><head><title>Guide</title><meta content="Useful guide" name="description"></head><body><main>${body}</main>${data.map(x => `<script type="application/ld+json">${typeof x === 'string' ? x : JSON.stringify(x)}</script>`).join('')}</body></html>`, 'index.html');
  p.url = 'https://aicw.io/guide/'; return p;
}
test('recognizes graph, nested entities, root arrays, and multi-type nodes', () => {
  const results = checkJsonLD(page([{ '@context': 'https://schema.org', '@graph': [
    { '@type': ['WebPage', 'FAQPage'], '@id': 'https://aicw.io/guide/#page', mainEntity: { '@type': 'Question', name: 'What?', acceptedAnswer: { '@type': 'Answer', text: 'This.' } } },
  ] }, [{ '@context': 'https://schema.org', '@type': 'Organization' }]]));
  const inventory = results.find(x => x.rule === 'jsonld.inventory');
  for (const type of ['WebPage', 'FAQPage', 'Question', 'Answer', 'Organization']) assert.ok(inventory.evidence.includes(type));
  assert.ok(!results.some(x => x.rule === 'jsonld.syntax' && x.status === 'fail'));
});
test('keeps a malformed block visible even when a second block parses', () => {
  const results = checkJsonLD(page(['{"@type":}', { '@context': 'https://schema.org', '@type': 'WebPage' }]));
  assert.equal(results.filter(x => x.rule === 'jsonld.syntax' && x.status === 'fail').length, 1);
  assert.equal(results.filter(x => x.rule === 'jsonld.syntax' && x.status === 'pass').length, 1);
});
test('catches unresolved page references seen in chapter output, but permits external references', () => {
  const results = checkJsonLD(page([{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', mainEntity: { '@id': '#article' }, publisher: { '@id': 'https://aicw.io/#publisher' }, breadcrumb: { '@id': '#breadcrumb' } },
    { '@type': 'Chapter', name: 'Guide' }, { '@type': 'BreadcrumbList', itemListElement: [] },
  ] }]));
  assert.equal(results.filter(x => x.rule === 'jsonld.reference').length, 2);
});
test('cross-block definitions resolve relative ids and legitimate extensions are not conflicts', () => {
  const results = checkJsonLD(page([
    { '@context': 'https://schema.org', '@type': 'WebPage', mainEntity: { '@id': '#book' } },
    { '@context': 'https://schema.org', '@type': 'Book', '@id': '#book', name: 'A book' },
    { '@context': 'https://schema.org', '@id': '#book', url: 'https://aicw.io/guide/' },
  ]));
  assert.equal(results.filter(x => ['jsonld.reference', 'jsonld.conflict'].includes(x.rule)).length, 0);
});
test('conflicting names on the same entity require review', () => {
  const results = checkJsonLD(page([{ '@context': 'https://schema.org', '@graph': [{ '@id': '#x', name: 'One' }, { '@id': '#x', name: 'Two' }] }]));
  assert.ok(results.some(x => x.rule === 'jsonld.conflict'));
});
test('catches invalid book media example and accepts corrected field formats', () => {
  const invalid = { '@context': 'https://schema.org', '@type': 'VideoObject', transcript: { '@type': 'Text', text: 'Hello' }, hasPart: { '@type': 'Clip', startOffset: 'PT0S', endOffset: 'PT2M30S' } };
  const first = checkJsonLD(page([invalid]));
  assert.equal(first.filter(x => x.rule === 'jsonld.clip-offset').length, 2);
  assert.ok(first.some(x => x.rule === 'jsonld.transcript'));
  const fixed = { ...invalid, transcript: 'Hello', hasPart: { '@type': 'Clip', startOffset: 0, endOffset: 150 } };
  assert.ok(!checkJsonLD(page([fixed])).some(x => x.status === 'fail'));
});
test('unknown context is reviewed without rewriting extensions', () => {
  const input = { '@context': { schema: 'https://schema.org/' }, '@type': 'schema:WebPage', custom: { label: 'preserve' } };
  const original = JSON.stringify(input);
  assert.ok(checkJsonLD(page([input])).some(x => x.rule === 'jsonld.context-custom'));
  assert.equal(JSON.stringify(input), original);
});
test('FAQ content checks include body but exclude hidden and script-only text', () => {
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'How?', acceptedAnswer: { '@type': 'Answer', text: 'Use a guide.' } }] };
  const hidden = checkJsonLD(page([faq], '<h1>Guide</h1><div hidden>How? Use a guide.</div>'));
  assert.equal(hidden.filter(x => x.rule === 'jsonld.visible-faq').length, 2);
  const visible = checkJsonLD(page([faq], '<h1>Guide</h1><h2>How?</h2><p>Use a guide.</p>'));
  assert.equal(visible.filter(x => x.rule === 'jsonld.visible-faq').length, 0);
});
test('HTML parsing accepts attribute order, entities, and empty decorative alternatives', () => {
  const p = page([], '<h1>Research &amp; testing</h1><img src="x.png" alt="" loading="lazy"><p>Read this.</p>');
  assert.equal(p.headings[0].text, 'Research & testing');
  const f = checkPage(p);
  assert.equal(p.meta.find(x => x.name === 'description').content, 'Useful guide');
  assert.ok(!f.some(x => x.rule.includes('lazy') || x.rule === 'html.image-alt'));
  assert.equal(f.find(x => x.rule === 'content.intent').status, 'review');
});
test('headings inside hidden ancestors do not create false hierarchy failures', () => {
  const p = page([], '<h1>Guide</h1><div hidden><h1>Hidden title</h1></div><div style="display:none"><h2>Hidden topic</h2></div>');
  assert.deepEqual(p.headings.map(h => h.text), ['Guide']);
  assert.ok(!checkPage(p).some(f => f.rule === 'html.h1'));
});
test('robots handles empty Disallow, groups, specificity, and allow ties', () => {
  const robots = `User-agent: *\nDisallow: /private/\nAllow: /private/public\n\nUser-agent: CCBot\nDisallow:\n\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\nAllow: /open$\n`;
  const get = (agent, route) => checkRobots(robots, 'https://aicw.io', ['https://aicw.io' + route]).findings.find(x => x.agent === agent).allowed;
  assert.equal(get('CCBot', '/private/'), true);
  assert.equal(get('Googlebot', '/private/a'), false);
  assert.equal(get('Googlebot', '/private/public'), true);
  assert.equal(get('GPTBot', '/open'), true);
  assert.equal(get('GPTBot', '/open/more'), false);
  assert.equal(get('ClaudeBot', '/other'), false);
});
test('sitemap indexes and namespaces parse, malformed XML and relative loc do not', () => {
  const parsed = parseSitemap('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://aicw.io/posts.xml</loc></sitemap></sitemapindex>');
  assert.equal(parsed.index, true); assert.equal(parsed.entries[0].url, 'https://aicw.io/posts.xml');
  assert.throws(() => parseSitemap('<urlset><url></urlset>'));
  assert.throws(() => parseSitemap('<urlset><url><loc>/relative</loc></url></urlset>'));
  assert.throws(() => parseSitemap('<!DOCTYPE urlset><urlset/>'));
});
test('submission is preparation only and validates host, key, and URL count', () => {
  const plan = prepareSubmission({ origin: 'https://aicw.io', urls: ['https://aicw.io/a/', 'https://aicw.io/a/'], key: 'existing-key-123' });
  assert.equal(plan.status, 'prepared-not-submitted');
  assert.equal(plan.indexnow.payload.urlList.length, 1);
  assert.equal(plan.keyFile.content, 'existing-key-123');
  assert.throws(() => prepareSubmission({ origin: 'http://localhost:4321', urls: [] }));
  assert.throws(() => prepareSubmission({ origin: 'https://aicw.io', urls: ['https://elsewhere.tld/a/'] }));
  assert.throws(() => prepareSubmission({ origin: 'https://aicw.io', urls: ['https://aicw.io/a/'], key: '../bad' }));
});
