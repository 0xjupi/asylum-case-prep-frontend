import { useMemo, useRef, useState } from "react";
import { Search, Upload, FileText, MessageSquareText } from "lucide-react";
import { transcriptService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, Button, DataModeBanner, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import { clsx } from "clsx";
import type { TranscriptEntry } from "@/types";

export function InterviewTranscript() {
  const { data, isMock, loading, error, reload } = useAsync(() => transcriptService.get(), []);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | "all">("all");
  const [selected, setSelected] = useState<TranscriptEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
    setUploading(true);
    try {
      await transcriptService.upload(file);
      reload();
    } finally {
      setUploading(false);
    }
  }

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

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !data ? null : data.uploadStatus === "not_uploaded" ? (
        <Panel>
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No transcript uploaded yet."
            description="Upload a PDF or text copy of your BAMF interview transcript to get started. Text extraction and structuring happen on the backend once connected."
            actionLabel={uploading ? "Uploading…" : "Upload transcript"}
            onAction={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        </Panel>
      ) : data.uploadStatus === "processing" ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Processing {data.fileName} — this will update once the backend finishes extracting the transcript.
          </div>
        </Panel>
      ) : data.uploadStatus === "failed" ? (
        <Panel>
          <p className="text-sm text-brick">Something went wrong processing this transcript. Try uploading it again.</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => fileInputRef.current?.click()}>
            Re-upload transcript
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
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
              accept=".pdf,.doc,.docx,.txt"
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
                  {filteredEntries.length === 0 ? (
                    <li className="p-6 text-center text-sm text-ink-soft">No questions match your search.</li>
                  ) : (
                    filteredEntries.map((entry) => (
                      <li key={entry.questionNumber}>
                        <button
                          type="button"
                          onClick={() => setSelected(entry)}
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
