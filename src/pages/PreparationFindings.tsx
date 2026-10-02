import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { preparationService } from '@/services/api/preparationService';
import { useAsync } from '@/hooks/useAsync';
import { AnalysisSources } from '@/components/AnalysisSources';
import { Panel, PanelHeader, Badge, Button, SimulationNotice } from '@/components/ui';
import { SkeletonPanel } from '@/components/ui/Skeleton';

export function PreparationFindings() {
  const [params, setParams] = useSearchParams();
  const sessionId = params.get('sessionId');
  const lawyerVersion = Number(params.get('lawyerVersion')) || undefined;
  const judgeVersion = Number(params.get('judgeVersion')) || undefined;
  const [origin, setOrigin] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const result = useAsync(() => sessionId ? preparationService.get(sessionId, lawyerVersion, judgeVersion) : Promise.resolve({ data: null, isMock: false }), [sessionId, lawyerVersion, judgeVersion]);
  const selectionMatches = result.data?.sessionId === sessionId && (!lawyerVersion || result.data.lawyerReview?.version === lawyerVersion) && (!judgeVersion || result.data.judgeEvaluation?.version === judgeVersion);
  const data = selectionMatches ? result.data : null;
  const categories = [...new Set(data?.findings.map(f => f.category) ?? [])];
  const findings = data?.findings.filter(f => (origin === 'all' || f.origin === origin) && (category === 'all' || f.category === category) && `${f.title} ${f.detail}`.toLowerCase().includes(query.toLowerCase())) ?? [];
  function selectVersion(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  return <div className="space-y-6">
    <div><h1 className="font-display text-2xl font-semibold text-ink">Preparation findings</h1><p className="mt-1 text-sm text-ink-soft">Review questions, evidence gaps, and arguments from this hearing's analyses, together with their saved supporting records.</p></div>
    <SimulationNotice>These are AI simulation findings for preparation. Discuss legal questions with your real lawyer; no outcome is predicted here.</SimulationNotice>
    {!sessionId ? <Panel><p>Select a hearing to view its findings.</p><Link className="mt-3 block text-accent underline" to="/sessions">Choose a previous session</Link></Panel> : result.loading ? <SkeletonPanel /> : result.error ? <Panel><p role="alert" className="text-brick">{result.error}</p><Button className="mt-3" onClick={result.reload}>Try again</Button></Panel> : !data ? <Panel><p>Connect your backend to view preparation findings from saved analyses.</p></Panel> : <>
      <Panel>
        <PanelHeader title="Analysis versions" description={`${data.sessionStatus === "completed" ? "Completed hearing" : "Active hearing"} · ${data.answeredQuestionCount} answered questions`} />
        <div className="flex flex-wrap gap-4">
          <label className="text-sm">Lawyer version <select className="ml-2 border border-line bg-surface p-2" value={lawyerVersion ?? ''} onChange={e => selectVersion('lawyerVersion', e.target.value)}><option value="">Latest</option>{data.lawyerVersions.map(v => <option key={v.id} value={v.version}>v{v.version}</option>)}</select></label>
          <label className="text-sm">Judge version <select className="ml-2 border border-line bg-surface p-2" value={judgeVersion ?? ''} onChange={e => selectVersion('judgeVersion', e.target.value)}><option value="">Latest</option>{data.judgeVersions.map(v => <option key={v.id} value={v.version}>v{v.version}</option>)}</select></label>
        </div>
        <p className="mt-3 text-sm text-ink-soft">Showing Lawyer {data.lawyerReview ? `v${data.lawyerReview.version}` : 'not generated'} · Judge {data.judgeEvaluation ? `v${data.judgeEvaluation.version}` : 'not generated'}</p>
        {data.judgeLawyerVersionStatus === 'different' && <div role="status" className="mt-3 border border-ochre p-3 text-sm"><p>The Judge used Lawyer v{data.judgeLawyerReviewVersion}, which differs from the selected Lawyer review.</p><Button variant="secondary" size="sm" className="mt-2" onClick={() => selectVersion('lawyerVersion', String(data.judgeLawyerReviewVersion))}>Use Lawyer v{data.judgeLawyerReviewVersion}</Button></div>}
        {data.judgeLawyerVersionStatus === 'unknown' && <p className="mt-3 text-sm text-ochre">The Lawyer version used by this older Judge evaluation was not recorded.</p>}
        {data.judgeLawyerVersionStatus === 'matches' && <p className="mt-3 text-sm text-ink-soft">The Judge used the selected Lawyer version.</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-accent underline">
          <Link to={`/hearing?sessionId=${encodeURIComponent(sessionId)}`}>View hearing</Link>
          <Link to={`/hearing/lawyer?sessionId=${encodeURIComponent(sessionId)}${data.lawyerReview ? `&version=${data.lawyerReview.version}` : ''}`}>{data.lawyerReview ? 'Open Lawyer review' : 'Generate Lawyer review'}</Link>
          <Link to={`/hearing/judge?sessionId=${encodeURIComponent(sessionId)}${data.judgeEvaluation ? `&version=${data.judgeEvaluation.version}` : ''}`}>{data.judgeEvaluation ? 'Open Judge evaluation' : 'Generate Judge evaluation'}</Link>
        </div>
        {data.sessionStatus !== 'completed' && <p className="mt-3 text-sm text-ink-soft">Complete this hearing before generating analyses.</p>}
      </Panel>
      <Panel>
        <PanelHeader title="Review findings" description={`${data.findings.length} findings in the selected versions`} />
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">From <select className="ml-2 border border-line bg-surface p-2" value={origin} onChange={e => setOrigin(e.target.value)}><option value="all">Both simulations</option><option value="lawyer">Lawyer</option><option value="judge">Judge</option></select></label>
          <label className="text-sm">Category <select className="ml-2 border border-line bg-surface p-2" value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="text-sm">Search <input className="ml-2 border border-line bg-surface p-2" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search findings" /></label>
        </div>
        {!findings.length && <p className="mt-4 text-sm text-ink-soft">{data.findings.length ? 'No findings match these filters.' : data.lawyerReview || data.judgeEvaluation ? 'No findings were recorded in these categories. This does not mean all factual or legal issues are resolved.' : 'No analyses have been generated for this session yet.'}</p>}
        <ul className="mt-5 space-y-5">{findings.map(f => <li key={f.id} className="border-t border-line pt-4">
          <div className="flex flex-wrap gap-2"><Badge tone="neutral">{f.origin === 'lawyer' ? 'Lawyer' : 'Judge'} v{f.analysisVersion}</Badge><Badge tone="neutral">{f.category}</Badge>{f.basis && <span className="text-xs text-ink-faint">{f.basis.replaceAll('_', ' ')}</span>}</div>
          <h2 className="mt-2 font-medium text-ink">{f.title}</h2><p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{f.detail}</p>
          {f.sourceNote && <p className="mt-2 text-xs text-ink-faint">{f.sourceNote}</p>}
          <AnalysisSources links={f.sourceLinks} />
        </li>)}</ul>
      </Panel>
    </>}
  </div>;
}
