# Deploy the authenticated frontend

This package includes the Stage 7D/8A frontend, the workspace unlock screen,
authenticated API requests, and Netlify build/routing configuration.

On 2026-10-02, the live frontend opened directly into the dashboard and showed
HTTP 401 on the transcript page. It did not expose the unlock screen or the
Preparation navigation item present in this package. Update the source repository
connected to Netlify and verify the resulting production deployment.

1. Extract this ZIP on your computer.
2. Copy its contents into the existing frontend Git repository, replacing matching
   project files. Keep that repository's `.git` directory and local `.env` files.
3. From the directory containing `package.json`, run `npm ci`, `npm test`, and
   `npm run build`.
4. Review `git status`, commit the updated frontend files, and push to the branch
   Netlify deploys (normally `main`).
5. Keep the production-build environment variable
   `VITE_API_BASE_URL=https://asy-prep.duckdns.org` in Netlify.
6. Confirm the published deployment uses your new commit. The build command is
   `npm run build`, the publish directory is `dist`, and the base directory is
   empty when `package.json` is at the repository root.
7. Open the site in a fresh browser tab. It must show "Unlock your workspace"
   before displaying case pages. Enter the backend's `WORKSPACE_ACCESS_KEY`.
8. Open Interview transcript and Preparation. A subsequent rejected key should
   return the application to its unlock screen.

Only the public API address belongs in Netlify. The workspace key is entered at
runtime and remains in tab memory; the Anthropic key stays on the backend.

Validation for this deployment update: three authentication integration tests
passed against the real App/transcript route with simulated API responses. A
production build with the configured public API address also passed. Publishing
to your GitHub/Netlify accounts and the live authenticated check remain user steps.
