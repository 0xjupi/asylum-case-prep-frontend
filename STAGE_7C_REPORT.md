Stage 7C — Safe hearing retries and question source snapshots

Implemented

- Answer requests require the displayed exchangeId. The server writes an answer once,
  rejects changed replays, and treats identical replays as safe no-ops after advancement
  or completion. The final answer and completion timestamp commit together.
- A dedicated retry endpoint generates from the saved answer without resubmitting it.
  Session state exposes idle, generating, and retry_required states.
- Persistent database generation leases prevent overlapping requests from publishing
  duplicate questions. Leases expire after 180 seconds. Expired attempts cannot publish;
  completion during an AI call discards its late question.
- Start Idempotency-Key support returns the already-created session after a lost response.
  The frontend remembers pending request identities/settings across reloads. Configuration
  changes intentionally start a new request. Calls without keys are new starts.
- Anthropic calls use a 90-second network timeout with SDK retries disabled. Logs omit
  raw SDK exception details to avoid leaking case or request material.
- Question metadata now persists type, follow-up flag, source references, and immutable
  snapshots of matched transcript passages, document metadata, and earlier hearing answers.
  Resolution uses the exact AI context; missing or ambiguous references stay unmatched.
- The hearing UI shows saved-answer recovery and question sources, polls active generation,
  preserves unsaved drafts, and resets the draft for a different question. Current-transcript
  links use stable entry ids and warn when an older saved source has been replaced.
- Fixed configured-start navigation, which previously created a session without selecting
  it, and prevented stale async responses from overwriting a newer session load.

Upgrade

Update both backend and frontend together; old clients that omit exchangeId will receive
422. Existing WORKSPACE_ACCESS_KEY, AI, S3, and CORS settings remain valid. Back up an
existing database first. Startup adds nullable question metadata columns, a generation
claim table, and a unique hearing/session-question index without deleting existing records.
Legacy exchanges retain their answers and explicitly show that provenance was not recorded.
Older duplicate question numbers require review before startup can finish.

Validation

116 backend tests passed. Twelve frontend tests passed. Production frontend build passed.
Lint succeeded with three pre-existing warnings. Tests use synthetic case data and mocked
AI/S3. Concurrent API requests, lost responses, timeout/malformed output, lease takeover,
late-result fencing, transcript replacement, access checks, and legacy upgrades were tested.
Frontend interaction tests run in a simulated DOM; a full browser visual check was unavailable.
No real AI calls, AWS infrastructure changes, or deployment were performed. PostgreSQL was
not available for execution tests; concurrency tests ran against SQLite.

Limits and next stage

Retries in this release apply to BAMF hearing generation. Repeated Lawyer/Judge generation
still creates immutable analysis versions; broader cross-agent generation deduplication is
outside this release. A matched citation verifies identity, not the AI's interpretation.
Saved transcript passages are AI-structured text rather than raw scanned-page excerpts;
document citations preserve metadata, not extracted document contents.

Recommended next stage: connect Lawyer and Judge findings to hearing sources and build a
focused preparation-findings view, then evaluate the full workflow with anonymized cases.
