import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BOOK_SOURCE } from './book.mjs';

function md(value) { return String(value ?? '').replace(/[|]/g, '\\|').replace(/[\r\n]/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
export function markdownReport(report) {
  const lines = ['# AICW local website audit', '',
    `Based on ${BOOK_SOURCE.author}’s [${BOOK_SOURCE.title}](${BOOK_SOURCE.url}), full 84-page edition.`, '',
    `Inspected ${report.coverage.inspected} pages. Mode: ${report.mode}. Coverage truncated: ${report.coverage.truncated ? 'yes' : 'no'}.`, '',
    'A pass applies only to its stated check. Review items need judgment. Unknown and skipped checks are not passes.', '',
    'Book-application findings apply a checklist principle. Implementation-check findings are engineering checks used to inspect that principle; their exact algorithms are not in the book. Current-correction findings update a printed example using the linked technical definition.', '',
    '| Status | Rule | Basis | Location | Evidence | Next action |', '| --- | --- | --- | --- | --- | --- |'];
  for (const f of report.findings) {
    const basis = `${f.kind}; ${f.book.checklistItems.join(', ')}; PDF p. ${f.book.pages}`;
    const sources = (f.implementationSources ?? []).map(url => `[definition](${url})`).join(' ');
    lines.push(`| ${f.status} | ${md(f.rule)} | ${md(basis)} ${sources} | ${md(f.source)} | ${md(f.evidence)} | ${md(f.recommendation)} |`);
  }
  lines.push('', '## Book checklist coverage', '',
    'These are agent review tasks, not automated passes. Complete relevant rows with scope, evidence, action, and before/after assessment. Evidence counts do not establish satisfaction.', '',
    '| Item | PDF page | Principle | Assessment | Related findings | Review required |', '| --- | --- | --- | --- | --- | --- |');
  for (const row of report.bookChecklist ?? []) lines.push(`| ${row.id} | ${row.page} | ${md(row.principle)} | ${row.status} | ${row.findingIndexes.length} | ${md(row.review)} |`);
  lines.push('', '## Limits', '', ...report.limitations.map(x => `- ${x}`), '', '## Content evidence', '');
  for (const page of report.pages) lines.push(`### ${md(page.url)}`, '', md(page.title), '', md(page.text), '');
  return lines.join('\n');
}
export async function writeReport(report, dir) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'audit.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(path.join(dir, 'audit.md'), markdownReport(report));
}
export function compareReports(before, after) {
  const key = f => JSON.stringify([f.rule, f.source, f.block, f.path, f.agent, f.url]);
  const beforeProblems = before.findings.filter(f => ['fail', 'review', 'unknown'].includes(f.status));
  const afterKeys = new Set(after.findings.filter(f => ['fail', 'review', 'unknown'].includes(f.status)).map(key));
  const beforeKeys = new Set(beforeProblems.map(key));
  const afterSources = new Set(after.pages.map(p => p.source));
  return { version: 1, book: BOOK_SOURCE, before: before.createdAt, after: after.createdAt,
    noLongerReported: beforeProblems.filter(f => !afterKeys.has(key(f)) && afterSources.has(f.source)),
    newFindings: after.findings.filter(f => ['fail', 'review', 'unknown'].includes(f.status) && !beforeKeys.has(key(f))),
    coverage: { before: before.coverage, after: after.coverage },
    note: 'No longer reported does not prove a fix. Inspect changed coverage, skipped checks, and the source diff.' };
}
