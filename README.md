# Case Preparation Workspace — frontend

A private, single-user frontend for preparing an asylum case: reviewing your
BAMF interview transcript, organizing documents and evidence, and practicing
with three clearly-labelled AI simulations (BAMF, Lawyer, Judge). This repo
is the frontend only — no backend, database, auth, or cloud infrastructure
is included or assumed beyond what's noted below.

Nothing in this app is a real government official, a real lawyer, or a real
judicial decision. Every simulated participant is labelled as a simulation
wherever it appears.

## Stack

- Vite + React 19 + TypeScript
- React Router v7 for navigation
- Tailwind CSS v4 (via `@tailwindcss/vite`) — design tokens live in `src/index.css`
- `lucide-react` for icons

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
```

No environment variables are required to run the app locally — it works
fully on mock data out of the box.

## Connecting your FastAPI backend

Every domain service in `src/services/api/` checks `VITE_API_BASE_URL`
(see `.env.example`). Unset, it calls its mock implementation in
`src/services/mock/`. Set, it calls `fetch` against your backend instead —
no other code changes are needed.

```
VITE_API_BASE_URL=https://api.your-domain.com
```

Set the same variable in your Netlify site's environment settings before
redeploying there.

### Expected backend contract

| Service | Method | Path | Notes |
|---|---|---|---|
| `caseService` | GET | `/api/case` | Returns `CaseSummary` |
| | GET | `/api/case/status` | Returns `CaseStatusSnapshot` (dashboard) |
| | PATCH | `/api/case` | Partial `CaseSummary` update |
| `transcriptService` | GET | `/api/transcript` | Returns `TranscriptDocument` (includes `processingError`) |
| | GET | `/api/transcript/status` | Lightweight `TranscriptStatus`, polled every 3s (see `src/lib/transcriptPolling.ts`) until `ready`/`failed`, or ~5 min timeout |
| | POST | `/api/transcript/upload` | `multipart/form-data` (`file`), max 50MB — PDF/DOCX/TXT/JPG/JPEG/PNG only |
| `documentsService` | GET | `/api/documents` | Returns `CaseDocument[]` |
| | POST | `/api/documents/upload` | `multipart/form-data` (`file`, `category`), max 25MB — same file types as above |
| | DELETE | `/api/documents/{id}` | 204 on success |
| `hearingService` | GET | `/api/hearing` | Returns `HearingSessionState` |
| | POST | `/api/hearing/start` | Body: `BamfSessionConfig` |
| | POST | `/api/hearing/{sessionId}/answer` | Body: `{ exchangeId: string, answer: string }`. Saved answers are immutable; exact replays are safe. |
| | POST | `/api/hearing/{sessionId}/retry` | Body: `{ exchangeId: string }`. Generate from an already-saved answer. |
| `lawyerService` | GET | `/api/lawyer/review?sessionId=` | Returns latest `LawyerReview` for that session. 404 = no review generated yet (not an error) |
| | GET | `/api/lawyer/review/history?sessionId=` | All versions for that session, newest first |
| `judgeService` | GET | `/api/judge/evaluation?sessionId=` | Same session-scoping and 404 convention as lawyer review |
| | GET | `/api/judge/evaluation/history?sessionId=` | All versions for that session, newest first |
| `countryService` | GET | `/api/country/{countryName}` | Returns `CountryProfile` |
| `legalService` | GET | `/api/legal/sources` | Returns `LegalSource[]` |
| `sessionsService` | GET | `/api/sessions` | Returns `SessionSummary[]` |
| `settingsService` | GET / PATCH | `/api/settings` | Returns `AppSettings` |

Full TypeScript shapes for every type referenced above are in `src/types/`.
A matching FastAPI/Pydantic/SQLAlchemy implementation of this exact
contract lives in the sibling `asylum-case-prep-backend` project.

**Lawyer and Judge are session-scoped, not global.** As of Stage 2, every
`LawyerReview`/`JudgeEvaluation` belongs to a specific hearing session
(`Case → Hearing Session → Lawyer Review` / `→ Judge Evaluation`) and
carries its own `id`, `sessionId`, and `version` — regenerating never
overwrites a previous version. The Lawyer Review and Judge Evaluation
pages resolve "the current session" via `useCurrentHearingSession()`
before fetching, and show a "start a mock hearing first" state if none
exists yet.

The frontend never calls the Anthropic API or reads any Anthropic/AWS
credentials. All AI orchestration is expected to live behind your FastAPI
backend.

## Project structure

```
src/
  types/          Typed models shared by services, mocks, and pages
  services/
    api/          Thin fetch wrapper + one service per domain (real + mock switch)
    mock/         Mock data. Case/claim/transcript/analysis content defaults to
                   genuinely empty — nothing is invented. A "Preview mode" toggle
                   (Settings, or the pill in the top bar) swaps in small, clearly
                   labelled sample entries for layout QA only.
  context/        DataModeContext (the Preview mode toggle)
  components/
    layout/       AppShell, Sidebar, TopBar
    ui/           Panel, Button, Badge, EmptyState, Skeleton, SimulationNotice, etc.
  pages/          One file per top-level route
  hooks/          useAsync (loading/error/data pattern) and
                   useCurrentHearingSession (resolves "the current session" for
                   the session-scoped Lawyer Review / Judge Evaluation pages)
  lib/            Formatting + label helpers, uploadConstraints.ts (size/type
                   validation shared by transcript + document uploads),
                   transcriptPolling.ts (poll interval/timeout constants)
  router/         Nav structure (src/router/routes.ts)
