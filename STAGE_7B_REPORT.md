Stage 7B — Single-owner access and bounded hearing configuration

Implemented:
- Required random WORKSPACE_ACCESS_KEY; startup fails closed if missing or shorter than 32 characters.
- Bearer access checks on every data route; public health only; API docs disabled.
- Browser unlock/lock screen; secret held in tab memory, never localStorage or frontend environment.
- No-store API responses and basic security response headers.
- Validated questionLimit (1–50, default 10), immutable saved session configuration returned by API.
- First question now receives selected focus configuration; transcript inclusion setting is enforced.
- Final answer completes bounded hearings without an extra AI request. Older unlimited hearings remain manually completable.
- Demo hearing behavior matches bounded sessions.

Validation: 92 backend tests passed, including all-data-route access denial and limit completion;
frontend production build passed. Lint passed with three pre-existing warnings.
AI responses and S3 were mocked in tests; no live API, AWS, or deployment validation was performed.

Setup: see backend README and .env.example. Generate WORKSPACE_ACCESS_KEY locally, configure it
on the backend, and enter it in the frontend. Use HTTPS for remote access. Keep S3 Block Public
Access enabled and IAM scoped to your bucket. Existing bucket settings are not changed by this code.
Anthropic API billing is separate from a paid Claude chat subscription.

Next recommended stage: reliable AI retry and concurrency handling, then persisting and displaying
question-to-transcript source references. This release does not claim to solve concurrent answer
submission, AI generation retries, or complete cross-agent traceability.
