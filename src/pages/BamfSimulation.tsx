import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldQuestion } from "lucide-react";
import { hearingService } from "@/services/api";
import { Panel, PanelHeader, Button, SimulationNotice } from "@/components/ui";
import type { BamfSessionConfig } from "@/types";
import { DEFAULT_BAMF_SESSION_CONFIG } from "@/types";
import { getSafeErrorMessage } from "@/lib/errors";
import { getPendingStartConfig } from "@/lib/pendingHearingStart";

const FOCUS_OPTIONS: { key: Exclude<keyof BamfSessionConfig, "questionLimit">; label: string; description: string }[] = [
  { key: "useEntireTranscript", label: "Use entire transcript", description: "Draw questions from your full uploaded interview transcript." },
  { key: "focusInconsistencies", label: "Focus on inconsistencies", description: "Prioritize passages that may conflict with each other." },
  { key: "focusChronology", label: "Focus on chronology", description: "Prioritize the order and timing of events." },
  { key: "focusCredibility", label: "Focus on credibility", description: "Prioritize questions that probe how believable an account reads." },
  { key: "focusCountrySituation", label: "Focus on country situation", description: "Prioritize questions tied to current conditions in your country of origin." },
  { key: "focusEvidenceGaps", label: "Focus on evidence gaps", description: "Prioritize points where supporting evidence is thin or missing." },
  { key: "fullExamination", label: "Full examination", description: "Cover all of the above in a longer session." },
];

export function BamfSimulation() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BamfSessionConfig>(() => getPendingStartConfig() ?? DEFAULT_BAMF_SESSION_CONFIG);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  function toggle(key: Exclude<keyof BamfSessionConfig, "questionLimit">) {
    setConfig((c) => ({ ...c, [key]: !c[key] }));
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      const result = await hearingService.start(config);
      navigate(`/hearing?sessionId=${encodeURIComponent(result.data.sessionId)}`);
    } catch (err) {
      setStartError(getSafeErrorMessage(err, "Could not start this session. Retry with the same settings."));
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Adversarial interview</h1>
        <p className="mt-1 text-sm text-ink-soft">
          This simulation is designed to challenge your account by asking difficult questions and
          identifying areas that may require clarification.
        </p>
      </div>

      <SimulationNotice tone="brick">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldQuestion className="h-4 w-4" /> BAMF simulation
        </span>
        <span className="mt-1 block">
          This is an AI role-play of an adversarial interviewer for practice purposes only. It is not a real
          BAMF official, and nothing said here is part of your actual case file.
        </span>
      </SimulationNotice>

      <Panel>
        <PanelHeader title="Session configuration" description="Choose what this session should emphasize. You can select more than one." />
        <label className="mb-4 block text-sm">Number of questions
          <select disabled={starting} className="ml-3 border p-2" value={config.questionLimit} onChange={e => setConfig(prev => ({ ...prev, questionLimit: Number(e.target.value) }))}>
            {[5, 10, 15, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FOCUS_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex cursor-pointer items-start gap-3 border border-line px-3.5 py-3 transition-colors hover:border-line-strong"
            >
              <input
                type="checkbox"
                disabled={starting}
                checked={config[option.key]}
                onChange={() => toggle(option.key)}
                className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-ink">{option.label}</span>
                <span className="block text-xs text-ink-soft">{option.description}</span>
              </span>
            </label>
          ))}
        </div>

        {startError && <p role="alert" className="mt-4 text-sm text-brick">{startError}</p>}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleStart} disabled={starting}>
            {starting ? "Starting…" : "Start session"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
