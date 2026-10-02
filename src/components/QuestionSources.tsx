import { Link } from "react-router-dom";
import type { HearingExchange } from "@/types";

const KINDS = { transcript_entry: "Original transcript", document: "Document", previous_answer: "Earlier hearing answer", none: "General question" };

export function QuestionSources({ exchange, sessionId }: { exchange: HearingExchange; sessionId?: string }) {
  return <details className="mt-3 border border-line bg-paper-dim p-3 text-xs text-ink-soft">
    <summary className="cursor-pointer font-medium text-accent">Question sources</summary>
    <p className="mt-2">These are AI-supplied references matched against the records used for this question. A match does not verify the AI's interpretation.</p>
    {!exchange.provenanceAvailable ? <p className="mt-2">Source references were not recorded for this older question.</p> : !exchange.sourceReferences?.length ? <p className="mt-2">No specific record was cited for this question.</p> :
      <ul className="mt-3 space-y-3">{exchange.sourceReferences.map((ref, i) => <li key={i} className="border-t border-line pt-3">
        <p className="font-medium text-ink">{KINDS[ref.referenceType]}{ref.snapshot?.questionNumber ? ` · Q${ref.snapshot.questionNumber}` : ""}</p>
        <p className="mt-1">Basis: {ref.basis.replaceAll("_", " ")}</p>
        {ref.note && <p className="mt-1">AI source note: {ref.note}</p>}
        {!ref.resolved && ref.referenceType !== "none" && <p className="mt-1 text-brick">This reference could not be matched to a supplied record.</p>}
        {ref.snapshot && <div className="mt-2 space-y-2">
          {ref.snapshot.fileName && <p>{ref.snapshot.fileName}{ref.snapshot.page ? ` · page ${ref.snapshot.page}` : ""}{ref.snapshot.section ? ` · ${ref.snapshot.section}` : ""}</p>}
          {ref.snapshot.question && <p className="font-medium text-ink">{ref.snapshot.question}</p>}
          {(ref.snapshot.answer || ref.snapshot.applicantAnswer) && <p className="whitespace-pre-wrap">{ref.snapshot.answer ?? ref.snapshot.applicantAnswer}</p>}
          {ref.snapshot.name && <p>{ref.snapshot.name}{ref.snapshot.description ? ` — ${ref.snapshot.description}` : ""}</p>}
          <p className="text-ink-faint">Saved when this question was generated.</p>
          {ref.referenceType === "transcript_entry" && ref.snapshot.id && <Link className="inline-block text-accent hover:underline" to={`/transcript?entryId=${encodeURIComponent(ref.snapshot.id)}`}>Find in current transcript</Link>}
          {ref.referenceType === "previous_answer" && ref.snapshot.id && (sessionId ? <Link className="inline-block text-accent hover:underline" to={`/hearing?sessionId=${encodeURIComponent(sessionId)}#exchange-${encodeURIComponent(ref.snapshot.id)}`}>View hearing answer</Link> : <a className="inline-block text-accent hover:underline" href={`#exchange-${ref.snapshot.id}`}>View hearing answer</a>)}
        </div>}
      </li>)}</ul>}
  </details>;
}
