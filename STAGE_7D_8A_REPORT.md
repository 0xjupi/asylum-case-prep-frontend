Stages 7D and 8A — Cross-agent sources and preparation findings

Delivered

- Lawyer findings and Judge arguments preserve immutable source snapshots from their
  actual generation context: transcript passages, hearing answers, document metadata,
  and dated research records. Judge arguments also preserve the exact cited Lawyer item
  and its supporting records. Hearing snapshots retain the BAMF question sources.
- Judge evaluations record which Lawyer review id/version they used. Generating a new
  Lawyer review cannot rewrite the older Judge's source lineage.
- New authenticated, read-only preparation endpoint and page consolidate selected Lawyer
  findings, Judge arguments, and Judge clarification/issue lists within one hearing.
- Filters support source simulation, category, and text. Version selectors and a mismatch
  notice make comparisons explicit. A shortcut selects the Lawyer version used by the Judge.
- Lawyer/Judge source links open the exact session and version. Missing versions are shown
  as unavailable rather than silently replaced. Saved source details appear on both original
  analysis pages and in the preparation page. Research links permit HTTP(S) only.
- Legacy records retain their contents. Unrecorded lineage/source details remain unknown.
  Uncited narrative issues do not claim item-specific evidence.

Validation

125 backend tests and 19 frontend tests passed. The production frontend build passed;
lint completed with the same three existing warnings. Tests cover session isolation,
source preservation after transcript replacement, exact Lawyer/Judge lineage, version
mismatch handling, missing-version behavior, research provenance, legacy upgrades,
reference sanitization, preparation filters, and safe external links.

Tests use synthetic records and mocked AI/S3. Frontend tests use a simulated DOM.
No live AI, deployment, or real-browser visual check was performed in this release.
Database tests ran on SQLite; PostgreSQL execution was not tested here.

Upgrade

Back up an existing database and update both projects together. Startup adds nullable
lawyer_review_id and lawyer_review_version columns to judge_evaluation. Item snapshots
use existing JSON fields. No historical sources or lineage are invented for older data.
No additional environment variables are required. Existing WORKSPACE_ACCESS_KEY, API,
S3, and CORS settings continue to apply. Run npm ci, npm test, and npm run build for the
frontend, and python -m pytest for the backend.

Scope

Preparation findings are a read-only review of existing simulation output. There is no
new AI summary, legal outcome score, or assertion that an issue has been resolved.
Document references preserve metadata rather than extracted file contents. A matched
record establishes identity, not the truth of a statement or the correctness of an AI
interpretation. Lawyer/Judge generation still produces explicit immutable versions;
this release does not extend BAMF's retry leases to those generation endpoints.

Recommended next step

Run the full workflow with an anonymized transcript, assess the quality and completeness
of the generated findings, and then prepare deployment configuration. Personal review
notes/checklists can follow if useful after that trial.