```

## What's mocked right now

- **Case, claim, transcript content, lawyer/judge analysis, country
  information, legal sources:** empty by default — no invented case facts,
  per the project's "do not infer or invent" requirement. Structure is real;
  content is not.
- **Dashboard counts, session history:** zero/empty by default for the same
  reason, so figures never imply a real case exists before one does.
- **Preview mode** (off by default): shows small, obviously-placeholder
  entries ("Sample question — placeholder for layout preview") so you can
  see populated layouts while wiring up the backend, without any of it
  resembling a real persecution narrative.
- **Uploads:** transcript and document uploads validate type/size
  client-side (`src/lib/uploadConstraints.ts`, mirroring the backend's
  limits), then accept a real file and echo back a mock record — no file
  is persisted anywhere in mock mode. In mock mode, transcript upload also
  simulates the real backend's async processing → ready transition after a
  few seconds, so the polling UI has something real to show even without a
  backend connected.
- **Lawyer/Judge in mock mode:** return `null` (not an empty object) when
  there's nothing generated for a session yet, matching the real backend's
  404-means-nothing-yet convention.

## Stage 2 status (backend integration)

All six open questions from the end of Stage 1 have been resolved and
implemented — see the sibling `asylum-case-prep-backend` project's README
for the full backend-side report. In short: single-user/no-auth for now,
the TypeScript shapes above are implemented 1:1 in Pydantic (camelCase
JSON via an alias generator), transcript processing uses polling
(`GET /api/transcript/status` every 3s, ~5 min timeout), Lawyer/Judge are
scoped to a specific hearing session, upload limits are 50MB
(transcript) / 25MB (documents) with PDF/DOCX/TXT/JPG/JPEG/PNG allowed,
and `VITE_API_BASE_URL` + CORS remain your deployment-time configuration —
nothing is hard-coded.

## Implemented workflow

Transcript structuring, BAMF questioning, explicit hearing completion, Lawyer
review, Judge evaluation, and dated research references are implemented in the
backend. AI features require an Anthropic API key; they never run in the browser.

## Workspace access

With VITE_API_BASE_URL configured, unlock using the backend WORKSPACE_ACCESS_KEY.
Never put this key in frontend environment variables. It is held only in memory;
reload or use Lock workspace to clear it. Demo mode contains sample data and needs no key.

## Stage 7C: recovery and question sources

Update both projects together. Hearing answer requests include the displayed
exchange id, and a failed next-question call offers Retry next question after
refreshing the saved state. Drafts that were not saved remain in the form.
While another generation is running, the page checks state automatically.
Pending start requests retain their identity and configuration across tab reloads.
The configured start page opens the exact session returned by the backend.

Question sources displays immutable saved passages and flags unmatched citations.
A link to the current transcript uses its entry id and warns if the source has
been replaced, rather than substituting a new passage with the same Q number.
Legacy questions show that source references were not recorded.

Validation:

```bash
npm ci
npm test
npm run build
npm run lint
```

Nineteen frontend tests cover request identities, saved-answer recovery, draft
preservation, exact-session navigation, source display, and stale async results.
Lint has three existing warnings in DataModeContext, CountryInformation, and Settings.

## Stages 7D and 8A: supporting records and preparation findings

Open Preparation findings from a hearing, its Lawyer/Judge page, or Previous Sessions.
The sidebar entry asks you to select a session. This view requires a connected backend;
other sample-data pages continue to work without one.

The page groups the selected analysis versions' existing findings, with filters for
origin, category, and text. A mismatch notice identifies when the Judge used an older
Lawyer version and lets you select that exact version. Nothing is generated by opening
the page. Generation remains on the existing Lawyer/Judge pages.

Supporting records expands saved passages, evidence metadata, research dates/links,
and the Judge-to-Lawyer-to-hearing source chain. Only HTTP(S) research links are rendered.
Lawyer/Judge pages support `?sessionId=...&version=...` and exact finding anchors. Missing
versions never silently show the latest analysis. Legacy and uncited narrative findings
explicitly say that saved item-level source details are unavailable.
