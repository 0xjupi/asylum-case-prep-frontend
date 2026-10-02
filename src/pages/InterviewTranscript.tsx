import { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileText, MessageSquareText, AlertTriangle } from "lucide-react";
import { transcriptService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, Button, DataModeBanner, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import { ALLOWED_FILE_ACCEPT, MAX_TRANSCRIPT_SIZE_BYTES, validateFile } from "@/lib/uploadConstraints";
import { clsx } from "clsx";
import { useSearchParams } from "react-router-dom";
import type { TranscriptEntry } from "@/types";

export function InterviewTranscript() {
  const [params, setParams] = useSearchParams();
  const entryId = params.get("entryId");
  const { data, isMock, loading, error, reload } = useAsync(() => transcriptService.get(), []);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | "all">("all");
  const [chosen, setSelected] = useState<TranscriptEntry | null>(null);
  const selected = entryId ? data?.entries.find(e => e.id === entryId) ?? null : chosen;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // "uploading": request in flight. "polling": upload done, waiting for
  // processing to finish. "timedOut": polling gave up after ~5 minutes.
  const [phase, setPhase] = useState<"idle" | "uploading" | "polling" | "timedOut">("idle");
  const abortRef = useRef<AbortController | null>(null);
  const missingReference = entryId && data?.uploadStatus === "ready" && !data.entries.some(e => e.id === entryId);


  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    return data.entries.filter((entry) => {
      const matchesSection = activeSection === "all" || entry.section === activeSection;
      const matchesQuery =
        query.trim() === "" ||
        entry.question.toLowerCase().includes(query.toLowerCase()) ||
        entry.answer.toLowerCase().includes(query.toLowerCase());
      return matchesSection && matchesQuery;
    });
  }, [data, activeSection, query]);

  async function handleFileSelected(file: File) {
    setUploadError(null);

    const validation = validateFile(file, MAX_TRANSCRIPT_SIZE_BYTES);
    if (!validation.valid) {
      setUploadError(validation.error ?? "This file can't be uploaded.");
      return;
    }

    setPhase("uploading");
    try {
      await transcriptService.upload(file);
      reload();

      setPhase("polling");
      const controller = new AbortController();
      abortRef.current = controller;
      const settled = await transcriptService.pollUntilSettled({ signal: controller.signal });
      setPhase(settled.data.uploadStatus === "processing" ? "timedOut" : "idle");
      reload();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setUploadError(err instanceof Error ? err.message : "Something went wrong uploading this file.");
      setPhase("idle");
    }
  }

  const isBusy = phase === "uploading" || phase === "polling";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Interview transcript</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Upload your BAMF interview transcript to search it, reference it during practice sessions, and
          later see AI-generated observations linked to specific passages.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />
      {missingReference && <p className="border border-line p-3 text-sm text-ink-soft">This saved passage is not in the current transcript. Its saved text is available in the hearing's question sources.</p>}

      {uploadError && (
        <div className="flex items-start gap-2.5 border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !data ? null : data.uploadStatus === "not_uploaded" && !isBusy ? (
        <Panel>
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No transcript uploaded yet."
            description="Upload a PDF, DOCX, or TXT copy of your BAMF interview transcript to get started (up to 50 MB). Structuring it into questions and answers happens in a later stage."
            actionLabel="Upload transcript"
            onAction={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        </Panel>
      ) : isBusy ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            {phase === "uploading" ? "Uploading…" : `Processing ${data.fileName ?? "your transcript"}…`}
          </div>
        </Panel>
      ) : phase === "timedOut" ? (
        <Panel>
          <p className="text-sm text-ink">
            This is taking longer than expected. It's still processing in the background — check back in a
            few minutes, or refresh this page.
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={reload}>
            Check again
          </Button>
        </Panel>
      ) : data.uploadStatus === "failed" ? (
        <Panel>
          <p className="text-sm text-brick">
            {data.processingError ?? "Something went wrong processing this transcript. Try uploading it again."}
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => fileInputRef.current?.click()}>
            Re-upload transcript
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        </Panel>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-ink">
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-medium">{data.fileName}</span>
              <span className="text-ink-faint">
                · {data.pageCount ?? "—"} pages · uploaded {formatDate(data.uploadedAt)}
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Replace transcript
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_FILE_ACCEPT}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel padded={false}>
                <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search questions and answers"
                      className="w-full border border-line-strong bg-surface py-1.5 pl-8 pr-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <SectionChip label="All sections" active={activeSection === "all"} onClick={() => setActiveSection("all")} />
                    {data.sections.map((section) => (
                      <SectionChip key={section} label={section} active={activeSection === section} onClick={() => setActiveSection(section)} />
                    ))}
                  </div>
                </div>

                <ul className="max-h-[32rem] divide-y divide-line overflow-y-auto scrollbar-thin">
                  {data.entries.length === 0 ? (
                    <li className="p-6 text-center text-sm text-ink-soft">
                      This transcript hasn't been structured into questions and answers yet.
                    </li>
                  ) : filteredEntries.length === 0 ? (
                    <li className="p-6 text-center text-sm text-ink-soft">No questions match your search.</li>
                  ) : (
                    filteredEntries.map((entry) => (
                      <li key={entry.questionNumber}>
                        <button
                          type="button"
                          onClick={() => { setSelected(entry); if (entryId) { const next = new URLSearchParams(params); next.delete("entryId"); setParams(next); } }}
                          className={clsx(
                            "w-full px-4 py-3 text-left transition-colors",
                            selected?.questionNumber === entry.questionNumber ? "bg-accent-soft" : "hover:bg-paper-dim",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-ink-faint">
                              Question {entry.questionNumber} · page {entry.page ?? "—"} · {entry.section ?? "Unsectioned"}
                            </span>
                            {entry.hasAnnotation && (
                              <Badge tone="accent">
                                <MessageSquareText className="h-3 w-3" /> Annotated
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-ink">{entry.question}</p>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </Panel>
            </div>

            <div>
              <Panel>
                {selected ? (
                  <div>
                    <p className="text-xs text-ink-faint">Question {selected.questionNumber} · {selected.section ?? "Unsectioned"}</p>
                    <p className="mt-2 font-display text-sm font-semibold text-ink">{selected.question}</p>
                    <p className="mt-3 text-sm text-ink-soft">{selected.answer}</p>

                    <div className="mt-5 border-t border-line pt-4">
                      <p className="text-sm font-medium text-ink">Analysis annotations</p>
                      {data.annotations.filter((a) => a.questionNumber === selected.questionNumber).length === 0 ? (
                        <p className="mt-1.5 text-sm text-ink-soft">No annotations yet for this passage.</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {data.annotations
                            .filter((a) => a.questionNumber === selected.questionNumber)
                            .map((a) => (
                              <li key={a.id} className="border border-line bg-paper-dim p-2.5 text-xs text-ink-soft">
                                {a.note}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink-soft">Select a question from the list to view its full text and any annotations.</p>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border px-2.5 py-1 text-xs transition-colors",
        active ? "border-accent bg-accent-soft text-accent-dim" : "border-line-strong text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
