import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileText, Archive, Trash2, Eye } from "lucide-react";
import { documentsService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, Button, DataModeBanner, EmptyState, Badge } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatBytes, formatDate } from "@/lib/labels";
import { DOCUMENT_CATEGORY_LABELS } from "@/types";
import type { CaseDocument, DocumentCategory, DocumentStatus } from "@/types";
import { clsx } from "clsx";

const CATEGORIES = Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[];

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  uploaded: "neutral",
  processing: "slate",
  reviewed: "accent",
  flagged: "ochre",
  archived: "neutral",
};

export function DocumentsEvidence() {
  const { data, isMock, loading, error, reload } = useAsync(() => documentsService.list(), []);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<CaseDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null, category: DocumentCategory = "other") {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await documentsService.upload(file, category);
    }
    reload();
  }

  async function handleDelete(id: string) {
    await documentsService.remove(id);
    if (previewDoc?.id === id) setPreviewDoc(null);
    reload();
  }

  const filtered = (data ?? []).filter((doc) => activeCategory === "all" || doc.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Documents &amp; evidence</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Organize the material behind your case. Files stay here until you connect storage on the backend.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      <div
        onDragOver={(e: DragEvent) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: DragEvent) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
        className={clsx(
          "flex flex-col items-center justify-center gap-2 border border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-accent bg-accent-soft" : "border-line-strong bg-surface",
        )}
      >
        <UploadCloud className="h-6 w-6 text-ink-faint" aria-hidden />
        <p className="text-sm text-ink">Drag and drop files here, or</p>
        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Choose files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CategoryChip label="All documents" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={DOCUMENT_CATEGORY_LABELS[cat]} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel padded={false}>
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<FileText className="h-8 w-8" />}
                    title="No documents added yet."
                    description="Upload identity documents, BAMF correspondence, evidence, or country reports to keep everything in one place."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {filtered.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 p-4">
                      <FileText className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="truncate text-left text-sm font-medium text-ink hover:text-accent"
                        >
                          {doc.name}
                        </button>
                        <p className="text-xs text-ink-faint">
                          {DOCUMENT_CATEGORY_LABELS[doc.category]} · {formatDate(doc.uploadDate)} · {formatBytes(doc.sizeBytes)}
                        </p>
                      </div>
                      <Badge tone={STATUS_TONE[doc.status]}>{doc.status}</Badge>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-ink-faint hover:text-ink"
                        aria-label={`Preview ${doc.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-ink-faint hover:text-ink"
                        aria-label={`Archive ${doc.name}`}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="text-ink-faint hover:text-brick"
                        aria-label={`Delete ${doc.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div>
            <Panel>
              <PanelHeader title="Preview" />
              {previewDoc ? (
                <div>
                  <div className="flex aspect-[3/4] items-center justify-center border border-dashed border-line-strong bg-paper-dim">
                    <div className="text-center text-ink-faint">
                      <FileText className="mx-auto h-8 w-8" />
                      <p className="mt-2 text-xs">Preview rendering connects once the backend serves file content.</p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Row label="Name" value={previewDoc.name} />
                    <Row label="Category" value={DOCUMENT_CATEGORY_LABELS[previewDoc.category]} />
                    <Row label="Status" value={previewDoc.status} />
                    <Row label="Source" value={previewDoc.source ?? "Not specified"} />
                    <Row label="Description" value={previewDoc.description ?? "No description added yet."} />
                  </dl>
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Select a document to preview its details.</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-2">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
