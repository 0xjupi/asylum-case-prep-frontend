import { useState, useEffect, type ReactNode } from "react";
import { FlaskConical, ShieldCheck } from "lucide-react";
import { settingsService } from "@/services/api";
import { useDataMode } from "@/context/DataModeContext";
import { Panel, PanelHeader, Button } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import type { AppSettings } from "@/types";
import { clsx } from "clsx";

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const { mode, toggle } = useDataMode();

  useEffect(() => {
    settingsService.get().then(setSettings);
  }, []);

  async function handleUpdate(partial: Partial<AppSettings>) {
    setSaving(true);
    try {
      const updated = await settingsService.update(partial);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Preferences for this workspace. No account or sign-in system is set up yet.</p>
      </div>

      {!settings ? (
        <SkeletonPanel />
      ) : (
        <div className="space-y-5">
          <Panel>
            <PanelHeader title="Case preferences" />
            <div className="space-y-4">
              <Field label="Case display name">
                <input
                  type="text"
                  value={settings.casePreferences.caseDisplayName ?? ""}
                  placeholder="Not set"
                  onChange={(e) => handleUpdate({ casePreferences: { ...settings.casePreferences, caseDisplayName: e.target.value || null } })}
                  className="w-full max-w-sm border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                />
              </Field>
              <Field label="Default country focus">
                <input
                  type="text"
                  value={settings.casePreferences.defaultCountryFocus ?? ""}
                  onChange={(e) => handleUpdate({ casePreferences: { ...settings.casePreferences, defaultCountryFocus: e.target.value || null } })}
                  className="w-full max-w-sm border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                />
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="AI behavior preferences" />
            <div className="space-y-4">
              <ToggleRow
                label="Show observations during hearing"
                description="Display concise, backend-generated observations in the mock hearing sidebar."
                checked={settings.aiBehaviorPreferences.showObservationsDuringHearing}
                onChange={(v) => handleUpdate({ aiBehaviorPreferences: { ...settings.aiBehaviorPreferences, showObservationsDuringHearing: v } })}
              />
              <ToggleRow
                label="Automatically detect issues"
                description="Let the backend flag potential inconsistencies as you go."
                checked={settings.aiBehaviorPreferences.autoDetectIssues}
                onChange={(v) => handleUpdate({ aiBehaviorPreferences: { ...settings.aiBehaviorPreferences, autoDetectIssues: v } })}
              />
              <Field label="BAMF simulation difficulty">
                <select
                  value={settings.aiBehaviorPreferences.bamfDifficulty}
                  onChange={(e) =>
                    handleUpdate({ aiBehaviorPreferences: { ...settings.aiBehaviorPreferences, bamfDifficulty: e.target.value as "standard" | "rigorous" } })
                  }
                  className="w-full max-w-sm border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="standard">Standard</option>
                  <option value="rigorous">Rigorous</option>
                </select>
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Interface preferences" />
            <div className="space-y-4">
              <Field label="Text size">
                <select
                  value={settings.interfacePreferences.fontSize}
                  onChange={(e) => handleUpdate({ interfacePreferences: { ...settings.interfacePreferences, fontSize: e.target.value as "standard" | "large" } })}
                  className="w-full max-w-sm border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                </select>
              </Field>
              <Field label="Transcript density">
                <select
                  value={settings.interfacePreferences.transcriptDensity}
                  onChange={(e) => handleUpdate({ interfacePreferences: { ...settings.interfacePreferences, transcriptDensity: e.target.value as "comfortable" | "compact" } })}
                  className="w-full max-w-sm border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </Field>

              <div className="flex items-start justify-between gap-4 border-t border-line pt-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    <FlaskConical className="h-4 w-4" /> Preview mode
                  </p>
                  <p className="mt-0.5 max-w-md text-xs text-ink-soft">
                    Shows small, clearly-labelled sample entries in empty sections so you can preview populated
                    layouts while building. Never affects real case data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  className={clsx(
                    "shrink-0 border px-3 py-1.5 text-xs font-medium transition-colors",
                    mode === "sample" ? "border-ochre/30 bg-ochre-soft text-ochre" : "border-line-strong text-ink-soft",
                  )}
                >
                  {mode === "sample" ? "On" : "Off"}
                </button>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Data & privacy" />
            <div className="flex items-start gap-2.5 text-sm text-ink-soft">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                This is a private preparation tool. It is not affiliated with BAMF, any German court, or the
                German government. Your data is not submitted to any official body from this interface.
                Storage, retention, and account infrastructure will be described here once the backend is connected.
              </p>
            </div>
          </Panel>

          {saving && <p className="text-xs text-ink-faint">Saving…</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-ink">{label}</p>
        <p className="text-xs text-ink-soft">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-5 w-9 shrink-0 border transition-colors", checked ? "border-accent bg-accent" : "border-line-strong bg-paper-dim")}
      >
        <span className={clsx("absolute top-0.5 h-3.5 w-3.5 bg-surface transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
