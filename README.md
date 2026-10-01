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
| `transcriptService` | GET | `/api/transcript` | Returns `TranscriptDocument` |
| | POST | `/api/transcript/upload` | `multipart/form-data`, returns `TranscriptDocument` |
| `documentsService` | GET | `/api/documents` | Returns `CaseDocument[]` |
| | POST | `/api/documents/upload` | `multipart/form-data` (`file`, `category`) |
| | DELETE | `/api/documents/{id}` | 204 on success |
| `hearingService` | GET | `/api/hearing` | Returns `HearingSessionState` |
| | POST | `/api/hearing/start` | Body: `BamfSessionConfig` |
| | POST | `/api/hearing/{sessionId}/answer` | Body: `{ answer: string }` |
| `lawyerService` | GET | `/api/lawyer/review` | Returns `LawyerReview` |
| `judgeService` | GET | `/api/judge/evaluation` | Returns `JudgeEvaluation` |
| `countryService` | GET | `/api/country/{countryName}` | Returns `CountryProfile` |
| `legalService` | GET | `/api/legal/sources` | Returns `LegalSource[]` |
| `sessionsService` | GET | `/api/sessions` | Returns `SessionSummary[]` |
| `settingsService` | GET / PATCH | `/api/settings` | Returns `AppSettings` |

Full TypeScript shapes for every type referenced above are in `src/types/`.
None of these endpoints are assumed to exist yet — the frontend degrades to
mock data automatically if a call fails to reach a configured backend.

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
  hooks/          useAsync — the loading/error/data pattern every page uses
  lib/            Formatting + label helpers
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
- **Uploads:** transcript and document uploads accept a real file and echo
  back a mock record; no file is persisted anywhere (no S3 wiring yet).

## What I still need from you before backend integration

1. **Auth model** — is this single-user/local, or will you add real
   accounts? Determines whether `settingsService` and friends need a user
   ID/session token attached.
2. **Final field-level contract** — confirm the TypeScript shapes in
   `src/types/` match what your FastAPI Pydantic models will actually
   return (especially `CaseSummary`, `TranscriptDocument`, and
   `HearingSessionState`, which are the most complex).
3. **Transcript upload behavior** — should the frontend poll
   `GET /api/transcript` after upload until `uploadStatus` becomes `ready`,
   or will you push updates another way (WebSocket, SSE)? Currently it just
   re-fetches once.
4. **Hearing session lifecycle** — does one `hearingService.start()` call
   cover a whole session (BAMF then lawyer then judge), or are these three
   independent sessions? The current UI treats the three tabs as views into
   one shared session state; say if that's wrong.
5. **File size/type limits** for document and transcript uploads, so the
   frontend can validate before hitting your backend.
6. **Your actual `VITE_API_BASE_URL`** once the backend is deployed, plus
   CORS configuration on the FastAPI side to allow requests from your
   Netlify domain.
