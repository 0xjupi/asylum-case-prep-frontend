import { Link } from 'react-router-dom';
import { QuestionSources } from './QuestionSources';
import type { AnalysisSourceLink } from '@/types/preparation';

const LABELS = { transcript: 'Original transcript', hearing: 'Mock hearing', document: 'Document metadata', research: 'Research source', lawyer_item: 'Lawyer simulation finding' };
function safeUrl(value?: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function AnalysisSources({ links, depth = 0 }: { links?: AnalysisSourceLink[] | null; depth?: number }) {
  return <details className="mt-3 border border-line bg-paper-dim p-3 text-xs text-ink-soft">
    <summary className="cursor-pointer font-medium text-accent">Supporting records</summary>
    {links == null ? <p className="mt-2">No saved source details are available for this finding.</p> : !links.length ? <p className="mt-2">No specific record was cited for this finding.</p> : <>
      <p className="mt-2">Saved records show what was referenced. They do not verify an AI interpretation or turn a statement into an established fact.</p>
      <ul className="mt-3 space-y-3">{links.map((link, index) => {
        const source = link.snapshot;
        const url = safeUrl(source?.url ?? source?.sourceUrl);
        return <li key={`${link.kind}:${link.reference}:${index}`} className="border-t border-line pt-3">
          <p className="font-medium text-ink">{LABELS[link.kind]}{source?.questionNumber ? ` · Q${source.questionNumber}` : ''}</p>
          {!link.resolved || !source ? <p className="mt-1 text-brick">This reference could not be matched to one supplied record.</p> : <div className="mt-2 space-y-2">
            {source.fileName && <p>{source.fileName}{source.page ? ` · page ${source.page}` : ''}</p>}
            {(source.question || source.title || source.name) && <p className="font-medium text-ink">{source.question ?? source.title ?? source.name}</p>}
            {(source.answer || source.applicantAnswer || source.detail || source.summary || source.description) && <p className="whitespace-pre-wrap">{source.answer ?? source.applicantAnswer ?? source.detail ?? source.summary ?? source.description}</p>}
            {source.citation && <p>{source.citation}</p>}
            {source.source && <p>Source: {source.source}</p>}
            {(source.publicationDate || source.retrievedDate || source.effectiveDate) && <p>Published: {source.publicationDate ?? 'not recorded'} · Retrieved: {source.retrievedDate ?? 'not recorded'}{source.effectiveDate ? ` · Effective: ${source.effectiveDate}` : ''}</p>}
            {url && <a href={url} target="_blank" rel="noreferrer" className="block text-accent underline">Open research source</a>}
            {link.kind === 'transcript' && source.id && <Link className="block text-accent underline" to={`/transcript?entryId=${encodeURIComponent(source.id)}`}>Find in current transcript</Link>}
            {link.kind === 'hearing' && source.sessionId && source.id && <Link className="block text-accent underline" to={`/hearing?sessionId=${encodeURIComponent(source.sessionId)}#exchange-${encodeURIComponent(source.id)}`}>Open this hearing answer</Link>}
            {link.kind === 'lawyer_item' && source.sessionId && source.reviewVersion && <Link className="block text-accent underline" to={`/hearing/lawyer?sessionId=${encodeURIComponent(source.sessionId)}&version=${source.reviewVersion}#finding-${encodeURIComponent(source.id ?? '')}`}>Open Lawyer v{source.reviewVersion} finding</Link>}
            {depth < 2 && source.sourceLinks && <AnalysisSources links={source.sourceLinks} depth={depth + 1} />}
            {source.sourceReferences && <QuestionSources sessionId={source.sessionId} exchange={{ id: source.id ?? '', questionNumber: source.questionNumber ?? 0, participant: 'bamf', question: source.question ?? '', applicantAnswer: source.applicantAnswer ?? null, answeredAt: null, provenanceAvailable: true, sourceReferences: source.sourceReferences }} />}
          </div>}
        </li>;
      })}</ul>
    </>}
  </details>;
}
